# FraudSense AI — Everything You Need to Know

This document is a full reference for the **FraudSense** application (package name `fraudsense-ai`): what it is, why it exists, what problems it illustrates, how it works technically, every major parameter, and how realistic it is compared to a production fraud stack.

---

## 1. What FraudSense Is

**FraudSense** is a **Next.js 14** web application that demonstrates **real-time, AI-assisted fraudulent transaction detection**. It combines:

- A **live transaction simulator** that generates synthetic card and payment events.
- **Rule-based risk scoring** (always available offline).
- **Optional OpenAI (`gpt-4o-mini`) analysis** for per-transaction risk scores, natural-language explanations, and recommendations.
- An **AI Investigator** chat and **markdown investigation reports** for analyst workflows.
- **Dashboards**: live feed, maps, charts, alerts, transaction list, analytics, and configurable simulation settings.

The README describes it explicitly as a **production-grade demo** aimed at hackathon-style presentations (judges’ flow: login → dashboard → trigger scenarios → AI analysis → investigator → analytics).

---

## 2. Why It Was Created & What It Helps With

### Purpose

The project was built to **show how modern fraud operations centers could use**:

1. Continuous transaction ingestion (here: simulated stream).
2. Automated risk scoring and labeling.
3. LLM-backed narrative explanations (to speed analyst triage).
4. Investigative tooling (chat + structured reports).

### Problems It Addresses (Conceptually)

| Problem | How FraudSense Illustrates a Response |
|--------|----------------------------------------|
| **Transaction fraud** (card not present, ATO, skimming) | Simulated patterns: velocity, geo anomaly, VPN, new device, amount spikes, card testing. |
| **Analyst overload** | AI explains *why* something looks risky in plain language. |
| **Slow investigation** | Investigator API generates reports with standard sections. |
| **Ops visibility** | Dashboard stats, alerts, fraud rate, “amount protected” (blocked sums). |

### What It Is *Not*

- It does **not** connect to a real card network, bank core, or payment processor.
- It does **not** persist transactions in a database (see State section).
- It is **not** a certified or audited fraud engine; it is a **demonstration and UX prototype**.

---

## 3. How Realistic Is It?

### Strengths (What Rings True)

- **Layered signals**: Velocity, geo, device, VPN/proxy, amount vs. baseline, and merchant category mirror real fraud stacks (often rules + ML + analyst review).
- **Async analysis queue**: Pending transactions are analyzed with **limited concurrency** (`MAX_CONCURRENT = 2` in `useFraudAnalysis`), similar to throttling real API calls.
- **Graceful degradation**: Without `OPENAI_API_KEY`, the app still runs using **`ruleBasedAnalysis`**.
- **Scenario library**: Account takeover sequence, card skimming burst, fraud ring, and benign “travel” false-positive style sequence are **recognizable fraud stories**.

### Limitations (Demo vs. Production)

| Area | In This App | In Production (Typical) |
|------|-------------|-------------------------|
| Data | Synthetic generator + seed | Years of labeled data, feature stores, entity graphs |
| Identity | Fake user profiles | KYC, device graph, behavioral biometrics |
| Rules | One `ruleBasedAnalysis` function + LLM | Hundreds of rules, champion/challenger, ML models |
| Latency / scale | Single browser, in-memory | Streaming pipelines, Kafka, Flink, regional DCs |
| Compliance | None modeled | Audit logs, model governance, explainability requirements |
| Geo | Country-level coords + flags | IP intelligence, VPN databases, impossible travel physics |
| Security | Demo credentials in code | SSO, RBAC, secrets management, encryption at rest |

**Bottom line**: FraudSense is **realistic as a UX and workflow demo** and as a **teaching tool**. Its **numeric risk scores** are plausible for storytelling but **not calibrated** on real fraud distributions.

---

## 4. High-Level Architecture

```
Browser (React)
    │
    ├── Zustand store (transactions, alerts, stats, simulator settings)
    │
    ├── useTransactionSimulator → generateTransaction() on an interval
    │
    ├── useFraudAnalysis → POST /api/analyze-transaction (or rules fallback)
    │
    └── UI: Dashboard, Transactions, Alerts, Analytics, Settings, Investigate

Next.js API Routes (Node runtime)
    ├── /api/analyze-transaction  — single txn → AnalysisResult (OpenAI or rules)
    ├── /api/batch-analyze       — up to 20 txns, sequential OpenAI/rule per item
    ├── /api/investigate         — chat + reportMode markdown report
    └── /api/auth/[...nextauth]  — credentials JWT sessions

External
    └── OpenAI API (optional): gpt-4o-mini
```

---

## 5. Application Flow (Step by Step)

