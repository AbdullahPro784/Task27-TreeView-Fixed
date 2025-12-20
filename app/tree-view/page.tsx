import TreeTable from "@/components/TreeTable";

export default function TreeViewPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 flex flex-col items-center">
            <div className="w-full max-w-6xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Work Item Tree View</h1>
                <TreeTable />
            </div>
        </div>
    );
}
