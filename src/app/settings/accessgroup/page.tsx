"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { SettingsGrid } from "@/components/Settings/settingsGrid";
import { ReusableTable } from "@/components/Settings/settingsReusableTable";
import { GridCardIcon } from "@/components/icons/gridCardIcon";
import { useGetAccessGroupRightsQuery } from "@/api/settings/accessGroupRightApi";
import { useRouter } from "next/navigation";
import { getUniqueAccessGroups } from "@/lib/utils/filterAccessGroup";

// Access group interface matching API structure
export interface AccessGroupData {
  id: number;
  access_code: string;
  group_name: string;
  application: string;
  application_module: string;
  application_module_display: string;
  access_right: number;
  access_right_details: {
    id: number;
    name: string;
  };
  date_created: string;
  date_updated: string;
  // Add a computed property for filtering based on hidden status
  hidden?: boolean;
}

// Utility function to format date to "4 Apr 2024 - 4:48 PM" format
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleDateString("en-GB", { month: "short" });
  const year = date.getFullYear();

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  const minutesFormatted = minutes.toString().padStart(2, "0");

  return `${day} ${month} ${year} - ${hours12}:${minutesFormatted} ${ampm}`;
};

export default function AccessGroup() {
  const viewMode = useSelector((state: RootState) => state.viewMode.mode);
  const archive = useSelector((state: RootState) => state.viewMode.archive);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";

  // Fetch access group rights data
  const {
    data: accessGroupRights,
    isLoading,
    error,
  } = useGetAccessGroupRightsQuery();
  console.log(accessGroupRights);

  const baseData = getUniqueAccessGroups(accessGroupRights ?? []);

  const searchLower = searchQuery.toLowerCase();
  const searchedData = useMemo(() => {
    if (!searchLower) return baseData;
    return baseData.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchLower),
      ),
    );
  }, [baseData, searchLower]);

  console.log(searchedData);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="w-full py-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading access groups...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="w-full py-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">
            Error loading access groups. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const filteredData: AccessGroupData[] = searchedData;

  function normaliseString(str: string): string {
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  const handleUserClick = (access_code?: string | number) => {
    router.push(`/settings/accessgroup/${access_code}`);
  };

  return (
    <div className="w-full py-4">
      {viewMode === "grid" ? (
        <SettingsGrid
          type="company"
          dataList={filteredData.map((item) => ({
            id: item.id,
            access_code: item.access_code, // ✅ include this explicitly
            name: item.group_name,
            access_right_details_name: item.access_right_details?.name || "N/A",
            date_created_formatted: formatDate(item.date_created),
          }))}
          fieldsToShow={[
            "application",
            "access_right_details_name",
            "date_created_formatted",
          ]}
          icon={<GridCardIcon />}
          clickKey="access_code"
          onItemClick={handleUserClick}
        />
      ) : (
        <ReusableTable
          headers={[
            { key: "group_name", label: "Access Group Name" },
            { key: "application", label: "Application" },
            { key: "application_module_display", label: "Module" },
            { key: "access_right_details", label: "Access Right" },
            { key: "date_created", label: "Creation Date" },
          ]}
          data={filteredData}
          checkbox
          showStatusColumn={false}
          striped
          hover
          icon={<GridCardIcon className="w-10 h-10 rounded-full" />}
          iconWrapperClassName="bg-[#E8EFFD]"
          headerClassName="bg-[#F1F2F4]"
          className="bg-white p-4"
          headerTextColor="text-[#7A8A98]"
          bodyTextColor="text-[#1A1A1A]"
          renderCell={(row, key) => {
            if (key === "group_name") {
              return (
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full mr-2 bg-[#E8EFFD]">
                    <GridCardIcon className="w-6 h-6 text-blue-500" />
                  </span>
                  {normaliseString(row[key]) || "N/A"}
                </div>
              );
            }
            if (key === "application") return normaliseString(row[key]);
            if (key === "application_module_display")
              return normaliseString(row[key]);
            if (key === "access_right_details")
              return normaliseString(row[key]?.name) || "N/A";

            if (key === "date_created") return formatDate(row.date_created);
            return row[key] ?? "—";
          }}
          clickKey="access_code"
          onRowClick={(access_code) =>
            router.push(`/settings/accessgroup/${access_code}`)
          }
        />
      )}
    </div>
  );
}
