"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";
import {
  NormalizedPermissions,
  normalizePermissionsFromBackend,
} from "../utils/normalizePermissions";

const PermissionContext = createContext<NormalizedPermissions | undefined>(
  undefined
);

interface PermissionProviderProps {
  children: ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const user_permissions = useSelector(
    (state: RootState) => state.auth.user_permissions
  );
  const isAdmin = useSelector((state: RootState) => state.auth.isAdmin);
  const username = useSelector(
    (state: RootState) => state.auth.user?.username ?? ""
  );

  const usernameContainsAdmin = username.toLowerCase().includes("admin");
  const effectiveIsAdmin = isAdmin || usernameContainsAdmin;

  const normalized = useMemo((): NormalizedPermissions => {
    /**
     * Admin users: isAdmin=true in the Redux store means full access.
     * We return isReady:true immediately so PageGuard never blocks them.
     */
    if (effectiveIsAdmin) {
      return { isAdmin: true, permissions: {}, isReady: true };
    }

    /**
     * Non-admin users: user_permissions is an array of Django codenames.
     * If it's still null/undefined (not yet loaded), return isReady:false.
     */
    if (!Array.isArray(user_permissions)) {
      return { isAdmin: false, permissions: {}, isReady: false };
    }

    const result = normalizePermissionsFromBackend(user_permissions);
    return result;
  }, [user_permissions, effectiveIsAdmin]);

  return (
    <PermissionContext.Provider value={normalized}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissionContext(): NormalizedPermissions {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error(
      "usePermissionContext must be used within a PermissionProvider"
    );
  }
  return context;
}
