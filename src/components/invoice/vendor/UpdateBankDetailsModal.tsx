"use client";

import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import { useUpdateVendorBankAccountMutation, useAddVendorBankAccountMutation } from "@/api/invoice/vendorBankAccountsApi";
import { ToastNotification } from "@/components/shared/ToastNotification";

interface BankData {
  accountName: string;
  accountNumber: string;
  bankName: string;
  branch: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData: BankData;
  vendorId: number;
}

export function UpdateBankDetailsModal({
  isOpen,
  onClose,
  initialData,
  vendorId,
}: Props) {
  const { register, handleSubmit, reset } = useForm<BankData>({
    defaultValues: initialData,
  });

  const [updateBank, { isLoading: isUpdating }] = useUpdateVendorBankAccountMutation();
  const [addBank, { isLoading: isAdding }] = useAddVendorBankAccountMutation();
  
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  useEffect(() => {
    if (isOpen) {
      reset(initialData);
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (data: BankData) => {
    try {
      const payload = {
        bank_account_name: data.accountName,
        bank_account_number: data.accountNumber,
        bank_name: data.bankName,
        branch_code: data.branch,
      };

      // If initial data had no account number, it's probably an add. Otherwise update.
      if (initialData.accountNumber) {
        await updateBank({ id: vendorId, data: payload as any }).unwrap();
      } else {
        await addBank({ id: vendorId, data: payload as any }).unwrap();
      }

      setToast({
        show: true,
        message: "Bank details updated successfully",
        type: "success",
      });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setToast({
        show: true,
        message: err?.data?.message || err?.message || "Failed to update bank details",
        type: "error",
      });
    }
  };

  const isSubmitting = isUpdating || isAdding;

  // We can leave the audit log empty or remove it if not needed,
  // but we will hide it since there is no audit log API yet.

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl z-50">
          <div className="p-8">
            <ToastNotification
              show={toast.show}
              message={toast.message}
              type={toast.type}
              onClose={() => setToast((prev) => ({ ...prev, show: false }))}
            />

            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Update Bank Details
            </Dialog.Title>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Bank Account Name
                  </label>
                  <input
                    {...register("accountName")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Bank Account Number
                  </label>
                  <input
                    {...register("accountNumber")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Bank Name
                  </label>
                  <input
                    {...register("bankName")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Branch
                  </label>
                  <input
                    {...register("branch")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg text-sm font-medium"
                >
                  {isSubmitting ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
