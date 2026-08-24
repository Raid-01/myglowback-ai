# MyGlowBack.AI

B2B SaaS skincare recommendation engine for clinics — built from your spec with Next.js 14
(App Router), Prisma + PostgreSQL, NextAuth, and Paystack.

## Documentation hygiene — a standing rule, not a suggestion

**Whenever a feature moves from "planned"/"not yet built" to actually done, search every
doc in this repo for other mentions of that same status before considering the task finished.**
This project has repeatedly hit the same bug: a doc says "not yet built" once, early, the
feature gets built several sessions later, and that original sentence never gets revised —
so two docs end up contradicting each other and whoever reads them next (a person, or a fresh
Claude session with no memory of the work) can't tell which one is true.

Concretely, before ending any turn that finishes a real feature: `grep -rn "not yet\|coming
soon\|hasn't been\|unconfirmed\|TODO" *.md` across this repo's root-level docs, and fix every
hit that's now stale — not just the one entry that prompted the change. This is Claude's job to
do automatically, not something the person using this project should have to remember to ask
for or know how to check themselves.

## Current status (update this as things change)

0. **Hydroquinone correction confirmed and propagated everywhere.** Re-verified directly against
   Nigeria's Minister of Health's own on-record 2025 statement plus a July 2026 industry source:
   2% hydroquinone is genuinely OTC in Nigeria — my earlier "prescription-tier only" framing was
   too conservative. `rules-data.ts` and `MASTER_ALGORITHM.md` already had this corrected from
   earlier in this project; the real gap found was that `seed-rules.sql` — the file actually
   pasted into Neon — was **stale**, generated before that correction. Regenerated. **If you
   already ran the old version of that file, re-run the new one** to get 2% hydroquinone into the
   live rule set.
0. **`AssessmentForm.tsx` refactored** — 882 lines down to a 203-line orchestrator. All scoring
   math moved to `src/lib/assessment-scoring.ts` (pure functions, no UI), the reusable
   choice-button UI promoted to `src/components/ui/choice-group.tsx`, and each of the 8 questions
   now lives in its own file under `src/components/assessment-steps/`. To change one question,
   open its one file — nothing else needs understanding first.
0. **Rule-editing admin UI built** — `/dashboard/super-admin/rules`. Sade can now create, edit,
   and delete the actual clinical routines (concerns, severity, skin type, morning/evening steps,
   ingredients, upsells, the pharmacy-tier gate, escalation notes) through a guided form — no
   code, no JSON, changes go live immediately. Multi-line textareas split into arrays
   automatically (one item per line).
0. **Billing "Renew Now" flow rebuilt.** Clicking it now reveals the Annual plan immediately,
   highlighted, with the amount saved vs. monthly stated explicitly, going straight to Paystack
   checkout for that cycle on click. A secondary "I prefer the monthly plan" link sits below it,
   going straight to Paystack for monthly instead. `/api/paystack/initiate` now accepts an
   explicit `billingCycle` override so this works without a separate "switch cycle" step first;
   the webhook now also keeps `clinic.billingCycle` in sync with whatever was actually paid for.
   New `Sale` model actually records "sold X to patient Y for ₦Z." Staff record a sale directly
   from a patient's assessment page (next to each matched product — "Record sale" → quantity +
   amount → save). Overview now shows **today's real revenue**, linking through to
   `/dashboard/revenue` — a full report with a daily breakdown and a custom date-range picker (two
   plain date inputs, no JS needed). This is the actual "daily ROI" view. Schema fully audited
   line-by-line after this round of edits — all 13 models confirmed intact and correctly related. The clinic-facing Overview page was summing that clinic's own PAID invoices —
   which are payments *to* MyGlowBack.AI for their subscription — and mislabeling it "Revenue,"
   actively misleading a clinic owner into thinking it was their own sales. Replaced with an
   honest "Product Recommendations Made" count. **Real gap surfaced by this:** there's no actual
   sales-tracking model anywhere (nothing records a clinic selling a product to a patient) — a
   real future feature, not built yet. Separately: there was no UI at all for a Super Admin to
   verify a clinic as a licensed pharmacy — `licenseVerifiedAt` was readable by the matching
   engine but nothing could ever set it, which meant the pharmacy-tier safety-gate test scenarios
   couldn't actually be run end-to-end. Fixed with a small editor on the Super Admin page (same
   pattern as the locked-price one) — set license type, enter a PCN number, verify. See
   `TEST_SCENARIOS.md`'s new "Role-Based Access" section for the full Super
   Admin/Clinic Admin/Staff testing checklist, including the one test worth the most care:
   confirming one clinic can never see another clinic's patient data by guessing a URL.

