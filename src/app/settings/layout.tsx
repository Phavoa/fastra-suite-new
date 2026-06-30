"use client";

import { BreadcrumbItem } from "@/components/shared/BreadScrumbs";
import { NavBar } from "@/components/shared/TopBar/reusableTopBar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { GrayButton } from "@/components/ui/grayButton";
import { CloudUploadFilled } from "@/components/icons/CloudUploadFilled";
import { SettingsControlBar } from "@/components/Settings/SettingsControlBar";
import { useDispatch, useSelector } from "react-redux";
import { setArchive } from "@/components/Settings/viewModeSlice";
import { RootState } from "@/lib/store/store";
import { PageGuard } from "@/components/auth/PageGuard";

type SettingsSection =
  | "company"
  | "user"
  | "accessgroup"
  | "application"
  | "permissiontemplates";

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
    { key: "company", label: "Company", href: "/settings/company/1" },
    { key: "user", label: "User", href: "/settings/users" },
    // {
    //   key: "accessgroup",
    //   label: "Access Groups",
    //   href: "/settings/accessgroup",
    // },
    {
      key: "permissiontemplates",
      label: "Permission Templates",
      href: "/settings/permission-templates",
    },
    //{ label: "Application", href: "/settings/application" },
  ];

  // Determine active section automatically, handling sub-paths
  const getActiveSection = (path: string): SettingsSection => {
    if (path.startsWith("/settings/users")) return "user";
    // if (path.startsWith("/settings/accessgroup")) return "accessgroup";
    if (path.startsWith("/settings/application")) return "application";
    if (path.startsWith("/settings/permission-templates"))
      return "permissiontemplates";
    return "company";
  };

  const activeSection = getActiveSection(pathname);
  const activeNav = navItems.find((item) => item.key === activeSection);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";

  /*const activeSection =
     activeNav?.label.toLowerCase().replace(/\s+/g, "").replace(/s$/, "") ||
     "company";
     */

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Settings", href: "/settings/company/1" },
  ];

  if (activeNav) {
    breadcrumbItems.push({ label: activeNav.label, current: true });
  }

  const handleSearch = (query: string) => {
    let basePath = "/settings";
    switch (activeSection) {
      case "company":
        basePath += "/company/1";
        break;
      case "user":
        basePath += "/users";
        break;
      // case "accessgroup":
      //   basePath += "/accessgroup";
      //   break;
      case "application":
        basePath += "/application";
        break;
      case "permissiontemplates":
        basePath += "/permission-templates";
        break;
    }
    router.push(`${basePath}?search=${encodeURIComponent(query)}`);
  };

  const handleNew = () => {
    let newPath = "/settings";

    switch (activeSection) {
      case "company":
        newPath += "/company/updatecompany";
        break;
      case "user":
        newPath += "/users/newUser";
        break;
      // case "accessgroup":
      //   newPath += "/accessgroup/new";
      //   break;
      case "application":
        newPath += "/application/newApplication";
        break;
      case "permissiontemplates":
        newPath += "/permission-templates/new";
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
      pathname !== "/settings/accessgroup") ||
    (/^\/settings\/permission-templates\/[^/]+$/.test(pathname) &&
      pathname !== "/settings/permission-templates") ||
    pathname === "/settings" ||
    pathname === "/settings/company/1" ||
    /^\/settings\/company\/updatecompany\/?$/.test(pathname);
  return (
    <PageGuard application="settings" module={activeSection}>
      <NavBar title="Settings" items={navItems} activeHref={activeNav?.href} />

      {/* Breadcrumb / secondary top bar */}
      <div className="flex justify-between items-center w-full border-b border-gray-200 px-6 py-2">
        <div className="flex-1">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
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
    </PageGuard>
  );
}
