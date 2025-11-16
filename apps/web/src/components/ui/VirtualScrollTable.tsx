'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface VirtualScrollItem {
  id: string;
  [key: string]: unknown;
}

export interface VirtualScrollTableProps<T extends VirtualScrollItem> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

/**
 * Virtual scrolling table component for handling large datasets efficiently
 * Only renders visible items plus a small buffer (overscan) to improve performance
 */
export function VirtualScrollTable<T extends VirtualScrollItem>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  renderHeader,
  overscan = 5,
  className,
  onScroll,
  loading = false,
  loadingComponent,
  emptyComponent
}: VirtualScrollTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Calculate total height and visible items
  const totalHeight = items.length * itemHeight;
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Scroll to specific item
  const scrollToItem = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    if (!scrollElementRef.current) return;

    let scrollTop: number;
    switch (align) {
      case 'start':
        scrollTop = index * itemHeight;
        break;
      case 'center':
        scrollTop = index * itemHeight - containerHeight / 2 + itemHeight / 2;
        break;
      case 'end':
        scrollTop = index * itemHeight - containerHeight + itemHeight;
        break;
    }

    scrollTop = Math.max(0, Math.min(scrollTop, totalHeight - containerHeight));
    scrollElementRef.current.scrollTop = scrollTop;
  }, [itemHeight, containerHeight, totalHeight]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (!scrollElementRef.current) return;
    scrollElementRef.current.scrollTop = 0;
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (!scrollElementRef.current) return;
    scrollElementRef.current.scrollTop = Math.max(0, totalHeight - containerHeight);
  }, [totalHeight, containerHeight]);
  // Note: Scroll methods can be accessed via scrollElementRef.current
  // scrollToItem, scrollToTop, scrollToBottom are available as functions

  // Show loading state
  if (loading && loadingComponent) {
    return (
      <div className={cn('relative', className)} style={{ height: containerHeight }}>
        {loadingComponent}
      </div>
    );
  }

  // Show empty state
  if (!loading && items.length === 0 && emptyComponent) {
    return (
      <div className={cn('relative', className)} style={{ height: containerHeight }}>
        {emptyComponent}
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Header */}
      {renderHeader && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          {renderHeader()}
        </div>
      )}

      {/* Scrollable content */}
      <div
        ref={scrollElementRef}
        className="overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
        role="grid"
        aria-rowcount={items.length}
      >
        {/* Total height spacer */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Visible items */}
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            const style: React.CSSProperties = {
              position: 'absolute',
              top: actualIndex * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
            };

            return (
              <div
                key={item.id}
                style={style}
                role="row"
                aria-rowindex={actualIndex + 1}
              >
                {renderItem(item, actualIndex, style)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default VirtualScrollTable;