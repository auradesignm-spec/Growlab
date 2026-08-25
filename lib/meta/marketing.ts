/**
 * Meta Marketing API — Wave C CTWA Advantage+ launch.
 * Creates Campaign → Ad Set (auto placements) → Creative → Ad.
 * Does not spend until merchant confirms budget and status ACTIVE is set.
 */

import { decryptSecret, encryptSecret } from "@/lib/meta/crypto";
import { graphBase, metaAdsDryRun, metaConfigured } from "@/lib/meta/config";

export { metaAdsDryRun };

type GraphError = { error?: { message?: string; error_user_msg?: string } };

export type MetaAdAccountOption = {
  id: string;
  name: string;
  currency: string;
  currencyOffset: number;
  accountStatus: number;
};

export type LaunchCtwaInput = {
  accessToken: string;
  adAccountId: string;
  currencyOffset: number;
  pageId: string;
  whatsappDisplayPhone: string;
  dailyBudgetOmr: number;
  countries: string[];
  headline: string;
  primaryText: string;
  imageUrl: string;
  campaignName: string;
};

export type LaunchCtwaResult = {
  campaignId: string;
  adsetId: string;
  creativeId: string;
  adId: string;
  imageHash: string;
  dailyBudgetMinor: number;
  dryRun: boolean;
};

function actPath(adAccountId: string): string {
  const id = adAccountId.replace(/^act_/, "");
  return `/act_${id}`;
}

function digitsPhone(display: string): string {
  return display.replace(/[^\d]/g, "");
}

export function metaAdsLoginConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_META_APP_ID?.trim() && process.env.META_APP_SECRET?.trim());
}

