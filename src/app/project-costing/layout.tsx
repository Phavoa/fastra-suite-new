import React from "react";
import { NavBar } from "@/components/shared/TopBar/reusableTopBar";

export default function ProjectCostingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navItems = [
    {
      label: "Project Costing",
      href: "/project-costing",
      application: "project-costing",
      module: "project-costing",
    },
    {
      label: "New Project",
      href: "/project-costing/new",
      application: "project-costing",
      module: "new-project",
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <NavBar title="Project Costing" items={navItems} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
