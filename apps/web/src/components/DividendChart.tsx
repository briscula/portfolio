"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useTranslation } from "../lib/hooks/useTranslation";
import { DividendService, ChartDataPoint } from "@/services/dividendService";
import type { ApexOptions } from "apexcharts";

// Dynamic import to avoid SSR issues with ApexCharts
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DividendChartProps {
  portfolioId?: string;
  startYear?: number;
  endYear?: number;
  apiClient?: any;
  isAuthenticated?: boolean;
}

const colorMap: { [key: string]: string } = {
  "2020": "#3b82f6",
  "2021": "#10b981",
  "2022": "#f59e0b",
  "2023": "#ef4444",
  "2024": "#8b5cf6",
  "2025": "#06b6d4",
  "2026": "#84cc16",
  "2027": "#f97316",
  "2028": "#ec4899",
};

export default function DividendChart({
  portfolioId,
  startYear,
  endYear,
  apiClient,
  isAuthenticated,
}: DividendChartProps) {
  const { user, isLoading } = useUser();
  const { t, locale, formatCurrency } = useTranslation();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keys, setKeys] = useState<string[]>([]);

  const dividendService = useMemo(
    () => new DividendService(apiClient),
    [apiClient],
  );

  useEffect(() => {
    const fetchDividendData = async () => {
      if (!user || !isAuthenticated || !portfolioId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { startYear: defaultStart, endYear: defaultEnd } =
          dividendService.getDefaultYearRange();
        const finalStartYear = startYear || defaultStart;
        const finalEndYear = endYear || defaultEnd;

        const apiResponse = await dividendService.getDividendMonthlyOverview(
          portfolioId,
          finalStartYear,
          finalEndYear,
        );

        if (apiResponse.data && apiResponse.data.length > 0) {
          const transformedData = dividendService.transformToChartFormat(
            apiResponse,
            locale,
          );
          setChartData(transformedData);
          setKeys(apiResponse.years.sort());
        } else {
          setChartData([]);
          setKeys([]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch dividend data",
        );

        const fallbackData = [
          { month: "jan", "2020": 20, "2021": 55, "2022": 85, "2023": 75 },
          { month: "feb", "2020": 40, "2021": 80, "2022": 140, "2023": 110 },
          { month: "mar", "2020": 55, "2021": 115, "2022": 105, "2023": 100 },
        ];
        setChartData(fallbackData);
        setKeys(["2020", "2021", "2022", "2023"]);
      } finally {
        setLoading(false);
      }
    };

    fetchDividendData();
  }, [
    dividendService,
    user,
    portfolioId,
    startYear,
    endYear,
    isAuthenticated,
    locale,
  ]);

  // Transform data for ApexCharts
  const chartOptions = useMemo<ApexOptions>(() => {
    const categories = chartData.map((d) => d.month);

    return {
      chart: {
        type: "bar",
        height: 384,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
        },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "70%",
          borderRadius: 2,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories,
        title: {
          text: t("dividends.month"),
          style: {
            fontSize: "12px",
            fontWeight: 500,
          },
        },
        labels: {
          style: {
            fontSize: "12px",
          },
        },
      },
      yaxis: {
        title: {
          text: `${t("dividends.dividends")} (${t("dividends.currency")})`,
          style: {
            fontSize: "12px",
            fontWeight: 500,
          },
        },
        labels: {
          formatter: (value) => formatCurrency(value),
          style: {
            fontSize: "12px",
          },
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (value) => formatCurrency(value),
        },
      },
      legend: {
        position: "right",
        offsetY: 0,
        height: 230,
        markers: {
          size: 6,
          shape: "square",
        },
        itemMargin: {
          vertical: 4,
        },
      },
      colors: keys.map((key) => colorMap[key] || "#6b7280"),
      grid: {
        borderColor: "#e5e7eb",
        strokeDashArray: 4,
      },
    };
  }, [chartData, keys, t, formatCurrency]);

  // Transform data into series format for ApexCharts
  const series = useMemo(() => {
    return keys.map((year) => ({
      name: year,
      data: chartData.map((d) => (d[year] as number) || 0),
    }));
  }, [chartData, keys]);

  if (isLoading || loading) {
    return (
      <div className="w-full h-96 p-4">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-6">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="flex space-x-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-80">
            <div className="absolute left-0 top-0 h-full w-12 flex flex-col justify-between py-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-3 bg-gray-200 rounded w-8"></div>
              ))}
            </div>

            <div className="ml-16 mr-32 h-full flex items-end justify-between px-4">
              {[...Array(12)].map((_, monthIndex) => (
                <div
                  key={monthIndex}
                  className="flex items-end space-x-1 flex-1 max-w-16"
                >
                  {[...Array(5)].map((_, yearIndex) => (
                    <div
                      key={yearIndex}
                      className="bg-gray-200 rounded-t w-3"
                      style={{
                        height: `${Math.random() * 60 + 20}%`,
                      }}
                    ></div>
                  ))}
                </div>
              ))}
            </div>

            <div className="absolute bottom-0 left-16 right-32 flex justify-between">
              {[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ].map((month) => (
                <div key={month} className="h-3 bg-gray-200 rounded w-6"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">
            {t("dividends.errorLoadingData")}:
          </p>
          <p className="text-sm text-gray-600">{error}</p>
          <p className="text-xs text-gray-500 mt-2">
            {t("dividends.showingFallbackData")}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <p className="text-gray-600">{t("auth.pleaseLogin")}</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <p className="text-gray-600">{t("dividends.noDataAvailable")}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <Chart options={chartOptions} series={series} type="bar" height={384} />
    </div>
  );
}
