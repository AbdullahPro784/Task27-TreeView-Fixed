
import React, { useState, useEffect, useMemo } from "react";
import {
    SortingState,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getExpandedRowModel,
    useReactTable,
    ColumnOrderState,
    ColumnFiltersState,
    VisibilityState,
} from "@tanstack/react-table";
import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Asset, DATA } from "../utils/data";
import { getColumns } from "../columns";

export interface AdvancedFilters {
    categories: string[];
    statuses: string[];
    valueRange: { min: number | null; max: number | null };
}

export function useTableEngine(initialData: Asset[]) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // State
    const [data, setData] = useState(() => {
        if (typeof window !== "undefined") {
            const savedOrder = localStorage.getItem("assetTableRowOrder");
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
                } catch (e) {
                    console.error("Failed to parse row order", e);
                }
            }
        }
        return initialData;
    });

    // Unique Categories
    const uniqueCategories = useMemo(() => {
        const categories = new Set(data.map(item => item.category));
        return Array.from(categories).sort();
    }, [data]);


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
        "endDate",
    ]);
    const [rowSelection, setRowSelection] = useState({});
    const [columnSizing, setColumnSizing] = useState({});
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [durationFilter, setDurationFilter] = useState<string>("All");
    const [summaryFilter, setSummaryFilter] = useState<string | null>(null);

    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<Asset | null>(null);

    // Persistence Effects
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedOrder = localStorage.getItem("assetTableColumnOrder");
            if (savedOrder) {
                try {
                    const parsedOrder = JSON.parse(savedOrder);
                    if (!parsedOrder.includes("select")) {
                        parsedOrder.unshift("select");
                    }
                    setColumnOrder(parsedOrder);
                } catch (e) { }
            }
            const savedSizing = localStorage.getItem("assetTableColumnSizing");
            if (savedSizing) {
                try {
                    setColumnSizing(JSON.parse(savedSizing));
                } catch (e) { }
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("assetTableColumnOrder", JSON.stringify(columnOrder));
    }, [columnOrder]);

    useEffect(() => {
        localStorage.setItem("assetTableColumnSizing", JSON.stringify(columnSizing));
    }, [columnSizing]);

    useEffect(() => {
        const rowIds = data.map(item => item.id);
        localStorage.setItem("assetTableRowOrder", JSON.stringify(rowIds));
    }, [data]);




    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
        categories: [],
        statuses: [],
        valueRange: { min: null, max: null }
    });


    // Filter Logic
    const filterData = useMemo(() => {
        let filtered = data;

        // 1. Status Filter (Quick Filter from Toolbar)
        if (statusFilter !== "All") {
            filtered = filtered.filter(item => {
                const s = item.status.state;
                if (statusFilter === "Maintenance") return s === "maintenance";
                if (statusFilter === "Operational") return s === "operational";
                if (statusFilter === "Repair") return s === "repair";
                if (statusFilter === "Inspection") return s === "inspection";
                return item.status.state === statusFilter.toLowerCase();
            });
        }

        // 2. Summary Filter (Cards)
        if (summaryFilter) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            filtered = filtered.filter(item => {
                const s = item.status.state;
                const isClosed = s === "operational" || (item as any).status.state === "closed";
                if (summaryFilter === "closed") return isClosed;
                if (summaryFilter === "delayed") {
                    if (isClosed) return false;
                    if (!item.endDate) return false;
                    const end = new Date(item.endDate);
                    end.setHours(0, 0, 0, 0);
                    return end < today;
                }
                if (summaryFilter === "in-process") {
                    if (isClosed) return false;
                    if (item.endDate) {
                        const end = new Date(item.endDate);
                        end.setHours(0, 0, 0, 0);
                        if (end < today) return false;
                    }
                    return true;
                }
                return true;
            });
        }

        // 3. Advanced Filters (Panel)
        if (advancedFilters.categories.length > 0) {
            filtered = filtered.filter(item => advancedFilters.categories.includes(item.category));
        }

        if (advancedFilters.statuses.length > 0) {
            filtered = filtered.filter(item =>
                advancedFilters.statuses.some(s => s.toLowerCase() === item.status.state.toLowerCase())
            );
        }

        if (advancedFilters.valueRange.min !== null || advancedFilters.valueRange.max !== null) {
            filtered = filtered.filter(item => {
                const val = item.status.level ?? 0;
                if (advancedFilters.valueRange.min !== null && val < advancedFilters.valueRange.min) return false;
                if (advancedFilters.valueRange.max !== null && val > advancedFilters.valueRange.max) return false;
                return true;
            });
        }

        return filtered;
    }, [data, statusFilter, summaryFilter, advancedFilters]);


    // Statistics
    const stats = useMemo(() => {
        const total = data.length;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let delayed = 0;
        let inProcess = 0;
        let closed = 0;

        data.forEach(item => {
            const s = item.status.state;
            const isClosed = s === 'operational' || (item as any).status.state === 'closed';
            if (isClosed) {
                closed++;
                return;
            }
            if (item.endDate) {
                const end = new Date(item.endDate);
                end.setHours(0, 0, 0, 0);
                if (end < today) {
                    delayed++;
                    return;
                }
            }
            inProcess++;
        });
        return { total, delayed, inProcess, closed };
    }, [data]);

    // Table Instance
    const columns = useMemo(() => getColumns(uniqueCategories), [uniqueCategories]);

    const table = useReactTable({
        data: filterData,
        columns,
        getRowId: (row) => row.id,
        state: {
            sorting,
            columnOrder,
            rowSelection,
            columnFilters,
            columnVisibility,
            globalFilter,
            columnSizing,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        onRowSelectionChange: setRowSelection,
        onColumnSizingChange: setColumnSizing,
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
                setData((old) =>
                    old.map((item) => {
                        if (item.id === itemId) return { ...item, [columnId]: value };
                        return item;
                    })
                );
            },
        },
    });

    // Handlers
    const handleDeleteSelected = async () => {
        try {
            const selectedRowIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
            if (selectedRowIds.length === 0) {
                alert("No items selected!");
                return;
            }
            if (window.confirm(`Are you sure you want to delete ${selectedRowIds.length} item(s)?`)) {
                // Mock API call
                setData(prev => prev.filter(item => !selectedRowIds.includes(item.id)));
                setRowSelection({});
            }
        } catch (error) {
            console.error("Delete failed", error);
            alert(`Error deleting items: ${(error as Error).message}`);
        }
    };

    const handleAddItem = (newItem: any) => {
        const formattedItem: Asset = {
            id: newItem.id,
            serial: newItem.serial,
            category: newItem.category,
            brand: newItem.brand,
            type: newItem.type,
            vehicle: newItem.vehicle,
            status: {
                state: newItem.statusState,
                level: newItem.statusLevel ? Number(newItem.statusLevel) : undefined
            },
            endDate: newItem.endDate
        };
        setData((prev) => [formattedItem, ...prev]);
    };

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
        const currentActive = event.active;
        if (currentActive.data.current?.type === 'row') {
            const item = data.find(i => i.id === currentActive.id);
            setActiveItem(item || null);
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
                setData((prev) => {
                    const oldIndex = prev.findIndex((item) => item.id === active.id);
                    const newIndex = prev.findIndex((item) => item.id === over.id);
                    if (oldIndex !== -1 && newIndex !== -1) {
                        return arrayMove(prev, oldIndex, newIndex);
                    }
                    return prev;
                });
            }
        }
    }

    return {
        table,
        data,
        globalFilter, setGlobalFilter,
        statusFilter, setStatusFilter,
        durationFilter, setDurationFilter,
        summaryFilter, setSummaryFilter,
        advancedFilters, setAdvancedFilters,
        activeId,
        activeItem,
        columnOrder,
        uniqueCategories,
        stats,
        isMounted,
        handleDeleteSelected,
        handleAddItem,
        handleDragStart,
        handleDragEnd
    };
}
