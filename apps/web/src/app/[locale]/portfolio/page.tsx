'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePortfolios } from '@/hooks/usePortfolio';

// Force dynamic rendering - uses localStorage
export const dynamic = 'force-dynamic';

export default function PortfolioRedirectPage() {
  const { user, isLoading } = useUser();
  const { portfolios, loading: portfoliosLoading } = usePortfolios();
  const [isRedirecting, setIsRedirecting] = useState(true);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    if (isLoading || portfoliosLoading) return;

    if (!user) {
      router.push('/api/auth/login');
      return;
    }

    if (portfolios.length === 0) {
      // No portfolios exist, redirect to dashboard to create one
      router.push(`/${locale}/dashboard`);
      return;
    }

    // Only access localStorage on the client side
    let lastViewedPortfolioId = null;
    if (typeof window !== 'undefined') {
      lastViewedPortfolioId = localStorage.getItem('lastViewedPortfolioId');
    }
    // Check if the last viewed portfolio still exists
    const lastViewedPortfolio = lastViewedPortfolioId
      ? portfolios.find(p => p.id === lastViewedPortfolioId)
      : null;

    // Use last viewed portfolio or fall back to first portfolio
    const targetPortfolioId = lastViewedPortfolio?.id || portfolios[0].id;

    // Redirect to the target portfolio
    // Note: No need to set isRedirecting to false as the component will unmount during navigation
    router.push(`/${locale}/portfolio/${targetPortfolioId}`);
  }, [user, isLoading, portfolios, portfoliosLoading, router, locale]);

  // Show loading state while redirecting
  if (isLoading || portfoliosLoading || isRedirecting) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading portfolio...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // This should never be reached due to redirects above
  return null;
}