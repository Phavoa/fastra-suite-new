import { ProductDetails } from "./stockAdjustment";

export interface StockMove {
  id: number;
  product: ProductDetails;
  quantity: number;
  source_document_id: string;
  source_location: string;
  destination_location: string;
  date_created: string;
  date_moved: string;
}

export interface GetStockMovesParams {
  date_from?: string;
  date_to?: string;
  destination_location?: number;
  product?: number;
  source_location?: number;
  search?: string;
}
