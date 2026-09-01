# Competitor Radar — Architecture & Progressive Implementation Plan

## 1. Project Audit & Architecture Overview

### Framework & Environment
- **Framework:** Next.js 14 (App Router) with TypeScript & React 18.
- **Styling:** Tailwind CSS with Growlab Custom Design Tokens (`frost`, `signal`, `surface`, `surface-raised`, `line`, `paper`, `stage`).
- **Icons:** `lucide-react`.
- **Animations / Visuals:** Custom CSS Mesh Orbs (`gl-mesh-orb`), `Reveal.tsx`, `StageGlow.tsx`.

### Database & Data Layer
- **ORM:** Prisma 5.22.0 (`prisma/schema.prisma`).
- **Database:** SQLite (`prisma/dev.db`) for dev/sandbox + PostgreSQL migration capability.
- **Seed Fixtures:** `prisma/seed.ts`.
- **Database Client:** Singleton in `lib/db.ts` with global caching.

### Authentication & Authorization
- **Auth Provider:** Clerk (`@clerk/nextjs`) with graceful fallback to dev impersonation (`lib/auth/session.ts`, `lib/dev/session.ts`).
- **Role Model:** Multi-role system (`merchant`, `creator`, `admin`, `buyer`).
- **Merchant Context:** `User` -> `MerchantProfile` -> `MerchantStore` & `Product`.

### AI & Analysis Foundation
- **AI SDK:** `@google/genai` (Google Gemini SDK).
- **Architecture:** Deterministic math & heuristic scoring engines first (Scores: 0-100), AI for qualitative intelligence & strategic interpretation.

### Existing Profit & Market Engines
- **Reconciliation Engine:** `lib/reconciliationEngine.ts` (True Net Profit, Gross-to-Net waterfall, COD slippage).
- **Profit Leak Engine:** `lib/profitLeaks.ts` (Multi-tier confidence leaks, bleeding ads, courier shortfalls).
- **Dashboards:** `components/dashboard/FinancialAnalyticsDashboard.tsx`, `components/dashboard/ProfitLeakCenter.tsx`.
- **Public Scanner:** `components/FreeLeakScanner.tsx`, `components/AnonymizedBenchmark.tsx`.

---

## 2. Integration Points for Competitor Radar

1. **Dashboard Navigation & View Routing:**
   - Dedicated App Router page: `/competitor-radar` or `/(dashboard)/dashboard/competitor-radar`.
   - Tab in `MerchantDashboard.tsx` (`tab === "competitor_radar"`).
   - Sidebar/App nav integration for quick switching between **Profit Leak Engine** and **Competitor Radar**.

2. **Database Models (Prisma):**
   - `CompetitorProject`: Stores user search context (product, target niche, country/market `OM`, `SA`, `AE`, `KW`, platform filters).
   - `Competitor`: Competitor brand, domain, activity level, threat score, relevance score.
   - `CompetitorAd`: Creative hooks, format (video, image, carousel), active days, copy, CTA, offer type, proof elements.
   - `CompetitorAnalysis`: Structured intelligence (creative strategy, offer strategy, positioning, estimated velocity).
   - `CompetitorWeakness`: Concrete, evidence-backed vulnerabilities (creative, offer, trust, positioning).
   - `MarketOpportunity`: White spaces, underserved angles, counter-strategies.

3. **Multi-Provider Architecture (`providers/`):**
   - Abstract `CompetitorDataProvider` interface.
   - Meta Ads Library Provider (real query normalizer with fallback/mock development provider).
   - TikTok Creative Center / Ads Provider.
   - Unified `providerRegistry.ts`.

4. **Deterministic Engines (0-100 Scoring):**
   - `competitorDiscoveryEngine.ts` (Keyword expansion, advertiser matching, relevance score).
   - `competitorScoringEngine.ts` (Activity score, Creative score, Offer score, Threat score, Confidence score).
   - `weaknessHunter.ts` (Evidence-backed vulnerability extraction).
   - `opportunityFinder.ts` (White space discovery & market gaps).
   - `counterStrategyGenerator.ts` (Actionable battleplans, hooks, offer differentiation).

---

## 3. Files To Reuse

- **Layout & Visuals:**
  - `components/AppShell.tsx`: Outer dashboard shell.
  - `components/StageGlow.tsx`: Glow & card backdrop lighting.
  - `components/Reveal.tsx`: Smooth entry transitions.
  - `components/dashboard/ui.tsx`: `StatusPill`, `TierPill`, `EmptyState`, `TableShell`.
