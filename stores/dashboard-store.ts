import { createStore } from "zustand/vanilla";

export type DashboardState = {
  count: number;
};

export type DashboardActions = {
  decrementCount: () => void;
  incrementCount: () => void;
};

export type DashboardStore = DashboardState & DashboardActions;

export const defaultInitState: DashboardState = {
  count: 0,
};

export const createDashboardStore = (
  initState: DashboardState = defaultInitState
) => {
  return createStore<DashboardStore>()((set) => ({
    ...initState,
    decrementCount: () => set((state) => ({ count: state.count - 1 })),
    incrementCount: () => set((state) => ({ count: state.count + 1 })),
  }));
};
