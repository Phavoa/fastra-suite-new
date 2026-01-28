"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { usePermission } from "@/hooks/usePermission";
import {
  normalizePermissions,
  NormalizedPermissions,
} from "@/utils/normalizePermissions";
import { MoveLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BreadcrumbItem } from "@/components/shared/types";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import { StatusModal } from "@/components/shared/StatusModal";
import { Alert } from "@/components/ui/alert";
import {
  useGetCurrenciesQuery,
  useDeleteCurrencyMutation,
  usePatchCurrencyMutation,
  type Currency,
} from "@/api/purchase/currencyApi";
import {
  formatErrorMessage,
  parseApiError,
  type ApiError,
} from "@/lib/utils/error-handling";
import { validateCurrencyDuplicates } from "@/lib/utils/error-handling";
import { motion } from "framer-motion";
import { AnimatedWrapper } from "@/components/shared/AnimatedWrapper";

interface EditingCurrency {
  id: number;
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
}

export default function CurrencyListPage() {
  const router = useRouter();
  const { can } = usePermission();
  const { isAdmin, permissions } = usePermissionContext();
  const user = useSelector((state: RootState) => state.auth.user);
  const user_accesses = useSelector(
    (state: RootState) => state.auth.user_accesses,
  );
  const [loading, setLoading] = useState(true);
  const [accessChecks, setAccessChecks] = useState<{
    view: boolean;
    edit: boolean;
    delete: boolean;
  }>({ view: false, edit: false, delete: false });

  // API hooks for currency operations
  const {
    data: currencies = [],
    isLoading,
    error,
    refetch,
  } = useGetCurrenciesQuery({});
  const queryLoading = isLoading as boolean;
  const [deleteCurrency, { isLoading: isDeleting }] =
    useDeleteCurrencyMutation();
  const [patchCurrency, { isLoading: isUpdating }] = usePatchCurrencyMutation();

  // Direct normalization for demonstration
  const normalizedDirect: NormalizedPermissions = useMemo(() => {
    if (user_accesses) {
      try {
        return normalizePermissions({ user_accesses });
      } catch (error) {
        console.error("Error normalizing permissions:", error);
        return { isAdmin: false, permissions: {} };
      }
    }
    return { isAdmin: false, permissions: {} };
  }, [user_accesses]);

  // Comprehensive permission checks
  useEffect(() => {
    // Simulate loading delay for demonstration
    const timer = setTimeout(() => {
      const hasViewAccess =
        can({
          application: "purchase",
          module: "currencies",
          action: "view",
        }) ||
        isAdmin ||
        normalizedDirect.permissions["purchase:currencies"]?.has("view");

      const hasEditAccess =
        can({
          application: "purchase",
          module: "currencies",
          action: "edit",
        }) ||
        isAdmin ||
        normalizedDirect.permissions["purchase:currencies"]?.has("edit");

      const hasDeleteAccess =
        can({
          application: "purchase",
          module: "currencies",
          action: "delete",
        }) ||
        isAdmin ||
        normalizedDirect.permissions["purchase:currencies"]?.has("delete");

      setAccessChecks({
        view: hasViewAccess,
        edit: hasEditAccess,
        delete: hasDeleteAccess,
      });

      // Redirect if no view access
      if (!hasViewAccess) {
        router.push("/unauthorized");
      }

      setLoading(false);
    }, 1000); // Simulate async check

    return () => clearTimeout(timer);
  }, [can, isAdmin, permissions, normalizedDirect, router]);

  // Local state for editing and UI
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingCurrency, setEditingCurrency] =
    useState<EditingCurrency | null>(null);
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
  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Purchase", href: "/purchase" },
    { label: "Configurations", href: "/purchase/configurations" },
    {
      label: "Currencies",
      href: "/purchase/configurations/currencies",
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

  // Handle editing start
  const handleEdit = (currency: Currency) => {
    setEditingId(currency.id);
    setEditingCurrency({
      id: currency.id,
      currency_name: currency.currency_name,
      currency_code: currency.currency_code,
      currency_symbol: currency.currency_symbol,
    });
    setServerErrors({});
  };

  // Handle editing cancel
  const handleCancel = () => {
    setEditingId(null);
    setEditingCurrency(null);
    setServerErrors({});
  };

  // Handle currency update
  const handleSave = async (id: number) => {
    if (!editingCurrency) return;

    try {
      setServerErrors({});

      // Validate for duplicates against other currencies
      const validation = validateCurrencyDuplicates(
        {
          name: editingCurrency.currency_name,
          code: editingCurrency.currency_code,
          symbol: editingCurrency.currency_symbol,
        },
        currencies.filter((c) => c.id !== id),
      );

      if (!validation.isValid) {
        setServerErrors({ ...validation.errors });
        return;
      }

      // Use patch to update only provided fields
      await patchCurrency({
        id,
        data: {
          currency_name: editingCurrency.currency_name,
          currency_code: editingCurrency.currency_code,
          currency_symbol: editingCurrency.currency_symbol,
        },
      }).unwrap();

      // Success - close editing mode
      setEditingId(null);
      setEditingCurrency(null);

      // Show success modal
      setStatusModal({
        isOpen: true,
        title: "Success!",
        description: "Currency updated successfully!",
        status: "success",
      });
    } catch (error: unknown) {
      // Handle API errors
      if (error && typeof error === "object" && "status" in error) {
        const apiError = error as { status: number; data?: any };
        if (apiError.status === 400 || apiError.status === 409) {
          const parsedErrors = parseApiError(apiError as any);
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

  // Handle currency deletion
  const handleDelete = async (id: number) => {
    const currency = currencies.find((c) => c.id === id);
    if (!currency) return;

    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete "${currency.currency_name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await deleteCurrency(id).unwrap();

      // Show success modal
      setStatusModal({
        isOpen: true,
        title: "Success!",
        description: "Currency deleted successfully!",
        status: "success",
      });
    } catch (error: unknown) {
      // Handle API errors
      setStatusModal({
        isOpen: true,
        title: "Error",
        description: formatErrorMessage(error as ApiError),
        status: "error",
      });
    }
  };

  // Handle edge cases
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Loading User Data
          </h1>
          <p className="text-gray-600">
            Please wait while we load your user information...
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Checking Permissions
          </h1>
          <p className="text-gray-600">Verifying your access rights...</p>
        </div>
      </div>
    );
  }

  if (!accessChecks.view) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You do not have the required permissions to view this page.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to unauthorized page...
          </p>
        </div>
      </div>
    );
  }

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
      <div className=" bg-white h-16 border-b border-gray-200 flex justify-between items-center px-6 rounded-lg">
        <motion.div whileHover={{ x: -4 }} transition={{ duration: 0.2 }}>
          <Button
            aria-label="Go back"
            onClick={() => router.back()}
            className="flex items-center gap-3 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded cursor-pointer border-none hover:border-none hover:bg-transparent transition-all duration-200"
          >
            <motion.div whileHover={{ x: -2 }} transition={{ duration: 0.2 }}>
              <MoveLeft size={20} />
            </motion.div>
            <span className="text-base font-medium">Currencies</span>
          </Button>
        </motion.div>
      </div>

      {/* Table Container */}
      <div className=" mx-auto pb-6">
        <AnimatedWrapper
          animation="fadeIn"
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Loading State */}
          {queryLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B7CED] mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">
                  Loading currencies...
                </p>
              </div>
            </div>
          ) : null}

          {/* Error State */}
          {error && (
            <div className="p-6">
              <Alert variant="destructive">
                <p className="font-medium">Error loading currencies</p>
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
          {!queryLoading && !error && (
            <>
              {/* Table Header */}
              <AnimatedWrapper animation="slideDown" delay={0.1}>
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="col-span-3 text-sm font-medium text-gray-600">
                    Currency Name
                  </div>
                  <div className="col-span-2 text-sm font-medium text-gray-600">
                    Code
                  </div>
                  <div className="col-span-2 text-sm font-medium text-gray-600">
                    Symbol
                  </div>
                  <div className="col-span-3 text-sm font-medium text-gray-600">
                    Date Created
                  </div>
                  <div className="col-span-2"></div>
                </div>
              </AnimatedWrapper>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {currencies.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No currencies found</p>
                  </div>
                ) : (
                  currencies.map((currency, index) => (
                    <AnimatedWrapper
                      key={currency.id}
                      animation="slideUp"
                      delay={index * 0.1}
                      hoverEffect={true}
                      className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors ${
                        editingId === currency.id ? "bg-blue-50/30" : ""
                      }`}
                    >
                      {/* Currency Name */}
                      <div className="col-span-3">
                        {editingId === currency.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editingCurrency?.currency_name || ""}
                              onChange={(e) =>
                                setEditingCurrency((prev) =>
                                  prev
                                    ? { ...prev, currency_name: e.target.value }
                                    : null,
                                )
                              }
                              className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Currency name"
                              autoFocus
                            />
                            {serverErrors.currency_name && (
                              <p className="text-sm text-red-600">
                                {serverErrors.currency_name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-900 font-medium">
                            {currency.currency_name}
                          </span>
                        )}
                      </div>

                      {/* Currency Code */}
                      <div className="col-span-2">
                        {editingId === currency.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editingCurrency?.currency_code || ""}
                              onChange={(e) =>
                                setEditingCurrency((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        currency_code:
                                          e.target.value.toUpperCase(),
                                      }
                                    : null,
                                )
                              }
                              className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="USD"
                              maxLength={3}
                            />
                            {serverErrors.currency_code && (
                              <p className="text-sm text-red-600">
                                {serverErrors.currency_code}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-700 font-mono">
                            {currency.currency_code}
                          </span>
                        )}
                      </div>

                      {/* Symbol */}
                      <div className="col-span-2">
                        {editingId === currency.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editingCurrency?.currency_symbol || ""}
                              onChange={(e) =>
                                setEditingCurrency((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        currency_symbol: e.target.value,
                                      }
                                    : null,
                                )
                              }
                              className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="$"
                              maxLength={10}
                            />
                            {serverErrors.currency_symbol && (
                              <p className="text-sm text-red-600">
                                {serverErrors.currency_symbol}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-700">
                            {currency.currency_symbol}
                          </span>
                        )}
                      </div>

                      {/* Date Created */}
                      <div className="col-span-3">
                        <span className="text-sm text-gray-700">
                          {formatDate(currency.created_on)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        {editingId === currency.id ? (
                          <>
                            {accessChecks.edit && (
                              <Button
                                onClick={() => handleSave(currency.id)}
                                disabled={isUpdating}
                                className="bg-[#3B7CED] hover:bg-[#3B7CED]/90 text-white px-4 h-10 rounded-md font-medium transition-colors text-sm"
                              >
                                {isUpdating ? "Saving..." : "Save"}
                              </Button>
                            )}
                            <button
                              onClick={handleCancel}
                              className="text-gray-500 hover:text-gray-700 transition-colors p-2"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            {accessChecks.edit && (
                              <Button
                                onClick={() => handleEdit(currency)}
                                variant="outline"
                                className="bg-[#3B7CED] hover:bg-[#3B7CED]/90 text-white border-0 px-4 h-10 rounded-md font-medium transition-colors text-sm"
                              >
                                Edit
                              </Button>
                            )}
                            {accessChecks.delete && (
                              <button
                                onClick={() => handleDelete(currency.id)}
                                disabled={isDeleting}
                                className="text-red-600 hover:text-red-700 font-medium px-3 h-10 transition-colors text-sm disabled:opacity-50"
                              >
                                {isDeleting ? "Deleting..." : "Delete"}
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      {/* General Error Display */}
                      {editingId === currency.id && serverErrors.general && (
                        <div className="col-span-12 mt-2">
                          <Alert variant="destructive" className="text-sm">
                            {serverErrors.general}
                          </Alert>
                        </div>
                      )}
                    </AnimatedWrapper>
                  ))
                )}
              </div>
            </>
          )}
        </AnimatedWrapper>

        {/* Status Modal */}
        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
          type={statusModal.status}
          title={statusModal.title}
          message={statusModal.description}
          actionText="Continue"
        />
      </div>
    </div>
  );
}
