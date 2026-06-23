import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { HealthController } from './health/health.controller';

import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { MessagesModule } from './modules/messages/messages.module';
import { KnowledgeBaseModule } from './modules/knowledge-base/knowledge-base.module';
import { FaqModule } from './modules/faq/faq.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { AgentsModule } from './modules/agents/agents.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BillingModule } from './modules/billing/billing.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { FilesModule } from './modules/files/files.module';

import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST', 'localhost');
        const port = Number(config.get<string>('REDIS_PORT', '6379'));
        const password = config.get<string>('REDIS_PASSWORD');
        return {
          connection: {
            host,
            port,
            password: password || undefined,
            maxRetriesPerRequest: null,
          },
        };
      },
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: Number(config.get<string>('THROTTLE_TTL_MS', '60000')),
          limit: Number(config.get<string>('THROTTLE_LIMIT', '120')),
        },
      ],
    }),

    PrismaModule,
    RedisModule,

    AuthModule,
    OrganizationsModule,
    UsersModule,
    CustomersModule,
    ConversationsModule,
    MessagesModule,
    KnowledgeBaseModule,
    FaqModule,
    TicketsModule,
    AgentsModule,
    WhatsappModule,
    AnalyticsModule,
    BillingModule,
    NotificationsModule,
    AuditModule,
    ChatbotModule,
    FilesModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}