"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";

interface AuthContextType {
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user } = useUser();
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedTokenFetch, setHasAttemptedTokenFetch] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const refreshToken = useCallback(async () => {
    if (!user) {
      setAccessToken(null);
      setHasAttemptedTokenFetch(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setHasAttemptedTokenFetch(true);

      const response = await fetch("/api/auth/token");
      if (!response.ok) {
        if (response.status === 401 || response.status === 500) {
          // Token expired or invalid - user needs to re-authenticate
          setAccessToken(null);
          setError("Authentication expired. Please sign in again.");
          setShouldRedirect(true);
          return;
        }
        throw new Error(`Failed to get access token: ${response.status}`);
      }

      const { accessToken: token } = await response.json();
      setAccessToken(token);
      setError(null);
      setShouldRedirect(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get access token",
      );
      setAccessToken(null);
      setShouldRedirect(true);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !accessToken && !isLoading && !hasAttemptedTokenFetch) {
      refreshToken();
    } else if (!user) {
      setAccessToken(null);
      setHasAttemptedTokenFetch(false);
      setError(null);
      setShouldRedirect(false);
    }
  }, [user, accessToken, isLoading, hasAttemptedTokenFetch, refreshToken]);

  // Handle redirect when authentication fails
  useEffect(() => {
    if (shouldRedirect && !isLoading) {
      router.push("/api/auth/login");
    }
  }, [shouldRedirect, isLoading, router]);

  const isAuthenticated = !!user && !!accessToken;

  return (
    <AuthContext.Provider
      value={{ accessToken, isLoading, error, isAuthenticated, refreshToken }}
    >
      {shouldRedirect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Session Expired
                </h3>
                <p className="text-sm text-gray-600">Redirecting to login...</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
