"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type DashboardRole = "admin" | "vip";

interface OfficeRecord {
  id: string;
  name: string;
  userId: string | null;
  email: string;
  isActive: boolean;
}

export default function useDashboardRole() {
  const [role, setRole] = useState<DashboardRole>("admin");
  const [userName, setUserName] = useState<string | null>(null);
  const [vipActive, setVipActive] = useState(true);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    async function resolveRole() {
      if (!supabase) {
        setLoadingRole(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        setUserName(null);
        setLoadingRole(false);
        return;
      }

      const metadataName = typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null;

      try {
        const response = await fetch("/api/offices");

        if (!response.ok) {
          setUserName(metadataName);
          setLoadingRole(false);
          return;
        }

        const offices = (await response.json()) as OfficeRecord[];
        const matchedOffice = offices.find(
          office => office.userId === user.id || office.email.toLowerCase() === (user.email || "").toLowerCase()
        );

        setRole(matchedOffice ? "vip" : "admin");
        setUserName(matchedOffice?.name || metadataName || user.email || null);
        setVipActive(matchedOffice?.isActive ?? true);
      } catch {
        setRole("admin");
        setUserName(metadataName || user.email || null);
        setVipActive(true);
      } finally {
        setLoadingRole(false);
      }
    }

    resolveRole();
  }, []);

  return {
    role,
    isAdmin: role === "admin",
    isVip: role === "vip",
    userName,
    vipActive,
    loadingRole,
  };
}