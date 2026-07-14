"use client";

import React, { useState } from "react";
import { ArrowLeft, Loader2, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageGuard } from "@/components/auth/PageGuard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateInventoryProductMutation } from "@/api/inventory/productsApi";
import { useGetInventoryUnitOfMeasuresQuery } from "@/api/inventory/unitOfMeasureApi";
import { StatusModal, useStatusModal, extractErrorMessage } from "@/components/shared/StatusModal";

export default function NewProductPage() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("consumable");
  const [standardCost, setStandardCost] = useState("0");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [checkForDuplicates, setCheckForDuplicates] = useState(true);

  // Status modal hook
  const statusModal = useStatusModal();

  // API hooks
  const [createProduct, { isLoading: isCreating }] =
    useCreateInventoryProductMutation();
  const { data: unitMeasures, isLoading: isLoadingUnits } =
    useGetInventoryUnitOfMeasuresQuery({});

  // Helper to extract UOM ID cleanly
  const getUnitId = (uom: any): number => {
    if (uom?.id !== undefined && !isNaN(Number(uom.id))) {
      return Number(uom.id);
    }
    if (uom?.url) {
      const parts = uom.url.split("/").filter(Boolean);
      const lastPart = parts[parts.length - 1];
      if (!isNaN(Number(lastPart))) {
        return Number(lastPart);
      }
    }
    return 0;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      statusModal.showError(
        "Validation Error",
        "Please enter a product name before saving."
      );
      return;
    }

    if (!unit) {
      statusModal.showError(
        "Validation Error",
        "Please select a Unit of Measure for the product."
      );
      return;
    }

    const unitId = Number(unit);
    if (isNaN(unitId) || unitId <= 0) {
      statusModal.showError(
        "Validation Error",
        "Invalid Unit of Measure selected."
      );
      return;
    }

    try {
      const payload = {
        product_name: name.trim(),
        description: description.trim(),
        product_category: category.trim() || "consumable",
        unit_of_measure: unitId,
        standard_cost: standardCost.trim() ? String(standardCost).trim() : "0",
        is_active: isActive,
        is_hidden: isHidden,
        check_for_duplicates: checkForDuplicates,
      };

      await createProduct(payload).unwrap();

      statusModal.showSuccess(
        "Product Created",
        `Product "${name.trim()}" has been created and registered successfully.`
      );
    } catch (err: any) {
      console.error("Failed to create product:", err);
      const errorMsg = extractErrorMessage(
        err,
        "Failed to create product due to a server error. Please try again."
      );
      statusModal.showError("Creation Failed", errorMsg);
    }
  };

  const handleModalClose = () => {
    statusModal.close();
    if (statusModal.type === "success") {
      router.push("/inventory/configuration/products");
    }
  };

  return (
    <PageGuard application="inventory" module="products">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={handleModalClose}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          actionText={statusModal.type === "success" ? "Go to Products" : "Try again"}
        />

        {/* Header */}
        <div className="flex items-center px-6 py-4 border-b border-gray-100">
          <Link href="/inventory/configuration/products">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
          </Link>
          <h1 className="text-lg font-medium text-gray-800">New Product</h1>
        </div>

        {/* Form Container */}
        <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-10 overflow-y-auto">
          <section>
            <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label className="text-gray-700 font-medium">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Enter unique product name e.g. Premium Rice"
                  className="bg-white border-gray-300 rounded h-11"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-gray-700 font-medium">
                  Unit of Measure <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={unit}
                  onValueChange={setUnit}
                  disabled={isLoadingUnits}
                >
                  <SelectTrigger className="bg-white border-gray-300 rounded h-11">
                    <SelectValue
                      placeholder={
                        isLoadingUnits
                          ? "Loading units..."
                          : "Select unit of measure"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {unitMeasures?.map((uom, index) => {
                      const uomId = getUnitId(uom) || index + 1;
                      return (
                        <SelectItem key={uomId} value={String(uomId)}>
                          {uom.unit_name}{" "}
                          {uom.unit_symbol ? `(${uom.unit_symbol})` : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-gray-700 font-medium">
                  Product Category <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-white border-gray-300 rounded h-11">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumable">Consumable</SelectItem>
                    <SelectItem value="stockable">Stockable</SelectItem>
                    <SelectItem value="service-product">Service Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-gray-700 font-medium">
                  Standard Cost
                </Label>
                <Input
                  type="text"
                  placeholder="0.00"
                  className="bg-white border-gray-300 rounded h-11 font-mono"
                  value={standardCost}
                  onChange={(e) => setStandardCost(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-3">
                <Label className="text-gray-700 font-medium">Description</Label>
                <Textarea
                  placeholder="Enter additional product details..."
                  className="bg-white border-gray-300 rounded min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-8 mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className="flex items-center gap-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none cursor-pointer"
              >
                {isActive ? (
                  <CheckSquare className="h-5 w-5 text-[#3B7CED]" />
                ) : (
                  <Square className="h-5 w-5 text-gray-400" />
                )}
                Active
              </button>

              <button
                type="button"
                onClick={() => setCheckForDuplicates(!checkForDuplicates)}
                className="flex items-center gap-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none cursor-pointer"
              >
                {checkForDuplicates ? (
                  <CheckSquare className="h-5 w-5 text-[#3B7CED]" />
                ) : (
                  <Square className="h-5 w-5 text-gray-400" />
                )}
                Check for Duplicates
              </button>

              <button
                type="button"
                onClick={() => setIsHidden(!isHidden)}
                className="flex items-center gap-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none cursor-pointer"
              >
                {isHidden ? (
                  <CheckSquare className="h-5 w-5 text-[#3B7CED]" />
                ) : (
                  <Square className="h-5 w-5 text-gray-400" />
                )}
                Hidden Product
              </button>
            </div>
          </section>
        </div>

        {/* Footer sticky bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Link href="/inventory/configuration/products">
            <Button
              variant="outline"
              className="border-blue-400 text-blue-500 hover:bg-blue-50 h-11 px-6"
            >
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={isCreating}
            className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-11 px-6 flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Product"
            )}
          </Button>
        </div>
      </div>
    </PageGuard>
  );
}
