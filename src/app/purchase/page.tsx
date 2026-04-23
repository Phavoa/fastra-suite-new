"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";
import { PageGuard } from "@/components/auth/PageGuard";

const Page = () => {
  const router = useRouter();
  const { can, isLoading } = usePermission();

  useEffect(() => {
    // Wait until permissions are loaded
    if (isLoading) return;

    // Check if user has access to purchase_requests
    const hasAccess = can({
      application: "purchase",
      module: "purchaserequest",
      action: "view",
    });

    if (hasAccess) {
      router.push("/purchase/purchase_requests");
    } else {
      // If no access to purchase requests, they might have access to other purchase sub-modules,
      // but for simplicity, we redirect to unauthorized if the landing module is blocked.
      router.push("/unauthorized");
    }
  }, [can, isLoading, router]);

  return (
    <PageGuard application="purchase" module="purchaserequest">
      {/* 
          We wrap in PageGuard to ensure unauthorized users are caught.
          The children are empty because this is a purely redirecting page.
      */}
      <div className="min-h-screen" />
    </PageGuard>
  );
};

export default Page;
