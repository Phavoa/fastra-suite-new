import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";
import React from "react";

export default function InventoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              //   onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
            <nav className="hidden md:flex items-center gap-6">
              <a
                href="#"
                className="text-blue-600 font-medium border-b-2 border-blue-600 pb-3"
              >
                Operations
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 pb-3">
                Stock
              </a>
              <a
                href="/inventory/locations"
                className="text-gray-600 hover:text-gray-900 pb-3"
              >
                Location
              </a>
              <a
                href="/inventory/configuration"
                className="text-gray-600 hover:text-gray-900 pb-3"
              >
                Configuration
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">A</span>
              </div>
              <span className="hidden md:block text-sm font-medium">
                Administrator
              </span>
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
