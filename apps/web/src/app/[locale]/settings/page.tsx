'use client';

import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { redirect } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useApiClient } from '@/lib/apiClient';

export default function SettingsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const { apiClient } = useApiClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    setErrorMessage(null);

    try {
      await apiClient.syncPrices();
      setSyncStatus('success');
    } catch (error) {
      setSyncStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    redirect('/api/auth/login');
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your account preferences and data settings.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Data Synchronization</h3>
            <p className="mt-2 text-sm text-gray-500">
              Update the latest market prices for all your stock positions. This will ensure your portfolio's market value is accurate.
              This process may take a few moments to complete in the background.
            </p>
          </div>
          <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing}
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSyncing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Syncing...
                  </>
                ) : (
                  'Sync Stock Prices'
                )}
              </button>
              {syncStatus === 'success' && (
                <p className="text-sm text-green-600">Price sync triggered successfully!</p>
              )}
              {syncStatus === 'error' && (
                <p className="text-sm text-red-600">
                  Sync failed: {errorMessage}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* You can add more settings sections here in the future */}

      </div>
    </AppLayout>
  );
}