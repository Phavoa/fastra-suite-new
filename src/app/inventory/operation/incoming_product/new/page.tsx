"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronDown,
  Plus,
  Trash2,
  ArrowLeft,
  CloudUpload,
} from "lucide-react";

// --- 1. TYPES & SCHEMA ---

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

// Zod Schema
const productLineSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  productId: z
    .number()
    .refine((val) => val !== 0, { message: "Product must be selected" }),
  expectedQty: z.string(), // Holds Unit of Measure Symbol
  unitOfMeasure: z.number(), // Holds Available Quantity
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
type ProductLine = FormData["productLines"][number];

// --- 2. MOCK DATA ---

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

// --- 3. UTILITY FUNCTIONS ---

const formatDate = (date: Date): string => {
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

const normalizeText = (text: string): string => {
  return text
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// --- 4. SUB-COMPONENTS ---

interface FormHeaderProps {
  receiptDate: string;
}

const FormHeader: React.FC<FormHeaderProps> = ({ receiptDate }) => (
  <>
    {/* Breadcrumb & Autosave */}
    <div className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
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
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-xs italic">Autosaved: {receiptDate}</span>
          <CloudUpload className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
    {/* Page Title */}
    <div className="max-w-7xl mx-auto pt-8 pb-4">
      <button className="flex items-center text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-5 h-5 mr-2" />
        <span className="text-2xl font-bold text-gray-900">
          New Incoming Product Receipt
        </span>
      </button>
    </div>
  </>
);

interface BasicInfoSectionProps {
  register: UseFormReturn<FormData>["register"];
  errors: UseFormReturn<FormData>["formState"]["errors"];
  receiptDate: string;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  register,
  errors,
  receiptDate,
}) => (
  <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
    <h2 className="text-xl font-semibold text-blue-700 mb-6 border-b pb-3">
      Basic Information
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Receipt Type */}
      <div>
        <label
          htmlFor="receiptType"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Receipt Type
        </label>
        <div className="relative">
          <select
            id="receiptType"
            {...register("receiptType")}
            className={`w-full px-4 py-2.5 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.receiptType ? "border-red-500" : "border-gray-300"
            }`}
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
          <p className="mt-1 text-sm text-red-600 font-medium">
            {errors.receiptType.message}
          </p>
        )}
      </div>

      {/* Receipt Date (Non-editable) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Receipt Date
        </label>
        <input
          type="text"
          value={receiptDate}
          disabled
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
        />
      </div>

      {/* Name of Supplier */}
      <div>
        <label
          htmlFor="supplierName"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Name of Supplier
        </label>
        <div className="relative">
          <select
            id="supplierName"
            {...register("supplierName")}
            className={`w-full px-4 py-2.5 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.supplierName ? "border-red-500" : "border-gray-300"
            }`}
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
          <p className="mt-1 text-sm text-red-600 font-medium">
            {errors.supplierName.message}
          </p>
        )}
      </div>

      {/* Location */}
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Location
        </label>
        <div className="relative">
          <select
            id="location"
            {...register("location")}
            className={`w-full px-4 py-2.5 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.location ? "border-red-500" : "border-gray-300"
            }`}
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
          <p className="mt-1 text-sm text-red-600 font-medium">
            {errors.location.message}
          </p>
        )}
      </div>
    </div>
  </div>
);

interface ProductLineRowProps {
  index: number;
  field: ProductLine & { id: string };
  register: UseFormReturn<FormData>["register"];
  errors: UseFormReturn<FormData>["formState"]["errors"];
  watch: UseFormReturn<FormData>["watch"];
  remove: (index?: number | number[]) => void;
  hoveredIndex: number | null;
  setHoveredIndex: React.Dispatch<React.SetStateAction<number | null>>;
  searchTerms: { [key: number]: string };
  showDropdowns: { [key: number]: boolean };
  handleProductSearch: (index: number, value: string) => void;
  handleProductSelect: (index: number, product: Product) => void;
  getFilteredProducts: (index: number) => Product[];
}

