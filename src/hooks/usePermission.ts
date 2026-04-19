import { usePermissionContext } from "../contexts/PermissionContext";
import { CanParams } from "../types/permissions";

export function usePermission() {
  const { isAdmin, permissions, isReady } = usePermissionContext();

  const can = ({ application, module, action }: CanParams): boolean => {
    // If admin, they can always perform the action
    if (isAdmin) {
      return true;
    }

    const key = `${application}:${module}`;
    const actions = permissions[key];
    
    // Check if the specific action exists in the permission set for this module
    return actions ? actions.has(action) : false;
  };

  return { 
    can, 
    isAdmin, 
    isLoading: !isReady 
  };
}
