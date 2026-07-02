import { Document, Page } from '@react-pdf/renderer';
import { pageStyles } from './styles';
import {
  Section,
  Subheading,
  Body,
  BulletList,
  Card,
  DocHeader,
  PageFooter,
  Table,
  TableRow,
  TableCell,
} from './primitives';
import type { Spec, Competitor } from '../schemas/spec';
import { Text } from '@react-pdf/renderer';
import { pdfFont, pdfSpacing, pdfColors } from '@/src/brand/pdfTokens';
import { agency } from '@/src/brand/agency';
import { blockStyles } from './styles';
import { budgetFor } from '../budget';
import { View } from '@react-pdf/renderer';

type Gaps = { opportunities: string[]; specRefinements: string[] };
type T = (key: string, values?: Record<string, string | number>) => string;

const CONTACT_EMAIL = 'example@mail.com'; // Replace with your actual contact email

export type SpecPdfProps = {
  spec: Spec;
  competitors: Competitor[];
  gaps: Gaps;
  t: T;
  logoSrc?: string;
  contact?: { name: string; company: string; email: string };
};

function Briefing({ spec, t }: { spec: Spec; t: T }) {
  return (
    <Section title={t('briefing.title')}>
      <Subheading>{t('briefing.problem')}</Subheading>
      <Body>{spec.problem}</Body>
      <Subheading>{t('briefing.users')}</Subheading>
      <Body>{spec.targetUsers}</Body>
    </Section>
  );
}

const COMP_COLS = { name: 2, summary: 3, strengths: 2.5, weaknesses: 2.5 };

function Competitors({ competitors, t }: { competitors: Competitor[]; t: T }) {
  return (
    <Section title={t('competitors.title')}>
      <Table>
        <TableRow header>
          <TableCell header flex={COMP_COLS.name}>
            {t('competitors.name')}
          </TableCell>
          <TableCell header flex={COMP_COLS.summary}>
            {t('competitors.summary')}
          </TableCell>
          <TableCell header flex={COMP_COLS.strengths}>
            {t('competitors.strengths')}
          </TableCell>
          <TableCell header flex={COMP_COLS.weaknesses}>
            {t('competitors.weaknesses')}
          </TableCell>
        </TableRow>
        {competitors.map((c) => (
          <TableRow key={c.name}>
            <TableCell flex={COMP_COLS.name}>
              <Text style={{ fontFamily: pdfFont.bold }}>{c.name}</Text>
              <Text style={blockStyles.cardMeta}>{c.url}</Text>
            </TableCell>
            <TableCell flex={COMP_COLS.summary}>{c.oneLiner}</TableCell>
            <TableCell flex={COMP_COLS.strengths}>
              <BulletList items={c.strengths} />
            </TableCell>
            <TableCell flex={COMP_COLS.weaknesses}>
              <BulletList items={c.weaknesses} />
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </Section>
  );
}

function Gap({ gaps, t }: { gaps: Gaps; t: T }) {
  return (
    <Section title={t('gap.title')}>
      <Table>
        <TableRow header>
          <TableCell header flex={1}>
            {t('gap.opportunities')}
          </TableCell>
          <TableCell header flex={1}>
            {t('gap.refinements')}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell flex={1}>
            <BulletList items={gaps.opportunities} />
          </TableCell>
          <TableCell flex={1}>
            <BulletList items={gaps.specRefinements} />
          </TableCell>
        </TableRow>
      </Table>
    </Section>
  );
}

const TIERS = ['simple', 'medium', 'advanced'] as const;

function SpecHighlights({ spec, t }: { spec: Spec; t: T }) {
  return (
    <Section title={t('spec.title')}>
      <Subheading>{t('spec.features')}</Subheading>
      <BulletList items={spec.mvpFeatures} />
      <View style={{ marginTop: pdfSpacing.paragraph }} />
      <Subheading>{t('spec.estimate')}</Subheading>
      <Table style={{ alignSelf: 'flex-start', width: '70%' }}>
        <TableRow header>
          <TableCell header flex={2}>
            {t('budget.tierHeader')}
          </TableCell>
          <TableCell header flex={1}>
            {t('budget.hoursHeader')}
          </TableCell>
        </TableRow>
        {TIERS.map((tier) => {
          const selected = tier === spec.complexityTier;
          return (
            <TableRow key={tier} highlight={selected}>
              <TableCell flex={2}>
                <Text
                  style={selected ? { fontFamily: pdfFont.bold } : undefined}
                >
                  {t(`spec.tier.${tier}`)}
                </Text>
                {selected && (
                  <Text style={blockStyles.cardMeta}>
                    {t('budget.yourEstimate')}
                  </Text>
                )}
              </TableCell>
              <TableCell flex={1}>{`${budgetFor(tier)} h`}</TableCell>
            </TableRow>
          );
        })}
      </Table>
    </Section>
  );
}

function NextStep({ t }: { t: T }) {
  return (
    <Section title={t('nextStep.title')}>
      <Body>{t('nextStep.body')}</Body>
      <Text style={{ fontFamily: pdfFont.bold, color: pdfColors.primary }}>
        {t('nextStep.contact', { email: CONTACT_EMAIL })}
      </Text>
    </Section>
  );
}

export function SpecDocument({
  spec,
  competitors,
  gaps,
  t,
  logoSrc,
  contact,
}: SpecPdfProps) {
  return (
    <Document title={spec.title} author={agency.name}>
      <Page size="A4" style={pageStyles.page}>
        <DocHeader title={spec.title} logoSrc={logoSrc} />
        <Briefing spec={spec} t={t} />
        <Competitors competitors={competitors} t={t} />
        <Gap gaps={gaps} t={t} />
        <SpecHighlights spec={spec} t={t} />
        <NextStep t={t} />
        <PageFooter />
      </Page>
    </Document>
  );
}
