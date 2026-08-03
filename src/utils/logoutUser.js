import api from "../config/api";
import { useAuthStore } from "../store/authStore";

export const logoutUser = async () => {
  try {
    await api.post("/api/auth/logout", {}, { withCredentials: true });
  } catch (err) {
  } finally {
    useAuthStore.getState().logout();
  }
};
