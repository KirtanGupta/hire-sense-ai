"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/authStore";
import api from "@/services/api";

export default function AuthProvider({ children }) {
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    async function loadUser() {
      if (!useAuthStore.getState().user) {
        try {
          const res = await api.get("/api/auth/me");
          if (res.data.success) {
            login(res.data.user);
          }
        } catch {
          // ignore
        }
      }
    }
    loadUser();
  }, [login]);

  return <>{children}</>;
}
