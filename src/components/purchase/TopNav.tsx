"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NotifySection from "../shared/Notify";

export function TopNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Purchase Requests", href: "/purchase" },
    { label: "Request for Quotations", href: "/purchase/quotations" },
    { label: "Purchase Orders", href: "/purchase/orders" },
    { label: "Vendors", href: "/purchase/vendors" },
    { label: "Products", href: "/purchase/products" },
    { label: "Configuration", href: "/purchase/configuration" },
  ];

  const isActive = (href: string) => {
    if (href === "/purchase") {
      return pathname === "/purchase" || pathname === "/purchase/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30 ">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        <h1 className="text-2xl">Purchase</h1>
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-6 text-sm text-gray-600 h-full"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`h-full flex items-center text-base transition-colors duration-200 ${
                isActive(item.href)
                  ? "text-[#3B7CED] border-b-2 border-[#3B7CED]"
                  : "hover:text-gray-900 hover:border-b-2 hover:border-gray-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <NotifySection />
      </div>
    </header>
  );
}
