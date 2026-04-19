/**
 * Standardized permission actions supported by the system.
 */
export type PermissionAction = "view" | "create" | "edit" | "delete" | "approve" | "reject";

/**
 * Union of all application names in the system.
 */
export type ApplicationName = "purchase" | "inventory" | "sales" | "settings" | "all_apps";

/**
 * Common module names. Using string for flexibility but these are the targets.
 */
export type ModuleName = string;

/**
 * Interface for the can() check parameters.
 */
export interface CanParams {
  application: ApplicationName;
  module: ModuleName;
  action: PermissionAction;
}
