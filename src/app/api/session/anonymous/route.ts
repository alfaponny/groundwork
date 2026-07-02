import { NextResponse } from 'next/server';
import { createSession } from '@/src/lib/session';

export async function POST(req: Request) {
  let body: { locale?: string } = {};
  try {
    body = await req.json();
  } catch {
    // empty body
  }

  const locale = body?.locale === 'en' ? 'en' : 'sv';
  const token = await createSession({
    name: '',
    company: '',
    email: '',
    locale,
  });

  return NextResponse.json({ token }, { status: 201 });
}
