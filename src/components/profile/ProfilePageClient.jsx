"use client";

import { useEffect } from "react";
import ProfileCard from "@/components/profile/ProfileCard";
import useAuthStore from "@/store/authStore";
import api from "@/services/api";

export default function ProfilePageClient() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get("/api/auth/me");
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (error) {
        setUser(null);
      }
    }

    if (!user) {
      fetchUser();
    }
  }, [user, setUser]);

  return <ProfileCard user={user} />;
}
