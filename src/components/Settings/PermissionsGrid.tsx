"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UserPermissions,
  MODULE_PERMISSIONS_MAPPING,
  ALL_PERMISSION_TYPES,
  ModulePermissions,
} from "@/utils/modulePermissionsStore";

interface PermissionsGridProps {
  permissions: UserPermissions;
  onChange?: (permissions: UserPermissions) => void;
  readOnly?: boolean;
}

export default function PermissionsGrid({
  permissions,
  onChange,
  readOnly = false,
}: PermissionsGridProps) {
  const handleCheckboxChange = (
    moduleKey: keyof UserPermissions,
    permissionKey: string,
    checked: boolean,
  ) => {
    if (readOnly || !onChange) return;

    const updatedPermissions = { ...permissions };
    const updatedModule = { ...updatedPermissions[moduleKey] } as Record<
      string,
      boolean
    >;

    if (checked) {
      updatedModule[permissionKey] = true;
    } else {
      delete updatedModule[permissionKey];
    }

    updatedPermissions[moduleKey] = updatedModule as ModulePermissions;
    onChange(updatedPermissions);
  };

  return (
    <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <table className="w-full border-collapse text-left bg-white min-w-200">
        <thead>
          <tr className="bg-[#F1F2F4] border-b border-gray-200">
            <th className="p-4 font-semibold text-[#7A8A98] text-sm uppercase tracking-wider w-[25%]">
              Module
            </th>
            {ALL_PERMISSION_TYPES.map((type) => (
              <th
                key={type.key}
                className="p-4 font-semibold text-[#7A8A98] text-sm uppercase tracking-wider text-center"
              >
                {type.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Object.entries(MODULE_PERMISSIONS_MAPPING).map(
            ([moduleKey, moduleMeta]) => {
              const currentModuleKey = moduleKey as keyof UserPermissions;
              return (
                <tr
                  key={moduleKey}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {/* Module Label */}
                  <td className="p-4 font-medium text-[#1A1A1A] text-sm align-middle">
                    {moduleMeta.label}
                  </td>

                  {/* Permission Type Columns */}
                  {ALL_PERMISSION_TYPES.map((type) => {
                    const isAllowed = moduleMeta.allowed.includes(type.key);
                    const isChecked =
                      !!permissions[currentModuleKey]?.[
                        type.key as keyof ModulePermissions
                      ];

                    return (
                      <td
                        key={type.key}
                        className={`p-4 text-center align-middle ${
                          !isAllowed ? "bg-gray-100/40 cursor-not-allowed" : ""
                        }`}
                      >
                        {isAllowed ? (
                          <div className="flex justify-center items-center h-full">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(
                                  currentModuleKey,
                                  type.key,
                                  !!checked,
                                )
                              }
                              disabled={readOnly}
                              className={`size-4 transition-all duration-200 text-gray-500 font-bold 
           ring-1 ring-gray-300 hover:ring-gray-400 
           ${!readOnly ? "hover:scale-110 active:scale-95" : ""}`}
                            />
                          </div>
                        ) : (
                          <div className="flex justify-center items-center h-full text-gray-300 select-none">
                            {/* Subtly indicate non-applicable cell */}
                            <span className="text-xs font-semibold text-gray-300/40">
                              —
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
}
