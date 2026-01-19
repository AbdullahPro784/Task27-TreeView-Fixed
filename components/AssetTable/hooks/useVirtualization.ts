
import { useVirtualizer } from '@tanstack/react-virtual';
import { RefObject } from 'react';

interface UseVirtualizationProps {
    count: number;
    getScrollElement: () => Element | null;
    estimateSize?: () => number;
}

export function useVirtualization({ count, getScrollElement, estimateSize }: UseVirtualizationProps) {
    const rowVirtualizer = useVirtualizer({
        count,
        getScrollElement,
        estimateSize: estimateSize || (() => 45), // Default row height
        overscan: 5,
    });

    return rowVirtualizer;
}
