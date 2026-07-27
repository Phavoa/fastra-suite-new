import { createApi } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../lib/store/store";

// ─────────────────────────────────────────────────────────────────────────────
// Shared / Primitive Types
// ─────────────────────────────────────────────────────────────────────────────

/** Minimal user record embedded in audit fields. */
export interface EmbeddedUser {
  url: string;
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

/** User-profile details embedded in created_by / updated_by fields. */
export interface EmbeddedUserDetails {
  url: string;
  id: number;
  user: EmbeddedUser;
  phone_number: string;
  language: string;
  timezone: string;
  in_app_notifications: boolean;
  email_notifications: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Accounting Settings
// ─────────────────────────────────────────────────────────────────────────────

export interface AccountingSettings {
  id: number;
  accounts_payable: number;
  inventory_account: number;
  default_expense_account: number;
  bank_account: number;
}

export interface CreateAccountingSettingsRequest {
  accounts_payable: number;
  inventory_account: number;
  default_expense_account: number;
  bank_account: number;
}

export interface GetAccountingSettingsParams {
  ordering?: string;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Chart of Accounts
// ─────────────────────────────────────────────────────────────────────────────

export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "EXPENSE";
export type AccountSubtype = "bank" | "inventory" | string;
export type ControlType = "accounts_payable" | "accounts_receivable" | "bank" | "inventory" | string;

export interface ChartOfAccountSummary {
  id: number;
  account_number: string;
  account_name: string;
  account_type: AccountType;
  subtype: AccountSubtype;
  is_active: boolean;
  is_control_account: boolean;
  control_type: ControlType;
  parent_account: number | null;
  parent_account_name?: string;
  balance: string;
}

export interface ChartOfAccountDetail extends ChartOfAccountSummary {
  children: Array<{
    id: number;
    account_number: string;
    account_name: string;
    balance: string;
  }>;
  created_at: string;
}

export interface CreateChartOfAccountRequest {
  account_number: string;
  account_name: string;
  account_type: AccountType;
  subtype: AccountSubtype;
  parent_account?: number | null;
  is_active: boolean;
  is_control_account: boolean;
  control_type?: ControlType;
}

export interface UpdateChartOfAccountRequest extends CreateChartOfAccountRequest {}

export interface PatchChartOfAccountRequest extends Partial<CreateChartOfAccountRequest> {}

export interface GetChartOfAccountsParams {
  ordering?: string;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Company Bank Accounts
// ─────────────────────────────────────────────────────────────────────────────

export interface CompanyBankAccount {
  id: number;
  account_name: string;
  account_number_display: string;
  currency_name: string;
  bank_name: string;
  account_number: string;
  branch_code: string;
  is_active: boolean;
  account: number;
  currency: number;
}

export interface CreateCompanyBankAccountRequest {
  bank_name: string;
  account_number: string;
  branch_code: string;
  is_active: boolean;
  account: number;
  currency: number;
}

export interface UpdateCompanyBankAccountRequest extends CreateCompanyBankAccountRequest {}

export interface PatchCompanyBankAccountRequest extends Partial<CreateCompanyBankAccountRequest> {}

export interface GetCompanyBankAccountsParams {
  ordering?: string;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Currency
// ─────────────────────────────────────────────────────────────────────────────

export interface Currency {
  url: string;
  id: number;
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
  created_on: string;
  is_hidden: boolean;
}

export interface CreateCurrencyRequest {
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
  is_hidden: boolean;
}

export interface UpdateCurrencyRequest extends CreateCurrencyRequest {}

export interface PatchCurrencyRequest extends Partial<CreateCurrencyRequest> {}

export interface GetCurrenciesParams {
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Invoices
// ─────────────────────────────────────────────────────────────────────────────

export type InvoiceStatus = "paid" | "partial" | "unpaid" | "overdue" | "cancelled";
export type InvoicingMethod = "ordered_quantity" | "delivered_quantity";

export interface VendorBankAccount {
  id: number;
  bank_account_name: string;
  bank_account_number: string;
  bank_name: string;
  branch_code: string;
  confirmed: boolean;
  updated_at: string;
  updated_by: number;
}

export interface VendorDetails {
  id: number;
  vendor_code: string;
  profile_picture: string | null;
  vendor_name: string;
  contact_name: string;
  email: string;
  phone_number: string;
  address: string;
  tax_id: string;
  tax_registered: boolean;
  tax_number: string;
  vendor_type: "supplier" | "contractor" | string;
  status: "active" | "inactive" | string;
  bank_account: VendorBankAccount | null;
  created_on: string;
  updated_on: string;
  payment_term: number | null;
}

export interface ProductCategoryDetails {
  id: number;
  url: string;
  category_name: string;
  description: string;
  is_active: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
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
  id: number;
  url: string;
  product_code: string;
  product_name: string;
  description: string;
  product_category: number;
  product_category_details: ProductCategoryDetails;
  unit_of_measure: number;
  unit_of_measure_details: UnitOfMeasureDetails;
  standard_cost: string;
  reorder_point: string;
  is_active: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: number;
  product: number;
  product_details: ProductDetails;
  quantity: number;
  unit_price: string;
  invoice: string;
}

export interface Invoice {
  created_by: number;
  updated_by: number;
  date_created: string;
  date_updated: string;
  is_hidden: boolean;
  created_by_details: EmbeddedUserDetails;
  updated_by_details: EmbeddedUserDetails;
  id: string;
  due_date: string;
  status: InvoiceStatus;
  vendor: number;
  vendor_details: VendorDetails;
  total_amount: string;
  amount_paid: string;
  balance: string;
  method: InvoicingMethod;
  purchase_order: string | null;
  purchase_order_details: string | null;
  invoice_items: InvoiceItem[];
}

export interface CreateInvoiceItemRequest {
  product: number;
  quantity: number;
  unit_price: string;
}

export interface CreateInvoiceRequest {
  is_hidden?: boolean;
  due_date: string;
  status?: InvoiceStatus;
  vendor: number;
  purchase_order?: string | null;
  invoice_items: CreateInvoiceItemRequest[];
}

export interface UpdateInvoiceRequest extends CreateInvoiceRequest {}

export interface PatchInvoiceRequest extends Partial<CreateInvoiceRequest> {}

export interface GetInvoicesParams {
  due_date?: string;
  method?: InvoicingMethod;
  search?: string;
  status?: InvoiceStatus;
  [key: string]: string | number | boolean | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Invoicing Preferences
// ─────────────────────────────────────────────────────────────────────────────

export interface InvoicingPreferences {
  id: number;
  default_invoicing_method: InvoicingMethod;
  default_payment_term: number | null;
}

export interface SetInvoicingPreferencesRequest {
  default_invoicing_method: InvoicingMethod;
  default_payment_term?: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Payments
// ─────────────────────────────────────────────────────────────────────────────

export type PaymentStatus = "pending" | "confirmed" | "failed" | string;

export interface MakePaymentRequest {
  amount_paid: string;
  reference_id: string;
  payment_method: string;
  notes?: string;
}

export interface MakePaymentResponse {
  amount_paid: string;
  reference_id: string;
  payment_method: string;
  notes: string;
}

export interface PaymentHistory {
  created_by: number;
  updated_by: number;
  date_created: string;
  date_updated: string;
  is_hidden: boolean;
  created_by_details: EmbeddedUserDetails;
  updated_by_details: EmbeddedUserDetails;
  id: number;
  invoice: string;
  invoice_details: Invoice;
  amount_paid: string;
  balance_remaining: string;
  payment_method: string;
  status: PaymentStatus;
  notes: string;
}

export interface GetPaymentHistoryParams {
  date_created?: string;
  ordering?: string;
  payment_method?: string;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Payment Terms
// ─────────────────────────────────────────────────────────────────────────────

export interface PaymentTerm {
  id: number;
  name: string;
  description: string;
  days_until_due: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentTermRequest {
  name: string;
  description: string;
  days_until_due: number;
  is_active: boolean;
}

export interface UpdatePaymentTermRequest extends CreatePaymentTermRequest {}

export interface PatchPaymentTermRequest extends Partial<CreatePaymentTermRequest> {}

export interface GetPaymentTermsParams {
  ordering?: string;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Project Purchase Orders
// ─────────────────────────────────────────────────────────────────────────────

export type PurchaseOrderStatus =
  | "draft"
  | "issued"
  | "partially_received"
  | "fully_received"
  | "fully_billed"
  | "closed"
  | "cancelled"
  | string;

export interface PurchaseOrderLine {
  id: number;
  product: number;
  description: string;
  qty: string;
  unit_price: string;
  line_total: string;
  quantity_received: string;
  quantity_billed: string;
  item_name: string;
}

export interface ProjectPurchaseOrder {
  id: number;
  po_number: string;
  source_request_type: string;
  object_id: number | null;
  vendor: number;
  vendor_name: string;
  currency: number;
  wbs_element: string;
  payment_term: number | null;
  expected_delivery_date: string;
  status: PurchaseOrderStatus;
  issued_at: string | null;
  created_by: number;
  total_amount: string;
  created_at: string;
  updated_at: string;
  lines: PurchaseOrderLine[];
}

export interface CreatePurchaseOrderRequest {
  vendor: number;
  currency: number;
  wbs_element: string;
  payment_term?: number | null;
  expected_delivery_date: string;
}

export interface UpdatePurchaseOrderRequest extends CreatePurchaseOrderRequest {}

export interface PatchPurchaseOrderRequest extends Partial<CreatePurchaseOrderRequest> {}

export interface ConvertRequestToPurchaseOrderRequest {
  vendor: number;
  currency: number;
  wbs_element: string;
  payment_term?: number | null;
  expected_delivery_date: string;
}

export interface GetPurchaseOrdersParams {
  ordering?: string;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Request Account Mappings
// ─────────────────────────────────────────────────────────────────────────────

export type RequestMappingType =
  | "labour"
  | "material"
  | "petty_cash"
  | "plant_equipment"
  | "purchase"
  | string;

export interface RequestAccountMapping {
  id: number;
  expense_account_name: string;
  request_type: RequestMappingType;
  created_at: string;
  is_active: boolean;
  expense_account: number;
}

export interface CreateRequestAccountMappingRequest {
  request_type: RequestMappingType;
  is_active: boolean;
  expense_account: number;
}

export interface UpdateRequestAccountMappingRequest
  extends CreateRequestAccountMappingRequest {}

export interface PatchRequestAccountMappingRequest
  extends Partial<CreateRequestAccountMappingRequest> {}

export interface GetRequestAccountMappingsParams {
  ordering?: string;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Vendors
// ─────────────────────────────────────────────────────────────────────────────

export type VendorType = "supplier" | "contractor" | string;
export type VendorStatus = "active" | "inactive" | string;

export interface VendorListItem {
  id: number;
  vendor_code: string;
  vendor_name: string;
  vendor_type: VendorType;
  email: string;
  phone_number: string;
  status: VendorStatus;
  created_on: string;
  updated_on: string;
  payment_term: number | null;
}

export interface VendorFull {
  id: number;
  vendor_code: string;
  vendor_name: string;
  contact_name: string;
  email: string;
  phone_number: string;
  address: string;
  tax_id: string;
  tax_registered: boolean;
  tax_number: string;
  vendor_type: VendorType;
  status: VendorStatus;
  bank_account: string | VendorBankAccount | null;
  payment_term: number | null;
  created_on: string;
  updated_on: string;
}

export interface CreateVendorRequest {
  vendor_name: string;
  contact_name: string;
  email: string;
  phone_number: string;
  address: string;
  tax_id?: string;
  tax_registered?: boolean;
  tax_number?: string;
  payment_term?: number | null;
  vendor_type: VendorType;
  status?: VendorStatus;
}

export interface UpdateVendorRequest extends CreateVendorRequest {}

export interface PatchVendorRequest extends Partial<CreateVendorRequest> {}

export interface GetVendorsParams {
  ordering?: string;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface VendorBankAccountRequest {
  bank_account_name: string;
  bank_account_number: string;
  bank_name: string;
  branch_code: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build tenant-specific base URL from Redux auth state
// ─────────────────────────────────────────────────────────────────────────────

const getTenantBaseUrl = (state: RootState): string => {
  const tenantSchemaName = state.auth.tenant_schema_name;
  const apiDomain =
    process.env.NEXT_PUBLIC_API_DOMAIN || "fastrasuiteapi.com.ng";
  return `https://${tenantSchemaName}.${apiDomain}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// RTK Query API slice
// ─────────────────────────────────────────────────────────────────────────────

export const invoiceApi = createApi({
  reducerPath: "invoiceApi",
  baseQuery: async (args, api, _extraOptions) => {
    const state = api.getState() as RootState;
    const baseUrl = getTenantBaseUrl(state);
    const token = state.auth.access_token;

    // Build request headers
    const headers = new Headers();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    headers.set("content-type", "application/json");

    // Resolve URL and optional query string
    let url: string;
    if (typeof args === "string") {
      url = `${baseUrl}${args}`;
    } else {
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

      // 204 No Content responses have no body
      if (response.status === 204) {
        return { data: null };
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

  endpoints: (builder) => ({
    // ───────────────────────────────────────────────────────────────────────
    // Accounting Settings
    // ───────────────────────────────────────────────────────────────────────

    /** Retrieve all accounting settings. */
    getAccountingSettings: builder.query<
      AccountingSettings[],
      GetAccountingSettingsParams | void
    >({
      query: (params) => ({
        url: "/invoicing/accounting-settings/",
        params,
      }),
    }),

    /** Create new accounting settings. */
    createAccountingSettings: builder.mutation<
      AccountingSettings,
      CreateAccountingSettingsRequest
    >({
      query: (body) => ({
        url: "/invoicing/accounting-settings/",
        method: "POST",
        body,
      }),
    }),

    /** Retrieve a single accounting-settings record by ID. */
    getAccountingSettingsById: builder.query<AccountingSettings, number>({
      query: (id) => `/invoicing/accounting-settings/${id}/`,
    }),

    /** Fully replace an accounting-settings record. */
    updateAccountingSettings: builder.mutation<
      AccountingSettings,
      { id: number; data: CreateAccountingSettingsRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/accounting-settings/${id}/`,
        method: "PUT",
        body: data,
      }),
    }),

