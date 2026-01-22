"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { usePermission } from "@/hooks/usePermission";
import {
  normalizePermissions,
  NormalizedPermissions,
} from "@/utils/normalizePermissions";

export default function ProtectedPage() {
  const router = useRouter();
  const { can } = usePermission();
  const { isAdmin, permissions } = usePermissionContext();
  const user = useSelector((state: RootState) => state.auth.user);
  const user_accesses = useSelector(
    (state: RootState) => state.auth.user_accesses,
  );
  const [loading, setLoading] = useState(true);
  const [accessChecks, setAccessChecks] = useState<{
    hook: boolean;
    context: boolean;
    direct: boolean;
    overall: boolean;
  }>({ hook: false, context: false, direct: false, overall: false });

  // Direct normalization for demonstration
  const normalizedDirect: NormalizedPermissions = useMemo(() => {
    if (user_accesses) {
      try {
        return normalizePermissions({ user_accesses });
      } catch (error) {
        console.error("Error normalizing permissions:", error);
        return { isAdmin: false, permissions: {} };
      }
    }
    return { isAdmin: false, permissions: {} };
  }, [user_accesses]);

  // Comprehensive permission checks
  const checkPermissions = useMemo(() => {
    const requiredPermissions = [
      { application: "inventory", module: "deliveryorder", action: "create" },
      { application: "inventory", module: "deliveryorder", action: "view" },
      { application: "purchase", module: "purchase_requests", action: "view" },
    ];

    const results = requiredPermissions.map((perm) => ({
      ...perm,
      hook: can(perm),
      context:
        isAdmin ||
        permissions[`${perm.application}:${perm.module}`]?.has(perm.action),
      direct:
        normalizedDirect.isAdmin ||
        normalizedDirect.permissions[`${perm.application}:${perm.module}`]?.has(
          perm.action,
        ),
    }));

    return results;
  }, [can, isAdmin, permissions, normalizedDirect]);

  useEffect(() => {
    // Simulate loading delay for demonstration
    const timer = setTimeout(() => {
      // Check using hook
      const hasAccessViaHook = can({
        application: "inventory",
        module: "deliveryorder",
        action: "create",
      });

      // Check using context directly
      const hasAccessViaContext =
        isAdmin || permissions["inventory:deliveryorder"]?.has("create");

      // Check using direct normalization
      const hasAccessViaDirect =
        normalizedDirect.isAdmin ||
        normalizedDirect.permissions["inventory:deliveryorder"]?.has("create");

      // Overall access (all methods must agree for consistency)
      const overallAccess =
        hasAccessViaHook && hasAccessViaContext && hasAccessViaDirect;

      setAccessChecks({
        hook: hasAccessViaHook,
        context: hasAccessViaContext,
        direct: hasAccessViaDirect,
        overall: overallAccess,
      });

      // Redirect if no access
      if (!overallAccess) {
        router.push("/unauthorized");
      }

      setLoading(false);
    }, 1000); // Simulate async check

    return () => clearTimeout(timer);
  }, [can, isAdmin, permissions, normalizedDirect, router]);

  // Handle edge cases
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Loading User Data
          </h1>
          <p className="text-gray-600">
            Please wait while we load your user information...
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Checking Permissions
          </h1>
          <p className="text-gray-600">Verifying your access rights...</p>
        </div>
      </div>
    );
  }

  if (!accessChecks.overall) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You do not have the required permissions to view this page.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to unauthorized page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Protected Page - Comprehensive Permission Demo
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            User Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">User ID:</p>
              <p className="font-medium">{user.id || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email:</p>
              <p className="font-medium">{user.email || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Admin Status
          </h2>
          <div className="flex items-center">
            <span
              className={`inline-block w-3 h-3 rounded-full mr-2 ${isAdmin ? "bg-green-500" : "bg-red-500"}`}
            ></span>
            <span className="font-medium">
              {isAdmin ? "Administrator" : "Regular User"}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Permission Checks
          </h2>
          <div className="space-y-4">
            {checkPermissions.map((check, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  {check.application}:{check.module}:{check.action}
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Hook:</p>
                    <span
                      className={`font-medium ${check.hook ? "text-green-600" : "text-red-600"}`}
                    >
                      {check.hook ? "✓ Allowed" : "✗ Denied"}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-600">Context:</p>
                    <span
                      className={`font-medium ${check.context ? "text-green-600" : "text-red-600"}`}
                    >
                      {check.context ? "✓ Allowed" : "✗ Denied"}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-600">Direct:</p>
                    <span
                      className={`font-medium ${check.direct ? "text-green-600" : "text-red-600"}`}
                    >
                      {check.direct ? "✓ Allowed" : "✗ Denied"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            All Permissions (Context)
          </h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(
              Object.fromEntries(
                Object.entries(permissions).map(([k, v]) => [k, Array.from(v)]),
              ),
              null,
              2,
            )}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            All Permissions (Direct Normalization)
          </h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(
              Object.fromEntries(
                Object.entries(normalizedDirect.permissions).map(([k, v]) => [
                  k,
                  Array.from(v),
                ]),
              ),
              null,
              2,
            )}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Raw User Accesses
          </h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(user_accesses || [], null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
