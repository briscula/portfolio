"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function LoginPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const { t, locale } = useTranslation();

  useEffect(() => {
    if (user) {
      router.push(`/${locale}`);
    }
  }, [user, router, locale]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t("login.title")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("login.subtitle")}
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm">
            <button
              onClick={() => (window.location.href = "/api/auth/login")}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              {t("login.signInButton")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
