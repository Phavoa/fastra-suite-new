"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// This page can reuse most of the New Vendor form.
// For now it simply redirects or can be expanded later.

export default function EditVendorPage() {
  const router = useRouter();
  const params = useParams();

  // Safe access – useParams types id as string | string[]
  const vendorId = (params?.id as string) || "";

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-1.5 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Edit Vendor – {vendorId}</h1>
      </div>

      <p className="text-gray-500">
        Edit form can reuse the same structure as the New Vendor page. It will
        be done later.
      </p>
    </div>
  );
}
