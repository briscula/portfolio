"use client";

import { useState } from "react";
import { Button, Input, Form, FormField, FormActions } from "./ui";

interface Stock {
  symbol: string;
  name: string;
  exchange: string;
}

interface AddPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    stockSymbol: string;
    companyName: string;
    shares: number;
    averagePrice: number;
  }) => void;
  portfolioId?: string; // Make optional since it's not used in the component
}

export default function AddPositionModal({
  isOpen,
  onClose,
  onSubmit,
  portfolioId,
}: AddPositionModalProps) {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [shares, setShares] = useState("");
  const [averagePrice, setAveragePrice] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock stock search - in real app, this would call an API
  const searchStocks = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Mock data - replace with real API call
    const mockStocks: Stock[] = [
      { symbol: "AAPL", name: "Apple Inc", exchange: "NASDAQ" },
      { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ" },
      { symbol: "GOOGL", name: "Alphabet Inc", exchange: "NASDAQ" },
      { symbol: "AMZN", name: "Amazon.com Inc", exchange: "NASDAQ" },
      { symbol: "TSLA", name: "Tesla Inc", exchange: "NASDAQ" },
      { symbol: "META", name: "Meta Platforms Inc", exchange: "NASDAQ" },
      { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ" },
      { symbol: "JPM", name: "JPMorgan Chase & Co", exchange: "NYSE" },
      { symbol: "JNJ", name: "Johnson & Johnson", exchange: "NYSE" },
      { symbol: "V", name: "Visa Inc", exchange: "NYSE" },
    ];

    // Filter based on query
    const filtered = mockStocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase()),
    );

    setTimeout(() => {
      setSearchResults(filtered);
      setIsSearching(false);
    }, 300);
  };

  const handleStockSearch = (query: string) => {
    setSearchQuery(query);
    searchStocks(query);
  };

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    setSearchQuery(`${stock.symbol} - ${stock.name}`);
    setSearchResults([]);
  };

  const handleRemoveStock = () => {
    setSelectedStock(null);
    setSearchQuery("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStock || !shares || !averagePrice) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        stockSymbol: selectedStock.symbol,
        companyName: selectedStock.name,
        shares: parseFloat(shares),
        averagePrice: parseFloat(averagePrice),
      });

      // Reset form
      setSelectedStock(null);
      setSearchQuery("");
      setShares("");
      setAveragePrice("");
      onClose();
    } catch (error) {
      console.error("Error adding position:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Fill holdings
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-semibold"
            >
              ×
            </button>
          </div>

          <Form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Stock Ticker Search */}
              <FormField label="Ticker" required>
                <div className="relative">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleStockSearch(e.target.value)}
                    placeholder="Search for a stock..."
                    className="w-full"
                  />

                  {selectedStock && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <button
                        type="button"
                        onClick={handleRemoveStock}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && !selectedStock && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {searchResults.map((stock) => (
                        <button
                          key={stock.symbol}
                          type="button"
                          onClick={() => handleStockSelect(stock)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {stock.symbol.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {stock.symbol}
                            </div>
                            <div className="text-sm text-gray-600">
                              {stock.name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {isSearching && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>

                {selectedStock && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {selectedStock.symbol.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {selectedStock.symbol}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedStock.name}
                      </div>
                    </div>
                  </div>
                )}
              </FormField>

              {/* Amount of shares */}
              <FormField label="Amount of shares" required>
                <Input
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.001"
                  className="w-full"
                />
              </FormField>

              {/* Average purchase price (required) */}
              <FormField label="Avg. purchase price" required>
                <div className="relative">
                  <Input
                    type="number"
                    value={averagePrice}
                    onChange={(e) => setAveragePrice(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pr-8"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </div>
                </div>
              </FormField>
            </div>

            <FormActions className="mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !selectedStock || !shares || !averagePrice || isSubmitting
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Adding..." : "Add holdings"}
              </Button>
            </FormActions>
          </Form>
        </div>
      </div>
    </div>
  );
}
