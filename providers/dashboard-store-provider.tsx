"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import {
  type DashboardStore,
  createDashboardStore,
} from "@/stores/dashboard-store";

export type DashboardApi = ReturnType<typeof createDashboardStore>;

export const DashboardStoreContext = createContext<DashboardApi | undefined>(
  undefined
);

export interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardStoreProvider = ({
  children,
}: DashboardProviderProps) => {
  // @ts-ignore
  const storeRef = useRef<DashboardApi>();
  if (!storeRef.current) {
    storeRef.current = createDashboardStore();
  }

  return (
    <DashboardStoreContext.Provider value={storeRef.current}>
      {children}
    </DashboardStoreContext.Provider>
  );
};

export const useDashboardStore = <T,>(
  selector: (store: DashboardStore) => T
): T => {
  const dashboardStoreContext = useContext(DashboardStoreContext);

  if (!dashboardStoreContext) {
    throw new Error(
      `useDashboardStore must be used within DashboardStoreProvider`
    );
  }

  return useStore(dashboardStoreContext, selector);
};
