"use client";

import React, { useState, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { ProductImageUpload } from "@/components/purchase/products/ProductImageUpload";
import { ProductFormFields } from "@/components/purchase/products/ProductFormFields";
import { ProductFormActions } from "@/components/purchase/products/ProductFormActions";
import { BreadcrumbItem } from "@/types/purchase";

type Option = { value: string; label: string };

const CATEGORY_OPTIONS: Option[] = [
  { value: "food", label: "Food & Beverages" },
  { value: "office", label: "Office Supplies" },
  { value: "electronics", label: "Electronics" },
];

const UNIT_OPTIONS: Option[] = [
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "kg", label: "Kilogram (kg)" },
  { value: "ltr", label: "Liters (ltr)" },
];

type ProductFormData = {
  name: string;
  description: string;
  available: number | "";
  totalPurchased: number | "";
  category: string;
  unit: string;
};

export default function Page() {
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    available: 0,
    totalPurchased: 0,
    category: "",
    unit: "",
  });

  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Purchase", href: "/purchase" },
    { label: "Products", href: "/purchase/products", current: true },
  ];

  // Avatar upload state
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarSrc(url);
  }

  function handleFormChange(
    field: keyof ProductFormData,
    value: string | number | ""
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    // Mock submit action
    const payload = { ...formData };
    // Here you would call an API. For demo we just log and navigate back.
    // eslint-disable-next-line no-console
    console.log("Create product", payload);
    router.push("/");
  }

  return (
    <motion.div
      className="h-full text-gray-900 font-sans antialiased"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <PageHeader items={items} title="New Product" />
      </motion.div>

      {/* Main form area */}
      <motion.main
        className="h-full mx-auto px-6 py-8 bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      >
        <form onSubmit={handleCreate} className="bg-white">
          <motion.h2
            className="text-lg font-medium text-blue-500 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
          >
            Basic Information
          </motion.h2>

          {/* Avatar / Image upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
          >
            <ProductImageUpload
              avatarSrc={avatarSrc}
              onImageChange={handleFileChange}
            />
          </motion.div>

          {/* Product form fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
          >
            <ProductFormFields
              formData={formData}
              onChange={handleFormChange}
              categoryOptions={CATEGORY_OPTIONS}
              unitOptions={UNIT_OPTIONS}
            />
          </motion.div>

          {/* Form actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
          >
            <ProductFormActions
              onSubmit={handleCreate}
              submitText="Edit Product"
            />
          </motion.div>
        </form>
      </motion.main>
    </motion.div>
  );
}
