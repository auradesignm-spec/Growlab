# Meta Connect (Wave 1) — Ops checklist

Growlab onboard merchants via **WhatsApp Embedded Signup v4** and receives Click-to-WhatsApp chats on `/api/meta/whatsapp/webhook`.

## Meta App Dashboard

1. Create a **Business** type app at [developers.facebook.com](https://developers.facebook.com/).
2. Add the **WhatsApp** product.
3. Under **Facebook Login for Business → Configurations**, create an **Embedded Signup** configuration (v4) with **Cloud API** selected. Copy the config id → `META_EMBEDDED_SIGNUP_CONFIG_ID`.
4. Copy App ID → `NEXT_PUBLIC_META_APP_ID` and App Secret → `META_APP_SECRET`.
5. Set a random verify string → `META_WEBHOOK_VERIFY_TOKEN`.
6. Set a long random string (≥32 chars) → `META_TOKEN_ENCRYPTION_KEY`.
7. Webhook callback URL (production HTTPS):

   `https://YOUR_DOMAIN/api/meta/whatsapp/webhook`

   Subscribe fields: `messages`.

8. In **Development** mode only app roles can complete Embedded Signup. For real merchants, request **Advanced Access** for:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`
9. Wave 2 (later): `whatsapp_business_manage_events` for CTWA Conversions API.

## Merchant flow

1. Merchant opens `/dashboard/channels`.
2. Clicks **Connect WhatsApp** → Embedded Signup.
3. Growlab stores WABA + phone number id + encrypted token.
4. CTWA Instagram ads using that number land in Growlab as `InterestLead` rows (with `ctwa_clid` when Meta sends referral on the first message).

## Local testing

- Use a tunnel (e.g. Cloudflare Tunnel / ngrok) so Meta can POST to your webhook.
- Add yourself as a Meta App tester/developer.
- Point Ads Manager CTWA destination at the connected WhatsApp number.

## Wave 2 backlog

See [docs/META_CONNECT_WAVE2.md](./META_CONNECT_WAVE2.md).

## Wave 2

CAPI on collected cash + recovery nudges: [docs/META_CONNECT_WAVE2.md](./META_CONNECT_WAVE2.md).

Ad copy audit + CTWA launch (no Ads Manager): [docs/META_AD_AGENT.md](./META_AD_AGENT.md) and [docs/META_AD_LAUNCH.md](./META_AD_LAUNCH.md) — `/dashboard/ads`.
