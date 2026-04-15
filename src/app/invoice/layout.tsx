import React from "react";
import { NavBar } from "@/components/shared/TopBar/reusableTopBar";

export default function InvoiceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navItems = [
    {
      label: "Invoices",
      children: [
        { label: "Paid Invoices", href: "/invoice/paid", application: "invoice", module: "invoice" },
        { label: "Partially Paid Invoices", href: "/invoice/partially-paid", application: "invoice", module: "invoice" },
        { label: "Unpaid Invoices", href: "/invoice/unpaid", application: "invoice", module: "invoice" },
        { label: "Payment History", href: "/invoice/payment-history", application: "invoice", module: "payment" },
      ],
    },
    { label: "Payments", href: "/payments", application: "invoice", module: "payment" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar title="Invoices" items={navItems} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
