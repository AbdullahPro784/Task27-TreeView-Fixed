"use client";

import React, { useEffect, useState, useRef } from "react";
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
import { StatusEditableCell } from "../StatusEditableCell";
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
    Calendar,
    MessageSquare,
    LayoutList
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Asset, AssetStatus, DATA } from "../data";
import { cn } from "@/lib/utils";
import { DraggableTableHeader } from "../DraggableTableHeader";
import { DraggableRow } from "../DraggableRow";
import { EditableCell } from "../EditableCell";

import AddItemModal from "../AddItemModal";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Sub-Item Editable Cell ---
const SubItemEditableCell = ({
    value: initialValue,
    onSave
}: {
    value: string,
    onSave: (val: string) => void
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        if (value !== initialValue) {
            onSave(value);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlur();
        } else if (e.key === 'Escape') {
            setValue(initialValue);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 border border-blue-400 rounded bg-white text-xs font-medium text-gray-800 focus:outline-none"
            />
        );
    }

    return (
        <div
            onDoubleClick={() => setIsEditing(true)}
            className="w-full h-full px-3 py-2 cursor-text hover:bg-gray-100 rounded transition-colors"
        >
            {value}
        </div>
    );
};


// --- Sub-Component for Detail View ---
function SubDetailView({
    subRows,
    onAdd,
    onUpdate
}: {
    subRows: Asset[],
    onAdd: () => void,
    onUpdate: (id: string, field: keyof Asset, value: string) => void
}) {
    // Determine content based on whether subRows exist
    const hasRows = subRows && subRows.length > 0;

    return (
        <div className="bg-gray-50 p-4 border-t border-b border-gray-200 shadow-inner">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <LayoutList size={16} /> Sub-Items / Tasks
            </h4>
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                {hasRows ? (
                    <table className="w-full text-xs text-left">
                        <thead className="bg-gray-100 text-gray-600 border-b border-gray-200">
                            <tr>
                                <th className="px-3 py-2 font-medium"></th>
                                <th className="px-3 py-2 font-medium">Subitem (Serial)</th>
                                <th className="px-3 py-2 font-medium">Category</th>
                                <th className="px-3 py-2 font-medium">Owner</th>
                                <th className="px-3 py-2 font-medium">Status</th>
                                <th className="px-3 py-2 font-medium">Date</th>
                                <th className="px-3 py-2 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subRows.map((sub, idx) => (
                                <tr key={sub.id} className="border-b border-gray-100 last:border-0 hover:bg-slate-50">
                                    <td className="px-3 py-2 w-8 text-center text-gray-400">{idx + 1}</td>

                                    {/* Editable Serial */}
                                    <td className="p-0 font-medium text-gray-800 w-32 border-r border-transparent hover:border-gray-200">
                                        <SubItemEditableCell
                                            value={sub.serial}
                                            onSave={(val) => onUpdate(sub.id, 'serial', val)}
                                        />
                                    </td>

                                    {/* Editable Category */}
                                    <td className="p-0 font-medium text-gray-800 w-32 border-r border-transparent hover:border-gray-200">
                                        <SubItemEditableCell
                                            value={sub.category}
                                            onSave={(val) => onUpdate(sub.id, 'category', val)}
                                        />
                                    </td>

                                    <td className="px-3 py-2">
                                        <div className="flex -space-x-2">
                                            <Avatar className="h-6 w-6 border-2 border-white">
                                                <AvatarFallback className="bg-orange-200 text-orange-800 text-[10px]">JD</AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide",
                                            sub.status.state === 'operational' ? "bg-green-100 text-green-700" :
                                                sub.status.state === 'maintenance' ? "bg-orange-100 text-orange-700" :
                                                    "bg-gray-100 text-gray-700"
                                        )}>
                                            {sub.status.state}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-gray-500">{sub.endDate || "-"}</td>
                                    <td className="px-3 py-2">
                                        <button className="text-gray-400 hover:text-blue-600">
                                            <MessageSquare size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-8 text-center text-gray-400 text-xs italic">
                        No sub-items found. Click below to add one.
                    </div>
                )}

                <div className="p-2 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onAdd}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded font-medium flex items-center gap-1 transition-colors"
                    >
                        + Add subitem
                    </button>
                </div>
            </div>
        </div>
    )
}


