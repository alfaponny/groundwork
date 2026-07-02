'use client';
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export default function ChatKitView({
  sessionToken,
  locale,
}: {
  sessionToken: string;
  locale: 'sv' | 'en';
}) {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) return existing;
        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
        });
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
    startScreen: {
      greeting:
        locale === 'sv'
          ? 'Berätta om din produktidé!'
          : 'Tell us about your project idea!',
    },
  });
  return (
    <ChatKit control={control} className="h-[600px] w-full max-w-[320px]" />
  );
}
