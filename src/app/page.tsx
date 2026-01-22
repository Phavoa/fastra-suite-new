"use client";

// File: src/app/dashboard/page.tsx
import React from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import {
  Bell,
  ClipboardList,
  Briefcase,
  MapPin,
  BarChart2,
  Truck,
  ContactIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AccountIcon,
  AppIcon,
  FinanceIcon,
  HRIcon,
  InventoryIcon,
  LogisticsIcon,
  PurchaseIcon,
  SalesIcon,
  SettingsIcon,
} from "@/components/shared/icons";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

type Module = {
  id: string;
  title: string;
  description: string;
  color: string;
  Icon: React.ComponentType<{ className?: string; color?: string }>;
};

const MODULES: Module[] = [
  {
    id: "invoice",
    title: "Invoice",
    description:
      "Manage all financial transactions, including invoicing, billing, and ledger entries, to ensure accurate accounting records and financial reporting.",
    color: "green",
    Icon: AccountIcon,
  },
  {
    id: "purchase",
    title: "Purchase",
    description:
      "Streamline procurement processes by tracking purchase orders, vendor management, and inventory replenishment to optimize supply chain efficiency and cost savings.",
    color: "blue",
    Icon: PurchaseIcon,
  },
  {
    id: "sales",
    title: "Sales",
    description:
      "Track sales leads, manage customer relationships, and monitor sales performance to drive revenue growth and customer satisfaction.",
    color: "green",
    Icon: SalesIcon,
  },
  {
    id: "finance",
    title: "Finance",
    description:
      "Finance is the management of money and investments to achieve personal or organizational goals.",
    color: "blue",
    Icon: FinanceIcon,
  },
  {
    id: "inventory",
    title: "Inventory",
    description:
      "Monitor stock levels, track inventory movements, and optimize warehouse operations to ensure optimal inventory management and minimize stockouts.",
    color: "green",
    Icon: InventoryIcon,
  },
  {
    id: "hr",
    title: "HR",
    description:
      "Manage employee information, track attendance, process payroll, and oversee performance evaluations to support efficient HR administration and talent management.",
    color: "blue",
    Icon: HRIcon,
  },
  {
    id: "project",
    title: "Project Costing",
    description:
      "Track project expenses, monitor budget allocations, and analyze project profitability to ensure projects are delivered on time and within budget.",
    color: "yellow",
    Icon: Briefcase,
  },
  {
    id: "crm",
    title: "CRM",
    description:
      "Maintain a centralized database of customer information, track interactions, and manage sales pipelines to enhance customer relationships and boost sales effectiveness.",
    color: "blue",
    Icon: ClipboardList,
  },
  {
    id: "contacts",
    title: "Contacts",
    description:
      "Store and organize contact information for customers, vendors, and other stakeholders to facilitate communication and collaboration.",
    color: "yellow",
    Icon: ContactIcon,
  },
  {
    id: "planning",
    title: "Planning",
    description:
      "Collaborate on strategic planning, set goals, allocate resources, and track progress towards objectives to drive organizational growth and success.",
    color: "blue",
    Icon: MapPin,
  },
  {
    id: "manufacturing",
    title: "Manufacturing",
    description:
      "Manage production processes, track work orders, and optimize resource allocation to maximize manufacturing efficiency and product quality.",
    color: "yellow",
    Icon: Truck,
  },
  {
    id: "logistics",
    title: "Logistics",
    description:
      "Coordinate transportation, manage delivery schedules, and track shipment statuses to ensure timely and cost-effective logistics operations.",
    color: "blue",
    Icon: LogisticsIcon,
  },
  {
    id: "reports",
    title: "Reports",
    description:
      "Generate customizable reports, analyze key performance metrics, and gain actionable insights to support data-driven decision-making and business optimization.",
    color: "green",
    Icon: BarChart2,
  },
  {
    id: "settings",
    title: "Settings",
    description:
      "Configure system preferences, manage user permissions, and customize application settings to align with organizational requirements and user preferences.",
    color: "blue",
    Icon: SettingsIcon,
  },
  {
    id: "apps",
    title: "Apps",
    description:
      "Explore additional applications and integrations to extend the functionality of the Fastra suite and address specific business needs and requirements.",
    color: "green",
    Icon: AppIcon,
  },
];

const colorMap: Record<
  string,
  { bg: string; ring: string; text: string; border: string }
> = {
  green: {
    bg: "bg-green-50",
    ring: "focus:ring-green-300",
    text: "text-green-600",
    border: "border-green-200",
  },
  blue: {
    bg: "bg-blue-50",
    ring: "focus:ring-blue-300",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  yellow: {
    bg: "bg-amber-50",
    ring: "focus:ring-amber-300",
    text: "text-amber-400",
    border: "border-amber-200",
  },
  purple: {
    bg: "bg-violet-50",
    ring: "focus:ring-violet-300",
    text: "text-violet-600",
    border: "border-violet-200",
  },
  teal: {
    bg: "bg-teal-50",
    ring: "focus:ring-teal-300",
    text: "text-teal-600",
    border: "border-teal-200",
  },
};

function ModuleCard({ module }: { module: Module }): ReactElement {
  const palette = colorMap[module.color] ?? colorMap.blue;
  const Icon = module.Icon;

  const getRoute = (id: string): string | null => {
    const routeMap: Record<string, string> = {
      invoice: "/invoice",
      purchase: "/purchase",
      sales: "/sales",
      finance: "/finance",
      inventory: "/inventory",
      hr: "/hr",
      logistics: "/logistics",
      contacts: "/contact",
      settings: "/settings",
      apps: "/app",
    };
    return routeMap[id] || null;
  };

  const route = getRoute(module.id);

  return (
    <Link href={route || "/"}>
      <Card
        className={`h-full p-4 group border shadow-none ${palette.border} hover:shadow-lg transition-transform transform-gpu hover:-translate-y-1 focus-within:scale-[1.01] focus-within:shadow-lg flex flex-col cursor-pointer`}
      >
        <div
          className={`w-12 h-12 shrink-0  rounded-lg flex items-center justify-center ${palette.text}`}
          aria-hidden="true"
        >
          <Icon className="w-10 h-10" />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            id={`module-title-${module.id}`}
            className={`text-lg font-semibold ${palette.text} leading-tight`}
          >
            {module.title}
          </h3>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed line-clamp-4">
            {module.description}
          </p>
        </div>
      </Card>
    </Link>
  );
}

export default function DashboardPage(): ReactElement {
  console.log("hello");
  // Get logged-in user from Redux store
  const loggedInUser = useSelector(
    (state: RootState) => state.auth.user_accesses
  );
  console.log(loggedInUser);
  return (
    <div className="min-h-screen text-slate-900">
      <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30 mb-4">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Home</h1>
            </div>

            <nav
              className="flex items-center gap-4"
              aria-label="Top navigation"
            >
              <button
                className="p-2 rounded-md hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-slate-700" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-3 rounded-full p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                    aria-label="User menu"
                  >
                    <Avatar>
                      <div className="h-8 w-8 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 font-medium">
                        AD
                      </div>
                    </Avatar>
                    <span className="hidden sm:inline-block text-sm">
                      Administrator
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </div>
      </header>

      <main className="py-8 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <section aria-labelledby="dashboard-heading" className="mb-8">
            {/* Grid */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              role="list"
              aria-label="Dashboard modules"
            >
              {MODULES.map((m) => (
                <div key={m.id} role="listitem">
                  <ModuleCard module={m} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