async function graphGet<T>(path: string, accessToken: string): Promise<T> {
  const url = `${graphBase()}${path}${path.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const json = (await res.json()) as T & GraphError;
  if (!res.ok || json.error) {
    throw new Error(json.error?.error_user_msg || json.error?.message || `Graph GET failed (${res.status})`);
  }
  return json;
}

async function graphPost<T>(path: string, accessToken: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${graphBase()}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as T & GraphError;
  if (!res.ok || json.error) {
    throw new Error(json.error?.error_user_msg || json.error?.message || `Graph POST failed (${res.status})`);
  }
  return json;
}

/** Short-lived user token → long-lived (~60 days). */
export async function exchangeLongLivedUserToken(shortLivedToken: string): Promise<string> {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID?.trim();
  const appSecret = process.env.META_APP_SECRET?.trim();
  if (!appId || !appSecret) throw new Error("Meta app credentials are not configured.");

  const url =
    `${graphBase()}/oauth/access_token` +
    `?grant_type=fb_exchange_token` +
    `&client_id=${encodeURIComponent(appId)}` +
    `&client_secret=${encodeURIComponent(appSecret)}` +
    `&fb_exchange_token=${encodeURIComponent(shortLivedToken)}`;

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const data = (await res.json()) as { access_token?: string; error?: { message?: string } };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error?.message || "Failed to exchange long-lived Meta ads token.");
  }
  return data.access_token;
}

export async function listAdAccounts(accessToken: string): Promise<MetaAdAccountOption[]> {
  const data = await graphGet<{
    data?: Array<{
      account_id?: string;
      id?: string;
      name?: string;
      currency?: string;
      currency_offset?: number;
      account_status?: number;
    }>;
  }>(`/me/adaccounts?fields=account_id,name,currency,currency_offset,account_status&limit=50`, accessToken);

  return (data.data ?? []).map((row) => {
    const raw = (row.account_id || row.id || "").replace(/^act_/, "");
    return {
      id: raw,
      name: row.name?.trim() || raw,
      currency: row.currency?.trim() || "OMR",
      currencyOffset: Number(row.currency_offset) > 0 ? Number(row.currency_offset) : 100,
      accountStatus: Number(row.account_status ?? 1),
    };
  });
}

export async function listManagedPages(accessToken: string): Promise<Array<{ id: string; name: string }>> {
  try {
    const data = await graphGet<{ data?: Array<{ id?: string; name?: string }> }>(
      `/me/accounts?fields=id,name&limit=50`,
      accessToken,
    );
    return (data.data ?? [])
      .filter((p) => p.id)
      .map((p) => ({ id: p.id!, name: p.name?.trim() || p.id! }));
  } catch {
    return [];
  }
}

export function encryptAdsToken(token: string): string {
  return encryptSecret(token);
}

export function decryptAdsToken(enc: string): string {
  return decryptSecret(enc);
}

function toMinorUnits(amount: number, currencyOffset: number): number {
  const minor = Math.round(amount * currencyOffset);
  if (!Number.isFinite(minor) || minor < 1) {
    throw new Error("Daily budget is too low for this ad account currency.");
  }
  return minor;
}

async function uploadImageHash(
  adAccountId: string,
  accessToken: string,
  imageUrl: string,
): Promise<string> {
  const form = new URLSearchParams();
  form.set("url", imageUrl);
  form.set("access_token", accessToken);
  const res = await fetch(`${graphBase()}${actPath(adAccountId)}/adimages`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  const data = (await res.json()) as {
    images?: Record<string, { hash?: string }>;
    error?: { message?: string; error_user_msg?: string };
  };
  if (!res.ok || data.error) {
    throw new Error(data.error?.error_user_msg || data.error?.message || "Image upload to Meta failed.");
  }
  const first = Object.values(data.images ?? {})[0];
  if (!first?.hash) throw new Error("Meta did not return an image hash for the creative.");
  return first.hash;
}

/**
 * Build a Messages / WhatsApp engagement campaign with Advantage automatic placements.
 * Starts ACTIVE so Meta begins delivery after their review (merchant already confirmed budget).
 */
export async function launchCtwaAdvantageCampaign(input: LaunchCtwaInput): Promise<LaunchCtwaResult> {
  if (!metaConfigured() && !metaAdsDryRun()) {
    throw new Error("Meta is not configured on this server.");
  }

  const phone = digitsPhone(input.whatsappDisplayPhone);
  if (phone.length < 8) {
    throw new Error("Connect WhatsApp with a valid display phone before launching ads.");
  }
  if (!input.pageId.trim()) {
    throw new Error("A Facebook Page ID is required to launch WhatsApp ads.");
  }
  if (!input.imageUrl.trim().startsWith("http")) {
    throw new Error("A public https image URL is required for the ad creative.");
  }

  const dailyBudgetMinor = toMinorUnits(input.dailyBudgetOmr, input.currencyOffset);
  const countries = input.countries.length ? input.countries : ["OM"];

  if (metaAdsDryRun()) {
    const stamp = Date.now().toString(36);
    return {
      campaignId: `dry_camp_${stamp}`,
      adsetId: `dry_adset_${stamp}`,
      creativeId: `dry_cre_${stamp}`,
      adId: `dry_ad_${stamp}`,
      imageHash: `dry_hash_${stamp}`,
      dailyBudgetMinor,
      dryRun: true,
    };
  }

  const imageHash = await uploadImageHash(input.adAccountId, input.accessToken, input.imageUrl.trim());

  const campaign = await graphPost<{ id: string }>(`${actPath(input.adAccountId)}/campaigns`, input.accessToken, {
    name: input.campaignName.slice(0, 120),
    objective: "OUTCOME_ENGAGEMENT",
    status: "PAUSED",
    special_ad_categories: [],
    is_adset_budget_sharing_enabled: false,
  });

  const adset = await graphPost<{ id: string }>(`${actPath(input.adAccountId)}/adsets`, input.accessToken, {
    name: `${input.campaignName.slice(0, 80)} — set`,
    campaign_id: campaign.id,
    daily_budget: dailyBudgetMinor,
    billing_event: "IMPRESSIONS",
    optimization_goal: "CONVERSATIONS",
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    destination_type: "WHATSAPP",
    // Omit publisher_platforms → Advantage / automatic placements across FB + IG.
    targeting: {
      geo_locations: { countries },
      age_min: 18,
      age_max: 65,
      targeting_automation: { advantage_audience: 1 },
    },
    promoted_object: {
      page_id: input.pageId,
      whatsapp_phone_number: phone,
    },
    status: "PAUSED",
  });

  const creative = await graphPost<{ id: string }>(`${actPath(input.adAccountId)}/adcreatives`, input.accessToken, {
    name: `${input.campaignName.slice(0, 80)} — creative`,
    object_story_spec: {
      page_id: input.pageId,
      link_data: {
        message: input.primaryText.slice(0, 2000),
        name: input.headline.slice(0, 255),
        link: `https://api.whatsapp.com/send/?phone=${phone}&text=`,
        image_hash: imageHash,
        call_to_action: {
          type: "WHATSAPP_MESSAGE",
          value: { whatsapp_number: phone },
        },
      },
    },
  });

  const ad = await graphPost<{ id: string }>(`${actPath(input.adAccountId)}/ads`, input.accessToken, {
    name: `${input.campaignName.slice(0, 80)} — ad`,
    adset_id: adset.id,
    creative: { creative_id: creative.id },
    status: "PAUSED",
  });

  // Activate tree after all objects exist — single merchant confirmation already happened.
  await graphPost(`/${ad.id}`, input.accessToken, { status: "ACTIVE" });
  await graphPost(`/${adset.id}`, input.accessToken, { status: "ACTIVE" });
  await graphPost(`/${campaign.id}`, input.accessToken, { status: "ACTIVE" });

  return {
    campaignId: campaign.id,
    adsetId: adset.id,
    creativeId: creative.id,
    adId: ad.id,
    imageHash,
    dailyBudgetMinor,
    dryRun: false,
  };
}

export async function setMetaObjectStatus(
  objectId: string,
  accessToken: string,
  status: "ACTIVE" | "PAUSED",
): Promise<void> {
  if (metaAdsDryRun() || objectId.startsWith("dry_")) return;
  await graphPost(`/${objectId}`, accessToken, { status });
}
