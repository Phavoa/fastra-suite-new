"use client";

import { BreadcrumbItem } from "@/components/shared/BreadScrumbs";
import { NavBar } from "@/components/shared/TopBar/reusableTopBar";
import { usePathname, useRouter } from "next/navigation";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { GrayButton } from "@/components/ui/grayButton";
import { CloudUploadFilled } from "@/components/icons/CloudUploadFilled";
import { SettingsControlBar } from "@/components/Settings/SettingsControlBar";
import { useDispatch, useSelector } from "react-redux";
import { setArchive } from "@/components/Settings/viewModeSlice";
import { RootState } from "@/lib/store/store";

type SettingsSection =
  | "company"
  | "user"
  | "accessgroup"
  | "application";


export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const archive = useSelector((state: RootState) => state.viewMode.archive);
  const router = useRouter();

  const navItems: {
    label: string;
    href: string;
    key: SettingsSection;
  }[] = [
    { key: "company", label: "Company", href: "/settings" },
    { key: "user", label: "User", href: "/settings/users" },
    { key: "accessgroup", label: "Access Groups", href: "/settings/accessgroup" },
    //{ label: "Application", href: "/settings/application" },
  ];


  // Determine active section automatically
  const activeNav = navItems.find((item) => pathname === item.href);
  const activeSection: SettingsSection =
  activeNav?.key ?? "company";


  /*const activeSection =
    activeNav?.label.toLowerCase().replace(/\s+/g, "").replace(/s$/, "") ||
    "company";
    */

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Settings", href: "/settings" },
  ];

  if (activeNav) {
    breadcrumbItems.push({ label: activeNav.label, current: true });
  }

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
  };

  const handleNew = () => {
    let newPath = "/settings";

    switch (activeSection) {
      case "company":
        newPath += "/company/newcompany";
        break;
      case "user":
        newPath += "/users/newUser";
        break;
      case "accessgroup":
        newPath += "/accessgroup/new";
        break;
      case "application":
        newPath += "/application/newApplication";
        break;
      default:
        newPath += "/new";
        break;
    }
    router.push(newPath);
  };

  const handleShowArchivedUsers = () => {
    dispatch(setArchive());
  };

  const hideControlBar =
    /^\/settings\/users\/newUser$/.test(pathname) ||
    (/^\/settings\/users\/[^/]+$/.test(pathname) &&
      pathname !== "/settings/users") ||
    (/^\/settings\/accessgroup\/[^/]+$/.test(pathname) &&
      pathname !== "/settings/accessgroup");
  return (
    <>
      <NavBar title="Settings" items={navItems} />

      {/* Breadcrumb / secondary top bar */}
      <div className="flex justify-between items-center w-full border-b border-gray-200 px-6 py-2">
        <div className="flex-1">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <GrayButton size="sm" icon={CloudUploadFilled}>
          Autosaved
        </GrayButton>
      </div>

      {/* Settings control bar */}
      {!hideControlBar && (
        <SettingsControlBar
          activeSection={activeSection}
          onSearch={handleSearch}
          onNew={handleNew}
          initialView="grid"
          onShowArchivedUsers={
            activeSection === "user" ? handleShowArchivedUsers : undefined
          }
        />
      )}

      {/* Page content */}
      <main>{children}</main>
    </>
  );
}
