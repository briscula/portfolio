"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import { useState } from "react";
import { UserCircleIcon, ChevronDownIcon, Bars3Icon } from "./ui/icons";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, isLoading } = useUser();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Left section - Mobile menu button */}
      <div className="flex items-center space-x-4 flex-1">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Open sidebar"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Right section - User menu */}
      <div className="flex items-center">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
        ) : user ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {user.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.picture}
                  alt={user.name || user.email || "User"}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <UserCircleIcon className="h-8 w-8" />
              )}
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user.name || user.email}
              </span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>

            {/* User dropdown menu */}
            {isUserMenuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsUserMenuOpen(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-gray-500">{user.email}</div>
                    </div>

                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>

                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Settings
                    </Link>

                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          window.location.href = "/api/auth/logout?federated";
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            href="/api/auth/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