    /** Partially update an accounting-settings record. */
    patchAccountingSettings: builder.mutation<
      AccountingSettings,
      { id: number; data: Partial<CreateAccountingSettingsRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/accounting-settings/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    /** Delete an accounting-settings record. */
    deleteAccountingSettings: builder.mutation<void, number>({
      query: (id) => ({
        url: `/invoicing/accounting-settings/${id}/`,
        method: "DELETE",
      }),
    }),

    // ───────────────────────────────────────────────────────────────────────
    // Chart of Accounts
    // ───────────────────────────────────────────────────────────────────────

    /** List all chart-of-account entries. */
    getChartOfAccounts: builder.query<
      ChartOfAccountSummary[],
      GetChartOfAccountsParams | void
    >({
      query: (params) => ({
        url: "/invoicing/chart-of-accounts/",
        params,
      }),
    }),

    /** Create a new chart-of-account entry. */
    createChartOfAccount: builder.mutation<
      ChartOfAccountSummary,
      CreateChartOfAccountRequest
    >({
      query: (body) => ({
        url: "/invoicing/chart-of-accounts/",
        method: "POST",
        body,
      }),
    }),

    /** Retrieve a single chart-of-account with balance and children. */
    getChartOfAccountById: builder.query<ChartOfAccountDetail, number>({
      query: (id) => `/invoicing/chart-of-accounts/${id}/`,
    }),

    /** Fully replace a chart-of-account entry. */
    updateChartOfAccount: builder.mutation<
      ChartOfAccountSummary,
      { id: number; data: UpdateChartOfAccountRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/chart-of-accounts/${id}/`,
        method: "PUT",
        body: data,
      }),
    }),

    /** Partially update a chart-of-account entry. */
    patchChartOfAccount: builder.mutation<
      ChartOfAccountSummary,
      { id: number; data: PatchChartOfAccountRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/chart-of-accounts/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    /** Delete a chart-of-account entry. */
    deleteChartOfAccount: builder.mutation<void, number>({
      query: (id) => ({
        url: `/invoicing/chart-of-accounts/${id}/`,
        method: "DELETE",
      }),
    }),

    /** Get the current balance for a chart-of-account entry. */
    getChartOfAccountBalance: builder.query<ChartOfAccountSummary, number>({
      query: (id) => `/invoicing/chart-of-accounts/${id}/balance/`,
    }),

    /** Get all ledger entries for a chart-of-account. */
    getChartOfAccountLedger: builder.query<ChartOfAccountSummary, number>({
      query: (id) => `/invoicing/chart-of-accounts/${id}/ledger/`,
    }),

    /** Get active accounts (for dropdowns). */
    getActiveChartOfAccounts: builder.query<ChartOfAccountSummary, void>({
      query: () => "/invoicing/chart-of-accounts/active/",
    }),

    /** Get bank-subtype chart accounts. */
    getBankChartAccounts: builder.query<ChartOfAccountSummary, void>({
      query: () => "/invoicing/chart-of-accounts/bank-accounts/",
    }),

    /** Get control accounts (AP, AR, Bank, Inventory). */
    getControlAccounts: builder.query<ChartOfAccountSummary, void>({
      query: () => "/invoicing/chart-of-accounts/control-accounts/",
    }),

    /** Get a lightweight dropdown-friendly list of selectable accounts. */
    getChartOfAccountsDropdown: builder.query<ChartOfAccountSummary, void>({
      query: () => "/invoicing/chart-of-accounts/dropdown/",
    }),

    /** Get expense accounts available for mappings. */
    getExpenseAccounts: builder.query<ChartOfAccountSummary, void>({
      query: () => "/invoicing/chart-of-accounts/expense-accounts/",
    }),

    /** Get accounts that can be used as parent accounts. */
    getParentAccounts: builder.query<ChartOfAccountSummary, void>({
      query: () => "/invoicing/chart-of-accounts/parent-accounts/",
    }),

    /** Get chart-of-accounts summary for the accounting dashboard. */
    getChartOfAccountsSummary: builder.query<ChartOfAccountSummary, void>({
      query: () => "/invoicing/chart-of-accounts/summary/",
    }),

    /** Get the full hierarchical account tree. */
    getChartOfAccountsTree: builder.query<ChartOfAccountSummary, void>({
      query: () => "/invoicing/chart-of-accounts/tree/",
    }),

    // ───────────────────────────────────────────────────────────────────────
    // Company Bank Accounts
    // ───────────────────────────────────────────────────────────────────────

    /** List all company bank accounts. */
    getCompanyBankAccounts: builder.query<
      CompanyBankAccount[],
      GetCompanyBankAccountsParams | void
    >({
      query: (params) => ({
        url: "/invoicing/company-bank-accounts/",
        params,
      }),
    }),

    /** Create a new company bank account. */
    createCompanyBankAccount: builder.mutation<
      CompanyBankAccount,
      CreateCompanyBankAccountRequest
    >({
      query: (body) => ({
        url: "/invoicing/company-bank-accounts/",
        method: "POST",
        body,
      }),
    }),

    /** Retrieve a single company bank account. */
    getCompanyBankAccountById: builder.query<CompanyBankAccount, number>({
      query: (id) => `/invoicing/company-bank-accounts/${id}/`,
    }),

    /** Fully replace a company bank account. */
    updateCompanyBankAccount: builder.mutation<
      CompanyBankAccount,
      { id: number; data: UpdateCompanyBankAccountRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/company-bank-accounts/${id}/`,
        method: "PUT",
        body: data,
      }),
    }),

