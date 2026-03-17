"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import AddProductForm from "@/components/AddProductForm";
import UpdateProductForm from "@/components/UpdateProductForm";
import ShopNavbar from "@/components/ShopNavbar";
import {
  Package,
  Plus,
  Trash2,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { Profile } from "@/types";

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  org_id: string;
}

export default function AdminProductsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return router.replace("/Login");

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!prof) return router.replace("/Login");

      setProfile(prof);
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      setProducts(data || []);
      setLoading(false);
    })();
  }, [router]);

  async function deleteProduct(id: string) {
    await fetch("/api/products/delete", {
      method: "POST",
      body: JSON.stringify({ id }),
    });

    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading || !profile) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <span className="text-lg text-slate-300 font-medium">
            Loading product catalog...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 mt-20 relative overflow-hidden">
      <ShopNavbar
        fullName={profile.full_name}
        role={profile.role}
        organizationLogo={profile.organization_logo}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 blur-lg opacity-40 rounded-2xl" />
            <div className="relative p-4 bg-gradient-to-br from-primary to-blue-600 rounded-2xl shadow-lg shadow-primary/20">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-blue-400 to-blue-400 bg-clip-text text-transparent">
              Product Catalog
            </h1>
            <p className="mt-1 text-slate-400">
              Admin view — all organizations
            </p>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700">
                <tr>
                  <th className="p-4 text-left text-xs font-bold text-slate-300 uppercase">
                    Product
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-slate-300 uppercase">
                    Name
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-slate-300 uppercase">
                    Description
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-slate-300 uppercase">
                    Org ID
                  </th>
                  <th className="p-4 text-center text-xs font-bold text-slate-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <ImageIcon className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                      <p className="text-slate-500">No products found</p>
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          className="w-16 h-16 object-cover rounded-xl border border-slate-700"
                          width={100}
                          height={100}
                        />
                      </td>
                      <td className="p-4 font-semibold text-slate-200">
                        {p.name}
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        {p.description}
                      </td>
                      <td className="p-4 font-mono text-sm text-primary">
                        {p.org_id}
                      </td>
                      <td className="p-4 text-center flex justify-center gap-2">
                        {/* EDIT */}
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/40 transition-colors"
                        >
                          ✏️
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BACK BUTTON */}
      <button
        onClick={() => router.back()}
        className="fixed bottom-8 left-8 group z-40"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 blur-xl opacity-50 rounded-full group-hover:opacity-70 transition-opacity" />
        <div className="relative bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-4 rounded-full shadow-2xl shadow-primary/20 group-hover:shadow-primary/40 group-hover:scale-105 transition-all flex items-center gap-3">
          <ArrowLeft className="w-6 h-6" />
          <span className="font-semibold text-lg">Go Back</span>
        </div>
      </button>

      {/* ADD BUTTON */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-8 right-8 group z-40"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 blur-xl opacity-50 rounded-full group-hover:opacity-70 transition-opacity" />
        <div className="relative bg-gradient-to-r from-primary to-blue-600 text-white p-5 rounded-full shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all">
          <Plus className="w-7 h-7" />
        </div>
      </button>

      {/* ADD PRODUCT MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-lg border border-slate-800 shadow-2xl">
            <AddProductForm
              onSuccess={async () => {
                const { data } = await supabase
                  .from("products")
                  .select("*")
                  .order("created_at", { ascending: false });

                setProducts(data || []);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-lg border border-slate-800 shadow-2xl">
            <UpdateProductForm
              product={editingProduct}
              onSuccess={async () => {
                const { data } = await supabase
                  .from("products")
                  .select("*")
                  .order("created_at", { ascending: false });

                setProducts(data || []);
                setEditingProduct(null);
              }}
              onCancel={() => setEditingProduct(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
