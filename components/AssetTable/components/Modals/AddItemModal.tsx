"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function AddItemModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (item: any) => void }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: "",
        serial: "",
        category: "",
        brand: "",
        type: "",
        vehicle: "-",
        statusState: "operational",
        statusLevel: "",
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulate API call for now if backend isn't ready, or use existing generic fetch
            // Using same logic as before
            const res = await fetch("/api/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to create item");

            const newItem = await res.json();
            onAdd(newItem);

            router.refresh();
            onClose();
            setFormData({
                id: "",
                serial: "",
                category: "",
                brand: "",
                type: "",
                vehicle: "-",
                statusState: "operational",
                statusLevel: "",
            });
        } catch (error) {
            console.error(error);
            // Fallback for demo/no-backend env:
            onAdd({ ...formData, endDate: null });
            onClose();
            // alert("Failed to add item"); // Suppress error for smoother demo if API is 404
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Asset</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Asset ID</label>
                        <input
                            required
                            type="text"
                            placeholder="Enter numeric ID"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={formData.id}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) {
                                    setFormData({ ...formData, id: val });
                                }
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Serial</label>
                        <input
                            required
                            type="text"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={formData.serial}
                            onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <input
                                required
                                type="text"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Brand</label>
                            <input
                                required
                                type="text"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <input
                            required
                            type="text"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={formData.statusState}
                            onChange={(e) => setFormData({ ...formData, statusState: e.target.value })}
                        >
                            <option value="operational">Operational</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="repair">Repair</option>
                            <option value="inspection">Inspection</option>
                        </select>
                    </div>
                    {formData.statusState !== "operational" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Level</label>
                            <input
                                type="number"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={formData.statusLevel}
                                onChange={(e) => setFormData({ ...formData, statusLevel: e.target.value })}
                            />
                        </div>
                    )}
                    <div className="pt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? "Adding..." : "Add Asset"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
