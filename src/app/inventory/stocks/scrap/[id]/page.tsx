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
import { useGetScrapQuery } from "@/api/inventory/scrapApi";
import { useParams } from "next/navigation";
import { LoadingDots } from "@/components/shared/LoadingComponents";
import type { Scrap, ScrapItem } from "@/types/scrap";

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

// Scrap Items Table Component
interface ScrapItemsTableProps {
  items: ScrapItem[];
}

const ScrapItemsTable: React.FC<ScrapItemsTableProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <SlideUp delay={0.4}>
        <div className="mt-8">
          <h2 className="text-lg font-medium text-blue-500 mb-4">
            Scrap Items
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
                  Scrap Quantity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Adjusted Quantity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total Quantity
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
                    {item.scrap_quantity || "0"}
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
                    {item.product_details?.available_product_quantity || "0"}
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

const ScrapDetailPage: React.FC = () => {
  const params = useParams();
  const scrapId = params.id as string;

  const { data: scrap, isLoading, error } = useGetScrapQuery(scrapId);

  // Loading state
  if (isLoading) {
    return (
      <FadeIn className="h-full text-gray-900 font-sans antialiased pr-4">
        <div className="h-full mx-auto px-6 py-8 bg-white">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <LoadingDots />
              <p className="mt-4 text-gray-600">Loading scrap details...</p>
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
          "Unable to load scrap details"
        : "Unable to load scrap details";
    return (
      <FadeIn className="h-full text-gray-900 font-sans antialiased pr-4">
        <div className="h-full mx-auto px-6 py-8 bg-white">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-lg font-semibold mb-2">
                Error Loading Scrap
              </div>
              <p className="text-gray-600">{errorMessage}</p>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  // If no data
  if (!scrap) {
    return (
      <FadeIn className="h-full text-gray-900 font-sans antialiased pr-4">
        <div className="h-full mx-auto px-6 py-8 bg-white">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-500 text-lg font-semibold mb-2">
                Scrap Not Found
              </div>
              <p className="text-gray-600">
                The requested scrap could not be found.
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
    { label: "Scraps", href: "/inventory/stocks/scrap" },
    {
      label: scrap.id,
      href: `/inventory/stocks/scrap/${scrap.id}`,
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
        title="Scrap"
        isEdit={
          scrap.can_edit && scrap.status === "draft"
            ? `/inventory/stocks/scrap/edit/${scrap.id}`
            : undefined
        }
      />

      <div className="h-full mx-auto px-6 py-8 bg-white">
        {/* Header Section */}
        <FadeIn delay={0.2}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-blue-500">
              Scrap Information
            </h2>
            <StatusPill status={scrap.status} />
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
                  {/* Scrap ID */}
                  <FadeIn>
                    <div className="p-4 transition-colors border-r border-gray-300">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Scrap ID
                      </h3>
                      <p className="text-gray-700 font-mono">{scrap.id}</p>
                    </div>
                  </FadeIn>

                  {/* Adjustment Type */}
                  <FadeIn>
                    <div className="p-4 transition-colors border-r border-gray-300">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Adjustment Type
                      </h3>
                      <p className="text-gray-700">
                        {formatAdjustmentType(scrap.adjustment_type)}
                      </p>
                    </div>
                  </FadeIn>

                  {/* Status */}
                  <FadeIn>
                    <div className="p-4 transition-colors">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Status
                      </h3>
                      <p className="text-gray-700">
                        {scrap.status.charAt(0).toUpperCase() +
                          scrap.status.slice(1)}
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
                        {scrap.warehouse_location_details?.location_name ||
                          "N/A"}
                      </p>
                      {scrap.warehouse_location_details?.location_code && (
                        <p className="text-xs text-gray-500 mt-1">
                          Code: {scrap.warehouse_location_details.location_code}
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
                        {scrap.warehouse_location_details?.location_type ||
                          "N/A"}
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
                        {scrap.warehouse_location_details?.address || "N/A"}
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
                        {scrap.notes || "No notes provided."}
                      </p>
                    </div>
                  </FadeIn>
                </StaggerContainer>
              </div>
            </SlideUp>
          </div>
        </div>

        {/* Product Items Table */}
        <ScrapItemsTable items={scrap.scrap_items || []} />

        <div className="h-16"></div>
      </div>
    </FadeIn>
  );
};

export default ScrapDetailPage;
