import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() { console.log('Seeding...'); const org = await prisma.organization.create({ data: { name: 'Acme Healthcare', slug: 'acme-demo', plan: 'PRO' } }); console.log('Created org:', org.id); }
main().catch(console.error).finally(() => prisma.$disconnect());