const ProductLineRow: React.FC<ProductLineRowProps> = ({
  index,
  field,
  register,
  errors,
  watch,
  remove,
  hoveredIndex,
  setHoveredIndex,
  searchTerms,
  showDropdowns,
  handleProductSearch,
  handleProductSelect,
  getFilteredProducts,
}) => {
  const lineErrors = errors.productLines?.[index];

  return (
    <tr
      key={field.id}
      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {/* Product Name with Autocomplete */}
      <td className="py-4 px-4 min-w-[250px]">
        <div className="relative">
          <input
            type="text"
            {...register(`productLines.${index}.productName`)}
            onChange={(e) => handleProductSearch(index, e.target.value)}
            onFocus={() => handleProductSearch(index, searchTerms[index] || "")} // Re-open dropdown on focus
            onBlur={() =>
              setTimeout(
                () =>
                  handleProductSearch(
                    index,
                    watch(`productLines.${index}.productName`)
                  ),
                200
              )
            } // Close dropdown after a short delay
            placeholder="Type to search..."
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              lineErrors?.productName ? "border-red-500" : "border-gray-300"
            }`}
            autoComplete="off"
          />

          {showDropdowns[index] && getFilteredProducts(index).length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
              {getFilteredProducts(index).map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleProductSelect(index, product)}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 text-sm transition-colors"
                >
                  {product.product_name}
                </button>
              ))}
            </div>
          )}
        </div>
        {lineErrors?.productName && (
          <p className="mt-1 text-xs text-red-600">
            {lineErrors.productName.message}
          </p>
        )}
      </td>

      {/* Expected QTY (auto-filled, actually Unit of Measure symbol) */}
      <td className="py-4 px-4">
        <input
          type="text"
          value={watch(`productLines.${index}.expectedQty`) || "N/A"}
          disabled
          className="w-24 text-center px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600 cursor-not-allowed"
        />
      </td>

      {/* Unit of Measure (auto-filled, actually Available Quantity) */}
      <td className="py-4 px-4">
        <input
          type="text"
          value={watch(`productLines.${index}.unitOfMeasure`) || 0}
          disabled
          className="w-28 text-center px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600 cursor-not-allowed"
        />
      </td>

      {/* QTY Received (user input) */}
      <td className="py-4 px-4 min-w-[150px]">
        <input
          type="number"
          {...register(`productLines.${index}.qtyReceived`, {
            valueAsNumber: true,
          })}
          placeholder="0"
          min="1"
          className={`w-32 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-right ${
            lineErrors?.qtyReceived ? "border-red-500" : "border-gray-300"
          }`}
        />
        {lineErrors?.qtyReceived && (
          <p className="mt-1 text-xs text-red-600">
            {lineErrors.qtyReceived.message}
          </p>
        )}
      </td>

      {/* Delete button */}
      <td className="py-4 px-4 w-12 text-center">
        {hoveredIndex === index && (
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50"
            aria-label={`Remove product line ${index + 1}`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </td>
    </tr>
  );
};

// --- 5. MAIN COMPONENT ---

export default function CreateIncomingProductForm() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [searchTerms, setSearchTerms] = useState<{ [key: number]: string }>({});
  const [showDropdowns, setShowDropdowns] = useState<{
    [key: number]: boolean;
  }>({});

  const receiptDate = useMemo(() => formatDate(new Date()), []);

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

  // Handler to open dropdown and filter products based on input
  const handleProductSearch = useCallback((index: number, value: string) => {
    setSearchTerms((prev) => ({ ...prev, [index]: value }));
    // Only show dropdown if value is present or if we are actively focused (re-opening on focus is handled by onFocus in the input)
    if (value.length > 0) {
      setShowDropdowns((prev) => ({ ...prev, [index]: true }));
    } else {
      // Close dropdown if input is cleared, but only if the product hasn't been selected yet
      // We rely on onBlur to close the dropdown properly after selection
    }
  }, []);

  // Handler when a product is selected from the dropdown
  const handleProductSelect = useCallback(
    (index: number, product: Product) => {
      setValue(`productLines.${index}.productName`, product.product_name, {
        shouldValidate: true,
      });
      setValue(`productLines.${index}.productId`, product.id, {
        shouldValidate: true,
      });
      setValue(
        `productLines.${index}.expectedQty`,
        product.unit_of_measure_details.unit_symbol
      );
      setValue(
        `productLines.${index}.unitOfMeasure`,
        product.available_product_quantity
      );
      setShowDropdowns((prev) => ({ ...prev, [index]: false }));
      setSearchTerms((prev) => ({ ...prev, [index]: "" })); // Clear the search term after selection
    },
    [setValue]
  );

  // Utility to filter products based on the current search term for a row
  const getFilteredProducts = useCallback(
    (index: number) => {
      const term = searchTerms[index] || "";
      if (!term) return products.slice(0, 10); // Show top 10 products if no search term
      return products.filter((p) =>
        p.product_name.toLowerCase().includes(term.toLowerCase())
      );
    },
    [searchTerms]
  );

  // Form submission handler
  const onSubmit = (data: FormData) => {
    console.log("Form submitted successfully:", data);
    // Add logic for API call here
  };

  const onValidate = () => {
    // Calling handleSubmit will trigger validation checks
    handleSubmit(
      (data) => {
        console.log("Form is valid:", data);
        alert("Form validated successfully!");
      },
      (err) => {
        console.error("Validation failed:", err);
        alert("Validation failed! Please check the errors above.");
      }
    )();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 font-inter">
      <FormHeader receiptDate={receiptDate} />

      <div className="max-w-7xl mx-auto px-6 lg:px-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <BasicInfoSection
            register={register}
            errors={errors}
            receiptDate={receiptDate}
          />

          {/* Inventory Product Content */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-semibold text-blue-700 mb-6 border-b pb-3">
              Inventory Product Content
            </h2>

            {/* Product Lines Table */}
            <div className="overflow-x-auto min-h-[150px]">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200 sticky top-0 bg-white">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500 min-w-[250px]">
                      Product Name
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500 min-w-[100px]">
                      UOM
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500 min-w-[120px]">
                      Available QTY
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-500 min-w-[150px]">
                      QTY Received
                    </th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <ProductLineRow
                      key={field.id}
                      index={index}
                      field={field}
                      register={register}
                      errors={errors}
                      watch={watch}
                      remove={remove}
                      hoveredIndex={hoveredIndex}
                      setHoveredIndex={setHoveredIndex}
                      searchTerms={searchTerms}
                      showDropdowns={showDropdowns}
                      handleProductSearch={handleProductSearch}
                      handleProductSelect={handleProductSelect}
                      getFilteredProducts={getFilteredProducts}
                    />
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
              className="mt-6 flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors border border-blue-100 rounded-full px-4 py-2 hover:bg-blue-50"
            >
              <Plus className="w-5 h-5 mr-1" />
              Add Item
            </button>

            {errors.productLines?.root && (
              <p className="mt-2 text-sm text-red-600 font-medium">
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
              className={`px-8 py-3 border-2 rounded-xl font-semibold transition-colors shadow-md ${
                isValid
                  ? "border-blue-600 text-blue-600 hover:bg-blue-50"
                  : "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100"
              }`}
            >
              Validate
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={`px-8 py-3 rounded-xl font-semibold transition-colors shadow-md ${
                isValid
                  ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Save Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// "use client";

// import React, { useState } from "react";
// import { useForm, useFieldArray } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { ChevronDown, Plus, Trash2, ArrowLeft } from "lucide-react";
// import { HugeiconsIcon } from "@hugeicons/react";
// import { CloudUploadIcon } from "@hugeicons/core-free-icons";

// // Types
// type Product = {
//   id: number;
//   product_name: string;
//   available_product_quantity: number;
//   unit_of_measure_details: {
//     unit_symbol: string;
//   };
// };

// type Vendor = {
//   id: number;
//   company_name: string;
// };

// type Location = {
//   id: string;
//   location_name: string;
// };

// // Data
// const products: Product[] = [
//   {
//     id: 10,
//     product_name: "Puffpuff",
//     available_product_quantity: 50,
//     unit_of_measure_details: { unit_symbol: "Pcs" },
//   },
//   {
//     id: 9,
//     product_name: "Sugar",
//     available_product_quantity: 0,
//     unit_of_measure_details: { unit_symbol: "kg" },
//   },
//   {
//     id: 8,
//     product_name: "Phone",
//     available_product_quantity: 1,
//     unit_of_measure_details: { unit_symbol: "kg" },
//   },
//   {
//     id: 7,
//     product_name: "Comb",
//     available_product_quantity: 0,
//     unit_of_measure_details: { unit_symbol: "kg" },
//   },
//   {
//     id: 6,
//     product_name: "Keyboard",
//     available_product_quantity: 40,
//     unit_of_measure_details: { unit_symbol: "kg" },
//   },
//   {
//     id: 5,
//     product_name: "Laptop",
//     available_product_quantity: 0,
//     unit_of_measure_details: { unit_symbol: "kg" },
//   },
//   {
//     id: 4,
//     product_name: "BLUESEA DIAPERS",
//     available_product_quantity: 0,
//     unit_of_measure_details: { unit_symbol: "kg" },
//   },
//   {
//     id: 3,
//     product_name: "House service",
//     available_product_quantity: 0,
//     unit_of_measure_details: { unit_symbol: "m" },
//   },
//   {
//     id: 2,
//     product_name: "Plastic Chair",
//     available_product_quantity: 53,
//     unit_of_measure_details: { unit_symbol: "kg" },
//   },
//   {
//     id: 1,
//     product_name: "Meat burger",
//     available_product_quantity: 0,
//     unit_of_measure_details: { unit_symbol: "kg" },
//   },
// ];

// const vendors: Vendor[] = [
//   { id: 4, company_name: "G-Mama kiosk" },
//   { id: 3, company_name: "Minat Venture" },
//   { id: 2, company_name: "Clean cut" },
//   { id: 1, company_name: "Cee Qee" },
// ];

// const activeLocation: Location[] = [
//   { id: "IB1200001", location_name: "Cocoa house" },
//   { id: "KAD100001", location_name: "Kaduna Store" },
// ];

// const receiptTypes = [
//   "vendor_receipt",
//   "manufacturing_receipt",
//   "internal_receipt",
//   "returns",
//   "scrap",
// ];

// // Schema
// const productLineSchema = z.object({
//   productName: z.string().min(1, "Product name is required"),
//   productId: z.number(),
//   expectedQty: z.string(),
//   unitOfMeasure: z.number(),
//   qtyReceived: z.number().min(1, "Quantity received must be at least 1"),
// });

// const formSchema = z.object({
//   receiptType: z.string().min(1, "Receipt type is required"),
//   supplierName: z.string().min(1, "Supplier name is required"),
//   location: z.string().min(1, "Location is required"),
//   productLines: z
//     .array(productLineSchema)
//     .min(1, "At least one product line is required"),
// });

// type FormData = z.infer<typeof formSchema>;

// // Utility functions
// const formatDate = (date: Date) => {
//   const months = [
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
//   ];
//   const day = date.getDate();
//   const month = months[date.getMonth()];
//   const year = date.getFullYear();
//   let hours = date.getHours();
//   const minutes = date.getMinutes().toString().padStart(2, "0");
//   const ampm = hours >= 12 ? "PM" : "AM";
//   hours = hours % 12 || 12;

//   return `${day} ${month} ${year} - ${hours}:${minutes} ${ampm}`;
// };

// const normalizeText = (text: string) => {
//   return text
//     .split("_")
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(" ");
// };

// export default function CreateIncomingProductForm() {
//   const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
//   const [searchTerms, setSearchTerms] = useState<{ [key: number]: string }>({});
//   const [showDropdowns, setShowDropdowns] = useState<{
//     [key: number]: boolean;
//   }>({});

//   const receiptDate = formatDate(new Date());

//   const {
//     register,
//     control,
//     handleSubmit,
//     watch,
//     setValue,
//     formState: { errors, isValid },
//   } = useForm<FormData>({
//     resolver: zodResolver(formSchema),
//     mode: "onChange",
//     defaultValues: {
//       receiptType: "",
//       supplierName: "",
//       location: "",
//       productLines: [
//         {
//           productName: "",
//           productId: 0,
//           expectedQty: "",
//           unitOfMeasure: 0,
//           qtyReceived: 0,
//         },
//       ],
//     },
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "productLines",
//   });

//   const handleProductSearch = (index: number, value: string) => {
//     setSearchTerms((prev) => ({ ...prev, [index]: value }));
//     setShowDropdowns((prev) => ({ ...prev, [index]: true }));
//   };

//   const handleProductSelect = (index: number, product: Product) => {
//     setValue(`productLines.${index}.productName`, product.product_name, {
//       shouldValidate: true,
//     });
//     setValue(`productLines.${index}.productId`, product.id);
//     setValue(
//       `productLines.${index}.expectedQty`,
//       product.unit_of_measure_details.unit_symbol
//     );
//     setValue(
//       `productLines.${index}.unitOfMeasure`,
//       product.available_product_quantity
//     );
//     setShowDropdowns((prev) => ({ ...prev, [index]: false }));
//     setSearchTerms((prev) => ({ ...prev, [index]: "" }));
//   };

//   const getFilteredProducts = (index: number) => {
//     const term = searchTerms[index] || "";
//     if (!term) return products;
//     return products.filter((p) =>
//       p.product_name.toLowerCase().includes(term.toLowerCase())
//     );
//   };

//   const onSubmit = (data: FormData) => {
//     console.log("Form submitted:", data);
//     // Handle form submission
//   };

//   const onValidate = () => {
//     console.log("Validating form...");
//     // Handle validation
//   };

//   const handleFormSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     handleSubmit(onSubmit)(e);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* Breadcrumb */}
//       <div className="bg-white border-b border-gray-200 px-6 py-3">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2 text-sm text-gray-600">
//             <a href="#" className="hover:text-gray-900">
//               Home
//             </a>
//             <span>{`>`}</span>
//             <a href="#" className="hover:text-gray-900">
//               Inventory
//             </a>
//             <span>{`>`}</span>
//             <span className="text-gray-900 font-medium">Operation</span>
//           </div>
//           <div className="flex items-center gap-2 text-sm text-gray-600 ">
//             <span>Autosaved</span>
//             <HugeiconsIcon
//               icon={CloudUploadIcon}
//               className="bg-gray-50 rounded-full"
//             />
//           </div>
//         </div>
//       </div>
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <button className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
//             <ArrowLeft className="w-5 h-5 mr-2" />
//             <span className="text-xl font-semibold text-gray-900">
//               New Incoming Product
//             </span>
//           </button>
//         </div>

//         <div onSubmit={handleFormSubmit as any}>
//           {/* Basic Information */}
//           <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//             <h2 className="text-lg font-semibold text-blue-600 mb-6">
//               Basic Information
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Receipt Type */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Receipt Type
//                 </label>
//                 <div className="relative">
//                   <select
//                     {...register("receiptType")}
//                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="">Select receipt type</option>
//                     {receiptTypes.map((type) => (
//                       <option key={type} value={type}>
//                         {normalizeText(type)}
//                       </option>
//                     ))}
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                 </div>
//                 {errors.receiptType && (
//                   <p className="mt-1 text-sm text-red-600">
//                     {errors.receiptType.message}
//                   </p>
//                 )}
//               </div>

//               {/* Receipt Date */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Receipt Date
//                 </label>
//                 <input
//                   type="text"
//                   value={receiptDate}
//                   disabled
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
//                 />
//               </div>

//               {/* Name of Supplier */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Name of Supplier
//                 </label>
//                 <div className="relative">
//                   <select
//                     {...register("supplierName")}
//                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="">Enter supplier's name</option>
//                     {vendors.map((vendor) => (
//                       <option key={vendor.id} value={vendor.company_name}>
//                         {vendor.company_name}
//                       </option>
//                     ))}
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                 </div>
//                 {errors.supplierName && (
//                   <p className="mt-1 text-sm text-red-600">
//                     {errors.supplierName.message}
//                   </p>
//                 )}
//               </div>

//               {/* Location */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Location
//                 </label>
//                 <div className="relative">
//                   <select
//                     {...register("location")}
//                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="">Select your location</option>
//                     {activeLocation.map((loc) => (
//                       <option key={loc.id} value={loc.location_name}>
//                         {loc.location_name}
//                       </option>
//                     ))}
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                 </div>
//                 {errors.location && (
//                   <p className="mt-1 text-sm text-red-600">
//                     {errors.location.message}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Inventory Product Content */}
//           <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//             <h2 className="text-lg font-semibold text-blue-600 mb-6">
//               Inventory Product Content
//             </h2>

//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-gray-200">
//                     <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
//                       Product Name
//                     </th>
//                     <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
//                       Expected QTY
//                     </th>
//                     <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
//                       Unit of Measure
//                     </th>
//                     <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
//                       QTY Received
//                     </th>
//                     <th className="w-12"></th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {fields.map((field, index) => (
//                     <tr
//                       key={field.id}
//                       className="border-b border-gray-100"
//                       onMouseEnter={() => setHoveredIndex(index)}
//                       onMouseLeave={() => setHoveredIndex(null)}
//                     >
//                       {/* Product Name with Autocomplete */}
//                       <td className="py-3 px-4">
//                         <div className="relative">
//                           <input
//                             type="text"
//                             {...register(`productLines.${index}.productName`)}
//                             onChange={(e) =>
//                               handleProductSearch(index, e.target.value)
//                             }
//                             onFocus={() =>
//                               setShowDropdowns((prev) => ({
//                                 ...prev,
//                                 [index]: true,
//                               }))
//                             }
//                             placeholder="Type to search..."
//                             className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           />

//                           {showDropdowns[index] &&
//                             getFilteredProducts(index).length > 0 && (
//                               <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
//                                 {getFilteredProducts(index).map((product) => (
//                                   <button
//                                     key={product.id}
//                                     type="button"
//                                     onClick={() =>
//                                       handleProductSelect(index, product)
//                                     }
//                                     className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
//                                   >
//                                     {product.product_name}
//                                   </button>
//                                 ))}
//                               </div>
//                             )}
//                         </div>
//                         {errors.productLines?.[index]?.productName && (
//                           <p className="mt-1 text-xs text-red-600">
//                             {errors.productLines[index]?.productName?.message}
//                           </p>
//                         )}
//                       </td>

//                       {/* Unit of Measure (auto-filled) */}
//                       <td className="py-3 px-4">
//                         <input
//                           type="text"
//                           value={
//                             watch(`productLines.${index}.unitOfMeasure`) || ""
//                           }
//                           disabled
//                           className="w-24 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
//                         />
//                       </td>

//                       {/* Expected QTY (auto-filled) */}
//                       <td className="py-3 px-4">
//                         <input
//                           type="text"
//                           {...register(`productLines.${index}.expectedQty`)}
//                           disabled
//                           className="w-24 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
//                         />
//                       </td>
//                       {/* QTY Received (user input) */}
//                       <td className="py-3 px-4">
//                         <input
//                           type="number"
//                           {...register(`productLines.${index}.qtyReceived`, {
//                             valueAsNumber: true,
//                           })}
//                           placeholder="0"
//                           min="1"
//                           className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         />
//                         {errors.productLines?.[index]?.qtyReceived && (
//                           <p className="mt-1 text-xs text-red-600">
//                             {errors.productLines[index]?.qtyReceived?.message}
//                           </p>
//                         )}
//                       </td>

//                       {/* Delete button */}
//                       <td className="py-3 px-4">
//                         {fields.length > 1 && hoveredIndex === index && (
//                           <button
//                             type="button"
//                             onClick={() => remove(index)}
//                             className="text-red-500 hover:text-red-700 transition-colors"
//                           >
//                             <Trash2 className="w-5 h-5" />
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Add Item Button */}
//             <button
//               type="button"
//               onClick={() =>
//                 append({
//                   productName: "",
//                   productId: 0,
//                   expectedQty: "",
//                   unitOfMeasure: 0,
//                   qtyReceived: 0,
//                 })
//               }
//               className="mt-4 flex items-center text-blue-600 hover:text-blue-700 font-medium"
//             >
//               <Plus className="w-5 h-5 mr-1" />
//               Add Item
//             </button>

//             {errors.productLines?.root && (
//               <p className="mt-2 text-sm text-red-600">
//                 {errors.productLines.root.message}
//               </p>
//             )}
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-end gap-4">
//             <button
//               type="button"
//               onClick={onValidate}
//               disabled={!isValid}
//               className={`px-8 py-2.5 border-2 rounded-lg font-medium transition-colors ${
//                 isValid
//                   ? "border-blue-600 text-blue-600 hover:bg-blue-50"
//                   : "border-gray-300 text-gray-400 cursor-not-allowed"
//               }`}
//             >
//               Validate
//             </button>
//             <button
//               type="submit"
//               disabled={!isValid}
//               className={`px-8 py-2.5 rounded-lg font-medium transition-colors ${
//                 isValid
//                   ? "bg-blue-600 text-white hover:bg-blue-700"
//                   : "bg-gray-300 text-gray-500 cursor-not-allowed"
//               }`}
//             >
//               Save
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
