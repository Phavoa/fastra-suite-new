"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { BreadcrumbItem } from "@/types/purchase";
import { useCreateIncomingProductReturnMutation } from "@/api/inventory/incomingProductReturns";
import { useGetIncomingProductQuery } from "@/api/inventory/incomingProductApi";
import { ToastNotification } from "@/components/shared/ToastNotification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { z } from "zod";
import type { Resolver } from "react-hook-form";
import { PageGuard } from "@/components/auth/PageGuard";
import { extractErrorMessage } from "@/lib/utils";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
} from "@/components/shared/AnimatedWrapper";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ReactDOM from "react-dom/client";
import IncomingProductReturnPdf from "@/components/inventory/IncomingProductReturnPdf";

// Form schema for incoming product return
const incomingProductReturnSchema = z.object({
  source_document: z.string().min(1, "Source document is required"),
  date_of_return: z.string().min(1, "Date of return is required"),
  reason_for_return: z.string().min(1, "Reason for return is required"),
  email_subject: z.string().min(1, "Email subject is required"),
  email_body: z.string().min(1, "Email body is required"),
  supplier_email: z.string().email("Invalid supplier email").min(1, "Supplier email is required"),
});

type IncomingProductReturnFormData = z.infer<typeof incomingProductReturnSchema>;

type ReturnLineItem = {
  id: string;
  returned_product_item: number;
  product_name: string;
  initial_quantity: string;
  returned_quantity: string;
  unit_symbol: string;
};

