import { PrismaClient } from "@prisma/client";
import { computeWaterfall } from "../lib/ledger/waterfall";
import { tierMultiplier } from "../lib/ledger/tiers";
import { computeMerDay, evaluateAutoPause, type DailySpendPoint } from "../lib/ledger/mer";
import { computeCreatorBalances, computeInstantPayoutFee } from "../lib/ledger/payouts";
import { serializeList } from "../lib/catalog-db";
import { escrowForOrderStatus } from "../lib/shop/escrow";

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(12, 0, 0, 0);
  return d;
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function resetDatabase() {
  await prisma.kycDocument.deleteMany();
  await prisma.payoutRequest.deleteMany();
  await prisma.merDay.deleteMany();
  await prisma.adSpendAllocation.deleteMany();
  await prisma.adSpendEntry.deleteMany();
  await prisma.adWallet.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.order.deleteMany();
  await prisma.creatorDeal.deleteMany();
  await prisma.sampleRequest.deleteMany();
  await prisma.product.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.merchantProfile.deleteMany();
  await prisma.user.deleteMany();
}

interface OrderSeed {
  daysAgo: number;
  quantity: number;
  discountPct: number;
  status: string;
  attributionSource: string;
  buyerName: string;
  buyerPhone: string;
  buyerCity: string;
  buyerAddress: string;
}

