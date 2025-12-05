"use client";

import React from "react";
import { MapPin, Loader2, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { BreadcrumbItem } from "@/components/shared/types";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { Button } from "@/components/ui/button";
import { AutoSaveIcon } from "@/components/shared/icons";
import {
  useGetMultiLocationStatusQuery,
  usePatchMultiLocationStatusMutation,
} from "@/api/inventory/multilocationApi";
import { useGetActiveLocationsQuery } from "@/api/inventory/locationApi";
import type { MultiLocationStatusRequest } from "@/types/multilocation";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";
import { useRouter } from "next/navigation";

const items: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Inventory", href: "/inventory" },
  { label: "Locations", href: "/inventory/configuration", current: true },
];

// Maximum locations allowed when multi-location is disabled
const MAX_LOCATIONS_FOR_DEACTIVATION = 3;

// Helper to extract error message from API error
const getErrorMessage = (error: unknown): string => {
  if (!error) return "An unknown error occurred";

  // Handle RTK Query error format
  if (typeof error === "object" && error !== null) {
    const err = error as {
      data?: { detail?: string; message?: string; error?: string };
      status?: number;
    };

    // Check for detail field (common in Django REST Framework)
    if (err.data?.detail) {
      return err.data.detail;
    }
    // Check for message field
    if (err.data?.message) {
      return err.data.message;
    }
    // Check for error field
    if (err.data?.error) {
      return err.data.error;
    }
    // Check if data is a string
    if (typeof err.data === "string") {
      return err.data;
    }
  }

  return "Failed to update. Please try again.";
};

export default function InventoryConfiguration() {
  const router = useRouter();
  const statusModal = useStatusModal();

  // Fetch current multi-location status
  const {
    data: multiLocationStatus,
    isLoading: isLoadingStatus,
    isError: isStatusError,
    refetch,
  } = useGetMultiLocationStatusQuery();

  // Fetch active locations to check count
  const { data: activeLocations, isLoading: isLoadingLocations } =
    useGetActiveLocationsQuery();

  // Mutation for updating multi-location status
  const [updateMultiLocationStatus, { isLoading: isUpdating }] =
    usePatchMultiLocationStatusMutation();

  // Track optimistic state separately
  const [optimisticValue, setOptimisticValue] = React.useState<boolean | null>(
    null
  );

  // Determine the displayed value: optimistic value takes precedence during updates
  const isMultiLocationEnabled =
    optimisticValue ?? multiLocationStatus?.is_activated ?? false;

  // Get current location count
  const locationCount = activeLocations?.length ?? 0;

  // Check if deactivation is allowed
  const canDeactivate = locationCount <= MAX_LOCATIONS_FOR_DEACTIVATION;

  // Handle toggle change
  const handleToggleChange = async (checked: boolean) => {
    // If trying to deactivate, check location count first
    if (!checked && !canDeactivate) {
      statusModal.showWarning(
        "Cannot Deactivate Multi Location",
        `You currently have ${locationCount} active locations. Please reduce to ${MAX_LOCATIONS_FOR_DEACTIVATION} or fewer locations before deactivating Multi Location.`
      );
      return;
    }

    // Set optimistic value for immediate UI feedback
    setOptimisticValue(checked);

    try {
      const request: MultiLocationStatusRequest = {
        is_activated: checked,
      };
      await updateMultiLocationStatus(request).unwrap();
      // Clear optimistic value on success - API data will be used
      setOptimisticValue(null);

      // Show success message
      statusModal.showSuccess(
        checked ? "Multi Location Activated" : "Multi Location Deactivated",
        checked
          ? "Multi Location has been successfully activated. You can now manage multiple inventory locations."
          : "Multi Location has been successfully deactivated."
      );
    } catch (error) {
      // Revert optimistic value on error
      setOptimisticValue(null);

      // Show error message from API
      const errorMessage = getErrorMessage(error);
      statusModal.showError("Update Failed", errorMessage);

      console.error("Failed to update multi-location status:", error);
    }
  };

  // Handle navigation to locations page
  const handleGoToLocations = () => {
    statusModal.close();
    router.push("/inventory/locations");
  };

  // Determine if the switch should be disabled
  const isSwitchDisabled = isLoadingStatus || isUpdating || isLoadingLocations;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status Modal */}
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={statusModal.close}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        actionText={
          statusModal.type === "warning" ? "Go to Locations" : undefined
        }
        onAction={
          statusModal.type === "warning" ? handleGoToLocations : undefined
        }
        secondaryText={statusModal.type === "warning" ? "Cancel" : undefined}
        onSecondary={
          statusModal.type === "warning" ? statusModal.close : undefined
        }
      />

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={items}
          action={
            <Button
              variant="ghost"
              className="text-sm text-gray-400 flex items-center gap-2 hover:text-[#3B7CED] transition-colors duration-200"
            >
              {isUpdating ? (
                <>
                  Saving... <Loader2 className="w-4 h-4 animate-spin" />
                </>
              ) : (
                <>
                  Autosaved <AutoSaveIcon />
                </>
              )}
            </Button>
          }
        />

        {/* Page Header */}
        <div className="flex items-center justify-between py-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Configuration
          </h2>
        </div>

        {/* Multi Location Section */}
        <section>
          <h3 className="text-base font-medium text-[#3B7CED] mb-4">
            Multi Location
          </h3>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  {isLoadingStatus || isLoadingLocations ? (
                    <Loader2 className="w-5 h-5 text-[#3B7CED] animate-spin" />
                  ) : (
                    <MapPin className="w-5 h-5 text-[#3B7CED]" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-medium text-gray-900">
                    Activate Multi Location
                  </span>
                  {isStatusError && (
                    <span className="text-sm text-red-500">
                      Failed to load status.{" "}
                      <button
                        onClick={() => refetch()}
                        className="ml-1 underline hover:no-underline"
                      >
                        Retry
                      </button>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isUpdating && (
                  <Loader2 className="w-4 h-4 text-[#3B7CED] animate-spin" />
                )}
                <Switch
                  checked={isMultiLocationEnabled}
                  onCheckedChange={handleToggleChange}
                  disabled={isSwitchDisabled}
                  className="data-[state=checked]:bg-[#3B7CED] disabled:opacity-50"
                />
              </div>
            </div>

            {/* Info about current location count when multi-location is enabled */}
            {isMultiLocationEnabled &&
              !isLoadingLocations &&
              locationCount > 0 && (
                <div className="px-6 pb-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      You currently have <strong>{locationCount}</strong> active
                      location{locationCount !== 1 ? "s" : ""}.
                      {locationCount > MAX_LOCATIONS_FOR_DEACTIVATION && (
                        <span className="block mt-1">
                          To deactivate Multi Location, reduce to{" "}
                          {MAX_LOCATIONS_FOR_DEACTIVATION} or fewer locations.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
          </div>
        </section>
      </main>
    </div>
  );
}
