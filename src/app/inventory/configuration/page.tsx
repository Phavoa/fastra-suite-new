"use client";

import React from "react";
import { Package, Scale, Tags, Settings, ArrowRight } from "lucide-react";
import { BreadcrumbItem } from "@/components/shared/types";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { Button } from "@/components/ui/button";
import { AutoSaveIcon } from "@/components/shared/icons";
import { PageGuard } from "@/components/auth/PageGuard";
import Link from "next/link";

const items: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Inventory", href: "/inventory" },
  { label: "Configuration", href: "/inventory/configuration", current: true },
];

export default function InventoryConfiguration() {
  const configModules = [
    {
      title: "Products",
      description: "Company-wide master catalogue of all physical items and materials.",
      href: "/inventory/configuration/products",
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "Units of Measure",
      description: "Standard measurement attributes (Bags, Tonnes, Liters, Meters).",
      href: "/inventory/configuration/units-of-measure",
      icon: Scale,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      title: "Product Categories",
      description: "Classifications for grouping inventory items in reports.",
      href: "/inventory/configuration/categories",
      icon: Tags,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      title: "General Settings",
      description: "Validation rules, waybill photos, and low stock notifications.",
      href: "/inventory/configuration/settings",
      icon: Settings,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
  ];

  return (
    <PageGuard application="inventory" module="configuration">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 w-full flex flex-col gap-6">
          <Breadcrumbs
            items={items}
            action={
              <Button variant="ghost" className="text-sm text-gray-400 flex items-center gap-2">
                Autosaved <AutoSaveIcon />
              </Button>
            }
          />

          <div className="flex items-center justify-between py-4 mb-2">
            <h1 className="text-2xl font-semibold text-gray-900">Inventory Configuration</h1>
          </div>

          {/* Quick Navigation Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {configModules.map((mod) => (
              <Link 
                key={mod.title} 
                href={mod.href}
                className="bg-white p-6 rounded border border-gray-200 shadow-sm hover:border-[#3B7CED] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-10 h-10 rounded-full ${mod.bg} flex items-center justify-center mb-4`}>
                    <mod.icon className={`w-5 h-5 ${mod.color}`} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-[#3B7CED] transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {mod.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs font-medium text-[#3B7CED]">
                  Manage <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </PageGuard>
  );
}
