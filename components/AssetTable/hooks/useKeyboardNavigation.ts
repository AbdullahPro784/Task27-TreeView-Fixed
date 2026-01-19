
import { useState, useCallback, useEffect } from 'react';

interface FocusedCell {
    rowId: string;
    colId: string;
}

interface UseKeyboardNavigationProps {
    data: any[]; // Or strict type
    columns: any[]; // Or strict type
    tableRef?: React.RefObject<HTMLDivElement>;
}

export function useKeyboardNavigation(data: any[], columnOrder: string[]) {
    const [focusedCell, setFocusedCell] = useState<FocusedCell | null>(null);

    const handleKeyDown = useCallback((e: React.KeyboardEvent, rowId: string, colId: string) => {
        if (!focusedCell) {
            setFocusedCell({ rowId, colId });
            return;
        }

        const currentRowIndex = data.findIndex(d => d.id === focusedCell.rowId);
        const currentColIndex = columnOrder.indexOf(focusedCell.colId);

        if (currentRowIndex === -1 || currentColIndex === -1) return;

        let newRowIndex = currentRowIndex;
        let newColIndex = currentColIndex;

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                newRowIndex = Math.max(0, currentRowIndex - 1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                newRowIndex = Math.min(data.length - 1, currentRowIndex + 1);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                newColIndex = Math.max(0, currentColIndex - 1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                newColIndex = Math.min(columnOrder.length - 1, currentColIndex + 1);
                break;
            default:
                return;
        }

        const newRowId = data[newRowIndex].id;
        const newColId = columnOrder[newColIndex];

        setFocusedCell({ rowId: newRowId, colId: newColId });

        // Optional: ensure element is in view logic here
    }, [data, columnOrder, focusedCell]);

    return { focusedCell, setFocusedCell, handleKeyDown };
}
