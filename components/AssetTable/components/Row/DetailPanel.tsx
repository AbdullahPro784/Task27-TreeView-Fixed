import React from "react";
import { Row } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface DetailPanelProps<TData> {
    row: Row<TData>;
}

export const DetailPanel = <TData,>({ row }: DetailPanelProps<TData>) => {
    // Placeholder for actual detail content.
    // In a real scenario, this might render a sub-table or a detailed card view.
    return (
        <div className="p-4 bg-gray-50/50 border-t border-gray-100 shadow-inner">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Details for {row.getValue("id") as string}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="bg-white p-3 rounded border border-gray-100">
                    <span className="font-medium text-gray-500 block mb-1">Raw Data Inspection</span>
                    <pre className="text-xs overflow-auto max-h-32 bg-gray-50 p-2 rounded">
                        {JSON.stringify(row.original, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
};
