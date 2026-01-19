import React from "react";
import { cn } from "@/lib/utils";
import { CellComments } from "@/components/AssetTable/components/Cell/CellComments";

interface TableCellProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hasComments?: boolean;
    comments?: string[];
}

export const TableCell: React.FC<TableCellProps> = ({
    children,
    className,
    hasComments,
    comments,
    ...props
}) => {
    return (
        <div
            className={cn(
                "w-full h-full px-4 py-3 flex items-center relative group",
                className
            )}
            {...props}
        >
            <div className="w-full truncate">
                {children}
            </div>

            {/* Comment Indicator */}
            {(hasComments || (comments && comments.length > 0)) && (
                <CellComments comments={comments} />
            )}
        </div>
    );
};
