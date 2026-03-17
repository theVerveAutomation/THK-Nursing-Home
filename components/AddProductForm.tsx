"use client";

import { useEffect, useState } from "react";
import { Upload, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

interface AddProductFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Org {
  org_id: string;
}

export default function AddProductForm({
  onSuccess,
  onCancel,
}: AddProductFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [orgs, setOrgs] = useState<Org[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("org_id")
        .neq("org_id", null);

      const unique = Array.from(new Set((data || []).map((o) => o.org_id))).map(
        (id) => ({ org_id: id })
      );

      setOrgs(unique);
    })();
  }, []);

  async function uploadProductImage(file: File) {
    const ext = file.name.split(".").pop();
    const fileName = `products/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Image upload error:", error);
      throw new Error(error.message);
    }

    const { data } = supabase.storage.from("products").getPublicUrl(fileName);

    return data.publicUrl;
  }

  const handleImageChange = (file?: File | null) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type !== "dragleave");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleImageChange(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async () => {
    if (!name || !description || !imageFile) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const imageUrl = await uploadProductImage(imageFile);

      const res = await fetch("/api/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          imageUrl,
        }),
      });

      if (!res.ok) throw new Error("Create failed");

      toast.success("Product added successfully!");
      onSuccess?.();
    } catch {
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl shadow-xl border border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
      <div className="relative p-8 space-y-6 overflow-y-auto flex-1 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg shadow-primary/20">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-blue-400 to-blue-400 bg-clip-text text-transparent">
            Add New Product
          </h2>
        </div>

        {/* NAME */}
        <div>
          <label className="block font-semibold text-slate-300 mb-2">
            Product Name
          </label>
          <input
            className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 p-3 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all"
            placeholder="Enter product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block font-semibold text-slate-300 mb-2">
            Description
          </label>
          <textarea
            className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 p-3 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"
            rows={4}
            placeholder="Enter product description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* IMAGE */}
        <div>
          <label className="block font-semibold text-slate-300 mb-2">
            Product Image
          </label>

          {imagePreview ? (
            <div className="relative group">
              <Image
                src={imagePreview}
                className="w-full h-64 object-contain rounded-xl border border-slate-700 bg-slate-800/50"
                alt="Product preview"
                width={100}
                height={100}
              />
              <button
                onClick={handleRemoveImage}
                type="button"
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-xl p-8 transition-all ${
                dragActive
                  ? "border-primary bg-primary/10"
                  : "border-slate-700 hover:border-primary/50 hover:bg-slate-800/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <label className="cursor-pointer flex flex-col items-center">
                <Upload className="w-12 h-12 text-primary mb-3" />
                <span className="text-base font-semibold text-slate-300 mb-1">
                  Click to upload or drag and drop
                </span>
                <span className="text-sm text-slate-500">
                  PNG, JPG, GIF up to 10MB
                </span>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0])}
                />
              </label>
            </div>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <button
              onClick={onCancel}
              type="button"
              className="flex-1 border border-slate-700 text-slate-300 py-3 rounded-xl font-semibold hover:bg-slate-800/50 transition-all"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            type="button"
            className="flex-1 bg-gradient-to-r from-primary to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-primary/90 hover:to-blue-600/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </span>
            ) : (
              "Add Product"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
