// Types for Incoming Product API

export interface UserDetails {
  url: string;
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone_number: string;
  language: string;
  timezone: string;
  in_app_notifications: boolean;
  email_notifications: boolean;
  groups: string[];
}

export interface LocationDetails {
  id: string;
  location_code: string;
  location_name: string;
  location_type: string;
  address: string;
  location_manager: number;
  location_manager_details: UserDetails;
  store_keeper: number;
  store_keeper_details: UserDetails;
  contact_information: string;
  is_hidden: boolean;
}

export interface UnitOfMeasureDetails {
  url: string;
  unit_name: string;
  unit_symbol: string;
  unit_category: string;
  created_on: string;
  is_hidden: boolean;
}

export interface ProductDetails {
  url: string;
  id: number;
  product_name: string;
  product_description: string;
  product_category: string;
  available_product_quantity: string;
  total_quantity_purchased: string;
  unit_of_measure: number;
  created_on: string;
  updated_on: string;
  is_hidden: boolean;
  unit_of_measure_details: UnitOfMeasureDetails;
}

export interface IncomingProductItem {
  id: string;
  incoming_product: string;
  product: number;
  product_details: ProductDetails;
  expected_quantity: string;
  quantity_received: string;
}

export interface SupplierDetails {
  url: string;
  id: number;
  company_name: string;
  profile_picture: string;
  email: string;
  address: string;
  phone_number: string;
  is_hidden: boolean;
}

export interface IncomingProduct {
  incoming_product_id: string;
  receipt_type: string;
  related_po: string;
  supplier: number;
  source_location: string;
  source_location_details: LocationDetails;
  incoming_product_items: IncomingProductItem[];
  supplier_details: SupplierDetails;
  destination_location: string;
  destination_location_details: LocationDetails;
  status: string;
  is_validated: boolean;
  can_edit: boolean;
  is_hidden: boolean;
  notes: string;
}

// Request/Response types for different endpoints

export interface GetIncomingProductsParams {
  date_created?: string;
  destination_location__id?: string;
  search?: string;
  status?: "draft" | "validated" | "canceled";
}

export interface CreateIncomingProductRequest {
  incoming_product_id?: string;
  receipt_type: string;
  related_po: string | null;
  supplier: number;
  source_location: string;
  incoming_product_items: Array<{
    product: number;
    expected_quantity: string;
    quantity_received: string;
  }>;
  destination_location: string;
  status: string;
  is_validated: boolean;
  can_edit: boolean;
  is_hidden: boolean;
}

export interface UpdateIncomingProductRequest {
  incoming_product_id: string;
  receipt_type: string;
  related_po: string | null;
  supplier: number;
  source_location: string;
  incoming_product_items: Array<{
    id: string;
    product: number;
    expected_quantity: string;
    quantity_received: string;
  }>;
  destination_location: string;
  status: string;
  is_validated: boolean;
  can_edit: boolean;
  is_hidden: boolean;
}

export interface PatchIncomingProductRequest {
  incoming_product_id?: string;
  receipt_type?: string;
  related_po?: string | null;
  supplier?: number;
  source_location?: string;
  incoming_product_items?: Array<{
    id: string;
    product: number;
    expected_quantity: string;
    quantity_received: string;
  }>;
  destination_location?: string;
  status?: string;
  is_validated?: boolean;
  can_edit?: boolean;
  is_hidden?: boolean;
}
