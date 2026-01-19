
import React from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GlobalSearchProps {
    globalFilter: string;
    setGlobalFilter: (val: string) => void;
    statusFilter: string;
    setStatusFilter: (val: string) => void;
    durationFilter: string;
    setDurationFilter: (val: string) => void;
}

export const GlobalSearch = ({
    globalFilter,
    setGlobalFilter,
    statusFilter,
    setStatusFilter,
    durationFilter,
    setDurationFilter,
}: GlobalSearchProps) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Search Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                {/* Duration Select */}
                <div className="md:col-span-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
                                <span>{durationFilter === "All" ? "Select Duration" : durationFilter}</span>
                                <ChevronDown size={16} className="text-gray-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuItem onClick={() => setDurationFilter("All")}>All Time</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDurationFilter("Last 30 Days")}>Last 30 Days</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDurationFilter("This Year")}>This Year</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Status Select */}
                <div className="md:col-span-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
                                <span>{statusFilter === "All" ? "Select Status" : statusFilter}</span>
                                <ChevronDown size={16} className="text-gray-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuItem onClick={() => setStatusFilter("All")}>All Statuses</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter("Operational")}>Operational/Closed</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter("Maintenance")}>Maintenance</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter("Repair")}>Repair</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter("Inspection")}>Inspection</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Search Input */}
                <div className="md:col-span-4 relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    {globalFilter && (
                        <button onClick={() => setGlobalFilter("")} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Search Button */}
                <div className="md:col-span-2">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Search size={18} />
                        SEARCH
                    </Button>
                </div>

            </div>
        </div>
    );
};
