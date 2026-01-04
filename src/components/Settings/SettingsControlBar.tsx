"use client";

import React, { useState } from "react";
import { GrayButton } from "@/components/ui/grayButton";
import { cn } from "@/lib/utils";
import { GridViewIcon } from "../icons/GridIcon";
import { ListViewIcon } from "../icons/ListViewIcon";
import { RootState } from "@/lib/store/store";
import { setViewMode } from "./viewModeSlice";
import { useDispatch, useSelector } from "react-redux";

type SettingsControlBarProps = {
  activeSection: "company" | "user" | "accessgroup" | "application";
  onSearch?: (query: string) => void;
  onNew?: () => void;
  onShowArchivedUsers?: () => void; // NEW HANDLER
  initialView?: "grid" | "list";
  className?: string;
};

export const SettingsControlBar = ({
  activeSection,
  onSearch,
  onNew,
  onShowArchivedUsers,
  initialView = "grid",
  className,
}: SettingsControlBarProps) => {
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();
  const viewMode = useSelector((state: RootState) => state.viewMode.mode);
  const archive = useSelector((state: RootState) => state.viewMode.archive); 

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const handleToggleView = (mode: "grid" | "list") => {
    dispatch(setViewMode(mode));
  };
  console.log(activeSection)
  const getButtonLabel = () => {
    switch (activeSection) {
      case "company":
        return "New Company";
      case "user":
        return "Create User";
      case "accessgroup":
        return "New Access Group";
      case "application":
        return "New Application";
      default:
        return "New Item";
    }
  };

  return (
    <div
      className={cn(
        "w-full flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-3 border-b border-gray-200",
        className
      )}
    >
      {/* Left: Search */}
      <div className="flex gap-4 min-w-[40%]">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder={`Search ${activeSection}...`}
          className="w-full flex-1 px-3 py-2 border text-sm focus:outline-none focus:ring-2 focus:ring-[#3B7CED]"
        />
      </div>

      {/* Right Controls */}
      <div className="flex gap-3 items-center">

        {/* Primary Button */}
        <GrayButton
          size="md"
          className="bg-[#3B7CED] text-white"
          onClick={onNew}
        >
          {getButtonLabel()}
        </GrayButton>

        {/* Secondary Button (ONLY on Users Page) */}
        {activeSection === "user" && (
          <GrayButton
            size="md"
            className={archive
              ? "bg-[#3B7CED] text-white":
              "bg-white border border-[#3B7CED] text-[#3B7CED]"
            }
           
            onClick={onShowArchivedUsers}
          >
            {/* Archived Users */}
          </GrayButton>
        )}

        {/* Grid/List Toggle */}
        <div className="flex items-center border border-[#E2E6E9] rounded-sm px-2 h-11">
          <button
            className="p-1 hover:bg-gray-100"
            onClick={() => handleToggleView("grid")}
          >
            <GridViewIcon
              className="w-5 h-5"
              fill={viewMode === "grid" ? "#3B7CED" : "#A9B3BC"}
            />
          </button>

          <div className="w-px self-stretch bg-[#E2E6E9] mx-1" />

          <button
            className="p-1 hover:bg-gray-100"
            onClick={() => handleToggleView("list")}
          >
            <ListViewIcon
              className="w-5 h-5"
              fill={viewMode === "list" ? "#3B7CED" : "#A9B3BC"}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
