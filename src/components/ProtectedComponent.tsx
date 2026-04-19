"use client";

import { ReactNode } from "react";
import { usePermission } from "../hooks/usePermission";
import { PermissionAction, ApplicationName } from "../types/permissions";

interface ProtectedComponentProps {
  application: ApplicationName;
  module: string;
  action: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
  /**
   * If true, the component will show nothing while permissions are loading.
   * If false, it will show the fallback (default: null).
   */
  hideWhileLoading?: boolean;
}

/**
 * Declarative component for protecting UI elements based on user permissions.
 */
export function ProtectedComponent({
  application,
  module,
  action,
  children,
  fallback = null,
  hideWhileLoading = true,
}: ProtectedComponentProps) {
  const { can, isLoading } = usePermission();

  if (isLoading && hideWhileLoading) {
    return null;
  }

  if (can({ application, module, action })) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

// Export as PermissionGuard for better semantic naming
export { ProtectedComponent as PermissionGuard };
