# Ad Coach (Wave A) — copy audit with approval gate

Merchant path: `/dashboard/ads`.

## What this wave does

1. Merchant pastes hook, caption, spoken script, and on-screen visual hook.
2. Growlab scores psychology + Meta Click-to-WhatsApp fit (heuristics always; OpenAI `gpt-4o-mini` when `OPENAI_API_KEY` is set).
3. Scores and suggested copy are stored as `AdCreativeDraft`.
4. Merchant **approves** (or rejects). **Apply to form** copies suggestions into the editable fields and marks the draft `exported`.

This does **not** (Wave A alone):

- Create or pause Meta campaigns without Wave C UI
- Spend without the merchant budget + confirmSpend gate

## Wave C

One-click CTWA Advantage+ launch: [docs/META_AD_LAUNCH.md](./META_AD_LAUNCH.md).

## Ops

- Optional: `OPENAI_API_KEY` (and `OPENAI_MODEL`, default `gpt-4o-mini`). Without it, analysis still runs locally.
- WhatsApp connect at `/dashboard/channels` improves context (lead counts + CTWA vs organic) but is not required to analyze copy.
- Launch requires WhatsApp + Ad Account; set `META_ADS_DRY_RUN=true` for local simulation.
