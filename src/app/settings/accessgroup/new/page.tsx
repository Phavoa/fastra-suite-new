"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import {
  useCreateAccessGroupRightMutation,
  AccessRight,
} from "@/api/settings/accessGroupRightApi";
import {
  useGetApplicationsAndAccessRightsQuery,
  ApplicationsResponse,
  AccessRightDetails,
} from "@/api/settings/applicationsApi";
import StatusModal, { useStatusModal } from "@/components/shared/StatusModal";

interface AccessModule {
  module: string;
  rights: {
    create: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
    reject: boolean;
  };
}

export default function CreateAccessGroupPage() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [selectedApplication, setSelectedApplication] = useState("");
  const [selectedModules, setSelectedModules] = useState<AccessModule[]>([]);
  const [generatedCode, setGeneratedCode] = useState("");

  // API hooks
  const {
    data: applicationsData,
    isLoading: isLoadingApps,
    error: appsError,
  } = useGetApplicationsAndAccessRightsQuery();
  const [
    createAccessGroup,
    { isLoading: isCreating, isSuccess: createSuccess },
  ] = useCreateAccessGroupRightMutation();

  // Status modal hook for success and error messages
  const statusModal = useStatusModal();

  // Function to generate access code
  const getGeneratedCode = React.useCallback(() => {
    if (selectedApplication && selectedModules.length > 0) {
      const prefix = selectedApplication.substring(0, 3).toUpperCase();
      const suffix = Math.floor(Math.random() * 9999)
        .toString()
        .padStart(4, "0");
      return `${prefix}-${selectedModules.length}-${suffix}`;
    }
    return "";
  }, [selectedApplication, selectedModules]);

  // Handle application selection
  const handleApplicationChange = (app: string) => {
    setSelectedApplication(app);
    setSelectedModules([]);

    // Get modules for selected application
    const apps = applicationsData?.applications || [];
    const appData = apps.find((appData) => app in appData);
    const modules = appData ? appData[app] : [];

    // Initialize modules with unchecked rights
    const initialModules: AccessModule[] = modules.map((module) => ({
      module,
      rights: {
        create: false,
        view: false,
        edit: false,
        delete: false,
        approve: false,
        reject: false,
      },
    }));

    setSelectedModules(initialModules);
  };

  // Handle checkbox change for access rights
  const handleRightChange = (
    moduleIndex: number,
    right: keyof AccessModule["rights"],
  ) => {
    const updatedModules = [...selectedModules];
    updatedModules[moduleIndex].rights[right] =
      !updatedModules[moduleIndex].rights[right];
    setSelectedModules(updatedModules);
  };

  // Handle save
  const handleSave = async () => {
    if (!groupName || !selectedApplication || selectedModules.length === 0) {
      statusModal.showError(
        "Validation Error",
        "Please fill in all required fields",
      );
      return;
    }

    // Generate access code
    const code = getGeneratedCode();
    setGeneratedCode(code);

    // Prepare access rights for API in the correct format
    const accessRights: AccessRight[] = [];

    selectedModules.forEach((moduleData) => {
      const selectedRights: number[] = [];

      Object.entries(moduleData.rights).forEach(([right, enabled]) => {
        if (enabled) {
          const accessRightId = applicationsData?.access_rights.find(
            (ar) => ar.name.toLowerCase() === right.toLowerCase(),
          )?.id;

          if (accessRightId) {
            selectedRights.push(accessRightId);
          }
        }
      });

      // Only add module if it has selected rights
      if (selectedRights.length > 0) {
        accessRights.push({
          [moduleData.module]: selectedRights.join(","),
        });
      }
    });

    try {
      await createAccessGroup({
        group_name: groupName,
        application: selectedApplication,
        application_module: selectedModules[0]?.module || "", // Take first module, max 50 chars
        access_rights: accessRights,
        access_right: applicationsData?.access_rights[0]?.id || 1,
      }).unwrap();

      statusModal.showSuccess(
        "Access Group Created",
        "The access group has been successfully created and saved.",
      );
    } catch (err: any) {
      console.error("Failed to create access group:", err);

      // Check if RTK Query returned a validation error
      if (err?.data) {
        console.error("Backend error data:", err.data);
      }

      statusModal.showError(
        "Creation Failed",
        err?.data
          ? JSON.stringify(err.data)
          : "Failed to create access group. Please try again.",
      );
    }
  };

  if (isLoadingApps) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (appsError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">
            Error loading applications. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const accessRightNames = applicationsData?.access_rights || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push("/settings/accessgroup")}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-normal text-gray-900">
            Create Access Group
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Access Setup Section */}
        <div className="mb-10">
          <h2 className="text-[#3B7CED] text-base font-normal mb-6">
            Access setup
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-6 items-start">
            {/* Application Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Application *
              </label>
              <Select
                value={selectedApplication}
                onValueChange={handleApplicationChange}
              >
                <SelectTrigger
                  size="md"
                  className="w-full h-12 bg-white border border-gray-300 rounded px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <SelectValue placeholder="Select application" />
                </SelectTrigger>
                <SelectContent>
                  {applicationsData?.applications.map((appData, index) =>
                    Object.keys(appData).map((appName) => (
                      <SelectItem key={`${index}-${appName}`} value={appName}>
                        {appName}
                      </SelectItem>
                    )),
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Group Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Group name *
              </label>
              <Input
                type="text"
                placeholder="Enter access group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full h-12 bg-white border border-gray-300 rounded px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Auto-generated Code */}
            <div className="">
              <div className="block text-sm font-medium text-gray-900 mb-2">
                Access Code
              </div>
              <div className="mt-4 text-lg font-semibold text-gray-600 tracking-wide">
                {generatedCode || "Will be generated"}
              </div>
            </div>
          </div>
        </div>

        {/* Access Rights Section */}
        {selectedModules.length > 0 && (
          <div className="border-t border-gray-200 pt-8">
            <div className="mb-6">
              <h2 className="text-[#3B7CED] text-base font-normal">
                Access Rights *
              </h2>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 pr-8 text-sm font-medium text-gray-900 w-1/3"></th>
                    {accessRightNames.map((right) => (
                      <th
                        key={right.id}
                        className="text-center py-4 px-4 text-sm font-normal text-[#3B7CED] min-w-[80px]"
                      >
                        {right.name.charAt(0).toUpperCase() +
                          right.name.slice(1)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedModules.map((moduleData, moduleIndex) => (
                    <tr key={moduleIndex} className="border-b border-gray-100">
                      <td className="py-5 pr-8 text-sm font-normal text-gray-900 font-medium">
                        {moduleData.module}
                      </td>
                      {accessRightNames.map((right) => (
                        <td key={right.id} className="py-5 px-4">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={
                                moduleData.rights[
                                  right.name as keyof typeof moduleData.rights
                                ]
                              }
                              onCheckedChange={() =>
                                handleRightChange(
                                  moduleIndex,
                                  right.name as keyof AccessModule["rights"],
                                )
                              }
                              className="w-5 h-5 border-2 border-gray-300 rounded data-[state=checked]:bg-[#3B7CED] data-[state=checked]:border-[#3B7CED]"
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-12 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={
              isCreating ||
              !groupName ||
              !selectedApplication ||
              selectedModules.length === 0
            }
            variant="contained"
            className="bg-[#3B7CED] hover:bg-[#2F6DD5] text-white px-8 py-2"
          >
            {isCreating ? "Creating..." : "Create Access Group"}
          </Button>
        </div>
      </div>

      {/* Status Modal for success and error messages */}
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={statusModal.close}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onAction={
          statusModal.type === "success"
            ? () => {
                statusModal.close();
                router.push("/settings/accessgroup");
              }
            : undefined
        }
        actionText={
          statusModal.type === "success" ? "View Access Groups" : undefined
        }
      />
    </div>
  );
}
