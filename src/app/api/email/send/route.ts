import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendSpecEmail } from '@/src/lib/email/sendSpecEmail';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().min(1),
  pdfUrl: z.string().url(),
  pdfExpiresAt: z.string().optional(),
  locale: z.enum(['en', 'sv']).default('sv'),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ errors: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.issues }, { status: 400 });
  }

  const { name, email, company, pdfUrl, pdfExpiresAt, locale } = parsed.data;

  await sendSpecEmail({
    session: {
      name,
      email,
      company,
      locale,
      createdAt: new Date().toISOString(),
    },
    pdfUrl,
    expiresAt:
      pdfExpiresAt ??
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    locale,
  });

  return NextResponse.json(
    { message: 'Email sent successfully' },
    { status: 200 },
  );
}
