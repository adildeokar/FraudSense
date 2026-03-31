# FraudSense AI — Setup

Production-grade, real-time AI-powered fraudulent transaction detection demo (Next.js 14).

## Prerequisites

- Node.js 18+
- OpenAI API key with access to `gpt-4o-mini`

## Quick Start

```bash
cd FraudSense
npm install
cp .env.example .env.local
```

Add your `OPENAI_API_KEY` to `.env.local`. Generate `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo credentials

- `admin@fraudsense.ai` / `demo2024`
- `analyst@fraudsense.ai` / `demo2024`

## Deploy to Vercel

1. Push the project to GitHub.
2. Import the repository in the Vercel dashboard.
3. Set environment variables:
   - `OPENAI_API_KEY`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production URL, e.g. `https://your-app.vercel.app`)
4. Deploy.

## Key demo flow (judges)

1. Log in as admin.
2. Show the dashboard with the live feed.
3. Open **Settings** and trigger **International account takeover** or **Card skimming attack**.
4. Watch the dashboard react in real time.
5. Open a flagged transaction → **AI Risk Analysis** tab.
6. Open **AI Investigator** and chat / generate report.
7. Show **Analytics** and **Alerts**.

## Stack

Next.js 14 (App Router), Tailwind CSS, Framer Motion, shadcn/ui-style components, Recharts, react-simple-maps, NextAuth (credentials), Zustand, OpenAI API, Sonner.

State is in-memory (Zustand); no database required for the hackathon demo.
