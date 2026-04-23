"use client";

import { ReactNode } from "react";
import { usePermission } from "../../hooks/usePermission";
import { PermissionAction, ApplicationName } from "../../types/permissions";
import { LoadingDots } from "../shared/LoadingComponents";
import { UnauthorizedMessage } from "../shared/UnauthorizedMessage";

interface PageGuardProps {
  application: ApplicationName;
  module: string;
  action?: PermissionAction; // Defaults to 'view'
  children: ReactNode;
}

/**
 * Specialized guard for protecting entire pages.
 * Handles loading states consistently and renders an inline unauthorized message.
 */
export function PageGuard({
  application,
  module,
  action = "view",
  children,
}: PageGuardProps) {
  const { can, isLoading } = usePermission();

  const hasAccess = can({ application, module, action });

  // Show loading state while permissions are being determined
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6 bg-white rounded-lg">
        <LoadingDots count={3} />
        <p className="mt-4 text-sm text-gray-500 animate-pulse">
          Verifying access rights...
        </p>
      </div>
    );
  }

  // If we don't have access and are not loading, show the inline unauthorized message
  if (!hasAccess) {
    return <UnauthorizedMessage />;
  }

  return <>{children}</>;
}
