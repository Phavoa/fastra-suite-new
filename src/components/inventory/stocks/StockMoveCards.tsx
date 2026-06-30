"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockMove } from "@/types/stockMove";
import { cn } from "@/lib/utils";

interface StockMoveCardsProps {
  moves: StockMove[];
}

export function StockMoveCards({ moves }: StockMoveCardsProps) {
  return (
    <div className="w-full">
      {moves.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-4">
          {moves.map((move, index) => {
            const isPositive = move.quantity >= 0;
            return (
              <motion.div
                key={move.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="border border-gray-200 shadow-sm hover:shadow transition-all duration-200 rounded">
                  <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {move.transaction_type || "Move"}
                      </span>
                      <span className="text-xs text-gray-500">{move.date_moved}</span>
                    </div>
                    <CardTitle className="text-sm font-semibold text-gray-900 mt-2 line-clamp-1">
                      {move.product?.product_name || "Unknown Product"}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-3 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">User:</span>
                      <span className="text-gray-700 font-medium truncate max-w-[150px]">{move.user || "System Admin"}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Quantity:</span>
                      <span className={`font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                        {isPositive ? `+${move.quantity}` : move.quantity}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Running Bal:</span>
                      <span className="font-mono font-medium text-gray-800">{move.running_balance !== undefined ? move.running_balance.toLocaleString() : "—"}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Ref Document:</span>
                      <span className="font-mono text-gray-700">{move.reference_document || move.source_document_id || "N/A"}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Unit Cost:</span>
                      <span className="text-gray-800">{move.unit_cost !== undefined ? `₦${move.unit_cost.toLocaleString()}` : "—"}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Value:</span>
                      <span className="font-semibold text-gray-900">{move.total_value !== undefined ? `₦${move.total_value.toLocaleString()}` : "—"}</span>
                    </div>

                    <div className="pt-2 border-t border-gray-100 mt-2">
                      <span className="text-gray-400 block text-[10px] mb-0.5">WBS Phase & Cost Code</span>
                      <span className="text-gray-700 font-medium line-clamp-1">
                        {move.wbs_phase && move.wbs_activity ? `${move.wbs_phase} / ${move.wbs_activity}` : "General Stock"}
                      </span>
                      {move.cost_code && <span className="text-gray-400 block text-[10px] font-mono mt-0.5">{move.cost_code}</span>}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center text-gray-400 text-sm">
          No inventory ledger records found matching your query.
        </div>
      )}
    </div>
  );
}
