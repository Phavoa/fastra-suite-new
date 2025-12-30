export type Option = { value: string; label: string };

export interface DeliveryOrderLineItem {
  id: string;
  product: string;
  product_details: {
    product_name: string;
    unit_of_measure_details: {
      unit_symbol: string;
    };
  };
  quantity_to_deliver: string;
  unit_price: string;
  total_price: string;
}

export interface DeliveryOrderFormData {
  source_location: string;
  customer_name: string;
  delivery_address: string;
  delivery_date: string;
  shipping_policy?: string;
  return_policy?: string;
  assigned_to: string;
}

export interface DeliveryOrderSubmissionData {
  source_location: string;
  customer_name: string;
  delivery_address: string;
  delivery_date: string;
  shipping_policy?: string | null;
  return_policy?: string | null;
  assigned_to: number;
  delivery_order_items: {
    product_item: number;
    quantity_to_deliver: number;
    unit_price: number;
    total_price: number;
  }[];
}
