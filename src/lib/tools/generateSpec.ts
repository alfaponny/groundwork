import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { agency } from '@/src/brand/agency';
import { specCoreSchema, type Answers } from '../schemas/spec';

export const generateSpec = async ({
  answers,
  locale,
}: {
  answers: Answers;
  locale: 'sv' | 'en';
}) => {
  const openAi = new OpenAI();

  const prompt = `You're a product spec writer for ${agency.name},
    ${agency.descriptor}. Given 5 discovery answers, produce a concise product spec.
    Respond in ${locale === 'sv' ? 'Swedish' : 'English'}.`;

  const response = await openAi.responses.parse({
    model: 'gpt-5.4-mini',
    input: [
      { role: 'system', content: prompt },
      { role: 'user', content: JSON.stringify(answers) },
    ],
    text: { format: zodTextFormat(specCoreSchema, 'spec') },
  });

  return response.output_parsed!;
};