1. **User logs in** via NextAuth credentials (`/login`).
2. **`DashboardEffects`** mounts on every dashboard page:
   - Starts **`useTransactionSimulator`**: every `simulatorSpeed` ms (min 500), generates one transaction and **`addTransaction`**.
   - Starts **`useFraudAnalysis`**: finds `PENDING` & not analyzed; queues IDs; calls **`/api/analyze-transaction`** with concurrency 2.
3. **Generator** may attach **`flagReasons`** and a **preliminary `riskScore`** from heuristics.
4. **API** returns **`AnalysisResult`**: `riskScore`, `riskLevel`, `flagReasons`, `explanation`, `recommendation`, `confidence`, `detectedPatterns`.
5. **`applyAnalysis`** maps recommendation → **`TransactionStatus`** (`BLOCK` → `BLOCKED`, etc.).
6. If **`autoBlockCritical`** and risk is **`CRITICAL`**, status may become **`BLOCKED`**.
7. High risk can create **`FraudAlert`** entries; dashboard toasts on critical flag transitions.

---

## 6. Data Model (Types)

### Transaction (`types/index.ts`)

Core fields the UI and APIs use:

| Field | Role |
|-------|------|
| `id` | Unique transaction id (e.g. `TXN-ABC123`) |
| `timestamp` | Event time |
| `amount`, `currency` | Monetary value (simulated USD) |
| `merchantName`, `merchantCategory`, `merchantCountry`, `merchantCity` | Merchant context |
| `cardLast4` | Last four digits |
| `userId`, `userName`, `userEmail`, `userLocation` | Payer identity (synthetic) |
| `ipAddress` | Simulated; VPN uses `185.220.` prefix |
| `deviceFingerprint` | String token |
| `isNewDevice`, `isVPN` | Boolean signals |
| `velocityCount` | “Transactions in last hour” style counter |
| `riskScore`, `riskLevel` | 0–100 + `CRITICAL`/`HIGH`/`MEDIUM`/`LOW`/`SAFE` |
| `status` | `PENDING` → then `FLAGGED`, `REVIEWING`, `CLEARED`, `BLOCKED` |
| `flagReasons` | String codes (see Fraud Flags) |
| `aiExplanation`, `isAnalyzed` | Post-analysis narrative |
| `aiConfidence`, `detectedPatterns`, `recommendation` | Optional enriched fields |
| `lat`, `lng` | Map plotting |

### AnalysisResult

Returned by API / applied to store:

- `riskScore` (0–100), `riskLevel`, `flagReasons[]`, `explanation`, `recommendation` (`BLOCK` | `FLAG` | `REVIEW` | `CLEAR`), `confidence` (0–100), `detectedPatterns[]`.

### FraudAlert

- Links to `transactionId`, has `alertType` (velocity, geo, amount, device, VPN, pattern), `severity`, acknowledgement.

### DashboardStats

- Totals, flagged/blocked/cleared counts, `totalAmountProtected` (sum of **blocked** amounts), `fraudRate`, `avgRiskScore`, `alertsActive`.

### SimulatorSettings

Stored in Zustand; controls simulation and UI thresholds (see Parameters).

---

## 7. Fraud Flags & Rule Engine

### Flag codes (`lib/fraud-patterns.ts`)

`GEO_ANOMALY`, `VELOCITY_EXCEEDED`, `CARD_TESTING_SUSPECTED`, `AMOUNT_3X_AVERAGE`, `UNUSUAL_CATEGORY`, `VPN_DETECTED`, `PROXY_IP`, `NEW_DEVICE`, `OFF_HOURS_ACTIVITY`, `CARD_TESTING_PATTERN`, `PATTERN_MATCH`.

### Rule-based scoring (`lib/fraud-scoring.ts`)

Starts from base score **10**, then adds (non-exclusive, capped 0–100):

| Condition | Score bump (approx.) |
|-----------|----------------------|
| `GEO_ANOMALY` | +28 |
| `VELOCITY_EXCEEDED` | +22 |
| `CARD_TESTING_PATTERN` | +20 |
| `AMOUNT_3X_AVERAGE` | +18 |
| `PATTERN_MATCH` | +15 |
| `VPN_DETECTED` or `PROXY_IP` | +12 |
| `NEW_DEVICE` | +8 |
| `CARD_TESTING_SUSPECTED` | +10 |
| `OFF_HOURS_ACTIVITY` | +6 |
| `UNUSUAL_CATEGORY` | +6 |
| `velocityCount * 2` (cap +25) | dynamic |
| `isVPN` | +8 |
| `isNewDevice` | +5 |
| `amount > 5000` | +10 |
| `amount > 10000` | +8 |

