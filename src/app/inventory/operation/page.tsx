"use client";

import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BreadcrumbItem } from "@/types/purchase";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import { ViewToggle } from "@/components/inventory/location/ViewToggle";
import { ViewType } from "@/types/purchase";
import { IncomingProductCards } from "@/components/inventory/operation/IncomingProductCards";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetIncomingProductsQuery } from "@/api/inventory/incomingProductApi";
import { useGetActiveDeliveryOrdersQuery } from "@/api/inventory/deliveryOrderApi";
import { useGetActiveDeliveryOrderReturnsQuery } from "@/api/inventory/deliveryOrderReturnApi";
import { useGetActiveInternalTransfersQuery } from "@/api/inventory/internalTransferApi";
import type { RootState } from "@/lib/store/store";
import { Card } from "@/components/ui/card";
import {
  PackageIcon,
  TruckIcon,
  ArrowRightLeftIcon,
  RotateCcwIcon,
} from "lucide-react";
import type { IncomingProduct } from "@/types/incomingProduct";

// StatusCards component for operation overview
function StatusCards() {
  // Get counts from all APIs
  const { data: incomingProducts = [] } = useGetIncomingProductsQuery({});
  const { data: deliveryOrders = [] } = useGetActiveDeliveryOrdersQuery();
  const { data: deliveryOrderReturns = [] } =
    useGetActiveDeliveryOrderReturnsQuery();
  const { data: internalTransfers = [] } = useGetActiveInternalTransfersQuery();

  const counts = useMemo(() => {
    return {
      incomingProducts: incomingProducts.length,
      deliveryOrders: deliveryOrders.length,
      internalTransfers: internalTransfers.length,
      deliveryOrderReturns: deliveryOrderReturns.length,
    };
  }, [
    incomingProducts,
    deliveryOrders,
    internalTransfers,
    deliveryOrderReturns,
  ]);

  const card = (
    label: string,
    value: number,
    icon: React.ReactNode,
    colorClass = "text-gray-700",
    linkHref?: string
  ) => (
    <Link href={linkHref || "#"}>
      <Card className="p-4 rounded-none shadow-none cursor-pointer hover:bg-gray-50 transition-colors border border-b-0 border-t-0 border-l-0 border-r">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-lg">{icon}</div>
            <div className={`text-sm font-medium ${colorClass}`}>{label}</div>
          </div>
          <div className={`text-[2rem] font-bold ${colorClass}`}>{value}</div>
        </div>
      </Card>
    </Link>
  );

  return (
    <section className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {card(
          "Incoming Products",
          counts.incomingProducts,
          <PackageIcon color="#3B7CED" />,
          "text-[#3B7CED]",
          "/inventory/operation"
        )}
        {card(
          "Delivery Orders",
          counts.deliveryOrders,
          <TruckIcon color="#2BA24D" />,
          "text-[#2BA24D]",
          "/inventory/operation/delivery_order"
        )}
        {card(
          "Internal Transfers",
          counts.internalTransfers,
          <ArrowRightLeftIcon color="#F0B401" />,
          "text-[#F0B401]"
        )}
        {card(
          "Delivery Order Returns",
          counts.deliveryOrderReturns,
          <RotateCcwIcon color="#E43D2B" />,
          "text-[#E43D2B]"
        )}
      </div>
    </section>
  );
}

