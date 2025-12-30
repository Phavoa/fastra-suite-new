"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter, useParams } from "next/navigation";
import {
  useGetAccessGroupRightQuery,
  useUpdateAccessGroupRightMutation,
  usePartialUpdateAccessGroupRightMutation
} from "@/api/settings/accessGroupRightApi";
import { BoxIcon } from "@/components/icons/boxIcon";

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
    usePartialUpdateAccessGroupRightMutation();

  const [editMode, setEditMode] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [application, setApplication] = useState("");
  const [modules, setModules] = useState<ModuleRights[]>([]);

  // ✅ Build rights from the API using booleans (true/false)
  const mapAccessGroupData = (data: any): ModuleRights[] => {
    if (!data || data.length === 0) return [];

    const defaultRights: Record<RightKey, boolean> = {
      view: false,
      edit: false,
      create: false,
      delete: false,
      approve: false,
      reject: false,
    };

    data.forEach((item: any) => {
      const name = item?.access_right_details?.name as RightKey;

      if (name && defaultRights[name] !== undefined) {
        defaultRights[name] = true;
      }
    });

    return [
      {
        module: data[0].application_module,
        rights: defaultRights,
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

  // Prepare data for saving
  const handleSave = async () => {
    if (!access_code) return;

    // Convert rights → API format: list of right names that are true
    const access_rights = Object.entries(modules[0].rights)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => ({
        access_right_name: name,
      }));

    await updateAccessGroup({
      access_code,
      data: {
        group_name: groupName,
        application,
        application_module: modules[0].module,
        access_rights,
        access_right: 0
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
      <div className="border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="text-gray-600 hover:text-gray-900 mr-4"
              onClick={() => router.push("/settings/accessgroup")}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-medium text-gray-900">
              {access_code} (Access Group)
            </h1>
          </div>

          {!editMode ? (
            <Button
              className="bg-white text-[#3B7CED] px-8 border-0"
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
      <div className="flex flex-col border-b border-[#E2E6E9] pb-4 pt-4">
        <div className="flex gap-6 px-6 py-3">
          <BoxIcon />
          <h4 className="font-bold text-2xl text-[#7A8A98]">{access_code}</h4>
        </div>

        <div className="px-6 py-4 flex items-start gap-12">
          <div>
            <label className="text-lg text-[#1a1a1a]">Application</label>
            <div className="text-sm mt-1 text-[#7A8A98] capitalize">
              {application}
            </div>
          </div>

          <div className="w-px bg-gray-300 h-14" />

          <div>
            <label className="text-lg text-[#1a1a1a]">Group Name</label>
            <div className="text-sm mt-1 text-[#7A8A98] capitalize">
              {groupName}
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="px-6">
        <div className="overflow-x-auto">
          <table className="w-[70%]">
            <thead>
              <tr className="border-0 border-gray-200">
                <th className="text-left py-4 text-lg font-normal text-[#3B7CED] w-1/3">
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
