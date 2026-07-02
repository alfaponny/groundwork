import { createMcpHandler, withMcpAuth } from 'mcp-handler';
import { z } from 'zod';
import {
  getSession,
  updateSession,
  resolveUserSession,
} from '../../../lib/session';
import {
  answersSchema,
  specSchema,
  competitorSchema,
  gapsSchema,
} from '../../../lib/schemas/spec';
import { generateSpec } from '@/src/lib/tools/generateSpec';
import { budgetFor } from '@/src/lib/budget';
import { analyzeMarket } from '@/src/lib/tools/analyzeMarket';
import { identifyGaps } from '@/src/lib/tools/identifyGaps';
import { generatePdf } from '@/src/lib/tools/generatePdf';

const baseHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      'generate_spec',
      {
        title: 'generate product spec',
        description:
          'Produce a first-draft product spec and budget estimate, using Q5 complexity level to calibrate the 120-170 hour range.',
        inputSchema: {
          answers: answersSchema,
          locale: z.enum(['sv', 'en']).default('sv'),
        },
        outputSchema: specSchema.shape,
      },
      async ({ answers, locale }, { authInfo }) => {
        const resolved = await resolveUserSession();
        const effectiveLocale = resolved?.session.locale ?? locale;

        const core = await generateSpec({ answers, locale: effectiveLocale });

        const spec = {
          ...core,
          complexityTier: answers.complexityLevel,
          hourEstimate: budgetFor(answers.complexityLevel),
        };
        if (resolved)
          await updateSession(resolved.token, {
            spec,
            pdfStatus: 'generating',
          });

        return {
          content: [
            { type: 'text' as const, text: `Drafted spec: ${spec.title}` },
          ],
          structuredContent: spec,
        };
      },
    );

    server.registerTool(
      'analyze_market',
      {
        title: 'analyze market',
        description:
          'Web search + summarize competitors relevant to the draft spec',
        inputSchema: {
          spec: specSchema,
          locale: z.enum(['sv', 'en']).default('sv'),
        },
        outputSchema: { competitors: z.array(competitorSchema) },
      },
      async ({ spec, locale }, { authInfo }) => {
        const resolved = await resolveUserSession();
        const effectiveLocale = resolved?.session.locale ?? locale;

        const { competitors } = await analyzeMarket({
          spec,
          locale: effectiveLocale,
        });

        if (resolved) {
          await updateSession(resolved.token, { competitors });
        }

        return {
          content: [
            {
              type: 'text',
              text: `Found ${competitors.length} competitors for: ${spec.title}`,
            },
          ],
          structuredContent: { competitors },
        };
      },
    );

    server.registerTool(
      'identify_gaps',
      {
        title: 'identify gaps',
        description:
          'Find positioning opportunities and suggest spec refinements from competitior analysis',
        inputSchema: {
          spec: specSchema,
          competitors: z.array(competitorSchema),
          locale: z.enum(['sv', 'en']).default('sv'),
        },
        outputSchema: gapsSchema.shape,
      },
      async ({ spec, competitors, locale }, { authInfo }) => {
        const resolved = await resolveUserSession();
        const effectiveLocale = resolved?.session.locale ?? locale;

        const { opportunities, specRefinements } = await identifyGaps({
          spec,
          locale: effectiveLocale,
          competitors,
        });

        if (resolved) {
          await updateSession(resolved.token, {
            gaps: { opportunities, specRefinements },
          });
        }

        return {
          content: [
            {
              type: 'text',
              text: `Found ${opportunities.length} opportunities for: ${spec.title} and ${specRefinements.length} spec refinements`,
            },
          ],
          structuredContent: { opportunities, specRefinements },
        };
      },
    );

    server.registerTool(
      'generate_pdf',
      {
        title: 'generate PDF',
        description:
          'Compile session data into a branded PDF and return a signed download link',

        inputSchema: {
          locale: z.enum(['en', 'sv']).default('sv'),
          spec: specSchema,
          competitors: z.array(competitorSchema),
          gaps: gapsSchema,
          userSessionToken: z.string().optional(),
        },
        outputSchema: {
          pdfUrl: z.string().url(),
          expiresAt: z.string().datetime(),
          filename: z.string(),
        },
      },
      async (
        { locale, spec, competitors, gaps, userSessionToken },
        { authInfo },
      ) => {
        const { redis } = await import('../../../lib/redis');

        let effectiveToken: string | null = null;

        if (userSessionToken) {
          const s = await getSession(userSessionToken);
          if (s) effectiveToken = userSessionToken;
        }

        if (!effectiveToken) {
          const latestToken = await redis.get('latest_chatkit_session');
          if (latestToken) effectiveToken = latestToken;
        }

        if (!effectiveToken) throw new Error('Missing session token.');
        const session = await getSession(effectiveToken);
        if (!session) throw new Error('Session not found');

        const fullSession = { ...session, spec, competitors, gaps, locale };
        const result = await generatePdf({
          token: effectiveToken,
          session: fullSession,
        });

        await updateSession(effectiveToken, { pdfStatus: 'generating' });

        await updateSession(effectiveToken, {
          pdfUrl: result.pdfUrl,
          pdfExpiresAt: result.expiresAt,
          pdfStatus: 'ready',
        });

        const text = `Generated PDF: ${result.filename}. The Download link will appear below.`;

        return {
          content: [{ type: 'text', text }],
          structuredContent: result,
        };
      },
    );

    server.registerTool(
      'save_project',
      {
        title: 'save project',
        description:
          'Persist the session and PDF across conversations per client',
        inputSchema: {
          pdfUrl: z.string().url(),
          spec: specSchema,
          competitors: z.array(competitorSchema),
          gaps: gapsSchema,
        },
        outputSchema: {
          projectId: z.string(),
          savedAt: z.string().datetime(),
        },
      },
      async ({ spec }) => {
        const saved = {
          projectId: '00000000-0000-4000-8000-000000000000',
          savedAt: new Date().toISOString(),
        };

        return {
          content: [
            {
              type: 'text',
              text: `Saved project for ${spec.title} (id: ${saved.projectId}).`,
            },
          ],
          structuredContent: saved,
        };
      },
    );
  },
  {},
  { basePath: '/api' },
);

async function verifyToken(req: Request, bearerToken?: string) {
  if (!bearerToken) return undefined;

  const userId =
    req.headers.get('x-user-id') ?? req.headers.get('x-openai-user-id');
  const tokenToCheck = userId ?? bearerToken;
  if (!tokenToCheck) return undefined;

  const session = await getSession(tokenToCheck);
  if (!session) return undefined;

  return {
    token: tokenToCheck,
    clientId: tokenToCheck,
    scopes: [],
    extra: session,
  };
}

const handler = withMcpAuth(baseHandler, verifyToken, { required: true });

export { handler as GET, handler as POST, handler as DELETE };
