import React from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, File } from "lucide-react";
import { Table } from "@tanstack/react-table";
// Assuming export helpers might exist or we will implement stubs for now
import { exportToCSV, exportToExcel, exportToPDF } from "../../utils/exportHelpers";
import { flattenTree } from "../../utils/dataTransform";

interface ExportActionsProps<TData> {
    table: Table<TData>;
}

export function ExportActions<TData>({ table }: ExportActionsProps<TData>) {

    const handleExport = (type: 'csv' | 'excel' | 'pdf') => {
        // Use the table's row model. If standard 'getFilteredRowModel' is used, logic depends on expansion.
        // But for export, we often want ALL data including hidden children.
        // Let's assume we export currently filtered rows.

        const rows = table.getFilteredRowModel().rows;
        // Flatten the rows (if they have subRows) using our utility
        // Note: 'rows' from TanStack table are Row objects. 'flattenTree' expects objects with subRows property?
        // Tanstack rows have 'subRows' property.

        // However, 'row.original' is the data. 
        // We can map to originals, then flatten if originals have structure, OR flatten the Row objects then map.

        // Let's try to trust the Table's flattening if we used 'getExpandedRowModel', but that only shows expanded.
        // The user likely wants to export matches including closed children? 
        // Or just what's visible?
        // A common requirement is "Export All Data (Filtered)".

        // Let's grab the raw data from the rows and try to flatten it using our utility if it's hierarchical.
        // Our 'flattenTree' expects `subRows`. TanStack rows have `subRows`.

        const flatRows = flattenTree(rows); // This tests 'flattenTree' with Row objects
        const data = flatRows.map(r => r.original);
        const columns = table.getAllColumns().map(col => col.id);

        switch (type) {
            case 'csv':
                exportToCSV(data, "asset_data");
                break;
            case 'excel':
                exportToExcel(data, "asset_data");
                break;
            case 'pdf':
                exportToPDF(data, columns, "asset_data");
                break;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Download size={16} />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => handleExport('excel')} className="gap-2">
                    <FileSpreadsheet size={16} className="text-green-600" />
                    Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2">
                    <FileText size={16} className="text-blue-600" />
                    CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2">
                    <File size={16} className="text-red-600" />
                    PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
