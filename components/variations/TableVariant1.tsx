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
import { TreeLines } from "../AssetTable/components/Row/TreeLines";
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
import { Expander } from "../AssetTable/components/Cell/Expander"; // NEW
import { TableCell } from "../AssetTable/components/Cell/TableCell"; // NEW
import { CellSparkline } from "../AssetTable/components/Cell/CellSparkline"; // NEW

import AddItemModal from "../AssetTable/components/Modals/AddItemModal";
import Link from "next/link";

// --- Main Component ---
export default function TableVariant1({ data: initialData }: { data: Asset[] }) {
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
                    // path found in subRows
                    if (result.parent === null) {
                        // direct child of this item
                        return { parent: items[i], index: result.index, array: items[i].subRows! };
                    }
                    return result;
                }
            }
        }
        return null;
    };

    const [data, setData] = useState(() => {
        // Try to load full data structure from local storage
        if (typeof window !== "undefined") {
            const savedData = localStorage.getItem("assetTableData_v1"); // Use new key for full data
            if (savedData) {
                try {
                    // We assume the saved data is the full hierarchical structure
                    const parsed = JSON.parse(savedData);
                    if (Array.isArray(parsed)) return parsed;
                } catch (e) {
                    console.error("Failed to parse saved data", e);
                }
            }
            // Fallback: check for old row order (migration path, optional)
            const savedOrder = localStorage.getItem("assetTableRowOrder_v1");
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

    // Save full data structure to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem("assetTableData_v1", JSON.stringify(data));
    }, [data]);

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
        "activity", // NEW
    ]);
    const [rowSelection, setRowSelection] = useState({});
    const [expanded, setExpanded] = useState<ExpandedState>(true);
    const [columnSizing, setColumnSizing] = useState({});

    // Load column order and sizing from local storage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedOrder = localStorage.getItem("assetTableColumnOrder_v1");
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
            const savedSizing = localStorage.getItem("assetTableColumnSizing_v1");
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
        localStorage.setItem("assetTableColumnOrder_v1", JSON.stringify(columnOrder));
    }, [columnOrder]);

    // Save column sizing to local storage
    useEffect(() => {
        localStorage.setItem("assetTableColumnSizing_v1", JSON.stringify(columnSizing));
    }, [columnSizing]);

    // Save row order to local storage
    useEffect(() => {
        const rowIds = data.map(item => item.id);
        localStorage.setItem("assetTableRowOrder_v1", JSON.stringify(rowIds));
    }, [data]);

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
            cell: ({ row }) => (
                <div className="px-4 py-3 h-full flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <div style={{ paddingLeft: `${row.depth * 20}px` }}> {/* Indentation built-in to first cell */}
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                            aria-label="Select row"
                        />
                    </div>
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
            size: 50,
        },
        {
            accessorKey: "id",
            header: "Asset ID",
            cell: ({ row, getValue, table }) => {
                return (
                    <div className="relative h-full flex items-center">
                        <div className="absolute left-0 top-0 bottom-0 pointer-events-none">
                            <TreeLines row={row} lineColor="border-blue-300" />
                        </div>

                        <div
                            className="flex items-center gap-2 py-2 w-full min-w-0"
                            style={{ paddingLeft: `${row.depth * 20 + 4}px` }}
                        >
                            {row.getCanExpand() && (
                                <Expander row={row} />
                            )}
                            {getValue() as string}
                        </div>
                    </div>
                );
            },
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
        {
            id: "activity",
            header: "Activity",
            size: 120,
            cell: () => (
                <TableCell>
                    <CellSparkline data={[10, 20, 15, 25, 30, 20, 40]} />
                </TableCell>
            )
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
                // ... (Keep existing update logic)
                console.log("Mock update", itemId, columnId, value);
                setData((old) =>
                    old.map((item) => {
                        // Simple recursive update for demo
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
        // ... (Keep existing delete logic mocked for now)
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
            // Use helper to find item recursively
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

                    // Only allow reordering within the same parent (same level)
                    // We check if the arrays are the same reference (or same parent ID)
                    // Since we return the array ref in findItemPath, we can compare arrays directly, 
                    // but checking parent ID is safer for logic if arrays were cloned.
                    let effectiveOverPath = overPath;
                    let effectiveNewIndex = overPath.index;
                    let isProjected = false;

                    const sameParent = activePath.array === overPath.array;

                    if (!sameParent) {
                        // Check if 'over' is a descendant of a sibling of 'active'
                        // We need to traverse up from 'over' until we find an item that is in 'activePath.array'

                        let current = overPath.parent;
                        while (current) {
                            if (activePath.array.includes(current)) {
                                // Found the ancestor that is a sibling of active
                                effectiveOverPath = {
                                    parent: null, // We don't need this for the array check below as we use activePath.array
                                    index: activePath.array.indexOf(current),
                                    array: activePath.array
                                };
                                effectiveNewIndex = effectiveOverPath.index;
                                isProjected = true;
                                break;
                            }
                            // Move up
                            // We need to find the parent of 'current'.
                            // Since our findItemPath is top-down, we might need to re-search or be smarter.
                            // Re-search is expensive but safe.
                            const parentPath = findItemPath(prevData, current.id);
                            if (parentPath && parentPath.parent) {
                                current = parentPath.parent;
                            } else if (parentPath && parentPath.parent === null) {
                                // current is root, but we already checked activePath.array.includes(current) if active is root
                                // If active is NOT root, but we reached root, then we can't project.
                                if (activePath.array === prevData) {
                                    // active is root, current is root.
                                    // This should have been caught by includes check if they are same array.
                                    break;
                                }
                                break;
                            } else {
                                break;
                            }
                        }
                    }

                    // Re-check if we can move now
                    if (activePath.array === effectiveOverPath.array) {
                        const oldIndex = activePath.index;
                        const newIndex = effectiveNewIndex;

                        // We need to clone the tree to mutate it immutably
                        const newData = [...prevData];

                        // Helper to recursively update the specific array
                        const updateRecursive = (items: Asset[]): Asset[] => {
                            // If this is the array we want to update
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

                        // If it's the top level array
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
                <h2 className="text-xl font-bold text-gray-800">Variation 1: Indented Tree</h2>
            </div>
            <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-2 items-center">
                    <div className="relative w-64">
                        <input
                            type="text"
                            placeholder="Search all assets"
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    <table className="w-full text-sm text-left table-fixed">
                        <thead>
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
                            {/* Note: In a Tree Data table, dnd-kit vertical sorting with random sub-rows is tricky because rows render recursively.
                                 TanStack Table flattens them for us if we use `getRowModel()`.
                                 However, `data.map` in SortableContext items must match the rendered rows order??
                                 Actually, `SortableContext` needs the IDs of the items being rendered.
                                 If we render `table.getRowModel().rows`, we should pass those IDs to `SortableContext`.
                             */}
                            <SortableContext
                                items={table.getRowModel().rows.map(row => row.original.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {table.getRowModel().rows.map((row) => {
                                    return (
                                        <DraggableRow
                                            key={row.id}
                                            row={row} // Added row prop to fix regression
                                            rowId={row.original.id} // Use original ID for handling data update? OR row.id (which might be hierarchical)? data update uses original ID.
                                            // DraggableRow uses ID for Sortable. SortableContext must match.
                                            // If row.id is "0.1", but our data has "id-123", we need to align.
                                            // Tanstack uses index by default if no getRowId. We provided getRowId = row.id.
                                            // So row.id is the asset ID. Excellent.

                                            onClick={() => row.toggleSelected()}
                                            className={cn(
                                                "border-b border-gray-100 cursor-pointer transition-colors",
                                                "hover:bg-slate-50",
                                                row.getIsSelected() ? "bg-opacity-90 ring-1 ring-inset ring-orange-400" : "",
                                                "h-16"
                                            )}
                                        >
                                            {row.getVisibleCells().map((cell) => {
                                                return (
                                                    <td
                                                        key={cell.id}
                                                        style={{ width: cell.column.getSize() }}
                                                        className={cn("text-gray-700 align-middle", cell.column.id === "id" ? "p-0" : "py-3")}
                                                    >
                                                        <div
                                                            className={cn("truncate w-full", cell.column.id === "id" ? "p-0" : "px-4")}
                                                            title={cell.getValue() as string}
                                                        >
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </div>
                                                    </td>
                                                );
                                            })}
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
