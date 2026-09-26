import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import { User } from "../../utils/types";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, setUser } = useAuth();
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
    }
  });

  if (!user) return null;

  const save = async (data: ProfileForm) => {
    setMsg("");
    setError("");
    try {
      const u = await api<User>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      setUser(u);
      setMsg("Profile updated successfully");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-surface p-8 rounded border border-border shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Your profile</h1>
      
      {msg && <div className="bg-success/10 border border-success text-success px-4 py-3 rounded mb-4">{msg}</div>}
      {error && <div className="bg-error/10 border border-error text-error px-4 py-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit(save)} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input value={user.email} disabled className="input-field bg-gray-50 text-text-muted cursor-not-allowed" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input {...register("name")} className="input-field" />
          {errors.name && <p className="text-error text-sm mt-1">{errors.name.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input {...register("phone")} className="input-field" />
          {errors.phone && <p className="text-error text-sm mt-1">{errors.phone.message}</p>}
        </div>
        
        <div className="flex items-center gap-4 mt-2">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
          <Link to="/change-password" className="text-primary hover:underline font-medium">Change password</Link>
        </div>
      </form>
    </div>
  );
}
