"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";
import { Account } from "./types";

interface Props {
  state: {
    isOpen: boolean;
    account: Account | null;
    step: "confirm" | "cannot" | "reassign";
  };
  onClose: () => void;
  onReassignComplete: (code: string) => void;
  onSwitchToReassign: () => void;
}

export function DeactivateModals({
  state,
  onClose,
  onReassignComplete,
  onSwitchToReassign,
}: Props) {
  const [targetAccount, setTargetAccount] = useState("");

  if (!state.account) return null;

  return (
    <>
      {/* Confirm Deactivate */}
      <Dialog.Root
        open={state.isOpen && state.step === "confirm"}
        onOpenChange={onClose}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 w-full max-w-md z-50 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Dialog.Title className="text-xl font-semibold">
              Deactivate Account
            </Dialog.Title>
            <p className="text-gray-600 mt-2">
              Will you like to deactivate this account?
            </p>

            <div className="flex gap-3 mt-8">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 py-2.5 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => onReassignComplete(state.account!.code)}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium"
              >
                Deactivate Account
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Cannot Deactivate */}
      <Dialog.Root
        open={state.isOpen && state.step === "cannot"}
        onOpenChange={onClose}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 w-full max-w-md z-50 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Dialog.Title className="text-xl font-semibold">
              Cannot Deactivate Account
            </Dialog.Title>
            <p className="text-gray-600 mt-3 text-sm leading-relaxed">
              This account has{" "}
              <span className="font-semibold">2 posted transactions</span>. You
              must reassign all posted transactions before deactivating this
              account.
            </p>

            <div className="flex gap-3 mt-8">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 py-2.5 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onSwitchToReassign}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium"
              >
                Reassign Transaction
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Reassign */}
      <Dialog.Root
        open={state.isOpen && state.step === "reassign"}
        onOpenChange={onClose}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 w-full max-w-md z-50">
            <Dialog.Title className="text-xl font-semibold">
              Reassign Transactions
            </Dialog.Title>
            <p className="text-gray-500 text-sm mt-1">
              Select the target account:
            </p>

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Account
              </label>
              <select
                value={targetAccount}
                onChange={(e) => setTargetAccount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Account</option>
                <option value="1110">1110 – Main Operating Account</option>
                <option value="1120">1120 – Petty Cash Account</option>
                <option value="1200">1200 – Accounts Receivable</option>
              </select>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 py-2.5 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => onReassignComplete(state.account!.code)}
                disabled={!targetAccount}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Reassign & Deactivate
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
