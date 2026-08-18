"use client";

import { useState } from "react";
import { Order } from "./types";
import {
  ShoppingBag,
  CheckCircle2,
  Truck,
  Phone,
  MapPin,
  MessageSquare,
  Search,
  Filter,
  Check,
  Clock,
  DollarSign,
  ExternalLink,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface OrdersManagerProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order["status"]) => void;
  commissionRate: number;
}

export default function OrdersManager({
  orders,
  onUpdateOrderStatus,
  commissionRate,
}: OrdersManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm) ||
      o.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSales = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const aiClosedOrders = orders.filter((o) => o.status !== "cancelled").length;
  const totalCommissionEarned = (totalSales * (commissionRate / 100)).toFixed(2);

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "confirmed_by_ai":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-teal/15 px-2.5 py-0.5 text-xs font-mono font-bold text-teal">
            <CheckCircle2 className="h-3 w-3" />
            <span>مؤكد بواسطة الذكاء الاصطناعي</span>
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-mono font-bold text-blue-600">
            <Truck className="h-3 w-3" />
            <span>تم الشحن مع المندوب</span>
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-600/15 px-2.5 py-0.5 text-xs font-mono font-bold text-green-700">
            <Check className="h-3 w-3" />
            <span>تم التوصيل واستلام المبلغ</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-danger/15 px-2.5 py-0.5 text-xs font-mono font-bold text-danger">
            <span>ملغي من العميل</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-paper px-2.5 py-0.5 text-xs font-mono text-muted">
            <Clock className="h-3 w-3" />
            <span>قيد المراجعة</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Quick Summary */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-black text-ink">
            الطلبات المؤكدة وإغلاقات الذكاء الاصطناعي
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            سجل حي وفوري لكافة الطلبات التي أغلقها وكيل الذكاء الاصطناعي وثبت بيانات شحنها تلقائياً.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-2.5 text-center">
            <span className="block font-mono text-[10px] text-muted">عمولة الأداء ({commissionRate}%)</span>
            <span className="font-mono text-sm font-black text-gold">${totalCommissionEarned}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بالاسم، رقم الهاتف، الولاية، أو المنتج..."
            className="w-full rounded-xl border border-line bg-paper/50 py-2.5 pr-10 pl-4 text-xs sm:text-sm text-ink placeholder:text-muted focus:border-gold focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "جميع الطلبات" },
            { id: "confirmed_by_ai", label: "مؤكد بالذكاء" },
            { id: "shipped", label: "مشحون" },
            { id: "delivered", label: "تم الاستلام" },
            { id: "cancelled", label: "ملغي" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st.id
                  ? "bg-ink text-onDark shadow-xs"
                  : "bg-paper text-muted hover:bg-paper-alt hover:text-ink"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-right text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-line bg-paper/60 font-mono text-xs text-muted">
                <th className="p-4">رقم الطلب والتوقيت</th>
                <th className="p-4">العميل والتواصل</th>
                <th className="p-4">المنتج والكمية</th>
                <th className="p-4">المبلغ والدفع</th>
                <th className="p-4">حالة الطلب</th>
                <th className="p-4 text-center">إجراءات وتفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="transition-colors hover:bg-paper-alt/30">
                  <td className="p-4 font-mono">
                    <span className="block font-bold text-ink">{o.id}</span>
                    <span className="text-[11px] text-muted">{o.createdAt}</span>
                    <span className="inline-block mt-1 rounded bg-teal/10 px-1.5 py-0.5 text-[10px] font-mono text-teal">
                      {o.source === "whatsapp_ai" ? "واتساب ذكي" : "إعلان إنستغرام"}
                    </span>
                  </td>

                  <td className="p-4">
                    <b className="block text-ink text-sm">{o.customerName}</b>
                    <div className="flex items-center gap-1 text-muted text-xs font-mono mt-0.5">
                      <Phone className="h-3 w-3 text-gold" />
                      <span dir="ltr">{o.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted text-xs mt-0.5">
                      <MapPin className="h-3 w-3 text-teal" />
                      <span>{o.city}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="block font-semibold text-ink line-clamp-1">{o.productName}</span>
                    <span className="font-mono text-xs text-muted">الكمية: {o.quantity} قطع</span>
                  </td>

                  <td className="p-4 font-mono">
                    <span className="block font-bold text-ink text-base">${o.totalAmount}</span>
                    <span className="text-[11px] text-muted">
                      {o.paymentMethod === "cash_on_delivery" ? "الدفع عند الاستلام" : "رابط دفع إلكتروني"}
                    </span>
                  </td>

                  <td className="p-4">
                    {getStatusBadge(o.status)}
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="inline-flex items-center gap-1 rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink hover:border-gold hover:bg-gold/10 transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-gold" />
                      <span>سجل المحادثة</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversation & Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-teal">تفاصيل الطلب {selectedOrder.id}</span>
                <h3 className="font-display text-lg font-bold text-ink">{selectedOrder.customerName}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg border border-line p-1.5 text-muted hover:bg-paper hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="rounded-xl bg-paper p-4 space-y-2 border border-line">
                <div className="flex justify-between">
                  <span className="text-muted">رقم الهاتف:</span>
                  <span className="font-mono font-bold text-ink" dir="ltr">{selectedOrder.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">المدينة والعنوان:</span>
                  <span className="font-semibold text-ink text-left max-w-[65%]">{selectedOrder.city} — {selectedOrder.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">المنتج:</span>
                  <span className="font-semibold text-ink">{selectedOrder.productName} (x{selectedOrder.quantity})</span>
                </div>
                <div className="flex justify-between border-t border-line/80 pt-2 font-mono">
                  <span className="text-ink font-bold">إجمالي المبلغ:</span>
                  <span className="text-teal font-black text-base">${selectedOrder.totalAmount}</span>
                </div>
              </div>

              {/* AI Conversation Snippet */}
              <div className="rounded-xl border border-gold/40 bg-ink p-4 text-onDark">
                <div className="flex items-center gap-1.5 font-mono text-xs text-gold-soft mb-2">
                  <Sparkles className="h-4 w-4 text-gold" />
                  <span>ملخص إغلاق الوكيل الذكي (AI Sales Log):</span>
                </div>
                <p className="text-xs text-onDarkSoft leading-relaxed">
                  {selectedOrder.aiConversationSnippet}
                </p>
              </div>

              {/* Status Updater */}
              <div>
                <label className="mb-1.5 block font-mono text-xs font-semibold text-ink">
                  تحديث حالة التوصيل والتنفيذ:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["confirmed_by_ai", "shipped", "delivered"] as Order["status"][]).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        onUpdateOrderStatus(selectedOrder.id, st);
                        setSelectedOrder({ ...selectedOrder, status: st });
                      }}
                      className={`rounded-lg border py-2 text-xs font-mono font-semibold transition-all ${
                        selectedOrder.status === st
                          ? "border-teal bg-teal/15 text-teal"
                          : "border-line bg-paper text-muted hover:text-ink"
                      }`}
                    >
                      {st === "confirmed_by_ai" ? "مؤكد" : st === "shipped" ? "مشحون" : "تم التوصيل"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/${selectedOrder.customerPhone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-xs font-bold text-white hover:opacity-90 shadow-md"
                >
                  <Phone className="h-4 w-4" />
                  <span>فتح محادثة واتساب مع العميل</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
