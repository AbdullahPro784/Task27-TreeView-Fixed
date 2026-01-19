
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdvancedFilters } from "@/components/AssetTable/hooks/useTableEngine";

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    currentFilters: AdvancedFilters;
    onApply: (filters: AdvancedFilters) => void;
    categories: string[];
}

export const FilterPanel = ({ isOpen, onClose, currentFilters, onApply, categories }: FilterPanelProps) => {
    const [filters, setFilters] = useState<AdvancedFilters>(currentFilters);

    // Reset local state when panel opens/currentFilters change
    useEffect(() => {
        if (isOpen) {
            setFilters(currentFilters);
        }
    }, [isOpen, currentFilters]);

    const toggleCategory = (cat: string) => {
        setFilters(prev => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter(c => c !== cat)
                : [...prev.categories, cat]
        }));
    };

    const toggleStatus = (status: string) => {
        setFilters(prev => ({
            ...prev,
            statuses: prev.statuses.includes(status)
                ? prev.statuses.filter(s => s !== status)
                : [...prev.statuses, status]
        }));
    };

    const handleApply = () => {
        console.log("FilterPanel Apply Clicked. State:", filters);
        onApply(filters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters = { categories: [], statuses: [], valueRange: { min: null, max: null } };
        setFilters(resetFilters);
        onApply(resetFilters);
    };

    return (
        <div className={`w-80 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col h-full absolute right-0 top-0 bottom-0 z-20 shadow-xl transition-transform duration-300 ${!isOpen ? 'translate-x-full hidden' : 'translate-x-0'}`}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Filters</h3>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-50 rounded-md text-gray-500"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="p-4 space-y-6 flex-1 overflow-y-auto">
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <div className="space-y-2">
                        {categories.map((cat) => (
                            <label key={cat} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.categories.includes(cat)}
                                    onChange={() => toggleCategory(cat)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                {cat}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="space-y-2">
                        {['Operational', 'Maintenance', 'Repair', 'Closed'].map((status) => (
                            <label key={status} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.statuses.includes(status)}
                                    onChange={() => toggleStatus(status)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                {status}
                            </label>
                        ))}
                    </div>
                </div>


            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleReset}>Reset</Button>
                <Button className="flex-1 bg-indigo-600" onClick={handleApply}>Apply Filters</Button>
            </div>
        </div>
    );
};
