
import { Asset } from "./data";

export const exportToCSV = (data: any[], filename: string) => {
    if (!data || !data.length) return;

    // Flatten logic handling for complex objects/arrays if necessary
    // For now, simple stringification
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(","),
        ...data.map(row => headers.map(fieldName => {
            const val = row[fieldName];
            // Handle objects like 'status'
            if (typeof val === 'object' && val !== null) {
                return JSON.stringify(val.state || val); // specific logic for our Asset type
            }
            return JSON.stringify(val ?? "");
        }).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const exportToExcel = (data: any[], filename: string) => {
    // In a real app, use 'xlsx' library
    console.warn("Excel export requires 'xlsx' package. Fallback to CSV.");
    exportToCSV(data, filename);
};

export const exportToPDF = (data: any[], columns: string[], filename: string) => {
    // In a real app, use 'jspdf' and 'jspdf-autotable'
    console.warn("PDF export requires 'jspdf'. utilizing browser print for now.");
    window.print();
};
