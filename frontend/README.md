# Sentinel — Fraud Detection Frontend

Next.js dashboard for the AI fraud detection platform: real-time transaction
scoring, prediction history, and model performance — talks to the FastAPI
backend in `../backend`.

## Design

Deep-navy "analyst console" aesthetic (`#0a1120` base, teal/amber/red signal
palette borrowed from the fraud domain's own vocabulary of risk levels) —
Space Grotesk for display type, IBM Plex Sans/Mono for body and data. The
signature element is the **Risk Pulse**: a heartbeat-style waveform of
recent transaction scores that spikes on fraud flags, used on both the
login screen and the dashboard, driven by real prediction data rather than
decoration.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · TanStack Query ·
Zustand (auth state) · React Hook Form + Zod · Recharts · lucide-react

## Setup

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm run dev
```

Requires the backend running (see `../backend/README.md`) — by default at
`http://localhost:8000`.

## Structure

```
src/
  app/
    login/, register/          public auth pages (split-screen w/ Risk Pulse hero)
    (app)/                     protected route group
      layout.tsx                 wraps children in RequireAuth + AppShell
      dashboard/                 overview: stats, risk pulse, volume chart
      predict/                   transaction scoring form + SHAP explanation
      batch/                     CSV batch upload + per-row results
      history/                   paginated, filterable prediction table
      model/                     offline model evaluation metrics
      admin/                     user management + platform stats (admin role only)
  components/
    ui/                         Button, Card, Input, Badge, StatCard, EmptyState
    layout/                     AppShell (sidebar), AuthShell, RequireAuth
    charts/RiskPulse.tsx        signature waveform visualization
    predict/RiskResult.tsx      score + SHAP factor breakdown
  lib/
    api.ts                      typed fetch client (attaches JWT, handles 401)
    auth-store.ts                zustand store, persisted to localStorage
    types.ts                     mirrors backend Pydantic schemas
```

## Verified

`npm run build` and `npx eslint src` both pass clean. (Note: this
sandbox has no outbound access to `fonts.googleapis.com`, so the Google
Fonts build step couldn't be exercised here — it was verified by
temporarily swapping to system fonts, confirming everything else compiles
and typechecks, then restoring the real `next/font/google` imports. This
will resolve automatically in any environment with normal internet
access.)

## Known limitations / next steps

- No dark/light theme toggle — dark analyst-console theme only, by design
- No end-to-end (Playwright/Cypress) tests yet, only build + lint verification
- Batch upload results aren't paginated in the UI — fine up to the
  backend's 1,000-row cap, would need it beyond that
