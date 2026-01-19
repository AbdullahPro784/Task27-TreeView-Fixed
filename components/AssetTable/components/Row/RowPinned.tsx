import React from "react";
import { cn } from "@/lib/utils";
import { flexRender, Row } from "@tanstack/react-table";

interface RowPinnedProps<TData> {
    row: Row<TData>;
    position?: "top" | "bottom";
}

export const RowPinned = <TData,>({ row, position = "bottom" }: RowPinnedProps<TData>) => {
    return (
        <tr
            className={cn(
                "font-bold bg-gray-100/50 sticky z-20 shadow-sm",
                position === "bottom" ? "bottom-0" : "top-0"
            )}
        >
            {row.getVisibleCells().map((cell) => (
                <td
                    key={cell.id}
                    className="p-3 border-t border-gray-200 text-gray-800"
                    style={{ width: cell.column.getSize() }}
                >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
            ))}
        </tr>
    );
};
