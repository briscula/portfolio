"use client";

import React, { useEffect } from "react";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { AuthProvider } from "../../contexts/AuthContext";
import { QueryProvider } from "../../contexts/QueryProvider";

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  useEffect(() => {
    // Initialize MSW in development mode
    if (process.env.NEXT_PUBLIC_ENABLE_MSW === "true") {
      import("../../mocks/browser")
        .then(({ worker }) => {})
        .catch((error) => {});
    }
  }, []);

  return (
    <UserProvider>
      <AuthProvider>
        <QueryProvider>{children}</QueryProvider>
      </AuthProvider>
    </UserProvider>
  );
}
