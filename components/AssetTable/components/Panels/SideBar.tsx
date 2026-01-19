
import React from "react";
import { Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface SideBarProps {
    className?: string;
}

export const SideBar = ({ className }: SideBarProps) => {
    return (
        <div className={cn("w-16 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-6", className)}>
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">
                A
            </div>

            <nav className="flex flex-col gap-4 w-full px-2">
                <NavItem icon={<Home size={20} />} active />
            </nav>

            <div className="mt-auto flex flex-col gap-4 w-full px-2">
                <NavItem icon={<Settings size={20} />} />
            </div>
        </div>
    );
};

const NavItem = ({ icon, active }: { icon: React.ReactNode; active?: boolean }) => {
    return (
        <button
            className={cn(
                "w-full h-10 flex items-center justify-center rounded-lg transition-colors",
                active
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
        >
            {icon}
        </button>
    );
};
