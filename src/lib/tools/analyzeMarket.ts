import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { competitorSchema, type Spec } from '../schemas/spec';
import { z } from 'zod';

const marketSchema = z.object({
  competitors: z.array(competitorSchema).min(1).max(5),
});

export const analyzeMarket = async ({
  spec,
  locale,
}: {
  spec: Spec;
  locale: 'sv' | 'en';
}) => {
  const openAi = new OpenAI();

  const prompt = `Use web_search to find 3–5 real competitors. 
  For each: name, URL, one-liner, 2–3 strengths, 2–3 weaknesses. Prefer current sources. 
  IMPORTANT: Every string field in your JSON output MUST be written in ${locale === 'sv' ? 'Swedish' : 'English'}. This is a hard requirement — do not copy English text from search results. Translate or rewrite everything in ${locale === 'sv' ? 'Swedish' : 'English'} before including it in your response.`;

  const response = await openAi.responses.parse({
    model: 'gpt-5.4',
    tools: [{ type: 'web_search' }],
    text: {
      format: zodTextFormat(marketSchema, 'market'),
    },
    input: [
      { role: 'system', content: prompt },
      { role: 'user', content: JSON.stringify(spec) },
    ],
  });

  return response.output_parsed!;
};
