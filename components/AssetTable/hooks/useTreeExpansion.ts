import { Row } from "@tanstack/react-table";

export function useTreeExpansion<TData>(row: Row<TData>) {
    return {
        isExpanded: row.getIsExpanded(),
        canExpand: row.getCanExpand(),
        toggleExpanded: row.getToggleExpandedHandler(),
        depth: row.depth,
    };
}
