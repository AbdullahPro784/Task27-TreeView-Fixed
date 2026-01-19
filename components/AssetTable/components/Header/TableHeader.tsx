
import React from "react";
import { Header, flexRender } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    GripHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Asset } from "../../utils/data";
import { ColumnResizer } from "./ColumnResizer";
import { HeaderMenu } from "./HeaderMenu";

export const DraggableTableHeader = ({
    header,
}: {
    header: Header<Asset, unknown>;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({
            id: header.column.id,
            data: {
                type: "column",
            },
        });

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 1 : 0,
        position: "relative",
        width: header.getSize(),
    };

    return (
        <th
            ref={setNodeRef}
            colSpan={header.colSpan}
            style={style}
            className={cn(
                "group relative px-4 py-3 text-left text-sm font-semibold text-gray-600 bg-gray-50 border-b border-gray-200 select-none",
                isDragging && "bg-gray-100 shadow-md transform scale-105 rotate-1 cursor-grabbing"
            )}
        >
            <div className="flex items-center justify-between gap-1 w-full">

                {/* Drag Handle & Label Group */}
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {/* Drag Handle */}
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                        <GripHorizontal size={14} />
                    </button>

                    {/* Sortable Label */}
                    <div
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                            "flex items-center gap-1 cursor-pointer truncate",
                            header.column.getCanSort() ? "hover:text-gray-900" : "cursor-default"
                        )}
                        title={typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : undefined}
                    >
                        <span className="truncate">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                            <span className="flex-shrink-0 text-gray-400">
                                {
                                    {
                                        asc: <ChevronUp size={14} className="text-orange-500" />,
                                        desc: <ChevronDown size={14} className="text-orange-500" />,
                                    }[header.column.getIsSorted() as string] ?? (
                                        <ChevronsUpDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )
                                }
                            </span>
                        )}
                    </div>
                </div>

                {/* Header Menu (Filter/Hide options) */}
                <HeaderMenu column={header.column} />
            </div>

            {/* Resizer */}
            <ColumnResizer header={header} />
        </th>
    );
};
