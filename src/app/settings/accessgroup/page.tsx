"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { SettingsGrid } from "@/components/Settings/settingsGrid";
import { ReusableTable } from "@/components/Settings/settingsReusableTable";
import { GridCardIcon } from "@/components/icons/gridCardIcon";
import { useGetAccessGroupRightsQuery } from "@/api/settings/accessGroupRightApi";

// Access group interface matching API structure
interface AccessGroupData {
  id: number;
  access_code: string;
  group_name: string;
  application: string;
  application_module: string;
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

  // Fetch access group rights data
  const {
    data: accessGroupRights,
    isLoading,
    error,
  } = useGetAccessGroupRightsQuery();

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

  // Filter data based on archive state
  // Note: Since the API doesn't include a status/hidden field in the basic response,
  // we'll show all data when archive is false, and handle filtering based on available data
  const filteredData: AccessGroupData[] = accessGroupRights || [];

  return (
    <div className="w-full py-4">
      {viewMode === "grid" ? (
        <SettingsGrid
          type="company"
          dataList={filteredData.map((item) => ({
            ...item,
            name: item.group_name, // required by SettingsGrid
            access_right_details_name: item.access_right_details?.name || "N/A", // flatten object
            date_created_formatted: formatDate(item.date_created),
          }))}
          fieldsToShow={[
            "application",
            "access_right_details_name",
            "date_created_formatted",
          ]}
          icon={<GridCardIcon />}
          onItemClick={(id) => console.log("Clicked Access Group", id)}
          // title will be group_name
        />
      ) : (
        <ReusableTable
          headers={[
            { key: "group_name", label: "Access Group Name" },
            { key: "application", label: "Application" },
            { key: "application_module", label: "Module" },
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
                  {row[key]}
                </div>
              );
            }
            if (key === "access_right_details")
              return row.access_right_details?.name || "N/A";
            if (key === "date_created") return formatDate(row.date_created);
            return row[key] ?? "—";
          }}
          onRowClick={(row) => console.log("Clicked row", row)}
        />
      )}
    </div>
  );
}
