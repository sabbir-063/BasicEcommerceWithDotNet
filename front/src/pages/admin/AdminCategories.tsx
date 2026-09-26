import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../../api/client";
import { Category } from "../../utils/types";
import { Banner } from "../../components/ui";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
});

type CategoryForm = z.infer<typeof categorySchema>;

export default function AdminCategories() {
  const [cats, setCats] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema)
  });

  const load = () => {
    api<Category[]>("/admin/categories")
      .then(setCats)
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  const submit = async (data: CategoryForm) => {
    setError("");
    try {
      if (editingId) {
        await api(`/admin/categories/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        setEditingId(null);
      } else {
        await api("/admin/categories", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
      reset({ name: "" });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setValue("name", c.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset({ name: "" });
    setError("");
  };

  const toggle = async (id: string, active: boolean) => {
    try {
      await api(`/admin/categories/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: active }),
      });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Categories</h1>
      
      {error && <Banner text={error} />}
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <form onSubmit={handleSubmit(submit)} className="w-full md:w-1/3 bg-surface p-6 rounded shadow-sm border border-border sticky top-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{editingId ? "Edit Category" : "Add Category"}</h2>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="text-sm text-text-muted hover:text-text">Cancel</button>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input {...register("name")} className="input-field w-full" />
            {errors.name && <p className="text-error text-sm mt-1">{errors.name.message}</p>}
          </div>
          
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? "Saving..." : editingId ? "Save Changes" : "Add Category"}
          </button>
        </form>
        
        <div className="flex-1 bg-surface rounded shadow-sm border border-border overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold text-text">Name</th>
                <th className="py-3 px-4 font-semibold text-text">Slug</th>
                <th className="py-3 px-4 font-semibold text-text">Status</th>
                <th className="py-3 px-4 font-semibold text-text text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cats.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium">{c.name}</td>
                  <td className="py-3 px-4 text-text-muted">{c.slug}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? "bg-success/10 text-success" : "bg-gray-100 text-gray-600"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-3">
                    <button
                      onClick={() => startEdit(c)}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggle(c.id, !c.isActive)}
                      className={`text-sm font-medium hover:underline ${c.isActive ? "text-error" : "text-success"}`}
                    >
                      {c.isActive ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
              {!cats.length && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-muted">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
