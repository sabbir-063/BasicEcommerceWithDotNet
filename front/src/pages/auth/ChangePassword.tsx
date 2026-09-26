import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../../api/client";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(100),
  confirm: z.string()
}).refine((data) => data.newPassword === data.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function ChangePassword() {
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema)
  });

  const submit = async (data: PasswordForm) => {
    setMsg("");
    setError("");
    try {
      await api("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      setMsg("Password changed successfully");
      reset();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-surface p-8 rounded border border-border shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Change password</h1>
      
      {msg && <div className="bg-success/10 border border-success text-success px-4 py-3 rounded mb-4">{msg}</div>}
      {error && <div className="bg-error/10 border border-error text-error px-4 py-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Current password</label>
          <input {...register("currentPassword")} type="password" className="input-field" />
          {errors.currentPassword && <p className="text-error text-sm mt-1">{errors.currentPassword.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">New password</label>
          <input {...register("newPassword")} type="password" className="input-field" />
          {errors.newPassword && <p className="text-error text-sm mt-1">{errors.newPassword.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Confirm new password</label>
          <input {...register("confirm")} type="password" className="input-field" />
          {errors.confirm && <p className="text-error text-sm mt-1">{errors.confirm.message}</p>}
        </div>
        
        <button type="submit" disabled={isSubmitting} className="btn-primary mt-2">
          {isSubmitting ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
