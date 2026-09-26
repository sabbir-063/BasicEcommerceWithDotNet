import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../../api/client";
import { Category, Product } from "../../utils/types";
import { Loading, Banner } from "../../components/ui";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().min(10, "Description is required"),
  price: z.number().min(0, "Price cannot be negative"),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative"),
  imageAltText: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const nav = useNavigate();
  
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      price: 0,
      stockQuantity: 0,
    }
  });

  useEffect(() => {
    api<Category[]>("/categories")
      .then((c) => setCats(c.filter(cat => cat.isActive)))
      .catch((e) => setError(e.message));

    if (isEditing) {
      api<Product>(`/admin/products/${id}`)
        .then((p) => {
          reset({
            name: p.name,
            categoryId: p.categoryId,
            description: p.description,
            price: p.price,
            stockQuantity: p.stockQuantity,
            imageAltText: p.imageAltText || "",
          });
          if (p.imageUrl) setPreview(p.imageUrl);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, reset]);

  const submit = async (data: ProductForm) => {
    setError("");
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          fd.append(k, String(v));
        }
      });
      if (file) fd.append("image", file);

      if (isEditing) {
        await api(`/admin/products/${id}`, { method: "PUT", body: fd });
      } else {
        await api("/admin/products", { method: "POST", body: fd });
      }
      nav("/admin/products");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl mx-auto bg-surface p-8 rounded shadow-sm border border-border">
      <h1 className="text-2xl font-bold mb-6">{isEditing ? "Edit Product" : "New Product"}</h1>
      
      {error && <Banner text={error} />}
      
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input {...register("name")} className="input-field" />
            {errors.name && <p className="text-error text-sm mt-1">{errors.name.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select {...register("categoryId")} className="input-field bg-white">
              <option value="">Select category...</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="text-error text-sm mt-1">{errors.categoryId.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea {...register("description")} rows={5} className="input-field resize-y" />
          {errors.description && <p className="text-error text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Price (BDT)</label>
            <input 
              {...register("price", { valueAsNumber: true })} 
              type="number" 
              step="0.01" 
              className="input-field" 
            />
            {errors.price && <p className="text-error text-sm mt-1">{errors.price.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Stock Quantity</label>
            <input 
              {...register("stockQuantity", { valueAsNumber: true })} 
              type="number" 
              className="input-field" 
            />
            {errors.stockQuantity && <p className="text-error text-sm mt-1">{errors.stockQuantity.message}</p>}
          </div>
        </div>

        <div className="border border-border rounded p-4 bg-gray-50/50">
          <h3 className="font-medium mb-4">Product Image</h3>
          
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-32 h-32 bg-gray-200 rounded border border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
              {preview ? (
                <img src={preview} alt="Preview" className="object-cover w-full h-full" />
              ) : (
                <span className="text-gray-400 text-sm">No image</span>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Upload New Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setFile(f || null);
                    if (f) setPreview(URL.createObjectURL(f));
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Image Alt Text (SEO)</label>
                <input {...register("imageAltText")} className="input-field" placeholder="Describe the image..." />
                {errors.imageAltText && <p className="text-error text-sm mt-1">{errors.imageAltText.message}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-border">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Saving..." : "Save Product"}
          </button>
          <button type="button" onClick={() => nav(-1)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
