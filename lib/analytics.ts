type EventProps = Record<string, string | number | boolean | undefined>;

/** Local analytics helper. Amplitude SDK is not installed yet; events stay in the console until a key is wired. */
export function track(eventName: string, properties?: EventProps) {
  if (typeof window === "undefined") return;
  const payload = { eventName, properties, ts: Date.now() };
  window.dispatchEvent(new CustomEvent("growlab:track", { detail: payload }));
  if (process.env.NODE_ENV === "development") {
    console.debug("[growlab:track]", eventName, properties ?? {});
  }
}
