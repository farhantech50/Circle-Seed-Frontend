import { useCallback } from "react";
import api from "../config/api";

const useLookUp = () => {
  const getLookup = useCallback(async (value) => {
    try {
      const res = await api.get(`/api/lookup/values/${value}`);
      if (res.status) {
        return {
          success: true,
          data: res.data,
          message: res.data.message,
        };
      }

      return {
        success: false,
        message: res.data?.message || "Something went wrong",
      };
    } catch (error) {
      console.error("GET lookup error:", error);

      return {
        success: false,
        message: error?.message || "Network error",
      };
    }
  }, []);

  return { getLookup };
};

export default useLookUp;
