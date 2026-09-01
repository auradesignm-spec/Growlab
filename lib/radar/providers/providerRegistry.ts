import type { CompetitorDataProvider, ProviderSearchQuery, NormalizedCompetitorResult, ProviderSearchResult } from "./types";
import { MockCompetitorProvider } from "./mockProvider";
import { MetaAdsLibraryProvider } from "./metaProvider";
import { TikTokCreativeCenterProvider } from "./tiktokProvider";
import type { AdPlatform } from "../types";

export class CompetitorProviderRegistry {
  private providers: Map<string, CompetitorDataProvider> = new Map();

  constructor() {
    this.register(new MockCompetitorProvider());
    this.register(new MetaAdsLibraryProvider());
    this.register(new TikTokCreativeCenterProvider());
  }

  register(provider: CompetitorDataProvider) {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: string): CompetitorDataProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * Queries multiple ad platforms and aggregates results into a normalized competitor list.
   */
  async queryMultiPlatform(
    query: ProviderSearchQuery,
    platforms: AdPlatform[] = ["meta", "tiktok"]
  ): Promise<{
    results: NormalizedCompetitorResult[];
    providerStatuses: Array<{ providerId: string; status: string; message?: string }>;
  }> {
    const providerStatuses: Array<{ providerId: string; status: string; message?: string }> = [];
    const aggregatedCompetitors: NormalizedCompetitorResult[] = [];

    // Prioritize configured live providers or fallback to mock sandbox
    for (const platform of platforms) {
      const provider = this.providers.get(platform) || this.providers.get("mock");
      if (!provider) continue;

      try {
        const res: ProviderSearchResult = await provider.search(query);
        providerStatuses.push({
          providerId: provider.id,
          status: res.status,
          message: res.message,
        });

        if (res.competitors && res.competitors.length > 0) {
          aggregatedCompetitors.push(...res.competitors);
        }
      } catch (err: any) {
        providerStatuses.push({
          providerId: provider.id,
          status: "unavailable",
          message: err?.message,
        });
      }
    }

    // If no competitors found from specific providers, fallback to mock historical provider
    if (aggregatedCompetitors.length === 0) {
      const mock = this.providers.get("mock");
      if (mock) {
        const res = await mock.search(query);
        providerStatuses.push({
          providerId: mock.id,
          status: res.status,
          message: res.message,
        });
        aggregatedCompetitors.push(...res.competitors);
      }
    }

    // Deduplicate competitors by name/brand
    const dedupedMap = new Map<string, NormalizedCompetitorResult>();
    for (const comp of aggregatedCompetitors) {
      const key = comp.name.toLowerCase().trim();
      if (!dedupedMap.has(key)) {
        dedupedMap.set(key, { ...comp, ads: [...comp.ads] });
      } else {
        const existing = dedupedMap.get(key)!;
        existing.activeAdsCount += comp.activeAdsCount;
        existing.ads.push(...comp.ads);
        // keep highest confidence
        existing.confidence = Math.max(existing.confidence, comp.confidence);
      }
    }

    return {
      results: Array.from(dedupedMap.values()),
      providerStatuses,
    };
  }
}

export const providerRegistry = new CompetitorProviderRegistry();
