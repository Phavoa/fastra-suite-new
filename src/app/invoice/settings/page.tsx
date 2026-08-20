"use client";

import React, { useState } from "react";
import { CompanyBankAccountsTab } from "@/components/invoice/settings/CompanyBankAccountsTab";
import { AccountingSettingsTab } from "@/components/invoice/settings/AccountingSettingsTab";
import { CurrenciesTab } from "@/components/invoice/settings/CurrenciesTab";
import { PaymentTermsTab } from "@/components/invoice/settings/PaymentTermsTab";
import { RequestAccountMappingsTab } from "@/components/invoice/settings/RequestAccountMappingsTab";

type Tab = "accounting" | "bank-accounts" | "request-mappings" | "currencies" | "payment-terms";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("accounting");

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Home</span>
        <span className="text-gray-400">›</span>
        <span>Invoice</span>
        <span className="text-gray-400">›</span>
        <span className="text-gray-700 font-medium">Settings</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your invoicing preferences, accounting defaults, and bank accounts.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("accounting")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "accounting"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Accounting Settings
          </button>
          <button
            onClick={() => setActiveTab("bank-accounts")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "bank-accounts"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Company Bank Accounts
          </button>
          <button
            onClick={() => setActiveTab("request-mappings")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "request-mappings"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Account Mapping
          </button>
          <button
            onClick={() => setActiveTab("currencies")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "currencies"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Currencies
          </button>
          <button
            onClick={() => setActiveTab("payment-terms")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "payment-terms"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Payment Terms
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "accounting" && <AccountingSettingsTab />}
        {activeTab === "bank-accounts" && <CompanyBankAccountsTab />}
        {activeTab === "request-mappings" && <RequestAccountMappingsTab />}
        {activeTab === "currencies" && <CurrenciesTab />}
        {activeTab === "payment-terms" && <PaymentTermsTab />}
      </div>
    </div>
  );
}