0. **Paystack is live and confirmed working** — test payments went through end to end.
0. **Three new features built: locked per-clinic pricing, a feedback board, and Super Admin
   analytics.**
   - **Locked pricing:** `Clinic` now has `lockedAnnualPrice`/`lockedMonthlyPrice` — null means
     "use today's standard rate" (the normal case). A Super Admin sets these per clinic from the
     Super Admin page (inline editor next to each clinic row). Checkout (`/api/paystack/initiate`)
     uses the locked price when one's set. The `check-subscriptions` cron clears both fields the
     moment a subscription actually lapses — "locked as long as continuously active; a lapse means
     re-signing at the current rate" is enforced right where lapse itself is detected, not left as
     a manual step.
   - **Feedback board:** `/dashboard/feedback` — both Clinic Admins and Staff can submit and
     upvote (staff are closest to the day-to-day friction of the tool, worth hearing from
     directly). Visible across every clinic, not siloed — votes genuinely aggregate into "most
     wanted across the whole user base." One vote per person per item, toggleable.
   - **Super Admin analytics:** `/dashboard/super-admin/analytics` — trial→paid conversion rate,
     estimated MRR (accounts for locked rates), signups/assessments per week (last 8 weeks), and a
     "signed up, never ran an assessment" list — the clearest available "is this actually working
     for them" signal without needing to ask anyone directly. The main Super Admin clinic table
     also now shows a "Last Active" column highlighting clinics quiet for 14+ days — an early
     churn-risk signal, not a stated reason. **Honest limitation, noted directly on the page
     itself:** these are behavioral signals, not a real churn survey — a "why are you cancelling?"
     prompt at the point of lapse would be the natural next addition once this is in active use.
   **Not yet done:** no automated report/export exists yet beyond the on-screen dashboard.

0. **Clinical algorithm & assessment questionnaire built, real rule data
   loaded — and the sign-up form is rebuilt around it.** See
   `MASTER_ALGORITHM.md` and `ASSESSMENT_QUESTIONNAIRE.md` in the repo root.
   `prisma/rules-data.ts` contains 20 real rules covering all 5 concerns at
   Mild/Moderate/Severe (where that applies), pregnancy-safe variants
   wherever a severity-tiered rule would otherwise be blocked for a
   pregnant patient, one pharmacy-tier rule demonstrating the verification
   gate, and 4 combination rules for the most common multi-concern overlaps
   — replacing the old 5 placeholder dummy rules. `AssessmentForm.tsx` is a
   full multi-step wizard covering the whole questionnaire, wired end to
   end through to this real rule data. See `TEST_SCENARIOS.md` for a full
   QA pass — 48 scenarios covering every safety block, severity tier, and
   edge case, plus a dedicated role-based access section (Super Admin /
   Clinic Admin / Staff).
   **Action needed — loading the rules onto the live database.** The seed
   does NOT run automatically on deploy. **Render's Shell tab needs a paid
   plan** (confirmed — free tier blocks it), so use the SQL path instead:
   the repo root has `seed-rules.sql`, generated from the same rule data.
   Open Neon's SQL Editor, paste in the entire contents of that file, and
   run it. Safe to re-run any time — it upserts by rule name rather than
   duplicating rows. (If the rule content in `prisma/rules-data.ts` ever
   changes, regenerate it with `npx tsx scripts/generate-seed-sql.ts >
   seed-rules.sql` before re-pasting.)

