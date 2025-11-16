'use client';

import { useState, useEffect } from 'react';

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface BreakpointValues {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const breakpointValues: BreakpointValues = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Hook to detect current screen size and responsive breakpoints
 * @returns Object with current screen width and breakpoint utilities
 */
export function useResponsive() {
  const [screenWidth, setScreenWidth] = useState<number>(0);

  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth);
    };

    // Set initial width
    updateScreenWidth();

    // Add event listener
    window.addEventListener('resize', updateScreenWidth);

    // Cleanup
    return () => window.removeEventListener('resize', updateScreenWidth);
  }, []);

  const isAbove = (breakpoint: Breakpoint): boolean => {
    return screenWidth >= breakpointValues[breakpoint];
  };

  const isBelow = (breakpoint: Breakpoint): boolean => {
    return screenWidth < breakpointValues[breakpoint];
  };

  const isBetween = (min: Breakpoint, max: Breakpoint): boolean => {
    return screenWidth >= breakpointValues[min] && screenWidth < breakpointValues[max];
  };

  return {
    screenWidth,
    isAbove,
    isBelow,
    isBetween,
    // Convenience properties
    isMobile: screenWidth < breakpointValues.md,
    isTablet: screenWidth >= breakpointValues.md && screenWidth < breakpointValues.lg,
    isDesktop: screenWidth >= breakpointValues.lg,
    isSmallScreen: screenWidth < breakpointValues.lg, // Mobile + Tablet
  };
}

/**
 * Hook specifically for mobile detection
 * @param breakpoint The breakpoint to use for mobile detection (default: 'md')
 * @returns boolean indicating if screen is mobile size
 */
export function useIsMobile(breakpoint: Breakpoint = 'md'): boolean {
  const { isBelow } = useResponsive();
  return isBelow(breakpoint);
}

/**
 * Hook for detecting if we should use mobile layout
 * Uses 'lg' breakpoint to include tablets in mobile layout
 * @returns boolean indicating if mobile layout should be used
 */
export function useMobileLayout(): boolean {
  const { isBelow } = useResponsive();
  return isBelow('lg');
}