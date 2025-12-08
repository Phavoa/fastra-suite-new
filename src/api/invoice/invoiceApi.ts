import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../lib/store/store";

// Define types for nested objects (matching API schema)
export interface User {
  url: string;
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface UserDetails {
  url: string;
  id: number;
  user: User;
  role: string;
  phone_number: string;
  language: string;
  timezone: string;
  in_app_notifications: boolean;
  email_notifications: boolean;
  groups: string[];
}

export interface VendorDetails {
  url: string;
  id: number;
  company_name: string;
  profile_picture: string;
  email: string;
  address: string;
  phone_number: string;
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

// Invoice Item interface
export interface InvoiceItem {
  id: number;
  product: number;
  product_details: ProductDetails;
  quantity: number;
  unit_price: string;
  invoice: string;
}

// Purchase Order Details (for nested data)
export interface PurchaseOrderItem {
  id: number;
  url: string;
  purchase_order: string;
  product: number;
  product_details: ProductDetails;
  qty: number;
  estimated_unit_price: string;
  total_price: string;
}

export interface CurrencyDetails {
  url: string;
  id: number;
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
  created_on: string;
  is_hidden: boolean;
}

export interface LocationManagerDetails {
  url: string;
  id: number;
  user: User;
  role: string;
  phone_number: string;
  language: string;
  timezone: string;
  in_app_notifications: boolean;
  email_notifications: boolean;
  groups: string[];
}

export interface StoreKeeperDetails {
  url: string;
  id: number;
  user: User;
  role: string;
  phone_number: string;
  language: string;
  timezone: string;
  in_app_notifications: boolean;
  email_notifications: boolean;
  groups: string[];
}

export interface DestinationLocationDetails {
  id: string;
  location_code: string;
  location_name: string;
  location_type: string;
  address: string;
  location_manager: number;
  location_manager_details: LocationManagerDetails;
  store_keeper: number;
  store_keeper_details: StoreKeeperDetails;
  contact_information: string;
  is_hidden: boolean;
}

export interface PurchaseOrderDetails {
  id: string;
  url: string;
  status: string;
  date_created: string;
  date_updated: string;
  related_rfq: string;
  created_by: number;
  vendor: number;
  currency: number;
  payment_terms: string;
  destination_location: string;
  created_by_details: UserDetails;
  purchase_policy: string;
  delivery_terms: string;
  items: PurchaseOrderItem[];
  po_total_price: string;
  vendor_details: VendorDetails;
  is_hidden: boolean;
  is_submitted: boolean;
  can_edit: boolean;
  currency_details: CurrencyDetails;
  destination_location_details: DestinationLocationDetails;
}

// Main Invoice interface
export interface Invoice {
  created_by: number;
  updated_by: number;
  date_created: string;
  date_updated: string;
  is_hidden: boolean;
  created_by_details: UserDetails;
  updated_by_details: UserDetails;
  id: string;
  due_date: string;
  status: InvoiceStatus;
  vendor: number;
  vendor_details: VendorDetails;
  total_amount: string;
  amount_paid: string;
  balance: string;
  method: InvoiceMethod;
  purchase_order: string;
  purchase_order_details: PurchaseOrderDetails;
  invoice_items: InvoiceItem[];
}

// Enums for better type safety
export type InvoiceStatus =
  | "paid"
  | "partial"
  | "unpaid"
  | "overdue"
  | "cancelled";
export type InvoiceMethod = "ordered_quantity" | "delivered_quantity";

// Query parameter types
export interface GetInvoicesParams {
  due_date?: string;
  method?: InvoiceMethod;
  search?: string;
  status?: InvoiceStatus;
  [key: string]: string | number | boolean | undefined;
}

// Request body types
export interface CreateInvoiceItemRequest {
  product: number;
  quantity: number;
  unit_price: string;
}

export interface UpdateInvoiceItemRequest {
  product?: number;
  quantity?: number;
  unit_price?: string;
}

export interface PatchInvoiceItemRequest {
  product?: number;
  quantity?: number;
  unit_price?: string;
}

export interface CreateInvoiceRequest {
  is_hidden?: boolean;
  due_date: string;
  status: InvoiceStatus;
  vendor: number;
  purchase_order: string;
  invoice_items: CreateInvoiceItemRequest[];
}

export interface UpdateInvoiceRequest {
  is_hidden?: boolean;
  due_date?: string;
  status?: InvoiceStatus;
  vendor?: number;
  purchase_order?: string;
  invoice_items?: UpdateInvoiceItemRequest[];
}

export interface PatchInvoiceRequest {
  is_hidden?: boolean;
  due_date?: string;
  status?: InvoiceStatus;
  vendor?: number;
  purchase_order?: string;
  invoice_items?: PatchInvoiceItemRequest[];
}

// New request/response types for additional endpoints
export interface SetDefaultsRequest {
  default_invoicing_method: InvoiceMethod;
  default_payment_term: number;
}

export interface MakePaymentRequest {
  amount_paid: string;
  reference_id: string;
  payment_method: string;
  notes?: string;
}

export interface PaymentHistoryParams {
  date_created?: string;
  ordering?: string;
  payment_method?: string;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface CreatePaymentTermRequest {
  is_hidden?: boolean;
  name: string;
  description: string;
  days_until_due: number;
}

export interface UpdatePaymentTermRequest {
  is_hidden?: boolean;
  name?: string;
  description?: string;
  days_until_due?: number;
}

export interface PatchPaymentTermRequest {
  is_hidden?: boolean;
  name?: string;
  description?: string;
  days_until_due?: number;
}

// Invoicing Preferences interface
export interface InvoicingPreferences {
  id: number;
  default_invoicing_method: InvoiceMethod;
  default_payment_term: number;
}

// Payment interface
export interface Payment {
  created_by: number;
  updated_by: number;
  date_created: string;
  date_updated: string;
  is_hidden: boolean;
  created_by_details: UserDetails;
  updated_by_details: UserDetails;
  id: number;
  invoice: string;
  invoice_details: Invoice;
  amount_paid: string;
  balance_remaining: string;
  payment_method: string;
  status: PaymentStatus;
  notes: string;
}

export type PaymentStatus = "pending" | "completed" | "failed";

// Payment Term interface
export interface PaymentTerm {
  id: number;
  created_by: number;
  updated_by: number;
  date_created: string;
  date_updated: string;
  created_by_details: UserDetails;
  updated_by_details: UserDetails;
  is_hidden: boolean;
  name: string;
  description: string;
  days_until_due: number;
}

// Helper function to get tenant-specific base URL
const getTenantBaseUrl = (state: RootState): string => {
  const tenantSchemaName = state.auth.tenant_schema_name;
  const apiDomain =
    process.env.NEXT_PUBLIC_API_DOMAIN || "fastrasuiteapi.com.ng";
  return `https://${tenantSchemaName}.${apiDomain}`;
};

export const invoiceApi = createApi({
  reducerPath: "invoiceApi",
  baseQuery: async (args, api, extraOptions) => {
    const state = api.getState() as RootState;
    const baseUrl = getTenantBaseUrl(state);
    const token = state.auth.access_token;

    // Prepare headers
    const headers = new Headers();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    headers.set("content-type", "application/json");

    // Handle both string URLs and object URLs with params
    let url: string;
    if (typeof args === "string") {
      url = `${baseUrl}${args}`;
    } else {
      // Build URL with query parameters
      const params = new URLSearchParams();
      if (args.params) {
        Object.entries(args.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });
      }

      const queryString = params.toString();
      url = `${baseUrl}${args.url}${queryString ? `?${queryString}` : ""}`;
    }

    try {
      const response = await fetch(url, {
        method: typeof args === "string" ? "GET" : args.method || "GET",
        headers,
        body:
          typeof args === "string"
            ? undefined
            : args.body
            ? JSON.stringify(args.body)
            : undefined,
      });

      if (!response.ok) {
        return {
          error: {
            status: response.status,
            data: await response.json(),
          },
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error: {
          status: "FETCH_ERROR" as const,
          data: error,
        },
      };
    }
  },
  tagTypes: ["Invoice", "InvoicePreferences", "Payment", "PaymentTerm"],
  endpoints: (builder) => ({
    // Invoice Query endpoints
    getInvoices: builder.query<Invoice[], GetInvoicesParams | void>({
      query: (params) => ({
        url: "/invoicing/invoice/",
        params,
      }),
      providesTags: ["Invoice"],
    }),
    getInvoice: builder.query<Invoice, string>({
      query: (id) => `/invoicing/invoice/${id}/`,
      providesTags: (result, error, id) => [{ type: "Invoice", id }],
    }),
    getActiveInvoices: builder.query<Invoice[], void>({
      query: () => "/invoicing/invoice/active_list/",
      providesTags: ["Invoice"],
    }),
    getHiddenInvoices: builder.query<Invoice[], void>({
      query: () => "/invoicing/invoice/hidden_list/",
      providesTags: ["Invoice"],
    }),

    // Invoice Mutation endpoints
    createInvoice: builder.mutation<Invoice, CreateInvoiceRequest>({
      query: (body) => ({
        url: "/invoicing/invoice/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Invoice"],
    }),
    updateInvoice: builder.mutation<
      Invoice,
      { id: string; data: UpdateInvoiceRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/invoice/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Invoice", id },
        "Invoice",
      ],
    }),
    patchInvoice: builder.mutation<
      Invoice,
      { id: string; data: PatchInvoiceRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/invoice/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Invoice", id },
        "Invoice",
      ],
    }),
    softDeleteInvoice: builder.mutation<void, string>({
      query: (id) => ({
        url: `/invoicing/invoice/${id}/soft_delete/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Invoice", id },
        "Invoice",
      ],
    }),

    // Toggle Hidden Status endpoints
    toggleInvoiceHiddenStatus: builder.mutation<
      Invoice,
      { id: string; data: UpdateInvoiceRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/invoice/${id}/toggle_hidden_status/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Invoice", id },
        "Invoice",
      ],
    }),
    patchInvoiceHiddenStatus: builder.mutation<
      Invoice,
      { id: string; data: PatchInvoiceRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/invoice/${id}/toggle_hidden_status/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Invoice", id },
        "Invoice",
      ],
    }),

    // Invoice Item Query endpoints (if needed separately)
    getInvoiceItems: builder.query<
      InvoiceItem[],
      { invoice?: string; product?: number }
    >({
      query: (params) => ({
        url: "/invoicing/invoice-items/",
        params,
      }),
      providesTags: ["Invoice"],
    }),
    getInvoiceItem: builder.query<InvoiceItem, number>({
      query: (id) => `/invoicing/invoice-items/${id}/`,
      providesTags: (result, error, id) => [{ type: "Invoice", id }],
    }),

    // Invoice Item Mutation endpoints (if needed separately)
    createInvoiceItem: builder.mutation<InvoiceItem, CreateInvoiceItemRequest>({
      query: (body) => ({
        url: "/invoicing/invoice-items/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Invoice"],
    }),
    updateInvoiceItem: builder.mutation<
      InvoiceItem,
      { id: number; data: UpdateInvoiceItemRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/invoice-items/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Invoice", id },
        "Invoice",
      ],
    }),
    patchInvoiceItem: builder.mutation<
      InvoiceItem,
      { id: number; data: PatchInvoiceItemRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/invoice-items/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Invoice", id },
        "Invoice",
      ],
    }),
    deleteInvoiceItem: builder.mutation<void, number>({
      query: (id) => ({
        url: `/invoicing/invoice-items/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Invoice", id },
        "Invoice",
      ],
    }),

    // Invoicing Preferences endpoints
    getInvoicingPreferences: builder.query<InvoicingPreferences, void>({
      query: () => "/invoicing/invoicing-preferences/details/",
      providesTags: ["InvoicePreferences"],
    }),
    updateInvoicingPreferences: builder.mutation<
      InvoicingPreferences,
      Partial<InvoicingPreferences>
    >({
      query: (data) => ({
        url: "/invoicing/invoicing-preferences/details/",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["InvoicePreferences"],
    }),
    setInvoicingDefaults: builder.mutation<
      InvoicingPreferences,
      SetDefaultsRequest
    >({
      query: (data) => ({
        url: "/invoicing/invoicing-preferences/set-defaults/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["InvoicePreferences"],
    }),

    // Payment endpoints
    makePayment: builder.mutation<Payment, MakePaymentRequest>({
      query: (data) => ({
        url: "/invoicing/make-payment/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Invoice", "Payment"],
    }),
    getPaymentHistory: builder.query<Payment[], PaymentHistoryParams | void>({
      query: (params) => ({
        url: "/invoicing/payment-history/",
        params,
      }),
      providesTags: ["Payment"],
    }),
    getPaymentHistoryItem: builder.query<Payment, number>({
      query: (id) => `/invoicing/payment-history/${id}/`,
      providesTags: (result, error, id) => [{ type: "Payment", id }],
    }),

    // Payment Term endpoints
    getPaymentTerms: builder.query<PaymentTerm[], { search?: string } | void>({
      query: (params) => ({
        url: "/invoicing/payment-term/",
        params,
      }),
      providesTags: ["PaymentTerm"],
    }),
    getActivePaymentTerms: builder.query<PaymentTerm, void>({
      query: () => "/invoicing/payment-term/active_list/",
      providesTags: ["PaymentTerm"],
    }),
    getHiddenPaymentTerms: builder.query<PaymentTerm, void>({
      query: () => "/invoicing/payment-term/hidden_list/",
      providesTags: ["PaymentTerm"],
    }),
    getPaymentTerm: builder.query<PaymentTerm, number>({
      query: (id) => `/invoicing/payment-term/${id}/`,
      providesTags: (result, error, id) => [{ type: "PaymentTerm", id }],
    }),
    createPaymentTerm: builder.mutation<PaymentTerm, CreatePaymentTermRequest>({
      query: (body) => ({
        url: "/invoicing/payment-term/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PaymentTerm"],
    }),
    updatePaymentTerm: builder.mutation<
      PaymentTerm,
      { id: number; data: UpdatePaymentTermRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/payment-term/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PaymentTerm", id },
        "PaymentTerm",
      ],
    }),
    patchPaymentTerm: builder.mutation<
      PaymentTerm,
      { id: number; data: PatchPaymentTermRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/payment-term/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PaymentTerm", id },
        "PaymentTerm",
      ],
    }),
    softDeletePaymentTerm: builder.mutation<void, number>({
      query: (id) => ({
        url: `/invoicing/payment-term/${id}/soft_delete/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PaymentTerm", id },
        "PaymentTerm",
      ],
    }),
    togglePaymentTermHiddenStatus: builder.mutation<
      PaymentTerm,
      { id: number; data: UpdatePaymentTermRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/payment-term/${id}/toggle_hidden_status/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PaymentTerm", id },
        "PaymentTerm",
      ],
    }),
    patchPaymentTermHiddenStatus: builder.mutation<
      PaymentTerm,
      { id: number; data: PatchPaymentTermRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/payment-term/${id}/toggle_hidden_status/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PaymentTerm", id },
        "PaymentTerm",
      ],
    }),
  }),
});

export const {
  // Invoice hooks
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useGetActiveInvoicesQuery,
  useGetHiddenInvoicesQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  usePatchInvoiceMutation,
  useSoftDeleteInvoiceMutation,
  useToggleInvoiceHiddenStatusMutation,
  usePatchInvoiceHiddenStatusMutation,

  // Invoice Item hooks
  useGetInvoiceItemsQuery,
  useGetInvoiceItemQuery,
  useCreateInvoiceItemMutation,
  useUpdateInvoiceItemMutation,
  usePatchInvoiceItemMutation,
  useDeleteInvoiceItemMutation,

  // Invoicing Preferences hooks
  useGetInvoicingPreferencesQuery,
  useUpdateInvoicingPreferencesMutation,
  useSetInvoicingDefaultsMutation,

  // Payment hooks
  useMakePaymentMutation,
  useGetPaymentHistoryQuery,
  useGetPaymentHistoryItemQuery,

  // Payment Term hooks
  useGetPaymentTermsQuery,
  useGetActivePaymentTermsQuery,
  useGetHiddenPaymentTermsQuery,
  useGetPaymentTermQuery,
  useCreatePaymentTermMutation,
  useUpdatePaymentTermMutation,
  usePatchPaymentTermMutation,
  useSoftDeletePaymentTermMutation,
  useTogglePaymentTermHiddenStatusMutation,
  usePatchPaymentTermHiddenStatusMutation,
} = invoiceApi;
