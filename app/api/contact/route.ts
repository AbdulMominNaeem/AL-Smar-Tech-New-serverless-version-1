import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
export const runtime = 'nodejs';
const contactSchema = z.object({ name: z.string().trim().min(1).max(120), email: z.string().email().max(254), website: z.string().max(500).optional().default(''), services: z.union([z.string(), z.array(z.string())]).optional().default(''), message: z.string().trim().min(1).max(5000), 'bot-field': z.string().optional() });
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactSchema.parse(body);
    if (parsed['bot-field']) return NextResponse.json({ ok: true });
    await prisma.contactSubmission.create({ data: { name: parsed.name, email: parsed.email, website: parsed.website, services: Array.isArray(parsed.services) ? parsed.services.join(', ') : parsed.services, message: parsed.message } });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: 'Unable to submit the contact form.' }, { status: 400 }); }
}
