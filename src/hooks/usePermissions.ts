import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserPermissions {
  permissions: Record<string, boolean>;
  role: string | null;
  loading: boolean;
  hasPermission: (key: string) => boolean;
  isOwnerOrAdmin: boolean;
  refetch: () => Promise<void>;
}

// Permission keys that map to sidebar tools
const TOOL_PERMISSION_MAP: Record<string, string> = {
  "/sales": "view_sales",
  "/products": "view_products",
  "/customers": "view_customers",
  "/tasks": "view_tasks",
  "/documents": "view_documents",
  "/invoices": "view_invoices",
  "/calendar": "view_calendar",
  "/insights": "view_analytics",
  "/team": "manage_team",
  "/workflow": "manage_workflow",
};

export function usePermissions(): UserPermissions {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      const userRole = roleData?.role || null;
      setRole(userRole);

      // Owners and admins have all permissions by default
      if (userRole === "owner" || userRole === "admin") {
        setPermissions({});
        setLoading(false);
        return;
      }

      // Fetch member-specific permissions
      const { data: permsData } = await supabase
        .from("member_permissions")
        .select("permission_key, allowed")
        .eq("user_id", user.id);

      const perms: Record<string, boolean> = {};
      if (permsData) {
        permsData.forEach((p: any) => {
          perms[p.permission_key] = p.allowed;
        });
      }
      setPermissions(perms);
    } catch (err) {
      console.error("Error fetching permissions:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const isOwnerOrAdmin = role === "owner" || role === "admin";

  const hasPermission = useCallback(
    (key: string): boolean => {
      // Owners and admins always have all permissions
      if (isOwnerOrAdmin) return true;
      // If no permissions set at all, default to true (no restrictions applied yet)
      if (Object.keys(permissions).length === 0) return true;
      // Check specific permission
      return permissions[key] === true;
    },
    [permissions, isOwnerOrAdmin]
  );

  return {
    permissions,
    role,
    loading,
    hasPermission,
    isOwnerOrAdmin,
    refetch: fetchPermissions,
  };
}

export function getPermissionForPath(path: string): string | null {
  return TOOL_PERMISSION_MAP[path] || null;
}
