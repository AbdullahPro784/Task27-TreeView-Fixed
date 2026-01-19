
export type AggregationMethod = 'sum' | 'avg' | 'count' | 'min' | 'max';

export function calculateAggregation(data: any[], field: string, method: AggregationMethod): number {
    if (!data || data.length === 0) return 0;

    const values = data.map(item => {
        // Handle nested fields like 'status.level'
        const parts = field.split('.');
        let val = item;
        for (const part of parts) {
            val = val ? val[part] : undefined;
        }
        return Number(val) || 0;
    });

    switch (method) {
        case 'sum':
            return values.reduce((a, b) => a + b, 0);
        case 'avg':
            return values.reduce((a, b) => a + b, 0) / values.length;
        case 'count':
            return values.length;
        case 'min':
            return Math.min(...values);
        case 'max':
            return Math.max(...values);
        default:
            return 0;
    }
}

export function pivotData(data: any[], rowKey: string, colKey: string, valueKey: string, method: AggregationMethod = 'sum') {
    // Basic pivot implementation
    // Returns Map<RowValue, Map<ColValue, AggregatedValue>>
    const pivot = new Map<string, Map<string, number>>();

    data.forEach(item => {
        const rowVal = String(item[rowKey] || 'Uncategorized');
        const colVal = String(item[colKey] || 'Other');
        const val = Number(item[valueKey] || 0);

        if (!pivot.has(rowVal)) {
            pivot.set(rowVal, new Map());
        }

        const rowMap = pivot.get(rowVal)!;
        const current = rowMap.get(colVal) || 0;

        // Note: Real pivot typically accumulates first then aggregates.
        // Simplified for now: just Sum.
        rowMap.set(colVal, current + val);
    });

    return pivot;
}
