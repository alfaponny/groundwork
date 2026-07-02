import { getTranslations } from 'next-intl/server';
import type { Session } from '../session';
import { colors, radius } from '../../brand/tokens';

type RenderArgs = {
  session: Session;
  pdfUrl: string;
  expiresAt: string;
  locale: 'sv' | 'en';
};

const FONT_STACK = 'Manrope, Helvetica, Arial, sans-serif';

export async function renderSpecEmail({
  session,
  pdfUrl,
  expiresAt,
  locale,
}: RenderArgs): Promise<{ subject: string; html: string; text: string }> {
  const translations = await getTranslations({ locale, namespace: 'Email' });

  const name = session.name ?? '';
  const email = session.email ?? '';
  const title = session.spec?.title ?? 'Groundwork';

  const expiryDate = new Intl.DateTimeFormat(
    locale === 'sv' ? 'sv-SE' : 'en-GB',
    { dateStyle: 'long' },
  ).format(new Date(expiresAt));

  const subject = translations('subject', { title });
  const greeting = translations('greeting', { name });
  const intro = translations('intro');
  const ctaText = translations('ctaText');
  const expiryNote = translations('expiryNote', { date: expiryDate });
  const signoff = translations('signoff', { email });

  const text = [
    greeting,
    intro,
    `${ctaText}: ${pdfUrl}`,
    expiryNote,
    signoff,
  ].join('\n\n');

  function escapeHtml(s: string) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const html = `
  <div style="font-family: ${FONT_STACK};  color:${colors.foreground}; background:${colors.background}; max-width:560px; padding:24px;">
    <p>${escapeHtml(greeting)}</p>
    <p>${escapeHtml(intro)}</p>
    <p>
      <a href="${pdfUrl}" style="display:inline-block; padding:12px 20px; background:${colors.primary}; color:${colors.background}; text-decoration:none; border-radius:9999px; font-weight:600;">
        ${escapeHtml(ctaText)}
      </a>
    </p>
    <p style="color:${colors.darkorange};  font-size:13px;">${escapeHtml(expiryNote)}</p>
    <p>${escapeHtml(signoff)}</p>
  </div>
`.trim();

  return { subject, html, text };
}
