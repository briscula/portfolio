'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to manage dropdown state and behavior
 * Handles:
 * - Show/hide state
 * - Click outside to close
 * - Focus management
 * - Keyboard navigation (Escape, Arrow keys)
 * 
 * @returns Object with dropdown state and handlers
 */
export function useDropdownManager() {
  const [showActions, setShowActions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggleActions = useCallback(() => {
    setShowActions(prev => !prev);
  }, []);

  // Handle clicking outside to close dropdown and focus management
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Focus first menu item when dropdown opens
      setTimeout(() => {
        const firstMenuItem = dropdownRef.current?.querySelector('[role="menuitem"]') as HTMLElement;
        firstMenuItem?.focus();
      }, 0);
      
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActions]);

  // Handle keyboard navigation for dropdown
  const handleDropdownKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setShowActions(false);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const menuItems = dropdownRef.current?.querySelectorAll('[role="menuitem"]');
      if (!menuItems) return;

      const currentIndex = Array.from(menuItems).findIndex(item => item === document.activeElement);
      let nextIndex;

      if (event.key === 'ArrowDown') {
        nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
      }

      (menuItems[nextIndex] as HTMLElement).focus();
    }
  }, []);

  return {
    showActions,
    setShowActions,
    dropdownRef,
    handleToggleActions,
    handleDropdownKeyDown,
  };
}
