import React from "react";
import { cn } from "@/lib/utils";

interface CellSparklineProps {
    data: number[];
    width?: number;
    height?: number;
    className?: string;
    showLastValue?: boolean;
}

export const CellSparkline: React.FC<CellSparklineProps> = ({
    data,
    width = 100,
    height = 24,
    className,
    showLastValue = true
}) => {
    if (!data || data.length < 2) {
        return <div className="text-xs text-gray-400">-</div>;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1; // Avoid division by zero

    // Generate points for the polyline
    const points = data
        .map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            // Invert Y axis because SVG origin is top-left
            const normalizedY = (value - min) / range;
            const y = height - normalizedY * height;
            return `${x},${y}`;
        })
        .join(" ");

    // Determine trend color (based on start vs end)
    const isTrendingUp = data[data.length - 1] >= data[0];
    const colorClass = isTrendingUp ? "stroke-emerald-500" : "stroke-rose-500";
    const textColorClass = isTrendingUp ? "text-emerald-600" : "text-rose-600";

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <svg width={width} height={height} className="overflow-visible">
                {/* Optional: Add a subtle fill area? Keeping it simple line for now as per sparkline def */}
                <polyline
                    points={points}
                    fill="none"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={colorClass}
                />
            </svg>
            {showLastValue && (
                <span className={cn("text-xs font-medium tabular-nums", textColorClass)}>
                    {data[data.length - 1]}
                </span>
            )}
        </div>
    );
};
