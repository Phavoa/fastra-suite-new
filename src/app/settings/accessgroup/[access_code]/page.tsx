"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter, useParams } from "next/navigation";
import {
  useGetAccessGroupRightQuery,
  useUpdateAccessGroupRightMutation,
} from "@/api/settings/accessGroupRightApi";

type RightKey = "view" | "edit" | "create" | "delete" | "approve" | "reject";

interface ModuleRights {
  module: string;
  rights: Record<RightKey, boolean>;
}

export default function ViewAccessGroupPage() {
  const router = useRouter();
  const { access_code } = useParams();

  if (!access_code || Array.isArray(access_code)) {
    throw new Error("access_code param is missing or invalid");
  }

  const { data, isLoading, error } = useGetAccessGroupRightQuery(
    access_code as string
  );

  const [updateAccessGroup, { isLoading: saving }] =
    useUpdateAccessGroupRightMutation();

  const [editMode, setEditMode] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [application, setApplication] = useState("");
  const [modules, setModules] = useState<ModuleRights[]>([]);

  // Map API data to ModuleRights
  const mapAccessGroupData = (data: typeof data): ModuleRights[] => {
    if (!data || data.length === 0) return [];

    // Initialize all rights as false
    const rights: Record<RightKey, boolean> = {
      view: false,
      edit: false,
      create: false,
      delete: false,
      approve: false,
      reject: false,
    };

    // Loop through API data to mark rights as true
    data.forEach((ar) => {
      const name = ar.access_right_details?.name as RightKey;
      if (name && name in rights) {
        rights[name] = true;
      }
    });

    // All rights belong to the same module (from first item)
    return [
      {
        module: data[0].application_module,
        rights,
      },
    ];
  };

  useEffect(() => {
    if (data) {
      setGroupName(data[0].group_name);
      setApplication(data[0].application);

      const mappedModules = mapAccessGroupData(data);
      setModules(mappedModules);
    }
  }, [data]);

  const toggleRight = (moduleIndex: number, right: RightKey) => {
    const updated = [...modules];
    updated[moduleIndex].rights[right] = !updated[moduleIndex].rights[right];
    setModules(updated);
  };

  const handleSave = async () => {
    if (!access_code) return;

    // Prepare access_rights in API format: array of { access_right: id }
    // Here, you would map boolean rights to their corresponding IDs from API
    // For example purposes, we send just boolean flags
    const access_rights = modules.map((mod) =>
      Object.entries(mod.rights).map(([key, value]) => ({
        name: key,
        value,
      }))
    ).flat();

    await updateAccessGroup({
      access_code,
      data: {
        group_name: groupName,
        application,
        application_module: modules[0]?.module || "",
        access_rights,
        access_right: 0, // Set appropriately
      },
    });

    setEditMode(false);
  };

  const rightKeys: RightKey[] = [
    "view",
    "edit",
    "create",
    "delete",
    "approve",
    "reject",
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading access group…
      </div>
    );
  }

  if (error) {
    return <div>Error loading access group.</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
     {/* HEADER */}
<div className="border-b border-gray-200">
  <div className="px-6 py-4 flex items-center justify-between">
    {/* Left side: SVG icon */}
    <div className="flex items-center gap-3">
      <button
      className="text-gray-600 hover:text-gray-900 mr-4"
      onClick={() => router.push("/settings/accessgroup")}
    >
      <ArrowLeft className="w-5 h-5" />
    </button>

      {/* Access Group title */}
      <h1 className="text-lg font-medium text-gray-900">
        {access_code}(Access Group)
      </h1>
    </div>

    {/* Right side: Edit button */}
    {!editMode ? (
      <Button
        className="bg-[#3B7CED] text-white px-8"
        onClick={() => setEditMode(true)}
      >
        Edit
      </Button>
    ) : (
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="px-6"
          onClick={() => setEditMode(false)}
        >
          Cancel
        </Button>
        <Button
          className="bg-[#3B7CED] text-white px-6"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    )}
  </div>
</div>


      {/* INFO BAR */}
      <div className=" flex flex-col" >
        <div className="flex gap-6 px-6 py-3">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M3.75 10.8341V28.6029C3.75 30.4702 5.11223 31.7122 6.78888 32.7182C8.4862 33.7367 11.335 34.9402 14.4902 36.2731C16.8553 37.2729 18.38 37.9174 20 37.9174C21.62 37.9174 23.1447 37.2729 25.5097 36.2731C28.6647 34.9402 31.5138 33.7367 33.2112 32.7182C34.8878 31.7122 36.25 30.4702 36.25 28.6029V10.8341C36.25 10.5169 36.1318 10.2273 35.9372 10.0068L30.4477 12.672L25.579 15.0279C22.466 16.5343 21.2627 17.0841 20 17.0841C18.7373 17.0841 17.534 16.5343 14.421 15.0279L9.55233 12.672L4.06292 10.0068C3.86818 10.2273 3.75 10.5169 3.75 10.8341ZM10.5593 18.8826C9.94182 18.5739 9.19098 18.8241 8.88223 19.4416C8.5735 20.0591 8.82378 20.8099 9.44125 21.1186L12.7746 22.7852C13.3921 23.0941 14.1429 22.8437 14.4516 22.2262C14.7604 21.6089 14.5101 20.8579 13.8926 20.5492L10.5593 18.8826Z" fill="#3B7CED"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M20 2.08398C18.0458 2.08398 16.2592 2.93148 13.6515 4.16842L8.46463 6.62573C7.2567 7.19785 6.19167 7.70228 5.44235 8.1978C4.69212 8.69392 3.75 9.50765 3.75 10.834C3.75 12.1603 4.69212 12.974 5.44235 13.4702C6.19165 13.9657 7.25668 14.4701 8.4646 15.0422L13.6515 17.4995C16.2592 18.7365 18.0458 19.584 20 19.584C21.9542 19.584 23.7408 18.7365 26.3485 17.4995L31.5353 15.0422C32.7433 14.4701 33.8083 13.9657 34.5577 13.4702C35.3078 12.974 36.25 12.1603 36.25 10.834C36.25 9.50765 35.3078 8.69392 34.5577 8.1978C33.8083 7.70228 32.7433 7.19783 31.5353 6.62572L26.3485 4.16842C23.7408 2.93148 21.9542 2.08398 20 2.08398ZM14.7375 7.19062C17.808 5.73605 18.884 5.26757 20.0002 5.26757C21.0218 5.26757 22.0098 5.66012 24.5248 6.8422L11.7811 13.0803L9.9906 12.2321C8.63943 11.592 7.79295 11.1865 7.26237 10.8358C7.79295 10.485 8.63943 10.0795 9.9906 9.43943L14.7375 7.19062ZM15.4755 14.8293L28.2192 8.59117L30.0097 9.43942C31.3608 10.0795 32.2073 10.485 32.7378 10.8358C32.2073 11.1865 31.3608 11.592 30.0097 12.2321L25.2627 14.4809C22.1923 15.9355 21.1163 16.4039 20.0002 16.4039C18.9783 16.4039 17.9903 16.0114 15.4755 14.8293Z" fill="#3B7CED"/>
            </svg>


          <h4 className="font-bold text-2xl text-[#7A8A98]">{access_code}</h4>

        </div>
        <div className="px-6 py-4 flex items-start gap-12">
          <div>
            <label className="text-lg text-[#1a1a1a">Application</label>
            <div className="text-sm mt-1 text-[#7A8A98] capitalize">{application}</div>
          </div>

        <div className="w-px bg-gray-300" />

        <div>
          <label className="text-lg text-[#1a1a1a">Group Name</label>
          <div className="text-sm mt-1 text-[#7A8A98] lowercase capitalize">
            {groupName.charAt(0).toUpperCase() + groupName.slice(1).toLowerCase()}
          </div>
        </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="px-6">
        <h2 className="text-[#3B7CED] text-base font-normal mb-6">
          Access Rights
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 text-sm font-medium text-gray-900 w-1/3">
                  Access Rights
                </th>
                {rightKeys.map((r) => (
                  <th
                    key={r}
                    className="text-center py-4 text-sm font-medium text-[#3B7CED]"
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {modules.map((mod, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-4 text-sm text-gray-900">{mod.module}</td>
                  {rightKeys.map((right) => (
                    <td key={right} className="py-4 text-center">
                      <Checkbox
                        checked={mod.rights[right]}
                        disabled={!editMode}
                        onCheckedChange={() => toggleRight(index, right)}
                        className="w-5 h-5 border-2 border-gray-300 rounded data-[state=checked]:bg-[#3B7CED] data-[state=checked]:border-[#3B7CED]"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
