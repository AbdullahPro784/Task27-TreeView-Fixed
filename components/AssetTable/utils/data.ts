import { Wrench, Settings, CheckCircle, HardHat } from "lucide-react";

export type AssetStatus = {
    state: "maintenance" | "operational" | "repair" | "inspection";
    level?: number;
};

export type Asset = {
    id: string;
    serial: string;
    category: string;
    brand: string;
    type: string;
    vehicle: string;
    status: AssetStatus;
    endDate?: string; // Format YYYY-MM-DD
    subRows?: Asset[];
};

// Helper to get date string relative to today
const getDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

export const DATA: Asset[] = [
    {
        id: "1306811",
        serial: "123456789",
        category: "Cups",
        brand: "Kärcher",
        type: "CoffeCup",
        vehicle: "-",
        status: { state: "maintenance", level: 2 },
        endDate: getDate(-5), // Passed: Black
        subRows: [
            {
                id: "1306811-A",
                serial: "SUB-001",
                category: "Saucer",
                brand: "Kärcher",
                type: "Accessory",
                vehicle: "-",
                status: { state: "operational" },
                endDate: getDate(10),
            },
            {
                id: "1306811-B",
                serial: "SUB-002",
                category: "Spoon",
                brand: "Kärcher",
                type: "Accessory",
                vehicle: "-",
                status: { state: "operational" },
                endDate: getDate(12),
            },
        ]
    },
    {
        id: "1306700",
        serial: "Meiners",
        category: "Floor Scrubber",
        brand: "Tennant",
        type: "Tennant - T7 - Floor Scrubber",
        vehicle: "-",
        status: { state: "maintenance", level: 1 },
        endDate: getDate(1), // < 2 days: Red
         subRows: [
            {
                id: "1306700-1",
                serial: "PART-X",
                category: "Brush",
                brand: "Tennant",
                type: "Spare Part",
                vehicle: "-",
                status: { state: "repair", level: 1 },
            }
        ]
    },
    {
        id: "1306666",
        serial: "Daily Check",
        category: "Staubsauger",
        brand: "AVANT",
        type: "CP030",
        vehicle: "-",
        status: { state: "operational" },
        endDate: getDate(4), // < 5 days: Orange
    },
    {
        id: "1302986",
        serial: "123123123",
        category: "Öl",
        brand: "Junkers",
        type: "Heizung",
        vehicle: "-",
        status: { state: "operational" },
        endDate: getDate(10), // Safe: White
    },
    {
        id: "1302496",
        serial: "682528",
        category: "Glassware",
        brand: "Cuppo",
        type: "Cup",
        vehicle: "-",
        status: { state: "repair", level: 1 },
        endDate: getDate(1), // Red
    },
    {
        id: "1300903",
        serial: "600009",
        category: "Welding Machines",
        brand: "Miller",
        type: "Maxstar 200",
        vehicle: "-",
        status: { state: "maintenance", level: 4 },
        endDate: getDate(-1), // Black
    },
    {
        id: "1296312",
        serial: "618162",
        category: "Paperware",
        brand: "SHERPA",
        type: "Block",
        vehicle: "-",
        status: { state: "maintenance", level: 2 },
        endDate: getDate(3), // Orange
    },
    {
        id: "1296260",
        serial: "44444444",
        category: "Walk-Behind Scrubber",
        brand: "Nilfisk",
        type: "B2037",
        vehicle: "-",
        status: { state: "inspection", level: 1 },
    },
    {
        id: "1296258",
        serial: "123321123",
        category: "Walk-Behind Scrubber",
        brand: "Nilfisk",
        type: "B2037",
        vehicle: "-",
        status: { state: "maintenance", level: 1 },
    },
    {
        id: "1296218",
        serial: "67687",
        category: "Stifte",
        brand: "Calligraph",
        type: "Stift",
        vehicle: "-",
        status: { state: "operational" },
    },
    {
        id: "1296033",
        serial: "111111111",
        category: "Computer",
        brand: "Apple",
        type: "Macbook Pro 13 Zoll",
        vehicle: "-",
        status: { state: "repair", level: 1 },
    },
    {
        id: "1295996",
        serial: "294758792hj",
        category: "Attachment",
        brand: "AVANT",
        type: "Collecting Lawn Mower 1500",
        vehicle: "-",
        status: { state: "maintenance", level: 1 },
    },
    {
        id: "1295995",
        serial: "1395839HDS",
        category: "Loader",
        brand: "AVANT",
        type: "e-series",
        vehicle: "-",
        status: { state: "maintenance", level: 1 },
    },
    {
        id: "1295994",
        serial: "1397593HGD",
        category: "Avant Hoflader",
        brand: "AVANT",
        type: "745",
        vehicle: "-",
        status: { state: "maintenance", level: 2 },
    },
];