    /** Partially update a company bank account. */
    patchCompanyBankAccount: builder.mutation<
      CompanyBankAccount,
      { id: number; data: PatchCompanyBankAccountRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/company-bank-accounts/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    /** Delete a company bank account. */
    deleteCompanyBankAccount: builder.mutation<void, number>({
      query: (id) => ({
        url: `/invoicing/company-bank-accounts/${id}/`,
        method: "DELETE",
      }),
    }),

    // ───────────────────────────────────────────────────────────────────────
    // Currency
    // ───────────────────────────────────────────────────────────────────────

    /** List all currencies. */
    getCurrencies: builder.query<Currency[], GetCurrenciesParams | void>({
      query: (params) => ({
        url: "/invoicing/currency/",
        params,
      }),
    }),

    /** Create a new currency. */
    createCurrency: builder.mutation<Currency, CreateCurrencyRequest>({
      query: (body) => ({
        url: "/invoicing/currency/",
        method: "POST",
        body,
      }),
    }),

    /** Retrieve a single currency. */
    getCurrencyById: builder.query<Currency, number>({
      query: (id) => `/invoicing/currency/${id}/`,
    }),

    /** Fully replace a currency. */
    updateCurrency: builder.mutation<
      Currency,
      { id: number; data: UpdateCurrencyRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/currency/${id}/`,
        method: "PUT",
        body: data,
      }),
    }),

    /** Partially update a currency. */
    patchCurrency: builder.mutation<
      Currency,
      { id: number; data: PatchCurrencyRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/currency/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    /** Hard-delete a currency. */
    deleteCurrency: builder.mutation<void, number>({
      query: (id) => ({
        url: `/invoicing/currency/${id}/`,
        method: "DELETE",
      }),
    }),

    /** Soft-delete a currency (marks as deleted without removing). */
    softDeleteCurrency: builder.mutation<void, number>({
      query: (id) => ({
        url: `/invoicing/currency/${id}/soft_delete/`,
        method: "DELETE",
      }),
    }),

    /** Toggle the hidden status of a currency (PUT). */
    toggleCurrencyHiddenStatus: builder.mutation<
      Currency,
      { id: number; data: UpdateCurrencyRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/currency/${id}/toggle_hidden_status/`,
        method: "PUT",
        body: data,
      }),
    }),

