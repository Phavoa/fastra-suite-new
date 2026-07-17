"use client";

import React, { useState } from "react";
import { ArrowLeft, Loader2, CheckSquare, Square, Save } from "lucide-react";
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
        "Product Name is required to proceed."
      );
      return;
    }

    if (!unit) {
      statusModal.showError(
        "Validation Error",
        "Please select a Unit of Measure."
      );
      return;
    }

    try {
      const payload: any = {
        name: name.trim(),
        unit_of_measure: Number(unit),
        category: category,
        standard_cost: parseFloat(standardCost) || 0,
        description: description.trim(),
        is_active: isActive,
        is_hidden: isHidden,
      };

      await createProduct(payload).unwrap();
      statusModal.showSuccess(
        "Product Created",
        `${name} has been successfully added to products.`
      );
    } catch (err: any) {
      const errorMsg = extractErrorMessage(err, "Failed to create product.");
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
      {/* Two-tone: gray page canvas */}
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-[#F6F9FC] relative pb-24">
        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={handleModalClose}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          actionText={statusModal.type === "success" ? "Go to Products" : "Try again"}
        />

        {/* Clean Header Card */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-2xs">
          <div className="flex items-center gap-3">
            <Link href="/inventory/configuration/products">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#32325D]">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-[#32325D]">New Product</h1>
              <p className="text-xs text-[#8898AA] mt-0.5">Create a new item in products.</p>
            </div>
          </div>
        </div>

        {/* Main Form Container */}
        <main className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#32325D]">
                Basic Information & Classification
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label className="text-xs font-semibold text-[#525F7F]">
                  Product Name <span className="text-[#E43D2B]">*</span>
                </Label>
                <Input
                  placeholder="Enter unique product name e.g. Premium Portland Cement"
                  className="bg-white border-gray-200 rounded-md h-9 text-sm text-[#32325D] focus:ring-[#3B7CED]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold text-[#525F7F]">
                  Unit of Measure <span className="text-[#E43D2B]">*</span>
                </Label>
                <Select
                  value={unit}
                  onValueChange={setUnit}
                  disabled={isLoadingUnits}
                >
                  <SelectTrigger className="bg-white border-gray-200 rounded-md h-9 text-sm text-[#32325D] focus:ring-[#3B7CED]">
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
                <Label className="text-xs font-semibold text-[#525F7F]">
                  Product Category <span className="text-[#E43D2B]">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-white border-gray-200 rounded-md h-9 text-sm text-[#32325D] focus:ring-[#3B7CED]">
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
                <Label className="text-xs font-semibold text-[#525F7F]">
                  Standard Cost (₦)
                </Label>
                <Input
                  type="text"
                  placeholder="0.00"
                  className="bg-white border-gray-200 rounded-md h-9 font-mono text-sm font-semibold text-[#32325D] focus:ring-[#3B7CED]"
                  value={standardCost}
                  onChange={(e) => setStandardCost(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-3">
                <Label className="text-xs font-semibold text-[#525F7F]">Description / Notes</Label>
                <Textarea
                  placeholder="Enter additional product specifications, grades, or handling instructions..."
                  className="bg-white border-gray-200 rounded-md min-h-[90px] text-sm text-[#32325D] focus:ring-[#3B7CED]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-gray-50/60 p-6 border-t border-gray-100 flex flex-wrap items-center gap-8">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className="flex items-center gap-2.5 text-sm font-semibold text-[#32325D] hover:text-[#3B7CED] focus:outline-none cursor-pointer"
              >
                {isActive ? (
                  <CheckSquare className="h-4 w-4 text-[#3B7CED]" />
                ) : (
                  <Square className="h-4 w-4 text-gray-400" />
                )}
                Active Status
              </button>

              <button
                type="button"
                onClick={() => setCheckForDuplicates(!checkForDuplicates)}
                className="flex items-center gap-2.5 text-sm font-semibold text-[#32325D] hover:text-[#3B7CED] focus:outline-none cursor-pointer"
              >
                {checkForDuplicates ? (
                  <CheckSquare className="h-4 w-4 text-[#3B7CED]" />
                ) : (
                  <Square className="h-4 w-4 text-gray-400" />
                )}
                Check for Duplicates
              </button>

              <button
                type="button"
                onClick={() => setIsHidden(!isHidden)}
                className="flex items-center gap-2.5 text-sm font-semibold text-[#32325D] hover:text-[#3B7CED] focus:outline-none cursor-pointer"
              >
                {isHidden ? (
                  <CheckSquare className="h-4 w-4 text-[#3B7CED]" />
                ) : (
                  <Square className="h-4 w-4 text-gray-400" />
                )}
                Hidden Product
              </button>
            </div>
          </div>
        </main>

        {/* Fixed Sticky Footer Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
          <Link href="/inventory/configuration/products">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 h-9 px-4 text-sm font-medium"
            >
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={isCreating}
            className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-9 px-4 text-sm font-semibold shadow-2xs flex items-center gap-1.5"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Product
              </>
            )}
          </Button>
        </div>
      </div>
    </PageGuard>
  );
}
