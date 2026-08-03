"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useStatusModal, StatusModal, extractErrorMessage } from "@/components/shared/StatusModal";
import { 
  useGetAccountingSettingsQuery, 
  useCreateAccountingSettingsMutation,
  useUpdateAccountingSettingsMutation
} from "@/api/invoice/accountingSettingsApi";
import { useGetChartOfAccountsQuery } from "@/api/invoice/chartOfAccountsApi";

interface SettingsFormData {
  accounts_payable: number | "";
  inventory_account: number | "";
  default_expense_account: number | "";
  bank_account: number | "";
}

export function AccountingSettingsTab() {
  const { data: settingsList, isLoading: isSettingsLoading } = useGetAccountingSettingsQuery();
  const { data: accounts = [], isLoading: isAccountsLoading } = useGetChartOfAccountsQuery();
  
  const [createSettings, { isLoading: isCreating }] = useCreateAccountingSettingsMutation();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateAccountingSettingsMutation();
  
  const statusModal = useStatusModal();

  const currentSettings = settingsList && settingsList.length > 0 ? settingsList[0] : null;

  const { register, handleSubmit, reset } = useForm<SettingsFormData>({
    defaultValues: {
      accounts_payable: "",
      inventory_account: "",
      default_expense_account: "",
      bank_account: "",
    }
  });

  useEffect(() => {
    if (currentSettings) {
      reset({
        accounts_payable: currentSettings.accounts_payable || "",
        inventory_account: currentSettings.inventory_account || "",
        default_expense_account: currentSettings.default_expense_account || "",
        bank_account: currentSettings.bank_account || "",
      });
    }
  }, [currentSettings, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      const payload = {
        accounts_payable: Number(data.accounts_payable),
        inventory_account: Number(data.inventory_account),
        default_expense_account: Number(data.default_expense_account),
        bank_account: Number(data.bank_account),
      };

      if (currentSettings) {
        await updateSettings({ id: currentSettings.id, data: payload }).unwrap();
        statusModal.showSuccess("Success", "Settings updated successfully");
      } else {
        await createSettings(payload).unwrap();
        statusModal.showSuccess("Success", "Settings created successfully");
      }
    } catch (err: any) {
      let errorMessage = "Failed to save settings";
      if (err?.data && typeof err.data === 'object') {
        const errorObj = err.data.error && Array.isArray(err.data.error) && err.data.error.length > 0 
          ? err.data.error[0] 
          : err.data;
          
        if (typeof errorObj === 'object') {
          errorMessage = Object.entries(errorObj)
            .map(([key, val]) => {
               const msg = Array.isArray(val) ? val[0] : val;
               if (key === "non_field_errors" || key === "detail") return String(msg);
               const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
               return `${formattedKey}: ${msg}`;
            })
            .join(" | ");
        } else if (typeof errorObj === 'string') {
          errorMessage = errorObj;
        }
      }
      statusModal.showError("Validation Error", errorMessage);
    }
  };

  const isLoading = isSettingsLoading || isAccountsLoading;

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  // Filter accounts for dropdowns based on standard accounting principles
  const liabilityAccounts = accounts.filter(a => a.account_type === "LIABILITY");
  const assetAccounts = accounts.filter(a => a.account_type === "ASSET");
  const expenseAccounts = accounts.filter(a => a.account_type === "EXPENSE");
  const bankAccounts = accounts.filter(a => a.subtype?.toLowerCase() === "bank");
  const inventoryAccounts = accounts.filter(a => a.subtype?.toLowerCase() === "inventory");

  return (
    <div className="bg-white p-6 rounded border border-gray-100">
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={statusModal.close}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        actionText={statusModal.actionText}
        onAction={statusModal.onAction}
      />

      <h2 className="text-xl font-semibold mb-6">Default Accounting Settings</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Accounts Payable Account
          </label>
          <select 
            {...register("accounts_payable", { required: true })}
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Liability Account</option>
            {liabilityAccounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.account_number} - {acc.account_name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Used for tracking what you owe to vendors.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Inventory Account
          </label>
          <select 
            {...register("inventory_account", { required: true })}
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Inventory Account</option>
            {inventoryAccounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.account_number} - {acc.account_name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Used for tracking the value of stock.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Default Expense Account
          </label>
          <select 
            {...register("default_expense_account", { required: true })}
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Expense Account</option>
            {expenseAccounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.account_number} - {acc.account_name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Fallback account for generic business expenses.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Bank Account
          </label>
          <select 
            {...register("bank_account", { required: true })}
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Bank Account</option>
            {bankAccounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.account_number} - {acc.account_name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">The primary bank account used for settling transactions.</p>
        </div>

        <div className="pt-4">
          <button 
            type="submit"
            disabled={isCreating || isUpdating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isCreating || isUpdating ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
