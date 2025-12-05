"use client";

import React, { useState } from "react";
import { Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkBadge04Icon,
  CloudUploadIcon,
  CursorLoading02Icon,
  LicenseDraftIcon,
  UnhappyIcon,
} from "@hugeicons/core-free-icons";
import { IoGrid } from "react-icons/io5";
import { PiListLight } from "react-icons/pi";

// Types
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: "blue" | "green" | "yellow" | "red";
}

interface IncomingProduct {
  id: string;
  partner: string;
  source: string;
  destination: string;
  date: string;
  status: "validated" | "draft" | "canceled" | "rejected" | "pending";
}

type ViewMode = "grid" | "list";

// Stat Card Component
const StatCard: React.FC<StatCardProps> = ({ icon, label, count, color }) => {
  const colorClasses = {
    blue: "text-[#3B7CED] bg-blue-50",
    green: "text-[#2BA24D] bg-green-50",
    yellow: "text-[#F0B401] bg-yellow-50",
    red: "text-[#E43D2B] bg-red-50",
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]} `}>{icon}</div>
        <span
          className={`text-sm font-medium ${
            colorClasses[color].split(" ")[0]
          } bg-none`}
        >
          {label}
        </span>
      </div>
      <div
        className={`text-3xl font-bold ${colorClasses[color].split(" ")[0]}`}
      >
        {count}
      </div>
    </Card>
  );
};

// Main Component
const InventoryOperationsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const stats: StatCardProps[] = [
    {
      icon: <HugeiconsIcon icon={LicenseDraftIcon} />,
      label: "Pending Incoming Product",
      count: 12,
      color: "blue",
    },
    {
      icon: <HugeiconsIcon icon={CheckmarkBadge04Icon} />,
      label: "Pending Deliver Orders",
      count: 12,
      color: "green",
    },
    {
      icon: <HugeiconsIcon icon={CursorLoading02Icon} />,
      label: "Pending Internal Transfer",
      count: 12,
      color: "yellow",
    },
    {
      icon: <HugeiconsIcon icon={UnhappyIcon} />,
      label: "Pending Returns",
      count: 12,
      color: "red",
    },
    {
      icon: <HugeiconsIcon icon={UnhappyIcon} />,
      label: "Pending Manufacturing Returns",
      count: 12,
      color: "red",
    },
  ];

  const incomingProducts: IncomingProduct[] = [
    {
      id: "LAGIN0001",
      partner: "Supplier",
      source: "Source Location",
      destination: "Destination Location",
      date: "4 Apr 2024 - 4:48 PM",
      status: "validated",
    },
    {
      id: "LAGIN0001",
      partner: "Customer",
      source: "Source Location",
      destination: "Destination Location",
      date: "4 Apr 2024 - 4:48 PM",
      status: "draft",
    },
    {
      id: "LAGIN0001",
      partner: "Supplier",
      source: "Source Location",
      destination: "Destination Location",
      date: "4 Apr 2024 - 4:48 PM",
      status: "canceled",
    },
    {
      id: "LAGIN0001",
      partner: "Customer",
      source: "Source Location",
      destination: "Destination Location",
      date: "4 Apr 2024 - 4:48 PM",
      status: "validated",
    },
    {
      id: "LAGIN0001",
      partner: "Supplier",
      source: "Source Location",
      destination: "Destination Location",
      date: "4 Apr 2024 - 4:48 PM",
      status: "draft",
    },
  ];

  const filteredProducts = incomingProducts.filter(
    (product) =>
      product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.partner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Placeholder */}
      <div className="hidden lg:block w-16 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="h-full flex flex-col items-center py-4 gap-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg"></div>
          <div className="flex flex-col gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-8 h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900">
                Home
              </a>
              <span>{`>`}</span>
              <a href="#" className="hover:text-gray-900">
                Inventory
              </a>
              <span>{`>`}</span>
              <span className="text-gray-900 font-medium">Operation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 ">
              <span>Autosaved</span>
              <HugeiconsIcon
                icon={CloudUploadIcon}
                className="bg-gray-50 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Incoming Products Section */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Incoming Product
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 md:flex-initial">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <Input
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full md:w-64"
                    />
                  </div>
                  <Button>New Incoming Product</Button>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                    >
                      <IoGrid />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                    >
                      <PiListLight />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* List View */}
            {viewMode === "list" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <Checkbox />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Partner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destination Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <Checkbox />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {product.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {product.partner}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {product.source}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {product.destination}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {product.date}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={product.status as any}
                            className="capitalize"
                          >
                            {product.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-6">
                {filteredProducts.map((product, index) => (
                  <Card
                    key={index}
                    className="p-4 hover:shadow-lg transition-shadow"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.id}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{product.date}</p>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-500">Source Location</p>
                      <p className="text-sm font-medium text-gray-700">
                        {product.partner}
                      </p>
                    </div>
                    <Badge
                      variant={product.status as any}
                      className="capitalize"
                    >
                      {product.status}
                    </Badge>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InventoryOperationsPage;
