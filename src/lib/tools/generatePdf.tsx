import { renderToBuffer } from '@react-pdf/renderer';
import { getTranslations } from 'next-intl/server';
import fs from 'node:fs';
import path from 'node:path';
import { SpecDocument } from '../pdf/SpecDocument';
import { uploadPdf } from '../storage';
import type { Session } from '../session';

const LOGO_DATA_URL = (() => {
  const buf = fs.readFileSync(path.join(process.cwd(), 'public', 'logo.png'));
  return `data:image/png;base64,${buf.toString('base64')}`;
})();

export async function generatePdf({
  token,
  session,
}: {
  token: string;
  session: Session;
}) {
  if (!session.spec || !session.competitors || !session.gaps) {
    throw new Error(
      'Session is missing spec, competitors or gaps. Failed to generate PDF.',
    );
  }
  const t = await getTranslations({
    locale: session.locale,
    namespace: 'Pdf',
  });

  const contact =
    session.name && session.email && session.company
      ? {
          name: session.name,
          company: session.company,
          email: session.email,
        }
      : undefined;
  const bufer = await renderToBuffer(
    <SpecDocument
      spec={session.spec}
      competitors={session.competitors}
      gaps={session.gaps}
      t={
        t as unknown as (
          key: string,
          values?: Record<string, string | number>,
        ) => string
      }
      logoSrc={LOGO_DATA_URL}
    />,
  );

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const objectKey = `pdfs/${timestamp}-$${crypto.randomUUID()}.pdf`;
  const { url, expiresAt } = await uploadPdf(Buffer.from(bufer), objectKey);

  return {
    pdfUrl: url,
    expiresAt,
    filename: `groundwork-spec-${timestamp}.pdf`,
  };
}
