import React from "react";
import { motion } from "framer-motion";
import {
  UseFormRegisterReturn,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductFormData } from "@/schemas/productSchema";

type Option = { value: string; label: string };

interface ProductFormFieldsProps {
  register: (name: keyof ProductFormData) => UseFormRegisterReturn;
  errors: FieldErrors<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  categoryOptions: Option[];
  unitOptions: Option[];
  isLoadingUnits?: boolean;
}

export function ProductFormFields({
  register,
  errors,
  setValue,
  categoryOptions,
  unitOptions,
  isLoadingUnits = false,
}: ProductFormFieldsProps) {
  return (
    <motion.div
      className="md:flex md:items-start md:gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Grid inputs */}
      <div className="flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Product Name */}
          <motion.div
            className="col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          >
            <Label
              htmlFor="name"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Product Name *
            </Label>
            <motion.div
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                id="name"
                placeholder="Enter product name"
                {...register("name")}
                className="h-11 bg-white border border-gray-400 rounded shadow-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.name.message}
                </p>
              )}
            </motion.div>
          </motion.div>

          {/* Product Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
          >
            <Label
              htmlFor="description"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Product Description *
            </Label>
            <div className="relative">
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  id="description"
                  placeholder="Enter product description"
                  {...register("description")}
                  className="h-11 pr-10 bg-white border border-gray-400 rounded shadow-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.description.message}
                  </p>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Available Product Quantity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
          >
            <Label
              htmlFor="available"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Available Product Quantity
            </Label>
            <motion.div
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                id="available"
                type="number"
                min={0}
                {...register("available")}
                className="h-11 bg-white border border-gray-400 rounded shadow-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              />
              {errors.available && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.available.message}
                </p>
              )}
            </motion.div>
          </motion.div>

          {/* Total Quantity Purchased */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
          >
            <Label
              htmlFor="totalPurchased"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Total Quantity Purchased
            </Label>
            <motion.div
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                id="totalPurchased"
                type="number"
                min={0}
                {...register("totalPurchased")}
                className="h-11 bg-white border border-gray-400 rounded shadow-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              />
              {errors.totalPurchased && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.totalPurchased.message}
                </p>
              )}
            </motion.div>
          </motion.div>

          {/* Product Category (select) */}
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.5 }}
          >
            <Label
              htmlFor="category"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Product Category *
            </Label>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="flex-1 h-full w-full border border-gray-400 rounded transition-all duration-200 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <Select onValueChange={(val) => setValue("category", val)}>
                <SelectTrigger
                  aria-labelledby="category"
                  className="border-none w-full shadow-none"
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.category.message}
                </p>
              )}
            </motion.div>
          </motion.div>

          {/* Unit of Measure (select) */}
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.6 }}
          >
            <Label
              htmlFor="unit"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Unit of Measure *
            </Label>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="flex-1 h-full w-full border border-gray-400 rounded transition-all duration-200 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <Select
                onValueChange={(val) => setValue("unit", val)}
                disabled={isLoadingUnits}
              >
                <SelectTrigger
                  aria-labelledby="unit"
                  className="border-none w-full shadow-none"
                >
                  <SelectValue
                    placeholder={
                      isLoadingUnits
                        ? "Loading units..."
                        : "Select a unit of measure"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.unit.message}
                </p>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
