"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { usePermission } from "@/hooks/usePermission";
import {
  normalizePermissions,
  NormalizedPermissions,
} from "@/utils/normalizePermissions";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Breadcrumbs from "../../../components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import {
  ActionBar,
  ProductsTable,
  ProductsCards,
  ProductsTableSkeleton,
  ProductsCardsSkeleton,
  type BreadcrumbItem,
} from "../../../components/purchase/products/index";
import {
  useGetProductsQuery,
  type Product as ApiProduct,
} from "../../../api/purchase/productsApi";
import type { Product } from "../../../types/purchase";

export default function Page() {
  const router = useRouter();
  const { can } = usePermission();
  const { isAdmin, permissions } = usePermissionContext();
  const user = useSelector((state: RootState) => state.auth.user);
  const user_accesses = useSelector(
    (state: RootState) => state.auth.user_accesses,
  );
  const [loading, setLoading] = useState(true);
  const [accessChecks, setAccessChecks] = useState<{
    hook: boolean;
    context: boolean;
    direct: boolean;
    overall: boolean;
  }>({ hook: false, context: false, direct: false, overall: false });

  const [currentView, setCurrentView] = React.useState<"grid" | "list">("list");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products with search parameter
  const {
    data: apiProducts,
    isLoading,
    error,
    refetch,
  } = useGetProductsQuery(debouncedSearch ? { search: debouncedSearch } : {});

  // Refetch products on every page mount
  React.useEffect(() => {
    refetch();
  }, []);

  // Direct normalization for demonstration
  const normalizedDirect: NormalizedPermissions = useMemo(() => {
    if (user_accesses) {
      try {
        return normalizePermissions({ user_accesses });
      } catch (error) {
        console.error("Error normalizing permissions:", error);
        return { isAdmin: false, permissions: {} };
      }
    }
    return { isAdmin: false, permissions: {} };
  }, [user_accesses]);

  // Comprehensive permission checks
  const checkPermissions = useMemo(() => {
    const requiredPermissions = [
      { application: "purchase", module: "products", action: "view" },
    ];

    const results = requiredPermissions.map((perm) => ({
      ...perm,
      hook: can(perm),
      context:
        isAdmin ||
        permissions[`${perm.application}:${perm.module}`]?.has(perm.action),
      direct:
        normalizedDirect.isAdmin ||
        normalizedDirect.permissions[`${perm.application}:${perm.module}`]?.has(
          perm.action,
        ),
    }));

    return results;
  }, [can, isAdmin, permissions, normalizedDirect]);

  useEffect(() => {
    // Simulate loading delay for demonstration
    const timer = setTimeout(() => {
      // Check using hook
      const hasAccessViaHook = can({
        application: "purchase",
        module: "products",
        action: "view",
      });

      // Check using context directly
      const hasAccessViaContext =
        isAdmin || permissions["purchase:products"]?.has("view");

      // Check using direct normalization
      const hasAccessViaDirect =
        normalizedDirect.isAdmin ||
        normalizedDirect.permissions["purchase:products"]?.has("view");

      // Overall access (all methods must agree for consistency)
      const overallAccess =
        hasAccessViaHook && hasAccessViaContext && hasAccessViaDirect;

      setAccessChecks({
        hook: hasAccessViaHook,
        context: hasAccessViaContext,
        direct: hasAccessViaDirect,
        overall: overallAccess,
      });

      // Redirect if no access
      if (!overallAccess) {
        router.push("/unauthorized");
      }

      setLoading(false);
    }, 1000); // Simulate async check

    return () => clearTimeout(timer);
  }, [can, isAdmin, permissions, normalizedDirect, router]);

  // Map API products to local Product type
  const products: Product[] = React.useMemo(() => {
    if (!apiProducts) return [];
    return apiProducts.map(
      (apiProduct: {
        id: number;
        product_name: string;
        product_category: string;
        available_product_quantity: string;
      }) => ({
        id: String(apiProduct.id),
        name: apiProduct.product_name,
        category: apiProduct.product_category,
        quantity: parseInt(apiProduct.available_product_quantity) || 0,
      }),
    );
  }, [apiProducts]);

  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Purchase", href: "/purchase" },
    { label: "Products", href: "/purchase/products", current: true },
  ];

  const handleViewChange = (view: "grid" | "list") => {
    setCurrentView(view);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle edge cases
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Loading User Data
          </h1>
          <p className="text-gray-600">
            Please wait while we load your user information...
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Checking Permissions
          </h1>
          <p className="text-gray-600">Verifying your access rights...</p>
        </div>
      </div>
    );
  }

  if (!accessChecks.overall) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You do not have the required permissions to view this page.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to unauthorized page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.main
      className="h-full text-slate-900 antialiased pr-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
      >
        <Breadcrumbs
          items={items}
          action={
            <Button
              variant="ghost"
              className="text-sm text-gray-400 flex items-center gap-2 hover:text-[#3B7CED] transition-colors duration-200"
            >
              Autosaved <AutoSaveIcon />
            </Button>
          }
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
      >
        <ActionBar
          href={"/purchase/products/new"}
          currentView={currentView}
          onViewChange={handleViewChange}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
      </motion.div>

      <motion.section
        className="h-full mx-auto pb-12 bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
      >
        {isLoading ? (
          currentView === "grid" ? (
            <ProductsCardsSkeleton />
          ) : (
            <ProductsTableSkeleton />
          )
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">
              Error loading products. Please try again.
            </div>
          </div>
        ) : currentView === "grid" ? (
          <ProductsCards products={products} />
        ) : (
          <ProductsTable products={products} />
        )}
      </motion.section>
    </motion.main>
  );
}
