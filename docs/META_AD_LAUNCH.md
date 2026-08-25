# Meta Ad Launch (Wave C) — CTWA Advantage+ from Growlab

Merchant path: `/dashboard/ads` after Ad Coach approval.

## Flow

1. Connect **WhatsApp** (`/dashboard/channels`).
2. Connect **Meta Ad Account** (Facebook Login scopes: `ads_management`, `ads_read`, `business_management`, `pages_show_list`, `pages_read_engagement`).
3. Analyze + **approve** creative (Wave A).
4. Set daily budget + public https image URL + tick spend confirmation.
5. Growlab Marketing API creates:
   - Campaign `OUTCOME_ENGAGEMENT`
   - Ad Set: `destination_type: WHATSAPP`, Advantage audience, automatic placements (FB + IG)
   - Creative + Ad with `WHATSAPP_MESSAGE` CTA → connected number
6. Objects are set **ACTIVE** (Meta review still applies). Pause/resume from Growlab.

## Env

```
NEXT_PUBLIC_META_APP_ID=
META_APP_SECRET=
META_TOKEN_ENCRYPTION_KEY=
META_GRAPH_VERSION=v21.0
# Local UI without calling Graph create APIs:
META_ADS_DRY_RUN=true
```

## App Review (production)

Request Advanced Access for:

- `ads_management`
- `ads_read`
- (already for WA) WhatsApp messaging permissions

Ad account must have a payment method in Meta Business Suite.

## Safety gates

- `confirmSpend: true` required
- Daily budget 1–500 (account currency units)
- Draft must be `approved` or `exported`
- WhatsApp + Ad Account both `active`
- Facebook Page selected (picker after connect / refresh)

## Merchant UX polish

- After connect: pick **Ad Account** + **Facebook Page** if several exist
- Launch creative image: paste https URL **or** tap a product media thumbnail
- Pause / resume from Growlab without Ads Manager

## Related

- [META_AD_AGENT.md](./META_AD_AGENT.md) — copy audit
- [META_CONNECT.md](./META_CONNECT.md) — WhatsApp Embedded Signup
