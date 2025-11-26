"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, Plus, Trash2, ArrowLeft } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CloudUploadIcon } from "@hugeicons/core-free-icons";

// Types
type Product = {
  id: number;
  product_name: string;
  available_product_quantity: number;
  unit_of_measure_details: {
    unit_symbol: string;
  };
};

type Vendor = {
  id: number;
  company_name: string;
};

type Location = {
  id: string;
  location_name: string;
};

// Data
const products: Product[] = [
  {
    id: 10,
    product_name: "Puffpuff",
    available_product_quantity: 50,
    unit_of_measure_details: { unit_symbol: "Pcs" },
  },
  {
    id: 9,
    product_name: "Sugar",
    available_product_quantity: 0,
    unit_of_measure_details: { unit_symbol: "kg" },
  },
  {
    id: 8,
    product_name: "Phone",
    available_product_quantity: 1,
    unit_of_measure_details: { unit_symbol: "kg" },
  },
  {
    id: 7,
    product_name: "Comb",
    available_product_quantity: 0,
    unit_of_measure_details: { unit_symbol: "kg" },
  },
  {
    id: 6,
    product_name: "Keyboard",
    available_product_quantity: 40,
    unit_of_measure_details: { unit_symbol: "kg" },
  },
  {
    id: 5,
    product_name: "Laptop",
    available_product_quantity: 0,
    unit_of_measure_details: { unit_symbol: "kg" },
  },
  {
    id: 4,
    product_name: "BLUESEA DIAPERS",
    available_product_quantity: 0,
    unit_of_measure_details: { unit_symbol: "kg" },
  },
  {
    id: 3,
    product_name: "House service",
    available_product_quantity: 0,
    unit_of_measure_details: { unit_symbol: "m" },
  },
  {
    id: 2,
    product_name: "Plastic Chair",
    available_product_quantity: 53,
    unit_of_measure_details: { unit_symbol: "kg" },
  },
  {
    id: 1,
    product_name: "Meat burger",
    available_product_quantity: 0,
    unit_of_measure_details: { unit_symbol: "kg" },
  },
];

const vendors: Vendor[] = [
  { id: 4, company_name: "G-Mama kiosk" },
  { id: 3, company_name: "Minat Venture" },
  { id: 2, company_name: "Clean cut" },
  { id: 1, company_name: "Cee Qee" },
];

const activeLocation: Location[] = [
  { id: "IB1200001", location_name: "Cocoa house" },
  { id: "KAD100001", location_name: "Kaduna Store" },
];

const receiptTypes = [
  "vendor_receipt",
  "manufacturing_receipt",
  "internal_receipt",
  "returns",
  "scrap",
];

// Schema
const productLineSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  productId: z.number(),
  expectedQty: z.string(),
  unitOfMeasure: z.number(),
  qtyReceived: z.number().min(1, "Quantity received must be at least 1"),
});

const formSchema = z.object({
  receiptType: z.string().min(1, "Receipt type is required"),
  supplierName: z.string().min(1, "Supplier name is required"),
  location: z.string().min(1, "Location is required"),
  productLines: z
    .array(productLineSchema)
    .min(1, "At least one product line is required"),
});

type FormData = z.infer<typeof formSchema>;