1. **Real root cause found for signup/email flakiness: Neon connection drops, not the email code.**
   Render logs showed repeating `terminating connection due to administrator command` Postgres
   errors, timed almost exactly 5 minutes after boot — that's Neon's free-tier compute
   auto-suspending after 5 minutes idle and killing whatever connections Prisma was holding.
   Since this happens *before* the welcome-email code even runs, some signup attempts were likely
   failing at the database step, not the email step. **Fix applied:** `prisma/schema.prisma` now
   has a `directUrl`, and `.env.example`/`render.yaml` document two separate env vars —
   `DATABASE_URL` (Neon's **pooled** connection string, hostname has `-pooler` in it — routes
   through PgBouncer so the app survives Neon's suspend/resume cycle) and `DIRECT_URL` (Neon's
   plain connection string, used only by `prisma db push` during build). **Action needed:** in
   Neon's console, click Connect and copy both the pooled and direct connection strings, then set
   both `DATABASE_URL` and `DIRECT_URL` in Render's Environment tab accordingly, and redeploy.
   ~~Confirmed fixed~~ — signup, login, and dashboard all working after the redeploy on Jul 30.
2. ~~Resend domain still unverified~~ — still true (Domains page shows "No domains yet", so the
   account is in sandbox mode), but **email sending itself is now confirmed working** — a fresh
   signup on Jul 31 delivered the welcome email successfully. Verify a sending domain in Resend
   (needs DNS access) when ready to send to real clinic emails instead of just the Resend account's
   own address.
3. ~~Dashboard sidebar nav invisible on mobile~~ — **fixed, but had a bug in the first pass that's
   now corrected.** The original mobile-nav fix exported an icon lookup object (`ICON_MAP`) from
   `MobileNav.tsx` (a `'use client'` file) and imported it into `dashboard/layout.tsx` (a Server
   Component) for the desktop sidebar. That's not allowed — a Server Component can reference a
   client *component* (e.g. `<MobileNav />`) but not reach into a plain object of components a
   client file exports and index into it (`ICON_MAP[icon]`). It crashed every single dashboard
   page load with `Could not find the module "...MobileNav.tsx#ICON_MAP#..." in the React Client
   Manifest` — this is what caused the "Application error" page on login. **Fix:** the desktop
   sidebar now has its own local icon map (`SERVER_ICON_MAP` in `layout.tsx`) built from direct
   `lucide-react` imports; `MobileNav.tsx` keeps its own map privately and no longer exports it.
4. **Reply-to added.** The welcome/payment/renewal emails were sending from Resend's shared
   sandbox address (`onboarding@resend.dev`, used automatically since no domain is verified yet)
   with no reply-to set — so "Just reply to this email" went nowhere. `email.ts` now sends a
   `reply_to` header on every email, pulled from a new `EMAIL_REPLY_TO` env var. **Action needed:**
   add `EMAIL_REPLY_TO` to Render's Environment tab (currently `pillsrx01@gmail.com`), same
   Save-rebuild-and-deploy flow as before.

**Confirmed working end-to-end (tested live, not just built):** signup → 14-day trial created
correctly → billing page shows correct trial status → Paystack checkout → real payment confirmed
→ subscription extended correctly. Full multi-step assessment flow walked through and used
repeatedly, not just reachable via direct URL.

**Live infrastructure:**
- Code: GitHub — `Raid-01/myglowback-ai`
- Hosting: Render (free tier) — `https://myglowback-ai.onrender.com`
- Database: Neon (free tier, pooled connection), connected and working
- Email: Resend, HTTP API — **confirmed delivering**, including reply-to routing
- Payments: Paystack — **confirmed live, test payment went through end to end**, webhook
  idempotency handled
