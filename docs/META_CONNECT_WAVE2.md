# Meta Connect — Wave 2 (CAPI + Recovery)

Built on Wave 1 (`MetaConnection` + `InterestLead` + Embedded Signup + webhook + first auto-reply).

## Implemented

### Conversions API for Business Messaging (CTWA)

- Lazy dataset: `POST /{waba_id}/dataset` → stored on `MetaConnection.datasetId`
- `LeadSubmitted` once when a lead has a real `ctwa_clid` (first ad chat)
- `Purchase` when an order becomes **`fulfilled`** (cash collected) and buyer phone matches an InterestLead
- Payload uses `action_source: business_messaging` + `messaging_channel: whatsapp`
- Code: `lib/meta/capi.ts` · wired from webhook + `lib/shop/orderTransition.ts`

### Recovery sequences

- On new chat: schedule +1h nudge
- Endpoint: `GET/POST /api/cron/meta-recovery` (Bearer `CRON_SECRET` or `META_RECOVERY_CRON_SECRET`)
- Run every **10–15 minutes** (needed for +1h / +6h nudges and 30-minute error backoff).
- **Vercel Hobby** does not allow Cron Jobs more than once per day, so `vercel.json` has no crons.
- Production schedule: GitHub Action `.github/workflows/meta-recovery.yml` (`*/15 * * * *`). Set repo secrets `GROWLAB_APP_URL` and `CRON_SECRET` (same value as on Vercel). Or ping the URL from [cron-job.org](https://cron-job.org).
- Vercel **Pro** can instead put `"schedule": "*/15 * * * *"` back in `vercel.json`.
- Free-form only inside the **24h** customer-care window
- Stops on: `نعم` / reject / collected Purchase / window expiry
- Merchant edits texts on `/dashboard/channels`

### نعم intent

- Inbound `نعم` / `yes` → lead status `interested`, recovery stopped, consent flagged

## Env

```
META_CAPI_DRY_RUN=true   # simulate CAPI without Graph writes
CRON_SECRET=...          # authorize /api/cron/meta-recovery
```

## App Review

Advanced Access: `whatsapp_business_manage_events` (often auto-approved if messaging is already advanced).

## Still later

- Marketing templates after 24h window
- Draft COD order from chat → full Order create
- Instagram DM into the same InterestLead bank
- Loss autopsy LLM

See also: [META_AD_LAUNCH.md](./META_AD_LAUNCH.md), [META_CONNECT.md](./META_CONNECT.md).