// Utility functions
const formatDate = (date: Date) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${day} ${month} ${year} - ${hours}:${minutes} ${ampm}`;
};

const normalizeText = (text: string) => {
  return text
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function CreateIncomingProductForm() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [searchTerms, setSearchTerms] = useState<{ [key: number]: string }>({});
  const [showDropdowns, setShowDropdowns] = useState<{
    [key: number]: boolean;
  }>({});

  const receiptDate = formatDate(new Date());

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      receiptType: "",
      supplierName: "",
      location: "",
      productLines: [
        {
          productName: "",
          productId: 0,
          expectedQty: "",
          unitOfMeasure: 0,
          qtyReceived: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "productLines",
  });

  const handleProductSearch = (index: number, value: string) => {
    setSearchTerms((prev) => ({ ...prev, [index]: value }));
    setShowDropdowns((prev) => ({ ...prev, [index]: true }));
  };

  const handleProductSelect = (index: number, product: Product) => {
    setValue(`productLines.${index}.productName`, product.product_name, {
      shouldValidate: true,
    });
    setValue(`productLines.${index}.productId`, product.id);
    setValue(
      `productLines.${index}.expectedQty`,
      product.unit_of_measure_details.unit_symbol
    );
    setValue(
      `productLines.${index}.unitOfMeasure`,
      product.available_product_quantity
    );
    setShowDropdowns((prev) => ({ ...prev, [index]: false }));
    setSearchTerms((prev) => ({ ...prev, [index]: "" }));
  };

  const getFilteredProducts = (index: number) => {
    const term = searchTerms[index] || "";
    if (!term) return products;
    return products.filter((p) =>
      p.product_name.toLowerCase().includes(term.toLowerCase())
    );
  };

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    // Handle form submission
  };

  const onValidate = () => {
    console.log("Validating form...");
    // Handle validation
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">
              Home
            </a>
            <span>{`>`}</span>
            <a href="#" className="hover:text-gray-900">
              Inventory
            </a>
            <span>{`>`}</span>
            <span className="text-gray-900 font-medium">Operation</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 ">
            <span>Autosaved</span>
            <HugeiconsIcon
              icon={CloudUploadIcon}
              className="bg-gray-50 rounded-full"
            />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-xl font-semibold text-gray-900">
              New Incoming Product
            </span>
          </button>
        </div>

        <div onSubmit={handleFormSubmit as any}>
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-600 mb-6">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Receipt Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt Type
                </label>
                <div className="relative">
                  <select
                    {...register("receiptType")}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select receipt type</option>
                    {receiptTypes.map((type) => (
                      <option key={type} value={type}>
                        {normalizeText(type)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.receiptType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.receiptType.message}
                  </p>
                )}
              </div>

              {/* Receipt Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt Date
                </label>
                <input
                  type="text"
                  value={receiptDate}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              {/* Name of Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name of Supplier
                </label>
                <div className="relative">
                  <select
                    {...register("supplierName")}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Enter supplier's name</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.company_name}>
                        {vendor.company_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.supplierName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.supplierName.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <select
                    {...register("location")}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select your location</option>
                    {activeLocation.map((loc) => (
                      <option key={loc.id} value={loc.location_name}>
                        {loc.location_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.location.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Inventory Product Content */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-600 mb-6">
              Inventory Product Content
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Product Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Expected QTY
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Unit of Measure
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      QTY Received
                    </th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr
                      key={field.id}
                      className="border-b border-gray-100"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Product Name with Autocomplete */}
                      <td className="py-3 px-4">
                        <div className="relative">
                          <input
                            type="text"
                            {...register(`productLines.${index}.productName`)}
                            onChange={(e) =>
                              handleProductSearch(index, e.target.value)
                            }
                            onFocus={() =>
                              setShowDropdowns((prev) => ({
                                ...prev,
                                [index]: true,
                              }))
                            }
                            placeholder="Type to search..."
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />

                          {showDropdowns[index] &&
                            getFilteredProducts(index).length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {getFilteredProducts(index).map((product) => (
                                  <button
                                    key={product.id}
                                    type="button"
                                    onClick={() =>
                                      handleProductSelect(index, product)
                                    }
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                                  >
                                    {product.product_name}
                                  </button>
                                ))}
                              </div>
                            )}
                        </div>
                        {errors.productLines?.[index]?.productName && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.productLines[index]?.productName?.message}
                          </p>
                        )}
                      </td>

                      {/* Unit of Measure (auto-filled) */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={
                            watch(`productLines.${index}.unitOfMeasure`) || ""
                          }
                          disabled
                          className="w-24 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
                        />
                      </td>

                      {/* Expected QTY (auto-filled) */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          {...register(`productLines.${index}.expectedQty`)}
                          disabled
                          className="w-24 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
                        />
                      </td>
                      {/* QTY Received (user input) */}
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          {...register(`productLines.${index}.qtyReceived`, {
                            valueAsNumber: true,
                          })}
                          placeholder="0"
                          min="1"
                          className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.productLines?.[index]?.qtyReceived && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.productLines[index]?.qtyReceived?.message}
                          </p>
                        )}
                      </td>

                      {/* Delete button */}
                      <td className="py-3 px-4">
                        {fields.length > 1 && hoveredIndex === index && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Item Button */}
            <button
              type="button"
              onClick={() =>
                append({
                  productName: "",
                  productId: 0,
                  expectedQty: "",
                  unitOfMeasure: 0,
                  qtyReceived: 0,
                })
              }
              className="mt-4 flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-5 h-5 mr-1" />
              Add Item
            </button>

            {errors.productLines?.root && (
              <p className="mt-2 text-sm text-red-600">
                {errors.productLines.root.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onValidate}
              disabled={!isValid}
              className={`px-8 py-2.5 border-2 rounded-lg font-medium transition-colors ${
                isValid
                  ? "border-blue-600 text-blue-600 hover:bg-blue-50"
                  : "border-gray-300 text-gray-400 cursor-not-allowed"
              }`}
            >
              Validate
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={`px-8 py-2.5 rounded-lg font-medium transition-colors ${
                isValid
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
