"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Account } from "./types";

const schema = z.object({
  type: z.string().min(1),
  name: z.string().min(1, "Account name is required"),
  code: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Account, "isCategory" | "children">) => void;
}

export function AccountModal({ isOpen, onClose, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { code: "1001" },
  });

  const onFormSubmit = (data: FormData) => {
    onSubmit({
      code: data.code,
      name: data.name,
      type: data.type as any,
      balance: 0,
    });
    reset();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 w-full max-w-md shadow-xl z-50">
          <Dialog.Title className="text-2xl font-semibold">
            Add Account
          </Dialog.Title>
          <Dialog.Description className="text-gray-500 mt-1">
            Add a new account to an account type
          </Dialog.Description>

          <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="mt-8 space-y-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2">
                Account Type
              </label>
              <select
                {...register("type")}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Account Type</option>
                <option value="Assets">Assets</option>
                <option value="Liabilities">Liabilities</option>
                <option value="Equity">Equity</option>
                <option value="Revenue">Revenue</option>
                <option value="Expenses">Expenses</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Account Name
              </label>
              <input
                {...register("name")}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter account name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Account Number
              </label>
              <input
                {...register("code")}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Add Account
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
