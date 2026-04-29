"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
} from "@/components/shared/AnimatedWrapper";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { StatusPill } from "@/components/purchase/purchaseRequest/StatusPill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";

// Mock Detailed Data
const MOCK_DETAILS: Record<string, any> = {
  "MCR-00045": {
    id: "MCR-00045",
    project: "Project Alpha - Mall Construction",
    wbs: "Foundation / Concrete",
    costCode: "Materials (CC-02)",
    requester: "John Site-Lead",
    dateCreated: "29 Apr 2026, 09:15 AM",
    dateUpdated: "29 Apr 2026, 09:20 AM",
    currency: "Naira (₦)",
    location: "Main Site Store",
    purpose: "Urgent foundation pour for Phase 1",
    status: "pending",
    budgetedAmount: 500000,
    requestedAmount: 750000,
    variance: 250000,
    items: [
      {
        product: "Cement (50kg)",
        description: "Portland Cement",
        qty: 100,
        unit: "Bags",
        price: 4500,
        total: 450000,
      },
      {
        product: "Steel Rods (12mm)",
        description: "High Tensile Steel",
        qty: 35,
        unit: "Lengths",
        price: 8571,
        total: 300000,
      },
    ],
  },
};

export default function OverrunDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const statusModal = useStatusModal();
  const requestId = params.id as string;
  const data = MOCK_DETAILS[requestId] || MOCK_DETAILS["MCR-00045"]; // Fallback for demo

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Project Costing", href: "/project-costing" },
    { label: "Overrun Queue", href: "/project-costing/overrun-queue" },
    {
      label: requestId,
      href: `/project-costing/overrun-queue/${requestId}`,
      current: true,
    },
  ];

  const handleAction = (action: "approve" | "reject") => {
    if (action === "approve") {
      statusModal.showSuccess(
        "Overrun Approved",
        `Request ${requestId} has been manually approved. Budget variance of ₦${data.variance.toLocaleString()} has been logged in the Costing Engine.`,
      );
    } else {
      statusModal.showError(
        "Request Rejected",
        `Request ${requestId} has been rejected. Submitter has been notified to adjust the quantities.`,
      );
    }
  };

  const handleModalClose = () => {
    statusModal.close();
    router.push("/project-costing/overrun-queue");
  };

  return (
    <FadeIn className="h-full text-gray-900 font-sans antialiased pr-4 bg-[#F9FAFB]">
      <PageHeader items={breadcrumbs} title="Overrun Request Details" />

      <div className="h-full mx-auto px-6 py-8 bg-white min-h-screen">
        <FadeIn delay={0.2}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-lg font-medium text-blue-500">
              Basic Information
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] sm:text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                BUDGET OVERRUN
              </span>
              <StatusPill status={data.status} />
            </div>
          </div>
        </FadeIn>

        <div className="flex items-start gap-8">
          <div className="flex-1">
            {/* Row 1 - Matching Purchase Details Divider Style */}
            <SlideUp delay={0.4}>
              <div className="py-4 border-b border-gray-200">
                <StaggerContainer
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4"
                  staggerDelay={0.15}
                >
                  <FadeIn>
                    <div className="p-4 transition-colors sm:border-r border-gray-300 h-full border-b sm:border-b-0">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Request ID
                      </h3>
                      <p className="text-gray-700 font-bold">{data.id}</p>
                    </div>
                  </FadeIn>
                  <FadeIn>
                    <div className="p-4 transition-colors sm:border-r border-gray-300 h-full border-b sm:border-b-0">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Date Created
                      </h3>
                      <p className="text-gray-700">{data.dateCreated}</p>
                    </div>
                  </FadeIn>
                  <FadeIn>
                    <div className="p-4 transition-colors sm:border-r border-gray-300 h-full">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Project
                      </h3>
                      <p className="text-gray-700">{data.project}</p>
                    </div>
                  </FadeIn>
                </StaggerContainer>
              </div>
            </SlideUp>

            {/* Row 2 */}
            <SlideUp delay={0.6}>
              <div className="py-4 border-b border-gray-200">
                <StaggerContainer
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4"
                  staggerDelay={0.15}
                >
                  <FadeIn>
                    <div className="p-4 transition-colors sm:border-r border-gray-300 h-full border-b sm:border-b-0">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        WBS Element
                      </h3>
                      <p className="text-gray-700">{data.wbs}</p>
                    </div>
                  </FadeIn>
                  <FadeIn>
                    <div className="p-4 transition-colors sm:border-r border-gray-300 h-full border-b sm:border-b-0">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Cost Code
                      </h3>
                      <p className="text-gray-700">{data.costCode}</p>
                    </div>
                  </FadeIn>
                  <FadeIn>
                    <div className="p-4 transition-colors sm:border-r border-gray-300 h-full">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Location
                      </h3>
                      <p className="text-gray-700">{data.location}</p>
                    </div>
                  </FadeIn>
                </StaggerContainer>
              </div>
            </SlideUp>

            {/* Row 3 - Financial Summary (The "Overrun" specific part) */}
            <SlideUp delay={0.8}>
              <div className="py-4 border-b border-gray-200 bg-red-50/30">
                <StaggerContainer
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4"
                  staggerDelay={0.15}
                >
                  <FadeIn>
                    <div className="p-4 transition-colors sm:border-r border-gray-300 h-full border-b sm:border-b-0">
                      <h3 className="text-base font-semibold text-gray-500 mb-2">
                        Budgeted Amt
                      </h3>
                      <p className="text-lg font-bold text-gray-700">
                        ₦{data.budgetedAmount.toLocaleString()}
                      </p>
                    </div>
                  </FadeIn>
                  <FadeIn>
                    <div className="p-4 transition-colors sm:border-r border-gray-300 h-full border-b sm:border-b-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-2">
                        Requested Amt
                      </h3>
                      <p className="text-lg font-bold text-gray-900">
                        ₦{data.requestedAmount.toLocaleString()}
                      </p>
                    </div>
                  </FadeIn>
                  <FadeIn>
                    <div className="p-4 transition-colors sm:border-r border-gray-300 h-full">
                      <h3 className="text-base font-semibold text-red-600 mb-2">
                        Variance (Overrun)
                      </h3>
                      <p className="text-xl font-black text-red-600">
                        ₦{data.variance.toLocaleString()}
                      </p>
                    </div>
                  </FadeIn>
                </StaggerContainer>
              </div>
            </SlideUp>
          </div>
        </div>

        {/* Product Table - Matching Purchase Style */}
        <div className="mt-12">
          <h3 className="text-lg font-medium text-blue-500 mb-4">
            Request Items
          </h3>
          <div className="border rounded-md overflow-hidden shadow-sm">
            <Table className="min-w-[700px] sm:min-w-[1000px]">
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead className="font-bold text-gray-600">
                    Product
                  </TableHead>
                  <TableHead className="font-bold text-gray-600">
                    Description
                  </TableHead>
                  <TableHead className="font-bold text-gray-600 text-center">
                    QTY
                  </TableHead>
                  <TableHead className="font-bold text-gray-600 text-right">
                    Unit Price
                  </TableHead>
                  <TableHead className="font-bold text-gray-600 text-right">
                    Total Price
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-gray-900">
                      {item.product}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.qty} {item.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      ₦{item.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₦{item.total.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Action Buttons at bottom - Perfect Replica of Purchase details buttons */}
        <div className="mt-12 pt-12 border-t border-gray-100">
          <SlideUp>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-4">
              <Button
                onClick={() => handleAction("approve")}
                className="text-white bg-[#2BA24D] hover:bg-[#248d40] border-[#2BA24D] px-8 h-12 rounded-lg font-bold w-full sm:w-auto"
              >
                Override & Approve
              </Button>
              <Button
                onClick={() => handleAction("reject")}
                variant="outline"
                className="text-[#E43D2B] border-[#E43D2B] hover:bg-[#E43D2B] hover:text-white px-8 h-12 rounded-lg font-bold w-full sm:w-auto"
              >
                Reject Request
              </Button>
            </div>
          </SlideUp>
        </div>
      </div>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={handleModalClose}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        actionText="Back to Queue"
        onAction={handleModalClose}
        showCloseButton={false}
      />
    </FadeIn>
  );
}
