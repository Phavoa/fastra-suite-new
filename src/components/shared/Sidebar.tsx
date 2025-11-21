"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MenuIcon,
  DashboardIcon,
  AccountIcon,
  PurchaseIcon,
  SalesIcon,
  FinanceIcon,
  InventoryIcon,
  HRIcon,
  LogisticsIcon,
  ContactIcon,
  AppIcon,
  SettingsIcon,
} from "./icons";

// Navigation items grouped into sections
const topItems = [{ id: "menu", icon: MenuIcon, label: "Menu", route: "/" }];

const middleItems = [
  { id: "dashboard", icon: DashboardIcon, label: "Dashboard", route: "/" },
  { id: "account", icon: AccountIcon, label: "Account", route: "/account" },
  { id: "purchase", icon: PurchaseIcon, label: "Purchase", route: "/purchase" },
  { id: "sales", icon: SalesIcon, label: "Sales", route: "/sales" },
  { id: "finance", icon: FinanceIcon, label: "Finance", route: "/finance" },
  {
    id: "inventory",
    icon: InventoryIcon,
    label: "Inventory",
    route: "/inventory",
  },
  { id: "hr", icon: HRIcon, label: "HR", route: "/hr" },
  {
    id: "logistics",
    icon: LogisticsIcon,
    label: "Logistics",
    route: "/logistics",
  },
  { id: "contact", icon: ContactIcon, label: "Contact", route: "/contact" },
];

const bottomItems = [
  { id: "app", icon: AppIcon, label: "App", route: "/app" },
  { id: "settings", icon: SettingsIcon, label: "Settings", route: "/settings" },
];

const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string>("dashboard");
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const router = useRouter();

  const handleNavigation = (item: (typeof topItems)[0]) => {
    setActiveItem(item.id);
    router.push(item.route);
  };

  const handleMouseEnter = (
    event: React.MouseEvent<HTMLButtonElement>,
    label: string
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      text: label,
      x: rect.right + 10,
      y: rect.top + rect.height / 2,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <nav
      className="fixed top-0 left-0 h-screen w-16 bg-white shadow-xs border-r border-gray-100 flex flex-col items-center py-4 z-10 overflow-y-auto scrollbar-hide"
      aria-label="Main navigation"
    >
      {/* Top section: Menu */}
      <div className="mb-8">
        {topItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              onMouseEnter={(e) => handleMouseEnter(e, item.label)}
              onMouseLeave={handleMouseLeave}
              className={`w-11 h-11 flex items-center justify-center mb-6 rounded-lg transition-colors duration-300 ease-in-out ${
                isActive
                  ? "text-[#3B7CED] bg-[#3B7CED]/10"
                  : "text-[#B8B8B8] hover:text-[#3B7CED] hover:bg-[#3B7CED]/5"
              }`}
              aria-label={item.label}
            >
              <IconComponent color={isActive ? "#3B7CED" : undefined} />
            </button>
          );
        })}
      </div>

      {/* Middle section: Main options */}
      <div className="flex-1 flex flex-col items-center">
        {middleItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              onMouseEnter={(e) => handleMouseEnter(e, item.label)}
              onMouseLeave={handleMouseLeave}
              className={`w-11 h-11 flex items-center justify-center mb-6 rounded-lg transition-colors duration-300 ease-in-out ${
                isActive
                  ? "text-[#3B7CED] bg-[#3B7CED]/10"
                  : "text-[#B8B8B8] hover:text-[#3B7CED] hover:bg-[#3B7CED]/5"
              }`}
              aria-label={item.label}
            >
              <IconComponent color={isActive ? "#3B7CED" : undefined} />
            </button>
          );
        })}
      </div>

      {/* Bottom section: App and Settings */}
      <div className="mt-50">
        {bottomItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              onMouseEnter={(e) => handleMouseEnter(e, item.label)}
              onMouseLeave={handleMouseLeave}
              className={`w-11 h-11 flex items-center justify-center mb-6 rounded-lg transition-colors duration-300 ease-in-out ${
                isActive
                  ? "text-[#3B7CED] bg-[#3B7CED]/10"
                  : "text-[#B8B8B8] hover:text-[#3B7CED] hover:bg-[#3B7CED]/5"
              }`}
              aria-label={item.label}
            >
              <IconComponent color={isActive ? "#3B7CED" : undefined} />
            </button>
          );
        })}
      </div>

      {/* Custom Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 bg-gray-800 text-white text-sm rounded-md shadow-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 20,
            transform: "translateY(-50%)",
          }}
        >
          {tooltip.text}
          <div
            className="absolute w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"
            style={{
              left: "-8px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          ></div>
        </div>
      )}
    </nav>
  );
};

export default Sidebar;
