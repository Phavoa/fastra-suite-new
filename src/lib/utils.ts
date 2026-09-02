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

    // Handle nested error array (e.g. {"error": [{"error": "Insufficient budget.", "available": "...", ...}]})
    if (Array.isArray(data.error) && data.error.length > 0) {
      const messages = data.error.map((errItem: any) => {
        if (typeof errItem === "string") return errItem.trim();
        if (typeof errItem === "object" && errItem !== null) {
          if (errItem.error || errItem.detail || errItem.message) {
            const mainMsg = errItem.error || errItem.detail || errItem.message;
            const extraDetails: string[] = [];
            if (errItem.available !== undefined && errItem.available !== null) {
              const val = parseFloat(errItem.available);
              extraDetails.push(
                `Available: ₦${isNaN(val) ? errItem.available : val.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
              );
            }
            if (errItem.requested !== undefined && errItem.requested !== null) {
              const val = parseFloat(errItem.requested);
              extraDetails.push(
                `Requested: ₦${isNaN(val) ? errItem.requested : val.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
              );
            }
            if (errItem.activity_budget !== undefined && errItem.activity_budget !== null) {
              const val = parseFloat(errItem.activity_budget);
              extraDetails.push(
                `Activity Budget: ₦${isNaN(val) ? errItem.activity_budget : val.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
              );
            }
            if (extraDetails.length > 0) {
              return `${mainMsg} (${extraDetails.join(", ")})`;
            }
            return mainMsg;
          }
          if (typeof errItem.non_field_errors === "string")
            return errItem.non_field_errors.trim();
          if (
            Array.isArray(errItem.non_field_errors) &&
            errItem.non_field_errors.length > 0
          ) {
            return String(errItem.non_field_errors[0]).trim();
          }

          const firstKey = Object.keys(errItem)[0];
          if (firstKey) {
            const val = errItem[firstKey];
            const errorText = (Array.isArray(val) ? String(val[0]) : String(val)).trim();
            const formattedKey =
              firstKey.charAt(0).toUpperCase() + firstKey.slice(1).replace(/_/g, " ");
            return `${formattedKey}: ${errorText}`;
          }
        }
        return JSON.stringify(errItem);
      });
      if (messages.length > 0) return messages.join(" | ");
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
