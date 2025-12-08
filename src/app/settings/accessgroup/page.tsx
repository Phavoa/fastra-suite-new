"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { SettingsGrid } from "@/components/Settings/settingsGrid";
import { ReusableTable } from "@/components/Settings/settingsReusableTable";
import { GridCardIcon } from "@/components/icons/gridCardIcon";

// Dummy data matching your API structure
const dummyAccessGroups = [
  {
    id: 1,
    access_code: "ADMIN001",
    group_name: "Admin Group",
    application: "Dashboard",
    application_module: "User Management",
    access_right: 1,
    access_right_details: { id: 1, name: "Full Access" },
    date_created: "2025-12-01T10:00:00.000Z",
    date_updated: "2025-12-05T12:00:00.000Z",
    status: "active",
  },
  {
    id: 2,
    access_code: "SALES001",
    group_name: "Sales Team",
    application: "CRM",
    application_module: "Leads",
    access_right: 2,
    access_right_details: { id: 2, name: "Read Only" },
    date_created: "2025-11-20T09:30:00.000Z",
    date_updated: "2025-12-02T14:20:00.000Z",
    status: "archived",
  },
  {
    id: 3,
    access_code: "HR001",
    group_name: "HR Group",
    application: "HR Portal",
    application_module: "Recruitment",
    access_right: 1,
    access_right_details: { id: 3, name: "Full Access" },
    date_created: "2025-10-15T08:15:00.000Z",
    date_updated: "2025-11-18T11:45:00.000Z",
    status: "active",
  },
];

export default function AccessGroup() {
  const viewMode = useSelector((state: RootState) => state.viewMode.mode);
  const archive = useSelector((state: RootState) => state.viewMode.archive);

  // Filter data based on archive state
  const filteredData = archive
    ? dummyAccessGroups.filter((group) => group.status === "archived")
    : dummyAccessGroups.filter((group) => group.status !== "archived");

  return (
    <div className="w-full py-4">
      {viewMode === "grid" ? (
        <SettingsGrid
          type="company"
                dataList={filteredData.map((item) => ({
            ...item,
            name: item.group_name, // required by SettingsGrid
            access_right_details_name: item.access_right_details.name, // flatten object
            date_created_formatted: new Date(item.date_created).toLocaleDateString(),
            }))}
            fieldsToShow={["application", "access_right_details_name", "date_created_formatted"]}
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
          showStatusColumn={true}
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
                if (key === "access_right_details") return row.access_right_details.name;
                if (key === "date_created") return new Date(row.date_created).toLocaleDateString();
                return row[key] ?? "—";
            }}
          onRowClick={(row) => console.log("Clicked row", row)}
        />
      )}
    </div>
  );
}
