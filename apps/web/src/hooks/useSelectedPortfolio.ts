import { useState, useEffect } from "react";
import { usePortfolios, Portfolio } from "./usePortfolio";

const SELECTED_PORTFOLIO_KEY = "selectedPortfolioId";

export interface SelectedPortfolioState {
  selectedPortfolioId: string | null;
  selectedPortfolio: Portfolio | null;
  setSelectedPortfolioId: (id: string) => void;
  isLoading: boolean;
}

/**
 * Hook to manage selected portfolio across the application
 * Uses localStorage to persist selection across pages and sessions
 */
export function useSelectedPortfolio(): SelectedPortfolioState {
  const { portfolios, loading: portfoliosLoading } = usePortfolios();
  const [selectedPortfolioId, setSelectedPortfolioIdState] = useState<
    string | null
  >(null);

  // Initialize selected portfolio from localStorage or first portfolio
  useEffect(() => {
    if (portfoliosLoading || portfolios.length === 0) return;

    // Try to get from localStorage first
    const storedId = localStorage.getItem(SELECTED_PORTFOLIO_KEY);

    if (storedId && portfolios.some((p) => p.id === storedId)) {
      // Use stored portfolio if it exists in current portfolios
      setSelectedPortfolioIdState(storedId);
    } else {
      // Clear invalid stored ID and fallback to first portfolio
      if (storedId) {
        localStorage.removeItem(SELECTED_PORTFOLIO_KEY);
      }

      // Fallback to first portfolio
      const firstPortfolio = portfolios[0];
      if (firstPortfolio) {
        setSelectedPortfolioIdState(firstPortfolio.id);
        localStorage.setItem(SELECTED_PORTFOLIO_KEY, firstPortfolio.id);
      } else {
        // No portfolios available
        setSelectedPortfolioIdState(null);
        localStorage.removeItem(SELECTED_PORTFOLIO_KEY);
      }
    }
  }, [portfolios, portfoliosLoading]);

  // Function to update selected portfolio
  const setSelectedPortfolioId = (id: string) => {
    setSelectedPortfolioIdState(id);
    localStorage.setItem(SELECTED_PORTFOLIO_KEY, id);
  };

  // Function to clear selected portfolio (useful for debugging)
  const clearSelectedPortfolio = () => {
    setSelectedPortfolioIdState(null);
    localStorage.removeItem(SELECTED_PORTFOLIO_KEY);
  };

  // Expose clear function for debugging (you can call this in browser console)
  if (typeof window !== "undefined") {
    (window as unknown as Record<string, unknown>).clearSelectedPortfolio =
      clearSelectedPortfolio;
  }

  // Find the selected portfolio object
  const selectedPortfolio =
    portfolios.find((p) => p.id === selectedPortfolioId) || null;

  return {
    selectedPortfolioId,
    selectedPortfolio,
    setSelectedPortfolioId,
    isLoading: portfoliosLoading,
  };
}
