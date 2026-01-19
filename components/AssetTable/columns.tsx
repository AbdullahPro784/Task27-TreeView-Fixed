
import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Asset } from "./utils/data";
import { EditableCell } from "./components/Cell/CellEditor";
import { StatusEditableCell } from "./components/Cell/StatusEditableCell";

export const getColumns = (uniqueCategories: string[]): ColumnDef<Asset>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <div className="px-4 py-3 h-full flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
                {row.getCanExpand() && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            row.toggleExpanded();
                        }}
                        className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                    >
                        {row.getIsExpanded() ? (
                            <ChevronDown size={16} className="text-gray-500" />
                        ) : (
                            <ChevronRight size={16} className="text-gray-500" />
                        )}
                    </button>
                )}
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
    },
    {
        accessorKey: "id",
        header: "CUSTOMER NAME",
        cell: (info) => <div className="px-4 py-3 h-full font-medium">{info.getValue() as string}</div>,
        size: 150,
    },
    {
        accessorKey: "serial",
        header: "SERIAL",
        cell: EditableCell,
        size: 150,
    },
    {
        accessorKey: "category",
        header: "CATEGORY",
        cell: (props) => <EditableCell {...props} options={uniqueCategories} />,
        size: 140,
    },
    {
        accessorKey: "brand",
        header: "BRAND",
        cell: EditableCell,
        size: 140,
    },
    {
        accessorKey: "type",
        header: "TYPE",
        cell: EditableCell,
        size: 140,
    },
    {
        accessorKey: "vehicle",
        header: "VEHICLE",
        size: 140,
        cell: ({ row, getValue, table }) => {
            const value = getValue() as string;
            return (
                <div
                    className="flex items-center justify-between px-4 py-3 h-full group"
                    onContextMenu={(e) => {
                        e.preventDefault();
                        alert("Please click the three dots menu to see options.");
                    }}
                >
                    <span className="truncate">{value}</span>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                                alert("Option selected: Assign Driver");
                            }}>
                                Assign Driver
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert("Option selected: Check History")}>
                                Check History
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
    {
        accessorKey: "endDate",
        header: "ESTIMATED DATE",
        cell: (props) => <EditableCell {...props} type="date" />,
        size: 140,
    },
    {
        accessorKey: "status",
        header: "STATUS",
        size: 180,
        cell: StatusEditableCell,
    },
];
