import { usePermissionContext } from "../contexts/PermissionContext";

interface CanParams {
  application: string;
  module: string;
  action: string;
}

export function usePermission() {
  const { isAdmin, permissions } = usePermissionContext();

  const can = ({ application, module, action }: CanParams): boolean => {
    if (isAdmin) {
      return true;
    }

    const key = `${application}:${module}`;
    const actions = permissions[key];
    return actions ? actions.has(action) : false;
  };

  return { can };
}
