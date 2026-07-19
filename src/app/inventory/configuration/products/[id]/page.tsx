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
  Save,
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

  // Tabs
  const [activeTab, setActiveTab] = useState<"attributes" | "history">(
    "attributes"
  );

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
  const {
    data: productData,
    isLoading: isLoadingProduct,
    error: productError,
  } = useGetInventoryProductQuery(id, { skip: !id });

  const [updateProduct, { isLoading: isUpdating }] =
    useUpdateInventoryProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] =
    useDeleteInventoryProductMutation();
  const { data: unitMeasures, isLoading: isLoadingUnits } =
    useGetInventoryUnitOfMeasuresQuery({});

  // Helper to extract UOM ID
  const getUnitId = (uom: any, index: number): number => {
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
    return index + 1;
  };

  useEffect(() => {
    if (productData) {
      setName(productData.product_name || productData.name || "");

      const uomId =
        productData.unit_of_measure_details?.id ||
        productData.unit_of_measure ||
        "";
      if (uomId) {
        setUnit(String(uomId));
      }

      setCategory(
        productData.product_category || productData.category || "consumable"
      );
      setStandardCost(
        productData.standard_cost !== undefined
          ? String(productData.standard_cost)
          : "0"
      );
      setDescription(productData.description || "");
      setIsActive(productData.is_active !== false);
      setIsHidden(Boolean(productData.is_hidden));
    }
  }, [productData]);

  const handleSave = async () => {
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

      await updateProduct({ id, ...payload }).unwrap();
      statusModal.showSuccess(
        "Product Updated",
        `Product "${name.trim()}" has been updated successfully.`
      );
    } catch (err: any) {
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
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-[#F6F9FC]">
          <Loader2 className="h-8 w-8 animate-spin text-[#3B7CED]" />
          <p className="mt-2 text-sm font-semibold text-[#8898AA]">Loading product details...</p>
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
      {/* Two-tone: gray canvas */}
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-[#F6F9FC] relative pb-24">
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

        {/* Clean Header Card */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-2xs">
          <div className="flex items-center gap-3">
            <Link href="/inventory/configuration/products">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#32325D]">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-semibold text-[#32325D]">
                  {productData?.product_name || name || `Product #${id}`}
                </h1>
                <Badge
                  className={`${
                    statusStr === "ACTIVE"
                      ? "bg-green-50 text-green-700 border border-green-200/60"
                      : "bg-red-50 text-red-700 border border-red-200/60"
                  } px-2.5 py-0.5 font-semibold text-xs shadow-none`}
                >
                  {statusStr}
                </Badge>
              </div>
              <p className="text-xs text-[#8898AA] font-mono mt-0.5">
                Code: {productData?.product_code || `PRD-${id}`} | Category: {category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsHidden(!isHidden)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm h-9 px-4 font-medium"
            >
              {isHidden ? "Activate Product" : "Hide Product"}
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-sm h-9 px-4 font-medium flex items-center gap-1.5"
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

        {/* Main Content Container */}
        <main className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
          
          {/* Module Switcher Tabs */}
          <div className="flex border-b border-gray-200 gap-8 px-4 bg-white rounded-t-lg border border-b-0 pt-3 shadow-2xs">
            <button
              onClick={() => setActiveTab("attributes")}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "attributes"
                  ? "border-[#3B7CED] text-[#3B7CED]"
                  : "border-transparent text-gray-400 hover:text-[#32325D]"
              }`}
            >
              <Package className="w-4 h-4" /> Basic Attributes
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "history"
                  ? "border-[#3B7CED] text-[#3B7CED]"
                  : "border-transparent text-gray-400 hover:text-[#32325D]"
              }`}
            >
              <History className="w-4 h-4" /> Stock Movement Ledger
            </button>
          </div>

          {/* Tab 1: Form Content Card */}
          {activeTab === "attributes" && (
            <div className="bg-white rounded-b-lg rounded-tr-lg shadow-2xs border border-gray-100 overflow-hidden animate-in fade-in-50 duration-150">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-base font-semibold text-[#32325D]">
                  Product Master Record
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold text-[#525F7F]">
                    Product Name <span className="text-[#E43D2B]">*</span>
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white border-gray-200 rounded-md h-9 text-sm text-[#32325D] focus:ring-[#3B7CED]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold text-[#525F7F]">
                    Product Code
                  </Label>
                  <Input
                    value={productData?.product_code || `PRD-${id}`}
                    disabled
                    className="bg-gray-50 border-gray-200 rounded-md text-[#8898AA] font-mono h-9 text-sm"
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
                    value={standardCost}
                    onChange={(e) => setStandardCost(e.target.value)}
                    className="bg-white border-gray-200 rounded-md h-9 font-mono text-sm font-semibold text-[#32325D] focus:ring-[#3B7CED]"
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-3">
                  <Label className="text-xs font-semibold text-[#525F7F]">
                    Description / Notes
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-white border-gray-200 rounded-md min-h-[80px] text-sm text-[#32325D] focus:ring-[#3B7CED]"
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
          )}

          {/* Tab 2: Stock Movement History Card */}
          {activeTab === "history" && (
            <div className="bg-white rounded-b-lg rounded-tr-lg shadow-2xs border border-gray-100 overflow-hidden animate-in fade-in-50 duration-150">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#32325D]">
                  Transaction Audit Trail for {productData?.product_code || id}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <Table className="min-w-[800px] w-full">
                  <TableHeader>
                    <TableRow className="bg-[#F6F9FC] hover:bg-[#F6F9FC] border-b border-gray-100">
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap">
                        Date & Time
                      </TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap">
                        Movement Type
                      </TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap">
                        Source / Reference
                      </TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-right">
                        Quantity Change
                      </TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-right">
                        Running Balance
                      </TableHead>
                      <TableHead className="py-3.5 pr-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dummyStockMoves.map((move) => (
                      <TableRow key={move.id} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                        <TableCell className="px-6 py-3.5 font-mono text-sm font-semibold text-[#525F7F] whitespace-nowrap">
                          {move.date}
                        </TableCell>
                        <TableCell className="px-6 py-3.5 font-semibold text-sm text-[#32325D] whitespace-nowrap">
                          {move.type}
                        </TableCell>
                        <TableCell className="px-6 py-3.5 font-mono text-sm text-[#3B7CED] whitespace-nowrap">
                          {move.reference}
                        </TableCell>
                        <TableCell className="px-6 py-3.5 text-right font-mono font-bold text-sm whitespace-nowrap">
                          <span
                            className={
                              move.isPositive
                                ? "text-[#2BA24D]"
                                : "text-[#E43D2B]"
                            }
                          >
                            {move.qty}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-3.5 text-right font-mono text-sm font-semibold text-[#32325D] whitespace-nowrap">
                          {move.balance}
                        </TableCell>
                        <TableCell className="pr-6 py-3.5 text-center whitespace-nowrap">
                          <Badge
                            variant="validated"
                            className="px-2.5 py-0.5 font-semibold text-xs shadow-none"
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
            onClick={handleSave}
            disabled={isUpdating}
            className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-9 px-4 text-sm font-semibold shadow-2xs flex items-center gap-1.5"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </PageGuard>
  );
}
