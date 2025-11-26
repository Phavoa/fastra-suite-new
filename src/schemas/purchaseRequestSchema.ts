import { z } from "zod";

export const purchaseRequestSchema = z.object({
  currency: z.string().min(1, "Currency is required"),
  vendor: z.string().min(1, "Vendor is required"),
  purpose: z.string().min(1, "Purpose is required"),
});

export type PurchaseRequestFormData = z.infer<typeof purchaseRequestSchema>;

export interface LineItem {
  id: string;
  product: string;
  qty: number;
  estimated_unit_price: string;
}

export interface CreatePurchaseRequestData {
  currency: number;
  vendor: number;
  purpose: string;
  requesting_location?: string;
  items: {
    product: number;
    qty: number;
    estimated_unit_price: string;
  }[];
}
