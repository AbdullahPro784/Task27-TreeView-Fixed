
"use client";

import React, { useState } from "react";
import {
    DndContext,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
    DragOverlay
} from "@dnd-kit/core";
import { createPortal } from "react-dom";
import {
    SortableContext,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
    sortableKeyboardCoordinates
} from "@dnd-kit/sortable";
import { ChevronRight, ChevronLeft, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { Asset } from "./utils/data";
import { DraggableTableHeader } from "./components/Header/TableHeader";
import { FilterRow } from "./components/Header/FilterRow";
import { DraggableRow } from "./components/Row/TableRow";
import { SummaryCards } from "./components/Panels/SummaryCards";
import { StatusBar } from "@/components/AssetTable/components/Panels/StatusBar";
import { SideBar } from "./components/Panels/SideBar";
import { FilterPanel } from "./components/Panels/FilterPanel";
import { IntegratedChart } from "./components/Modals/IntegratedChart";
import { GlobalSearch } from "./components/Toolbar/GlobalSearch";
import { ExportActions } from "./components/Toolbar/ExportActions";
import AddItemModal from "./components/Modals/AddItemModal";
import { useTableEngine } from "./hooks/useTableEngine";
import { useVirtualization } from "./hooks/useVirtualization";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import { flexRender } from "@tanstack/react-table";
import { useRef } from "react";
import { TreeLines } from "./components/Row/TreeLines";
import { TABLE_CONSTANTS } from "./constants";
import styles from "./styles.module.css";

export default function AssetTable({ data: initialData }: { data: Asset[] }) {
    const {
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
    } = useTableEngine(initialData);

    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isChartOpen, setIsChartOpen] = useState(false);

    const handleApplyFilters = (filters: any) => {
        console.log("Applying Advanced Filters:", filters);
        setAdvancedFilters(filters);
    };

    const tableContainerRef = useRef<HTMLDivElement>(null);

    const { rows } = table.getRowModel();

    const rowVirtualizer = useVirtualization({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => 64, // Estimate row height (h-16 = 64px)
    });

    const { focusedCell, handleKeyDown, setFocusedCell } = useKeyboardNavigation(data, columnOrder);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    if (!isMounted) return null;

    return (
        <div className="flex h-[calc(100vh-2rem)] w-full bg-gray-50 overflow-hidden border rounded-xl shadow-sm">
            <SideBar />

            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Scrollable Content */}
                <div
                    ref={tableContainerRef}
                    className={cn(
                        "flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6",
                        styles.tableContainer
                    )}
                >
                    <SummaryCards stats={stats} filter={summaryFilter} setFilter={setSummaryFilter} />

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <GlobalSearch
                                globalFilter={globalFilter}
                                setGlobalFilter={setGlobalFilter}
                                statusFilter={statusFilter}
                                setStatusFilter={setStatusFilter}
                                durationFilter={durationFilter}
                                setDurationFilter={setDurationFilter}
                            />
                        </div>
                        <Button
                            variant="outline"
                            className={cn("gap-2", isFilterPanelOpen && "bg-indigo-50 border-indigo-200 text-indigo-600")}
                            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                        >
                            <Filter size={16} />
                            Filters
                        </Button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        {/* Header Actions */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">Customers</h3>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 mr-4 text-sm text-gray-600">
                                    <span className="hidden sm:inline">Rows per page</span>
                                    <select
                                        value={table.getState().pagination.pageSize}
                                        onChange={e => table.setPageSize(Number(e.target.value))}
                                        className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        {TABLE_CONSTANTS.PAGE_SIZE_OPTIONS.map(pageSize => (
                                            <option key={pageSize} value={pageSize}>
                                                {pageSize}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="flex items-center border rounded-md ml-2 overflow-hidden">
                                        <button
                                            onClick={() => table.previousPage()}
                                            disabled={!table.getCanPreviousPage()}
                                            className="p-1.5 hover:bg-gray-50 disabled:opacity-50 border-r"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="px-3 py-1 bg-gray-50 text-xs font-medium border-r">
                                            {table.getState().pagination.pageIndex + 1}
                                        </span>
                                        <button
                                            onClick={() => table.nextPage()}
                                            disabled={!table.getCanNextPage()}
                                            className="p-1.5 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>

                                    <div className="ml-2">
                                        <ExportActions table={table} />
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                    onClick={() => setIsChartOpen(true)}
                                >
                                    SHOW CHARTS
                                </Button>

                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2"
                                >
                                    + CUSTOMER
                                </button>
                            </div>
                        </div>

                        <DndContext
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            sensors={sensors}
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left table-fixed">
                                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs font-semibold tracking-wider">
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            <React.Fragment key={headerGroup.id}>
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
                                                <FilterRow headerGroup={headerGroup} />
                                            </React.Fragment>
                                        ))}
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {rowVirtualizer.getVirtualItems().length > 0 && (
                                            <tr style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }}>
                                                <td colSpan={columnOrder.length} />
                                            </tr>
                                        )}
                                        <SortableContext
                                            items={data.map(d => d.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                                const row = rows[virtualRow.index];
                                                if (!row) return null;

                                                const end = row.original.endDate ? new Date(row.original.endDate) : null;
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                let isDelayed = false;
                                                if (end) {
                                                    end.setHours(0, 0, 0, 0);
                                                    isDelayed = end < today && row.original.status.state !== 'operational' && (row.original.status.state as any) !== 'closed';
                                                }

                                                return (
                                                    <DraggableRow
                                                        key={row.id}
                                                        row={row}
                                                        rowId={row.original.id}
                                                        onClick={() => {
                                                            row.toggleSelected();
                                                            setFocusedCell({ rowId: row.original.id, colId: columnOrder[0] });
                                                        }}
                                                        data-index={virtualRow.index}
                                                        ref={rowVirtualizer.measureElement}
                                                        className={cn(
                                                            "border-b border-gray-100 cursor-pointer transition-colors",
                                                            "hover:bg-gray-50/80 bg-white",
                                                            row.getIsSelected() ? "bg-indigo-50/50 ring-1 ring-inset ring-indigo-100" : "",
                                                            isDelayed ? "bg-yellow-50 hover:bg-yellow-100/80" : "",
                                                            "h-16"
                                                        )}
                                                    >
                                                        {row.getVisibleCells().map((cell) => {
                                                            const isFocused = focusedCell?.rowId === row.original.id && focusedCell?.colId === cell.column.id;
                                                            return (
                                                                <td
                                                                    key={cell.id}
                                                                    style={{ width: cell.column.getSize() }}
                                                                    className={cn(
                                                                        "text-gray-600 align-middle outline-none relative",
                                                                        cell.column.id === "id" ? "p-0" : "py-3",
                                                                        cell.column.id === "serial" && "relative",
                                                                        isFocused && "ring-2 ring-indigo-500 z-10 bg-indigo-50"
                                                                    )}
                                                                    tabIndex={0}
                                                                    onKeyDown={(e) => handleKeyDown(e, row.original.id, cell.column.id)}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFocusedCell({ rowId: row.original.id, colId: cell.column.id });
                                                                    }}
                                                                >
                                                                    {cell.column.id === "serial" && (
                                                                        <div className="absolute left-0 top-0 bottom-0 pointer-events-none">
                                                                            <TreeLines row={row} />
                                                                        </div>
                                                                    )}

                                                                    <div
                                                                        className={cn("truncate w-full", cell.column.id === "id" ? "p-0" : "px-4")}
                                                                        title={cell.getValue() as string}
                                                                        style={{ paddingLeft: cell.column.id === "serial" ? `${row.depth * 20 + 16}px` : undefined }}
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
                                        {rowVirtualizer.getVirtualItems().length > 0 && (
                                            <tr style={{ height: `${rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end}px` }}>
                                                <td colSpan={columnOrder.length} />
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {typeof window !== "undefined" && createPortal(
                                <DragOverlay adjustScale={true}>
                                    {activeId ? (
                                        <div className="opacity-90 shadow-2xl cursor-grabbing transform rotate-2 bg-white border border-blue-500 rounded-md overflow-hidden">
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
                </div>

                <StatusBar table={table} />

                {/* Filter Panel (Absolute positioned) */}
                <FilterPanel
                    isOpen={isFilterPanelOpen}
                    onClose={() => setIsFilterPanelOpen(false)}
                    currentFilters={advancedFilters}
                    onApply={setAdvancedFilters}
                    categories={uniqueCategories}
                />
            </div >

            <AddItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddItem}
            />

            <IntegratedChart
                isOpen={isChartOpen}
                onClose={() => setIsChartOpen(false)}
                data={table.getFilteredRowModel().rows.map(row => row.original)}
            />
        </div >
    );
}
