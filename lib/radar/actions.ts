"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { runCompetitorRadarScan } from "./discoveryEngine";
import { generateCounterStrategyBattleplan } from "./counterStrategy";
import type { TargetMarket, AdPlatform } from "./types";

/**
 * Creates or retrieves a user's Competitor Radar project.
 */
export async function getOrCreateCompetitorProject(
  keyword: string,
  targetMarket: TargetMarket = "OM",
  platforms: AdPlatform[] = ["meta", "tiktok"]
) {
  const viewer = await getCurrentUser();
  if (!viewer?.id) {
    throw new Error("Authentication required to manage competitor projects");
  }

  const cleanKeyword = keyword.trim();
  const platformsStr = platforms.join(",");

  // Find existing project for this user & keyword & market
  let project = await prisma.competitorProject.findFirst({
    where: {
      userId: viewer.id,
      productKeyword: { equals: cleanKeyword },
      targetMarket,
    },
    include: {
      competitors: {
        include: {
          ads: true,
          analyses: true,
          weaknesses: true,
        },
      },
      opportunities: true,
    },
  });

  if (!project) {
    project = await prisma.competitorProject.create({
      data: {
        userId: viewer.id,
        name: cleanKeyword,
        productKeyword: cleanKeyword,
        targetMarket,
        platforms: platformsStr,
      },
      include: {
        competitors: {
          include: {
            ads: true,
            analyses: true,
            weaknesses: true,
          },
        },
        opportunities: true,
      },
    });
  }

  return project;
}

/**
 * Lists all competitor radar projects for the current authenticated user.
 */
export async function listUserCompetitorProjects() {
  const viewer = await getCurrentUser();
  if (!viewer?.id) return [];

  return prisma.competitorProject.findMany({
    where: { userId: viewer.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          competitors: true,
          opportunities: true,
        },
      },
    },
  });
}

/**
 * Retrieves a single project with full intelligence graph (competitors, ads, weaknesses, opportunities).
 */
export async function getCompetitorProjectById(projectId: string) {
  const viewer = await getCurrentUser();
  if (!viewer?.id) return null;

  return prisma.competitorProject.findFirst({
    where: {
      id: projectId,
      userId: viewer.id,
    },
    include: {
      competitors: {
        orderBy: { threatScore: "desc" },
        include: {
          ads: {
            orderBy: { daysActive: "desc" },
          },
          analyses: true,
          weaknesses: true,
        },
      },
      opportunities: {
        orderBy: { opportunityScore: "desc" },
      },
    },
  });
}

/**
 * Executes a live/sandbox market scan and updates project intelligence.
 */
export async function scanCompetitorsAction(
  keyword: string,
  targetMarket: TargetMarket = "OM",
  platforms: AdPlatform[] = ["meta", "tiktok"]
) {
  const result = await runCompetitorRadarScan({
    keyword,
    targetMarket,
    platforms,
  });

  revalidatePath("/dashboard/competitor-radar");
  revalidatePath("/competitor-radar");
  return result;
}

/**
 * Generates an actionable counter strategy battleplan for a set of competitors.
 */
export async function getCounterStrategyAction(
  productName: string,
  competitors: any[]
) {
  return generateCounterStrategyBattleplan(productName, competitors);
}

/**
 * Deletes a project and all associated cascading intelligence data.
 */
export async function deleteCompetitorProject(projectId: string) {
  const viewer = await getCurrentUser();
  if (!viewer?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.competitorProject.deleteMany({
    where: {
      id: projectId,
      userId: viewer.id,
    },
  });

  revalidatePath("/dashboard/competitor-radar");
  revalidatePath("/competitor-radar");
  return { success: true };
}
