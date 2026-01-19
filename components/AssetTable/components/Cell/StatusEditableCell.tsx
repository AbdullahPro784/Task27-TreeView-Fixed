import React, { useState, useEffect } from "react";
import { Wrench, HardHat, Settings, CheckCircle } from "lucide-react";
import { AssetStatus } from "../../utils/data";

export const StatusEditableCell = ({
    getValue,
    row,
    column,
    table,
}: {
    getValue: () => any;
    row: any;
    column: any;
    table: any;
}) => {
    const initialValue = getValue() as AssetStatus;
    const [value, setValue] = useState(initialValue);
    const [isEditing, setIsEditing] = useState(false);
    const saveInitiated = React.useRef(false);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const handleSave = (selectedValue: string) => {
        if (saveInitiated.current) return;
        saveInitiated.current = true;

        const [stateStr, levelStr] = selectedValue.split(":");
        const newState = stateStr;
        const newLevel = parseInt(levelStr, 10);

        const newStatus: AssetStatus = {
            state: newState as any,
            level: newLevel > 0 ? newLevel : undefined,
        };

        // Check if actually changed (deep comparison or simplistic)
        const hasChanged = newStatus.state !== initialValue.state || newStatus.level !== initialValue.level;

        if (hasChanged) {
            const confirmSave = window.confirm("Update status?");
            if (confirmSave) {
                table.options.meta?.updateData(row.original.id, column.id, newStatus);
            } else {
                setValue(initialValue);
            }
        }

        setIsEditing(false);
        setTimeout(() => { saveInitiated.current = false; }, 100);
    };

    const options = [
        { label: "Operational (Default)", value: "operational:0" },
        { label: "Level 1 (Spanner)", value: "maintenance:1" },
        { label: "Level 2 (Hat)", value: "maintenance:2" },
        { label: "Level 3 (Settings)", value: "repair:3" },
        { label: "Level 4 (Check)", value: "operational:4" },
    ];

    const currentOptionValue = `${value.state}:${value.level || 0}`;

    if (isEditing) {
        return (
            <select
                value={currentOptionValue}
                onChange={(e) => handleSave(e.target.value)}
                onBlur={() => setIsEditing(false)}
                autoFocus
                className="w-full h-full px-2 py-1 bg-white text-gray-900 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        );
    }

    const { level, state } = value;

    return (
        <div
            onDoubleClick={() => setIsEditing(true)}
            className="flex items-center justify-end gap-2 px-4 py-3 h-full cursor-pointer hover:bg-gray-50"
        >
            {/* Level-based Icons */}
            {level === 1 && <Wrench className="text-orange-500" size={20} fill="currentColor" fillOpacity={0.2} />}
            {level === 2 && <HardHat className="text-orange-500" size={20} />}
            {level === 3 && <Settings className="text-orange-500" size={20} />}
            {level === 4 && <CheckCircle className="text-orange-500" size={20} />}

            {/* Fallback for invalid/missing levels based on semantic state */}
            {!level && state === "operational" && <CheckCircle className="text-orange-500" size={20} />}
            {!level && state === "maintenance" && <Wrench className="text-orange-500" size={20} fill="currentColor" fillOpacity={0.2} />}
            {!level && state === "repair" && <Settings className="text-orange-500" size={20} />}
            {!level && state === "inspection" && <HardHat className="text-orange-500" size={20} />}

            {level && (
                <span className="font-bold text-gray-700">{level}</span>
            )}
        </div>
    );
};
