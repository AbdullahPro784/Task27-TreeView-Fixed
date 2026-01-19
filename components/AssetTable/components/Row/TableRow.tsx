import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Row, flexRender } from "@tanstack/react-table";
import { SubRowContent } from "./SubRowContent";
import { DetailPanel } from "./DetailPanel";
import { TreeLines } from "./TreeLines";

interface DraggableRowProps<TData> extends React.HTMLAttributes<HTMLTableRowElement> {
    row: Row<TData>;
    rowId: string;
}

// Helper to combine refs
function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
    return (node: T | null) => {
        refs.forEach((ref) => {
            if (typeof ref === 'function') {
                ref(node);
            } else if (ref != null) {
                (ref as React.MutableRefObject<T | null>).current = node;
            }
        });
    };
}

export const DraggableRow = React.forwardRef<HTMLTableRowElement, DraggableRowProps<any>>(
    ({ row, rowId, children, className, style: propStyle, ...props }, ref) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
        } = useSortable({
            id: rowId,
            data: {
                type: "row",
            },
        });

        const style: React.CSSProperties = {
            transform: CSS.Translate.toString(transform),
            transition,
            ...propStyle,
            position: "relative",
            zIndex: isDragging ? 1 : 0,
        };

        const mergedRef = React.useMemo(() => composeRefs(ref, setNodeRef), [ref, setNodeRef]);

        return (
            <>
                <tr
                    ref={mergedRef}
                    style={style}
                    {...attributes}
                    {...listeners}
                    className={cn(
                        className,
                        isDragging && "opacity-30",
                        row.getIsExpanded() && "bg-gray-50",
                    )}
                    {...props}
                >
                    {children}
                </tr>

                {row.getIsExpanded() && !row.subRows.length && (
                    <tr className="bg-gray-50/50">
                        <td colSpan={row.getVisibleCells().length} className="p-4 text-sm text-gray-500 italic">
                            No sub-items available directly. (Detail Panel Placeholder)
                        </td>
                    </tr>
                )}
            </>
        );
    }
);
DraggableRow.displayName = "DraggableRow";

