import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { gapsSchema, type Spec, type Competitor } from '../schemas/spec';

export const identifyGaps = async ({
  locale,
  spec,
  competitors,
}: {
  spec: Spec;
  competitors: Competitor[];
  locale: 'sv' | 'en';
}) => {
  const openAi = new OpenAI();

  const prompt = `Find positioning opportunities 
  and suggest spec refinements from competitor analysis.
       Respond in ${locale === 'sv' ? 'Swedish' : 'English'}.`;

  const response = await openAi.responses.parse({
    model: 'gpt-5.4-mini',
    input: [
      { role: 'system', content: prompt },
      { role: 'user', content: JSON.stringify({ spec, competitors }) },
    ],
    text: { format: zodTextFormat(gapsSchema, 'gaps') },
  });

  return response.output_parsed!;
};
