"use client";

import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { SettingsGrid } from "@/components/Settings/settingsGrid";
import { ReusableTable } from "@/components/Settings/settingsReusableTable";
import { GridCardIcon } from "@/components/icons/gridCardIcon";
import { useGetUsersQuery } from "@/api/settings/usersApi";
import { useRouter } from "next/navigation";

type ApiUser = {
  id?: number | string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  status?: string;
};

type User = {
  id: number | string;
  name: string;
  email: string;
  firstname?: string;
  lastname?: string;
  status: string;
  companyRole?: string;
  phone?: string;
  timezone?: string;
};

export default function Users() {
  const viewMode = useSelector((state: RootState) => state.viewMode.mode);
  const archive = useSelector((state: RootState) => state.viewMode.archive);
  const archiveFlag = !!archive;
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";

  const { data: users } = useGetUsersQuery();
  console.log(users);

  const formattedUsers: User[] =
    users?.map((u: any) => ({
      id: u.id,
      name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
      email: u.email,
      companyRole: u.company_role_details?.name ?? "—", // ROLE NAME
      phone: u.phone_number ?? "—",
      timezone: u.timezone ?? "—", // optional
      status: u.status ?? "active",
    })) ?? [];

  const baseDataset = archiveFlag
    ? formattedUsers.filter((u) => u.status?.toLowerCase() === "archived")
    : formattedUsers;

  const searchLower = searchQuery.toLowerCase();
  const searchedDataset = searchLower
    ? baseDataset.filter((u) =>
        Object.values(u).some((val) =>
          String(val).toLowerCase().includes(searchLower),
        ),
      )
    : baseDataset;

  // 👉 Empty state
  if (searchedDataset.length === 0) {
    return (
      <div className="py-20 w-full flex flex-col items-center justify-center text-center">
        <img
          src="/images/userAvatar.png"
          className="w-20 h-20 opacity-40 mb-4"
          alt="No users"
        />
        <p className="text-gray-500 text-lg">No user has been created yet</p>
      </div>
    );
  }

  const headers = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "companyRole", label: "Company Role" },
    { key: "phone", label: "Phone" },
    { key: "timezone", label: "Timezone" },
    ...(archiveFlag ? [{ key: "status", label: "Status" }] : []),
  ];

  // Navigate to user detail page
  const handleUserClick = (id?: string | number) => {
    router.push(`/settings/users/${id}`);
  };

  return (
    <div className="py-4 w-full">
      {viewMode === "grid" ? (
        <SettingsGrid
          icon={<GridCardIcon />}
          dataList={searchedDataset}
          type="user"
          fieldsToShow={["companyRole", "email", "phone"]}
          onItemClick={handleUserClick}
        />
      ) : (
        <ReusableTable
          headers={headers}
          data={searchedDataset}
          className="bg-white p-4"
          headerClassName="bg-[#F1F2F4]"
          headerTextColor="text-[#7A8A98]"
          bodyTextColor="text-[#1A1A1A]"
          type="user"
          icon={
            <img
              src="/images/userAvatar.png"
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
            />
          }
          iconWrapperClassName="bg-[#E8EFFD]"
          striped
          hover
          checkbox
          renderCell={(row, key) => {
            if (key === "name") {
              return (
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full mr-2 bg-[#E8EFFD]">
                    <img
                      src="/images/userAvatar.png"
                      alt="User Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </span>
                  {row[key]}
                </div>
              );
            }
            return row[key] ?? "—";
          }}
          showStatusColumn={archive}
          onRowClick={handleUserClick}
        />
      )}
    </div>
  );
}
