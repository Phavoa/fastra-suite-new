import { AccessGroupData } from "@/app/settings/accessgroup/page";

export const getUniqueAccessGroups = (
  list: AccessGroupData[] = []
): AccessGroupData[] => {
  const seen = new Set<string>();

  return list.filter((item) => {
    if (seen.has(item.group_name)) return false;
    seen.add(item.group_name);
    return true;
  });
};
