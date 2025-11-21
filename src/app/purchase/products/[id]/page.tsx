"use client";

import { PageHeader } from "@/components/purchase/products";
import { BreadcrumbItem } from "@/types/purchase";
import {
  FadeIn,
  SlideUp,
  ScaleIn,
  StaggerContainer,
  AnimatedWrapper,
  Interactive,
} from "@/components/shared/AnimatedWrapper";
import Image from "next/image";
import React from "react";

interface FormData {
  name: string;
  description: string;
  available: number;
  totalPurchased: number;
  category: string;
  unit: string;
}

const items: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Purchase", href: "/purchase" },
  { label: "Products", href: "/purchase/products", current: true },
];

const formData: FormData = {
  name: "Premium Engine Oil",
  description:
    "High-performance synthetic engine oil suitable for modern vehicles.",
  available: 120,
  totalPurchased: 500,
  category: "Automotive",
  unit: "Liters",
};

const page = () => {
  return (
    <FadeIn className="h-full text-gray-900 font-sans antialiased pr-4">
      <PageHeader
        items={items}
        title="Product Details"
        isEdit={"/purchase/products/edit/12"}
      />

      <div className="h-full mx-auto px-6 py-8 bg-white">
        <FadeIn delay={0.2}>
          <h2 className="text-lg font-medium text-blue-500 mb-6">
            Basic Information
          </h2>
        </FadeIn>

        <div className="flex items-start gap-8">
          {/* Avatar with scale animation */}
          <ScaleIn delay={0.3} className="shrink-0">
            <Interactive effect="subtle">
              <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center shadow-sm">
                <Image
                  src="/vercel.svg"
                  alt="Product avatar"
                  className="w-24 h-24 object-cover rounded-full"
                  width={400}
                  height={400}
                />
              </div>
            </Interactive>
          </ScaleIn>

          {/* Content: rows with separators */}
          <div className="flex-1">
            {/* Row 1 (first 3 fields) */}
            <SlideUp delay={0.4}>
              <div className="py-4 border-b border-gray-200">
                <StaggerContainer
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4"
                  staggerDelay={0.15}
                >
                  {/* Product Name */}
                  <FadeIn>
                    <div className="p-4 transition-colors border-r border-gray-300">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Product Name
                      </h3>
                      <p className="text-gray-700">{formData.name || "N/A"}</p>
                    </div>
                  </FadeIn>

                  {/* Product Description */}
                  <FadeIn>
                    <div className="p-4 transition-colors border-r border-gray-300">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Product Description
                      </h3>
                      <p className="text-gray-700">
                        {formData.description || "N/A"}
                      </p>
                    </div>
                  </FadeIn>

                  {/* Available Product Quantity */}
                  <FadeIn>
                    <div className="p-4 transition-colors border-r border-gray-300">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Available Product Quantity
                      </h3>
                      <p className="text-gray-700">
                        {formData.available ?? "N/A"}
                      </p>
                    </div>
                  </FadeIn>
                </StaggerContainer>
              </div>
            </SlideUp>

            {/* Row 2 (next 3 fields) */}
            <SlideUp delay={0.6}>
              <div className="py-4 last:border-b-0 my-4">
                <StaggerContainer
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  staggerDelay={0.15}
                >
                  {/* Total Quantity Purchased */}
                  <FadeIn>
                    <div className="p-4 transition-colors border-r border-gray-300">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Total Quantity Purchased
                      </h3>
                      <p className="text-gray-700">
                        {formData.totalPurchased ?? "N/A"}
                      </p>
                    </div>
                  </FadeIn>

                  {/* Product Category */}
                  <FadeIn>
                    <div className="p-4 transition-colors border-r border-gray-300">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Product Category
                      </h3>
                      <p className="text-gray-700">
                        {formData.category || "N/A"}
                      </p>
                    </div>
                  </FadeIn>

                  {/* Unit of Measure */}
                  <FadeIn>
                    <div className="p-4 transition-colors border-r border-gray-300">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Unit of Measure
                      </h3>
                      <p className="text-gray-700">{formData.unit || "N/A"}</p>
                    </div>
                  </FadeIn>
                </StaggerContainer>
              </div>
            </SlideUp>
          </div>
        </div>

        {/* Additional animated action section */}
      </div>
    </FadeIn>
  );
};

export default page;
