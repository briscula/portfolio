'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { ActivityList, Button } from '@/components/ui';
import { useTransactions } from '@/hooks/useTransactions';
import { usePortfolios } from '@/hooks/usePortfolio';
import { useApiClient } from '@/lib/apiClient';
import { PlusIcon, PencilIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Force dynamic rendering - uses Auth0 and localStorage
export const dynamic = 'force-dynamic';




interface CreatePortfolioForm {
  name: string;
  description: string;
  currencyCode: string;
}

interface EditPortfolioForm extends CreatePortfolioForm {
  id: string;
}

interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  currencyCode: string;
  createdAt: string;
}

export default function DashboardPage() {
    const { user, isLoading } = useUser();
    const { apiClient } = useApiClient();
    const { activities, loading: transactionsLoading, error: transactionsError } = useTransactions();
    const { portfolios, loading: portfoliosLoading, error: portfoliosError, refetch } = usePortfolios();
    
    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAllPortfolios, setShowAllPortfolios] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    
    // Form states
    const [createForm, setCreateForm] = useState<CreatePortfolioForm>({
        name: '',
        description: '',
        currencyCode: 'USD'
    });
    
    const [editForm, setEditForm] = useState<EditPortfolioForm>({
        id: '',
        name: '',
        description: '',
        currencyCode: 'USD'
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        redirect('/api/auth/login');
    }

    // Handler for creating portfolio
    const handleCreatePortfolio = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await apiClient.createPortfolio({
                name: createForm.name,
                description: createForm.description,
                currencyCode: createForm.currencyCode
            });
            
            { setFormError(null); setShowCreateModal(false); }
            setCreateForm({ name: '', description: '', currencyCode: 'USD' });
            
            // Refresh portfolios list
            refetch();
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setIsCreating(false);
        }
    };

    // Handler for editing portfolio
    const handleEditPortfolio = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await apiClient.updatePortfolio(editForm.id, {
                name: editForm.name,
                description: editForm.description,
                currencyCode: editForm.currencyCode
            });
            
            { setFormError(null); setShowEditModal(false); }
            setEditForm({ id: '', name: '', description: '', currencyCode: 'USD' });
            
            // Refresh portfolios list
            refetch();
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setIsUpdating(false);
        }
    };

    // Open edit modal with portfolio data
    const openEditModal = (portfolio: Portfolio) => {
        setFormError(null);
        setEditForm({
            id: portfolio.id,
            name: portfolio.name,
            description: portfolio.description || '',
            currencyCode: portfolio.currencyCode
        });
        setShowEditModal(true);
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Page header */}
                <div className="border-b border-gray-200 pb-4">
                    <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Welcome back, {user.name || user.email}
                    </p>
                </div>

                {/* Portfolios Section */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Your Portfolios</h3>
                            <Button
                                onClick={() => { setFormError(null); setShowCreateModal(true); }}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add New Portfolio
                            </Button>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        {portfoliosLoading ? (
                            // Portfolio loading skeleton
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
                                        <div className="flex-1">
                                            <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : portfoliosError ? (
                            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                <p className="text-red-800">Error loading portfolios: {portfoliosError}</p>
                            </div>
                        ) : portfolios.length === 0 ? (
                            // Empty state
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-3xl">📁</span>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No portfolios found
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Create your first portfolio to start tracking your investments.
                                </p>
                                <Button
                                    onClick={() => { setFormError(null); setShowCreateModal(true); }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Create Portfolio
                                </Button>
                            </div>
                        ) : (
                            // Portfolio table
                            <div className="space-y-3">
                                {portfolios.slice(0, showAllPortfolios ? portfolios.length : 5).map((portfolio) => (
                                    <div key={portfolio.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-2 rounded transition-colors">
                                        <div className="flex-1">
                                            <Link
                                                href={`/en/portfolio/${portfolio.id}`}
                                                className="font-medium text-gray-900 text-sm hover:text-blue-600 transition-colors cursor-pointer"
                                                onClick={() => localStorage.setItem('lastViewedPortfolioId', portfolio.id)}
                                            >
                                                {portfolio.name}
                                            </Link>
                                            {portfolio.description && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {portfolio.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                {portfolio.currencyCode}
                                            </span>
                                            <button
                                                onClick={() => openEditModal(portfolio)}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                                title="Edit portfolio"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <Link
                                                href={`/en/portfolio/${portfolio.id}`}
                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                                title="View portfolio"
                                                onClick={() => localStorage.setItem('lastViewedPortfolioId', portfolio.id)}
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                                
                                {portfolios.length > 5 && (
                                    <div className="text-center pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => setShowAllPortfolios(!showAllPortfolios)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            {showAllPortfolios ? 'Show less' : `View all ${portfolios.length} portfolios`} →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent activity */}
                {transactionsLoading ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                        </div>
                        {/* Loading skeleton */}
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4 animate-pulse">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : transactionsError ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-red-800">Error loading recent activity: {transactionsError}</p>
                        </div>
                    </div>
                ) : (
                    <ActivityList
                        activities={activities}
                        maxItems={5}
                        showViewAll
                        onViewAll={() => {
                            // TODO: Navigate to full activity page
                        }}
                    />
                )}

            </div>

            {/* Create Portfolio Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Create New Portfolio</h2>
                            {formError && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                                    <p className="text-red-800 text-sm">{formError}</p>
                                </div>
                            )}
                            <button
                                onClick={() => { setFormError(null); setShowCreateModal(false); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreatePortfolio} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Portfolio Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={50}
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="My Investment Portfolio"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    {createForm.name.length}/50 characters
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    maxLength={200}
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Portfolio description..."
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    {createForm.description.length}/200 characters
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Currency
                                </label>
                                <select
                                    value={createForm.currencyCode}
                                    onChange={(e) => setCreateForm({ ...createForm, currencyCode: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="CAD">CAD - Canadian Dollar</option>
                                </select>
                            </div>
                            
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCreating ? 'Creating...' : 'Create Portfolio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Portfolio Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Edit Portfolio</h2>
                            {formError && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                                    <p className="text-red-800 text-sm">{formError}</p>
                                </div>
                            )}
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditPortfolio} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Portfolio Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={50}
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    {editForm.name.length}/50 characters
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    maxLength={200}
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    {editForm.description.length}/200 characters
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Currency
                                </label>
                                <select
                                    value={editForm.currencyCode}
                                    onChange={(e) => setEditForm({ ...editForm, currencyCode: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="CAD">CAD - Canadian Dollar</option>
                                </select>
                            </div>
                            
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUpdating ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
