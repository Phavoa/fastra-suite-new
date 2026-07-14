"use client";

import React, { useState } from "react";
import { ArrowLeft, Loader2, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageGuard } from "@/components/auth/PageGuard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateInventoryUnitOfMeasureMutation } from "@/api/inventory/unitOfMeasureApi";
import { StatusModal, useStatusModal, extractErrorMessage } from "@/components/shared/StatusModal";

export default function NewUnitOfMeasurePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [category, setCategory] = useState("");
  const [isHidden, setIsHidden] = useState(false);

  const statusModal = useStatusModal();

  const [createUnit, { isLoading: isCreating }] =
    useCreateInventoryUnitOfMeasureMutation();

  const handleSubmit = async () => {
    if (!name.trim()) {
      statusModal.showError(
        "Validation Error",
        "Please enter a Unit Name before saving."
      );
      return;
    }

    if (!abbreviation.trim()) {
      statusModal.showError(
        "Validation Error",
        "Please enter a Unit Symbol / Abbreviation before saving."
      );
      return;
    }

    try {
      const payload = {
        unit_name: name.trim(),
        unit_symbol: abbreviation.trim(),
        unit_category: category.trim() || "General",
        is_hidden: isHidden,
      };

      await createUnit(payload).unwrap();

      statusModal.showSuccess(
        "Unit Created",
        `Unit of Measure "${name.trim()} (${abbreviation.trim()})" has been created successfully.`
      );
    } catch (err: any) {
      console.error("Failed to create Unit of Measure:", err);
      const errorMsg = extractErrorMessage(
        err,
        "Failed to create Unit of Measure due to a server error. Please try again."
      );
      statusModal.showError("Creation Failed", errorMsg);
    }
  };

  const handleModalClose = () => {
    statusModal.close();
    if (statusModal.type === "success") {
      router.push("/inventory/configuration/units-of-measure");
    }
  };

  return (
    <PageGuard application="inventory" module="unitsofmeasure">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={handleModalClose}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          actionText={statusModal.type === "success" ? "Go to Units" : "Try again"}
        />

        {/* Header */}
        <div className="flex items-center px-6 py-4 border-b border-gray-100">
          <Link href="/inventory/configuration/units-of-measure">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
          </Link>
          <h1 className="text-lg font-medium text-gray-800">
            New Unit of Measure
          </h1>
        </div>

        {/* Form Container */}
        <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-10 overflow-y-auto">
          <section>
            <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">
              Unit Attributes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <Label className="text-gray-700 font-medium">
                  Unit Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. Kilograms"
                  className="bg-white border-gray-300 rounded h-11"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-gray-700 font-medium">
                  Abbreviation / Symbol <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. kg"
                  className="bg-white border-gray-300 rounded h-11"
                  value={abbreviation}
                  onChange={(e) => setAbbreviation(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-gray-700 font-medium">
                  Unit Category
                </Label>
                <Input
                  list="unit-category-suggestions"
                  placeholder="e.g. Weight, Volume, Quantity"
                  className="bg-white border-gray-300 rounded h-11"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <datalist id="unit-category-suggestions">
                  <option value="Weight" />
                  <option value="Volume" />
                  <option value="Length" />
                  <option value="Quantity / Units" />
                  <option value="Time" />
                  <option value="Area" />
                </datalist>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-gray-100">
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
                Hidden Unit
              </button>
            </div>
          </section>
        </div>

        {/* Footer sticky bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Link href="/inventory/configuration/units-of-measure">
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
              "Save Unit"
            )}
          </Button>
        </div>
      </div>
    </PageGuard>
  );
}
