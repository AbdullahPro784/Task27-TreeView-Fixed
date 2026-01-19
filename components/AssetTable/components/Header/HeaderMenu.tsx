
import React from "react";
import { Column } from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, ArrowUp, ArrowDown, EyeOff, GripHorizontal, FilterX } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderMenuProps<TData, TValue> {
    column: Column<TData, TValue>;
}

export const HeaderMenu = <TData, TValue>({ column }: HeaderMenuProps<TData, TValue>) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()} // Prevent sort trigger
                >
                    <MoreVertical className="h-3 w-3 text-gray-400 hover:text-gray-700" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                    <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                    Sort Asc
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                    <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                    Sort Desc
                </DropdownMenuItem>

                {column.getIsFiltered() && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => column.setFilterValue(undefined)}>
                            <FilterX className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                            Clear Filter
                        </DropdownMenuItem>
                    </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                    <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                    Hide Column
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
