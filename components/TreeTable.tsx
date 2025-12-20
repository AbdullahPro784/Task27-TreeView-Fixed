"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
    ExpandedState,
    Row,
} from "@tanstack/react-table";
import {
    ChevronRight,
    ChevronDown,
    Crown,
    Trophy,
    FileText,
    CheckSquare,
    ClipboardList,
    FolderOpen,
    GripVertical
} from "lucide-react";
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
    MeasuringStrategy,
    DropAnimation,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createPortal } from "react-dom";

import { TREE_DATA, WorkItem } from "./treeData";
import { cn } from "@/lib/utils";

// --- Types ---
type DropType = "reorder-above" | "reorder-below" | "group" | null;

// --- Icons ---
const TypeIcon = ({ type }: { type: string }) => {
    switch (type) {
        case "Epic": return <Crown className="text-orange-500 fill-orange-100" size={16} />;
        case "Feature": return <Trophy className="text-purple-600 fill-purple-100" size={16} />;
        case "Product Backlog Item": return <ClipboardList className="text-blue-500 fill-blue-100" size={16} />;
        case "Task": return <CheckSquare className="text-yellow-600 fill-yellow-100" size={16} />;
        case "Group": return <FolderOpen className="text-gray-500 fill-gray-100" size={16} />;
        default: return <FileText size={16} />;
    }
};

// --- Helper Functions ---

// Recursively find an item and its parent
const findItemPath = (items: WorkItem[], id: string): { parent: WorkItem | null, index: number, array: WorkItem[] } | null => {
    for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
            return { parent: null, index: i, array: items };
        }
        if (items[i].children) {
            const result = findItemPath(items[i].children!, id);
            if (result) {
                if (result.parent === null) {
                    return { parent: items[i], index: result.index, array: items[i].children! };
                }
                return result;
            }
        }
    }
    return null;
};

// Recursively remove item
const removeItem = (items: WorkItem[], id: string): WorkItem[] => {
    return items.filter(item => {
        if (item.id === id) return false;
        if (item.children) {
            item.children = removeItem(item.children, id);
        }
        return true;
    });
};

// Recalculate orders recursively
const recalculateOrders = (items: WorkItem[], parentOrder: string = "") => {
    items.forEach((item, index) => {
        const currentOrder = parentOrder ? `${parentOrder}.${index + 1}` : `${index + 1}`;
        item.order = currentOrder;
        if (item.children && item.children.length > 0) {
            recalculateOrders(item.children, currentOrder);
        }
    });
    return items;
};

// --- Components ---

const DraggableRow = ({
    row,
    dropType,
    isOver,
}: {
    row: Row<WorkItem>;
    dropType: DropType;
    isOver: boolean;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: row.original.id,
        data: {
            type: "row",
            item: row.original,
        }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 999 : 'auto',
    };

    // Visual feedback for drop targets
    let borderStyles = "";
    if (isOver && !isDragging) {
        if (dropType === "reorder-above") borderStyles = "border-t-2 border-t-blue-500";
        else if (dropType === "reorder-below") borderStyles = "border-b-2 border-b-blue-500";
        else if (dropType === "group") borderStyles = "ring-2 ring-inset ring-green-500 bg-green-50";
    }

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={cn(
                "hover:bg-slate-50 border-b border-gray-100 last:border-0 transition-colors bg-white group",
                borderStyles
            )}
            {...attributes}
        >
            {row.getVisibleCells().map(cell => (
                <td
                    key={cell.id}
                    className={cn(
                        "align-middle text-gray-800 text-sm",
                        cell.column.id === "title" ? "p-0" : "py-2 pr-4"
                    )}
                >
                    {/* Attach listeners only to the first cell or a drag handle if we wanted strictly handle-only drag */}
                    {/* For now, let's make the whole row draggable but maybe prioritize a handle if strict text selection is needed.
                         We will put listeners on the whole row for easy DND as per request "drag and drop any node" */}
                    <div {...listeners} className="h-full w-full flex items-center">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                </td>
            ))}
        </tr>
    );
};

