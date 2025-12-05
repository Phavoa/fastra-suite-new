"use client";

import React, { useState, useMemo } from "react";
import { MoveLeft, Plus, Search, Edit2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BreadcrumbItem } from "@/components/shared/types";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import { StatusModal } from "@/components/shared/StatusModal";
import { Alert } from "@/components/ui/alert";
import {
  useGetUnitOfMeasuresQuery,
  useDeleteUnitOfMeasureMutation,
  usePatchUnitOfMeasureMutation,
  useCreateUnitOfMeasureMutation,
  type UnitOfMeasure,
  type CreateUnitOfMeasureRequest,
} from "@/api/purchase/unitOfMeasureApi";
import {
  formatErrorMessage,
  parseApiError,
  type ApiError,
  validateUnitOfMeasureDuplicates,
} from "@/lib/utils/error-handling";
import {
  unitOfMeasureSchema,
  type UnitOfMeasureInput,
} from "@/lib/validations/currency-validation";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { AnimatedWrapper } from "@/components/shared/AnimatedWrapper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface EditingUnit {
  id: number;
  unit_name: string;
  unit_symbol: string;
  unit_category: string;
}

export default function UnitOfMeasurePage() {
  const router = useRouter();

  // Helper function to extract ID from URL
  const getUnitId = (url: string): number => {
    return parseInt(url.split("/").filter(Boolean).pop() || "0");
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // UI state for editing and modal
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingUnit, setEditingUnit] = useState<EditingUnit | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    status: "success" | "error";
  }>({
    isOpen: false,
    title: "",
    description: "",
    status: "success",
  });

  // API hooks
  const {
    data: units = [],
    isLoading,
    error,
    refetch,
  } = useGetUnitOfMeasuresQuery({});
  const [deleteUnit, { isLoading: isDeleting }] =
    useDeleteUnitOfMeasureMutation();
  const [patchUnit, { isLoading: isUpdating }] =
    usePatchUnitOfMeasureMutation();
  const [createUnit, { isLoading: isCreating }] =
    useCreateUnitOfMeasureMutation();

  // Create form
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: createErrors, isValid: isCreateValid },
  } = useForm<UnitOfMeasureInput>({
    resolver: zodResolver(unitOfMeasureSchema),
    mode: "onChange",
    defaultValues: {
      unit_name: "",
      unit_symbol: "",
      unit_category: "",
    },
  });

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const cats = Array.from(new Set(units.map((unit) => unit.unit_category)));
    return cats.sort();
  }, [units]);

  // Filter and search units
  const filteredUnits = useMemo(() => {
    let filtered = units;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (unit) =>
          unit.unit_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          unit.unit_symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          unit.unit_category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(
        (unit) => unit.unit_category === categoryFilter
      );
    }

    return filtered;
  }, [units, searchTerm, categoryFilter]);

  // Paginate filtered results
  const paginatedUnits = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUnits.slice(startIndex, startIndex + pageSize);
  }, [filteredUnits, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredUnits.length / pageSize);

  // Breadcrumbs
  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Purchase", href: "/purchase" },
    { label: "Configurations", href: "/purchase/configurations" },
    {
      label: "Unit of Measure",
      href: "/purchase/configurations/unit_of_measure",
      current: true,
    },
  ];

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Handle edit start
  const handleEdit = (unit: UnitOfMeasure) => {
    const unitId = getUnitId(unit.url);
    setEditingId(unitId);
    setEditingUnit({
      id: unitId,
      unit_name: unit.unit_name,
      unit_symbol: unit.unit_symbol,
      unit_category: unit.unit_category,
    });
    setServerErrors({});
  };

  // Handle edit cancel
  const handleCancel = () => {
    setEditingId(null);
    setEditingUnit(null);
    setServerErrors({});
  };

  // Handle unit update
  const handleSave = async (id: number) => {
    if (!editingUnit) return;

    try {
      setServerErrors({});

      // Validate for duplicates
      const validation = validateUnitOfMeasureDuplicates(
        {
          name: editingUnit.unit_name,
          symbol: editingUnit.unit_symbol,
          category: editingUnit.unit_category,
        },
        units.filter((u) => getUnitId(u.url) !== id)
      );

      if (!validation.isValid) {
        setServerErrors({ ...validation.errors });
        return;
      }

      // Update unit via API
      await patchUnit({
        id,
        data: {
          unit_name: editingUnit.unit_name,
          unit_symbol: editingUnit.unit_symbol,
          unit_category: editingUnit.unit_category,
        },
      }).unwrap();

      // Success - close editing mode
      setEditingId(null);
      setEditingUnit(null);

      // Show success modal
      setStatusModal({
        isOpen: true,
        title: "Success!",
        description: "Unit of measure updated successfully!",
        status: "success",
      });
    } catch (error: unknown) {
      // Handle API errors
      if (error && typeof error === "object" && "status" in error) {
        const apiError = error as { status: number; data?: unknown };
        if (apiError.status === 400 || apiError.status === 409) {
          const parsedErrors = parseApiError(apiError);
          setServerErrors({ ...parsedErrors });
        } else {
          setServerErrors({
            general: formatErrorMessage(apiError as ApiError),
          });
        }
      } else {
        setServerErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    }
  };

  // Handle unit deletion
  const handleDelete = async (unit: UnitOfMeasure) => {
    const unitId = getUnitId(unit.url);

    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete "${unit.unit_name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteUnit(unitId).unwrap();

      // Show success modal
      setStatusModal({
        isOpen: true,
        title: "Success!",
        description: "Unit of measure deleted successfully!",
        status: "success",
      });
    } catch (error: unknown) {
      setStatusModal({
        isOpen: true,
        title: "Error",
        description: formatErrorMessage(error as ApiError),
        status: "error",
      });
    }
  };

  // Handle create unit
  const onCreateSubmit = async (data: UnitOfMeasureInput) => {
    setServerErrors({});

    try {
      // Validate for duplicates
      const validation = validateUnitOfMeasureDuplicates(
        {
          name: data.unit_name,
          symbol: data.unit_symbol,
          category: data.unit_category,
        },
        units
      );

      if (!validation.isValid) {
        setServerErrors({ ...validation.errors });
        return;
      }

      await createUnit(data as CreateUnitOfMeasureRequest).unwrap();

      // Success - reset form and close modal
      resetCreate();
      setShowCreateForm(false);

      setStatusModal({
        isOpen: true,
        title: "Success!",
        description: "Unit of measure created successfully!",
        status: "success",
      });
    } catch (error: unknown) {
      if (error && typeof error === "object" && "status" in error) {
        const apiError = error as { status: number; data?: unknown };
        if (apiError.status === 400 || apiError.status === 409) {
          const parsedErrors = parseApiError(apiError);
          setServerErrors({ ...parsedErrors });
        } else {
          setServerErrors({
            general: formatErrorMessage(apiError as ApiError),
          });
        }
      } else {
        setServerErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen mr-4">
      <Breadcrumbs
        items={items}
        action={
          <Button
            variant="ghost"
            className="text-sm text-gray-400 flex items-center gap-2 hover:text-[#3B7CED] transition-colors duration-200"
          >
            Autosaved <AutoSaveIcon />
          </Button>
        }
      />

      {/* Header */}
      <div className="bg-white h-16 border-b border-gray-200 flex justify-between items-center px-6 rounded-lg">
        <motion.div whileHover={{ x: -4 }} transition={{ duration: 0.2 }}>
          <Button
            aria-label="Go back"
            onClick={() => router.back()}
            className="flex items-center gap-3 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded cursor-pointer border-none hover:border-none hover:bg-transparent transition-all duration-200"
          >
            <motion.div whileHover={{ x: -2 }} transition={{ duration: 0.2 }}>
              <MoveLeft size={20} />
            </motion.div>
            <span className="text-base font-medium">Units of Measure</span>
          </Button>
        </motion.div>

        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-[#3B7CED] hover:bg-[#3B7CED]/90 text-white px-4 h-10 rounded-md font-medium transition-colors text-sm flex items-center gap-2"
        >
          <Plus size={16} />
          Add Unit
        </Button>
      </div>

      {/* Table Container */}
      <div className="mx-auto pb-6">
        <AnimatedWrapper
          animation="fadeIn"
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B7CED] mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">
                  Loading units of measure...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-6">
              <Alert variant="destructive">
                <p className="font-medium">Error loading units of measure</p>
                <p className="text-sm mt-1">
                  {error && typeof error === "object" && "data" in error
                    ? formatErrorMessage(error as ApiError)
                    : "An unexpected error occurred"}
                </p>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="mt-3"
                  size="sm"
                >
                  Retry
                </Button>
              </Alert>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && (
            <>
              {/* Table Header */}
              <AnimatedWrapper animation="slideDown" delay={0.2}>
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="col-span-3 text-sm font-medium text-gray-600">
                    Unit Name
                  </div>
                  <div className="col-span-2 text-sm font-medium text-gray-600">
                    Symbol
                  </div>
                  <div className="col-span-3 text-sm font-medium text-gray-600">
                    Category
                  </div>
                  <div className="col-span-2 text-sm font-medium text-gray-600">
                    Date Created
                  </div>
                  <div className="col-span-2"></div>
                </div>
              </AnimatedWrapper>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {paginatedUnits.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      {searchTerm || categoryFilter
                        ? "No units found matching your criteria"
                        : "No units of measure found"}
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {paginatedUnits.map((unit, index) => {
                      const unitId = getUnitId(unit.url);
                      return (
                        <AnimatedWrapper
                          key={unitId}
                          animation="slideUp"
                          delay={index * 0.1}
                          hoverEffect={true}
                          className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors ${
                            editingId === unitId ? "bg-blue-50/30" : ""
                          }`}
                        >
                          {/* Unit Name */}
                          <div className="col-span-3">
                            {editingId === unitId ? (
                              <div className="space-y-2">
                                <Input
                                  value={editingUnit?.unit_name || ""}
                                  onChange={(e) =>
                                    setEditingUnit((prev) =>
                                      prev
                                        ? { ...prev, unit_name: e.target.value }
                                        : null
                                    )
                                  }
                                  className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="Unit name"
                                  autoFocus
                                />
                                {serverErrors.unit_name && (
                                  <p className="text-sm text-red-600">
                                    {serverErrors.unit_name}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-900 font-medium">
                                {unit.unit_name}
                              </span>
                            )}
                          </div>

                          {/* Symbol */}
                          <div className="col-span-2">
                            {editingId === unitId ? (
                              <div className="space-y-2">
                                <Input
                                  value={editingUnit?.unit_symbol || ""}
                                  onChange={(e) =>
                                    setEditingUnit((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            unit_symbol: e.target.value,
                                          }
                                        : null
                                    )
                                  }
                                  className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="kg"
                                  maxLength={20}
                                />
                                {serverErrors.unit_symbol && (
                                  <p className="text-sm text-red-600">
                                    {serverErrors.unit_symbol}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-700 font-mono">
                                {unit.unit_symbol}
                              </span>
                            )}
                          </div>

                          {/* Category */}
                          <div className="col-span-3">
                            {editingId === unitId ? (
                              <div className="space-y-2">
                                <Input
                                  value={editingUnit?.unit_category || ""}
                                  onChange={(e) =>
                                    setEditingUnit((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            unit_category: e.target.value,
                                          }
                                        : null
                                    )
                                  }
                                  className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="Weight"
                                  maxLength={50}
                                />
                                {serverErrors.unit_category && (
                                  <p className="text-sm text-red-600">
                                    {serverErrors.unit_category}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-700">
                                {unit.unit_category}
                              </span>
                            )}
                          </div>

                          {/* Date Created */}
                          <div className="col-span-2">
                            <span className="text-sm text-gray-700">
                              {formatDate(unit.created_on)}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="col-span-2 flex items-center justify-end gap-2">
                            {editingId === unitId ? (
                              <>
                                <Button
                                  onClick={() => handleSave(unitId)}
                                  disabled={isUpdating}
                                  className="bg-[#3B7CED] hover:bg-[#3B7CED]/90 text-white px-4 h-10 rounded-md font-medium transition-colors text-sm"
                                >
                                  {isUpdating ? "Saving..." : "Save"}
                                </Button>
                                <button
                                  onClick={handleCancel}
                                  className="text-gray-500 hover:text-gray-700 transition-colors p-2"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <Button
                                  onClick={() => handleEdit(unit)}
                                  variant="outline"
                                  className="bg-[#3B7CED] hover:bg-[#3B7CED]/90 text-white border-0 px-4 h-10 rounded-md font-medium transition-colors text-sm"
                                >
                                  <Edit2 className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                                <button
                                  onClick={() => handleDelete(unit)}
                                  disabled={isDeleting}
                                  className="text-red-600 hover:text-red-700 font-medium px-3 h-10 transition-colors text-sm disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>

                          {/* General Error Display */}
                          {editingId === unitId && serverErrors.general && (
                            <div className="col-span-12 mt-2">
                              <Alert variant="destructive" className="text-sm">
                                {serverErrors.general}
                              </Alert>
                            </div>
                          )}
                        </AnimatedWrapper>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <AnimatedWrapper animation="slideUp" delay={0.3}>
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, filteredUnits.length)}{" "}
                        of {filteredUnits.length} results
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </AnimatedWrapper>
              )}
            </>
          )}
        </AnimatedWrapper>

        {/* Create Unit Modal */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Create New Unit of Measure
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      resetCreate();
                      setServerErrors({});
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmitCreate(onCreateSubmit)}
                  className="space-y-4"
                >
                  {/* General Error */}
                  {serverErrors.general && (
                    <Alert variant="destructive" className="text-sm">
                      {serverErrors.general}
                    </Alert>
                  )}

                  {/* Unit Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Name
                    </label>
                    <Input
                      {...registerCreate("unit_name")}
                      placeholder="Kilogram"
                      className={createErrors.unit_name ? "border-red-500" : ""}
                    />
                    {createErrors.unit_name && (
                      <p className="text-sm text-red-600 mt-1">
                        {createErrors.unit_name.message}
                      </p>
                    )}
                    {serverErrors.unit_name && (
                      <p className="text-sm text-red-600 mt-1">
                        {serverErrors.unit_name}
                      </p>
                    )}
                  </div>

                  {/* Unit Symbol */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Symbol
                    </label>
                    <Input
                      {...registerCreate("unit_symbol")}
                      placeholder="kg"
                      className={
                        createErrors.unit_symbol ? "border-red-500" : ""
                      }
                    />
                    {createErrors.unit_symbol && (
                      <p className="text-sm text-red-600 mt-1">
                        {createErrors.unit_symbol.message}
                      </p>
                    )}
                    {serverErrors.unit_symbol && (
                      <p className="text-sm text-red-600 mt-1">
                        {serverErrors.unit_symbol}
                      </p>
                    )}
                  </div>

                  {/* Unit Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Category
                    </label>
                    <Input
                      {...registerCreate("unit_category")}
                      placeholder="Weight"
                      className={
                        createErrors.unit_category ? "border-red-500" : ""
                      }
                    />
                    {createErrors.unit_category && (
                      <p className="text-sm text-red-600 mt-1">
                        {createErrors.unit_category.message}
                      </p>
                    )}
                    {serverErrors.unit_category && (
                      <p className="text-sm text-red-600 mt-1">
                        {serverErrors.unit_category}
                      </p>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        resetCreate();
                        setServerErrors({});
                      }}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCreating || !isCreateValid}
                      className="bg-[#3B7CED] hover:bg-[#3B7CED]/90"
                    >
                      {isCreating ? "Creating..." : "Create Unit"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Modal */}
        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
          title={statusModal.title}
          description={statusModal.description}
          status={statusModal.status}
          actionLabel="Continue"
        />
      </div>
    </div>
  );
}
