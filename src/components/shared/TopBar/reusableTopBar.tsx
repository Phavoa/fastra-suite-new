"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  Building2,
  ChevronDown,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/lib/store/store";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { clearAuthData } from "@/lib/store/authSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { useSidebarContext } from "@/app/AppWrapper";

interface NavItem {
  label: string;
  href?: string;
  children?: NavItem[];
  module?: string;
  application?: string;
  action?: string;
}

interface TopNavProps {
  title: string;
  items: NavItem[];
  showNotify?: boolean;
  onMenuToggle?: () => void;
}

export function NavBar({
  title,
  items,
  showNotify = true,
  onMenuToggle,
}: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const permissions = usePermissionContext();
  const { toggleSidebar } = useSidebarContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/" || href.endsWith("/")) {
      return pathname === href || pathname === href.slice(0, -1);
    }
    return pathname.startsWith(href);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    dispatch(clearAuthData());
    router.push("/auth/login");
  };

  console.log("user", user);
  return (
    <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30">
      <div className="max-w-360 mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle || toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            <Menu size={24} className="text-gray-600" />
          </button>
          <h1 className="text-xl md:text-2xl truncate">{title}</h1>
        </div>

        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-6 text-sm text-gray-600 h-full"
        >
          {items.map((item, index) => {
            // Dropdown menu item
            if (item.children && item.children.length > 0) {
              const hasActiveChild = item.children.some((child) =>
                isActive(child.href),
              );
              return (
                <DropdownMenu key={`dropdown-${index}`}>
                  <DropdownMenuTrigger
                    className={`h-full flex items-center text-base font-medium transition-all duration-200 hover:text-[#3B7CED] hover:border-b-2 hover:border-[#3B7CED] focus:outline-none focus:text-[#3B7CED] focus:border-b-2 focus:border-[#3B7CED] group ${
                      hasActiveChild
                        ? "text-[#3B7CED] border-b-2 border-[#3B7CED]"
                        : ""
                    }`}
                  >
                    <span className="flex items-center">
                      {item.label}
                      <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-64 bg-white border border-gray-200 shadow-lg rounded-lg py-2 mt-1"
                  >
                    {item.children.map((option, childIndex) => {
                      const Wrapper =
                        option.module && option.application
                          ? ({ children }: { children: React.ReactNode }) => (
                              <ProtectedComponent
                                key={option.href}
                                application={option.application!}
                                module={option.module!}
                                action={option.action || "view"}
                              >
                                {children}
                              </ProtectedComponent>
                            )
                          : ({ children }: { children: React.ReactNode }) => (
                              <>{children}</>
                            );

                      return (
                        <Wrapper key={option.href}>
                          <DropdownMenuItem asChild>
                            <Link
                              href={option.href!}
                              className={`w-full px-3 py-2.5 text-sm cursor-pointer transition-colors duration-150 border-l-2 ${
                                isActive(option.href)
                                  ? "text-[#3B7CED] bg-blue-50 border-l-[#3B7CED] font-medium"
                                  : "text-gray-700 hover:text-[#3B7CED] hover:bg-gray-50 hover:border-l-gray-300"
                              } ${
                                childIndex === item.children!.length - 1
                                  ? "rounded-b-lg"
                                  : ""
                              }`}
                            >
                              {option.label}
                            </Link>
                          </DropdownMenuItem>
                        </Wrapper>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            // Regular link item with optional permission check
            const Wrapper =
              item.module && item.application
                ? ({ children }: { children: React.ReactNode }) => (
                    <ProtectedComponent
                      key={item.href}
                      application={item.application!}
                      module={item.module!}
                      action={item.action || "view"}
                    >
                      {children}
                    </ProtectedComponent>
                  )
                : ({ children }: { children: React.ReactNode }) => (
                    <>{children}</>
                  );

            return (
              <Wrapper key={item.href}>
                <Link
                  href={item.href!}
                  className={`h-full flex items-center text-base transition-colors duration-200 ${
                    isActive(item.href)
                      ? "text-[#3B7CED] border-b-2 border-[#3B7CED]"
                      : "hover:text-gray-900 hover:border-b-2 hover:border-gray-300"
                  }`}
                >
                  {item.label}
                </Link>
              </Wrapper>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Notification Bell icon button*/}
          {showNotify && (
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={24} className="text-gray-600" />
            </button>
          )}

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={18} className="text-blue-600" />
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.username || "User"}
              </span>
              <ChevronDown
                size={16}
                className="hidden md:block text-gray-500"
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>

                {permissions.isAdmin && (
                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Building2 size={16} />
                    Company Profile
                  </Link>
                )}

                <Link
                  href={`/settings/users/${user?.id}`}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User size={16} />
                  My Profile
                </Link>

                <Link
                  href="/settings/change-password"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings size={16} />
                  Change Password
                </Link>

                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
