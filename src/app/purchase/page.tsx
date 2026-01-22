"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";

const Page = () => {
  const router = useRouter();
  const { can } = usePermission();

  useEffect(() => {
    // Check if user has access to purchase_requests
    const hasAccess = can({
      application: "purchase",
      module: "purchase_requests",
      action: "view",
    });

    if (hasAccess) {
      router.push("/purchase/purchase_requests");
    } else {
      router.push("/unauthorized");
    }
  }, [can, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Checking Permissions
        </h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};

export default Page;