    /** Toggle the hidden status of a currency (PATCH). */
    patchToggleCurrencyHiddenStatus: builder.mutation<
      Currency,
      { id: number; data: PatchCurrencyRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/currency/${id}/toggle_hidden_status/`,
        method: "PATCH",
        body: data,
      }),
    }),

    /** List all active (visible) currencies. */
    getActiveCurrencies: builder.query<Currency, void>({
      query: () => "/invoicing/currency/active_list/",
    }),

    /** List all hidden currencies. */
    getHiddenCurrencies: builder.query<Currency, void>({
      query: () => "/invoicing/currency/hidden_list/",
    }),

    // ───────────────────────────────────────────────────────────────────────
    // Invoices
    // ───────────────────────────────────────────────────────────────────────

    /** List all invoices, with optional filtering and search. */
    getInvoices: builder.query<Invoice[], GetInvoicesParams | void>({
      query: (params) => ({
        url: "/invoicing/invoice/",
        params,
      }),
    }),

    /** Create a new invoice. */
    createInvoice: builder.mutation<Invoice, CreateInvoiceRequest>({
      query: (body) => ({
        url: "/invoicing/invoice/",
        method: "POST",
        body,
      }),
    }),

    /** Retrieve a single invoice by its string ID. */
    getInvoiceById: builder.query<Invoice, string>({
      query: (id) => `/invoicing/invoice/${id}/`,
    }),

    /** Fully replace an invoice. */
    updateInvoice: builder.mutation<
      Invoice,
      { id: string; data: UpdateInvoiceRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/invoice/${id}/`,
        method: "PUT",
        body: data,
      }),
    }),

