import { TopNav } from "@/components/invoice/TopNav";
import React from "react";

export default function InventoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <TopNav />
      {children}
    </div>
  );
}
