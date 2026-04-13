"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockMove } from "@/types/stockMove";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface StockMoveCardsProps {
  moves: StockMove[];
}

interface StockMoveCardProps {
  move: StockMove;
  index: number;
}

function StockMoveCard({ move, index }: StockMoveCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
        delay: index * 0.05,
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
    >
      <Card
        className={cn(
          "transition-all duration-200 hover:shadow border-2 border-gray-200 hover:border-gray-300 shadow-none rounded",
        )}
      >
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                {move.product.product_name}
              </CardTitle>
              <span className="text-sm font-bold text-blue-600">
                Qty: {move.quantity}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Source */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Source:</span>
              <span className="text-sm font-medium text-gray-900 truncate max-w-32">
                {move.source_location || "N/A"}
              </span>
            </div>

            {/* Destination */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Dest:</span>
              <span className="text-sm font-medium text-gray-900 truncate max-w-32">
                {move.destination_location || "N/A"}
              </span>
            </div>

            {/* Date Moved */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Date:</span>
              <span className="text-sm font-medium text-gray-900">
                {move.date_moved
                  ? format(new Date(move.date_moved), "MMM dd, yyyy")
                  : "N/A"}
              </span>
            </div>

            {/* Move ID */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">ID:</span>
              <span className="text-xs font-mono text-gray-600">
                #{move.id}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function StockMoveCards({ moves }: StockMoveCardsProps) {
  return (
    <motion.div
      className="px-6 bg-white h-full mt-6 rounded-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {moves.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-6">
          {moves.map((move, index) => (
            <StockMoveCard key={move.id} move={move} index={index} />
          ))}
        </div>
      ) : (
        <motion.div
          className="flex items-center justify-center h-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg
                className="w-full h-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">No stock moves found</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
