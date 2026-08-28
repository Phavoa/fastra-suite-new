import {
  ClipboardList,
  ShoppingCart,
  Package,
  Receipt,
  Briefcase,
  Settings,
  Bell,
  LucideIcon,
} from "lucide-react";

export interface ModuleConfig {
  label: string;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
  iconColor: string;
  Icon: LucideIcon;
}

export function getModuleConfig(moduleName?: string): ModuleConfig {
  const norm = (moduleName || "").toLowerCase().replace(/[\s-]/g, "_");

  switch (norm) {
    case "project_request":
    case "projectrequest":
    case "requests":
      return {
        label: "Project Request",
        badgeBg: "bg-[#F3E8FF]",
        badgeText: "text-[#7C3AED]",
        iconBg: "bg-[#F3E8FF]",
        iconColor: "text-[#7C3AED]",
        Icon: ClipboardList,
      };

    case "purchase":
    case "purchase_request":
    case "purchase_order":
    case "rfq":
      return {
        label: "Purchase",
        badgeBg: "bg-[#E8F0FE]",
        badgeText: "text-[#1A73E8]",
        iconBg: "bg-[#E8F0FE]",
        iconColor: "text-[#1A73E8]",
        Icon: ShoppingCart,
      };

    case "inventory":
    case "stock":
    case "delivery_order":
      return {
        label: "Inventory",
        badgeBg: "bg-[#E2F2E9]",
        badgeText: "text-[#2BA24D]",
        iconBg: "bg-[#E2F2E9]",
        iconColor: "text-[#2BA24D]",
        Icon: Package,
      };

    case "invoice":
    case "accounting":
    case "payment":
    case "vendor_bill":
      return {
        label: "Invoice",
        badgeBg: "bg-[#E6FFFA]",
        badgeText: "text-[#0D9488]",
        iconBg: "bg-[#E6FFFA]",
        iconColor: "text-[#0D9488]",
        Icon: Receipt,
      };

    case "project_costing":
    case "project":
      return {
        label: "Project Costing",
        badgeBg: "bg-[#FFF2CC]",
        badgeText: "text-[#D97706]",
        iconBg: "bg-[#FFF2CC]",
        iconColor: "text-[#D97706]",
        Icon: Briefcase,
      };

    case "settings":
    case "users":
    case "tenant":
      return {
        label: "Settings",
        badgeBg: "bg-[#E9ECEF]",
        badgeText: "text-[#495057]",
        iconBg: "bg-[#E9ECEF]",
        iconColor: "text-[#495057]",
        Icon: Settings,
      };

    default:
      return {
        label: moduleName || "System",
        badgeBg: "bg-[#E8F0FE]",
        badgeText: "text-[#1A73E8]",
        iconBg: "bg-[#E8F0FE]",
        iconColor: "text-[#1A73E8]",
        Icon: Bell,
      };
  }
}

export function formatTimeAgo(dateString: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) {
      return "Just now";
    }

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function resolveNotificationUrl(notification: { action_url?: string; module?: string; object_id?: string; title?: string; message?: string }): string {
  let url = notification.action_url || "";
  
  if (!url) {
    return "#";
  }

  // 1. Project Costing Fix
  // Backend gives: /project-costing/projects/13
  // Frontend route: /project-costing/13
  if (url.startsWith("/project-costing/projects/")) {
    return url.replace("/project-costing/projects/", "/project-costing/");
  }

  // 2. Project Request Fix
  // Backend gives: /project-requests/25 or /project_request/25
  // Frontend route requires the specific sub-module: /project-request/purchase-request/25
  if (url.startsWith("/project_request/") || url.startsWith("/project-requests/")) {
    const idMatch = url.match(/\/(?:project_request|project-requests)\/(\d+)/);
    const id = idMatch ? idMatch[1] : notification.object_id;

    if (id) {
      const title = (notification.title || "").toLowerCase();
      const message = (notification.message || "").toLowerCase();
      
      let subModule = "";
      if (title.includes("purchase") || message.includes("purchase")) subModule = "purchase-request";
      else if (title.includes("labour") || message.includes("labour")) subModule = "labour-request";
      else if (title.includes("material") || message.includes("material")) subModule = "material-consumption-request";
      else if (title.includes("petty") || message.includes("petty")) subModule = "petty-cash-request";
      else if (title.includes("plant") || title.includes("equipment") || message.includes("equipment")) subModule = "plant-equipment-request";
      else if (title.includes("subcontractor") || message.includes("subcontractor")) subModule = "subcontractor-request";

      if (subModule) {
        return `/project-request/${subModule}/${id}`;
      }
    }
    
    return url.replace("/project-requests/", "/project-request/").replace("/project_request/", "/project-request/");
  }

  // 3. Purchase Request Fix
  if (url.startsWith("/purchase_request/")) {
    return url.replace("/purchase_request/", "/purchase/");
  }

  // 4. Fallback for completely invalid API routes
  if (url.includes("/api/") || url.includes("fastrasuiteapi")) {
    const mod = (notification.module || "").toLowerCase();
    const id = notification.object_id;
    if (id) {
      if (mod.includes("project_costing")) return `/project-costing/${id}`;
      if (mod.includes("project_request")) return `/project-request/${id}`;
      if (mod.includes("inventory")) return `/inventory/operation/${id}`;
      if (mod.includes("purchase")) return `/purchase/${id}`;
    }
  }

  return url;
}
