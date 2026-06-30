"use client";

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageGuard } from "@/components/auth/PageGuard";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const [requireWaybillPhoto, setRequireWaybillPhoto] = useState(false);

  const handleSubmit = () => {
    // TODO: Connect to mutation
  };

  return (
    <PageGuard application="inventory" module="settings">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
        {/* Header */}
        <div className="flex items-center px-6 py-4 border-b border-gray-100">
          <Link href="/inventory">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
          </Link>
          <h1 className="text-lg font-medium text-gray-800">Inventory Settings</h1>
        </div>

        {/* Form Container */}
        <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-12 overflow-y-auto">
          
          <section>
            <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Receiving & Validation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="flex flex-col gap-2">
                <Label className="text-gray-700 font-medium">Default Warehouse Location</Label>
                <p className="text-sm text-gray-500 mb-2">
                  The primary physical location automatically assigned to all newly received incoming products unless manually overridden during validation.
                </p>
                <Select defaultValue="main_warehouse">
                  <SelectTrigger className="bg-white border-gray-300 rounded w-full md:w-80">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main_warehouse">Main Warehouse (HQ)</SelectItem>
                    <SelectItem value="site_a">Site A Storage Facility</SelectItem>
                    <SelectItem value="site_b">Site B Temporary Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="waybill-toggle" className="text-gray-700 font-medium cursor-pointer">Require Waybill Photo Upload</Label>
                <p className="text-sm text-gray-500 mb-2">
                  When enabled, stockkeepers must upload a clear photo or scanned document of the physical waybill before the system will allow them to validate a receipt.
                </p>
                <div className="flex items-center gap-3">
                  <Switch 
                    id="waybill-toggle" 
                    checked={requireWaybillPhoto} 
                    onCheckedChange={setRequireWaybillPhoto}
                    className="data-[state=checked]:bg-[#3B7CED]"
                  />
                  <span className="text-sm font-medium text-gray-700">{requireWaybillPhoto ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>

            </div>
          </section>

          <section className="border-t border-gray-100 pt-8">
            <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Notifications & Alerts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="flex flex-col gap-2">
                <Label className="text-gray-700 font-medium">Low Stock Alert Recipients</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Select the roles or specific users who will receive automated email and dashboard notifications when any product\'s inventory level falls below its configured reorder point.
                </p>
                <Select defaultValue="managers">
                  <SelectTrigger className="bg-white border-gray-300 rounded w-full md:w-80">
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
          </section>

        </div>

        {/* Footer sticky bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Link href="/inventory">
            <Button variant="outline" className="border-blue-400 text-blue-500 hover:bg-blue-50">
              Cancel
            </Button>
          </Link>
          <Button onClick={handleSubmit} className="bg-[#3B7CED] hover:bg-[#3065c3] text-white">
            Save Settings
          </Button>
        </div>
      </div>
    </PageGuard>
  );
}