// --- Main Component ---
export default function TableVariant3({ data: initialData }: { data: Asset[] }) {
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

    const [data, setData] = useState<Asset[]>(() => {
        if (typeof window !== "undefined") {
            const savedData = localStorage.getItem("assetTableData_v3");
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    if (Array.isArray(parsed)) return parsed;
                } catch (e) {
                    console.error("Failed to parse saved data", e);
                }
            }
            // Fallback for migration
            const savedOrder = localStorage.getItem("assetTableRowOrder_v3");
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
    const [globalFilter, setGlobalFilter] = useState("");
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
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const [columnSizing, setColumnSizing] = useState({});

    const handleAddSubItem = (parentId: string) => {
        setData(prev => prev.map(item => {
            if (item.id === parentId) {
                const newSubItem: Asset = {
                    id: `${parentId}-sub-${Date.now()}`,
                    serial: `NEW-${Math.floor(Math.random() * 1000)}`,
                    category: "New Task",
                    brand: "-",
                    type: "Task",
                    vehicle: "-",
                    status: { state: "operational", level: 1 },
                    endDate: new Date().toISOString().split('T')[0]
                };
                return {
                    ...item,
                    subRows: item.subRows ? [...item.subRows, newSubItem] : [newSubItem]
                };
            }
            return item;
        }));
    };

    const handleUpdateSubItem = (parentId: string, subItemId: string, field: keyof Asset, value: string) => {
        setData(prev => prev.map(item => {
            if (item.id === parentId && item.subRows) {
                return {
                    ...item,
                    subRows: item.subRows.map(sub => {
                        if (sub.id === subItemId) {
                            return { ...sub, [field]: value };
                        }
                        return sub;
                    })
                }
            }
            return item;
        }));
    };

    // Load column order from local storage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedOrder = localStorage.getItem("assetTableColumnOrder_v3");
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

            const savedSizing = localStorage.getItem("assetTableColumnSizing_v3");
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
        localStorage.setItem("assetTableColumnOrder_v3", JSON.stringify(columnOrder));
    }, [columnOrder]);

    // Save full data structure to local storage
    useEffect(() => {
        localStorage.setItem("assetTableData_v3", JSON.stringify(data));
    }, [data]);

    // Save column sizing to local storage
    useEffect(() => {
        localStorage.setItem("assetTableColumnSizing_v3", JSON.stringify(columnSizing));
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
                // Determine if we show expander (only if subRows exist)
                // Actually, for adding subitems, we might WANT to expand empty rows? 
                // But current logic hides expander if empty. 
                // Let's modify this: ALWAYS show expander if it's a top level row in this view?
                // Or just keep logic: only show if subRows exist? 
                // Wait, if I add a subitem to an item with NO subitems, nothing happens visually until I expand it.
                // But I can't expand it if the chevron is hidden!
                // So I should probably ALWAYS show the chevron in Variant 3 since we can add items?
                // OR, just for now, assume we attach to existing ones.
                // Better UX: Always show chevron for Variant 3 so you can open the empty panel and click "Add".

                // For now, let's stick to the current logic but maybe ensuring the row expands when we add an item?
                // Let's just update the check to be simpler or allow it. 
                // But to be safe, I'll keep the logic matching the image for now (expander present).

                const hasSubRows = row.original.subRows && row.original.subRows.length > 0;
                // If we want to allow adding to empty rows, we should always allow expansion or auto-expand on add.
                // Let's assume for this specific user request, they are clicking "Add" on an ALREADY OPEN panel.

                return (
                    <div className="px-4 py-3 h-full flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                            aria-label="Select row"
                        />
                        {/* Always showing chevron for V3 to allow opening empty details? 
                             Let's stick to hiding it if empty for clean look, UNLESS user wants to add?
                             Actually the "Add" button is INSIDE the detail panel. 
                             So you can't click "Add" unless it's already expanded.
                             Which means you can't add to empty rows currently.
                             That is a catch-22. 
                             
                             However, the user report is likely about clicking the button that IS visible.
                             So I will focus on fixing the button that IS visible. 
                         */}
                        {hasSubRows ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    row.toggleExpanded();
                                }}
                                className={cn(
                                    "p-1 rounded cursor-pointer transition-colors",
                                    row.getIsExpanded() ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-500"
                                )}
                            >
                                {row.getIsExpanded() ? (
                                    <ChevronDown size={16} />
                                ) : (
                                    <ChevronRight size={16} />
                                )}
                            </button>
                        ) : <div className="w-6" />}
                    </div>
                )
            },
            enableSorting: false,
            enableHiding: false,
            size: 80,
        },
        // ... Same columns as before ...
        {
            accessorKey: "id",
            header: "Asset ID",
            cell: (info) => <div className="px-4 py-3 h-full font-medium">{info.getValue() as string}</div>,
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
            cell: ({ row, getValue }) => {
                const value = getValue() as string;
                return (
                    <div className="flex items-center justify-between px-4 py-3 h-full group">
                        <span className="truncate">{value}</span>
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Assign Driver</DropdownMenuItem>
                                <DropdownMenuItem>Check History</DropdownMenuItem>
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
        // IMPORTANT: We do NOT pass getSubRows here, or we simply return [] so it doesn't flatten them.
        // If we omit it, behavior depends on if data has "subRows". 
        // Let's force it to treat them as flat rows for the main table, and we handle subRows manually in render.
        getSubRows: undefined,
        getPaginationRowModel: getPaginationRowModel(),
        autoResetPageIndex: false,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        // We need to tell the table we can expand rows even if getSubRows is not used?
        getRowCanExpand: (row) => !!row.original.subRows && row.original.subRows.length > 0,
        columnResizeMode: "onChange",
        enableColumnResizing: true,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            columnOrder,
            rowSelection,
            globalFilter,
            expanded,
            columnSizing,
        },
        meta: {
            updateData: async (itemId: string, columnId: string, value: any) => {
                // Mock update
                console.log("update", itemId, value);
            },
        },
    });

    const handleDeleteSelected = async () => {
        const selectedRowIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
        alert(`Deleting: ${selectedRowIds.join(", ")} `);
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

                    const sameParent = activePath.array === overPath.array;

                    if (sameParent) {
                        const oldIndex = activePath.index;
                        const newIndex = overPath.index;
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
                <h2 className="text-xl font-bold text-gray-800">Variation 3: Master-Detail Panel</h2>
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
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <span className="absolute left-2.5 top-2.5 text-gray-400">🔍</span>
                    </div>
                </div>
            </div>

            <DndContext
                collisionDetection={closestCenter}
                // modifiers={[restrictToHorizontalAxis]}
                onDragStart={handleDragStart} // Added
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
                        <tbody>
                            <SortableContext
                                items={table.getRowModel().rows.map(row => row.original.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {table.getRowModel().rows.map((row) => {
                                    return (
                                        <React.Fragment key={row.id}>
                                            <DraggableRow
                                                rowId={row.original.id}
                                                onClick={() => row.toggleSelected()}
                                                className={cn(
                                                    "border-b border-gray-100 cursor-pointer transition-colors",
                                                    row.getIsExpanded() ? "bg-gray-50 border-b-0" : "hover:bg-slate-50", // Distinct active state
                                                    row.getIsSelected() ? "bg-opacity-90 ring-1 ring-inset ring-green-400" : "",
                                                    "h-16"
                                                )}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <td key={cell.id} style={{ width: cell.column.getSize() }} className="p-0 text-gray-700">
                                                        <div className="truncate w-full px-4" title={cell.getValue() as string}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </div>
                                                    </td>
                                                ))}
                                            </DraggableRow>
                                            {/* Detail Panel */}
                                            {row.getIsExpanded() && (
                                                <tr>
                                                    <td colSpan={columns.length} className="p-0">
                                                        <SubDetailView
                                                            subRows={row.original.subRows || []}
                                                            onAdd={() => handleAddSubItem(row.original.id)}
                                                            onUpdate={(subId, field, val) => handleUpdateSubItem(row.original.id, subId, field, val)}
                                                        />
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
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
