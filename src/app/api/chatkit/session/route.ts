import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../../../lib/session';

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sessionData = await getSession(token);
  if (!sessionData)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('OpenAI API key is not configured.');
    }
    const workflowId = process.env.CHATKIT_WORKFLOW_ID;
    if (!workflowId) {
      throw new Error('Chatkit workflow ID is not configured.');
    }

    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'chatkit_beta=v1',
      },
      body: JSON.stringify({
        user: token,
        workflow: { id: workflowId },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('OpenAI error:', response.status, body);
      throw new Error(`Failed to create session: ${response.statusText}`);
    }

    const data = await response.json();

    const { redis } = await import('@/src/lib/redis');
    await redis.set('latest_chatkit_session', token, 'EX', 1800);

    return NextResponse.json({ client_secret: data.client_secret });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 },
    );
  }
}
