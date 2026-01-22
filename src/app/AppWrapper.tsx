"use client";

import { Provider } from "react-redux";
import { store, persistor } from "@/lib/store/store";
import { PersistGate } from "redux-persist/integration/react";
import { usePathname } from "next/navigation";
import { PermissionProvider } from "@/contexts/PermissionContext";
import Sidebar from "@/components/shared/Sidebar";

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PermissionProvider>
          <div className="flex gap-4 bg-gray-100">
            {!isAuthPage ? <Sidebar /> : null}
            <div className="flex-1 ml-20 min-h-screen">{children}</div>
          </div>
        </PermissionProvider>
      </PersistGate>
    </Provider>
  );
}