    /** Partially update an invoice. */
    patchInvoice: builder.mutation<
      Invoice,
      { id: string; data: PatchInvoiceRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/invoice/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    /** Hard-delete an invoice. */
    deleteInvoice: builder.mutation<void, string>({
      query: (id) => ({
        url: `/invoicing/invoice/${id}/`,
        method: "DELETE",
      }),
    }),

    /** Soft-delete an invoice. */
    softDeleteInvoice: builder.mutation<void, string>({
      query: (id) => ({
        url: `/invoicing/invoice/${id}/soft_delete/`,
        method: "DELETE",
      }),
    }),

    /** Toggle the hidden status of an invoice (PUT). */
    toggleInvoiceHiddenStatus: builder.mutation<
      Invoice,
      { id: string; data: UpdateInvoiceRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/invoice/${id}/toggle_hidden_status/`,
        method: "PUT",
        body: data,
      }),
    }),

    /** Toggle the hidden status of an invoice (PATCH). */
    patchToggleInvoiceHiddenStatus: builder.mutation<
      Invoice,
      { id: string; data: PatchInvoiceRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/invoice/${id}/toggle_hidden_status/`,
        method: "PATCH",
        body: data,
      }),
    }),

    /** List only active (non-hidden) invoices. */
    getActiveInvoices: builder.query<Invoice, void>({
      query: () => "/invoicing/invoice/active_list/",
    }),

    /** List only hidden invoices. */
    getHiddenInvoices: builder.query<Invoice, void>({
      query: () => "/invoicing/invoice/hidden_list/",
    }),

    // ───────────────────────────────────────────────────────────────────────
    // Invoicing Preferences
    // ───────────────────────────────────────────────────────────────────────

    /** Retrieve the current invoicing preferences. */
    getInvoicingPreferences: builder.query<InvoicingPreferences, void>({
      query: () => "/invoicing/invoicing-preferences/details/",
    }),

    /** Set invoicing defaults (default method and payment term). */
    setInvoicingPreferences: builder.mutation<
      InvoicingPreferences,
      SetInvoicingPreferencesRequest
    >({
      query: (body) => ({
        url: "/invoicing/invoicing-preferences/set-defaults/",
        method: "POST",
        body,
      }),
    }),

    // ───────────────────────────────────────────────────────────────────────
    // Payments
    // ───────────────────────────────────────────────────────────────────────

    /** Record a payment against an invoice. */
    makePayment: builder.mutation<MakePaymentResponse, MakePaymentRequest>({
      query: (body) => ({
        url: "/invoicing/make-payment/",
        method: "POST",
        body,
      }),
    }),

