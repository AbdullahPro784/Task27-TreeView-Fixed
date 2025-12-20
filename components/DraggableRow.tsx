import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface DraggableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    rowId: string;
}

export const DraggableRow = ({ rowId, children, className, style: propStyle, ...props }: DraggableRowProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: rowId,
        data: {
            type: "row",
        },
    });

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        ...propStyle,
        position: "relative",
        zIndex: isDragging ? 1 : 0,
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                className,
                className,
                isDragging && "opacity-30" // Dim the original row while dragging
            )}
            {...props}
        >
            {children}
        </tr>
    );
};
