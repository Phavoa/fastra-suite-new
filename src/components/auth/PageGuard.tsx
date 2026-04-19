"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "../../hooks/usePermission";
import { PermissionAction, ApplicationName } from "../../types/permissions";
import { LoadingDots } from "../shared/LoadingComponents";

interface PageGuardProps {
  application: ApplicationName;
  module: string;
  action?: PermissionAction; // Defaults to 'view'
  children: ReactNode;
}

/**
 * specialized guard for protecting entire pages.
 * Handles redirection and loading states consistently.
 */
export function PageGuard({
  application,
  module,
  action = "view",
  children,
}: PageGuardProps) {
  const router = useRouter();
  const { can, isLoading } = usePermission();

  const hasAccess = can({ application, module, action });

  useEffect(() => {
    // Only redirect if NOT loading and user DOES NOT have access
    if (!isLoading && !hasAccess) {
      router.replace("/unauthorized");
    }
  }, [isLoading, hasAccess, router]);

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

  // If we don't have access and are not loading, don't show anything (redirect will trigger)
  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
