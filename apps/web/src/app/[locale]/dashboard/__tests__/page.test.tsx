import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create mock functions before mocking modules
const mockRedirect = jest.fn();
const mockUseUser = jest.fn();

jest.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: mockUseUser,
}));

jest.mock('@/hooks/useTransactions', () => ({
  useTransactions: () => ({
    activities: [],
    loading: false,
    error: null,
  }),
}));

jest.mock('@/hooks/usePortfolio', () => ({
  usePortfolios: () => ({
    portfolios: [],
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

jest.mock('@/lib/apiClient', () => ({
  useApiClient: () => ({
    apiClient: {
      createPortfolio: jest.fn(),
      updatePortfolio: jest.fn(),
    },
  }),
}));

jest.mock('next/navigation', () => ({
  redirect: mockRedirect,
  usePathname: jest.fn(() => '/en/dashboard'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

import DashboardPage from '../page';

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dashboard for an authenticated user', () => {
    mockUseUser.mockReturnValue({
      user: {
        name: 'Test User',
        email: 'test@example.com',
      },
      isLoading: false,
      error: undefined,
      checkSession: jest.fn(),
    });

    render(<DashboardPage />);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Welcome back, Test User')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    mockUseUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      error: undefined,
      checkSession: jest.fn(),
    });

    // Mock redirect to throw an error (mimics Next.js behavior)
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });

    expect(() => render(<DashboardPage />)).toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/api/auth/login');
  });
});
