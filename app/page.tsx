import Link from "next/link";
import { ArrowRight, LayoutList, ListTree, TableProperties, FileText } from "lucide-react";
import { db } from "@/lib/db";
import { Asset } from "@/components/data";
import TableExplorer from "@/components/TableExplorer";

async function getAssets(): Promise<Asset[]> {
  const items: any[] = await db.item.findMany({
    orderBy: { createdAt: "desc" },
  });

  const mappedItems: Asset[] = items.map((item) => ({
    id: item.id,
    serial: item.serial,
    category: item.category,
    brand: item.brand,
    type: item.type,
    vehicle: item.vehicle,
    status: {
      state: item.statusState as any,
      level: item.statusLevel ?? undefined,
    },
    endDate: item.endDate ?? undefined,
  }));

  // Mock sub-rows for demonstration (Tree Grid)
  if (mappedItems.length > 0) {
    mappedItems[0].subRows = [
      {
        id: "sub-1",
        serial: "SALE-2024-001",
        category: "Sales Record",
        brand: "-",
        type: "Invoice",
        vehicle: "-",
        status: { state: "operational", level: 4 },
        endDate: "2024-12-01"
      },
      {
        id: "sub-2",
        serial: "SALE-2024-002",
        category: "Sales Record",
        brand: "-",
        type: "Receipt",
        vehicle: "-",
        status: { state: "operational", level: 4 },
        endDate: "2024-12-05",
        subRows: [
          {
            id: "sub-2-1",
            serial: "DTL-X",
            category: "Line Item",
            brand: "-",
            type: "Detail",
            vehicle: "-",
            status: { state: "inspection", level: 4 }, // Fixed typo from 'ispection'
            endDate: "2024-12-05"
          }
        ]
      }
    ];
  }

  return mappedItems;
}

export default async function Home(props: { searchParams: Promise<{ v?: string }> }) {
  const assets = await getAssets();
  const searchParams = await props.searchParams;
  const variant = searchParams.v;

  // If a variant is selected, show the Explorer
  if (variant && ["original", "v1", "v2", "v3"].includes(variant)) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-gray-50">
        <div className="w-full max-w-7xl">
          <TableExplorer data={assets} initialVariant={variant as any} />
        </div>
      </main>
    );
  }

  // Otherwise show the Landing Page Cards
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-5xl space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-full mb-4">
            <TableProperties className="text-blue-600 h-8 w-8" />
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Table Variations</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore different ways to visualize hierarchical data. Select a style below to view the interactive demo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 0 - Original */}
          <Link href="/?v=original" className="group">
            <div className="h-full bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <FileText size={64} />
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <FileText size={24} className="text-gray-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Original</h2>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  The original flat table implementation without tree capabilities.
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center text-gray-900 font-semibold text-sm">
                View <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 1 */}
          <Link href="/?v=v1" className="group">
            <div className="h-full bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col space-y-4 relative overflow-hidden hover:border-orange-200">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-orange-500">
                <ListTree size={64} />
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <ListTree size={24} className="text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Variation 1</h2>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  Indented sub-rows. Classic tree view style.
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center text-orange-600 font-semibold text-sm">
                View <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 2 */}
          <Link href="/?v=v2" className="group">
            <div className="h-full bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col space-y-4 relative overflow-hidden hover:border-blue-200">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-blue-500">
                <LayoutList size={64} />
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <LayoutList size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Variation 2</h2>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  Structured grid with guide lines and nested backgrounds.
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center text-blue-600 font-semibold text-sm">
                View <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 3 */}
          <Link href="/?v=v3" className="group">
            <div className="h-full bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col space-y-4 relative overflow-hidden hover:border-green-200">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-green-500">
                <TableProperties size={64} />
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <TableProperties size={24} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Variation 3</h2>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  Master-Detail view with full-width sub-panels.
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center text-green-600 font-semibold text-sm">
                View <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 4 - Tree View (New) */}
          <Link href="/tree-view" className="group">
            <div className="h-full bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col space-y-4 relative overflow-hidden hover:border-purple-200">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-purple-500">
                <ListTree size={64} />
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <ListTree size={24} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Tree View (New)</h2>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  Hierarchical tree view with "Epic {'>'} Feature {'>'} Task" structure.
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center text-purple-600 font-semibold text-sm">
                View <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}

