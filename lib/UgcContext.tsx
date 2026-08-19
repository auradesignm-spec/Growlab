"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Creator,
  Merchant,
  Product,
  Order,
  LeaderboardEntry,
  CurrencyCode,
  LanguageCode,
  UserRole,
  TimePeriod,
  ProductCategory,
  OrderSplit,
  Gender,
  CountryCode,
} from "./ugc-types";
import {
  INITIAL_CREATORS,
  INITIAL_MERCHANTS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  calculateOrderSplit,
  computeLeaderboardScore,
  convertPrice,
} from "./ugc-store";

export interface CartItem {
  product: Product;
  quantity: number;
  creatorId?: string;
}

interface PlaceOrderParams {
  productId: string;
  creatorId: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerCountry: CountryCode;
  quantity?: number;
  currency?: CurrencyCode;
}

interface UgcContextType {
  creators: Creator[];
  merchants: Merchant[];
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, creatorId?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalUSD: number;
  cartItemCount: number;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeCreatorId: string;
  setActiveCreatorId: (id: string) => void;
  activeMerchantId: string;
  setActiveMerchantId: (id: string) => void;
  currentCurrency: CurrencyCode;
  setCurrentCurrency: (curr: CurrencyCode) => void;
  currentLanguage: LanguageCode;
  setCurrentLanguage: (lang: LanguageCode) => void;
  // Actions
  placeOrder: (params: PlaceOrderParams) => { order: Order; split: OrderSplit };
  toggleCreatorProduct: (creatorId: string, productId: string) => void;
  registerCreator: (creatorData: Partial<Creator>) => Creator;
  registerMerchant: (merchantData: Partial<Merchant>) => Merchant;
  addProduct: (productData: Partial<Product>) => Product;
  getCreatorByUsername: (username: string) => Creator | undefined;
  getProductsForCreator: (creatorId: string) => Product[];
  getLeaderboard: (period?: TimePeriod, category?: ProductCategory | "all") => LeaderboardEntry[];
  resetToDefaults: () => void;
}

const UgcContext = createContext<UgcContextType | null>(null);

const STORAGE_KEY = "growlab_ugc_state_v1";

