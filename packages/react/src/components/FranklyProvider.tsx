"use client";
import { createContext, useContext } from "react";

interface FranklyConfig {
  apiUrl: string;
  apiKey: string;
  locale: string;
}

const FranklyContext = createContext<FranklyConfig | null>(null);

export function useFranklyConfig() {
  const ctx = useContext(FranklyContext);
  if (!ctx)
    throw new Error("useFranklyConfig must be used within FranklyProvider");
  return ctx;
}

export function FranklyProvider({
  apiUrl,
  apiKey,
  locale = "en",
  children,
}: FranklyConfig & { children: React.ReactNode }) {
  return (
    <FranklyContext.Provider value={{ apiUrl, apiKey, locale }}>
      {children}
    </FranklyContext.Provider>
  );
}
