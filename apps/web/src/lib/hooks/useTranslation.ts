import { useParams } from "next/navigation";
import { use, useState, useEffect } from "react";
import en from "../translations/en.json";
import es from "../translations/es.json";

const translations = {
  en,
  es,
};

export function useTranslation() {
  const params = useParams();
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side to avoid hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Unwrap params Promise with React.use() for Next.js 15+
  const resolvedParams = params instanceof Promise ? use(params) : params;

  // Extract locale from params with validation
  const paramLocale = resolvedParams?.locale as string;
  const validLocales = ["en", "es"];
  const locale =
    isClient && validLocales.includes(paramLocale) ? paramLocale : "en";

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: unknown = translations[locale as keyof typeof translations];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // Return the key if translation not found
      }
    }

    return typeof value === "string" ? value : key;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  };

  return {
    t,
    locale,
    formatCurrency,
    formatDate,
  };
}
