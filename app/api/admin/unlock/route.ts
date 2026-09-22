import fs from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ADMIN_COOKIE_MAX_AGE_SECONDS, ADMIN_COOKIE_NAME, createSessionToken, pinsMatch } from '@/lib/adminSession';

export const runtime = 'nodejs';
const schema = z.object({ pin: z.string().min(1).max(64) });

export async function POST(req: NextRequest) {
  let pin: string;
  try {
    ({ pin } = schema.parse(await req.json()));
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const row = await prisma.siteData.findUnique({ where: { id: 1 } });
  let storedPin = (row?.data as { company?: { adminPin?: unknown } } | undefined)?.company?.adminPin;
  if (storedPin === undefined || storedPin === null || storedPin === '') {
    const defaultsRaw = await fs.readFile(path.join(process.cwd(), 'public/site-data.json'), 'utf8');
    storedPin = JSON.parse(defaultsRaw)?.company?.adminPin;
  }

  if (!storedPin || !pinsMatch(pin, String(storedPin))) {
    return NextResponse.json({ error: 'Incorrect PIN.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS,
  });
  return res;
}
