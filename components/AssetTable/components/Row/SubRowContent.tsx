import React from "react";
import { Row, flexRender } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { TreeLines } from "./TreeLines";

interface SubRowContentProps<TData> extends React.HTMLAttributes<HTMLTableRowElement> {
    row: Row<TData>;
}

export const SubRowContent = <TData,>({ row, className, ...props }: SubRowContentProps<TData>) => {
    return (
        <tr className={cn("hover:bg-gray-50/50 transition-colors", className)} {...props}>
            {row.getVisibleCells().map((cell) => (
                <td
                    key={cell.id}
                    className={cn(
                        "relative p-3 border-b border-gray-100 align-middle text-sm text-gray-600",
                        cell.column.id === 'select' && "w-10 text-center"
                    )}
                    style={{ width: cell.column.getSize() }}
                >
                    {/* 
                      If this is the first column (usually 'select' or 'id' or first data column),
                      render the tree lines.
                      Adjust 'id' check based on actual column implementation.
                      Assuming 'serial' or 'id' is the visual anchor.
                    */}
                    {cell.column.id === 'serial' && (
                        <TreeLines depth={row.depth} />
                    )}

                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
            ))}
        </tr>
    );
};
