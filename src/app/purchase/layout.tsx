import { TopNav } from "@/components/purchase/purchaseRequest";
import React from "react";

export default function PurchaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full">
      <TopNav />
      {children}
    </div>
  );
}
