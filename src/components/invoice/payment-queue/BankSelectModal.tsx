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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function BankSelectModal({ isOpen, onClose, onConfirm }: Props) {
  if (!isOpen) return null;

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
                <Select defaultValue="">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Bank Account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gtbank">GTBank - 0123456789</SelectItem>
                    <SelectItem value="zenith">
                      Zenith Bank - 9876543210
                    </SelectItem>
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
                  onClick={onConfirm}
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
