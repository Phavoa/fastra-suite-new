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
}

export function DeactivateModals({
  state,
  onClose,
  onReassignComplete,
}: Props) {
  const [selectedTarget, setSelectedTarget] = useState("");

  if (!state.account) return null;

  return (
    <>
      {/* Confirmation Modal */}
      <Dialog.Root
        open={state.isOpen && state.step === "confirm"}
        onOpenChange={onClose}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 w-full max-w-md z-50">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Dialog.Title className="text-xl font-semibold text-center">
              Deactivate Account
            </Dialog.Title>
            <p className="text-center text-gray-600 mt-2">
              Will you like to deactivate this account?
            </p>

            <div className="flex gap-3 mt-8">
              <button
                onClick={onClose}
                className="flex-1 border py-3 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => onReassignComplete(state.account!.code)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg"
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
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 w-full max-w-md z-50">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-amber-500" />
            </div>
            <Dialog.Title className="text-xl font-semibold text-center">
              Cannot Deactivate Account
            </Dialog.Title>
            <p className="text-center text-gray-600 mt-3">
              This account has 2 posted transactions. You must reassign all
              posted transactions before deactivating this account.
            </p>

            <div className="flex gap-3 mt-8">
              <button
                onClick={onClose}
                className="flex-1 border py-3 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  /* Switch to reassign step in real impl */
                }}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg"
              >
                Reassign Transaction
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Reassign Modal */}
      <Dialog.Root
        open={state.isOpen && state.step === "reassign"}
        onOpenChange={onClose}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 w-full max-w-md z-50">
            <Dialog.Title className="text-xl font-semibold">
              Reassign Transactions
            </Dialog.Title>
            <p className="text-gray-500 mt-1">Select the target account:</p>

            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full mt-4 border border-gray-300 rounded-lg p-3"
            >
              <option value="">Select Account</option>
              {/* Add real options in production */}
            </select>

            <div className="flex gap-3 mt-8">
              <button
                onClick={onClose}
                className="flex-1 border py-3 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => onReassignComplete(state.account!.code)}
                disabled={!selectedTarget}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50"
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
