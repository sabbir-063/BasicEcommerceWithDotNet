import React from "react";

export function Loading() {
  return <div className="text-center py-12 text-text-muted">Loading&hellip;</div>;
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
