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
import { Asset } from "./data";

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
                "px-4 py-3 text-left text-sm font-semibold text-gray-600 bg-gray-50 border-b border-gray-200 select-none group relative",
                isDragging && "bg-gray-100 shadow-md transform scale-105 rotate-1 cursor-grabbing" // Visual feedback: scale and rotate
            )}
        >
            <div className="flex items-center gap-2 overflow-hidden">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                    <GripHorizontal size={14} />
                </button>

                {/* Sort Button */}
                <div
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                        "flex items-center gap-1 cursor-pointer flex-1 truncate",
                        header.column.getCanSort() ? "hover:text-gray-900" : "cursor-default"
                    )}
                >
                    <span className="truncate">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                    </span>
                    {header.column.getCanSort() && (
                        <span className="flex-shrink-0">
                            {
                                {
                                    asc: <ChevronUp size={14} />,
                                    desc: <ChevronDown size={14} />,
                                }[header.column.getIsSorted() as string] ?? (
                                    <ChevronsUpDown size={14} className="text-gray-300" />
                                )
                            }
                        </span>
                    )}
                </div>
            </div>
            {/* Filter Input */}
            {
                header.column.getCanFilter() && (
                    <div className="mt-2">
                        <input
                            type="text"
                            value={(header.column.getFilterValue() ?? "") as string}
                            onChange={(e) => header.column.setFilterValue(e.target.value)}
                            placeholder={`Filter...`}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-orange-500 font-normal"
                            onClick={(e) => e.stopPropagation()} // Prevent sort/drag
                            onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
                        />
                    </div>
                )
            }
            {/* Resizer */}
            <div
                onMouseDown={header.getResizeHandler()}
                onTouchStart={header.getResizeHandler()}
                className={cn(
                    "absolute right-0 top-0 h-full w-1 bg-gray-300 opacity-0 group-hover:opacity-100 cursor-col-resize select-none touch-none",
                    header.column.getIsResizing() && "bg-blue-500 opacity-100 w-1.5"
                )}
                style={{
                    transform: header.column.getIsResizing() ? `translateX(${0}px)` : undefined, // Optional visual adjust
                }}
            />
        </th >
    );
};
