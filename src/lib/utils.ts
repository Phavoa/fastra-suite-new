import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractErrorMessage(
  error: any,
  defaultMessage: string = "An unexpected error occurred",
): string {
  if (!error) return defaultMessage;

  if (typeof error === "string") return error;

  if (error.data) {
    const data = error.data;

    // Handle string detail or message
    if (typeof data.detail === "string") return data.detail;
    if (typeof data.message === "string") return data.message;

    // Handle nested error array (user's specific case: {"error": [{"detail": "..."}]})
    if (Array.isArray(data.error) && data.error.length > 0) {
      const firstError = data.error[0];
      if (typeof firstError === "string") return firstError;
      if (typeof firstError === "object" && firstError !== null) {
        if (typeof firstError.detail === "string") return firstError.detail;
        if (typeof firstError.message === "string") return firstError.message;
        if (typeof firstError.non_field_errors === "string")
          return firstError.non_field_errors;
        if (
          Array.isArray(firstError.non_field_errors) &&
          firstError.non_field_errors.length > 0
        ) {
          return firstError.non_field_errors[0];
        }

        // Fallback to the first available key in the error object
        const firstKey = Object.keys(firstError)[0];
        if (firstKey) {
          const val = firstError[firstKey];
          return Array.isArray(val) ? val[0] : String(val);
        }
      }
    }

    // Handle error as an object (standard DRF errors)
    if (typeof data === "object") {
      if (data.non_field_errors) {
        return Array.isArray(data.non_field_errors)
          ? data.non_field_errors[0]
          : String(data.non_field_errors);
      }

      const firstKey = Object.keys(data)[0];
      if (firstKey) {
        const val = data[firstKey];
        return Array.isArray(val) ? val[0] : String(val);
      }
    }
  }

  return error.message || defaultMessage;
}
