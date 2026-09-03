"use client";

import { useState } from "react";
import { ODOO_PURPLE } from "@/lib/merchant-store/configurator";

export default function ActivationModal({
  email,
  labels,
  onClose,
  onResend,
}: {
  email: string;
  labels: {
    title: string;
    body: string;
    emailLabel: string;
    resendPrompt: string;
    resend: string;
    close: string;
  };
  onClose: () => void;
  onResend: (email: string) => void;
}) {
  const [value, setValue] = useState(email);
  const [sent, setSent] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal>
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute start-4 top-4 text-[18px] text-[#A1A1AA] hover:text-[#18181B]"
          aria-label={labels.close}
        >
          ×
        </button>
        <p className="text-end text-[20px] font-semibold" style={{ color: ODOO_PURPLE }}>
          مساعد ريادة
        </p>
        <h2 className="mt-6 text-[18px] font-semibold text-[#18181B]" style={{ letterSpacing: "normal" }}>
          {labels.title}
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[#52525B]" style={{ letterSpacing: "normal" }}>
          {labels.body}
        </p>
        <p className="mt-2 font-mono text-[13px] text-[#18181B]" dir="ltr">
          {email || value}
        </p>
        <p className="mt-6 text-[13px] text-[#71717A]">{labels.resendPrompt}</p>
        <input
          type="email"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-2 w-full rounded border border-[#D4D4D8] px-3 py-2 text-[14px] outline-none focus:border-[#714B67]"
          dir="ltr"
        />
        {sent ? (
          <p className="mt-3 text-[13px] text-[#16A34A]">{labels.resend} ✓</p>
        ) : null}
        <button
          type="button"
          onClick={() => {
            onResend(value);
            setSent(true);
          }}
          className="mt-4 rounded px-5 py-2.5 text-[14px] font-medium text-white"
          style={{ backgroundColor: ODOO_PURPLE }}
        >
          {labels.resend}
        </button>
      </div>
    </div>
  );
}
