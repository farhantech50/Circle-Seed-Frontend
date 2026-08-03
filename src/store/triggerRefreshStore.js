import { create } from "zustand";

export const useTriggerRefreshStore = create((set) => ({
  triggerRefresh: false,

  setTriggerRefresh: () => {
    set((state) => ({
      triggerRefresh: !state.triggerRefresh,
    }));
  },
}));
