# Groundwork — AI client finder 

**Next.js · TypeScript · MCP · Docker · License: MIT**

A ChatGPT-native lead-generation app built on the [OpenAI Apps SDK](https://developers.openai.com/api/docs/guides/agents) (MCP). A prospect answers five short discovery questions in an embedded chat widget and, in return, gets a genuinely useful deliverable: an AI-generated **product spec**, a **competitor/market analysis** (via live web search), a **gap analysis**, and a rough **budget range** — packaged as a branded **PDF** they can download immediately. Email delivery is optional.

> **Note:** This is a sanitized portfolio version of a prototype I built solo in 2026 at a web development consultant agency to demonstrate the OpenAI Apps SDK / MCP flow. Credentials, internal endpoints, brand assets, and deployment-specific details have been removed or replaced with neutral placeholders (the demo brand "Alfaponny Studio"). The code reflects my own implementation work.

## Table of Contents

- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Running](#running)

## How It Works

1. The page loads and an **anonymous session** (UUID + token) is minted automatically — no sign-up, no form.
2. An embedded **ChatKit** widget walks the visitor through **five discovery questions**.
3. The **MCP tool chain** runs server-side:
   - `generate_spec` — turns the five answers into a structured product spec (OpenAI structured outputs).
   - `analyze_market` — researches competitors and market context using the web-search tool.
   - `identify_gaps` — finds differentiation opportunities and risks.
   - `generate_pdf` — renders a branded PDF and uploads it to S3-compatible storage, returning a signed download URL.
4. The signed **download link** appears below the chat as soon as the PDF is ready (the frontend polls the session for it).
5. **Optionally**, the visitor submits contact details to have the PDF emailed to them — this PATCHes the existing anonymous session and CCs the studio's sales inbox. The AI never sees this data.

The app is **bilingual (Swedish / English)** — all UI copy, prompts, and PDF templates are localized, defaulting to Swedish.

## Tech Stack

| Component | Choice |
| --- | --- |
| Framework / Runtime | Next.js (App Router) / TypeScript / Node |
| AI | OpenAI structured outputs + web search |
| Protocol | Model Context Protocol via `@modelcontextprotocol/sdk` (Streamable HTTP) |
| Chat UI | `@openai/chatkit-react` (embedded widget) |
| Validation | Zod (all tool inputs/outputs) |
| PDF | `@react-pdf/renderer` → signed URL (no headless Chromium) |
| Storage | S3-compatible blob storage (`@aws-sdk/client-s3`) |
| Session store | Redis (`ioredis`), TTL-based |
| Email | SMTP (Nodemailer) |
| Styling | Tailwind CSS |
| Deployment | Docker |

git remote add origin https://github.com/alfaponny/groundwork.git
git branch -M main
git push -u origin main

## Project Structure

```
src/
├── app/
│   ├── [locale]/                 # Localized pages (sv / en)
│   ├── api/
│   │   ├── mcp/                  # MCP server — the 4-tool chain (route handler)
│   │   ├── chatkit/session/      # Mints ChatKit session tokens
│   │   ├── session/anonymous/    # Creates the anonymous session + UUID
│   │   ├── email/send/           # Optional PDF-by-email endpoint
│   │   └── pdf-preview/          # Dev-only PDF preview
│   └── components/               # Chat embed, download button, contact form
├── brand/                        # Framework-agnostic brand tokens (colors, fonts)
├── i18n/                         # next-intl config
├── lib/
│   ├── tools/                    # generateSpec, analyzeMarket, identifyGaps, generatePdf
│   ├── pdf/                      # React-PDF document template
│   ├── email/                    # Email composition + sending
│   ├── schemas/                  # Zod schemas
│   ├── redis.ts                  # Session store client
│   ├── storage.ts                # Blob upload + signed URLs
│   ├── session.ts                # Session read/write
│   └── budget.ts                 # Budget range estimation
└── messages/                     # sv.json / en.json UI copy
```


## Configuration

Copy `.env.example` to `.env.local` and fill in your own credentials:

```bash
# Session store
REDIS_URL=

# OpenAI
OPENAI_API_KEY=
CHATKIT_WORKFLOW_ID=

# MCP auth
MCP_SERVICE_TOKEN=

# S3-compatible blob storage
SPACES_KEY=
SPACES_SECRET=
SPACES_BUCKET=
SPACES_REGION=
SPACES_ENDPOINT=

# Email (SMTP)
GMAIL_USER=
GMAIL_APP_PASSWORD=
SALES_EMAIL=
```

No real credentials are included in this repository. You'll need your own OpenAI, Redis, blob-storage, and SMTP access to run it against live services.

## Running

**Local**

```bash
npm install
npm run dev
```

The MCP tool chain runs against the deployed server; see comments in `src/app/api/mcp/route.ts` for local testing via the MCP Inspector.

**Docker**

```bash
docker build -t groundwork:latest .
docker run -p 3000:3000 groundwork:latest
```