    /** List all payment-history records with optional filtering. */
    getPaymentHistory: builder.query<
      PaymentHistory[],
      GetPaymentHistoryParams | void
    >({
      query: (params) => ({
        url: "/invoicing/payment-history/",
        params,
      }),
    }),

    /** Retrieve a single payment-history record. */
    getPaymentHistoryById: builder.query<PaymentHistory, number>({
      query: (id) => `/invoicing/payment-history/${id}/`,
    }),

    // ───────────────────────────────────────────────────────────────────────
    // Payment Terms
    // ───────────────────────────────────────────────────────────────────────

    /** List all payment terms. */
    getPaymentTerms: builder.query<
      PaymentTerm[],
      GetPaymentTermsParams | void
    >({
      query: (params) => ({
        url: "/invoicing/payment-term/",
        params,
      }),
    }),

    /** Create a new payment term. */
    createPaymentTerm: builder.mutation<PaymentTerm, CreatePaymentTermRequest>({
      query: (body) => ({
        url: "/invoicing/payment-term/",
        method: "POST",
        body,
      }),
    }),

    /** Retrieve a single payment term. */
    getPaymentTermById: builder.query<PaymentTerm, number>({
      query: (id) => `/invoicing/payment-term/${id}/`,
    }),

    /** Fully replace a payment term. */
    updatePaymentTerm: builder.mutation<
      PaymentTerm,
      { id: number; data: UpdatePaymentTermRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/payment-term/${id}/`,
        method: "PUT",
        body: data,
      }),
    }),

    /** Partially update a payment term. */
    patchPaymentTerm: builder.mutation<
      PaymentTerm,
      { id: number; data: PatchPaymentTermRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/payment-term/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    /** Delete a payment term. */
    deletePaymentTerm: builder.mutation<void, number>({
      query: (id) => ({
        url: `/invoicing/payment-term/${id}/`,
        method: "DELETE",
      }),
    }),

    // ───────────────────────────────────────────────────────────────────────
    // Project Purchase Orders
    // ───────────────────────────────────────────────────────────────────────

    /** List all project purchase orders. */
    getPurchaseOrders: builder.query<
      ProjectPurchaseOrder[],
      GetPurchaseOrdersParams | void
    >({
      query: (params) => ({
        url: "/invoicing/project-purchase-orders/",
        params,
      }),
    }),

    /** Create a purchase order manually. */
    createPurchaseOrder: builder.mutation<
      ProjectPurchaseOrder,
      CreatePurchaseOrderRequest
    >({
      query: (body) => ({
        url: "/invoicing/project-purchase-orders/",
        method: "POST",
        body,
      }),
    }),

    /** Retrieve a single purchase order with all line items. */
    getPurchaseOrderById: builder.query<ProjectPurchaseOrder, number>({
      query: (id) => `/invoicing/project-purchase-orders/${id}/`,
    }),

    /** Fully replace a purchase order. */
    updatePurchaseOrder: builder.mutation<
      ProjectPurchaseOrder,
      { id: number; data: UpdatePurchaseOrderRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/project-purchase-orders/${id}/`,
        method: "PUT",
        body: data,
      }),
    }),

    /** Partially update a purchase order. */
    patchPurchaseOrder: builder.mutation<
      ProjectPurchaseOrder,
      { id: number; data: PatchPurchaseOrderRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/project-purchase-orders/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    /** Delete a purchase order. */
    deletePurchaseOrder: builder.mutation<void, number>({
      query: (id) => ({
        url: `/invoicing/project-purchase-orders/${id}/`,
        method: "DELETE",
      }),
    }),

    /**
     * Cancel a purchase order.
     * Validation: Closed or already-cancelled POs cannot be cancelled.
     */
    cancelPurchaseOrder: builder.mutation<
      ProjectPurchaseOrder,
      { id: number; data?: Partial<CreatePurchaseOrderRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/project-purchase-orders/${id}/cancel/`,
        method: "POST",
        body: data || {},
      }),
    }),

    /**
     * Close a purchase order.
     * Validation: PO must be fully billed before closing.
     */
    closePurchaseOrder: builder.mutation<
      ProjectPurchaseOrder,
      { id: number; data?: Partial<CreatePurchaseOrderRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/project-purchase-orders/${id}/close/`,
        method: "POST",
        body: data || {},
      }),
    }),

    /**
     * Receive all outstanding goods for a purchase order.
     * An Incoming Product record is created automatically.
     */
    fullyReceivePurchaseOrder: builder.mutation<
      ProjectPurchaseOrder,
      { id: number; data?: Partial<CreatePurchaseOrderRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/project-purchase-orders/${id}/fully-receive/`,
        method: "POST",
        body: data || {},
      }),
    }),

    /**
     * Issue a draft purchase order.
     * Validation: PO must be Draft; Payment Term is required.
     */
    issuePurchaseOrder: builder.mutation<
      ProjectPurchaseOrder,
      { id: number; data?: Partial<CreatePurchaseOrderRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/project-purchase-orders/${id}/issue/`,
        method: "POST",
        body: data || {},
      }),
    }),

    /**
     * Create a partial goods receipt for a purchase order.
     * An Incoming Product record is created automatically.
     */
    partiallyReceivePurchaseOrder: builder.mutation<
      ProjectPurchaseOrder,
      { id: number; data?: Partial<CreatePurchaseOrderRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/project-purchase-orders/${id}/partially-receive/`,
        method: "POST",
        body: data || {},
      }),
    }),

    /**
     * Convert an approved Project Purchase Request or Plant & Equipment
     * Request into a Purchase Order.
     */
    convertRequestToPurchaseOrder: builder.mutation<
      ProjectPurchaseOrder,
      ConvertRequestToPurchaseOrderRequest
    >({
      query: (body) => ({
        url: "/invoicing/project-purchase-orders/convert/",
        method: "POST",
        body,
      }),
    }),

    // ───────────────────────────────────────────────────────────────────────
    // Request Account Mappings
    // ───────────────────────────────────────────────────────────────────────

    /** List all request-type to expense-account mappings. */
    getRequestAccountMappings: builder.query<
      RequestAccountMapping[],
      GetRequestAccountMappingsParams | void
    >({
      query: (params) => ({
        url: "/invoicing/request-account-mappings/",
        params,
      }),
    }),

    /** Create a new request-account mapping. */
    createRequestAccountMapping: builder.mutation<
      RequestAccountMapping,
      CreateRequestAccountMappingRequest
    >({
      query: (body) => ({
        url: "/invoicing/request-account-mappings/",
        method: "POST",
        body,
      }),
    }),

    /** Retrieve a single request-account mapping. */
    getRequestAccountMappingById: builder.query<RequestAccountMapping, number>({
      query: (id) => `/invoicing/request-account-mappings/${id}/`,
    }),

    /** Fully replace a request-account mapping. */
    updateRequestAccountMapping: builder.mutation<
      RequestAccountMapping,
      { id: number; data: UpdateRequestAccountMappingRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/request-account-mappings/${id}/`,
        method: "PUT",
        body: data,
      }),
    }),

    /** Partially update a request-account mapping. */
    patchRequestAccountMapping: builder.mutation<
      RequestAccountMapping,
      { id: number; data: PatchRequestAccountMappingRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/request-account-mappings/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    /** Delete a request-account mapping. */
    deleteRequestAccountMapping: builder.mutation<void, number>({
      query: (id) => ({
        url: `/invoicing/request-account-mappings/${id}/`,
        method: "DELETE",
      }),
    }),

    // ───────────────────────────────────────────────────────────────────────
    // Vendors
    // ───────────────────────────────────────────────────────────────────────

    /** List all vendors. */
    getVendors: builder.query<VendorListItem[], GetVendorsParams | void>({
      query: (params) => ({
        url: "/invoicing/vendors/",
        params,
      }),
    }),

    /** Create a new vendor. */
    createVendor: builder.mutation<CreateVendorRequest, CreateVendorRequest>({
      query: (body) => ({
        url: "/invoicing/vendors/",
        method: "POST",
        body,
      }),
    }),

    /** Retrieve a single vendor with full details. */
    getVendorById: builder.query<VendorFull, number>({
      query: (id) => `/invoicing/vendors/${id}/`,
    }),

    /** Fully replace a vendor. */
    updateVendor: builder.mutation<
      CreateVendorRequest,
      { id: number; data: UpdateVendorRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/vendors/${id}/`,
        method: "PUT",
        body: data,
      }),
    }),

    /** Partially update a vendor. */
    patchVendor: builder.mutation<
      CreateVendorRequest,
      { id: number; data: PatchVendorRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/vendors/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    /** Delete a vendor. */
    deleteVendor: builder.mutation<void, number>({
      query: (id) => ({
        url: `/invoicing/vendors/${id}/`,
        method: "DELETE",
      }),
    }),

    /** Activate a vendor. */
    activateVendor: builder.mutation<
      VendorFull,
      { id: number; data?: Partial<CreateVendorRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/vendors/${id}/activate/`,
        method: "POST",
        body: data || {},
      }),
    }),

    /** Get payment status summary for a vendor. */
    getVendorPaymentStatus: builder.query<VendorFull, number>({
      query: (id) => `/invoicing/vendors/${id}/payment-status/`,
    }),

    /** List all active vendors. */
    getActiveVendors: builder.query<VendorFull, void>({
      query: () => "/invoicing/vendors/active/",
    }),

    /** List vendors grouped by type. */
    getVendorsByType: builder.query<VendorFull, void>({
      query: () => "/invoicing/vendors/by-type/",
    }),

    // ───────────────────────────────────────────────────────────────────────
    // Vendor Bank Account
    // ───────────────────────────────────────────────────────────────────────

    /** Add a bank account to a vendor (POST). */
    addVendorBankAccount: builder.mutation<
      VendorFull,
      { id: number; data?: Partial<CreateVendorRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/vendors/${id}/bank-account/`,
        method: "POST",
        body: data || {},
      }),
    }),

    /** Update (replace) the bank account of a vendor. */
    updateVendorBankAccount: builder.mutation<
      VendorBankAccountRequest,
      { id: number; data: VendorBankAccountRequest }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/vendors/${id}/bank-account/`,
        method: "PUT",
        body: data,
      }),
    }),

    // ───────────────────────────────────────────────────────────────────────
    // Vendor Import / Profile Picture
    // ───────────────────────────────────────────────────────────────────────

    /** Download the vendor import Excel template. */
    downloadVendorTemplate: builder.query<VendorFull, void>({
      query: () => "/invoicing/vendors/download-template/",
    }),

    /** Upload vendors via Excel file. */
    uploadVendorExcel: builder.mutation<
      VendorFull,
      Partial<CreateVendorRequest>
    >({
      query: (body) => ({
        url: "/invoicing/vendors/upload-excel/",
        method: "POST",
        body,
      }),
    }),

    /** Upload a profile picture for a vendor. */
    uploadVendorProfilePicture: builder.mutation<
      VendorFull,
      { id: number; data?: Partial<CreateVendorRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/invoicing/vendors/${id}/upload-profile-picture/`,
        method: "POST",
        body: data || {},
      }),
    }),
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// Export auto-generated React hooks
// ─────────────────────────────────────────────────────────────────────────────

export const {
  // Accounting Settings
  useGetAccountingSettingsQuery,
  useCreateAccountingSettingsMutation,
  useGetAccountingSettingsByIdQuery,
  useUpdateAccountingSettingsMutation,
  usePatchAccountingSettingsMutation,
  useDeleteAccountingSettingsMutation,

  // Chart of Accounts
  useGetChartOfAccountsQuery,
  useCreateChartOfAccountMutation,
  useGetChartOfAccountByIdQuery,
  useUpdateChartOfAccountMutation,
  usePatchChartOfAccountMutation,
  useDeleteChartOfAccountMutation,
  useGetChartOfAccountBalanceQuery,
  useGetChartOfAccountLedgerQuery,
  useGetActiveChartOfAccountsQuery,
  useGetBankChartAccountsQuery,
  useGetControlAccountsQuery,
  useGetChartOfAccountsDropdownQuery,
  useGetExpenseAccountsQuery,
  useGetParentAccountsQuery,
  useGetChartOfAccountsSummaryQuery,
  useGetChartOfAccountsTreeQuery,

  // Company Bank Accounts
  useGetCompanyBankAccountsQuery,
  useCreateCompanyBankAccountMutation,
  useGetCompanyBankAccountByIdQuery,
  useUpdateCompanyBankAccountMutation,
  usePatchCompanyBankAccountMutation,
  useDeleteCompanyBankAccountMutation,

  // Currency
  useGetCurrenciesQuery,
  useCreateCurrencyMutation,
  useGetCurrencyByIdQuery,
  useUpdateCurrencyMutation,
  usePatchCurrencyMutation,
  useDeleteCurrencyMutation,
  useSoftDeleteCurrencyMutation,
  useToggleCurrencyHiddenStatusMutation,
  usePatchToggleCurrencyHiddenStatusMutation,
  useGetActiveCurrenciesQuery,
  useGetHiddenCurrenciesQuery,

  // Invoices
  useGetInvoicesQuery,
  useCreateInvoiceMutation,
  useGetInvoiceByIdQuery,
  useUpdateInvoiceMutation,
  usePatchInvoiceMutation,
  useDeleteInvoiceMutation,
  useSoftDeleteInvoiceMutation,
  useToggleInvoiceHiddenStatusMutation,
  usePatchToggleInvoiceHiddenStatusMutation,
  useGetActiveInvoicesQuery,
  useGetHiddenInvoicesQuery,

  // Invoicing Preferences
  useGetInvoicingPreferencesQuery,
  useSetInvoicingPreferencesMutation,

  // Payments
  useMakePaymentMutation,
  useGetPaymentHistoryQuery,
  useGetPaymentHistoryByIdQuery,

  // Payment Terms
  useGetPaymentTermsQuery,
  useCreatePaymentTermMutation,
  useGetPaymentTermByIdQuery,
  useUpdatePaymentTermMutation,
  usePatchPaymentTermMutation,
  useDeletePaymentTermMutation,

  // Project Purchase Orders
  useGetPurchaseOrdersQuery,
  useCreatePurchaseOrderMutation,
  useGetPurchaseOrderByIdQuery,
  useUpdatePurchaseOrderMutation,
  usePatchPurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useCancelPurchaseOrderMutation,
  useClosePurchaseOrderMutation,
  useFullyReceivePurchaseOrderMutation,
  useIssuePurchaseOrderMutation,
  usePartiallyReceivePurchaseOrderMutation,
  useConvertRequestToPurchaseOrderMutation,

  // Request Account Mappings
  useGetRequestAccountMappingsQuery,
  useCreateRequestAccountMappingMutation,
  useGetRequestAccountMappingByIdQuery,
  useUpdateRequestAccountMappingMutation,
  usePatchRequestAccountMappingMutation,
  useDeleteRequestAccountMappingMutation,

  // Vendors
  useGetVendorsQuery,
  useCreateVendorMutation,
  useGetVendorByIdQuery,
  useUpdateVendorMutation,
  usePatchVendorMutation,
  useDeleteVendorMutation,
  useActivateVendorMutation,
  useGetVendorPaymentStatusQuery,
  useGetActiveVendorsQuery,
  useGetVendorsByTypeQuery,

  // Vendor Bank Account
  useAddVendorBankAccountMutation,
  useUpdateVendorBankAccountMutation,

  // Vendor Import / Profile Picture
  useDownloadVendorTemplateQuery,
  useUploadVendorExcelMutation,
  useUploadVendorProfilePictureMutation,
} = invoiceApi;
