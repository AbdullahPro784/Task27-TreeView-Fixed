
import React from "react";
import { Header } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface ColumnResizerProps<TData, TValue> {
    header: Header<TData, TValue>;
}

export const ColumnResizer = <TData, TValue>({ header }: ColumnResizerProps<TData, TValue>) => {
    if (!header.column.getCanResize()) return null;

    return (
        <div
            onMouseDown={header.getResizeHandler()}
            onTouchStart={header.getResizeHandler()}
            className={cn(
                "absolute right-0 top-0 h-full w-1 bg-gray-300 opacity-0 group-hover:opacity-100 cursor-col-resize select-none touch-none transition-opacity",
                header.column.getIsResizing() && "bg-orange-500 opacity-100 w-1.5"
            )}
            style={{
                transform: header.column.getIsResizing() ? `translateX(0px)` : undefined,
                zIndex: 10
            }}
        />
    );
};
