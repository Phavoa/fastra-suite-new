"use client";

import React, { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";

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
}

export function UpdateBankDetailsModal({
  isOpen,
  onClose,
  initialData,
}: Props) {
  const { register, handleSubmit, reset } = useForm<BankData>({
    defaultValues: initialData,
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialData);
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = (data: BankData) => {
    console.log("Updated bank details:", data);
    // TODO: API call
    onClose();
  };

  const auditLogs = [
    {
      action: "Bank Account Details updated",
      by: "Jane Doe",
      date: "2026-06-25 19:27",
    },
    {
      action: "Bank Account Details updated",
      by: "Jane Doe",
      date: "2026-06-25 19:27",
    },
    {
      action: "Bank Account Details updated",
      by: "Jane Doe",
      date: "2026-06-25 19:27",
    },
  ];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl z-50">
          <div className="p-8">
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
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
                >
                  Update
                </button>
              </div>
            </form>

            {/* Audit Log */}
            <div className="mt-10 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Audit log
              </h3>

              <div className="space-y-3">
                {auditLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-100"
                  >
                    <div className="mt-0.5">
                      <Pencil className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {log.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        By {log.by}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 whitespace-nowrap">
                      {log.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
