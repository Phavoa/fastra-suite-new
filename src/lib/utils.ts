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
    if (typeof data.error === "string") {
      const errStr = data.error.trim();
      if (errStr.startsWith("{") && errStr.endsWith("}")) {
        try {
          const jsonStr = errStr.replace(/'/g, '"');
          const parsed = JSON.parse(jsonStr);
          if (parsed && typeof parsed === "object") {
            const lines: string[] = [];
            if (parsed.error) lines.push(parsed.error);
            if (parsed.activity_budget) {
              const val = parseFloat(parsed.activity_budget);
              lines.push(`Activity Budget: ₦${isNaN(val) ? parsed.activity_budget : val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
            }
            if (parsed.available) {
              const val = parseFloat(parsed.available);
              lines.push(`Available: ₦${isNaN(val) ? parsed.available : val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
            }
            if (parsed.requested) {
              const val = parseFloat(parsed.requested);
              lines.push(`Requested: ₦${isNaN(val) ? parsed.requested : val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
            }
            return lines.join("\n");
          }
        } catch (e) {
          // Fallback to raw string if parsing fails
        }
      }
      return errStr;
    }

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
          const errorText = (Array.isArray(val) ? String(val[0]) : String(val)).trim();
          const formattedKey = firstKey.charAt(0).toUpperCase() + firstKey.slice(1).replace(/_/g, " ");
          return `${formattedKey}: ${errorText}`;
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
        const errorText = (Array.isArray(val) ? String(val[0]) : String(val)).trim();
        const formattedKey = firstKey.charAt(0).toUpperCase() + firstKey.slice(1).replace(/_/g, " ");
        return `${formattedKey}: ${errorText}`;
      }
    }
  }

  return error.message ? error.message.trim() : defaultMessage;
}
