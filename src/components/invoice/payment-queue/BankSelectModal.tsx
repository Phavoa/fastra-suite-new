"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import * as Dialog from "@radix-ui/react-dialog";

import { useGetCompanyBankAccountsQuery } from "@/api/invoice/companyBankAccountsApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bankAccountId: string) => void;
}

export default function BankSelectModal({ isOpen, onClose, onConfirm }: Props) {
  const { data: bankAccounts = [], isLoading } = useGetCompanyBankAccountsQuery(undefined, { skip: !isOpen });
  const [selectedBank, setSelectedBank] = React.useState<string>("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedBank) {
      onConfirm(selectedBank);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Dialog.Content className="bg-white rounded w-full max-w-md">
            <div className="p-8">
              <div className="flex justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Select Company Bank
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Select the company bank account the payment is going out
                    from
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-3xl text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium mb-2">
                  Bank Account
                </label>
                <Select value={selectedBank} onValueChange={setSelectedBank}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isLoading ? "Loading banks..." : "Select Bank Account"} />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id.toString()}>
                        {bank.bank_name} - {bank.account_number_display || bank.account_number}
                      </SelectItem>
                    ))}
                    {bankAccounts.length === 0 && !isLoading && (
                      <SelectItem value="" disabled>No bank accounts found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Button
                  variant={"outline"}
                  onClick={onClose}
                  className="flex-1 "
                >
                  Cancel
                </Button>
                <Button
                  variant={"contained"}
                  onClick={handleConfirm}
                  disabled={!selectedBank || isLoading}
                  className="flex-1"
                >
                  Confirm Payment
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
