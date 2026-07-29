"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateVendorMutation } from "@/api/invoice/vendorsApi";
import { useAddVendorBankAccountMutation } from "@/api/invoice/vendorBankAccountsApi";
import { ToastNotification } from "@/components/shared/ToastNotification";

const schema = z.object({
  vendorName: z.string().min(1, "Vendor name is required"),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  street: z.string().optional(),
  lga: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
  branch: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewVendorPage() {
  const router = useRouter();
  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  const [addBank, { isLoading: isAddingBank }] = useAddVendorBankAccountMutation();
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const addressParts = [data.street, data.lga, data.state, data.country].filter(Boolean);
      const address = addressParts.join(", ");

      const vendorPayload = {
        vendor_name: data.vendorName,
        contact_name: data.contactName || "",
        email: data.email || "",
        phone_number: data.phone || "",
        address: address,
        vendor_type: "supplier",
        status: "active",
      };

      const vendorResponse = await createVendor(vendorPayload).unwrap();

      const hasBankDetails = data.bankAccountName || data.bankAccountNumber || data.bankName || data.branch;
      if (hasBankDetails) {
        const vendorId = (vendorResponse as any).id;
        if (vendorId) {
          const bankPayload = {
            bank_account_name: data.bankAccountName || "",
            bank_account_number: data.bankAccountNumber || "",
            bank_name: data.bankName || "",
            branch_code: data.branch || "",
          };
          await addBank({ id: vendorId, data: bankPayload }).unwrap();
        }
      }

      setToast({
        show: true,
        message: "Vendor created successfully",
        type: "success",
      });
      setTimeout(() => {
        router.push("/invoice/vendor");
      }, 1500);
    } catch (err: any) {
      setToast({
        show: true,
        message: err?.data?.message || err?.message || "Failed to create vendor",
        type: "error",
      });
    }
  };

  const isSubmitting = isCreating || isAddingBank;

  return (
    <div className="p-6 space-y-6">
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1.5 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">New Vendor</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-blue-600 mb-6">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Vendor Name
              </label>
              <input
                {...register("vendorName")}
                placeholder="Enter your company name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.vendorName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.vendorName.message}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end justify-end">
              <p className="text-sm text-gray-500">Vendor Code</p>
              <p className="font-medium text-gray-900 mt-1">Generated Automatically</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-blue-600 mb-6">
            Contact Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contact Name
              </label>
              <input
                {...register("contactName")}
                placeholder="Enter contact name here"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                {...register("email")}
                placeholder="Enter email here"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone number
              </label>
              <input
                {...register("phone")}
                placeholder="Enter company phone number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Address</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Street & Number
              </label>
              <input
                {...register("street")}
                placeholder="Enter Street & number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Local Government
              </label>
              <input
                {...register("lga")}
                placeholder="Enter local government"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                State
              </label>
              <input
                {...register("state")}
                placeholder="Enter state"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Country
              </label>
              <input
                {...register("country")}
                placeholder="Enter country"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bank Information */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-blue-600 mb-6">
            Bank Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Bank Account Name
              </label>
              <input
                {...register("bankAccountName")}
                placeholder="Enter account name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Bank Account Number
              </label>
              <input
                {...register("bankAccountNumber")}
                placeholder="Enter account number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Bank Name
              </label>
              <input
                {...register("bankName")}
                placeholder="Enter bank name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Branch
              </label>
              <input
                {...register("branch")}
                placeholder="Enter branch code"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
