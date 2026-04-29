import React from "react";
import { NavBar } from "@/components/shared/TopBar/reusableTopBar";

export default function InventoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navItems = [
    {
      label: "Operations",
      children: [
        {
          label: "Incoming Product",
          href: "/inventory/operation/incoming_product",
          application: "inventory",
          module: "incomingproduct",
        },
        {
          label: "Incoming Product Return",
          href: "/inventory/operation/incoming_product_return",
          application: "inventory",
          module: "incomingproductreturn",
        },
        { 
          label: "Delivery Order", 
          href: "/inventory/operation/delivery_order",
          application: "inventory",
          module: "deliveryorder",
        },
        {
          label: "Delivery Order Return",
          href: "/inventory/operation/delivery_order_return",
          application: "inventory",
          module: "deliveryorderreturn",
        },
        {
          label: "Internal Transfer",
          href: "/inventory/operation/internal_transfer",
          application: "inventory",
          module: "internaltransfer",
        },
        { 
          label: "Back Order", 
          href: "/inventory/operation/back_order",
          application: "inventory",
          module: "backorder",
        },
        { 
          label: "Material Consumption", 
          href: "/inventory/operation/material-consumption",
          application: "inventory",
          module: "materialconsumption",
        },
      ],
    },
    {
      label: "Stocks",
      children: [
        { 
          label: "Stock Adjustment", 
          href: "/inventory/stocks/adjustment",
          application: "inventory",
          module: "stockadjustment",
        },
        { 
          label: "Stock Moves", 
          href: "/inventory/stocks/stock-moves",
          application: "inventory",
          module: "stockmove",
        },
        { 
          label: "Scrap", 
          href: "/inventory/stocks/scrap",
          application: "inventory",
          module: "scrap",
        },
      ],
    },
    { 
      label: "Location", 
      href: "/inventory/locations",
      application: "inventory",
      module: "location",
    },
    { 
      label: "Configuration", 
      href: "/inventory/configuration",
      application: "inventory",
      module: "configuration",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar title="Inventory" items={navItems} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}