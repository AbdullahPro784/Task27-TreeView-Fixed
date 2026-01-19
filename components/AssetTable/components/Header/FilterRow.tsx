
import React from "react";
import { HeaderGroup, flexRender } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface FilterRowProps<TData> {
    headerGroup: HeaderGroup<TData>;
}

export const FilterRow = <TData,>({ headerGroup }: FilterRowProps<TData>) => {
    return (
        <tr className="bg-gray-50/50 border-b border-gray-200">
            {headerGroup.headers.map((header) => {
                return (
                    <th key={header.id} className="p-2 text-left align-top bg-gray-50">
                        {header.column.getCanFilter() ? (
                            <div className="relative">
                                <input
                                    type="text"
                                    value={(header.column.getFilterValue() ?? "") as string}
                                    onChange={(e) => header.column.setFilterValue(e.target.value)}
                                    placeholder={`Filter...`}
                                    className="w-full px-2 py-1.5 text-xs text-gray-700 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-normal placeholder:text-gray-400"
                                />
                            </div>
                        ) : null}
                    </th>
                );
            })}
        </tr>
    );
};
