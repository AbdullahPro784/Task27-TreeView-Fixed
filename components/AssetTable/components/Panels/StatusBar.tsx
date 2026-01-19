
import React from "react";
import { Table } from "@tanstack/react-table";
import { Asset } from "@/components/AssetTable/utils/data";

interface StatusBarProps {
    table: Table<Asset>;
}

export const StatusBar = ({ table }: StatusBarProps) => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedCount = selectedRows.length;

    let sum = 0;
    let avg = 0;

    if (selectedCount > 0) {
        // Calculate Sum/Avg for status.level (assuming it's the numeric field of interest)
        // Or if there are other numeric columns, we might iterate over them.
        // For now, let's target 'status.level' as the example numeric field.

        // We can also check which cells are selected if using range selection, 
        // but typically 'selected rows' implies summing specific columns from those rows.
        // Let's sum 'status.level'.

        // Actually, let's verify if there is a 'Amount' or similar. 
        // Looking at data.ts, 'status.level' is a number (e.g., 20, 50, 80).

        const levels = selectedRows.map(row => row.original.status.level || 0);
        sum = levels.reduce((a, b) => a + b, 0);
        avg = sum / selectedCount;
    }

    return (
        <div className="bg-white border-t border-gray-200 p-2 flex items-center justify-end gap-6 text-sm text-gray-600 h-10">
            {selectedCount > 0 ? (
                <>
                    <div className="flex items-center gap-2">
                        <span className="font-medium">Selected:</span>
                        <span>{selectedCount}</span>
                    </div>
                    <div className="h-4 w-px bg-gray-200" />
                    <div className="flex items-center gap-2">
                        <span className="font-medium">Sum:</span>
                        <span>{sum.toLocaleString()}</span>
                    </div>
                    <div className="h-4 w-px bg-gray-200" />
                    <div className="flex items-center gap-2">
                        <span className="font-medium">Avg:</span>
                        <span>{avg.toFixed(2)}</span>
                    </div>
                </>
            ) : (
                <span className="text-gray-400 italic">Select rows to see stats</span>
            )}
        </div>
    );
};
