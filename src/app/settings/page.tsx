"use client";

import { GridCardIcon } from "@/components/icons/gridCardIcon";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { ReusableTable } from "@/components/Settings/settingsReusableTable";
import { useGetCompanyQuery } from "@/api/settings/companyApi";
import { SettingsCard } from "@/components/Settings/settingsCard";
import { useRouter } from "next/navigation"; 
import { LoadingDots } from "@/components/shared/LoadingComponents";

export default function Settings() {
  const viewMode = useSelector((state: RootState) => state.viewMode.mode);
  const router = useRouter();

  const { data: company, isLoading, isError } = useGetCompanyQuery();

  // Early UI states
  if (isLoading) return (
    <div className="p-6 flex justify-center items-center">
      <LoadingDots count={3} />  {/* animated loader */}
    </div>
  );

  if (isError) return <p className="p-6 text-red-500">Failed to load company</p>;
  if (!company) return <p className="p-6">No company has been created yet</p>;

  // Prepare only the fields: title → industry, data → [role, phone, website]
  const roleName =
    Array.isArray(company.roles) && company.roles.length > 0
      ? company.roles[0].name
      : "—";

  // Card data
  const cardData = [
    {
      id: company.id,
      title: company.industry || "Company",
      icon: <GridCardIcon />,
      data: [
        roleName,
        company.phone,
        company.website,
      ].filter(Boolean),
    },
  ];

  // Table data
  const tableData = [
    {
      ...company,
      role: roleName,
    },
  ];

  const handleCardClick = (id: string | number) => {
    router.push(`/settings/company/${id ?? 1}`);
  };

  const headers = [
    { key: "industry", label: "Industry" },
    { key: "role", label: "Role" },
    { key: "phone", label: "Phone" },
    { key: "website", label: "Website" },
  ];

  return (
    <div className="py-4 w-full">
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cardData.map((item) => (
            <SettingsCard
              key={item.id ?? 1}
              icon={item.icon}
              title={item.title}
              data={item.data}
              className="w-[60%]"
              onClick={() => handleCardClick(item.id)}
            />
          ))}
        </div>
      ) : (
        <ReusableTable
          headers={headers}
          data={tableData}
          striped
          checkbox
          icon={<GridCardIcon />}
          headerClassName="bg-[#F1F2F4]"
          className="bg-white p-4"
          headerTextColor="text-[#7A8A98]"
          bodyTextColor="text-[#1A1A1A]"
          iconWrapperClassName="bg-[#E8EFFD]"
          onRowClick={(row) => router.push(`/settings/company/${row.id}`)}
        />
      )}
    </div>
  );
}
