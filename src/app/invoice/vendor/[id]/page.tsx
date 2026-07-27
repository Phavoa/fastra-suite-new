"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UpdateBankDetailsModal } from "@/components/invoice/vendor/UpdateBankDetailsModal";

export default function VendorInfoPage() {
  const router = useRouter();
  const params = useParams();
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  // Safe access (params.id can be string | string[] in the type)
  const vendorId = (params?.id as string) || "VEN-2024-0041";

  // Mock data (replace with real API later)
  const vendor = {
    id: vendorId,
    name: "Sunrise Vendors",
    contactName: "John doe",
    email: "johndoe@email.com",
    phone: "0123456789",
    address: "1 john street, Lagos",
    taxId: "TAX-00356",
    status: "Active",
    bank: {
      accountName: "John Peter Doe",
      accountNumber: "0123456789",
      bankName: "Gold Bank Plc",
      branch: "Lagos",
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Vendor Info</h1>
      </div>

      {/* Vendor Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900">{vendor.name}</h2>
        <p className="text-sm text-gray-500 mt-1">{vendor.id}</p>

        {/* Info Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
          <div>
            <p className="text-sm text-gray-500">Contact Name</p>
            <p className="mt-1 font-medium text-gray-900">
              {vendor.contactName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email Address</p>
            <p className="mt-1 font-medium text-gray-900">{vendor.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone Number</p>
            <p className="mt-1 font-medium text-gray-900">{vendor.phone}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="mt-1 font-medium text-gray-900">{vendor.address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tax ID</p>
            <p className="mt-1 font-medium text-gray-900">{vendor.taxId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className="inline-flex mt-1 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
              {vendor.status}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <div>
            <p className="text-sm text-gray-500">Bank Account Name</p>
            <p className="mt-1 font-medium text-gray-900">
              {vendor.bank.accountName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bank Account Number</p>
            <p className="mt-1 font-medium text-gray-900">
              {vendor.bank.accountNumber}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bank Name</p>
            <p className="mt-1 font-medium text-gray-900">
              {vendor.bank.bankName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Branch</p>
            <p className="mt-1 font-medium text-gray-900">
              {vendor.bank.branch}
            </p>
          </div>
        </div>
      </div>

      <UpdateBankDetailsModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        initialData={vendor.bank}
      />
    </div>
  );
}
