import { create } from "zustand";

export const usePaginationStore = create((set) => ({
  page: 1,
  limit: Number(import.meta.env.VITE_DATA_TABLE_PER_PAGE) || 10,
  totalData: 0,

  search: "",
  status: "",

  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit }),
  setTotalData: (totalData) => set({ totalData }),
  setSearch: (search) => set({ search }),
  setStatus: (status) => set({ status }),

  resetPagination: () =>
    set({
      page: 1,
      limit: Number(import.meta.env.VITE_DATA_TABLE_PER_PAGE) || 10,
      totalData: 0,
      search: "",
      status: "",
    }),
}));
