"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Package, Search, Eye, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import Image from "next/image";

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/products/fetch");
      const json = await res.json();
      setProducts(json.products || []);
      setLoading(false);
    }
    load();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-300 font-medium">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-2 py-6 flex items-center justify-between gap-6">
          <button
            onClick={() => router.replace("/")}
            className="p-2 hover:bg-slate-800/50 rounded-xl transition-all group"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-blue-600 rounded-2xl shadow-lg shadow-primary/20">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-blue-400 to-blue-400 bg-clip-text text-transparent mb-1">
                Product Catalog
              </h1>
              <p className="text-slate-400">
                Browse verified AI-powered products and solutions
              </p>
            </div>
          </div>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-20 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-xl w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-primary/20 to-blue-600/20 text-primary rounded-xl text-sm font-semibold border border-primary/30">
              <Package className="w-4 h-4" />
              <span>
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "Product" : "Products"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-block p-6 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-lg mb-4">
              <Package className="w-16 h-16 text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {searchTerm ? "No products found" : "No products available"}
            </h3>
            <p className="text-slate-400">
              {searchTerm
                ? "Try a different search term"
                : "Products will appear here once added"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="group bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 overflow-hidden border border-slate-800 hover:border-primary/50 hover:-translate-y-1 flex flex-col h-full"
              >
                {/* Image - Fixed Height */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 h-56 flex-shrink-0">
                  <Image
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    width={100}
                    height={100}
                  />
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-primary to-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-primary/30">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified
                  </div>
                </div>

                {/* Content - Flexible Height */}
                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {p.name}
                  </h2>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed flex-grow">
                    {p.description}
                  </p>

                  {/* View Details Button */}
                  <button
                    onClick={() => router.push(`/shop/${p.id}`)}
                    className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 group mt-auto"
                  >
                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
