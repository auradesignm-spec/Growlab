import { PrismaClient } from "@prisma/client";
import { computeWaterfall } from "../lib/ledger/waterfall";
import { settleOrderOnFulfill } from "../lib/ledger/wallet";
import { computeCreatorBalances, computeInstantPayoutFee, MIN_PAYOUT_OMR } from "../lib/ledger/payouts";
import { serializeList } from "../lib/catalog-db";
import { escrowForOrderStatus } from "../lib/shop/escrow";
import { ensureMerchantStoreDeal } from "../lib/merchant-store/deals";
import { serializeTheme } from "../lib/merchant-store/theme";
import { defaultStoreLayout } from "../lib/merchant-store/layout";
import { grantShareEntitlementOnPurchase } from "../lib/share/grantEntitlement";
import {
  DEMO_BUYER_EMAIL,
  DEMO_ORDER_TOKEN,
  DEMO_STORE_SLUG,
} from "../lib/dev/demo";

const prisma = new PrismaClient();

function seedContact(firstName: string, lastName: string, handle: string) {
  return {
    firstName,
    lastName,
    phone: "+96890000000",
    email: `${handle}@growlab.local`,
    profileCompletedAt: new Date(),
  };
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(12, 0, 0, 0);
  return d;
}

async function resetDatabase() {
  await prisma.clipPublish.deleteMany();
  await prisma.performanceEarn.deleteMany();
  await prisma.contentAsset.deleteMany();
  await prisma.shareEntitlement.deleteMany();
  await prisma.performanceCampaign.deleteMany();
  await prisma.merchantStore.deleteMany();
  await prisma.kycDocument.deleteMany();
  await prisma.contactLead.deleteMany();
  await prisma.storefrontVisit.deleteMany();
  await prisma.payoutRequest.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.order.deleteMany();
  await prisma.creatorDeal.deleteMany();
  await prisma.sampleRequest.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.product.deleteMany();
  await prisma.merchantWalletTxn.deleteMany();
  await prisma.merchantWallet.deleteMany();
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

  await prisma.user.create({
    data: {
      name: "قصي",
      role: "unassigned",
      locale: "ar",
      firstName: "قصي",
      lastName: "المدير",
      phone: "+96897844742",
      email: "qusay@growlab.local",
      profileCompletedAt: new Date(),
    },
  });

  // ---------------------------------------------------------------------
  // Merchants (mixed verification status)
  // ---------------------------------------------------------------------
  const attarUser = await prisma.user.create({
    data: { name: "Muttrah Attars Trading", role: "merchant", locale: "ar", ...seedContact("Muttrah", "Attars", "attar") },
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
      plan: "pro",
      planSource: "admin",
      adminPlanNote: "Demo merchant — full Pro features",
    },
  });

  const datesUser = await prisma.user.create({
    data: { name: "Nizwa Dates Co.", role: "merchant", locale: "ar", ...seedContact("Nizwa", "Dates", "dates") },
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
    data: { name: "Bahla Pottery House", role: "merchant", locale: "en", ...seedContact("Bahla", "Pottery", "pottery") },
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

  for (const merchant of [attarMerchant, datesMerchant, potteryMerchant]) {
    await prisma.merchantWallet.create({
      data: { merchantId: merchant.id, balance: 500, currency: "OMR" },
    });
  }

  // ---------------------------------------------------------------------
  // Products (8, across 3 categories, tagged)
  // ---------------------------------------------------------------------
  const [muttrahNight, roseGarden, amberTravel] = await Promise.all([
    prisma.product.create({
      data: {
        merchantId: attarMerchant.id,
        title: "Muttrah Night Attar",
        slug: "muttrah-night-attar",
        shortDescription: "Deep oud blend — Muttrah souq signature.",
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
        slug: "rose-garden-attar",
        shortDescription: "Day-wear rose attar in a travel-friendly bottle.",
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
        slug: "amber-travel-set",
        shortDescription: "Three mini attars for gifting.",
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

  await prisma.mediaAsset.createMany({
    data: [
      { productId: muttrahNight.id, type: "image", url: "/feed/attar-night.png", caption: "Bottle still" },
      { productId: roseGarden.id, type: "image", url: "/feed/attar-rose.png", caption: "Bottle still" },
      { productId: roseGarden.id, type: "video", url: "/feed/attar-rose.png", caption: "Reel cut" },
      { productId: amberTravel.id, type: "image", url: "/feed/attar-amber.png", caption: "Travel set" },
      { productId: khalasCrate.id, type: "image", url: "/feed/dates-khalas.png", caption: "Crate still" },
      { productId: dateTruffle.id, type: "image", url: "/feed/dates-truffle.png", caption: "Box still" },
    ],
  });

  // ---------------------------------------------------------------------
  // Creators (5, across tiers — tier assigned directly here as fixture
  // state; in a live system it would be periodically recomputed via
  // lib/ledger/tiers.ts#resolveTier from real net-sales/return history)
  // ---------------------------------------------------------------------
  const laylaUser = await prisma.user.create({ data: { name: "ليلى الحارثي", role: "creator", locale: "ar", ...seedContact("ليلى", "الحارثي", "layla") } });
  const layla = await prisma.creatorProfile.create({
    data: { userId: laylaUser.id, username: "layla", tier: "ELITE", bio: "Attar — Muttrah", legalName: "ليلى الحارثي", verificationStatus: "verified", kycSubmittedAt: new Date() },
  });

  const omarUser = await prisma.user.create({ data: { name: "عمر الكندي", role: "creator", locale: "ar", ...seedContact("عمر", "الكندي", "omar") } });
  const omar = await prisma.creatorProfile.create({
    data: { userId: omarUser.id, username: "omar", tier: "RISING", bio: "Dates — Nizwa", legalName: "عمر الكندي", verificationStatus: "verified", kycSubmittedAt: new Date() },
  });

  const noorUser = await prisma.user.create({ data: { name: "نور السالمي", role: "creator", locale: "ar", ...seedContact("نور", "السالمي", "noor") } });
  const noor = await prisma.creatorProfile.create({
    data: { userId: noorUser.id, username: "noor", tier: "RISING", bio: "Attar & dates — Muscat", legalName: "نور السالمي", verificationStatus: "verified", kycSubmittedAt: new Date() },
  });

  const sultanUser = await prisma.user.create({ data: { name: "سلطان البلوشي", role: "creator", locale: "ar", ...seedContact("سلطان", "البلوشي", "sultan") } });
  const sultan = await prisma.creatorProfile.create({
    data: { userId: sultanUser.id, username: "sultan", tier: "NEW", bio: "Dates — Salalah", legalName: "سلطان البلوشي", verificationStatus: "verified", kycSubmittedAt: new Date() },
  });

  const mayaUser = await prisma.user.create({ data: { name: "Maya Al Lawati", role: "creator", locale: "en", ...seedContact("Maya", "Al Lawati", "maya") } });
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
      creatorId: omar.id,
      productId: muttrahNight.id,
      merchantId: attarMerchant.id,
      note: "For a night-routine video before I add this as a deal.",
      status: "approved",
      respondedAt: daysAgo(2),
      depositAmount: 7,
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
      depositAmount: 11.25,
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
  // Ledger entries — the one true split computation, per order
  // ---------------------------------------------------------------------
  const dealSnapshotById = new Map(
    [laylaMuttrah, laylaRose, omarKhalas, omarTruffle, noorMuttrah, noorBasket, sultanKhalas].map((deal) => [
      deal.id,
      deal,
    ])
  );

  for (const order of createdOrders) {
    const deal = dealSnapshotById.get(order.dealId)!;
    const result = computeWaterfall({
      quantity: order.quantity,
      unitPriceCharged: order.unitPriceCharged,
      lockedUnitPrice: deal.lockedUnitPrice,
      lockedCommissionPct: deal.lockedCommissionPct,
      discountCapPct: deal.discountCapPct,
    });

    await prisma.ledgerEntry.create({
      data: {
        orderId: order.id,
        attributedGmv: result.attributedGmv,
        paymentFee: result.paymentFee,
        creatorShare: result.creatorShare,
        merchantShare: result.merchantShare,
        platformShare: result.platformShare,
        holdbackAmount: result.holdbackAmount,
        availableAmount: result.availableAmount,
        holdbackDays: result.holdbackDays,
      },
    });
  }

  const fulfilled = await prisma.order.findMany({
    where: { status: "fulfilled" },
    include: { ledgerEntry: true, deal: { include: { product: true } } },
  });
  for (const order of fulfilled) {
    if (!order.ledgerEntry) continue;
    await prisma.$transaction((tx) =>
      settleOrderOnFulfill({
        merchantId: order.deal.product.merchantId,
        orderId: order.id,
        line: order.ledgerEntry!,
        db: tx,
      })
    );
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
  const instantAmount =
    laylaBalances.availableBalance >= MIN_PAYOUT_OMR
      ? Math.min(laylaBalances.availableBalance, Math.round(Math.max(MIN_PAYOUT_OMR, laylaBalances.availableBalance * 0.5) * 100) / 100)
      : 0;
  if (instantAmount >= MIN_PAYOUT_OMR) {
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
  }

  const omarBalances = await balancesFor(omar.id);
  const scheduledAmount =
    omarBalances.availableBalance >= MIN_PAYOUT_OMR
      ? Math.round(omarBalances.availableBalance * 100) / 100
      : 0;
  if (scheduledAmount >= MIN_PAYOUT_OMR) {
    await prisma.payoutRequest.create({
      data: {
        creatorId: omar.id,
        type: "scheduled",
        amount: scheduledAmount,
        feeAmount: 0,
        status: "requested",
      },
    });
  }

  // ---------------------------------------------------------------------
  // Interactive demo — merchant storefront + buyer share loop
  // ---------------------------------------------------------------------
  await prisma.merchantStore.create({
    data: {
      merchantId: attarMerchant.id,
      slug: DEMO_STORE_SLUG,
      tagline: "Attars from Muttrah — share after you buy",
      aboutHtml:
        "<p>Authentic Omani attars from Muttrah souq. Buy COD, share your link, earn when friends visit and purchase.</p>",
      themeJson: serializeTheme({
        accent: "#B45309",
        heroStyle: "split",
        fontTone: "classic",
        layout: defaultStoreLayout(),
      }),
      offerHeadline: "Free delivery in Muscat",
      offerBody: "On orders over 20 OMR — pay cash on delivery.",
      offerActive: true,
      published: true,
      heroProductId: muttrahNight.id,
    },
  });

  for (const product of [muttrahNight, roseGarden, amberTravel]) {
    await ensureMerchantStoreDeal(product);
  }

  await prisma.performanceCampaign.createMany({
    data: [
      {
        productId: muttrahNight.id,
        merchantId: attarMerchant.id,
        status: "active",
        budgetCap: 200,
        budgetSpent: 8.5,
        visitRateSharer: 0,
        visitRateOrigin: 0,
        visitRateClipper: 0,
        purchasePctSharer: 0.1,
        purchasePctOrigin: 0.15,
        viewCpmOrigin: 2.5,
        ugcBrief:
          "Film an unboxing reel in natural light. Show the bottle label and your first impression — no stock footage.",
      },
      {
        productId: roseGarden.id,
        merchantId: attarMerchant.id,
        status: "active",
        budgetCap: 120,
        budgetSpent: 3.2,
        visitRateSharer: 0,
        visitRateOrigin: 0,
        visitRateClipper: 0,
        purchasePctSharer: 0.1,
        purchasePctOrigin: 0.12,
        viewCpmOrigin: 2.5,
        ugcBrief: "Short reel showing the rose scent profile and packaging.",
      },
    ],
  });

  const demoBuyerUser = await prisma.user.create({
    data: {
      name: "زائر تجريبي",
      role: "creator",
      locale: "ar",
      firstName: "زائر",
      lastName: "تجريبي",
      phone: "+96890001111",
      email: DEMO_BUYER_EMAIL,
      profileCompletedAt: new Date(),
    },
  });
  const demoBuyer = await prisma.creatorProfile.create({
    data: {
      userId: demoBuyerUser.id,
      username: "demo-buyer",
      tier: "NEW",
      bio: "حساب تجريبي — جرّب رحلة المشتري والمشاركة",
      legalName: "زائر تجريبي",
      verificationStatus: "verified",
      kycSubmittedAt: new Date(),
    },
  });

  const demoStoreDealId = await ensureMerchantStoreDeal(muttrahNight);
  const demoOrder = await prisma.order.create({
    data: {
      dealId: demoStoreDealId,
      buyerName: "زائر تجريبي",
      buyerPhone: "+96890001111",
      buyerCity: "مسقط",
      buyerAddress: "حي مطرح، قرب السوق",
      quantity: 1,
      unitPriceCharged: 28,
      currency: "OMR",
      attributionSource: "direct",
      trackingToken: DEMO_ORDER_TOKEN,
      escrowStatus: "held",
      status: "confirmed",
      createdAt: daysAgo(0),
    },
  });

  const demoEntitlement = await grantShareEntitlementOnPurchase({
    orderId: demoOrder.id,
    productId: muttrahNight.id,
    buyerName: demoOrder.buyerName,
    buyerPhone: demoOrder.buyerPhone,
    orderedAt: demoOrder.createdAt,
    db: prisma,
  });

  await prisma.shareEntitlement.update({
    where: { id: demoEntitlement.id },
    data: {
      status: "claimed",
      creatorId: demoBuyer.id,
      claimedAt: new Date(),
      role: "origin",
    },
  });

  // ---------------------------------------------------------------------
  // Competitor Radar sample project & competitors for Demo Merchant
  // ---------------------------------------------------------------------
  const frankincenseProject = await prisma.competitorProject.create({
    data: {
      userId: attarUser.id,
      name: "عطور ولبان حوجري عماني",
      productKeyword: "عطور لبان",
      targetMarket: "OM",
      niche: "العطور واللبان الفاخر",
      platforms: "meta,tiktok",
      competitors: {
        create: [
          {
            name: "دار الأريج للعطور الفاخرة",
            domain: "alareej-perfumes.com",
            brandHandle: "@alareej_om",
            market: "OM",
            threatScore: 88,
            relevanceScore: 94,
            activityScore: 82,
            creativeScore: 78,
            offerScore: 70,
            confidenceScore: 90,
            tier: "direct",
            activeAdsCount: 9,
            platforms: "meta,tiktok",
            primaryOffer: "خصم 20% عند شراء زجاجتين",
            priceRange: "28 - 45 ر.ع.",
            shippingOffer: "توصيل خلال 4-5 أيام (رسوم 2 ر.ع.)",
            guaranteeOffer: "استرجاع خلال 3 أيام فقط",
            ads: {
              create: [
                {
                  platform: "meta",
                  format: "video",
                  headline: "سر الفخامة العمانية برائحة اللبان الحوجري الملكي",
                  bodyCopy: "مستخلص من أجود أشجار لبان ظفار بتركيز وثبات يدوم 48 ساعة. اطلب الآن مع التوصيل لكل المحافظات.",
                  hook: "هل جربت لبان ظفار الحقيقي مع العود الملكي؟",
                  painPoint: "العطور التجارية تفقد رائحتها بعد ساعتين",
                  promise: "ثبات وفواحان ملكي مضمون ليومين كاملين",
                  proof: "تقييم 4.9 نجوم من أكثر من 1,200 عميل في مسقط",
                  offer: "احصل على عينة مجانية مع كل طلب",
                  cta: "تسوق الآن عبر الرابط",
                  daysActive: 42,
                  isActive: true,
                  spendVelocity: "high",
                },
                {
                  platform: "tiktok",
                  format: "video",
                  headline: "فتح صندوق (Unboxing) عطر لبان حوجري",
                  bodyCopy: "شوفوا كيف التغليف الفاخر! هدية تليق بالمناسبات الرسمية.",
                  hook: "هذا العطر خلا كل من يقابلني يسألني وش ريحتك!",
                  painPoint: "صعوبة العثور على هدية فاخرة بسعر مناسب",
                  promise: "تغليف هدايا ملكي مجاني",
                  proof: "فيديو UGC حقيقي بمشاهدات تجاوزت 180 ألف",
                  offer: "توصيل مجاني للطلبات فوق 30 ر.ع.",
                  cta: "اطلب الآن قبل نفاد الكمية",
                  daysActive: 28,
                  isActive: true,
                  spendVelocity: "high",
                },
              ],
            },
            weaknesses: {
              create: [
                {
                  type: "shipping",
                  title: "بطء التوصيل ورسوم إضافية على المحافظات",
                  description: "المنافس يفرض رسوم توصيل 2 ر.ع. ويستغرق 4-5 أيام للوصول لصلالة والشرقية.",
                  evidence: "مراجعات العملاء وتفاصيل صفحة الدفع تؤكد تأخر التسليم.",
                  confidence: "high",
                  exploitationAngle: "اعرض 'توصيل فوري خلال 24 ساعة ومجاناً عند الدفع عند الاستلام'.",
                },
                {
                  type: "trust",
                  title: "سياسة استرجاع معقدة وقصيرة جداً (3 أيام)",
                  description: "عدم إتاحة تجربة العينة قبل فتح العلبة الأساسية يولد تردداً كبيراً لدى المشتري الجديد.",
                  evidence: "صفحة الشروط والأحكام الخاصة بمتجرهم تمنع إرجاع العطور المفتوحة.",
                  confidence: "high",
                  exploitationAngle: "قدّم 'ضمان الاسترجاع الذهبي 14 يوماً مع عينة تجربة مجانية خارجية'.",
                },
              ],
            },
            analyses: {
              create: {
                creativeStrategy: "التركيز على الفخامة والتراث العماني مع مقاطع تصوير بطيء للبان الحوجري المشتعل.",
                offerStrategy: "خصومات كميات تقليدية دون عروض باقات ذكية أو هدايا استثنائية.",
                positioning: "عطور مناسبات فخمة وراقية.",
                strengthsJson: JSON.stringify(["جودة عالية في إنتاج الفيديو الإعلاني", "استمرارية الصرف على نفس الخطاف لأكثر من شهر"]),
                counterAnglesJson: JSON.stringify(["زاوية الاستخدام اليومي المنعش", "ضمان الثبات بالتجربة المجانية"]),
                estimatedVelocity: "scaling",
                aiSummary: "منافس مباشر قوي في جودة التصوير، لكنه يعاني من فجوة في سرعة الشحن وسهولة الضمان.",
              },
            },
          },
          {
            name: "عبير الأصالة للعود واللبان",
            domain: "abeer-alasala.om",
            brandHandle: "@abeer_om",
            market: "OM",
            threatScore: 72,
            relevanceScore: 86,
            activityScore: 68,
            creativeScore: 62,
            offerScore: 75,
            confidenceScore: 85,
            tier: "direct",
            activeAdsCount: 5,
            platforms: "meta",
            primaryOffer: "اشتر 1 واحصل على الثاني بنصف السعر",
            priceRange: "22 - 38 ر.ع.",
            shippingOffer: "توصيل عادي 3 ر.ع.",
            guaranteeOffer: "لا يوجد ضمان استرجاع صريح",
            ads: {
              create: [
                {
                  platform: "meta",
                  format: "carousel",
                  headline: "باقة اللبان الظفاري اليومية",
                  bodyCopy: "3 روائح مميزة تناسب صباحك ومساءك. عطور أصيلة من قلب عمان.",
                  hook: "ليش تشتري عطر واحد إذا تقدر تاخذ الباقة كاملة؟",
                  painPoint: "الحيرة في اختيار الرائحة المناسبة",
                  promise: "تشكيلة متكاملة تناسب كل الأوقات",
                  proof: "شهادات عملاء في ستوري الانستغرام",
                  offer: "خصم 30% على المجموعة الكاملة",
                  cta: "شاهد المجموعة",
                  daysActive: 19,
                  isActive: true,
                  spendVelocity: "medium",
                },
              ],
            },
            weaknesses: {
              create: [
                {
                  type: "creative",
                  title: "إعلانات صور ثابتة وغير تفاعلية (Creative Fatigue)",
                  description: "يعتمد بشكل مفرط على صور ثابتة وتصاميم كانفا دون مقاطع فيديو UGC حقيقية.",
                  evidence: "مكتبة إعلانات Meta تظهر 80% صور بدون حركة أو سرد قصصي.",
                  confidence: "high",
                  exploitationAngle: "استخدم إعلانات فيديو تفاعلية وسريعة الإيقاع تظهر فوحان الرائحة وردود الأفعال الحية.",
                },
              ],
            },
          },
        ],
      },
      opportunities: {
        create: [
          {
            type: "white_space",
            title: "عطر اللبان الحوجري اليومي الخفيف للعمل والدوام",
            description: "كل المنافسين يركزون على 'المناسبات الثقيلة والليلية'. هناك فراغ تسويقي كبير لعطر لبان منعش وخفيف للاستخدام المكتبي واليومي.",
            opportunityScore: 92,
            competitionLevel: "low",
            recommendedDirection: "إطلاق حملة تستهدف الموظفين ورواد الأعمال بزاوية 'فخامة وانتعاش يدوم معك طوال ساعات العمل'.",
            suggestedHooksJson: JSON.stringify([
              "عطر الدوام اللي ما يصدع راسك بريحته القوية!",
              "كيف تبدأ يومك بانتعاش اللبان الحوجري الطبيعي 100%؟",
              "عطر فخم ومريح للاجتماعات الطويلة بدون إزعاج.",
            ]),
            suggestedOffersJson: JSON.stringify([
              "باقة الدوام: زجاجة للمكتب + زجاجة ميني للجيب والسيارة",
              "عينة تجربة مجانية تصل قبل فتح الزجاجة الرئيسية",
            ]),
          },
          {
            type: "offer_gap",
            title: "باقة الهدايا الملكية مع التوصيل المباشر للمهدى إليه",
            description: "المنافسون لا يقدمون خدمة كتابة بطاقة إهداء مخصصة وشحن مباشر كهدية مغلفة.",
            opportunityScore: 85,
            competitionLevel: "low",
            recommendedDirection: "إضافة خيار 'أرسلها كهدية' مع كرت إهداء فاخر وتغليف ملكي بدون فواتير سعرية.",
            suggestedHooksJson: JSON.stringify([
              "تبي تهدي شخص غالي هدية ترفع الراس بدون ما تطلع من بيتك؟",
              "أجمل هدية عمانية توصل لباب بيته مغلفة وجاهزة.",
            ]),
            suggestedOffersJson: JSON.stringify([
              "تغليف هدية مجاني + كرت إهداء بخط يدوي فاخر",
            ]),
          },
        ],
      },
    },
  });

  console.log("Seed complete:");
  console.log(`  Merchants: 3 (2 verified, 1 pending)`);
  console.log(`  Competitor Radar Project: ${frankincenseProject.name}`);
  console.log(`  Creators: 6 (+ demo-buyer for interactive demo)`);
  console.log(`  Products: 8 across attar/dates/home`);
  console.log(`  Deals: 7 + merchant_store deals for Muttrah Attars`);
  console.log(`  Orders: ${createdOrders.length + 1} (+ demo buyer order)`);
  console.log(`  Demo store: /m/${DEMO_STORE_SLUG}`);
  console.log(`  Demo order: /order/${DEMO_ORDER_TOKEN}`);
  console.log(`  Payout requests: 2 (1 instant/paid, 1 scheduled/requested)`);
  console.log(`  Sample requests: 2 (RISING deposits at 25%; NEW uses media kit)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
