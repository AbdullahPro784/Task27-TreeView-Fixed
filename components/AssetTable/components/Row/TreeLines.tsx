import React from "react";
import { cn } from "@/lib/utils";
import { Row } from "@tanstack/react-table";

interface TreeLinesProps<TData> {
    row: Row<TData>;
    lineColor?: string;
    indentSize?: number;
}

export const TreeLines = <TData,>({ row, lineColor = "border-gray-300", indentSize = 20 }: TreeLinesProps<TData>) => {
    if (row.depth === 0) return null;

    const depth = row.depth;

    // We need to determine for each depth level (0 to depth-1) if we should draw a line.
    // ancestors[0] is root (depth 0). ancestors[depth-1] is current row's parent.
    const ancestors: Row<TData>[] = [];
    let p = row.getParentRow();
    while (p) {
        ancestors.unshift(p);
        p = p.getParentRow(); // moving up
    }

    return (
        <div
            className="absolute left-0 top-0 bottom-0 pointer-events-none flex font-mono"
            style={{ width: `${depth * indentSize}px` }}
        >
            {Array.from({ length: depth }).map((_, i) => {
                // i is the column index (0 to depth-1).

                // Case 1: Ancestor columns (0 to depth-2)
                if (i < depth - 1) {
                    const child = ancestors[i + 1];
                    const parent = ancestors[i];
                    // parent.subRows contains the child.
                    const index = parent.subRows.indexOf(child);
                    const isLast = index === parent.subRows.length - 1;

                    return (
                        <div key={i} className="h-full relative" style={{ width: `${indentSize}px` }}>
                            {!isLast && <div className={cn("absolute left-1/2 top-0 bottom-0 border-l", lineColor)} />}
                        </div>
                    );
                }

                // Case 2: The Connector Column (i == depth - 1)
                else {
                    const parent = row.getParentRow(); // This is ancestors[depth-1]
                    const index = parent!.subRows.indexOf(row);
                    const isLast = index === parent!.subRows.length - 1;

                    return (
                        <div key={i} className="h-full relative" style={{ width: `${indentSize}px` }}>
                            {/* Vertical Line: Top to Bottom if not last. Top to Half if last. */}
                            <div className={cn(
                                "absolute left-1/2 top-0 border-l",
                                lineColor,
                                isLast ? "h-1/2" : "h-full"
                            )} />
                            {/* Horizontal Line: Middle to Right */}
                            <div className={cn("absolute top-1/2 left-1/2 w-3 border-t", lineColor)} />
                        </div>
                    );
                }
            })}
        </div>
    );
};
