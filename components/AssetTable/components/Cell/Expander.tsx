import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Row } from "@tanstack/react-table";

interface ExpanderProps<TData> {
    row: Row<TData>;
    className?: string;
}

export const Expander = <TData,>({ row, className }: ExpanderProps<TData>) => {
    if (!row.getCanExpand()) {
        return <div className={cn("w-6 h-6", className)} />; // Placeholder to maintain alignment
    }

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                row.toggleExpanded();
            }}
            className={cn(
                "p-1 rounded cursor-pointer transition-colors hover:bg-gray-100 flex items-center justify-center",
                row.getIsExpanded() ? "text-gray-700" : "text-gray-400",
                className
            )}
            aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
        >
            {row.getIsExpanded() ? (
                <ChevronDown size={16} />
            ) : (
                <ChevronRight size={16} />
            )}
        </button>
    );
};
