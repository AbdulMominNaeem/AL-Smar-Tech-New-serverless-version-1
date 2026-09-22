import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ADMIN_COOKIE_NAME, redactCompanyPin, verifySessionToken } from '@/lib/adminSession';

export const runtime = 'nodejs';
const payloadSchema = z.object({ company: z.object({ adminPin: z.union([z.string(), z.number()]).optional() }).passthrough() }).passthrough();

export async function GET(req: NextRequest) {
  const row = await prisma.siteData.findUnique({ where: { id: 1 } });
  const data = row?.data as { company?: Record<string, unknown> } | null;
  const authed = verifySessionToken(req.cookies.get(ADMIN_COOKIE_NAME)?.value);
  const body = data && !authed ? redactCompanyPin(data) : data;
  return NextResponse.json(body ?? null, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const authed = verifySessionToken(req.cookies.get(ADMIN_COOKIE_NAME)?.value);
  if (!authed) return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  try {
    const incoming = payloadSchema.parse(await req.json()) as Prisma.InputJsonValue;
    await prisma.siteData.upsert({ where: { id: 1 }, create: { id: 1, data: incoming }, update: { data: incoming } });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: 'Invalid site data.', detail: e instanceof Error ? e.message : 'Unknown error' }, { status: 400 }); }
}
