"use client";

import React, { useEffect, useState } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    Header,
    ColumnOrderState,
    ColumnFiltersState,
    VisibilityState,
    getFilteredRowModel,
    ExpandedState,
    getExpandedRowModel,
} from "@tanstack/react-table";
import { StatusEditableCell } from "../AssetTable/components/Cell/StatusEditableCell";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay, // Added
    DragStartEvent, // Added
} from "@dnd-kit/core";
import { createPortal } from "react-dom"; // Added
import {
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
    useSortable,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToHorizontalAxis, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    Wrench,
    Settings,
    CheckCircle,
    HardHat,
    GripHorizontal,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal,
    Trash2,
    CornerDownRight,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Asset, AssetStatus, DATA } from "../AssetTable/utils/data";
import { cn } from "@/lib/utils";
import { DraggableTableHeader } from "../AssetTable/components/Header/TableHeader";
import { DraggableRow } from "../AssetTable/components/Row/TableRow";
import { EditableCell } from "../AssetTable/components/Cell/CellEditor";

import AddItemModal from "../AssetTable/components/Modals/AddItemModal";
import Link from "next/link";

// --- Main Component ---
export default function TableVariant2({ data: initialData }: { data: Asset[] }) {
    const [isMounted, setIsMounted] = useState(false);

    // Extract unique categories from DATA for the dropdown
    const uniqueCategories = React.useMemo(() => {
        const categories = new Set(DATA.map(item => item.category));
        return Array.from(categories).sort();
    }, []);

    // Helper to find item and its parent in the tree
    const findItemPath = (items: Asset[], id: string): { parent: Asset | null, index: number, array: Asset[] } | null => {
        for (let i = 0; i < items.length; i++) {
            if (items[i].id === id) {
                return { parent: null, index: i, array: items };
            }
            if (items[i].subRows) {
                const result = findItemPath(items[i].subRows!, id);
                if (result) {
                    if (result.parent === null) {
                        return { parent: items[i], index: result.index, array: items[i].subRows! };
                    }
                    return result;
                }
            }
        }
        return null;
    };

    const [data, setData] = useState(() => {
        if (typeof window !== "undefined") {
            const savedData = localStorage.getItem("assetTableData_v2");
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    if (Array.isArray(parsed)) return parsed;
                } catch (e) {
                    console.error("Failed to parse saved data", e);
                }
            }
            // Fallback for migration
            const savedOrder = localStorage.getItem("assetTableRowOrder_v2");
            if (savedOrder) {
                try {
                    const orderIds = JSON.parse(savedOrder) as string[];
                    const orderMap = new Map(orderIds.map((id, index) => [id, index]));
                    const sorted = [...initialData].sort((a, b) => {
                        const indexA = orderMap.get(a.id) ?? Infinity;
                        const indexB = orderMap.get(b.id) ?? Infinity;
                        return indexA - indexB;
                    });
                    return sorted;
                } catch (e) { }
            }
        }
        return initialData;
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState(""); // Global filter state
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([
        "select",
        "id",
        "serial",
        "category",
        "brand",
        "type",
        "vehicle",
        "status",
    ]);
    const [rowSelection, setRowSelection] = useState({});
    const [expanded, setExpanded] = useState<ExpandedState>(true);
    const [columnSizing, setColumnSizing] = useState({});

    // Load column order from local storage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedOrder = localStorage.getItem("assetTableColumnOrder_v2");
            if (savedOrder) {
                try {
                    const parsedOrder = JSON.parse(savedOrder);
                    if (!parsedOrder.includes("select")) {
                        parsedOrder.unshift("select");
                    }
                    setColumnOrder(parsedOrder);
                } catch (e) {
                    console.error("Failed to parse column order", e);
                }
            }
            const savedSizing = localStorage.getItem("assetTableColumnSizing_v2");
            if (savedSizing) {
                try {
                    setColumnSizing(JSON.parse(savedSizing));
                } catch (e) {
                    console.error("Failed to parse column sizing", e);
                }
            }
        }
    }, []);

    // Save column order to local storage
    useEffect(() => {
        localStorage.setItem("assetTableColumnOrder_v2", JSON.stringify(columnOrder));
    }, [columnOrder]);

    // Save full data structure to local storage
    useEffect(() => {
        localStorage.setItem("assetTableData_v2", JSON.stringify(data));
    }, [data]);

    // Save column sizing to local storage
    useEffect(() => {
        localStorage.setItem("assetTableColumnSizing_v2", JSON.stringify(columnSizing));
    }, [columnSizing]);

    const columns = React.useMemo<ColumnDef<Asset>[]>(() => [
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
            cell: ({ row }) => {
                // Calculation for guide lines
                const indentSize = 24;
                const paddingLeft = row.depth * indentSize;

                return (
                    <div className="h-full flex items-center relative" style={{ paddingLeft: `${paddingLeft + 16}px` }}>
                        {/* Horizontal connector for child items */}
                        {row.depth > 0 && (
                            <>
                                {/* Vertical line from parent down to this row */}
                                <div className="absolute top-0 bottom-1/2 w-px bg-gray-300" style={{ left: `${paddingLeft - indentSize / 2 + 16}px` }}></div>
                                {/* Horizontal curve/line to the checkbox */}
                                <div className="absolute top-1/2 left-0 h-px bg-gray-300 w-3" style={{ left: `${paddingLeft - indentSize / 2 + 16}px` }}></div>
                            </>
                        )}

                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                            aria-label="Select row"
                            className="mr-2"
                        />
                        {row.getCanExpand() ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    row.toggleExpanded();
                                }}
                                className="p-0.5 hover:bg-gray-200 rounded cursor-pointer transition-transform"
                            >
                                {row.getIsExpanded() ? (
                                    <ChevronDown size={14} className="text-gray-500" />
                                ) : (
                                    <ChevronRight size={14} className="text-gray-500" />
                                )}
                            </button>
                        ) : <div className="w-4" />} {/* Spacer if no expander */}
                    </div>
                )
            },
            enableSorting: false,
            enableHiding: false,
            size: 80, // Increased size to accommodate indentation
        },
        {
            accessorKey: "id",
            header: "Asset ID",
            cell: (info) => <div className="px-4 py-3 h-full font-medium text-gray-900">{info.getValue() as string}</div>,
            size: 100,
        },
        {
            accessorKey: "serial",
            header: "Serial",
            cell: EditableCell,
            size: 150,
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: (props) => <EditableCell {...props} options={uniqueCategories} />,
            size: 140,
        },
        {
            accessorKey: "brand",
            header: "Brand",
            cell: EditableCell,
            size: 140,
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: EditableCell,
            size: 140,
        },
        {
            accessorKey: "vehicle",
            header: "Vehicle",
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
            header: "End Date",
            cell: (props) => <EditableCell {...props} type="date" />,
            size: 140,
        },
        {
            accessorKey: "status",
            header: "Status",
            size: 180,
            cell: StatusEditableCell,
        },
    ], [uniqueCategories]);

    const table = useReactTable({
        data,
        columns,
        getRowId: (row) => row.id,
        state: {
            sorting,
            columnOrder,
            rowSelection,
            columnFilters,
            columnVisibility,
            globalFilter,
            expanded,
            columnSizing,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        onRowSelectionChange: setRowSelection,
        onColumnSizingChange: setColumnSizing,
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows: (row) => row.subRows,
        getPaginationRowModel: getPaginationRowModel(),
        autoResetPageIndex: false,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        columnResizeMode: "onChange",
        enableColumnResizing: true,
        meta: {
            updateData: async (itemId: string, columnId: string, value: any) => {
                // Mock update
                setData((old) =>
                    old.map((item) => {
                        const updateRecursive = (items: Asset[]): Asset[] => {
                            return items.map(i => {
                                if (i.id === itemId) return { ...i, [columnId]: value };
                                if (i.subRows) return { ...i, subRows: updateRecursive(i.subRows) };
                                return i;
                            })
                        }
                        return updateRecursive([item])[0];
                    })
                );
            },
        },
    });

    const handleDeleteSelected = async () => {
        const selectedRowIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
        alert(`Deleting: ${selectedRowIds.join(", ")}`);
        setRowSelection({});
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<Asset | null>(null);

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
        const currentActive = event.active;
        if (currentActive.data.current?.type === 'row') {
            const path = findItemPath(data, currentActive.id as string);
            if (path) {
                const item = path.array[path.index];
                setActiveItem(item);
            }
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);
        setActiveItem(null);
        if (!over) return;

        if (active.id !== over.id) {
            const activeType = active.data.current?.type;

            if (activeType === "column") {
                setColumnOrder((order) => {
                    const oldIndex = order.indexOf(active.id as string);
                    const newIndex = order.indexOf(over.id as string);
                    return arrayMove(order, oldIndex, newIndex);
                });
            } else if (activeType === "row") {
                setData((prevData) => {
                    const activePath = findItemPath(prevData, active.id as string);
                    const overPath = findItemPath(prevData, over.id as string);

                    if (!activePath || !overPath) return prevData;

                    let effectiveOverPath = overPath;
                    let effectiveNewIndex = overPath.index;
                    let isProjected = false;

                    const sameParent = activePath.array === overPath.array;

                    if (!sameParent) {
                        try {
                            let current = overPath.parent;
                            while (current) {
                                if (activePath.array.includes(current)) {
                                    effectiveOverPath = {
                                        parent: null,
                                        index: activePath.array.indexOf(current),
                                        array: activePath.array
                                    };
                                    effectiveNewIndex = effectiveOverPath.index;
                                    isProjected = true;
                                    break;
                                }
                                const parentPath = findItemPath(prevData, current.id);
                                if (parentPath && parentPath.parent) {
                                    current = parentPath.parent;
                                } else if (parentPath && parentPath.parent === null) {
                                    if (activePath.array === prevData) {
                                        break;
                                    }
                                    break;
                                } else {
                                    break;
                                }
                            }
                        } catch (e) {
                            console.error("Error projecting ancestor", e);
                        }
                    }

                    if (activePath.array === effectiveOverPath.array) {
                        const oldIndex = activePath.index;
                        const newIndex = effectiveNewIndex;
                        const newData = [...prevData];

                        const updateRecursive = (items: Asset[]): Asset[] => {
                            if (items === activePath.array) {
                                return arrayMove(items, oldIndex, newIndex);
                            }
                            return items.map(item => {
                                if (item.subRows) {
                                    const updatedSubRows = updateRecursive(item.subRows);
                                    if (updatedSubRows !== item.subRows) {
                                        return { ...item, subRows: updatedSubRows };
                                    }
                                }
                                return item;
                            });
                        };

                        if (activePath.parent === null) {
                            return arrayMove(prevData, oldIndex, newIndex);
                        }

                        return updateRecursive(newData);
                    }
                    return prevData;
                });
            }
        }
    }

    if (!isMounted) {
        return null;
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-sm border border-gray-200 font-sans">
            <div className="mb-4">
                <Link href="/" className="text-sm text-blue-500 hover:underline mb-2 block">← Back to Variations</Link>
                <h2 className="text-xl font-bold text-gray-800">Variation 2: Nested Lines</h2>
            </div>
            {/* Search and Toolbar */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-2 items-center">
                    <div className="relative w-64">
                        <input
                            type="text"
                            placeholder="Search all assets"
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="absolute left-2.5 top-2.5 text-gray-400">🔍</span>
                    </div>
                </div>
            </div>

            <DndContext
                collisionDetection={closestCenter}
                // modifiers={[restrictToHorizontalAxis]}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                sensors={sensors}
            >
                <div className="overflow-x-auto border border-gray-200 rounded-md">
                    <table className="w-full text-sm text-left table-fixed border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    <SortableContext
                                        items={columnOrder}
                                        strategy={horizontalListSortingStrategy}
                                    >
                                        {headerGroup.headers.map((header) => (
                                            <DraggableTableHeader key={header.id} header={header} />
                                        ))}
                                    </SortableContext>
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <SortableContext
                                items={table.getRowModel().rows.map(row => row.original.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {table.getRowModel().rows.map((row) => {
                                    return (
                                        <DraggableRow
                                            key={row.id}
                                            row={row} // Added row prop to fix regression
                                            rowId={row.original.id}
                                            onClick={() => row.toggleSelected()}
                                            className={cn(
                                                "border-b border-gray-100 cursor-pointer transition-colors",
                                                // Depth based background
                                                row.depth === 0 ? "bg-white" : row.depth === 1 ? "bg-gray-50" : "bg-gray-100",
                                                "hover:bg-slate-100",
                                                row.getIsSelected() ? "bg-blue-50 ring-1 ring-inset ring-blue-300" : "",
                                                "h-14"
                                            )}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} style={{ width: cell.column.getSize() }} className={cn("p-0 text-gray-700 relative")}>
                                                    <div className="truncate w-full px-4" title={cell.getValue() as string}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </div>
                                                </td>
                                            ))}
                                        </DraggableRow>
                                    );
                                })}
                            </SortableContext>
                        </tbody>
                    </table>
                </div>
                {/* Drag Overlay Portal */}
                {typeof window !== "undefined" && createPortal(
                    <DragOverlay adjustScale={true}>
                        {activeId ? (
                            <div className="opacity-90 shadow-2xl cursor-grabbing transform rotate-2 bg-white border border-blue-500 rounded-md overflow-hidden">
                                {/* Render simplified row or column preview */}
                                {activeItem ? (
                                    <div className="flex items-center h-14 px-4 bg-gray-50 text-sm font-medium text-gray-700">
                                        <div className="flex gap-4">
                                            <span className="font-bold">{activeItem.id}</span>
                                            <span>{activeItem.vehicle}</span>
                                            <span className="text-gray-400">{activeItem.category}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="px-4 py-3 bg-gray-100 font-bold text-gray-700 border-b-2 border-blue-500">
                                        {activeId}
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    );
}
