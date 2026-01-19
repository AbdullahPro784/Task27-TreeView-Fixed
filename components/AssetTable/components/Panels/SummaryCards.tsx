
import React from "react";
import { User, Clock, AlertCircle, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
    stats: {
        total: number;
        delayed: number;
        inProcess: number;
        closed: number;
    };
    filter: string | null;
    setFilter: (filter: string | null) => void;
}

export const SummaryCards = ({ stats, filter, setFilter }: SummaryCardsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div
                onClick={() => setFilter(null)}
                className={cn(
                    "bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer transition-all hover:shadow-md",
                    filter === null && "ring-2 ring-indigo-500 bg-indigo-50"
                )}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        <User size={20} />
                    </div>
                    <span className="text-gray-600 font-medium">Total Applications</span>
                </div>
                <span className="text-xl font-bold text-gray-900">{stats.total}</span>
            </div>

            <div
                onClick={() => setFilter('in-process')}
                className={cn(
                    "bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer transition-all hover:shadow-md",
                    filter === 'in-process' && "ring-2 ring-orange-500 bg-orange-50"
                )}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <Clock size={20} />
                    </div>
                    <span className="text-gray-600 font-medium">In Process</span>
                </div>
                <span className="text-xl font-bold text-gray-900">{stats.inProcess}</span>
            </div>

            <div
                onClick={() => setFilter('delayed')}
                className={cn(
                    "bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer transition-all hover:shadow-md",
                    filter === 'delayed' && "ring-2 ring-red-500 bg-red-50"
                )}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        <AlertCircle size={20} />
                    </div>
                    <span className="text-gray-600 font-medium">Delayed</span>
                </div>
                <span className="text-xl font-bold text-gray-900">{stats.delayed}</span>
            </div>

            <div
                onClick={() => setFilter('closed')}
                className={cn(
                    "bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer transition-all hover:shadow-md",
                    filter === 'closed' && "ring-2 ring-green-500 bg-green-50"
                )}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <CheckSquare size={20} />
                    </div>
                    <span className="text-gray-600 font-medium">Closed</span>
                </div>
                <span className="text-xl font-bold text-gray-900">{stats.closed}</span>
            </div>
        </div>
    );
};
