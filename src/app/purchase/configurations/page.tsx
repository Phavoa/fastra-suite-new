"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { usePermission } from "@/hooks/usePermission";
import {
  normalizePermissions,
  NormalizedPermissions,
} from "@/utils/normalizePermissions";
import { Bell, CloudUpload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CurrencyForm } from "@/components/ui/currency-form";
import { StatusModal } from "@/components/shared/StatusModal";
import {
  useCreateCurrencyMutation,
  useGetCurrenciesQuery,
} from "@/api/purchase/currencyApi";
import { useCreateUnitOfMeasureMutation } from "@/api/purchase/unitOfMeasureApi";
import Link from "next/link";

// Types for REST Countries API response
interface Currency {
  name: string;
  symbol: string;
}

interface Country {
  name: {
    common: string;
    official: string;
  };
  currencies: Record<string, Currency>;
}

interface CurrencyOption {
  country: string;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
}

export default function PurchaseConfigurationPage() {
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
    create: boolean;
  }>({ view: false, create: false });

  const [unitName, setUnitName] = useState("");
  const [unitSymbol, setUnitSymbol] = useState("");
  const [unitCategory, setUnitCategory] = useState("");

  // Currency data state
  const [currencyOptions, setCurrencyOptions] = useState<CurrencyOption[]>([]);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false);
  const [currencyError, setCurrencyError] = useState<string | null>(null);

  // Modal state for unit of measure
  const [unitStatusModal, setUnitStatusModal] = useState<{
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

  const [createCurrency, { isLoading: isCreatingCurrency }] =
    useCreateCurrencyMutation();
  const { data: existingCurrencies = [] } = useGetCurrenciesQuery({});
  const [createUnitOfMeasure, { isLoading: isCreatingUnit }] =
    useCreateUnitOfMeasureMutation();

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
          module: "unitofmeasure",
          action: "view",
        }) ||
        isAdmin ||
        normalizedDirect.permissions["purchase:unitofmeasure"]?.has("view");

      const hasCreateAccess =
        can({
          application: "purchase",
          module: "unitofmeasure",
          action: "create",
        }) ||
        isAdmin ||
        normalizedDirect.permissions["purchase:unitofmeasure"]?.has("create");
      setAccessChecks({
        view: hasViewAccess,
        create: hasCreateAccess,
      });

      // Redirect if no view access
      if (!hasViewAccess) {
        router.push("/unauthorized");
      }

      setLoading(false);
    }, 1000); // Simulate async check

    return () => clearTimeout(timer);
  }, [can, isAdmin, permissions, normalizedDirect, router]);

  // Fetch currencies from REST Countries API
  useEffect(() => {
    const fetchCurrencies = async () => {
      setIsLoadingCurrencies(true);
      setCurrencyError(null);

      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,currencies",
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch countries: ${response.statusText}`);
        }

        const countries: Country[] = await response.json();

        const options: CurrencyOption[] = [];

        countries.forEach((country) => {
          if (country.currencies) {
            Object.entries(country.currencies).forEach(
              ([currencyCode, currencyData]) => {
                options.push({
                  country: country.name.common,
                  currencyCode,
                  currencyName: currencyData.name,
                  currencySymbol: currencyData.symbol,
                });
              },
            );
          }
        });

        // Remove duplicates based on currency code
        const uniqueOptions = options.filter(
          (option, index, self) =>
            index ===
            self.findIndex((o) => o.currencyCode === option.currencyCode),
        );

        // Sort by currency code
        uniqueOptions.sort((a, b) =>
          a.currencyCode.localeCompare(b.currencyCode),
        );

        setCurrencyOptions(uniqueOptions);
      } catch (error) {
        console.error("Error fetching currencies:", error);
        setCurrencyError("Failed to load currencies. Please try again later.");
      } finally {
        setIsLoadingCurrencies(false);
      }
    };

    fetchCurrencies();
  }, []);

  const handleCreateUnitOfMeasure = async () => {
    if (!unitName || !unitSymbol || !unitCategory) {
      setUnitStatusModal({
        isOpen: true,
        title: "Validation Error",
        description: "Please fill in all unit of measure fields",
        status: "error",
      });
      return;
    }

    try {
      await createUnitOfMeasure({
        unit_name: unitName,
        unit_symbol: unitSymbol,
        unit_category: unitCategory,
      }).unwrap();

      // Clear form on success
      setUnitName("");
      setUnitSymbol("");
      setUnitCategory("");
      setUnitStatusModal({
        isOpen: true,
        title: "Success!",
        description: "Unit of measure added successfully!",
        status: "success",
      });
    } catch (error) {
      console.error("Failed to create unit of measure:", error);
      setUnitStatusModal({
        isOpen: true,
        title: "Error",
        description: "Failed to create unit of measure. Please try again.",
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
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="mx-auto px-6 py-4">
        <h1 className="text-xl text-gray-900 mb-8">Configuration</h1>

        {/* Currency Section */}
        <section className="mb-4 bg-white p-4 rounded-md">
          <h2 className="text-lg font-medium text-blue-600 mb-6">Currency</h2>

          {accessChecks.create ? (
            <CurrencyForm
              currencyOptions={currencyOptions}
              existingCurrencies={existingCurrencies}
              onSubmit={async (data) => {
                await createCurrency(data).unwrap();
              }}
              isLoading={isCreatingCurrency || isLoadingCurrencies}
            />
          ) : (
            <div className="text-gray-500 text-center py-8">
              You do not have permission to create currencies.
            </div>
          )}
        </section>

        {/* Unit of Measure Section */}
        <section>
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-lg font-medium text-blue-600 mb-6">
              Unit of Measure
            </h2>
            {accessChecks.create ? (
              <>
                <h3 className="text-base font-semibold text-gray-900 mb-6">
                  Add Unit of Measure
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label
                      htmlFor="unit-name"
                      className="block text-sm font-medium text-gray-900 mb-2"
                    >
                      Unit Name
                    </label>
                    <Input
                      id="unit-name"
                      type="text"
                      placeholder='Enter the unit name (e.g., "Kilogram", "Liter")'
                      value={unitName}
                      onChange={(e) => setUnitName(e.target.value)}
                      className="py-4 h-11 shadow-none rounded-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="unit-symbol"
                      className="block text-sm font-medium text-gray-900 mb-2"
                    >
                      Unit Symbol
                    </label>
                    <Input
                      id="unit-symbol"
                      type="text"
                      placeholder="Enter the symbol (e.g., kg, L)"
                      value={unitSymbol}
                      onChange={(e) => setUnitSymbol(e.target.value)}
                      className="py-4 h-11 shadow-none rounded-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="unit-category"
                      className="block text-sm font-medium text-gray-900 mb-2"
                    >
                      Unit Category
                    </label>
                    <Input
                      id="unit-category"
                      type="text"
                      placeholder="Enter the category (e.g., Weight, Volume)"
                      value={unitCategory}
                      onChange={(e) => setUnitCategory(e.target.value)}
                      className="py-4 h-11 shadow-none rounded-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Link href="/purchase/configurations/unit_of_measure">
                    <Button>View Unit of Measure List</Button>
                  </Link>

                  <Button
                    variant={"contained"}
                    onClick={handleCreateUnitOfMeasure}
                    disabled={isCreatingUnit}
                  >
                    {isCreatingUnit ? "Creating..." : "Create Unit of Measure"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-gray-500 text-center py-8">
                You do not have permission to create unit of measures.
              </div>
            )}
          </div>
        </section>

        {/* Unit of Measure Status Modal */}
        <StatusModal
          isOpen={unitStatusModal.isOpen}
          onClose={() =>
            setUnitStatusModal({ ...unitStatusModal, isOpen: false })
          }
          type={unitStatusModal.status}
          title={unitStatusModal.title}
          message={unitStatusModal.description}
          actionText="Continue"
        />
      </div>
    </div>
  );
}
