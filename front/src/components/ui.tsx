import React from "react";

export function Loading() {
  return <div className="text-center py-12 text-text-muted">Loading&hellip;</div>;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-gray-200 animate-pulse rounded ${className || ""}`} />
  );
}

export function ProductSkeleton() {
  return (
    <div className="bg-surface p-4 rounded shadow-sm border border-border">
      <Skeleton className="w-full aspect-square mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export function Banner({ text }: { text: string }) {
  return (
    <div className="bg-error/10 border border-error text-error px-4 py-3 rounded mb-4" role="alert">
      {text}
    </div>
  );
}

export function Empty({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-16 bg-surface border border-border rounded">
      <p className="text-text-muted mb-4">{text}</p>
      {action}
    </div>
  );
}
