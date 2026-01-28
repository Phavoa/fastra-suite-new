export type StockAdjustmentStatus = "draft" | "done" | "unknown";

export interface StatusInfo {
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

const mapLegacyStatus = (
  status: string | null | undefined,
): StockAdjustmentStatus => {
  if (!status) return "unknown";

  const s = status
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");

  // direct mappings and common legacy synonyms
  const mapping: Record<string, StockAdjustmentStatus> = {
    draft: "draft",
    done: "done",
  };

  return mapping[s] ?? "unknown";
};

export const getStatusInfo = (
  status: string | null | undefined,
): StatusInfo => {
  const mappedStatus = mapLegacyStatus(status);

  const statusMap: Record<StockAdjustmentStatus, StatusInfo> = {
    draft: {
      label: "Draft",
      description: "Draft",
      color: "text-[#3B7CED]",
      bgColor: "bg-[#3B7CED]",
    },
    done: {
      label: "Done",
      description: "Completed",
      color: "text-[#2BA24D]",
      bgColor: "bg-[#2BA24D]",
    },
    unknown: {
      label: "Unknown",
      description: "Unknown Status",
      color: "text-gray-500",
      bgColor: "bg-gray-500",
    },
  };

  return statusMap[mappedStatus];
};

export type StockAdjustmentRow = {
  id: string;
  adjustmentType: string;
  location: string;
  adjustedDate: string;
  status: StockAdjustmentStatus;
  product?: string;
  quantity?: number;
  amount?: string;
  requester?: string;
};