export default function TreeTable() {
    const [data, setData] = useState<WorkItem[]>(TREE_DATA);
    const [expanded, setExpanded] = useState<ExpandedState>(true);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<WorkItem | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);



    // Track drop state
    const [overId, setOverId] = useState<string | null>(null);
    const [dropType, setDropType] = useState<DropType>(null);


    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor)
    );

    const columns = useMemo<ColumnDef<WorkItem>[]>(() => [
        {
            id: "drag",
            size: 40,
            header: "",
            cell: () => <GripVertical className="text-gray-300 cursor-grab active:cursor-grabbing" size={16} />
        },
        {
            accessorKey: "order",
            header: "Order",
            cell: ({ getValue }) => <div className="text-gray-500 font-mono text-xs">{getValue() as string}</div>,
            size: 80,
        },
        {
            accessorKey: "type",
            header: "Work Item Type",
            cell: ({ getValue }) => <div className="font-medium text-gray-600">{getValue() as string}</div>,
            size: 150,
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row, getValue, table }) => {
                // Calculate ancestors to determine guides
                const guides = [];
                let current = row.getParentRow();
                while (current) {
                    const parent = current.getParentRow();
                    // Identify if 'current' is the last child of 'parent'
                    // If root:
                    const siblings = parent ? parent.original.children : table.options.data;
                    const index = siblings?.findIndex(s => s.id === current?.original.id) ?? 0;
                    const isLast = index === (siblings?.length ?? 0) - 1;

                    guides.unshift(isLast ? "space" : "line");
                    current = parent;
                }

                // Determine current row connector type
                const parent = row.getParentRow();
                const siblings = parent ? parent.original.children : table.options.data;
                const index = siblings?.findIndex(s => s.id === row.original.id) ?? 0;
                const isLast = index === (siblings?.length ?? 0) - 1;
                const connector = isLast ? "last" : "entry";

                return (
                    <div className="flex items-stretch h-full">
                        {/* Guides - Full Height, No Padding */}
                        <div className="flex items-stretch shrink-0 font-mono">
                            {/* Ancestor Guides */}
                            {guides.map((type, i) => (
                                <div key={i} className="w-6 flex justify-center relative" style={{ minWidth: '24px' }}>
                                    {type === "line" && (
                                        <div className="absolute top-0 bottom-0 w-px bg-blue-300 left-1/2"></div>
                                    )}
                                </div>
                            ))}

                            {/* Current Connection */}
                            {row.depth > 0 && (
                                <div className="w-6 flex justify-center relative" style={{ minWidth: '24px' }}>
                                    <div className="absolute top-0 bottom-1/2 left-1/2 w-px bg-blue-300"></div>
                                    {connector === "last" ? (
                                        <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 border-l border-b border-blue-300 rounded-bl-lg -translate-x-px"></div>
                                    ) : (
                                        <>
                                            <div className="absolute top-1/2 bottom-0 left-1/2 w-px bg-blue-300"></div>
                                            <div className="absolute top-1/2 left-1/2 w-1/2 h-px bg-blue-300"></div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Content - With Padding */}
                        <div className="flex items-center gap-2 pl-1 py-2 w-full min-w-0">
                            {row.getCanExpand() ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent drag start when clicking expand
                                        row.toggleExpanded();
                                    }}
                                    onPointerDown={(e) => e.stopPropagation()} // Stop propagation to draggable
                                    className="p-0.5 hover:bg-blue-50 rounded text-blue-500 transition-colors z-10 relative"
                                >
                                    {row.getIsExpanded() ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                            ) : (
                                <span className="w-4" />
                            )}
                            <TypeIcon type={row.original.type} />
                            <span className="truncate font-medium" title={getValue() as string}>
                                {getValue() as string}
                            </span>
                        </div>
                    </div>
                );
            },
        },
    ], []);

    const table = useReactTable({
        data,
        columns,
        state: {
            expanded,
        },
        onExpandedChange: setExpanded,
        getSubRows: (row) => row.children,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    });

    // Helper to calculate drop type based on pointer position relative to target rect
    const calculateDropType = (event: DragOverEvent): DropType => {
        const { active, over } = event;
        if (!over || !active || active.id === over.id) return null;

        // Note: dnd-kit doesn't give precise relative coordinates in DragOverEvent easily without using measuring.
        // But we can assume standard height rows or use therect data if available.
        // Simpler approach: 
        // We will store the rect in state or just use the simplified behavior?
        // Actually, without complex setup, distinguishing "top/bottom/middle" in dnd-kit defaults requires custom collision.

        // HOWEVER, we can just hack it for this demo:
        // Use the `over.rect` (which is available in newer versions or via `useDroppable` hook but not directly in event usually).
        // Wait, `event.over.rect` is available!

        const overRect = over.rect;
        // In @dnd-kit/core, rect is not directly on `over` object in the event handler in older versions, 
        // but let's check current docs or assume functionality. 
        // Actually checking bounding box overlap is standard.
        // Let's assume we can get it or if not, default to "Group" if hovering long enough? No.

        // Let's try to access the element reference if possible.
        // A common trick is to divide the row height into zones.
        // Since we don't have the pointer Y easily here w/o custom sensor hacks, 
        // we will implement a custom collision strategy? 
        // OR we can just use `active.rect.current.translated` vs `over.rect`.

        // Let's assume simply:
        // If the ACTIVE item's center is vertically aligned with OVER item structure.

        if (!active.rect.current.translated || !over.rect) return null;

        const activeRect = active.rect.current.translated;
        const overRectBounds = over.rect; // This might be `over.data.current.sortable.rect` or similar? No.
        // `over.rect` in DragOverEvent is usually not exposed directly in type definitions sometimes, but let's check.
        // The safest way is using `active.rect.current.translated.top` vs `over.rect.top`.

        // Let's approximate using sorting strategy.
        // If the mouse is in the sortable list, `sortable` handles reordering.
        // I want to hijack that.

        // Let's rely on simple pixel math if we can.
        // `active.rect.current.translated.top` is the top of the dragging item.
        // `over.rect.top`

        // Let's try to access `activatorEvent` from sensors if possible? No.

        // Plan B: Custom logic inside the component using `onDragOver` isn't enough for precise pixel-in-row logic without the pointer coordinates.
        // BUT, `DragOverlay` tracks it.

        // Let's just implement a simplified heuristic:
        // If we are dragging, we defaulted to "grouping" if we hover for > 500ms? No.

        // Let's use `onDragOver` to update generic state, but for "Reorder vs Group",
        // maybe we leverage the fact that "Reorder" is the default behavior of Sortable.
        // We only want "Group" if we hold "Shift" or if we hover specifically in the center?

        // The user requirement: "when you drag and drop a node to a node it ask if you like to make it a group"
        // This implies dropping ON the node directly.
        // In Sortable, usually items move out of the way.
        // If items move out of the way, you CAN'T drop ON them easily.

        // SOLUTION:
        // We will stick to Sortable behaviors for Reordering.
        // But if I drop and the items "overlapped" significantly without swapping?
        // Actually, dnd-kit `Sortable` swaps items as you drag.
        // To support "Group", we might need to DISABLE swapping if we are "on top" of an item.

        // This sounds complicated.
        // ALTERNATIVE:
        // Use `DndContext` without `SortableContext` for the main list?
        // No, we want sorting.

        // Let's try this:
        // Just use standard Sortable.
        // Differentiate by:
        // If I drop it, and the `over` index is X.
        // If I dropped it "roughly" on top?

        // Let's simplify:
        // Just ask every time? No, annoying.

        // Best approach for "File System" like trees:
        // 1. Dragging over the `text/title` area = Group.
        // 2. Dragging over the `edges/handles` = Reorder.

        // I'll make the Row have a "DropZone" in the middle.
        // But `dnd-kit` is global.

        // Let's just use a simpler fallback:
        // We will default to REORDER.
        // But if the user holds a modifier key (like Alt)? No.

        // Let's try to use the `active` vs `over` positions.
        // If `Math.abs(active.rect.current.translated.top - over.rect.top) < 10` (very close alignment) -> Group?
        // Sortable usually shifts the `over` item away.

        // Let's abandon strict pixel logic and use a simplified heuristic that works with standard Sortable:
        // When `onDragEnd` happens:
        // If `active.id !== over.id`:
        // We check if we want to Sort or Group.
        // Since I cannot easily implementing a "hover zone" logic inside `SortableContext` without preventing the sort-move animation...
        // I will implement "Reorder" as default.
        // I will add a special boolean "isGrouping" if the user pauses? No.

        // Valid Strategy:
        // Use `collisionDetection={pointerWithin}` or custom.
        // If `pointerWithin` returns a collision that is "deep" inside the rect -> Group.
        // If it's near the edges -> Reorder.
        // But `Sortable` will already have moved the items.

        // Let's accept that for this task, I might not get the PERFECT "moving aside" animation for sorting if I also want grouping on the same target.
        // So I'll just rely on `onDragEnd` asking the user if they want to group, IF the drop was arguably "on" the item.
        // But how do we define "on"?

        // Let's make "Reordering" happen if you drop IN BETWEEN.
        // Let's make "Grouping" happen if you drop ON.

        return null;
    }

    // Using a simpler "Drop" handling logic for now since pixel-perfect sortable+groupable is complex.
    // I will prompt the user if they drop one node onto another "adjacent" one? 
    // No, that's confusing.

    // Let's try to implement a custom collision algorithm.
    // Basic idea:
    // If pointer is in top 25% of target -> Sort Before
    // If pointer is in bottom 25% of target -> Sort After
    // If pointer is in middle 50% -> Group

    // I will mock this behavior in `onDragOver` IF I can access the pointer coordinates.
    // `DragOverEvent` doesn't have pointer coords.
    // But `DndContext` sensors do.

    // Nevermind, `closestCenter` is the default.

    // Let's go with this:
    // I represents the tree as a Sortable List.
    // Reordering is intuitive.
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        const path = findItemPath(data, event.active.id as string);
        if (path) setActiveItem(path.array[path.index]);
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        setOverId(over?.id as string || null);

        if (!over) {
            setDropType(null);
            return;
        }

        // Hacky collision detection using the rects which ARE available in the context if we use `MeasuringStrategy`.
        // But simpler: let's toggle based on time or assume everything is "Sort" for now
        // And if the user drops it specifically... 

        // Let's actually implement the custom collision logic in the `onDragEnd` for the Prompt.
        // But for visual feedback we need it in DragOver.
        // Let's assume Middle 50% is Group.
        if (active.rect.current.translated && over.rect) {
            const activeTop = active.rect.current.translated.top;
            const activeHeight = active.rect.current.translated.height;
            const activeCenter = activeTop + activeHeight / 2;

            const overTop = over.rect.top;
            const overHeight = over.rect.height;

            const relY = activeCenter - overTop;
            const percentage = relY / overHeight;

            if (percentage < 0.25) setDropType("reorder-above");
            else if (percentage > 0.75) setDropType("reorder-below");
            else setDropType("group");
        } else {
            setDropType("reorder-below");
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveItem(null);
        setOverId(null);
        setDropType(null);

        if (!over) return;
        if (active.id === over.id) return;

        // Re-calculate the final decided action based on the last known state or recalc
        let action = "reorder-below";
        if (active.rect.current.translated && over.rect) {
            const activeTop = active.rect.current.translated.top;
            const activeHeight = active.rect.current.translated.height;
            const activeCenter = activeTop + activeHeight / 2;
            const overTop = over.rect.top;
            const overHeight = over.rect.height;
            const relY = activeCenter - overTop;
            const percentage = relY / overHeight;

            if (percentage < 0.25) action = "reorder-above";
            else if (percentage > 0.75) action = "reorder-below";
            else action = "group";
        }

        if (action === "group") {
            const shouldGroup = window.confirm(`Do you like to make it a group?`);
            if (shouldGroup) {
                const newName = window.prompt("Enter name for the new group node:", "New Group");
                if (newName) {
                    // Perform grouping logic
                    setData(prev => {
                        const newData = JSON.parse(JSON.stringify(prev)); // Deep clone to avoid mutation
                        const activePath = findItemPath(newData, active.id as string);
                        if (!activePath) return prev;
                        const activeNode = activePath.array[activePath.index];

                        // Remove active node first
                        // Note: removeItem mutates the cloned structure in-place by assigning children, which is fine now.
                        const rootAfterRemove = removeItem(newData, active.id as string);

                        // BUT: removeItem returns the ARRAY. We need to respect the result for the root.
                        // However, removeItem implementation specifically mutates children properties recursively?
                        // Let's re-read removeItem from the file context if accessible or just rely on findItemPath for removal?
                        // Actually, my removeItem helper above returns a new array.
                        // And it mutates children of items.
                        // So for the root array, we must capture it.
                        // `newData` is the root array.
                        const newDataWithRemoved = removeItem(newData, active.id as string);

                        // Find over node in the NEW data (since we removed active)
                        const overPath = findItemPath(newDataWithRemoved, over.id as string);
                        if (!overPath) return prev;

                        const overNode = overPath.array[overPath.index];

                        // Create new Group Node
                        const newGroup: WorkItem = {
                            id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            order: overNode.order,
                            type: "Group",
                            title: newName,
                            children: [
                                overNode,
                                activeNode
                            ]
                        };

                        // Replace overNode with newGroup
                        overPath.array[overPath.index] = newGroup;

                        // Recalculate orders
                        recalculateOrders(newDataWithRemoved);

                        return newDataWithRemoved;
                    });
                }
            }
            return;
        }

        // Reordering Logic
        setData(prev => {
            const newData = JSON.parse(JSON.stringify(prev)); // Deep clone
            const activePath = findItemPath(newData, active.id as string);
            const overPath = findItemPath(newData, over.id as string);

            if (!activePath || !overPath) return prev;

            const activeItem = activePath.array[activePath.index];

            // Remove
            activePath.array.splice(activePath.index, 1);

            // Refind over path because indices might have shifted if they were in same array
            // Optimization: if we are in the same array, we can just adjust index. 
            // But finding path is safer.
            const newOverPath = findItemPath(newData, over.id as string);
            if (!newOverPath) return newData;

            let insertIndex = newOverPath.index;
            if (action === "reorder-below") insertIndex += 1;

            newOverPath.array.splice(insertIndex, 0, activeItem);

            // Recalculate orders
            recalculateOrders(newData);

            return newData;
        });
    }

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.4',
                },
            },
        }),
    };



    if (!isMounted) {
        return <div className="p-4 text-gray-500">Loading tree view...</div>;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            measuring={{
                droppable: {
                    strategy: MeasuringStrategy.Always,
                }
            }}
        >
            <div className="w-full p-4 font-sans">
                <div className="rounded-md border border-gray-200 overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-4 py-3 font-medium text-xs uppercase tracking-wider">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <SortableContext
                                items={table.getRowModel().rows.map(r => r.original.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {table.getRowModel().rows.map(row => (
                                    <DraggableRow
                                        key={row.original.id}
                                        row={row}
                                        isOver={row.original.id === overId}
                                        dropType={row.original.id === overId ? dropType : null}
                                    />
                                ))}
                            </SortableContext>
                        </tbody>
                    </table>
                </div>

                {/* Drag Overlay */}
                {typeof window !== "undefined" && createPortal(
                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeId && activeItem ? (
                            <div className="opacity-90 shadow-xl bg-white border border-blue-500 rounded p-3 flex items-center gap-2 w-96">
                                <GripVertical className="text-gray-400" size={16} />
                                <TypeIcon type={activeItem.type} />
                                <span className="font-semibold">{activeItem.title}</span>
                            </div>
                        ) : null}
                    </DragOverlay>,
                    document.body
                )}
            </div>
        </DndContext>
    );
}
