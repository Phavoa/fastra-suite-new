"use client";

import { ReactNode } from "react";
import { usePermission } from "../hooks/usePermission";

interface ProtectedComponentProps {
  application: string;
  module: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedComponent({
  application,
  module,
  action,
  children,
  fallback = null,
}: ProtectedComponentProps) {
  const { can } = usePermission();

  if (can({ application, module, action })) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