async function main() {
  await resetDatabase();

  // ---------------------------------------------------------------------
  // Merchants (mixed verification status)
  // ---------------------------------------------------------------------
  const attarUser = await prisma.user.create({
    data: { name: "Muttrah Attars Trading", role: "merchant", locale: "ar" },
  });
  const attarMerchant = await prisma.merchantProfile.create({
    data: {
      userId: attarUser.id,
      businessName: "Muttrah Attars",
      commercialRegNo: "1234567",
      ownerFullName: "Muttrah Attars Trading",
      city: "Muscat",
      verificationStatus: "verified",
      kycSubmittedAt: new Date(),
    },
  });

  const datesUser = await prisma.user.create({
    data: { name: "Nizwa Dates Co.", role: "merchant", locale: "ar" },
  });
  const datesMerchant = await prisma.merchantProfile.create({
    data: {
      userId: datesUser.id,
      businessName: "Nizwa Dates Co.",
      commercialRegNo: "7654321",
      ownerFullName: "Nizwa Dates Co.",
      city: "Nizwa",
      verificationStatus: "verified",
      kycSubmittedAt: new Date(),
    },
  });

  const potteryUser = await prisma.user.create({
    data: { name: "Bahla Pottery House", role: "merchant", locale: "en" },
  });
  const potteryMerchant = await prisma.merchantProfile.create({
    data: {
      userId: potteryUser.id,
      businessName: "Bahla Pottery House",
      commercialRegNo: "",
      ownerFullName: "Bahla Pottery House",
      city: "Bahla",
      verificationStatus: "pending",
    },
  });

  // ---------------------------------------------------------------------
  // Products (8, across 3 categories, tagged)
  // ---------------------------------------------------------------------
  const [muttrahNight, roseGarden, amberTravel] = await Promise.all([
    prisma.product.create({
      data: {
        merchantId: attarMerchant.id,
        title: "Muttrah Night Attar",
        category: "attar",
        tags: serializeList(["oud", "night", "gift"]),
        variants: serializeList(["30ml", "50ml", "100ml"]),
        basePrice: 28,
        cogsPct: 0.32,
        costPrice: 8.96,
        commissionType: "pct",
        commissionValue: 0.2,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        merchantId: attarMerchant.id,
        title: "Rose Garden Attar",
        category: "attar",
        tags: serializeList(["rose", "day", "gift"]),
        variants: serializeList(["15ml", "30ml"]),
        basePrice: 19,
        cogsPct: 0.3,
        costPrice: 5.7,
        commissionType: "pct",
        commissionValue: 0.15,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        merchantId: attarMerchant.id,
        title: "Amber Travel Set",
        category: "attar",
        tags: serializeList(["amber", "travel", "gift"]),
        variants: "",
        basePrice: 22,
        cogsPct: 0.34,
        costPrice: 7.48,
        commissionType: "pct",
        commissionValue: 0.25,
        active: true,
      },
    }),
  ]);

  const [khalasCrate, dateTruffle, royalBasket] = await Promise.all([
    prisma.product.create({
      data: {
        merchantId: datesMerchant.id,
        title: "Khalas Crate 1kg",
        category: "dates",
        tags: serializeList(["khalas", "gift", "ramadan"]),
        variants: serializeList(["500g", "1kg", "2kg"]),
        basePrice: 12,
        cogsPct: 0.4,
        costPrice: 4.8,
        commissionType: "fixed",
        commissionValue: 2,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        merchantId: datesMerchant.id,
        title: "Date Truffle Box",
        category: "dates",
        tags: serializeList(["truffle", "premium", "gift"]),
        variants: "",
        basePrice: 16,
        cogsPct: 0.38,
        costPrice: 6.08,
        commissionType: "pct",
        commissionValue: 0.2,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        merchantId: datesMerchant.id,
        title: "Royal Date Basket",
        category: "dates",
        tags: serializeList(["khalas", "premium", "ramadan"]),
        variants: "",
        basePrice: 24,
        cogsPct: 0.42,
        costPrice: 10.08,
        commissionType: "pct",
        commissionValue: 0.15,
        active: true,
      },
    }),
  ]);

  const [handThrownVase, bahlaClaySet] = await Promise.all([
    prisma.product.create({
      data: {
        merchantId: potteryMerchant.id,
        title: "Hand-thrown Vase",
        category: "home",
        tags: serializeList(["pottery", "handmade", "decor"]),
        variants: "",
        basePrice: 30,
        cogsPct: 0.45,
        costPrice: 13.5,
        commissionType: "fixed",
        commissionValue: 5,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        merchantId: potteryMerchant.id,
        title: "Bahla Clay Set",
        category: "home",
        tags: serializeList(["pottery", "gift", "decor"]),
        variants: "",
        basePrice: 45,
        cogsPct: 0.48,
        costPrice: 21.6,
        commissionType: "pct",
        commissionValue: 0.25,
        active: true,
      },
    }),
  ]);

  // ---------------------------------------------------------------------
  // Creators (5, across tiers — tier assigned directly here as fixture
  // state; in a live system it would be periodically recomputed via
  // lib/ledger/tiers.ts#resolveTier from real net-sales/return history)
  // ---------------------------------------------------------------------
  const laylaUser = await prisma.user.create({ data: { name: "ليلى الحارثي", role: "creator", locale: "ar" } });
  const layla = await prisma.creatorProfile.create({
    data: { userId: laylaUser.id, username: "layla", tier: "ELITE", bio: "Attar — Muttrah", legalName: "ليلى الحارثي", verificationStatus: "verified", kycSubmittedAt: new Date() },
  });

  const omarUser = await prisma.user.create({ data: { name: "عمر الكندي", role: "creator", locale: "ar" } });
  const omar = await prisma.creatorProfile.create({
    data: { userId: omarUser.id, username: "omar", tier: "RISING", bio: "Dates — Nizwa", legalName: "عمر الكندي", verificationStatus: "verified", kycSubmittedAt: new Date() },
  });

  const noorUser = await prisma.user.create({ data: { name: "نور السالمي", role: "creator", locale: "ar" } });
  const noor = await prisma.creatorProfile.create({
    data: { userId: noorUser.id, username: "noor", tier: "RISING", bio: "Attar & dates — Muscat", legalName: "نور السالمي", verificationStatus: "verified", kycSubmittedAt: new Date() },
  });

  const sultanUser = await prisma.user.create({ data: { name: "سلطان البلوشي", role: "creator", locale: "ar" } });
  const sultan = await prisma.creatorProfile.create({
    data: { userId: sultanUser.id, username: "sultan", tier: "NEW", bio: "Dates — Salalah", legalName: "سلطان البلوشي", verificationStatus: "verified", kycSubmittedAt: new Date() },
  });

  const mayaUser = await prisma.user.create({ data: { name: "Maya Al Lawati", role: "creator", locale: "en" } });
  await prisma.creatorProfile.create({
    data: { userId: mayaUser.id, username: "maya", tier: "NEW", bio: "New creator — no deals yet", legalName: "Maya Al Lawati", verificationStatus: "verified", kycSubmittedAt: new Date() },
  });

  // ---------------------------------------------------------------------
  // CreatorDeals — immutable locked snapshots
  // ---------------------------------------------------------------------
  const laylaMuttrah = await prisma.creatorDeal.create({
    data: {
      creatorId: layla.id,
      productId: muttrahNight.id,
      lockedUnitPrice: 28,
      lockedCommissionPct: 0.3,
      lockedCogsPct: 0.32,
      discountCapPct: 0.15,
      status: "active",
      featured: true,
    },
  });
  const laylaRose = await prisma.creatorDeal.create({
    data: {
      creatorId: layla.id,
      productId: roseGarden.id,
      lockedUnitPrice: 19,
      lockedCommissionPct: 0.28,
      lockedCogsPct: 0.3,
      discountCapPct: 0.15,
      status: "active",
      featured: false,
    },
  });
  const omarKhalas = await prisma.creatorDeal.create({
    data: {
      creatorId: omar.id,
      productId: khalasCrate.id,
      lockedUnitPrice: 12,
      lockedCommissionPct: 0.26,
      lockedCogsPct: 0.4,
      discountCapPct: 0.1,
      status: "active",
      featured: true,
    },
  });
  const omarTruffle = await prisma.creatorDeal.create({
    data: {
      creatorId: omar.id,
      productId: dateTruffle.id,
      lockedUnitPrice: 16,
      lockedCommissionPct: 0.26,
      lockedCogsPct: 0.38,
      discountCapPct: 0.1,
      status: "active",
      featured: false,
    },
  });
  const noorMuttrah = await prisma.creatorDeal.create({
    data: {
      creatorId: noor.id,
      productId: muttrahNight.id,
      lockedUnitPrice: 28,
      lockedCommissionPct: 0.27,
      lockedCogsPct: 0.32,
      discountCapPct: 0.12,
      status: "active",
      featured: true,
    },
  });
  const noorBasket = await prisma.creatorDeal.create({
    data: {
      creatorId: noor.id,
      productId: royalBasket.id,
      lockedUnitPrice: 24,
      lockedCommissionPct: 0.29,
      lockedCogsPct: 0.42,
      discountCapPct: 0.12,
      status: "active",
      featured: false,
    },
  });
  const sultanKhalas = await prisma.creatorDeal.create({
    data: {
      creatorId: sultan.id,
      productId: khalasCrate.id,
      lockedUnitPrice: 12,
      lockedCommissionPct: 0.24,
      lockedCogsPct: 0.4,
      discountCapPct: 0.1,
      status: "active",
      featured: true,
    },
  });

  // ---------------------------------------------------------------------
  // Sample requests — independent of deals; a creator can ask for a
  // physical sample to film before (or without) ever locking a deal.
  // ---------------------------------------------------------------------
  await prisma.sampleRequest.create({
    data: {
      creatorId: sultan.id,
      productId: handThrownVase.id,
      merchantId: potteryMerchant.id,
      note: "أبي أصوّر ريلز عن قطع البهلا — ممكن عينة؟",
      status: "pending",
      depositAmount: 30,
      depositCurrency: "OMR",
      ugcStatus: "pending",
    },
  });
  await prisma.sampleRequest.create({
    data: {
      creatorId: omar.id,
      productId: muttrahNight.id,
      merchantId: attarMerchant.id,
      note: "For a night-routine video before I add this as a deal.",
      status: "approved",
      respondedAt: daysAgo(2),
      depositAmount: 28,
      depositCurrency: "OMR",
      ugcStatus: "pending",
    },
  });
  await prisma.sampleRequest.create({
    data: {
      creatorId: noor.id,
      productId: bahlaClaySet.id,
      merchantId: potteryMerchant.id,
      note: null,
      status: "shipped",
      respondedAt: daysAgo(5),
      shippingRef: "GL-7QX2KP",
      depositAmount: 45,
      depositCurrency: "OMR",
      ugcStatus: "submitted",
      ugcDeadline: daysAgo(-2),
      ugcVideoUrl: "https://www.tiktok.com/@noor/video/1234567890",
      ugcSubmittedAt: daysAgo(1),
    },
  });

  // ---------------------------------------------------------------------
  // Orders — 15-30 across deals, mixed states
  // ---------------------------------------------------------------------
  const buyers = [
    ["Ahmed Al Balushi", "+96891112222"],
    ["Fatma Al Zadjali", "+96892223333"],
    ["Said Al Harthi", "+96893334444"],
    ["Mariam Al Kindi", "+96894445555"],
    ["Khalid Al Amri", "+96895556666"],
  ];

  function buyer(i: number): [string, string] {
    const b = buyers[i % buyers.length];
    return [b[0], b[1]];
  }

  const dealOrderPlans: Array<{ deal: { id: string; creatorId: string }; orders: OrderSeed[] }> = [
    {
      deal: laylaMuttrah,
      orders: [
        { daysAgo: 1, quantity: 2, discountPct: 0, status: "confirmed", attributionSource: "creator_link", ...zip(buyer(0)) },
        { daysAgo: 2, quantity: 1, discountPct: 0.05, status: "fulfilled", attributionSource: "creator_link", ...zip(buyer(1)) },
        { daysAgo: 3, quantity: 1, discountPct: 0, status: "fulfilled", attributionSource: "platform_agent", ...zip(buyer(2)) },
        { daysAgo: 7, quantity: 1, discountPct: 0.25, status: "returned", attributionSource: "creator_link", ...zip(buyer(3)) },
        { daysAgo: 10, quantity: 2, discountPct: 0, status: "fulfilled", attributionSource: "creator_link", ...zip(buyer(4)) },
      ],
    },
    {
      deal: laylaRose,
      orders: [
        { daysAgo: 4, quantity: 1, discountPct: 0, status: "confirmed", attributionSource: "creator_link", ...zip(buyer(0)) },
        { daysAgo: 12, quantity: 2, discountPct: 0.1, status: "fulfilled", attributionSource: "creator_link", ...zip(buyer(1)) },
        { daysAgo: 20, quantity: 1, discountPct: 0, status: "cancelled", attributionSource: "direct", ...zip(buyer(2)) },
      ],
    },
    {
      deal: omarKhalas,
      orders: [
        { daysAgo: 1, quantity: 3, discountPct: 0, status: "fulfilled", attributionSource: "creator_link", ...zip(buyer(0)) },
        { daysAgo: 2, quantity: 2, discountPct: 0, status: "fulfilled", attributionSource: "creator_link", ...zip(buyer(1)) },
        { daysAgo: 3, quantity: 1, discountPct: 0, status: "confirmed", attributionSource: "creator_link", ...zip(buyer(2)) },
        { daysAgo: 5, quantity: 2, discountPct: 0.05, status: "fulfilled", attributionSource: "platform_agent", ...zip(buyer(3)) },
      ],
    },
    {
      deal: omarTruffle,
      orders: [
        { daysAgo: 6, quantity: 1, discountPct: 0, status: "fulfilled", attributionSource: "creator_link", ...zip(buyer(4)) },
        { daysAgo: 15, quantity: 1, discountPct: 0, status: "returned", attributionSource: "creator_link", ...zip(buyer(0)) },
      ],
    },
    {
      deal: noorMuttrah,
      orders: [
        { daysAgo: 2, quantity: 1, discountPct: 0, status: "confirmed", attributionSource: "creator_link", ...zip(buyer(1)) },
        { daysAgo: 9, quantity: 1, discountPct: 0, status: "fulfilled", attributionSource: "creator_link", ...zip(buyer(2)) },
        { daysAgo: 18, quantity: 2, discountPct: 0.08, status: "fulfilled", attributionSource: "creator_link", ...zip(buyer(3)) },
      ],
    },
    {
      deal: noorBasket,
      orders: [
        { daysAgo: 5, quantity: 1, discountPct: 0, status: "fulfilled", attributionSource: "creator_link", ...zip(buyer(4)) },
        { daysAgo: 11, quantity: 1, discountPct: 0, status: "pending", attributionSource: "direct", ...zip(buyer(0)) },
      ],
    },
    {
      deal: sultanKhalas,
      orders: [
        { daysAgo: 1, quantity: 1, discountPct: 0, status: "pending", attributionSource: "creator_link", ...zip(buyer(1)) },
        { daysAgo: 8, quantity: 2, discountPct: 0, status: "fulfilled", attributionSource: "creator_link", ...zip(buyer(2)) },
        { daysAgo: 14, quantity: 1, discountPct: 0, status: "fulfilled", attributionSource: "creator_link", ...zip(buyer(3)) },
      ],
    },
  ];

  function zip([buyerName, buyerPhone]: [string, string]) {
    const n = Number(buyerPhone.replace(/\D/g, "").slice(-1)) || 1;
    const cities = ["مسقط", "صلالة", "صحار"];
    return {
      buyerName,
      buyerPhone,
      buyerCity: cities[n % cities.length],
      buyerAddress: `حي ${n}، شارع السلطان قابوس، بناية ${10 + n}`,
    };
  }

  const dealMeta = new Map(
    [
      [laylaMuttrah.id, { lockedUnitPrice: 28 }],
      [laylaRose.id, { lockedUnitPrice: 19 }],
      [omarKhalas.id, { lockedUnitPrice: 12 }],
      [omarTruffle.id, { lockedUnitPrice: 16 }],
      [noorMuttrah.id, { lockedUnitPrice: 28 }],
      [noorBasket.id, { lockedUnitPrice: 24 }],
      [sultanKhalas.id, { lockedUnitPrice: 12 }],
    ]
  );

  type CreatedOrder = { id: string; dealId: string; createdAt: Date; quantity: number; unitPriceCharged: number };
  const createdOrders: CreatedOrder[] = [];

  for (const plan of dealOrderPlans) {
    const meta = dealMeta.get(plan.deal.id)!;
    for (const o of plan.orders) {
      const unitPriceCharged = Math.round(meta.lockedUnitPrice * (1 - o.discountPct) * 100) / 100;
      const escrowStatus = escrowForOrderStatus(o.status);
      const created = await prisma.order.create({
        data: {
          dealId: plan.deal.id,
          buyerName: o.buyerName,
          buyerPhone: o.buyerPhone,
          buyerCity: o.buyerCity,
          buyerAddress: o.buyerAddress,
          quantity: o.quantity,
          unitPriceCharged,
          currency: "OMR",
          attributionSource: o.attributionSource,
          trackingToken: `seed-${plan.deal.id.slice(-6)}-${o.daysAgo}-${o.buyerPhone.slice(-4)}`,
          escrowStatus,
          escrowReleasedAt: escrowStatus === "released" ? daysAgo(o.daysAgo) : null,
          status: o.status,
          createdAt: daysAgo(o.daysAgo),
        },
      });
      createdOrders.push({
        id: created.id,
        dealId: created.dealId,
        createdAt: created.createdAt,
        quantity: created.quantity,
        unitPriceCharged: created.unitPriceCharged,
      });
    }
  }

  // ---------------------------------------------------------------------
  // Ad wallets — one that trips the MER auto-pause flag, one healthy
  // ---------------------------------------------------------------------
  const flaggedWallet = await prisma.adWallet.create({
    data: {
      dealId: laylaMuttrah.id,
      merchantId: attarMerchant.id,
      status: "unfunded",
      availableBalance: 150,
      dailyCap: 25,
      dealCap: 200,
      merKillThreshold: 2.5,
      merKillConsecutiveDays: 3,
    },
  });
  const healthyWallet = await prisma.adWallet.create({
    data: {
      dealId: omarKhalas.id,
      merchantId: datesMerchant.id,
      status: "live",
      availableBalance: 100,
      dailyCap: 20,
      dealCap: 300,
      merKillThreshold: 2.5,
      merKillConsecutiveDays: 3,
    },
  });

  const flaggedSpendPlan = [
    { daysAgo: 10, amount: 10 },
    { daysAgo: 7, amount: 10 },
    { daysAgo: 3, amount: 20 },
    { daysAgo: 2, amount: 20 },
    { daysAgo: 1, amount: 25 },
  ];
  const healthySpendPlan = [
    { daysAgo: 5, amount: 5 },
    { daysAgo: 3, amount: 4 },
    { daysAgo: 2, amount: 6 },
    { daysAgo: 1, amount: 8 },
  ];

  async function seedAdWalletSpend(
    wallet: { id: string },
    dealId: string,
    plan: Array<{ daysAgo: number; amount: number }>,
    fundedAmount: number
  ) {
    const orderAllocationByOrderId = new Map<string, number>();
    const windowDays = 14;
    const dailyPoints: DailySpendPoint[] = [];

    let lifetimeSpent = 0;

    // Window covers days 1..windowDays ago (not "today") so the most recent
    // completed day anchors the consecutive-day streak check below.
    for (let n = windowDays; n >= 1; n -= 1) {
      const date = daysAgo(n);
      const spendForDay = plan.find((p) => p.daysAgo === n);
      const dayOrders = createdOrders.filter(
        (o) => o.dealId === dealId && dayKey(o.createdAt) === dayKey(date)
      );
      const dayNetSales = dayOrders.reduce(
        (sum, o) => sum + o.quantity * o.unitPriceCharged * (1 - 0.1),
        0
      );

      if (spendForDay) {
        lifetimeSpent += spendForDay.amount;
        const entry = await prisma.adSpendEntry.create({
          data: {
            walletId: wallet.id,
            amount: spendForDay.amount,
            currency: "OMR",
            spentAt: date,
            source: "manual_ops",
          },
        });

        const totalDayGmv = dayOrders.reduce((sum, o) => sum + o.quantity * o.unitPriceCharged, 0);
        if (dayOrders.length > 0 && totalDayGmv > 0) {
          for (const o of dayOrders) {
            const share = (o.quantity * o.unitPriceCharged) / totalDayGmv;
            const allocated = Math.round(spendForDay.amount * share * 100) / 100;
            await prisma.adSpendAllocation.create({
              data: {
                spendEntryId: entry.id,
                orderId: o.id,
                dealId,
                allocatedAmount: allocated,
              },
            });
            orderAllocationByOrderId.set(o.id, (orderAllocationByOrderId.get(o.id) ?? 0) + allocated);
          }
        } else {
          await prisma.adSpendAllocation.create({
            data: {
              spendEntryId: entry.id,
              orderId: null,
              dealId,
              allocatedAmount: spendForDay.amount,
            },
          });
        }
      }

      dailyPoints.push({
        date,
        netAttributedSales: Math.round(dayNetSales * 100) / 100,
        adSpend: spendForDay?.amount ?? 0,
      });
    }

    const merThreshold = 2.5;
    const merDays = dailyPoints.map((p) => computeMerDay(p, merThreshold));
    for (const day of merDays) {
      await prisma.merDay.create({
        data: {
          walletId: wallet.id,
          date: day.date,
          netAttributedSales: day.netAttributedSales,
          adSpend: day.adSpend,
          mer: Math.round(day.mer * 100) / 100,
          belowThreshold: day.belowThreshold,
        },
      });
    }

    const evaluation = evaluateAutoPause(merDays, 3, merThreshold);

    await prisma.adWallet.update({
      where: { id: wallet.id },
      data: {
        lifetimeSpent: Math.round(lifetimeSpent * 100) / 100,
        availableBalance: Math.round((fundedAmount - lifetimeSpent) * 100) / 100,
        autoPauseFlag: evaluation.autoPauseFlag,
        autoPauseReason: evaluation.autoPauseReason,
        status: evaluation.autoPauseFlag ? "paused" : "live",
      },
    });

    return orderAllocationByOrderId;
  }

  const flaggedAllocations = await seedAdWalletSpend(flaggedWallet, laylaMuttrah.id, flaggedSpendPlan, 150);
  const healthyAllocations = await seedAdWalletSpend(healthyWallet, omarKhalas.id, healthySpendPlan, 100);

  const adSpendByOrderId = new Map<string, number>([...flaggedAllocations, ...healthyAllocations]);

  // ---------------------------------------------------------------------
  // Ledger entries — the one true waterfall computation, per order
  // ---------------------------------------------------------------------
  const creatorTierById = new Map<string, string>([
    [layla.id, "ELITE"],
    [omar.id, "RISING"],
    [noor.id, "RISING"],
    [sultan.id, "NEW"],
  ]);

  const dealSnapshotById = new Map(
    [laylaMuttrah, laylaRose, omarKhalas, omarTruffle, noorMuttrah, noorBasket, sultanKhalas].map((deal) => [
      deal.id,
      deal,
    ])
  );

  for (const order of createdOrders) {
    const deal = dealSnapshotById.get(order.dealId)!;
    const tier = creatorTierById.get(deal.creatorId) ?? "NEW";
    const result = computeWaterfall({
      quantity: order.quantity,
      unitPriceCharged: order.unitPriceCharged,
      lockedUnitPrice: deal.lockedUnitPrice,
      lockedCommissionPct: deal.lockedCommissionPct,
      lockedCogsPct: deal.lockedCogsPct,
      discountCapPct: deal.discountCapPct,
      adSpendAllocated: adSpendByOrderId.get(order.id) ?? 0,
      tierMultiplier: tierMultiplier(tier as "NEW" | "RISING" | "ELITE"),
    });

    await prisma.ledgerEntry.create({
      data: {
        orderId: order.id,
        attributedGmv: result.attributedGmv,
        returnsReserve: result.returnsReserve,
        netAttributedSales: result.netAttributedSales,
        paymentFee: result.paymentFee,
        cogs: result.cogs,
        adSpendAllocated: result.adSpendAllocated,
        contributionPool: result.contributionPool,
        creatorFloorAmount: result.creatorFloorAmount,
        creatorProfitShare: result.creatorProfitShare,
        creatorShare: result.creatorShare,
        merchantShare: result.merchantShare,
        platformShare: result.platformShare,
        holdbackAmount: result.holdbackAmount,
        availableAmount: result.availableAmount,
        holdbackDays: result.holdbackDays,
      },
    });
  }

  // ---------------------------------------------------------------------
  // Payout requests — one instant (fee shown), one scheduled
  // ---------------------------------------------------------------------
  async function balancesFor(creatorId: string) {
    const deals = await prisma.creatorDeal.findMany({
      where: { creatorId },
      include: { orders: { include: { ledgerEntry: true } } },
    });
    const lines = deals.flatMap((deal) =>
      deal.orders
        .filter((o) => o.ledgerEntry)
        .map((o) => ({
          orderCreatedAt: o.createdAt,
          creatorShare: o.ledgerEntry!.creatorShare,
          holdbackAmount: o.ledgerEntry!.holdbackAmount,
          availableAmount: o.ledgerEntry!.availableAmount,
          holdbackDays: o.ledgerEntry!.holdbackDays,
          orderStatus: o.status,
          escrowStatus: o.escrowStatus,
          escrowReleasedAt: o.escrowReleasedAt,
        }))
    );
    return computeCreatorBalances(lines, []);
  }

  const laylaBalances = await balancesFor(layla.id);
  const instantAmount = Math.max(1, Math.round(laylaBalances.availableBalance * 0.5 * 100) / 100);
  await prisma.payoutRequest.create({
    data: {
      creatorId: layla.id,
      type: "instant",
      amount: instantAmount,
      feeAmount: computeInstantPayoutFee(instantAmount),
      status: "paid",
      processedAt: new Date(),
    },
  });

  const omarBalances = await balancesFor(omar.id);
  const scheduledAmount = Math.max(1, Math.round(omarBalances.availableBalance * 100) / 100);
  await prisma.payoutRequest.create({
    data: {
      creatorId: omar.id,
      type: "scheduled",
      amount: scheduledAmount,
      feeAmount: 0,
      status: "requested",
    },
  });

  console.log("Seed complete:");
  console.log(`  Merchants: 3 (2 verified, 1 pending)`);
  console.log(`  Creators: 5 (layla=ELITE, omar/noor=RISING, sultan/maya=NEW)`);
  console.log(`  Products: 8 across attar/dates/home`);
  console.log(`  Deals: 7`);
  console.log(`  Orders: ${createdOrders.length}`);
  console.log(`  Ad wallets: 2 (1 auto-paused by MER kill-switch, 1 healthy)`);
  console.log(`  Payout requests: 2 (1 instant/paid, 1 scheduled/requested)`);
  console.log(`  Sample requests: 3 (1 pending, 1 approved, 1 shipped)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
