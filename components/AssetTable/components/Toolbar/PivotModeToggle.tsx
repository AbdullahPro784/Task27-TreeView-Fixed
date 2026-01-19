import React from "react";
import { Label } from "../../../ui/label";
import { Switch } from "@/components/ui/switch";

interface PivotModeToggleProps {
    isPivotMode: boolean;
    setPivotMode: (val: boolean) => void;
}

export const PivotModeToggle: React.FC<PivotModeToggleProps> = ({
    isPivotMode,
    setPivotMode,
}) => {
    return (
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
            <Switch
                id="pivot-mode"
                checked={isPivotMode}
                onCheckedChange={setPivotMode}
                className="data-[state=checked]:bg-indigo-600"
            />
            <Label htmlFor="pivot-mode" className="text-sm font-medium text-gray-700 cursor-pointer">
                Pivot Mode
            </Label>
        </div>
    );
};