- **Formatting Utilities:**
  - `lib/format.ts`: `formatDate`, `formatMoney`, `formatPct`.
- **Auth & Session:**
  - `lib/auth/session.ts`: `getCurrentUser()`.
- **Database Client:**
  - `lib/db.ts`: `prisma`.

---

## 4. Files To Modify (In Later Phases)

- `prisma/schema.prisma`: Add Competitor Radar models.
- `components/dashboard/MerchantDashboard.tsx`: Add Competitor Radar tab item & navigation.
- `messages/ar.json` & `messages/en.json`: Add bilingual translations for Competitor Radar.
- `components/FreeLeakScanner.tsx` (Phase 18): Link leak discoveries to competitor intelligence CTA.
- `app/(marketing)/page.tsx` (Phase 17): Highlight competitor intelligence in Growlab suite.

---

## 5. Files To Create

1. **Phase 1 (Design & Layout Skeleton):**
   - `app/(dashboard)/dashboard/competitor-radar/page.tsx`
   - `components/radar/CompetitorRadarView.tsx`
   - `components/radar/RadarSearchHeader.tsx`
   - `components/radar/RadarEmptyState.tsx`
   - `components/radar/RadarLoadingState.tsx`
2. **Phase 2-4 (Data & Provider Architecture):**
   - `lib/radar/types.ts`
   - `lib/radar/providers/types.ts`
   - `lib/radar/providers/mockProvider.ts`
   - `lib/radar/providers/metaProvider.ts`
   - `lib/radar/providers/tiktokProvider.ts`
   - `lib/radar/providers/providerRegistry.ts`
   - `lib/radar/actions.ts` (Server Actions for projects and competitor querying)
3. **Phase 7-16 (Core Analytical Engines & Detailed Views):**
   - `lib/radar/discoveryEngine.ts`
   - `lib/radar/scoringEngine.ts`
   - `lib/radar/weaknessHunter.ts`
   - `lib/radar/opportunityFinder.ts`
   - `lib/radar/counterStrategy.ts`
   - `components/radar/CompetitorCard.tsx`
   - `components/radar/CompetitorDetailDrawer.tsx`
   - `components/radar/CreativeIntelligencePanel.tsx`
   - `components/radar/WeaknessHunterGrid.tsx`
   - `components/radar/CompetitiveGapVisualizer.tsx`
   - `components/radar/CounterStrategyBattleplan.tsx`
   - `components/radar/CompetitorWatchList.tsx`

---

## 6. Potential Risks & Mitigation

1. **External API Rate Limits / Blockers (Meta & TikTok):**
   - *Mitigation:* Decouple UI from raw API responses via provider abstraction; normalize data into local database with explicit status codes (`ready`, `rate_limited`, `mock_dev`, `unavailable`).
2. **AI Hallucinations in Scores:**
   - *Mitigation:* Hard constraint — all numerical scores (0-100) are computed mathematically via deterministic formulas. AI is strictly used for qualitative strategic copywriting and creative hook ideation.
3. **Performance on Large Ad Catalogs:**
   - *Mitigation:* Paginated queries, localized SQLite caching, and background indexing.

---

## 7. Progressive Implementation Sequence

- **[CURRENT] Phase 0:** Project Audit & Design Discovery (Complete).
- **Phase 1:** Design Integration & Responsive UI Skeleton (`/dashboard/competitor-radar`).
- **Phase 2:** Database Foundation (Prisma schema update, migrations, seed fixtures).
- **Phase 3:** Competitor Radar Core Flow with Mock Provider.
- **Phase 4:** Provider Architecture (`CompetitorDataProvider` registry).
- **Phase 5 & 6:** Meta & TikTok Provider Normalization.
- **Phase 7 & 8:** Discovery & Deterministic Scoring Engine.
- **Phase 9 & 10:** Competitor Profile & Creative Intelligence.
- **Phase 11 & 12:** Weakness Hunter & Competitive Gap Visualizer.
- **Phase 13 & 14:** Market Opportunities & AI Counter Strategy.
- **Phase 15 & 16:** Actionable Battleplans & Competitor Watch.
- **Phase 17-22:** Landing Page, Free Entry Hook, Monetization, Hardening & Tests.
