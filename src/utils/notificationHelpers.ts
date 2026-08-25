import {
  ClipboardList,
  ShoppingCart,
  Package,
  Receipt,
  Briefcase,
  Settings,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
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
        badgeBg: "bg-purple-100",
        badgeText: "text-purple-800 border-purple-200",
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
        Icon: ClipboardList,
      };

    case "purchase":
    case "purchase_request":
    case "purchase_order":
    case "rfq":
      return {
        label: "Purchase",
        badgeBg: "bg-blue-100",
        badgeText: "text-blue-800 border-blue-200",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        Icon: ShoppingCart,
      };

    case "inventory":
    case "stock":
    case "delivery_order":
      return {
        label: "Inventory",
        badgeBg: "bg-emerald-100",
        badgeText: "text-emerald-800 border-emerald-200",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        Icon: Package,
      };

    case "invoice":
    case "accounting":
    case "payment":
    case "vendor_bill":
      return {
        label: "Invoice",
        badgeBg: "bg-teal-100",
        badgeText: "text-teal-800 border-teal-200",
        iconBg: "bg-teal-50",
        iconColor: "text-teal-600",
        Icon: Receipt,
      };

    case "project_costing":
    case "project":
      return {
        label: "Project Costing",
        badgeBg: "bg-amber-100",
        badgeText: "text-amber-800 border-amber-200",
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
        Icon: Briefcase,
      };

    case "settings":
    case "users":
    case "tenant":
      return {
        label: "Settings",
        badgeBg: "bg-gray-100",
        badgeText: "text-gray-800 border-gray-200",
        iconBg: "bg-gray-50",
        iconColor: "text-gray-600",
        Icon: Settings,
      };

    default:
      return {
        label: moduleName || "Notification",
        badgeBg: "bg-blue-50",
        badgeText: "text-blue-700 border-blue-200",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
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