**Risk bands** (same as OpenAI prompt): 81+ CRITICAL, 61–80 HIGH, 41–60 MEDIUM, 21–40 LOW, 0–20 SAFE.

**Recommendations** from rules: CRITICAL → `BLOCK`, HIGH → `FLAG`, MEDIUM → `REVIEW`, else `CLEAR`.

**Confidence** (rules): `55 + min(30, flags.length * 5)`.

---

## 8. Transaction Generator (`lib/transaction-generator.ts`)

### User profiles

~20 synthetic users with `homeCountry`, typical amount ranges, category preferences, and `riskProfile` (`low` | `medium` | `high`).

### Merchants

Many named merchants with `TransactionCategory` and allowed `countries`.

### Fraud roll

- `fraudRoll = random * 100 < min(95, 30 + fraudRateBias * 0.5)`  
  So **`fraudRateBias`** (0–80 in UI) materially increases suspicious transaction probability.

### Pattern injection

If fraud wins and at least one pattern toggle is on, one pattern is chosen at random among enabled: **GEO, VEL, AMT, VPN, DEV, CARD**.

Examples:

- **GEO**: Merchant country from “risky” list vs. home; `GEO_ANOMALY`, new device forced.
- **VEL**: High `velocityCount`, small amounts; `VELOCITY_EXCEEDED`, `CARD_TESTING_SUSPECTED`.
- **AMT**: Wire/crypto merchant, large amount; `AMOUNT_3X_AVERAGE`, `UNUSUAL_CATEGORY`.
- **VPN**: `VPN_DETECTED`, `PROXY_IP`.
- **DEV**: `NEW_DEVICE`, sometimes `OFF_HOURS_ACTIVITY` when the transaction is generated with **UTC hour between 2 and 5** (inclusive).
- **CARD**: Tiny amounts, velocity; `CARD_TESTING_PATTERN`, `VELOCITY_EXCEEDED`.

### Preliminary score in generator

`min(100, flagReasons.length * 22 + velocityCount * 3 + VPN bonus)` — used **before** API analysis; API/rules may replace it via `applyAnalysis`.

### Named scenarios

| Key | Function | Narrative |
|-----|----------|-----------|
| Skimming | `generateCardSkimmingBurst` | 8 rapid small POS txns, same card last4, high risk |
| ATO | `generateAccountTakeoverSequence` | Benign txn then foreign wire + crypto, new device/VPN |
| Ring | `generateFraudRingScenario` | Multiple users, same international merchant, `PATTERN_MATCH` |
| False positive travel | `generateFalsePositiveTravelScenario` | US → UK → JP; later txns get `GEO_ANOMALY` to show borderline cases |

---

## 9. AI Layer (OpenAI)

### When it runs

- `getOpenAI()` reads **`process.env.OPENAI_API_KEY`**. If missing, all AI paths use **rules**.

### Models & parameters

| Route | Model | Notable parameters |
|-------|--------|-------------------|
| `/api/analyze-transaction` | `gpt-4o-mini` | `temperature: 0.2`, `max_tokens: 500`, `maxDuration` 25s |
| `/api/batch-analyze` | `gpt-4o-mini` | `temperature: 0.2`, `max_tokens: 400`, up to **20** txns |
| `/api/investigate` (chat) | `gpt-4o-mini` | System persona as senior analyst; streaming optional |
| `/api/investigate` (`reportMode`) | `gpt-4o-mini` | `temperature: 0.3`, `max_tokens: 2500`, markdown sections |

### Prompt contract (single analyze)

The model must return **only JSON** with keys matching `AnalysisResult`. The server strips optional markdown fences and validates numeric/string fields; on failure → **`ruleBasedAnalysis(txn)`**.

### Investigator (`/api/investigate`)

- **System prompt**: FraudSense AI, 15 years experience, data-driven, decisive; claims all data is provided.
- **Report mode**: Asks for Executive Summary, Transaction Details, Risk Assessment, Fraud Indicators, User History Analysis, Recommendation, Confidence Level.

---

## 10. Authentication (`lib/auth.config.ts`)

- **Provider**: NextAuth **Credentials** (JWT sessions, 24h).
- **Users** (hardcoded for demo):

  - `admin@fraudsense.ai` / `demo2024`
- `analyst@fraudsense.ai` / `demo2024`

- **Roles**: `admin` | `analyst` stored on JWT/session.
- **`NEXTAUTH_SECRET`**: required for signing sessions.
- **`NEXTAUTH_URL`**: base URL (local or production).

---

## 11. State Management (`store/useTransactionStore.ts`)

