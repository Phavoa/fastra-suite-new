import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, User, MapPin } from "lucide-react";
import type { IncomingProduct } from "@/types/incomingProduct";
import { cn } from "@/lib/utils";

interface IncomingProductCardsProps {
  incomingProducts: IncomingProduct[];
  query?: string;
}

interface IncomingProductCardProps {
  incomingProduct: IncomingProduct;
  index: number;
  query?: string;
}

function IncomingProductCard({
  incomingProduct,
  index,
  query = "",
}: IncomingProductCardProps) {
  const router = useRouter();

  // Function to highlight search matches
  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 text-yellow-800 font-medium">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleCardClick = () => {
    router.push(
      `/inventory/operation/incoming_product/${incomingProduct.incoming_product_id}`
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
        delay: index * 0.1,
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow border-2 border-gray-200 hover:border-gray-300 shadow-none rounded"
        )}
        onClick={handleCardClick}
      >
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                  <Package size={16} className="text-[#3B7CED]" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                  {highlightText(incomingProduct.incoming_product_id, query)}
                </CardTitle>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  incomingProduct.status === "validated"
                    ? "bg-green-100 text-green-500"
                    : incomingProduct.status === "draft"
                    ? "bg-blue-100 text-blue-500"
                    : incomingProduct.status === "canceled"
                    ? "bg-red-100 text-red-500"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {incomingProduct.status}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Receipt Type */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Receipt Type:</span>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {highlightText(
                  incomingProduct.receipt_type.replace("_", " "),
                  query
                )}
              </span>
            </div>

            {/* Supplier */}
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <User size={12} />
                Supplier:
              </span>
              <span className="text-sm font-medium text-gray-900 text-right max-w-40 truncate">
                {highlightText(
                  incomingProduct.supplier_details?.company_name || "N/A",
                  query
                )}
              </span>
            </div>

            {/* Source Location */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin size={12} />
                Source:
              </span>
              <span className="text-sm font-medium text-gray-900 truncate max-w-32">
                {highlightText(
                  incomingProduct.source_location_details?.location_name ||
                    "N/A",
                  query
                )}
              </span>
            </div>

            {/* Destination Location */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin size={10} />
                Destination:
              </span>
              <span className="text-xs text-gray-600">
                {highlightText(
                  incomingProduct.destination_location_details?.location_name ||
                    "N/A",
                  query
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function IncomingProductCards({
  incomingProducts,
  query = "",
}: IncomingProductCardsProps) {
  return (
    <motion.div
      className="bg-white h-full rounded-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Incoming Product Cards Grid */}
      {incomingProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-6">
          {incomingProducts.map((incomingProduct, index) => (
            <IncomingProductCard
              key={incomingProduct.incoming_product_id}
              incomingProduct={incomingProduct}
              index={index}
              query={query}
            />
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
              <Package className="w-full h-full" />
            </div>
            <p className="text-gray-400 text-sm">No incoming products found</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
