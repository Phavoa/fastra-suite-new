"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { store, persistor } from "@/lib/store/store";
import { PersistGate } from "redux-persist/integration/react";
import { usePathname } from "next/navigation";
import { PermissionProvider } from "@/contexts/PermissionContext";
import Sidebar from "@/components/shared/Sidebar";
import SessionTimeoutWrapper from "@/components/SessionTimeoutWrapper";

import { createContext, useContext } from "react";

// Create context for sidebar toggle
export const SidebarContext = createContext<{
  toggleSidebar: () => void;
  isOpen: boolean;
}>({
  toggleSidebar: () => {},
  isOpen: false,
});

export const useSidebarContext = () => useContext(SidebarContext);

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PermissionProvider>
          <SidebarContext.Provider
            value={{ toggleSidebar, isOpen: sidebarOpen }}
          >
            <SessionTimeoutWrapper>
              <div className="flex bg-gray-100 min-h-screen">
                {!isAuthPage && (
                  <Sidebar
                    isOpen={sidebarOpen}
                    onClose={closeSidebar}
                    onToggle={toggleSidebar}
                  />
                )}

                {/* Overlay for mobile when sidebar is open */}
                {!isAuthPage && sidebarOpen && (
                  <div
                    className="fixed inset-0 bg-black/30 z-30 md:hidden"
                    onClick={closeSidebar}
                    aria-hidden="true"
                  />
                )}

                <div
                  className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${!isAuthPage ? "md:ml-16" : ""}`}
                >
                  {children}
                </div>
              </div>
            </SessionTimeoutWrapper>
          </SidebarContext.Provider>
        </PermissionProvider>
      </PersistGate>
    </Provider>
  );
}
