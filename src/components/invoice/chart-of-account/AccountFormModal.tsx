"use client";

import React, { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Account } from "./types";

const schema = z.object({
  type: z.string().min(1, "Required"),
  name: z.string().min(1, "Account name is required"),
  bankName: z.string().optional(),
  branch: z.string().optional(),
  sortCode: z.string().optional(),
  currency: z.string().optional(),
  code: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  mode: "add" | "edit";
  account?: Account | null;
  onClose: () => void;
  onSave: (data: FormData) => void;
  onDeactivate?: () => void;
}

export function AccountFormModal({
  isOpen,
  mode,
  account,
  onClose,
  onSave,
  onDeactivate,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "1001",
      type: "",
      name: "",
      bankName: "",
      branch: "",
      sortCode: "",
      currency: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && account) {
      reset({
        type: account.type,
        name: account.name,
        bankName: account.bankName || "",
        branch: account.branch || "",
        sortCode: account.sortCode || "",
        currency: account.currency || "",
        code: account.code,
      });
    } else {
      reset({
        code: "1001",
        type: "",
        name: "",
        bankName: "",
        branch: "",
        sortCode: "",
        currency: "",
      });
    }
  }, [mode, account, isOpen, reset]);

  const onSubmit = (data: FormData) => {
    onSave(data);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 w-full max-w-md shadow-xl z-50 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-semibold text-gray-900">
            {mode === "add" ? "Add Account" : "Edit Account"}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mt-1">
            Add a new account to an account type
          </Dialog.Description>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Account Type
              </label>
              <select
                {...register("type")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Account Type</option>
                <option value="Assets">Assets</option>
                <option value="Liabilities">Liabilities</option>
                <option value="Equity">Equity</option>
                <option value="Revenue">Revenue</option>
                <option value="Expenses">Expenses</option>
              </select>
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Account Name
              </label>
              <input
                {...register("name")}
                placeholder="Enter account name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Bank Name
              </label>
              <input
                {...register("bankName")}
                placeholder="Enter account name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Branch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Branch
              </label>
              <select
                {...register("branch")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Branch</option>
                <option value="Lagos">Lagos</option>
                <option value="Abuja">Abuja</option>
                <option value="Port Harcourt">Port Harcourt</option>
              </select>
            </div>

            {/* Sort Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Sort Code
              </label>
              <input
                {...register("sortCode")}
                placeholder="Enter account name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Currency
              </label>
              <select
                {...register("currency")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Currency</option>
                <option value="Naira">Naira</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            {/* Account Number (read-only looking) */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <span className="text-sm text-gray-600">Account Number</span>
              <input
                {...register("code")}
                className="bg-transparent text-right text-sm font-medium text-gray-900 outline-none w-24"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {mode === "edit" ? (
                <>
                  <button
                    type="button"
                    onClick={onDeactivate}
                    className="flex-1 border border-red-500 text-red-600 hover:bg-red-50 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Deactivate
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Add Account
                  </button>
                </>
              )}
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
