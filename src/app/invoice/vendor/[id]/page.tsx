"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit2 } from "lucide-react";
import { UpdateBankDetailsModal } from "@/components/invoice/vendor/UpdateBankDetailsModal";
import { useGetVendorByIdQuery } from "@/api/invoice/vendorsApi";

export default function VendorInfoPage() {
  const router = useRouter();
  const params = useParams();
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  const vendorIdStr = (params?.id as string) || "";
  const vendorId = parseInt(vendorIdStr, 10);

  const { data: vendor, isLoading, isError } = useGetVendorByIdQuery(vendorId, {
    skip: isNaN(vendorId),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Vendor Info</h1>
        </div>
        {!isLoading && vendor && (
          <button
            onClick={() => router.push(`/invoice/vendor/edit/${vendorIdStr}`)}
            className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Vendor
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
          Loading vendor details...
        </div>
      ) : isError || !vendor ? (
        <div className="p-12 text-center text-red-500 bg-white rounded-2xl border border-gray-100">
          Failed to load vendor.
        </div>
      ) : (
        <>
          {/* Vendor Header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">
              {vendor.vendor_name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{vendor.vendor_code}</p>

            {/* Info Grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
              <div>
                <p className="text-sm text-gray-500">Contact Name</p>
                <p className="mt-1 font-medium text-gray-900">
                  {vendor.contact_name || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="mt-1 font-medium text-gray-900">
                  {vendor.email || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="mt-1 font-medium text-gray-900">
                  {vendor.phone_number || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="mt-1 font-medium text-gray-900">
                  {vendor.address || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tax ID</p>
                <p className="mt-1 font-medium text-gray-900">
                  {vendor.tax_id || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-flex mt-1 px-3 py-1 text-xs font-medium rounded-full capitalize ${
                    vendor.status?.toLowerCase() === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {vendor.status || "Unknown"}
                </span>
              </div>
            </div>
          </div>

          {/* Company Bank Account */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-blue-600">
                Company Bank Account
              </h3>
              <button
                onClick={() => setIsBankModalOpen(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Update details
              </button>
            </div>

            {vendor.bank_account ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-sm text-gray-500">Bank Account Name</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {(vendor.bank_account as any).bank_account_name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bank Account Number</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {(vendor.bank_account as any).bank_account_number || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bank Name</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {(vendor.bank_account as any).bank_name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Branch</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {(vendor.bank_account as any).branch_code || "-"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No bank account details provided.
              </p>
            )}
          </div>

          {isBankModalOpen && (
            <UpdateBankDetailsModal
              isOpen={isBankModalOpen}
              onClose={() => setIsBankModalOpen(false)}
              vendorId={vendorId}
              initialData={{
                accountName: (vendor.bank_account as any)?.bank_account_name || "",
                accountNumber: (vendor.bank_account as any)?.bank_account_number || "",
                bankName: (vendor.bank_account as any)?.bank_name || "",
                branch: (vendor.bank_account as any)?.branch_code || "",
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