export const UgcProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [creators, setCreators] = useState<Creator[]>(INITIAL_CREATORS);
  const [merchants, setMerchants] = useState<Merchant[]>(INITIAL_MERCHANTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeRole, setActiveRole] = useState<UserRole>("visitor");
  const [activeCreatorId, setActiveCreatorId] = useState<string>("c_salem");
  const [activeMerchantId, setActiveMerchantId] = useState<string>("m_royal_oud");
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>("OMR");
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("ar");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.creators) setCreators(parsed.creators);
        if (parsed.merchants) setMerchants(parsed.merchants);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.cart) setCart(parsed.cart);
        if (parsed.currentCurrency) setCurrentCurrency(parsed.currentCurrency);
      }
    } catch (e) {
      console.error("Failed to load UGC state from local storage", e);
    }
  }, []);

  // Save changes to local storage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          creators,
          merchants,
          products,
          orders,
          cart,
          currentCurrency,
        })
      );
    } catch (e) {
      console.error("Failed to persist UGC state", e);
    }
  }, [creators, merchants, products, orders, cart, currentCurrency]);

  const addToCart = (product: Product, quantity = 1, creatorId?: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, creatorId: creatorId || creators[0]?.id }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalUSD = cart.reduce(
    (sum, item) => sum + item.product.priceUSD * item.quantity,
    0
  );

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = ({
    productId,
    creatorId,
    customerName,
    customerPhone,
    customerCity,
    customerCountry,
    quantity = 1,
    currency = currentCurrency,
  }: PlaceOrderParams): { order: Order; split: OrderSplit } => {
    const product = products.find((p) => p.id === productId) || products[0];
    const creator = creators.find((c) => c.id === creatorId) || creators[0];
    const merchant = merchants.find((m) => m.id === product.merchantId) || merchants[0];

    const totalPriceUSD = product.priceUSD * quantity;
    const split = calculateOrderSplit(totalPriceUSD, product.commissionRate, creator.isFirstCampaignFree);

    const converted = convertPrice(totalPriceUSD, currency);

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: `GL-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      creatorId: creator.id,
      creatorUsername: creator.username,
      merchantId: merchant.id,
      merchantName: merchant.businessName,
      customerName,
      customerPhone,
      customerCity,
      customerCountry,
      quantity,
      currency,
      paidAmountLocal: converted.amount,
      splits: split,
      status: "completed",
      attributionSource: "creator_storefront",
    };

    // Update orders list
    setOrders((prev) => [newOrder, ...prev]);

    // Update creator stats
    setCreators((prev) =>
      prev.map((c) => {
        if (c.id === creator.id) {
          const newSalesValue = c.stats.salesValue + totalPriceUSD;
          const newOrderCount = c.stats.orderCount + 1;
          const newTotalComm = c.stats.totalCommission + split.creatorCommissionUSD;
          const newPendingPayout = c.stats.pendingPayout + split.creatorCommissionUSD;
          // Dynamically adjust conversion rate slightly up
          const newConvRate = Math.min(12.5, Number((c.stats.conversionRate + 0.05).toFixed(1)));

          return {
            ...c,
            // If was first campaign free, after 1 order it can either stay or mark handled
            isFirstCampaignFree: false,
            stats: {
              ...c.stats,
              salesValue: newSalesValue,
              orderCount: newOrderCount,
              totalCommission: newTotalComm,
              pendingPayout: newPendingPayout,
              conversionRate: newConvRate,
            },
          };
        }
        return c;
      })
    );

    // Update merchant stats
    setMerchants((prev) =>
      prev.map((m) => {
        if (m.id === merchant.id) {
          return {
            ...m,
            totalOrders: m.totalOrders + 1,
            netRevenue: m.netRevenue + split.merchantAmountUSD,
          };
        }
        return m;
      })
    );

    // Decrement product inventory
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, stock: Math.max(0, p.stock - quantity) } : p))
    );

    return { order: newOrder, split };
  };

  const toggleCreatorProduct = (creatorId: string, productId: string) => {
    setCreators((prev) =>
      prev.map((c) => {
        if (c.id === creatorId) {
          const exists = c.selectedProductIds.includes(productId);
          const updated = exists
            ? c.selectedProductIds.filter((id) => id !== productId)
            : [...c.selectedProductIds, productId];
          return { ...c, selectedProductIds: updated };
        }
        return c;
      })
    );
  };

  const registerCreator = (creatorData: Partial<Creator>): Creator => {
    const newCreator: Creator = {
      id: `c_${Date.now()}`,
      username: creatorData.username || `creator_${Math.floor(1000 + Math.random() * 9000)}`,
      displayName: creatorData.displayName || "صانع محتوى جديد",
      displayNameEn: creatorData.displayNameEn || "New Creator",
      bio: creatorData.bio || "مرحباً بكم في متجري المصغر في Growlab!",
      bioEn: creatorData.bioEn || "Welcome to my curated Growlab storefront!",
      avatar:
        creatorData.avatar ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      banner:
        creatorData.banner ||
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
      gender: creatorData.gender || "unisex",
      country: creatorData.country || "OM",
      language: creatorData.language || "ar",
      subscriptionTier: creatorData.subscriptionTier || "free",
      verifiedAt: new Date().toISOString(),
      isFirstCampaignFree: true, // First product campaign with 0% platform fee!
      paymentVerified: true,
      paymentMethod: creatorData.paymentMethod || {
        type: "card",
        identifier: "•••• 4242",
        bankName: "Verified Account",
      },
      socialLinks: creatorData.socialLinks || {
        instagram: "@new_creator",
        followersCount: "10K",
      },
      selectedProductIds: creatorData.selectedProductIds || ["prod_smart_mic", "prod_oud_sultan"],
      stats: {
        salesValue: 0,
        conversionRate: 5.0,
        orderCount: 0,
        totalCommission: 0,
        pendingPayout: 0,
        profileViews: 120,
      },
      badges: [
        {
          id: "b_verified_id",
          title: "حساب موثق بهوية وطنية",
          titleEn: "ID Verified",
          description: "تم التحقق من وسيلة الدفع والهوية بنجاح",
          icon: "🛡️",
          unlockedAt: new Date().toISOString(),
        },
      ],
    };

    setCreators((prev) => [newCreator, ...prev]);
    setActiveCreatorId(newCreator.id);
    setActiveRole("creator");
    return newCreator;
  };

  const registerMerchant = (merchantData: Partial<Merchant>): Merchant => {
    const newMerchant: Merchant = {
      id: `m_${Date.now()}`,
      businessName: merchantData.businessName || "علامة تجارية جديدة",
      businessNameEn: merchantData.businessNameEn || "New Brand",
      logo:
        merchantData.logo ||
        "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=150&auto=format&fit=crop&q=80",
      country: merchantData.country || "OM",
      category: merchantData.category || "tech",
      verifiedAt: new Date().toISOString(),
      contactEmail: merchantData.contactEmail || "business@growlab.com",
      phone: merchantData.phone || "+968 9000 0000",
      rating: 5.0,
      totalOrders: 0,
      netRevenue: 0,
    };

    setMerchants((prev) => [newMerchant, ...prev]);
    setActiveMerchantId(newMerchant.id);
    setActiveRole("merchant");
    return newMerchant;
  };

  const addProduct = (productData: Partial<Product>): Product => {
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      merchantId: productData.merchantId || activeMerchantId,
      merchantName:
        merchants.find((m) => m.id === (productData.merchantId || activeMerchantId))?.businessName ||
        "متجر معتمد",
      name: productData.name || "منتج تجاري مميز",
      nameEn: productData.nameEn || "Featured Product",
      description: productData.description || "وصف المنتج التفصيلي ونقاط القوة والمزايا.",
      descriptionEn: productData.descriptionEn || "Detailed product description and specs.",
      category: productData.category || "lifestyle",
      genderTarget: productData.genderTarget || "all",
      priceUSD: productData.priceUSD || 50,
      costUSD: productData.costUSD || 15,
      commissionRate: productData.commissionRate || 0.18,
      image:
        productData.image ||
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80",
      stock: productData.stock || 50,
      rating: 5.0,
      reviewsCount: 1,
      sellingPoints: productData.sellingPoints || ["جودة عالية", "توصيل سريع", "ضمان ذهبي"],
      isFeatured: true,
    };

    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const getCreatorByUsername = (username: string) => {
    return creators.find((c) => c.username.toLowerCase() === username.toLowerCase());
  };

  const getProductsForCreator = (creatorId: string): Product[] => {
    const creator = creators.find((c) => c.id === creatorId);
    if (!creator) return products;
    return products.filter((p) => creator.selectedProductIds.includes(p.id));
  };

  const getLeaderboard = (
    period: TimePeriod = "weekly",
    category: ProductCategory | "all" = "all"
  ): LeaderboardEntry[] => {
    let list = [...creators];

    // Filter by category if specified
    if (category !== "all") {
      // Creator qualifies if they promote products in this category
      list = list.filter((c) => {
        const creatorProducts = products.filter((p) => c.selectedProductIds.includes(p.id));
        return creatorProducts.some((p) => p.category === category);
      });
    }

    // Time window multiplier simulation
    const multiplier = period === "weekly" ? 0.35 : period === "monthly" ? 1.0 : 2.5;

    const entries: LeaderboardEntry[] = list.map((c) => {
      const sales = Math.round(c.stats.salesValue * multiplier);
      const ordersCount = Math.round(c.stats.orderCount * multiplier);
      const score = computeLeaderboardScore(sales, c.stats.conversionRate, ordersCount);

      // Determine top category promoted
      const creatorProds = products.filter((p) => c.selectedProductIds.includes(p.id));
      const cat = creatorProds[0]?.category || "tech";

      return {
        rank: 1,
        creatorId: c.id,
        username: c.username,
        displayName: c.displayName,
        avatar: c.avatar,
        category: cat,
        country: c.country,
        gender: c.gender,
        subscriptionTier: c.subscriptionTier,
        salesValueUSD: sales,
        conversionRate: c.stats.conversionRate,
        orderCount: ordersCount,
        compositeScore: score,
        badgeTitle: c.badges[0]?.title,
      };
    });

    // Sort descending by composite score
    entries.sort((a, b) => b.compositeScore - a.compositeScore);

    // Assign 1-indexed ranks
    return entries.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));
  };

  const resetToDefaults = () => {
    setCreators(INITIAL_CREATORS);
    setMerchants(INITIAL_MERCHANTS);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <UgcContext.Provider
      value={{
        creators,
        merchants,
        products,
        orders,
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotalUSD,
        cartItemCount,
        activeRole,
        setActiveRole,
        activeCreatorId,
        setActiveCreatorId,
        activeMerchantId,
        setActiveMerchantId,
        currentCurrency,
        setCurrentCurrency,
        currentLanguage,
        setCurrentLanguage,
        placeOrder,
        toggleCreatorProduct,
        registerCreator,
        registerMerchant,
        addProduct,
        getCreatorByUsername,
        getProductsForCreator,
        getLeaderboard,
        resetToDefaults,
      }}
    >
      {children}
    </UgcContext.Provider>
  );
};

export const useUgc = () => {
  const context = useContext(UgcContext);
  if (!context) {
    throw new Error("useUgc must be used within a UgcProvider");
  }
  return context;
};
