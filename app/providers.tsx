"use client";

import React from "react";
import { LanguageProvider } from "@/lib/i18n";
import { UgcProvider } from "@/lib/UgcContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <UgcProvider>{children}</UgcProvider>
    </LanguageProvider>
  );
}
