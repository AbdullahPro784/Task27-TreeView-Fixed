
export interface TreeNode<T> {
    data: T;
    children?: TreeNode<T>[];
}

/**
 * Flattens a tree structure into a single array.
 * @param tree The tree processing logic often happens in TanStack Table,
 * but this helper is useful for searching or raw export.
 */
export function flattenTree<T extends { subRows?: T[] }>(tree: T[]): T[] {
    let result: T[] = [];
    tree.forEach(node => {
        result.push(node);
        if (node.subRows && node.subRows.length > 0) {
            result = result.concat(flattenTree(node.subRows));
        }
    });
    return result;
}

/**
 * Builds a tree from a flat list based on an ID and ParentID.
 * Useful if data comes flat from DB.
 */
export function buildTree<T extends { id: string | number; parentId?: string | number | null }>(
    data: T[],
    idField: keyof T = 'id',
    parentIdField: keyof T = 'parentId'
): T[] & { subRows?: T[] } {
    const map = new Map<string | number, T & { subRows: T[] }>();
    const roots: (T & { subRows: T[] })[] = [];

    // Initialize map
    data.forEach(item => {
        map.set(item[idField] as unknown as string | number, { ...item, subRows: [] });
    });

    // Connect nodes
    data.forEach(item => {
        const id = item[idField] as unknown as string | number;
        const node = map.get(id)!;
        const parentId = item[parentIdField] as unknown as string | number | null;

        if (parentId && map.has(parentId)) {
            map.get(parentId)!.subRows.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
}
