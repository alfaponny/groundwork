import { NextRequest } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { SpecDocument } from '../../../lib/pdf/SpecDocument';
import type { Spec, Competitor } from '../../..//lib/schemas/spec';
import fs from 'node:fs';
import path from 'node:path';

const mockSpec: Spec = {
  title: 'AI Sales Coach',
  problem:
    'Sales reps lose deals because they miss follow-ups and forget what was discussed on calls.',
  targetUsers:
    'B2B SaaS sales teams with 5–50 reps, using a CRM but no AI tooling yet.',
  mvpFeatures: [
    'Auto-summary of every customer call',
    'Follow-up reminders pushed to Slack',
    'Weekly digest of stalled deals',
    'Integration with HubSpot and Salesforce',
  ],
  hourEstimate: 145,
  complexityTier: 'medium',
};

const mockCompetitors: Competitor[] = [
  {
    name: 'Gong',
    url: 'gong.io',
    oneLiner: 'Revenue intelligence for sales teams.',
    strengths: ['Strong call analytics', 'Established brand'],
    weaknesses: ['Expensive', 'Enterprise-focused'],
  },
  {
    name: 'Chorus',
    url: 'chorus.ai',
    oneLiner: 'Conversation intelligence platform owned by ZoomInfo.',
    strengths: ['Tight CRM integration', 'Affordable mid-market plans'],
    weaknesses: ['Slower product iteration', 'UI feels dated'],
  },
];

const mockGaps = {
  opportunities: [
    'Affordable plan for teams under 10 reps',
    'Slack-first workflow instead of dashboard-first',
    'Pre-built playbooks for common B2B SaaS sales motions',
  ],
  specRefinements: [
    'Add a free tier to lower the trial barrier',
    'Native Slack app rather than webhook integration',
  ],
};

const mockContact = {
  name: 'Jane Doe',
  company: 'Prototyp',
  email: 'jane.doe@prototyp.se',
};

export async function GET(req: NextRequest) {
  const localeParam = req.nextUrl.searchParams.get('locale');
  const locale = localeParam === 'en' ? 'en' : 'sv';

  const t = await getTranslations({ locale, namespace: 'Pdf' });

  const logoBuffer = fs.readFileSync(
    path.join(process.cwd(), 'public', 'logo.png'),
  );
  const logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`;

  const buffer = await renderToBuffer(
    <SpecDocument
      spec={mockSpec}
      competitors={mockCompetitors}
      gaps={mockGaps}
      contact={mockContact}
      t={
        t as unknown as (
          key: string,
          values?: Record<string, string | number>,
        ) => string
      }
      logoSrc={logoSrc}
    />,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="groundwork-preview.pdf"',
    },
  });
}
