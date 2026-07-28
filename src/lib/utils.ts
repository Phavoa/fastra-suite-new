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

  if (typeof error === "string") return error.trim();

  if (error.data) {
    const data = error.data;

    if (typeof data === "string") return data.trim();

    // Handle direct error key (e.g. { "error": "Insufficient budget..." })
    if (typeof data.error === "string") return data.error.trim();

    // Handle string detail or message
    if (typeof data.detail === "string") return data.detail.trim();
    if (typeof data.message === "string") return data.message.trim();

    // Handle nested error array (e.g. {"error": [{"detail": "..."}]})
    if (Array.isArray(data.error) && data.error.length > 0) {
      const firstError = data.error[0];
      if (typeof firstError === "string") return firstError.trim();
      if (typeof firstError === "object" && firstError !== null) {
        if (typeof firstError.detail === "string") return firstError.detail.trim();
        if (typeof firstError.message === "string") return firstError.message.trim();
        if (typeof firstError.non_field_errors === "string")
          return firstError.non_field_errors.trim();
        if (
          Array.isArray(firstError.non_field_errors) &&
          firstError.non_field_errors.length > 0
        ) {
          return String(firstError.non_field_errors[0]).trim();
        }

        // Fallback to the first available key in the error object
        const firstKey = Object.keys(firstError)[0];
        if (firstKey) {
          const val = firstError[firstKey];
          return (Array.isArray(val) ? String(val[0]) : String(val)).trim();
        }
      }
    }

    // Handle error as an object (standard DRF errors)
    if (typeof data === "object" && data !== null) {
      if (data.non_field_errors) {
        const nfe = Array.isArray(data.non_field_errors)
          ? data.non_field_errors[0]
          : data.non_field_errors;
        return String(nfe).trim();
      }

      const firstKey = Object.keys(data)[0];
      if (firstKey) {
        const val = data[firstKey];
        return (Array.isArray(val) ? String(val[0]) : String(val)).trim();
      }
    }
  }

  return error.message ? error.message.trim() : defaultMessage;
}