export default function Page() {
  const router = useRouter();
  const { id } = useParams();
  const sourceId = id as string;

  // API mutations and queries
  const [createIncomingProductReturn, { isLoading: isCreating }] =
    useCreateIncomingProductReturnMutation();
  
  const { data: sourceProduct, isLoading: isLoadingSource } = 
    useGetIncomingProductQuery(sourceId, { skip: !sourceId });

  // Form state
  const [items, setItems] = useState<ReturnLineItem[]>([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
    show: boolean;
  }>({
    message: "",
    type: "success",
    show: false,
  });

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<IncomingProductReturnFormData>({
    resolver: zodResolver(incomingProductReturnSchema) as Resolver<IncomingProductReturnFormData>,
    mode: "onChange",
    defaultValues: {
      source_document: sourceId || "",
      date_of_return: new Date().toISOString().split("T")[0],
      reason_for_return: "",
      email_subject: `Return Document for ${sourceId || ""}`,
      email_body: "Please find the attached return document regarding the product return.",
      supplier_email: "",
    },
  });

  // Populate items when source product data is available
  useEffect(() => {
    if (sourceProduct) {
      const lineItems: ReturnLineItem[] = sourceProduct.incoming_product_items.map((item, index) => ({
        id: `item-${index}`,
        returned_product_item: item.product,
        product_name: item.product_details?.product_name || "Unknown Product",
        initial_quantity: item.quantity_received,
        returned_quantity: "",
        unit_symbol: item.product_details?.unit_of_measure_details?.unit_symbol || "N/A",
      }));
      setItems(lineItems);
      
      const supplierEmail = sourceProduct.supplier_details?.email || "";
      setValue("supplier_email", supplierEmail);
      setValue("email_subject", `Return Document for ${sourceProduct.incoming_product_id}`);
    }
  }, [sourceProduct, setValue]);

  const updateItem = (id: string, patch: Partial<ReturnLineItem>) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Operation", href: "/inventory/operation" },
    { label: "Incoming Product", href: "/inventory/operation/incoming_product" },
    { 
      label: sourceProduct?.incoming_product_id || "Detail", 
      href: `/inventory/operation/incoming_product/${sourceId}` 
    },
    { label: "Return", href: "#", current: true },
  ];

  const generatePdfBlob = async (data: IncomingProductReturnFormData): Promise<File | null> => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-10000px";
    container.style.top = "0";
    container.style.width = "210mm";
    container.style.background = "#fff";
    document.body.appendChild(container);

    try {
      const payload = {
        source_document: sourceId,
        reason_for_return: data.reason_for_return,
        returned_date: data.date_of_return,
        return_incoming_product_items: items.filter(it => parseFloat(it.returned_quantity) > 0).map(it => ({
          product: it.returned_product_item,
          product_name: it.product_name,
          quantity_received: it.initial_quantity,
          quantity_to_be_returned: it.returned_quantity,
          unit_of_measure: it.unit_symbol
        })),
      };

      const formDataPdf = {
        source_location: sourceProduct?.source_location_details?.location_name || "N/A",
        date_created: new Date().toLocaleDateString(),
      };

      const root = ReactDOM.createRoot(container);
      root.render(<IncomingProductReturnPdf payload={payload} formData={formDataPdf} />);

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          const styleTags = Array.from(clonedDoc.getElementsByTagName("style"));
          styleTags.forEach(tag => {
            if (tag.innerHTML.includes("oklch")) {
              tag.remove();
            }
          });
          const linkTags = Array.from(clonedDoc.getElementsByTagName("link"));
          linkTags.forEach(tag => {
             if (tag.rel === "stylesheet") {
                tag.remove();
             }
          });
        }
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      
      const blob = pdf.output("blob");
      return new File([blob], `Return_${sourceId}.pdf`, { type: "application/pdf" });
    } catch (error) {
      console.error("PDF Generation error:", error);
      return null;
    } finally {
      document.body.removeChild(container);
    }
  };

  const onSave = async (data: IncomingProductReturnFormData) => {
    const validItems = items.filter(
      (item) => item.returned_quantity && parseFloat(item.returned_quantity) > 0
    );

    if (validItems.length === 0) {
      setNotification({
        message: "Please specify quantity to return for at least one item.",
        type: "error",
        show: true,
      });
      return;
    }

    const hasError = validItems.some(item => 
      parseFloat(item.returned_quantity) > parseFloat(item.initial_quantity)
    );

    if (hasError) {
        setNotification({
          message: "Returned quantity cannot exceed received quantity.",
          type: "error",
          show: true,
        });
        return;
    }

    setIsGeneratingPdf(true);
    try {
      const pdfFile = await generatePdfBlob(data);
      if (!pdfFile) throw new Error("Could not generate PDF");

      const fd = new FormData();
      fd.append("source_document", sourceId);
      fd.append("reason_for_return", data.reason_for_return);
      fd.append("returned_date", data.date_of_return);
      fd.append("email_subject", data.email_subject);
      fd.append("email_body", data.email_body);
      fd.append("supplier_email", data.supplier_email);
      fd.append("email_attachment", pdfFile, pdfFile.name);
      
      const mappedItems = validItems.map(item => ({
        product: item.returned_product_item,
        quantity_received: parseFloat(item.initial_quantity),
        quantity_to_be_returned: parseFloat(item.returned_quantity)
      }));
      fd.append("return_incoming_product_items", JSON.stringify(mappedItems));

      await createIncomingProductReturn(fd).unwrap();

      setNotification({
        message: "Return created and document sent successfully!",
        type: "success",
        show: true,
      });

      setTimeout(() => {
        router.push(`/inventory/operation/incoming_product/${sourceId}`);
      }, 1500);
    } catch (error) {
      setNotification({
        message: extractErrorMessage(error, "Failed to create return"),
        type: "error",
        show: true,
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    const values = watch();
    const pdfFile = await generatePdfBlob(values as any);
    if (pdfFile) {
      const url = URL.createObjectURL(pdfFile);
      const a = document.createElement("a");
      a.href = url;
      a.download = pdfFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <PageGuard application="inventory" module="incomingproduct">
      <motion.div
        className="h-full text-gray-900 font-sans antialiased"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <PageHeader items={breadcrumbs} title="Return Incoming Product" />
        </motion.div>

        <motion.main
          className="h-full mx-auto px-6 py-8 bg-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        >
          <form onSubmit={handleSubmit(onSave)} className="bg-white">
            <motion.h2
              className="text-lg font-medium text-blue-500 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
            >
              Basic Information
            </motion.h2>

            <div className="flex-1">
              <SlideUp delay={0.4}>
                <div className="py-2 mb-6 border-b border-gray-200">
                  <StaggerContainer
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4"
                    staggerDelay={0.15}
                  >
                    <FadeIn>
                      <div className="p-4 transition-colors border-r border-gray-300">
                        <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                          Source Document
                        </h3>
                        <p className="text-gray-700 font-medium">
                          {isLoadingSource ? "Loading..." : sourceProduct?.incoming_product_id || "N/A"}
                        </p>
                      </div>
                    </FadeIn>

                    <FadeIn>
                      <div className="p-4 transition-colors border-r border-gray-300">
                        <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                          Return Date
                        </h3>
                        <p className="text-gray-700">
                          {new Date(watch("date_of_return")).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </FadeIn>

                    <FadeIn>
                      <div className="p-4 transition-colors border-r border-gray-300 last:border-0">
                        <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                          Supplier
                        </h3>
                        <p className="text-gray-700">
                          {isLoadingSource ? "Loading..." : sourceProduct?.supplier_details?.company_name || "N/A"}
                        </p>
                      </div>
                    </FadeIn>
                  </StaggerContainer>
                </div>
              </SlideUp>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10"
            >
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Date of Return <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    {...register("date_of_return")} 
                    type="date" 
                    className="h-11"
                  />
                  {errors.date_of_return && <p className="text-xs text-red-500 mt-1">{errors.date_of_return.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Reason for Return <span className="text-red-500">*</span>
                  </label>
                  <Textarea 
                    {...register("reason_for_return")} 
                    placeholder="Enter reason for return" 
                    className="min-h-[120px]"
                  />
                  {errors.reason_for_return && <p className="text-xs text-red-500 mt-1">{errors.reason_for_return.message}</p>}
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-lg font-medium text-blue-500 mb-2">Notification Details</h2>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Supplier Email <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    {...register("supplier_email")} 
                    type="email" 
                    placeholder="supplier@example.com"
                    className="h-11"
                  />
                  {errors.supplier_email && <p className="text-xs text-red-500 mt-1">{errors.supplier_email.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Email Subject <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    {...register("email_subject")} 
                    type="text" 
                    className="h-11"
                  />
                  {errors.email_subject && <p className="text-xs text-red-500 mt-1">{errors.email_subject.message}</p>}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Email Message Body <span className="text-red-500">*</span>
                </label>
                <Textarea 
                  {...register("email_body")} 
                  rows={4}
                  className="min-h-[100px]"
                />
                {errors.email_body && <p className="text-xs text-red-500 mt-1">{errors.email_body.message}</p>}
              </div>
            </motion.div>

            <motion.h2
              className="text-lg font-medium text-blue-500 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.6 }}
            >
              Returned Items
            </motion.h2>

            <div className="overflow-x-auto mb-10 border rounded-lg border-gray-200">
              <Table className="min-w-[800px]">
                <TableHeader className="bg-[#F6F7F8]">
                  <TableRow>
                    <TableHead className="w-1/2 px-6 py-4 text-gray-600 font-medium">Product Name</TableHead>
                    <TableHead className="w-1/4 px-6 py-4 text-gray-600 font-medium text-center">Received Qty</TableHead>
                    <TableHead className="w-1/4 px-6 py-4 text-gray-600 font-medium text-center">Return Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingSource ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div></TableCell>
                        <TableCell className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-1/4 mx-auto animate-pulse"></div></TableCell>
                        <TableCell className="px-6 py-5"><div className="h-10 bg-gray-100 rounded w-full animate-pulse"></div></TableCell>
                      </TableRow>
                    ))
                  ) : items.length > 0 ? (
                    items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-[#FBFBFB] transition-colors border-b">
                        <TableCell className="px-6 py-5">
                          <div className="text-sm font-semibold text-gray-900">{item.product_name}</div>
                          <div className="text-[10px] text-gray-400">ID: {item.returned_product_item}</div>
                        </TableCell>
                        <TableCell className="px-6 py-5 text-center text-sm text-gray-700 font-medium">
                          {item.initial_quantity} <span className="text-gray-400 ml-1">{item.unit_symbol}</span>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <div className="relative max-w-[150px] mx-auto">
                            <Input
                              type="number"
                              value={item.returned_quantity}
                              onChange={(e) => updateItem(item.id, { returned_quantity: e.target.value })}
                              placeholder="0"
                              className="text-center h-10 focus:ring-blue-500"
                            />
                            {parseFloat(item.returned_quantity) > parseFloat(item.initial_quantity) && (
                              <p className="text-[10px] text-red-500 mt-1 absolute left-0 right-0 font-medium">
                                Exceeds received
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="px-6 py-10 text-center text-gray-400 italic">
                        No items found in source document.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.8 }}
              className="flex justify-between items-center bg-gray-50/50 p-6 rounded-xl border border-gray-100"
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf || isLoadingSource || items.length === 0}
                className="h-11 px-6 rounded-lg text-gray-700 flex items-center gap-2 border-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                {isGeneratingPdf ? "Generating..." : "Download Preview"}
              </Button>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  className="h-11 px-8 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isGeneratingPdf || !isValid}
                  className="h-11 px-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all active:scale-95"
                >
                  {isCreating ? "Submitting..." : "Save & Send Return"}
                </Button>
              </div>
            </motion.div>
          </form>
        </motion.main>

        <ToastNotification
          message={notification.message}
          type={notification.type}
          show={notification.show}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      </motion.div>
    </PageGuard>
  );
}
