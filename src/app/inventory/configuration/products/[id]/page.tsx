"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  History,
  Package,
  Loader2,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageGuard } from "@/components/auth/PageGuard";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetInventoryProductQuery,
  useUpdateInventoryProductMutation,
  useSoftDeleteInventoryProductMutation as useDeleteInventoryProductMutation,
} from "@/api/inventory/productsApi";
import { useGetInventoryUnitOfMeasuresQuery } from "@/api/inventory/unitOfMeasureApi";
import { StatusModal, useStatusModal, extractErrorMessage } from "@/components/shared/StatusModal";

const dummyStockMoves = [
  {
    id: "MV-1001",
    date: "2026-06-25 08:30",
    type: "Incoming Receipt",
    reference: "WH-IN-0042 (Dangote Cement)",
    qty: "+500",
    balance: "1,200 Bags",
    status: "VALIDATED",
    isPositive: true,
  },
  {
    id: "MV-1002",
    date: "2026-06-24 14:15",
    type: "Project Consumption",
    reference: "MC-0089 (Lekki Tower WBS 1.2)",
    qty: "-150",
    balance: "700 Bags",
    status: "VALIDATED",
    isPositive: false,
  },
  {
    id: "MV-1003",
    date: "2026-06-23 11:00",
    type: "Project Consumption",
    reference: "MC-0081 (Victoria Island Mall)",
    qty: "-50",
    balance: "850 Bags",
    status: "VALIDATED",
    isPositive: false,
  },
  {
    id: "MV-1004",
    date: "2026-06-20 09:45",
    type: "Scrap Recording",
    reference: "SCR-0012 (Water Damage in Yard)",
    qty: "-10",
    balance: "900 Bags",
    status: "VALIDATED",
    isPositive: false,
  },
  {
    id: "MV-1005",
    date: "2026-06-18 16:20",
    type: "Initial Balance",
    reference: "INV-SETUP-001",
    qty: "+910",
    balance: "910 Bags",
    status: "VALIDATED",
    isPositive: true,
  },
];

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<"attributes" | "history">(
    "attributes"
  );

  const { data: productData, isLoading: isLoadingProduct } =
    useGetInventoryProductQuery(id, { skip: !id });
  const { data: unitMeasures, isLoading: isLoadingUnits } =
    useGetInventoryUnitOfMeasuresQuery({});
  const [updateProduct, { isLoading: isUpdating }] =
    useUpdateInventoryProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] =
    useDeleteInventoryProductMutation();

  const statusModal = useStatusModal();

  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("consumable");
  const [standardCost, setStandardCost] = useState("0");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [checkForDuplicates, setCheckForDuplicates] = useState(true);

  useEffect(() => {
    if (productData) {
      setName(productData.product_name || productData.name || "");
      setCategory(
        productData.product_category || productData.category || "consumable"
      );
      if (productData.unit_of_measure !== undefined) {
        setUnit(String(productData.unit_of_measure));
      } else if (productData.unit_of_measure_details?.id !== undefined) {
        setUnit(String(productData.unit_of_measure_details.id));
      }
      setStandardCost(String(productData.standard_cost ?? "0"));
      setDescription(
        productData.description || productData.product_description || ""
      );
      setIsActive(productData.is_active !== false);
      setIsHidden(!!productData.is_hidden);
      setCheckForDuplicates(productData.check_for_duplicates !== false);
    }
  }, [productData]);

  const getUnitId = (uom: any, idx: number): number => {
    if (uom?.id !== undefined && !isNaN(Number(uom.id))) return Number(uom.id);
    if (uom?.url) {
      const parts = uom.url.split("/").filter(Boolean);
      const lastPart = parts[parts.length - 1];
      if (!isNaN(Number(lastPart))) return Number(lastPart);
    }
    return idx + 1;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      statusModal.showError(
        "Validation Error",
        "Please enter a valid Product Name before saving."
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

    const unitId = Number(unit);
    if (isNaN(unitId) || unitId <= 0) {
      statusModal.showError(
        "Validation Error",
        "Invalid Unit of Measure selected."
      );
      return;
    }

    try {
      await updateProduct({
        id,
        data: {
          product_name: name.trim(),
          description: description.trim(),
          product_category: category.trim() || "consumable",
          unit_of_measure: unitId,
          standard_cost: standardCost.trim() ? String(standardCost).trim() : "0",
          is_active: isActive,
          is_hidden: isHidden,
          check_for_duplicates: checkForDuplicates,
        },
      }).unwrap();

      statusModal.showSuccess(
        "Product Updated",
        `Product "${name.trim()}" has been updated successfully.`
      );
    } catch (err: any) {
      console.error("Failed to update product:", err);
      const errorMsg = extractErrorMessage(
        err,
        "Failed to update product due to a server error. Please try again."
      );
      statusModal.showError("Update Failed", errorMsg);
    }
  };

  const handleDelete = () => {
    statusModal.showConfirm(
      "Delete Product",
      "Are you sure you want to delete this product?",
      async () => {
        try {
          await deleteProduct(id).unwrap();
          statusModal.showSuccess(
            "Product Deleted",
            "Product has been deleted successfully from the master inventory."
          );
        } catch (err: any) {
          console.error("Failed to delete product:", err);
          const errorMsg = extractErrorMessage(
            err,
            "Failed to delete product."
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
      (statusModal.title === "Product Deleted" ||
        statusModal.title === "Product Updated")
    ) {
      router.push("/inventory/configuration/products");
    }
  };

  if (isLoadingProduct) {
    return (
      <PageGuard application="inventory" module="products">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-[#3B7CED]" />
          <p className="mt-2 text-sm text-gray-500">Loading product details...</p>
        </div>
      </PageGuard>
    );
  }

  const statusStr = isHidden
    ? "HIDDEN"
    : productData?.is_active !== false
    ? "ACTIVE"
    : "INACTIVE";

  return (
    <PageGuard application="inventory" module="products">
      <div className="flex flex-col h-full bg-gray-50 relative pb-24 min-h-[calc(100vh-64px)]">
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
        <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-white shadow-xs">
          <Link
            href="/inventory/configuration/products"
            className="flex items-center text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {productData?.product_name || `Product #${id}`}
          </Link>
        </div>

        <div className="px-4 sm:px-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6 overflow-y-auto mt-6">
          {/* Responsive Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded border border-gray-200 shadow-sm gap-6">
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {name || "Product Details"}
                </h2>
                <Badge
                  className={`${
                    statusStr === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  } px-3 py-0.5 border-0 font-medium text-xs`}
                >
                  {statusStr}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-gray-500">
                <span>
                  Product Code:{" "}
                  <strong className="text-gray-800 font-mono font-semibold">
                    {productData?.product_code || `PRD-${id}`}
                  </strong>
                </span>
                <span className="hidden sm:inline text-gray-300">•</span>
                <span>
                  Category:{" "}
                  <strong className="text-gray-800 font-medium">
                    {category}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex items-center sm:self-start pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 gap-3">
              <Button
                variant="outline"
                onClick={() => setIsHidden(!isHidden)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm h-9 px-4 font-medium"
              >
                {isHidden ? "Activate Product" : "Hide Product"}
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-xs sm:text-sm h-9 px-4 font-medium flex items-center gap-1.5"
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

          {/* Module Switcher Tabs */}
          <div className="flex border-b border-gray-200 gap-8 px-2 bg-white rounded-t border border-b-0 pt-2 shadow-xs">
            <button
              onClick={() => setActiveTab("attributes")}
              className={`pb-3 text-sm font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "attributes"
                  ? "border-[#3B7CED] text-[#3B7CED]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Package className="w-4 h-4" /> Basic Attributes
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-3 text-sm font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "history"
                  ? "border-[#3B7CED] text-[#3B7CED]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <History className="w-4 h-4" /> Stock Movement Ledger
            </button>
          </div>

          {/* Tab 1: Form Content */}
          {activeTab === "attributes" && (
            <div className="bg-white p-6 rounded shadow-sm border border-gray-200 mb-12 animate-in fade-in-50 duration-150">
              <h3 className="text-lg font-medium text-[#3B7CED] mb-6">
                Product Master Record
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white border-gray-300 rounded h-11"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">
                    Product Code
                  </Label>
                  <Input
                    value={productData?.product_code || `PRD-${id}`}
                    disabled
                    className="bg-gray-100 border-gray-300 rounded text-gray-500 font-mono h-11"
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
                          isLoadingUnits ? "Loading..." : "Select Unit"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {unitMeasures?.map((uom, idx) => {
                        const uomId = getUnitId(uom, idx);
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
                    value={standardCost}
                    onChange={(e) => setStandardCost(e.target.value)}
                    className="bg-white border-gray-300 rounded h-11 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-3">
                  <Label className="text-gray-700 font-medium">
                    Description
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-white border-gray-300 rounded min-h-[80px]"
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
            </div>
          )}

          {/* Tab 2: Stock Movement History */}
          {activeTab === "history" && (
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden mb-12 animate-in fade-in-50 duration-150">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Transaction Audit Trail for {productData?.product_code || id}
                </span>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white">
                      <TableHead className="font-semibold text-gray-600">
                        Date & Time
                      </TableHead>
                      <TableHead className="font-semibold text-gray-600">
                        Movement Type
                      </TableHead>
                      <TableHead className="font-semibold text-gray-600">
                        Source / Reference
                      </TableHead>
                      <TableHead className="font-semibold text-gray-600 text-right">
                        Quantity Change
                      </TableHead>
                      <TableHead className="font-semibold text-gray-600 text-right">
                        Running Balance
                      </TableHead>
                      <TableHead className="font-semibold text-gray-600 text-center">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dummyStockMoves.map((move) => (
                      <TableRow key={move.id} className="hover:bg-gray-50">
                        <TableCell className="text-gray-600 font-mono text-xs">
                          {move.date}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {move.type}
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {move.reference}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          <span
                            className={
                              move.isPositive
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {move.qty}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-gray-900 font-semibold">
                          {move.balance}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="validated"
                            className="px-2.5 py-0.5 text-[10px]"
                          >
                            {move.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        {/* Footer sticky bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          <Link href="/inventory/configuration/products">
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
