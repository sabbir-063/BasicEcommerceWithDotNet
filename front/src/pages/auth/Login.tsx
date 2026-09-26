import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import { User } from "../../utils/types";
import { Banner } from "../../components/ui";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { setUser } = useAuth();
  const [error, setError] = useState("");
  const nav = useNavigate();
  const [params] = useSearchParams();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const submit = async (data: LoginForm) => {
    try {
      const r = await api<{ accessToken: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      sessionStorage.setItem("token", r.accessToken);
      setUser(r.user);
      const returnTo = params.get("returnTo");
      if (returnTo && returnTo.startsWith("/")) nav(returnTo);
      else nav(r.user.role === "Admin" ? "/admin" : "/");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-surface p-8 rounded border border-border shadow-sm">
      <p className="text-sm font-bold tracking-widest text-primary mb-2 text-center">BASICCOMMERCE</p>
      <h1 className="text-2xl font-bold mb-6 text-center">Welcome back</h1>
      
      {error && <Banner text={error} />}
      
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Email
            <input
              {...register("email")}
              type="email"
              className="input-field block w-full mt-1"
            />
          </label>
          {errors.email && <p className="text-error text-sm mt-1">{errors.email.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Password
            <input
              {...register("password")}
              type="password"
              className="input-field block w-full mt-1"
            />
          </label>
          {errors.password && <p className="text-error text-sm mt-1">{errors.password.message}</p>}
        </div>
        
        <button type="submit" disabled={isSubmitting} className="btn-primary mt-2">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      
      <p className="mt-6 text-center text-text-muted">
        New here? <Link to="/register" className="text-primary hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