export default function OperationPage() {
  const [query, setQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>("list");

  // Get logged-in user from Redux store
  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  // Use the API query hook for incoming products
  const {
    data: allIncomingProducts = [],
    isLoading,
    isError,
    error,
  } = useGetIncomingProductsQuery({});

  // Filter incoming products based on search query
  const incomingProducts = useMemo(() => {
    if (!query) return allIncomingProducts;

    const lowerQuery = query.toLowerCase();
    return allIncomingProducts.filter((item) => {
      return (
        item.incoming_product_id.toLowerCase().includes(lowerQuery) ||
        item.receipt_type.toLowerCase().includes(lowerQuery) ||
        item.status.toLowerCase().includes(lowerQuery) ||
        item.supplier_details?.company_name
          ?.toLowerCase()
          .includes(lowerQuery) ||
        item.source_location_details?.location_name
          ?.toLowerCase()
          .includes(lowerQuery) ||
        item.destination_location_details?.location_name
          ?.toLowerCase()
          .includes(lowerQuery) ||
        item.related_po?.toLowerCase().includes(lowerQuery)
      );
    });
  }, [allIncomingProducts, query]);

  // Function to highlight search matches
  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 text-yellow-800 font-medium">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(
        incomingProducts.map((item) => item.incoming_product_id)
      );
    } else {
      setSelectedItems([]);
    }
  };

  const breadcrumsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    {
      label: "Operation",
      href: "/inventory/operation",
      current: true,
    },
  ];

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, id]);
    } else {
      setSelectedItems((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  // Show loading state
  if (isLoading) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading incoming products...</p>
        </div>
      </main>
    );
  }

  // Show error state
  if (isError) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading incoming products</p>
          <p className="text-sm mt-2">{error?.toString()}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-gray-800 mr-4">
      <Breadcrumbs
        items={breadcrumsItem}
        action={
          <Button
            variant="ghost"
            className="text-sm text-gray-400 flex items-center gap-2 hover:text-[#3B7CED] transition-colors duration-200"
          >
            Autosaved <AutoSaveIcon />
          </Button>
        }
      />

      <div className="bg-white rounded-md shadow hover:shadow-lg transition-shadow duration-300 p-6 pb-4 mt-4">
        <StatusCards />
      </div>

      <div className="bg-white p-6 rounded-md flex flex-col lg:flex-row items-start md:items-start justify-between gap-4 mt-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg text-nowrap font-medium">Incoming Products</h2>

          <div className="relative w-xs">
            <Input
              type="text"
              className="w-full pl-10 pr-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search incoming products"
            />
            <SearchIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>
        </div>
        <div className="flex space-x-4">
          <Link href="/inventory/operation/incoming_product/new">
            <Button variant="contained" className="px-4 py-2 cursor-pointer">
              New Incoming Product
            </Button>
          </Link>
          <ViewToggle
            currentView={currentView}
            onViewChange={handleViewChange}
          />
        </div>
      </div>

      {/* Conditional rendering based on current view */}
      {currentView === "list" ? (
        <div className="bg-white rounded-md shadow mt-6 overflow-hidden">
          <Table>
            <TableHeader className="bg-[#F6F7F8]">
              <TableRow>
                <TableHead className="w-12 px-4 py-3">
                  <Checkbox
                    checked={
                      selectedItems.length === incomingProducts.length &&
                      incomingProducts.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-sm text-gray-600 font-medium">
                  Request ID
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-sm text-gray-600 font-medium">
                  Receipt Type
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-sm text-gray-600 font-medium">
                  Source Location
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-sm text-gray-600 font-medium">
                  Destination Location
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-sm text-gray-600 font-medium">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomingProducts.map((item: IncomingProduct) => (
                <TableRow
                  key={item.incoming_product_id}
                  className="hover:bg-gray-50"
                >
                  <TableCell className="px-4 py-3">
                    <Checkbox
                      checked={selectedItems.includes(item.incoming_product_id)}
                      onCheckedChange={(checked) =>
                        handleSelectItem(
                          item.incoming_product_id,
                          checked as boolean
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-900">
                    <Link
                      href={`/inventory/operation/incoming_product/${item.incoming_product_id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {highlightText(item.incoming_product_id, query)}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-900 capitalize">
                    {highlightText(item.receipt_type.replace("_", " "), query)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-900">
                    {highlightText(
                      item.source_location_details?.location_name || "N/A",
                      query
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-900">
                    {highlightText(
                      item.destination_location_details?.location_name || "N/A",
                      query
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        item.status === "validated"
                          ? "bg-green-100 text-green-500"
                          : item.status === "draft"
                          ? "bg-blue-100 text-blue-500"
                          : item.status === "canceled"
                          ? "bg-red-100 text-red-500"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <IncomingProductCards
          incomingProducts={incomingProducts}
          query={query}
        />
      )}
    </main>
  );
}
