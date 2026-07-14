"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageGuard } from "@/components/auth/PageGuard";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useGetInventoryUnitOfMeasureQuery,
  useUpdateInventoryUnitOfMeasureMutation,
  useDeleteInventoryUnitOfMeasureMutation,
} from "@/api/inventory/unitOfMeasureApi";
import { StatusModal, useStatusModal, extractErrorMessage } from "@/components/shared/StatusModal";

export default function UnitOfMeasureDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: unitData, isLoading: isLoadingUnit } =
    useGetInventoryUnitOfMeasureQuery(id, { skip: !id });

  const [updateUnit, { isLoading: isUpdating }] =
    useUpdateInventoryUnitOfMeasureMutation();
  const [deleteUnit, { isLoading: isDeleting }] =
    useDeleteInventoryUnitOfMeasureMutation();

  const statusModal = useStatusModal();

  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [category, setCategory] = useState("");
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    if (unitData) {
      setName(unitData.unit_name || "");
      setAbbreviation(unitData.unit_symbol || "");
      setCategory(unitData.unit_category || "General");
      setIsHidden(!!unitData.is_hidden);
    }
  }, [unitData]);

  const handleSave = async () => {
    if (!name.trim()) {
      statusModal.showError(
        "Validation Error",
        "Please enter a valid Unit Name."
      );
      return;
    }

    if (!abbreviation.trim()) {
      statusModal.showError(
        "Validation Error",
        "Please enter a valid Unit Symbol / Abbreviation."
      );
      return;
    }

    try {
      await updateUnit({
        id,
        data: {
          unit_name: name.trim(),
          unit_symbol: abbreviation.trim(),
          unit_category: category.trim() || "General",
          is_hidden: isHidden,
        },
      }).unwrap();

      statusModal.showSuccess(
        "Changes Saved",
        `Unit of Measure "${name.trim()}" has been updated successfully.`
      );
    } catch (err: any) {
      console.error("Failed to update unit:", err);
      const errorMsg = extractErrorMessage(
        err,
        "Failed to update Unit of Measure. Please try again."
      );
      statusModal.showError("Update Failed", errorMsg);
    }
  };

  const handleDelete = () => {
    statusModal.showConfirm(
      "Delete Unit of Measure",
      "Are you sure you want to delete this Unit of Measure?",
      async () => {
        try {
          await deleteUnit(id).unwrap();
          statusModal.showSuccess(
            "Unit Deleted",
            "Unit of Measure has been deleted successfully."
          );
        } catch (err: any) {
          console.error("Failed to delete unit:", err);
          const errorMsg = extractErrorMessage(
            err,
            "Failed to delete Unit of Measure."
          );
          statusModal.showError("Deletion Failed", errorMsg);
        }
      },
      "Delete",
      "Cancel"
    );
  };

  const handleModalClose = () => {
    statusModal.close();
    if (
      statusModal.type === "success" &&
      (statusModal.title === "Unit Deleted" || statusModal.title === "Changes Saved")
    ) {
      router.push("/inventory/configuration/units-of-measure");
    }
  };

  if (isLoadingUnit) {
    return (
      <PageGuard application="inventory" module="unitsofmeasure">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-[#3B7CED]" />
          <p className="mt-2 text-sm text-gray-500">Loading unit details...</p>
        </div>
      </PageGuard>
    );
  }

  const statusStr = isHidden ? "HIDDEN" : "ACTIVE";

  return (
    <PageGuard application="inventory" module="unitsofmeasure">
      <div className="flex flex-col h-full bg-gray-50 relative pb-20 min-h-[calc(100vh-64px)]">
        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={handleModalClose}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          actionText={
            statusModal.actionText ||
            (statusModal.type === "success" ? "Done" : "Close")
          }
          onAction={statusModal.onAction || handleModalClose}
          secondaryText={statusModal.secondaryText}
          onSecondary={statusModal.onSecondary}
          actionVariant={statusModal.actionVariant}
        />

        {/* Top Navigation Row */}
        <div className="flex items-center px-6 py-4 border-b border-gray-100 bg-white">
          <Link
            href="/inventory/configuration/units-of-measure"
            className="flex items-center text-sm text-gray-500 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {unitData?.unit_name || `Unit #${id}`}
          </Link>
        </div>

        <div className="px-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6 overflow-y-auto mt-6">
          {/* Header Info */}
          <div className="flex justify-between items-start bg-white p-6 rounded shadow-sm border border-gray-100">
            <div>
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">{name || "Unit Details"}</h2>
                <Badge
                  className={`${
                    isHidden
                      ? "bg-red-100 text-red-700 hover:bg-red-100"
                      : "bg-green-100 text-green-700 hover:bg-green-100"
                  } px-3 py-0.5 border-0 font-medium text-xs`}
                >
                  {statusStr}
                </Badge>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Abbreviation / Symbol: <span className="font-mono">{abbreviation || "-"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsHidden(!isHidden)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 h-9 text-xs"
              >
                {isHidden ? "Activate Unit" : "Hide Unit"}
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting}
                className="border-red-500 text-red-500 hover:bg-red-50 h-9 text-xs flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Delete
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white p-6 rounded shadow-sm border border-gray-100 mb-12">
            <h3 className="text-lg font-medium text-[#3B7CED] mb-6">
              Unit Attributes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <Label className="text-gray-700 font-medium">Unit Name <span className="text-red-500">*</span></Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white border-gray-300 rounded h-11"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-gray-700 font-medium">Abbreviation / Symbol <span className="text-red-500">*</span></Label>
                <Input
                  value={abbreviation}
                  onChange={(e) => setAbbreviation(e.target.value)}
                  className="bg-white border-gray-300 rounded h-11"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-gray-700 font-medium">Category</Label>
                <Input
                  list="edit-category-suggestions"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-white border-gray-300 rounded h-11"
                />
                <datalist id="edit-category-suggestions">
                  <option value="Weight" />
                  <option value="Volume" />
                  <option value="Length" />
                  <option value="Quantity / Units" />
                  <option value="Time" />
                  <option value="Area" />
                </datalist>
              </div>
            </div>
          </div>
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
            onClick={handleSave}
            disabled={isUpdating}
            className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-11 px-6 flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </PageGuard>
  );
}
