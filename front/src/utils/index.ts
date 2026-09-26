import { useEffect as reactUseEffect, DependencyList } from "react";

export function useEffect(effect: () => unknown, dependencies: DependencyList) {
  reactUseEffect(() => {
    void effect();
  }, dependencies);
}

export const money = (v: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(v);
