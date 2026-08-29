"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetVendorByIdQuery, useUpdateVendorMutation } from "@/api/invoice/vendorsApi";
import { ToastNotification } from "@/components/shared/ToastNotification";

const schema = z.object({
  vendorName: z.string().min(1, "Vendor name is required"),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditVendorPage() {
  const router = useRouter();
  const params = useParams();

  const vendorIdStr = (params?.id as string) || "";
  const vendorId = parseInt(vendorIdStr, 10);

  const { data: vendor, isLoading, isError } = useGetVendorByIdQuery(vendorId, {
    skip: isNaN(vendorId),
  });

  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (vendor) {
      reset({
        vendorName: vendor.vendor_name || "",
        contactName: vendor.contact_name || "",
        email: vendor.email || "",
        phone: vendor.phone_number || "",
        address: vendor.address || "",
      });
    }
  }, [vendor, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const vendorPayload = {
        vendor_name: data.vendorName,
        contact_name: data.contactName || "",
        email: data.email || "",
        phone_number: data.phone || "",
        address: data.address || "",
        vendor_type: vendor?.vendor_type || "supplier",
        status: vendor?.status || "active",
      };

      await updateVendor({ id: vendorId, data: vendorPayload }).unwrap();

      setToast({
        show: true,
        message: "Vendor updated successfully",
        type: "success",
      });
      setTimeout(() => {
        router.push(`/invoice/settings?tab=vendor`);
      }, 1500);
    } catch (err: any) {
      setToast({
        show: true,
        message: err?.data?.message || err?.message || "Failed to update vendor",
        type: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
          Loading vendor details...
        </div>
      </div>
    );
  }

  if (isError || !vendor) {
    return (
      <div className="p-6">
        <div className="p-12 text-center text-red-500 bg-white rounded-2xl border border-gray-100">
          Failed to load vendor.
        </div>
      </div>
    );
  }

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
        <h1 className="text-xl font-semibold text-gray-900">Edit Vendor</h1>
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
              <p className="font-medium text-gray-900 mt-1">{vendor.vendor_code}</p>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Address
            </label>
            <input
              {...register("address")}
              placeholder="Enter full address"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {isUpdating ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
