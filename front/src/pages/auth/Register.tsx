import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../../api/client";
import { Banner } from "../../components/ui";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address").max(255),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  confirm: z.string()
}).refine((data) => data.password === data.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [error, setError] = useState("");
  const nav = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const submit = async (data: RegisterForm) => {
    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password
        }),
      });
      nav("/login");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-surface p-8 rounded border border-border shadow-sm">
      <p className="text-sm font-bold tracking-widest text-primary mb-2 text-center">BASICCOMMERCE</p>
      <h1 className="text-2xl font-bold mb-6 text-center">Create your account</h1>
      
      {error && <Banner text={error} />}
      
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input {...register("name")} className="input-field" />
          {errors.name && <p className="text-error text-sm mt-1">{errors.name.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input {...register("email")} type="email" className="input-field" />
          {errors.email && <p className="text-error text-sm mt-1">{errors.email.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input {...register("phone")} className="input-field" />
          {errors.phone && <p className="text-error text-sm mt-1">{errors.phone.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input {...register("password")} type="password" className="input-field" />
          {errors.password && <p className="text-error text-sm mt-1">{errors.password.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Confirm password</label>
          <input {...register("confirm")} type="password" className="input-field" />
          {errors.confirm && <p className="text-error text-sm mt-1">{errors.confirm.message}</p>}
        </div>
        
        <button type="submit" disabled={isSubmitting} className="btn-primary mt-2">
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>
      
      <p className="mt-6 text-center text-text-muted">
        Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
