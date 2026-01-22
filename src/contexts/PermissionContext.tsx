"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";
import {
  NormalizedPermissions,
  normalizePermissions,
} from "../utils/normalizePermissions";

const PermissionContext = createContext<NormalizedPermissions | undefined>(
  undefined
);

interface PermissionProviderProps {
  children: ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const user = useSelector((state: RootState) => state.auth.user_accesses);
  const normalized = useMemo(
    () =>
      user
        ? normalizePermissions({ user_accesses: user })
        : { isAdmin: false, permissions: {} },
    [user]
  );

  console.log("Hello", normalized);
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
