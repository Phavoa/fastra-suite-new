"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateLocationMutation } from "@/api/inventory/locationApi";
import { useGetTenantUsersQuery } from "@/api/settings/tenantUserApi";
import { extractErrorMessage } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface CreateLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (locationId: string) => void;
}

const generateLocationCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export function CreateLocationModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateLocationModalProps) {
  const [createLocation, { isLoading: isCreating }] = useCreateLocationMutation();
  const { data: tenantUsers, isLoading: isLoadingUsers } = useGetTenantUsersQuery({});

  const [locationCode, setLocationCode] = useState("");
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [locationManager, setLocationManager] = useState<string>("");
  const [storeKeeper, setStoreKeeper] = useState<string>("");
  const [contactInformation, setContactInformation] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLocationCode(generateLocationCode());
      setLocationName("");
      setAddress("");
      setLocationManager("");
      setStoreKeeper("");
      setContactInformation("");
      setErrorMessage("");
    }
  }, [isOpen]);

  const userOptions =
    tenantUsers?.map((tenantUser) => {
      if (!tenantUser) return { value: "", label: "Unknown User" };
      const firstName =
        tenantUser.user?.first_name || tenantUser.first_name || "";
      const lastName = tenantUser.user?.last_name || tenantUser.last_name || "";
      const email = tenantUser.user?.email || tenantUser.email || "";
      const fullName = `${firstName} ${lastName}`.trim();
      return {
        value: (tenantUser.id || tenantUser.user_id || "").toString(),
        label: fullName || email || `User #${tenantUser.id}`,
      };
    }) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!locationCode || locationCode.length !== 4) {
      setErrorMessage("Location code must be exactly 4 uppercase alphanumeric characters.");
      return;
    }
    if (!locationName.trim()) {
      setErrorMessage("Location name is required.");
      return;
    }
    if (!address.trim()) {
      setErrorMessage("Address is required.");
      return;
    }
    if (!locationManager) {
      setErrorMessage("Please select a Location Manager.");
      return;
    }
    if (!storeKeeper) {
      setErrorMessage("Please select a Store Keeper.");
      return;
    }

    try {
      const payload = {
        location_code: locationCode.toUpperCase(),
        location_name: locationName.trim(),
        location_type: "internal" as const,
        address: address.trim(),
        location_manager: parseInt(locationManager, 10),
        store_keeper: parseInt(storeKeeper, 10),
        contact_information: contactInformation.trim() || undefined,
        is_hidden: false,
      };

      const res = await createLocation(payload as any).unwrap();
      onSuccess(res.id);
      onClose();
    } catch (err: any) {
      setErrorMessage(
        extractErrorMessage(err, "Failed to create location. Please check your inputs.")
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px] bg-white p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-medium text-gray-800">
            Create Location
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          {errorMessage && (
            <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-gray-700 font-medium">Location Code</Label>
              <Input
                value={locationCode}
                onChange={(e) =>
                  setLocationCode(e.target.value.toUpperCase().slice(0, 4))
                }
                placeholder="Auto-generated"
                maxLength={4}
                className="bg-white border-gray-300 rounded h-10 font-mono"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-gray-700 font-medium">Location Type</Label>
              <Input
                value="Internal"
                disabled
                className="bg-gray-100 border-gray-200 text-gray-500 rounded h-10 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-gray-700 font-medium">Location Name</Label>
            <Input
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Enter Location Name"
              className="bg-white border-gray-300 rounded h-10"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-gray-700 font-medium">Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Location Address"
              className="bg-white border-gray-300 rounded h-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-gray-700 font-medium">Location Manager</Label>
              <Select value={locationManager} onValueChange={setLocationManager}>
                <SelectTrigger className="bg-white border-gray-300 rounded text-gray-700 h-10">
                  <SelectValue placeholder={isLoadingUsers ? "Loading..." : "Select Manager"} />
                </SelectTrigger>
                <SelectContent className="max-h-52">
                  {userOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-gray-700 font-medium">Store Keeper</Label>
              <Select value={storeKeeper} onValueChange={setStoreKeeper}>
                <SelectTrigger className="bg-white border-gray-300 rounded text-gray-700 h-10">
                  <SelectValue placeholder={isLoadingUsers ? "Loading..." : "Select Store Keeper"} />
                </SelectTrigger>
                <SelectContent className="max-h-52">
                  {userOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-gray-700 font-medium">Contact Information (Optional)</Label>
            <Input
              value={contactInformation}
              onChange={(e) => setContactInformation(e.target.value)}
              placeholder="Enter Contact Information"
              className="bg-white border-gray-300 rounded h-10"
            />
          </div>

          <DialogFooter className="mt-4 border-t border-gray-100 pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
              className="border-gray-200 text-gray-600 rounded h-10 px-5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-[#3B7CED] hover:bg-[#3065c3] text-white rounded h-10 px-5 flex items-center gap-2"
            >
              {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Location</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
