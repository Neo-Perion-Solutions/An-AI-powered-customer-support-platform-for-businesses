import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
import { paginationParams, paginatedResponse } from '../../common/utils/tenant.util';
import { CreateCheckoutDto } from './dto/billing.dto';
import { PlanTier, SubscriptionStatus, InvoiceStatus } from '@prisma/client';

const PLAN_PRICES: Record<PlanTier, { monthly: number; name: string; features: string[] }> = {
  [PlanTier.FREE]: { monthly: 0, name: 'Free', features: ['100 conversations/mo', '1 agent', 'Community support'] },
  [PlanTier.STARTER]: { monthly: 49, name: 'Starter', features: ['2,000 conversations/mo', '3 agents', 'Knowledge base', 'Email support'] },
  [PlanTier.PRO]: { monthly: 199, name: 'Pro', features: ['10,000 conversations/mo', '10 agents', 'WhatsApp', 'Analytics', 'Priority support'] },
  [PlanTier.ENTERPRISE]: { monthly: 999, name: 'Enterprise', features: ['Unlimited conversations', 'Unlimited agents', 'SLA', 'Dedicated CSM', 'SSO'] },
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe | null = null;
  private readonly stripeEnabled: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    if (key) {
      this.stripe = new Stripe(key, { apiVersion: '2024-06-20' as Stripe.LatestApiVersion });
      this.stripeEnabled = true;
    } else {
      this.stripeEnabled = false;
    }
  }

  getPlans() {
    return Object.entries(PLAN_PRICES).map(([key, value]) => ({
      tier: key,
      ...value,
    }));
  }

  async getSubscription(organizationId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
    if (!sub) {
      return {
        plan: PlanTier.FREE,
        status: SubscriptionStatus.TRIALING,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
      };
    }
    return sub;
  }

  async createCheckout(organizationId: string, dto: CreateCheckoutDto) {
    if (!this.stripeEnabled) {
      // Mock: create subscription directly
      const sub = await this.upsertSubscription(organizationId, dto.plan, 'mock-cs-' + Date.now());
      return { url: dto.successUrl ?? 'https://app.example.com/billing/success', subscription: sub, mocked: true };
    }

    const priceMap: Record<PlanTier, string | undefined> = {
      [PlanTier.FREE]: this.config.get<string>('STRIPE_PRICE_FREE'),
      [PlanTier.STARTER]: this.config.get<string>('STRIPE_PRICE_STARTER'),
      [PlanTier.PRO]: this.config.get<string>('STRIPE_PRICE_PRO'),
      [PlanTier.ENTERPRISE]: this.config.get<string>('STRIPE_PRICE_ENTERPRISE'),
    };
    const priceId = priceMap[dto.plan];
    if (!priceId) throw new NotFoundException(`No Stripe price configured for ${dto.plan}`);

    if (!this.stripe) throw new Error('Stripe is not configured');
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: dto.successUrl ?? 'https://app.example.com/billing/success',
      cancel_url: dto.cancelUrl ?? 'https://app.example.com/billing/cancel',
      client_reference_id: organizationId,
      metadata: { organizationId, plan: dto.plan },
    });
    return { url: session.url, sessionId: session.id, mocked: false };
  }

  async handleWebhook(rawBody: string, signature: string | undefined): Promise<{ received: boolean }> {
    if (!this.stripeEnabled || !this.stripe) {
      this.logger.warn('Stripe webhook called but Stripe is not configured');
      return { received: true };
    }
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret || !signature) {
      this.logger.warn('Missing webhook secret or signature');
      return { received: true };
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      this.logger.error(`Invalid Stripe webhook signature: ${(err as Error).message}`);
      throw new Error('Invalid signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.client_reference_id;
        const plan = (session.metadata?.['plan'] as PlanTier | undefined) ?? PlanTier.PRO;
        if (orgId) {
          await this.upsertSubscription(orgId, plan, typeof session.subscription === 'string' ? session.subscription : null);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = (sub.metadata?.['organizationId'] as string | undefined) ?? null;
        if (orgId) {
          await this.prisma.subscription.updateMany({
            where: { organizationId: orgId, stripeId: sub.id },
            data: {
              status: this.mapStatus(sub.status),
              cancelAtPeriodEnd: sub.cancel_at_period_end,
              currentPeriodStart: new Date(sub.current_period_start * 1000),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
          });
        }
        break;
      }
      case 'invoice.paid': {
        const inv = event.data.object as Stripe.Invoice;
        await this.handleInvoicePaid(inv);
        break;
      }
      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice;
        await this.handleInvoicePaid(inv, true);
        break;
      }
    }
    return { received: true };
  }

  async listInvoices(organizationId: string, page?: number, pageSize?: number) {
    const { skip, take, page: p, pageSize: ps } = paginationParams(page, pageSize);
    const where = { organizationId };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.invoice.count({ where }),
    ]);
    return paginatedResponse(items, total, p, ps);
  }

  private async handleInvoicePaid(inv: Stripe.Invoice, failed = false): Promise<void> {
    const customerId = typeof inv.customer === 'string' ? inv.customer : inv.customer?.id;
    if (!customerId) return;
    // find sub via stripeId
    const sub = await this.prisma.subscription.findFirst({ where: { stripeId: customerId } });
    if (!sub) return;
    await this.prisma.invoice.upsert({
      where: { stripeId: inv.id ?? `local-${inv.number}` },
      update: {
        status: failed ? InvoiceStatus.OPEN : InvoiceStatus.PAID,
        amountPaid: inv.amount_paid ?? 0,
        paidAt: failed ? null : new Date(),
      },
      create: {
        organizationId: sub.organizationId,
        subscriptionId: sub.id,
        stripeId: inv.id ?? `local-${inv.number}`,
        number: inv.number ?? `INV-${Date.now()}`,
        status: failed ? InvoiceStatus.OPEN : InvoiceStatus.PAID,
        amountDue: inv.amount_due ?? 0,
        amountPaid: inv.amount_paid ?? 0,
        currency: inv.currency ?? 'usd',
        paidAt: failed ? null : new Date(),
        issuedAt: inv.created ? new Date(inv.created * 1000) : new Date(),
      },
    });
  }

  private async upsertSubscription(organizationId: string, plan: PlanTier, stripeId: string | null) {
    const now = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    const existing = await this.prisma.subscription.findFirst({ where: { organizationId } });
    if (existing) {
      return this.prisma.subscription.update({
        where: { id: existing.id },
        data: { plan, stripeId, currentPeriodStart: now, currentPeriodEnd: end, status: SubscriptionStatus.ACTIVE },
      });
    }
    return this.prisma.subscription.create({
      data: {
        organizationId,
        plan,
        stripeId,
        currentPeriodStart: now,
        currentPeriodEnd: end,
        status: SubscriptionStatus.ACTIVE,
      },
    });
  }

  private mapStatus(s: Stripe.Subscription.Status): SubscriptionStatus {
    switch (s) {
      case 'trialing': return SubscriptionStatus.TRIALING;
      case 'active': return SubscriptionStatus.ACTIVE;
      case 'past_due': return SubscriptionStatus.PAST_DUE;
      case 'canceled': return SubscriptionStatus.CANCELED;
      case 'unpaid': return SubscriptionStatus.UNPAID;
      default: return SubscriptionStatus.ACTIVE;
    }
  }
}