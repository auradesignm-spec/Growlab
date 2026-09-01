import { providerRegistry } from "./providers/providerRegistry";
import { calculateCompetitorScores } from "./scoringEngine";
import { huntCompetitorWeaknesses } from "./weaknessHunter";
import { findMarketOpportunities } from "./opportunityFinder";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import type { TargetMarket, AdPlatform, CompetitorProjectData, CompetitorData } from "./types";

export interface ScanMarketOptions {
  keyword: string;
  targetMarket?: TargetMarket;
  platforms?: AdPlatform[];
  userId?: string;
}

/**
 * Full Competitor Radar Discovery & Intelligence Pipeline
 */
export async function runCompetitorRadarScan(options: ScanMarketOptions): Promise<{
  project: any;
  competitors: any[];
  opportunities: any[];
  providerStatuses: Array<{ providerId: string; status: string; message?: string }>;
}> {
  const { keyword, targetMarket = "OM", platforms = ["meta", "tiktok"] } = options;
  const cleanKeyword = keyword.trim();

  // 1. Resolve viewer
  let userId = options.userId;
  if (!userId) {
    const viewer = await getCurrentUser();
    userId = viewer?.id;
  }

  // Fallback to first active user if needed in demo/public mode
  if (!userId) {
    const firstUser = await prisma.user.findFirst({ where: { role: "merchant" } });
    userId = firstUser?.id;
  }

  if (!userId) {
    throw new Error("No merchant user found for competitor intelligence persistence.");
  }

  // 2. Query Multi-Platform Providers
  const { results: rawCompetitors, providerStatuses } = await providerRegistry.queryMultiPlatform(
    {
      keyword: cleanKeyword,
      market: targetMarket,
    },
    platforms
  );

  // 3. Score Competitors and extract Weaknesses & Opportunities
  const scoredCompetitors = rawCompetitors.map((comp) => {
    const scores = calculateCompetitorScores(cleanKeyword, comp);
    const weaknesses = huntCompetitorWeaknesses(comp);

    return {
      ...comp,
      ...scores,
      weaknesses,
    };
  });

  // Sort competitors by Threat Score descending
  scoredCompetitors.sort((a, b) => b.threatScore - a.threatScore);

  // 4. Discover Opportunities
  const opportunities = findMarketOpportunities(cleanKeyword, targetMarket, rawCompetitors);

  // 5. Persist or Update in Database
  let project = await prisma.competitorProject.findFirst({
    where: {
      userId,
      productKeyword: cleanKeyword,
      targetMarket,
    },
  });

  if (project) {
    // Delete previous scan items to avoid stale duplicates
    await prisma.competitor.deleteMany({ where: { projectId: project.id } });
    await prisma.marketOpportunity.deleteMany({ where: { projectId: project.id } });

    await prisma.competitorProject.update({
      where: { id: project.id },
      data: {
        updatedAt: new Date(),
        platforms: platforms.join(","),
      },
    });
  } else {
    project = await prisma.competitorProject.create({
      data: {
        userId,
        name: cleanKeyword,
        productKeyword: cleanKeyword,
        targetMarket,
        platforms: platforms.join(","),
      },
    });
  }

  // Create Competitors with Ads, Weaknesses, and Analyses
  for (const comp of scoredCompetitors) {
    await prisma.competitor.create({
      data: {
        projectId: project.id,
        name: comp.name,
        domain: comp.domain,
        brandHandle: comp.brandHandle,
        market: comp.market,
        threatScore: comp.threatScore,
        relevanceScore: comp.relevanceScore,
        activityScore: comp.activityScore,
        creativeScore: comp.creativeScore,
        offerScore: comp.offerScore,
        confidenceScore: comp.confidenceScore,
        tier: comp.tier,
        activeAdsCount: comp.activeAdsCount,
        platforms: comp.platform,
        primaryOffer: comp.primaryOffer,
        priceRange: comp.priceRange,
        shippingOffer: comp.shippingOffer,
        guaranteeOffer: comp.guaranteeOffer,
        ads: {
          create: comp.ads.map((ad) => ({
            platform: ad.platform,
            adLibraryId: ad.externalId,
            format: ad.format,
            headline: ad.headline,
            bodyCopy: ad.bodyCopy,
            hook: ad.hook,
            painPoint: ad.painPoint,
            promise: ad.promise,
            proof: ad.proof,
            offer: ad.offer,
            cta: ad.cta,
            daysActive: ad.daysActive,
            isActive: ad.isActive,
            spendVelocity: ad.spendVelocity,
            sourceUrl: ad.sourceUrl,
          })),
        },
        weaknesses: {
          create: comp.weaknesses.map((w) => ({
            type: w.type,
            title: w.title,
            description: w.description,
            evidence: w.evidence,
            confidence: w.confidence,
            exploitationAngle: w.exploitationAngle,
          })),
        },
        analyses: {
          create: {
            creativeStrategy: comp.ads.some((a) => a.format === "video")
              ? "التركيز على الفيديوهات القصيرة واستعراض المنتج"
              : "الاعتماد على تصاميم الصور الثابتة والخصومات المباشرة",
            offerStrategy: comp.primaryOffer,
            positioning: comp.tier === "direct" ? "منافس مباشر يستهدف نفس الشريحة السعرية" : "منافس بديل بزاوية ترويجية مختلفة",
            strengthsJson: JSON.stringify([
              `نشاط إعلاني بعدد ${comp.activeAdsCount} حملات`,
              `درجة صمود واستمرارية لحملات سابقة لـ ${Math.max(...comp.ads.map((a) => a.daysActive || 0), 1)} يوماً`,
            ]),
            counterAnglesJson: JSON.stringify(comp.weaknesses.map((w) => w.exploitationAngle)),
            estimatedVelocity: comp.threatScore >= 80 ? "scaling" : "stable",
            aiSummary: `المنافس "${comp.name}" يمتلك تهديداً بمعدل ${comp.threatScore}/100، وأبرز نقاط ضعفه تكمن في ${comp.weaknesses[0]?.title || "عروض الشحن والضمان"}.`,
          },
        },
      },
    });
  }

  // Create Opportunities
  for (const opp of opportunities) {
    await prisma.marketOpportunity.create({
      data: {
        projectId: project.id,
        type: opp.type,
        title: opp.title,
        description: opp.description,
        opportunityScore: opp.opportunityScore,
        competitionLevel: opp.competitionLevel,
        recommendedDirection: opp.recommendedDirection,
        suggestedHooksJson: JSON.stringify(opp.suggestedHooks),
        suggestedOffersJson: JSON.stringify(opp.suggestedOffers),
      },
    });
  }

  // Fetch complete graph
  const fullProject = await prisma.competitorProject.findUnique({
    where: { id: project.id },
    include: {
      competitors: {
        orderBy: { threatScore: "desc" },
        include: {
          ads: { orderBy: { daysActive: "desc" } },
          analyses: true,
          weaknesses: true,
        },
      },
      opportunities: {
        orderBy: { opportunityScore: "desc" },
      },
    },
  });

  return {
    project: fullProject,
    competitors: fullProject?.competitors || [],
    opportunities: fullProject?.opportunities || [],
    providerStatuses,
  };
}