- **Library**: Zustand + **`persist`** middleware.
- **Persisted** (localStorage key `fraudsense-sim`): `simulatorSpeed`, `fraudRateBias`, `simulatorSettings` only — **not** the full transaction list (resets to seed on fresh load except those knobs).
- **Caps**: `MAX_TX` = **500** transactions kept; **200** alerts max.
- **`minuteBuckets`**: rolling ~60 one-minute buckets for charts (total vs fraud counts).

---

## 12. Environment Variables (`.env.example`)

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Enables GPT-backed analyze / investigate / batch |
| `NEXTAUTH_SECRET` | Session encryption/signing |
| `NEXTAUTH_URL` | Canonical app URL for NextAuth |

Never commit real keys; use `.env.local` locally (gitignored).

---

## 13. Simulator & Settings Parameters (Complete)

### Store defaults (`useTransactionStore`)

| Parameter | Default | Meaning |
|-----------|---------|---------|
| `isSimulatorRunning` | `true` | Interval generator on |
| `simulatorSpeed` | `2500` | ms between synthetic txns (slider 500–10000) |
| `fraudRateBias` | `30` | Pushes fraud probability (slider 0–80) |

### SimulatorSettings defaults

| Parameter | Default | Meaning |
|-----------|---------|---------|
| `velocityThreshold` | `5` | Shown in Settings (txns/hr alert concept) |
| `highAmountThreshold` | `5000` | USD-style threshold in UI |
| `geoAnomalyKm` | `500` | Distance concept for geo alerts in UI |
| `autoBlockCritical` | `true` | Auto-`BLOCKED` when CRITICAL / policy match |
| `patternVelocity` … `patternCardTesting` | all `true` | Which fraud patterns the generator may use |
| `amountMin` / `amountMax` | `5` / `15000` | Clamp generated amounts |
| `animationSpeed` | `"normal"` | UI motion preference |
| `soundEnabled` | `false` | Sound toggle |

**Implementation note**: The generator consumes **pattern toggles**, **`fraudRateBias`**, **`amountMin`/`amountMax`**, and **recent transactions** (for velocity counts). The **velocity / high-amount / geo km** sliders are **defined in types and Settings UI**; they are **not** referenced inside `lib/transaction-generator.ts` today—so they are **demo configuration placeholders** unless wired later.

### Keyboard shortcut

- **Space** (when not typing in an input): toggle simulator run/pause (`DashboardEffects`).

---

## 14. API Summary

| Method & path | Body | Response |
|---------------|------|----------|
| `POST /api/analyze-transaction` | `{ transaction }` | `AnalysisResult` |
| `POST /api/batch-analyze` | `{ transactions }` | `{ results: { id, result }[] }` (max 20) |
| `POST /api/investigate` | `transaction`, `messages`, optional `stream`, `reportMode` | Chat text or `{ report }` |
| `GET/POST /api/auth/*` | NextAuth | Session cookies |

---

## 15. Frontend Routes (App Router)

- `/login` — authentication
- `/` (dashboard home) — stats, map, charts, feed
- `/transactions` — table / exploration
- `/alerts` — alert queue
- `/analytics` — analytics view
- `/investigate` — AI investigator
- `/settings` — simulator, scenarios, thresholds, pattern toggles

Layout: sidebar, top bar, mobile nav, `DashboardEffects` for global sim + analysis.

---

## 16. Tech Stack (from `package.json`)

- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, tailwindcss-animate, typography plugin
- **UI primitives**: Radix UI (dialog, dropdown, tabs, etc.), class-variance-authority, lucide icons
- **Motion**: Framer Motion
- **Charts**: Recharts
- **Maps**: react-simple-maps
- **State**: Zustand
- **Auth**: next-auth v4
- **AI**: `openai` SDK
- **Toasts**: Sonner
- **Dates**: date-fns

---

## 17. What “Success” Looks Like for a Demo User

1. See transactions appear on a timer.
2. Watch risk scores and statuses update after analysis.
3. Trigger **International account takeover** or **Card skimming** from Settings and see the board light up.
4. Open a hot transaction → **AI Risk Analysis** tab with explanation.
5. Use **AI Investigator** and optional **report**.
6. Review **Analytics** and **Alerts**.

---

## 18. Extending Toward Production (If This Were Real)

- Persist events to **PostgreSQL / ClickHouse / BigQuery**.
- Replace hardcoded auth with **enterprise IdP** and fine-grained RBAC.
- Train **calibrated models** on labeled fraud; keep rules for explainability.
- Integrate **real IP/device** vendors and **case management**.
- Add **audit trails** for every model version and analyst action.
- Run **shadow mode** before blocking live money movement.

---

## 19. Document Maintenance

This file was authored to describe the application **as implemented in the repository**. If you change generator logic, API models, or environment variables, update this document in the same commit so it stays the **single “Everything” reference**.

---

*End of Everything.*
