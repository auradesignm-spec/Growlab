export function metaConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_META_APP_ID?.trim() &&
      process.env.META_APP_SECRET?.trim() &&
      process.env.META_EMBEDDED_SIGNUP_CONFIG_ID?.trim() &&
      process.env.META_TOKEN_ENCRYPTION_KEY?.trim(),
  );
}

export function metaWebhookConfigured(): boolean {
  return Boolean(process.env.META_WEBHOOK_VERIFY_TOKEN?.trim() && metaConfigured());
}

export function graphVersion(): string {
  return process.env.META_GRAPH_VERSION?.trim() || "v21.0";
}

export function graphBase(): string {
  return `https://graph.facebook.com/${graphVersion()}`;
}

export function metaAdsDryRun(): boolean {
  // Local without a Meta App ID: simulate connect/launch so merchants can walk the flow.
  if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_META_APP_ID?.trim()) {
    return true;
  }
  const v = process.env.META_ADS_DRY_RUN?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function publicMetaClientConfig() {
  return {
    configured: metaConfigured(),
    appId: process.env.NEXT_PUBLIC_META_APP_ID?.trim() ?? "",
    configId: process.env.META_EMBEDDED_SIGNUP_CONFIG_ID?.trim() ?? "",
    adsDryRun: metaAdsDryRun(),
  };
}
