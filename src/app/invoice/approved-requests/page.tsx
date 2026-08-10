"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useGetProjectRequestsQuery } from "@/api/requests/projectRequestApi";
import { useConvertRequestToPurchaseOrderMutation } from "@/api/invoice/projectPurchaseOrdersApi";
import ConvertToPOModal from "@/components/invoice/ConvertToPOModal";
import ConvertToPOSubcontractorModal from "@/components/invoice/subcontractor/ConvertToPOSubcontractorModal";
import ConvertToInvoiceLabourModal from "@/components/invoice/labour-request/ConvertToInvoiceLabourReqModal";
import CreateVendorBillLabourModal from "@/components/invoice/labour-request/CreateVendorBillLabourReqModal";
import ConvertToInvoicePettyCashModal from "@/components/invoice/petty-cash/ConvertToInvoicePettyCashModal";
import CreateDisbursementModal from "@/components/invoice/petty-cash/CreateDisbursementModal";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { BreadcrumbItem } from "@/components/shared/types";
import Link from "next/link";
import { is } from "zod/v4/locales";

// Mock data matching the design
const mockRequests = [
  {
    id: "REQ-2024-0041",
    type: "Purchase",
    wbs: "WBS-Concrete Works",
    approvalDate: "2025-05-15",
    requestedAmount: 200000,
    supplierName: "John Doe",
    projectName: "Concrete Works",
    paymentTerms: "One time payment",
    products: [
      {
        productName: "Product 1",
        unit: "KG",
        qty: 4,
        unitPrice: 600000,
        total: 2400000,
      },
      {
        productName: "Product 2",
        unit: "KG",
        qty: 4,
        unitPrice: 600000,
        total: 2400000,
      },
    ],
  },
  {
    id: "REQ-2024-0041",
    type: "Subcontractor",
    wbs: "WBS-Concrete Works",
    approvalDate: "2025-05-15",
    requestedAmount: 200000,
    supplierName: "John Doe",
    projectName: "Concrete Works",
    paymentTerms: "One time payment",
    products: [
      {
        productName: "Product 1",
        unit: "KG",
        qty: 4,
        unitPrice: 600000,
        total: 2400000,
      },
      {
        productName: "Product 2",
        unit: "KG",
        qty: 4,
        unitPrice: 600000,
        total: 2400000,
      },
    ],
  },
  {
    id: "REQ-2024-0041",
    type: "Plant and Equipment",
    wbs: "WBS-Concrete Works",
    approvalDate: "2025-05-15",
    requestedAmount: 200000,
    supplierName: "John Doe",
    projectName: "Concrete Works",
    paymentTerms: "One time payment",
    products: [
      {
        productName: "Product 1",
        unit: "KG",
        qty: 4,
        unitPrice: 600000,
        total: 2400000,
      },
      {
        productName: "Product 2",
        unit: "KG",
        qty: 4,
        unitPrice: 600000,
        total: 2400000,
      },
    ],
  },
  {
    id: "REQ-2024-0041",
    type: "Labour Request",
    wbs: "WBS-Concrete Works",
    approvalDate: "2025-05-15",
    requestedAmount: 200000,
    supplierName: "John Doe",
    projectName: "Concrete Works",
    paymentTerms: "One time payment",
    products: [
      {
        productName: "Product 1",
        unit: "KG",
        qty: 4,
        unitPrice: 600000,
        total: 2400000,
      },
      {
        productName: "Product 2",
        unit: "KG",
        qty: 4,
        unitPrice: 600000,
        total: 2400000,
      },
    ],
  },
  {
    id: "REQ-2024-0041",
    type: "Petty Cash Request",
    wbs: "WBS-Concrete Works",
    approvalDate: "2025-05-15",
    requestedAmount: 200000,
    supplierName: "John Doe",
    projectName: "Concrete Works",
    paymentTerms: "One time payment",
    pettyCashId: "PET-2024-0041",
    requesterName: "John Doe",
    date: "2024-04-08",
    purpose:
      "There will be a short description of the purpose of the request here",
    accountType: "Expenses",
    products: [
      {
        productName: "Product 1",
        unit: "KG",
        qty: 4,
        unitPrice: 600000,
        total: 2400000,
      },
      {
        productName: "Product 2",
        unit: "KG",
        qty: 4,
        unitPrice: 600000,
        total: 2400000,
      },
    ],
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case "Purchase":
    case "Subcontractor":
    case "Plant and Equipment":
      return "bg-blue-50 text-blue-700";
    case "Labour Request":
    case "Petty Cash Request":
      return "bg-green-50 text-green-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

const items: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Invoicing", href: "/invoice" },
  {
    label: "Approved Requests",
    href: "/invoice/approved-requests",
    current: true,
  },
];

export default function ApprovedRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubcontractorModalOpen, setIsSubcontractorModalOpen] =
    useState(false);
  const [isLabourInvoiceModalOpen, setIsLabourInvoiceModalOpen] =
    useState(false);
  const [isLabourCreateBillModalOpen, setIsLabourCreateBillModalOpen] =
    useState(false);
  const [isPettyCashInvoiceModalOpen, setIsPettyCashInvoiceModalOpen] =
    useState(false);
  const [
    isPettyCashDisbursementModalOpen,
    setIsPettyCashDisbursementModalOpen,
  ] = useState(false);

  const {
    data: apiRequests,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProjectRequestsQuery({
    status: "approved",
    module_destination: "invoice",
  });

  const [convertRequestToPurchaseOrder] = useConvertRequestToPurchaseOrderMutation();

  const handleConvertToPO = (request: any) => {
    setSelectedRequest(request);
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const handleConvertToSubcontractor = (request: any) => {
    setSelectedRequest(request);
    setCurrentStep(1);
    setIsSubcontractorModalOpen(true);
  };

  const handleConvertToLabourInvoice = (request: any) => {
    setSelectedRequest(request);
    setIsLabourInvoiceModalOpen(true);
  };

  const handleConvertToPettyCashInvoice = (request: any) => {
    setSelectedRequest(request);
    setIsPettyCashInvoiceModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    setCurrentStep(1);
  };

  const handleCloseSubcontractorModal = () => {
    setIsSubcontractorModalOpen(false);
    setSelectedRequest(null);
    setCurrentStep(1);
  };

  const handleCloseLabourInvoiceModal = () => {
    setIsLabourInvoiceModalOpen(false);
    setSelectedRequest(null);
  };

  const handleCloseLabourCreateBillModal = () => {
    setIsLabourCreateBillModalOpen(false);
    setSelectedRequest(null);
  };

  const handleClosePettyCashInvoiceModal = () => {
    setIsPettyCashInvoiceModalOpen(false);
    setSelectedRequest(null);
  };

  const handleClosePettyCashDisbursementModal = () => {
    setIsPettyCashDisbursementModalOpen(false);
    setSelectedRequest(null);
  };

  const handleNextStep = () => {
    setCurrentStep(2);
  };

  const handleBackStep = () => {
    setCurrentStep(1);
  };

  const handleIssuePO = async (payload: { vendor: number; payment_term: number | null; expected_delivery_date: string; currency: number }) => {
    if (!selectedRequest || !selectedRequest.backendId) {
      alert("Invalid request selected.");
      return;
    }
    
    try {
      // Map to the backend expected source_type
      let mappedSourceType = selectedRequest.originalType;
      if (mappedSourceType === "purchase") mappedSourceType = "project_purchase_request";
      if (mappedSourceType === "plant_equipment") mappedSourceType = "plant_equipment_request";

      const result = await convertRequestToPurchaseOrder({
        data: {
          source_type: mappedSourceType,
          source_id: selectedRequest.sourceId,
          vendor: payload.vendor,
          currency: payload.currency,
          wbs_element: selectedRequest.wbsId,
          payment_term: payload.payment_term,
          expected_delivery_date: payload.expected_delivery_date,
        },
      }).unwrap();
      
      alert("Purchase Order Issued Successfully!");
      handleCloseModal();
      refetch(); // Refresh the list
    } catch (err: any) {
      alert(err?.data?.error || err?.data?.detail || "Failed to issue Purchase Order. Please check your settings.");
      console.error(err);
    }
  };

  const handleLabourCreateBill = () => {
    setIsLabourInvoiceModalOpen(false);
    setIsLabourCreateBillModalOpen(true);
  };

  const handleLabourSubmitBill = () => {
    alert("Vendor bill submitted successfully!");
    setIsLabourCreateBillModalOpen(false);
    setSelectedRequest(null);
  };

  const handlePettyCashCreateBill = () => {
    setIsPettyCashInvoiceModalOpen(false);
    setIsPettyCashDisbursementModalOpen(true);
  };

  const handlePettyCashSubmitDisbursement = () => {
    alert("Disbursement submitted successfully!");
    setIsPettyCashDisbursementModalOpen(false);
    setSelectedRequest(null);
  };

  const parseDetail = (detail: any) => {
    if (!detail) return {};
    if (typeof detail === "string") {
      try {
        return JSON.parse(detail);
      } catch {
        return {};
      }
    }
    return detail;
  };

  const requests = (apiRequests ?? []).map((req: any) => {
    const detail = parseDetail(req.detail);
    const typeMap: Record<string, string> = {
      purchase: "Purchase",
      subcontractor: "Subcontractor",
      plant_equipment: "Plant and Equipment",
      labour: "Labour Request",
      petty_cash: "Petty Cash Request",
    };
    return {
      id: req.reference_id || `REQ-${req.id}`,
      backendId: req.id,
      sourceId: detail?.id || req.id, // The ID of the specific underlying request
      originalType: req.request_type,
      type: typeMap[req.request_type] || req.request_type,
      wbs:
        req.project_details?.name ||
        req.project_details?.code ||
        `Project #${req.project}`,
      wbsId: detail?.wbs_element || detail?.task || req.project || "",
      approvalDate: req.created_at?.split("T")[0] || "N/A",
      requestedAmount:
        detail?.amount_requested ||
        detail?.amountRequested ||
        detail?.amount ||
        detail?.total_amount ||
        0,
      supplierName:
        detail?.supplier_name ||
        detail?.supplierName ||
        req.created_by_details?.first_name ||
        "",
      projectName: req.project_details?.name || "General Project",
      paymentTerms: detail?.payment_terms || detail?.paymentTerms || "N/A",
      products: (detail?.products || detail?.lines || []).map((p: any) => ({
        productName: p.productName || p.description || p.item_name || `Product #${p.product || 'Unknown'}`,
        unit: p.unit || p.unit_of_measure || "Unit",
        qty: Number(p.qty || p.quantity || 0),
        unitPrice: Number(p.unitPrice || p.estimated_unit_cost || p.unit_cost || 0),
        total: Number(p.total || p.line_total || 0),
      })),
      pettyCashId: detail?.petty_cash_id || detail?.pettyCashId || "",
      requesterName: req.created_by_details
        ? `${req.created_by_details.first_name} ${req.created_by_details.last_name}`
        : "",
      date: req.created_at?.split("T")[0] || "",
      purpose: detail?.purpose || "",
      accountType: detail?.account_type || detail?.accountType || "",
    };
  });

  const filteredRequests = requests.filter(
    (request) =>
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.wbs.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.approvalDate.includes(searchTerm),
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={items} className="pl-0 mb-6 " />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center mb-6 bg-white rounded px-4 py-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-gray-900">Invoicing</h1>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  WBS element
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested Amount
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {searchTerm && filteredRequests.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-3 text-center text-sm text-gray-600"
                  >
                    No result found
                  </td>
                </tr>
              )}

              {filteredRequests.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-3 text-center text-sm text-gray-600"
                  >
                    No approved requests found
                  </td>
                </tr>
              )}
              {filteredRequests.map((request, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {request.id}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(request.type)}`}
                    >
                      {request.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {request.wbs}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {request.approvalDate}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {formatCurrency(request.requestedAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-start gap-2 flex-wrap">
                      {request.type === "Purchase" && (
                        <button
                          type="button"
                          onClick={() => handleConvertToPO(request)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors whitespace-nowrap"
                        >
                          Convert to PO
                        </button>
                      )}

                      {request.type === "Subcontractor" && (
                        <span className="flex items-center gap-2">
                          <Link
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors whitespace-nowrap"
                            href={`/invoice/purchase-order/subcontractor/${request.id}`}
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              handleConvertToSubcontractor(request)
                            }
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors whitespace-nowrap"
                          >
                            Convert to PO
                          </button>
                        </span>
                      )}

                      {request.type === "Plant and Equipment" && (
                        <button
                          type="button"
                          // onClick={() => handleConvertToPlantEquipment(request)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors whitespace-nowrap"
                        >
                          Convert to PO
                        </button>
                      )}

                      {request.type === "Labour Request" && (
                        <button
                          type="button"
                          onClick={() => handleConvertToLabourInvoice(request)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors whitespace-nowrap"
                        >
                          Convert to Invoice
                        </button>
                      )}

                      {request.type === "Petty Cash Request" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleConvertToPettyCashInvoice(request)
                          }
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors whitespace-nowrap"
                        >
                          Convert to Invoice
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Convert to PO Modal */}
      <ConvertToPOModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        request={selectedRequest}
        currentStep={currentStep}
        onNextStep={handleNextStep}
        onBackStep={handleBackStep}
        onIssuePO={handleIssuePO}
        formatCurrency={formatCurrency}
      />

      {/* Convert to PO Subcontractor Modal */}
      <ConvertToPOSubcontractorModal
        isOpen={isSubcontractorModalOpen}
        onClose={handleCloseSubcontractorModal}
        currentStep={currentStep}
        onNextStep={handleNextStep}
        onBackStep={handleBackStep}
        onIssuePO={() => handleIssuePO({ vendor: 0, payment_term: null, expected_delivery_date: "", currency: 0 })}
        formatCurrency={formatCurrency}
      />

      {/* Convert to Invoice Labour Request Modal */}
      <ConvertToInvoiceLabourModal
        isOpen={isLabourInvoiceModalOpen}
        onClose={handleCloseLabourInvoiceModal}
        request={selectedRequest}
        onConfirm={handleLabourCreateBill}
      />

      {/* Create Vendor Bill Labour Request Modal */}
      <CreateVendorBillLabourModal
        isOpen={isLabourCreateBillModalOpen}
        onClose={handleCloseLabourCreateBillModal}
        request={selectedRequest}
        onSubmit={handleLabourSubmitBill}
        formatCurrency={formatCurrency}
      />

      {/* Convert to Invoice Petty Cash Modal */}
      <ConvertToInvoicePettyCashModal
        isOpen={isPettyCashInvoiceModalOpen}
        onClose={handleClosePettyCashInvoiceModal}
        request={selectedRequest}
        onConfirm={handlePettyCashCreateBill}
        formatCurrency={formatCurrency}
      />

      {/* Create Disbursement Petty Cash Modal */}
      <CreateDisbursementModal
        isOpen={isPettyCashDisbursementModalOpen}
        onClose={handleClosePettyCashDisbursementModal}
        request={selectedRequest}
        onSubmit={handlePettyCashSubmitDisbursement}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
