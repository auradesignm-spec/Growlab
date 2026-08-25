"use client";

import { useMemo, useState } from "react";
import {
  BUSINESS_TYPES,
  VALUE_PROPS,
  filterBusinessTypes,
  collageForType,
  type BusinessType,
  type ValueProp,
  ODOO_PURPLE,
  ODOO_TEAL,
} from "@/lib/merchant-store/configurator";

export interface ConfiguratorResult {
  businessType: BusinessType;
  valueProp: ValueProp;
  businessDetail: string;
}

export default function StoreConfigurator({
  locale,
  businessName,
  initialType,
  onComplete,
  onSkip,
  labels,
}: {
  locale: "ar" | "en";
  businessName: string;
  initialType: BusinessType;
  onComplete: (result: ConfiguratorResult) => void;
  onSkip: () => void;
  labels: {
    want: string;
    ecommerce: string;
    forMy: string;
    business: string;
    withA: string;
    detailPlaceholder: string;
    skip: string;
    continue: string;
    pickType: string;
    pickValue: string;
  };
}) {
  const [phase, setPhase] = useState<"type" | "detail" | "value">("type");
  const [typeOpen, setTypeOpen] = useState(true);
  const [valueOpen, setValueOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>(initialType);
  const [businessDetail, setBusinessDetail] = useState(businessName);
  const [valueProp, setValueProp] = useState<ValueProp | null>(null);

  const filtered = useMemo(() => filterBusinessTypes(query), [query]);
  const values = VALUE_PROPS[businessType.id] ?? VALUE_PROPS.ecommerce;
  const collage = collageForType(businessType.id);
  const typeLabel = locale === "ar" ? businessType.labelAr : businessType.labelEn;

  function pickType(type: BusinessType) {
    setBusinessType(type);
    setTypeOpen(false);
    setQuery("");
    setPhase("detail");
    setValueProp(null);
  }

  function pickValue(v: ValueProp) {
    setValueProp(v);
    setValueOpen(false);
    onComplete({ businessType, valueProp: v, businessDetail: businessDetail.trim() || businessName });
  }

  return (
    <div className="relative grid min-h-[70vh] grid-cols-1 bg-[#F8F9FA] lg:grid-cols-[1fr_1.1fr]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(circle, #CBD5E1 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
        }}
        aria-hidden
      />

      {/* Dynamic collage — left on LTR visual / first on mobile */}
      <div className="relative z-[1] hidden items-center justify-center p-8 lg:flex">
        <div className="relative h-[420px] w-full max-w-md">
          {collage.map((src, i) => (
            <div
              key={`${businessType.id}-${src}-${i}`}
              className="absolute overflow-hidden rounded-2xl border border-white/80 bg-white shadow-lg transition-all duration-500"
              style={{
                width: i === 0 ? "58%" : "46%",
                top: i === 0 ? "8%" : i === 1 ? "42%" : "18%",
                left: i === 0 ? "8%" : i === 1 ? "48%" : "52%",
                zIndex: 3 - i,
                transform: `rotate(${i === 0 ? -4 : i === 1 ? 6 : -10}deg)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-[1] flex flex-col justify-center px-6 py-16 sm:px-10">
        <p className="text-[28px] font-light leading-[1.45] text-[#3F3F46] sm:text-[36px]" style={{ letterSpacing: "normal" }}>
          {labels.want}{" "}
          <button
            type="button"
            onClick={() => {
              setPhase("type");
              setTypeOpen(true);
            }}
            className="inline border-b-2 px-0.5 font-normal text-[#18181B]"
            style={{ borderColor: ODOO_PURPLE }}
          >
            {labels.ecommerce}
          </button>{" "}
          {labels.forMy}
        </p>

        <div className="mt-4">
          {phase === "type" || typeOpen ? (
            <div className="relative max-w-md">
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setTypeOpen(true);
                }}
                placeholder={labels.pickType}
                className="w-full border-0 border-b-2 bg-transparent py-2 text-[22px] text-[#18181B] outline-none placeholder:text-[#A1A1AA]"
                style={{ borderColor: ODOO_PURPLE, letterSpacing: "normal" }}
              />
              {typeOpen && (
                <ul className="absolute inset-x-0 top-full z-10 mt-2 max-h-64 overflow-y-auto rounded-lg border border-[#E4E4E7] bg-white py-1 shadow-lg">
                  {(filtered.length ? filtered : BUSINESS_TYPES).map((type) => (
                    <li key={type.id}>
                      <button
                        type="button"
                        onClick={() => pickType(type)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-start text-[15px] text-[#3F3F46] hover:bg-[#F4F4F5]"
                        style={{ letterSpacing: "normal" }}
                      >
                        <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: type.accent }} />
                        {locale === "ar" ? type.labelAr : type.labelEn}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setPhase("type");
                setTypeOpen(true);
              }}
              className="border-b-2 text-[22px] font-normal text-[#18181B]"
              style={{ borderColor: ODOO_PURPLE, letterSpacing: "normal" }}
            >
              {typeLabel}
            </button>
          )}
        </div>

        {(phase === "detail" || phase === "value") && (
          <div className="mt-8">
            <p className="text-[28px] font-light text-[#3F3F46] sm:text-[32px]" style={{ letterSpacing: "normal" }}>
              {labels.business}
            </p>
            <input
              autoFocus={phase === "detail"}
              value={businessDetail}
              onChange={(e) => setBusinessDetail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && businessDetail.trim()) {
                  setPhase("value");
                  setValueOpen(true);
                }
              }}
              placeholder={labels.detailPlaceholder}
              className="mt-2 w-full max-w-xl border-0 border-b border-[#D4D4D8] bg-transparent py-2 text-[20px] text-[#18181B] outline-none placeholder:text-[#A1A1AA]"
              style={{ letterSpacing: "normal" }}
            />
            {phase === "detail" ? (
              <button
                type="button"
                disabled={!businessDetail.trim()}
                onClick={() => {
                  setPhase("value");
                  setValueOpen(true);
                }}
                className="mt-6 rounded px-5 py-2.5 text-[14px] font-medium text-white disabled:opacity-40"
                style={{ backgroundColor: ODOO_PURPLE }}
              >
                {labels.continue}
              </button>
            ) : null}
          </div>
        )}

        {phase === "value" && (
          <div className="mt-10">
            <p className="text-[28px] font-light text-[#3F3F46] sm:text-[32px]" style={{ letterSpacing: "normal" }}>
              {labels.withA}{" "}
              <button
                type="button"
                onClick={() => setValueOpen((v) => !v)}
                className="inline border-b-2 px-0.5 font-normal text-[#18181B]"
                style={{ borderColor: ODOO_PURPLE }}
              >
                {valueProp
                  ? locale === "ar"
                    ? valueProp.labelAr
                    : valueProp.labelEn
                  : labels.pickValue}
              </button>
            </p>
            {valueOpen && (
              <ul className="mt-3 max-w-md overflow-hidden rounded-lg border border-[#E4E4E7] bg-white py-1 shadow-lg">
                {values.map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => pickValue(v)}
                      className="w-full px-4 py-2.5 text-start text-[15px] text-[#3F3F46] hover:bg-[#F4F4F5]"
                      style={{ letterSpacing: "normal" }}
                    >
                      {locale === "ar" ? v.labelAr : v.labelEn}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-16">
          <button
            type="button"
            onClick={onSkip}
            className="text-[14px] underline-offset-2 hover:underline"
            style={{ color: ODOO_TEAL }}
          >
            {labels.skip}
          </button>
        </div>
      </div>
    </div>
  );
}
