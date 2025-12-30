"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Option, DeliveryOrderLineItem } from "./types";

interface DeliveryOrderItemsTableProps {
  items: DeliveryOrderLineItem[];
  productOptions: Option[];
  isLoadingStockLevels: boolean;
  selectedSourceLocation: string;
  addRow: () => void;
  removeRow: (id: string) => void;
  updateItemWithProductDetails: (
    id: string,
    patch: Partial<DeliveryOrderLineItem>
  ) => void;
  formPopulated?: boolean;
}

export default function DeliveryOrderItemsTable({
  items,
  productOptions,
  isLoadingStockLevels,
  selectedSourceLocation,
  addRow,
  removeRow,
  updateItemWithProductDetails,
  formPopulated = true,
}: DeliveryOrderItemsTableProps) {
  return (
    <section className="bg-white mt-8 border-none">
      <div className="mx-auto">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px] table-fixed">
            <TableHeader className="bg-[#F6F7F8]">
              <TableRow>
                <TableHead className="w-48 border border-gray-200 px-4 py-3 text-left text-sm text-gray-600 font-medium">
                  Product Name
                </TableHead>
                <TableHead className="w-24 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                  Unit
                </TableHead>
                <TableHead className="w-32 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                  Quantity to Deliver
                </TableHead>
                <TableHead className="w-32 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                  Unit Price
                </TableHead>
                <TableHead className="w-32 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                  Total Price
                </TableHead>
                <TableHead className="w-16 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="bg-white">
              {items.map((it) => (
                <TableRow
                  key={it.id}
                  className="group hover:bg-[#FBFBFB] focus-within:bg-[#FBFBFB] transition-colors duration-150"
                >
                  <TableCell className="border border-gray-200 align-middle">
                    <Select
                      key={`${it.id}-${selectedSourceLocation}-${formPopulated}`}
                      value={it.product}
                      onValueChange={(value) =>
                        updateItemWithProductDetails(it.id, {
                          product: value,
                        })
                      }
                      disabled={isLoadingStockLevels || !selectedSourceLocation}
                    >
                      <SelectTrigger className="h-11 w-full rounded-none border-0 focus:ring-0 focus:ring-offset-0">
                        <SelectValue>
                          {it.product_details.product_name ||
                            (isLoadingStockLevels
                              ? "Loading products..."
                              : "Select product")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingStockLevels ? (
                          <SelectItem value="__loading__" disabled>
                            Loading products...
                          </SelectItem>
                        ) : productOptions.length === 0 ? (
                          <SelectItem value="__no_products__" disabled>
                            No products available
                          </SelectItem>
                        ) : (
                          productOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell className="border border-gray-200 px-4 align-middle text-center">
                    <div className="text-sm text-gray-700">
                      {it.product_details.unit_of_measure_details.unit_symbol ||
                        "N/A"}
                    </div>
                  </TableCell>

                  <TableCell className="border border-gray-200 align-middle text-center">
                    <Input
                      type="number"
                      step="0.01"
                      aria-label="Quantity to deliver"
                      value={it.quantity_to_deliver}
                      onChange={(e) =>
                        updateItemWithProductDetails(it.id, {
                          quantity_to_deliver: e.target.value,
                        })
                      }
                      placeholder="0"
                      className="h-11 w-full text-center rounded-none border-0 focus:ring-0 focus:ring-offset-0"
                    />
                  </TableCell>

                  <TableCell className="border border-gray-200 align-middle text-center">
                    <Input
                      type="number"
                      step="0.01"
                      aria-label="Unit price"
                      value={it.unit_price}
                      onChange={(e) =>
                        updateItemWithProductDetails(it.id, {
                          unit_price: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      className="h-11 w-full text-center rounded-none border-0 focus:ring-0 focus:ring-offset-0"
                    />
                  </TableCell>

                  <TableCell className="border border-gray-200 px-4 align-middle text-center">
                    <div className="text-sm text-gray-700">
                      {it.total_price || "0.00"}
                    </div>
                  </TableCell>

                  <TableCell className="border border-gray-200 px-4 align-middle text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(it.id)}
                      aria-label="Remove row"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-2 rounded-md hover:bg-red-50"
                      disabled={items.length === 1}
                    >
                      <Trash className="w-4 h-4 text-red-500" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            <TableFooter className="bg-[#FBFCFD] border border-gray-200">
              <TableRow>
                <TableCell className="bg-white">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={addRow}
                    className="flex items-center gap-2 px-3 py-0 text-sm m-auto rounded-md hover:bg-gray-50"
                    aria-label="Add row"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </TableCell>
                <TableCell className="bg-white" />
                <TableCell className="bg-white" />
                <TableCell className="bg-white" />
                <TableCell className="bg-white" />
                <TableCell className="bg-white" />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </section>
  );
}
