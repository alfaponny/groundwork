import { NextResponse } from 'next/server';
import { contactSchema } from '@/src/lib/schemas/contact';
import { createSession, getSession, updateSession } from '@/src/lib/session';

export async function GET(req: Request) {
  const auth = req.headers.get('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await getSession(token);

  if (!session) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    pdfUrl: session.pdfUrl ?? null,
    pdfExpiresAt: session.pdfExpiresAt ?? null,
    pdfStatus: session.pdfStatus ?? null,
  });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ errors: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.issues }, { status: 400 });
  }

  const token = await createSession(parsed.data);

  return NextResponse.json({ token }, { status: 201 });
}

export async function PATCH(req: Request) {
  const auth = req.headers.get('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ errors: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = contactSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.issues }, { status: 400 });
  }
  await updateSession(token, parsed.data);
  return NextResponse.json({ message: 'Session updated successfully' });
}
