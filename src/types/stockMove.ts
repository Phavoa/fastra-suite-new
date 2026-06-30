import { ProductDetails } from "./stockAdjustment";

export interface StockMove {
  id: number | string;
  product: any;
  quantity: number;
  source_document_id: string;
  source_location: string;
  destination_location: string;
  date_created: string;
  date_moved: string;
  // PRD Section 10.7 Ledger specific fields
  transaction_type?: "Receipt" | "Return" | "Transfer" | "Consumption" | "Scrap" | "Adjustment";
  reference_document?: string;
  unit_cost?: number;
  total_value?: number;
  wbs_phase?: string;
  wbs_activity?: string;
  user?: string;
  running_balance?: number;
  cost_code?: string;
}

export interface GetStockMovesParams {
  date_from?: string;
  date_to?: string;
  destination_location?: number;
  product?: number;
  source_location?: number;
  search?: string;
}