- Daily cron (trial expiry + reminder emails, and clearing a lapsed clinic's locked price):
  **status not confirmed as of the last working session** — code is built and ready at
  `/api/cron/check-subscriptions`, a cron-job.org walkthrough was given, but there's no
  confirmation in this document that the daily ping was actually set up. **Verify this
  directly** rather than assume either way — check cron-job.org's dashboard for a job pointed
  at that URL.

**Product features live:** 14-day free trial on signup, welcome + payment-confirmation emails
(confirmed delivering), all 12 spec pages, PDF generation for invoices and prescriptions,
role-based permissions (Clinic Admin vs. Staff vs. Super Admin).

**Rule data is real, not a placeholder.** `prisma/rules-data.ts` has 20 real `SkincareRule` rows —
confirmed directly against the file — covering all 5 concerns at Mild/Moderate/Severe where that
applies, pregnancy-safe variants, the pharmacy-verification-gated rule, and the 4 combination
rules. This replaced the old 5-row placeholder set. `src/lib/matching-engine.ts` doesn't need to
change if the rule content changes again, only the data.

**Not yet done:** final brand colors — `tailwind.config.ts`'s sage/ivory/honey tokens are a
placeholder direction, not locked-in branding. A UI redesign using that same placeholder palette
started on the shared component kit (`src/components/ui/`); pages haven't been touched yet.
Also still open: the PillsRx subdomain for email, and Paystack live-mode keys (needs business/bank
verification with Paystack — test keys are already configured and confirmed working, see "Live
infrastructure" above).

## What's included

All 12 pages/features from the brief, in priority order: landing page with pricing calculator,
auth (email/password + Google), sign-up flow, dashboard with renewal banner, billing center with
PDF invoices, the exact reminder popup logic, the midnight Lagos cron job, the assessment form
covering the 5 core concerns, prescription output with PDF generation, inventory CRUD,
patient management with search, and the Super Admin view. Plus the public booking portal
("Clinic unavailable" state) mentioned in the service-cessation section.

The Prisma schema is your exact schema, with two additions needed for it to actually validate —
Prisma requires both sides of a relation to be declared, and a couple were only declared on one
side (see the comment at the top of `prisma/schema.prisma`).

## Getting started

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL at minimum to run locally
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

Seeded logins (password for all: `ChangeMe123!`):
- Super admin: `admin@myglowback.ai`
- Clinic admin: `admin@glowhausclinic.ng`
- Staff: `staff@glowhausclinic.ng`

Swap the dummy `SkincareRule` rows in `prisma/seed.ts` for your real guide whenever you're ready —
`src/lib/matching-engine.ts` doesn't need to change, it just reads whatever's in that table.

## Judgment calls I made (spec didn't fully specify these)

- **Paystack integration** is done via direct REST calls (`src/lib/paystack.ts`) rather than an
  npm SDK — there isn't a single official one, and REST keeps it dependency-light.
- **PDF generation** uses `@react-pdf/renderer` for both invoices and the prescription output.
- **Cron** uses Vercel Cron (`vercel.json`, `0 23 * * *` UTC = midnight Lagos, since Lagos has no
  DST) hitting `/api/cron/check-subscriptions`, rather than `node-cron` — `node-cron` needs a
  long-running process, which doesn't fit a serverless Next.js deploy. If you're self-hosting on a
  persistent server instead of Vercel, swap this for `node-cron` calling the same logic.
- **"Start Free Trial" vs. the billing model**: the landing page CTA says "Start Free Trial," but
  the schema has no trial concept — sign-up creates a real subscription (`isActive: true`)
  immediately with an `UNPAID` first invoice, and the new admin is dropped on the Billing page to
  complete payment. Dashboard access isn't gated on that first payment; only the cron job's
  `subscriptionEnd` check locks anyone out. If you want a harder paywall before the first payment,
  that's a small change to the billing page.
- **UI kit**: hand-built minimal Button/Card/Input/Select/Badge components instead of pulling in
  shadcn/ui via its CLI, since that needs an interactive setup step. They're styled to the same
  spirit (rounded, soft-shadow) so swapping to real shadcn later is a drop-in change if you want it.
- **Design direction**: sage green / warm ivory / honey gold, Fraunces (display) + Inter (body) —
  matches "clean medical/spa aesthetic, soft greens, whites, beige" while avoiding the generic
  cream+terracotta look a lot of AI-generated UIs default to.
- **Renewal extension math**: on successful payment, the new `subscriptionEnd` extends from the
  *current* end date if renewing early (so paid-for time isn't lost), or from *today* if the
  subscription had already lapsed.
- **"Switch Billing Cycle only at renewal time"** is implemented as: allowed once 10 days or fewer
  remain, or after lapsing. Adjust the window in `src/app/api/clinic/billing-cycle/route.ts` if you
  meant something stricter (e.g. only in the 24 hours right after a renewal payment).

## Deploying — free to host, safe to sell on

**Vercel's free Hobby plan explicitly prohibits commercial/revenue-generating use in its
Terms of Service** — the moment you take a paying clinic, you're technically in violation. Since
this app exists to be sold, don't deploy it there on the free tier. `vercel.json` is left in the
repo in case you ever move to Vercel Pro ($20/mo, no such restriction), but the default path below
avoids that problem entirely and costs nothing to start:

| Piece | Service | Why |
|---|---|---|
| App hosting | **Render**, free Web Service | Real Node.js runtime (bcryptjs, nodemailer, @react-pdf/renderer all need this — not an edge runtime), free tier permits commercial use. Trade-off: spins down after 15 min idle, ~1 min cold start on the next visit. `render.yaml` in this repo is a one-click Blueprint. |
| Database | **Neon**, free plan | Permanent free Postgres (not a trial), 0.5 GB storage, commercial use allowed, scales to zero when idle. Grab the connection string from your Neon project and drop it into `DATABASE_URL`. |
| Email | **Resend**, free plan | 3,000 emails/month, 100/day — plenty for reminder emails at pilot-clinic scale. Verify a sending domain, then use SMTP credentials from Resend in the `EMAIL_SERVER_*` vars. |
| Daily cron | **cron-job.org** (free) hitting `/api/cron/check-subscriptions` | Works regardless of host, so it's not a lock-in decision. Set it for 23:00 UTC daily. |
| Domain | Render's free `.onrender.com` subdomain to start | Fine for a pilot with 1–2 clinics. A real domain (~$10–15/year on Namecheap or similar) is worth it once you're actually selling — it's a B2B tool, and a URL like `app.myglowback.ai` reads a lot more trustworthy to a clinic owner than `myglowback-ai.onrender.com`. |

**Steps:** push this repo to GitHub → create a Neon project, copy its connection string → on
Render, "New Blueprint," point it at the repo, paste in the env vars from `.env.example` (Neon's
URL, Resend's key, your Paystack test keys) → set up the cron-job.org ping → done. All in free
tiers until you have a paying clinic, at which point ₦450,000/year from a single Annual customer
covers Render's $7/mo Starter (removes the cold start) for the next several years.

## Not done / needs real credentials before it's live

- Google OAuth credentials — not yet configured (in `.env.example`). Paystack keys and email are
  **not** on this list anymore: Paystack test keys are confirmed live with a real payment
  end-to-end, and email is confirmed delivering — see "Live infrastructure" above. Only Paystack
  **live-mode** keys remain genuinely pending (needs business/bank verification with Paystack).
- No automated tests were written given the scope; I'd recommend at minimum covering the matching
  engine and the cron job's checkpoint logic before this handles real clinic data.
- `npm install` now confirmed working directly (installed cleanly), and a full TypeScript
  type-check ran clean aside from pre-existing gaps unrelated to any recent change — loose
  implicit-`any` typing scattered across several page files, and `@prisma/client` types that only
  resolve after `prisma generate` is run against a real `DATABASE_URL`. Worth tightening at some
  point, not urgent. A full `npm run build` against real environment variables still hasn't been
  run — worth doing on your machine or Render as a first sanity check.
