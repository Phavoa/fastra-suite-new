"use client";

import { PageHeader } from "@/components/purchase/products";
import { BreadcrumbItem } from "@/types/purchase";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
} from "@/components/shared/AnimatedWrapper";
import React from "react";
import { StatusPill } from "@/components/inventory/stocks/StatusPill";
import { useGetStockAdjustmentQuery } from "@/api/inventory/stockAdjustmentApi";
import { useParams } from "next/navigation";
import { LoadingDots } from "@/components/shared/LoadingComponents";
import type {
  StockAdjustment,
  StockAdjustmentItem,
} from "@/types/stockAdjustment";

// Format date to "DD MMM YYYY - HH:mm AM/PM" format
const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";

  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleDateString("en-GB", { month: "short" });
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const formattedHours = hours.toString().padStart(2, "0");

  return `${day} ${month} ${year} - ${formattedHours}:${minutes} ${ampm}`;
};

// Product Items Table Component
interface ProductItemsTableProps {
  items: StockAdjustmentItem[];
}

const ProductItemsTable: React.FC<ProductItemsTableProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <SlideUp delay={0.4}>
        <div className="mt-8">
          <h2 className="text-lg font-medium text-blue-500 mb-4">
            Adjusted Products
          </h2>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">No products in this adjustment.</p>
          </div>
        </div>
      </SlideUp>
    );
  }

  return (
    <SlideUp delay={0.4}>
      <div className="mt-8">
        <h2 className="text-lg font-medium text-blue-500 mb-4">
          Adjusted Products
        </h2>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Product Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Unit of Measure
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Current Qty
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Adjusted Qty
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Effective Qty
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.product_details?.product_name || "Unknown Product"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.product_details?.product_description || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.product_details?.product_category || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.product_details?.unit_of_measure_details?.unit_name ||
                      item.unit_of_measure ||
                      "N/A"}
                    {item.product_details?.unit_of_measure_details
                      ?.unit_symbol && (
                      <span className="text-gray-400 ml-1">
                        (
                        {
                          item.product_details.unit_of_measure_details
                            .unit_symbol
                        }
                        )
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                    {item.current_quantity || "0"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span
                      className={`text-sm font-medium ${
                        parseFloat(item.adjusted_quantity || "0") >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {parseFloat(item.adjusted_quantity || "0") >= 0
                        ? "+"
                        : ""}
                      {item.adjusted_quantity || "0"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                    {item.effective_quantity || "0"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SlideUp>
  );
};

const StockAdjustmentDetailPage: React.FC = () => {
  const params = useParams();
  const adjustmentId = params.id as string;

  const {
    data: stockAdjustment,
    isLoading,
    error,
  } = useGetStockAdjustmentQuery(adjustmentId);

  // Loading state
  if (isLoading) {
    return (
      <FadeIn className="h-full text-gray-900 font-sans antialiased pr-4">
        <div className="h-full mx-auto px-6 py-8 bg-white">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <LoadingDots />
              <p className="mt-4 text-gray-600">
                Loading stock adjustment details...
              </p>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  // Error state
  if (error) {
    const errorMessage =
      "data" in error
        ? (error.data as { detail?: string; message?: string })?.detail ||
          (error.data as { detail?: string; message?: string })?.message ||
          "Unable to load stock adjustment details"
        : "Unable to load stock adjustment details";
    return (
      <FadeIn className="h-full text-gray-900 font-sans antialiased pr-4">
        <div className="h-full mx-auto px-6 py-8 bg-white">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-lg font-semibold mb-2">
                Error Loading Stock Adjustment
              </div>
              <p className="text-gray-600">{errorMessage}</p>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  // If no data
  if (!stockAdjustment) {
    return (
      <FadeIn className="h-full text-gray-900 font-sans antialiased pr-4">
        <div className="h-full mx-auto px-6 py-8 bg-white">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-500 text-lg font-semibold mb-2">
                Stock Adjustment Not Found
              </div>
              <p className="text-gray-600">
                The requested stock adjustment could not be found.
              </p>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Stock Adjustments", href: "/inventory/stocks/adjustment" },
    {
      label: stockAdjustment.id,
      href: `/inventory/stocks/adjustment/${stockAdjustment.id}`,
      current: true,
    },
  ];

  // Format adjustment type for display
  const formatAdjustmentType = (type: string): string => {
    if (!type) return "N/A";
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <FadeIn className="h-full text-gray-900 font-sans antialiased pr-4">
      <PageHeader
        items={breadcrumbItems}
        title="Stock Adjustment"
        isEdit={
          stockAdjustment.can_edit && stockAdjustment.status === "draft"
            ? `/inventory/stocks/adjustment/edit/${stockAdjustment.id}`
            : undefined
        }
      />

      <div className="h-full mx-auto px-6 py-8 bg-white">
        {/* Header Section */}
        <FadeIn delay={0.2}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-blue-500">
              Adjustment Information
            </h2>
            <StatusPill status={stockAdjustment.status} />
          </div>
        </FadeIn>

        {/* Basic Information Grid */}
        <div className="flex items-start gap-8">
          <div className="flex-1">
            {/* Row 1 */}
            <SlideUp delay={0.3}>
              <div className="py-4 border-b border-gray-200">
                <StaggerContainer
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4"
                  staggerDelay={0.15}
                >
                  {/* Adjustment ID */}
                  <FadeIn>
                    <div className="p-4 transition-colors border-r border-gray-300">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Adjustment ID
                      </h3>
                      <p className="text-gray-700 font-mono">
                        {stockAdjustment.id}
                      </p>
                    </div>
                  </FadeIn>

                  {/* Adjustment Type */}
                  <FadeIn>
                    <div className="p-4 transition-colors border-r border-gray-300">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Adjustment Type
                      </h3>
                      <p className="text-gray-700">
                        {formatAdjustmentType(stockAdjustment.adjustment_type)}
                      </p>
                    </div>
                  </FadeIn>

                  {/* Date/Time */}
                  <FadeIn>
                    <div className="p-4 transition-colors">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Date & Time
                      </h3>
                      <p className="text-gray-700">
                        {formatDateTime(
                          stockAdjustment.url
                            ?.split("/")
                            .includes("date_created")
                            ? undefined
                            : new Date().toISOString()
                        )}
                      </p>
                    </div>
                  </FadeIn>
                </StaggerContainer>
              </div>
            </SlideUp>

            {/* Row 2 */}
            <SlideUp delay={0.4}>
              <div className="py-4 border-b border-gray-200">
                <StaggerContainer
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  staggerDelay={0.15}
                >
                  {/* Location */}
                  <FadeIn>
                    <div className="p-4 transition-colors border-r border-gray-300">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Location
                      </h3>
                      <p className="text-gray-700">
                        {stockAdjustment.warehouse_location_details
                          ?.location_name || "N/A"}
                      </p>
                      {stockAdjustment.warehouse_location_details
                        ?.location_code && (
                        <p className="text-xs text-gray-500 mt-1">
                          Code:{" "}
                          {
                            stockAdjustment.warehouse_location_details
                              .location_code
                          }
                        </p>
                      )}
                    </div>
                  </FadeIn>

                  {/* Location Type */}
                  <FadeIn>
                    <div className="p-4 transition-colors border-r border-gray-300">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Location Type
                      </h3>
                      <p className="text-gray-700">
                        {stockAdjustment.warehouse_location_details
                          ?.location_type || "N/A"}
                      </p>
                    </div>
                  </FadeIn>

                  {/* Location Address */}
                  <FadeIn>
                    <div className="p-4 transition-colors">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Address
                      </h3>
                      <p className="text-gray-700">
                        {stockAdjustment.warehouse_location_details?.address ||
                          "N/A"}
                      </p>
                    </div>
                  </FadeIn>
                </StaggerContainer>
              </div>
            </SlideUp>

            {/* Row 3 - Notes */}
            <SlideUp delay={0.5}>
              <div className="py-4">
                <StaggerContainer
                  className="grid grid-cols-1 gap-6"
                  staggerDelay={0.15}
                >
                  <FadeIn>
                    <div className="p-4 transition-colors">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Notes
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {stockAdjustment.notes || "No notes provided."}
                      </p>
                    </div>
                  </FadeIn>
                </StaggerContainer>
              </div>
            </SlideUp>
          </div>
        </div>

        {/* Product Items Table */}
        <ProductItemsTable
          items={stockAdjustment.stock_adjustment_items || []}
        />

        <div className="h-16"></div>
      </div>
    </FadeIn>
  );
};

export default StockAdjustmentDetailPage;
