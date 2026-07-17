"use client";

import React, { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageGuard } from "@/components/auth/PageGuard";
import Link from "next/link";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import { BreadcrumbItem } from "@/components/shared/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToastNotification } from "@/components/shared/ToastNotification";

export default function SettingsPage() {
  const [requireWaybillPhoto, setRequireWaybillPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
    show: boolean;
  }>({
    message: "",
    type: "success",
    show: false,
  });

  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Configuration", href: "/inventory/configuration" },
    { label: "General Settings", href: "/inventory/configuration/settings", current: true },
  ];

  const handleSubmit = () => {
    setIsSubmitting(true);
    setNotification({
      message: "Inventory configuration settings saved successfully.",
      type: "success",
      show: true,
    });
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  return (
    <PageGuard application="inventory" module="settings">
      {/* Two-tone: gray page canvas */}
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-[#F6F9FC] relative pb-24">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 w-full flex flex-col gap-6">
          <Breadcrumbs
            items={items}
            action={
              <Button variant="ghost" className="text-sm text-gray-400 flex items-center gap-2 hover:text-[#3B7CED] transition-colors">
                Autosaved <AutoSaveIcon />
              </Button>
            }
          />

          {/* Clean Header Card */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border border-gray-100 rounded-lg shadow-2xs">
            <div className="flex items-center gap-3">
              <Link href="/inventory/configuration">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#32325D]">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-[#32325D]">Inventory System Settings</h1>
                <p className="text-xs text-[#8898AA] mt-0.5">Configure system-wide receiving policies, mandatory attachments, and notification thresholds.</p>
              </div>
            </div>
          </div>

          {/* White Container Card 1: Receiving & Validation */}
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#32325D]">Receiving & Validation Policies</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="flex flex-col gap-2.5">
                <Label className="text-sm font-semibold text-[#32325D]">Default Warehouse Location</Label>
                <p className="text-xs text-[#525F7F] leading-relaxed">
                  The primary physical location automatically assigned to all newly received incoming products unless manually overridden during receipt validation.
                </p>
                <Select defaultValue="main_warehouse">
                  <SelectTrigger className="bg-white border-gray-200 rounded-md w-full md:w-80 h-9 text-sm font-medium text-[#32325D] focus:ring-[#3B7CED] mt-1">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main_warehouse">Main Warehouse (HQ)</SelectItem>
                    <SelectItem value="site_a">Site A Storage Facility</SelectItem>
                    <SelectItem value="site_b">Site B Temporary Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2.5">
                <Label htmlFor="waybill-toggle" className="text-sm font-semibold text-[#32325D] cursor-pointer">Require Waybill Photo Upload</Label>
                <p className="text-xs text-[#525F7F] leading-relaxed">
                  When enabled, stockkeepers must attach a clear photograph or scanned document of the physical vendor waybill before the system permits receipt validation.
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <Switch 
                    id="waybill-toggle" 
                    checked={requireWaybillPhoto} 
                    onCheckedChange={setRequireWaybillPhoto}
                    className="data-[state=checked]:bg-[#3B7CED]"
                  />
                  <span className="text-sm font-semibold text-[#32325D]">{requireWaybillPhoto ? "Enabled (Mandatory Attachment)" : "Disabled (Optional)"}</span>
                </div>
              </div>

            </div>
          </div>

          {/* White Container Card 2: Notifications & Alerts */}
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#32325D]">Notifications & Alert Thresholds</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="flex flex-col gap-2.5">
                <Label className="text-sm font-semibold text-[#32325D]">Low Stock Alert Recipients</Label>
                <p className="text-xs text-[#525F7F] leading-relaxed">
                  Select the roles or specific personnel who will receive automated email and dashboard notifications when any product stock level drops below its configured reorder point.
                </p>
                <Select defaultValue="managers">
                  <SelectTrigger className="bg-white border-gray-200 rounded-md w-full md:w-80 h-9 text-sm font-medium text-[#32325D] focus:ring-[#3B7CED] mt-1">
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="managers">All Inventory Managers</SelectItem>
                    <SelectItem value="admins">Administrators Only</SelectItem>
                    <SelectItem value="all">All Inventory Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </div>

        </main>

        {/* Fixed Sticky Footer Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
          <Link href="/inventory/configuration">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm h-9 px-4 font-medium">
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#3B7CED] hover:bg-[#3065c3] text-white text-sm h-9 px-4 font-semibold shadow-2xs flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        <ToastNotification
          message={notification.message}
          type={notification.type}
          show={notification.show}
          onClose={closeNotification}
        />
      </div>
    </PageGuard>
  );
}
