import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
const prisma = new PrismaClient();
async function main() { const data = JSON.parse(fs.readFileSync('public/site-data.json', 'utf8')); await prisma.siteData.upsert({ where: { id: 1 }, create: { id: 1, data }, update: {} }); }
main().finally(() => prisma.$disconnect());
