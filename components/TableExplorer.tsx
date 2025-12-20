"use client";

import React, { useState } from "react";
import { ArrowLeft, LayoutList, ListTree, TableProperties, FileText, GitGraph } from "lucide-react";
import AssetTable from "./AssetTable";
import TableVariant1 from "./variations/TableVariant1";
import TableVariant2 from "./variations/TableVariant2";
import TableVariant3 from "./variations/TableVariant3";
import TreeTable from "./TreeTable";
import { Asset } from "./data";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Variant = "original" | "v1" | "v2" | "v3" | "tree";

interface TableExplorerProps {
    data: Asset[];
    initialVariant: Variant;
}

export default function TableExplorer({ data, initialVariant }: TableExplorerProps) {
    const [currentVariant, setCurrentVariant] = useState<Variant>(initialVariant);
    const router = useRouter();

    const handleVariantChange = (variant: Variant) => {
        setCurrentVariant(variant);
        // Update URL without full reload to keep state if desired, or just internal state?
        // User asked for "buttons on that page... showing table accordingly staying on same page".
        // Updating URL is good practice for shareability.
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("v", variant);
        window.history.pushState({}, "", newUrl.toString());
    };

    const renderTable = () => {
        switch (currentVariant) {
            case "original":
                return <AssetTable data={data} />;
            case "v1":
                return <TableVariant1 data={data} />;
            case "v2":
                return <TableVariant2 data={data} />;
            case "v3":
                return <TableVariant3 data={data} />;
            case "tree":
                return <TreeTable />;
            default:
                return <AssetTable data={data} />;
        }
    };

    const tabs = [
        { id: "original", label: "Original", icon: FileText },
        { id: "v1", label: "Variation 1 (Indented)", icon: ListTree },
        { id: "v2", label: "Variation 2 (Nested)", icon: LayoutList },
        { id: "v3", label: "Variation 3 (Panel)", icon: TableProperties },
        { id: "tree", label: "Tree View", icon: GitGraph },
    ] as const;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Home
                </Link>
                <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleVariantChange(tab.id as Variant)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap",
                                currentVariant === tab.id
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                            )}
                        >
                            <tab.icon size={14} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
                {renderTable()}
            </div>
        </div>
    );
}
