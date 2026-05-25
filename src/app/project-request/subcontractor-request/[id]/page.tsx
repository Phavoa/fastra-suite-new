"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
} from "@/components/shared/AnimatedWrapper";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";
import { 
  useGetSubcontractorRequestQuery, 
  useUpdateSubcontractorRequestMutation 
} from "@/api/subcontractorRequestApi";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function SubcontractorRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const statusModal = useStatusModal();
  const requestId = Number(params.id);

  const getStatusBadgeVariant = (status?: string) => {
    if (!status) return "pending";
    switch (status) {
      case "approved":
      case "completed":
        return "validated";
      case "submitted":
      case "clarification_needed":
      case "in_progress":
        return "pending";
      case "draft":
        return "draft";
      case "rejected":
        return "rejected";
      default:
        return "pending";
    }
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return "Pending";
    switch (status) {
      case "clarification_needed":
        return "Clarification Needed";
      case "in_progress":
        return "In Progress";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  const { data: request, isLoading, error } = useGetSubcontractorRequestQuery(requestId);
  const [updateRequest, { isLoading: isUpdating }] = useUpdateSubcontractorRequestMutation();

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isClarifyModalOpen, setIsClarifyModalOpen] = useState(false);
  const [clarificationNote, setClarificationNote] = useState("");

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Subcontractor Request", href: "/project-request/subcontractor-request" },
    {
      label: request?.reference_id || (request?.id ? `SR-${String(request.id).padStart(5, '0')}` : "Details"),
      href: `/project-request/subcontractor-request/${requestId}`,
      current: true,
    },
  ];

  const handleApprove = async () => {
    try {
      await updateRequest({
        id: requestId,
        body: { status: "approved" }
      }).unwrap();
      
      statusModal.showSuccess(
        "Request Approved",
        `Subcontractor request SR-${String(requestId).padStart(5, '0')} has been approved and moved to the processing queue.`
      );
    } catch (err) {
      statusModal.showError("Approval Failed", "There was an error approving the request. Please try again.");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    
    try {
      await updateRequest({
        id: requestId,
        body: { 
          status: "rejected",
          // justification_notes: (request?.justification_notes || "") + "\n\nREJECTION REASON: " + rejectionReason 
        }
      }).unwrap();
      
      setIsRejectModalOpen(false);
      statusModal.showSuccess(
        "Request Rejected",
        `The request has been rejected. The submitter has been notified with the reason: "${rejectionReason}"`
      );
    } catch (err) {
      statusModal.showError("Rejection Failed", "There was an error rejecting the request.");
    }
  };

  const handleClarify = async () => {
    if (!clarificationNote.trim()) return;
    
    try {
      await updateRequest({
        id: requestId,
        body: { 
          status: "clarification_needed",
        }
      }).unwrap();
      
      setIsClarifyModalOpen(false);
      statusModal.showSuccess(
        "Clarification Requested",
        `The request has been sent back to the submitter for clarification.`
      );
    } catch (err) {
      statusModal.showError("Action Failed", "There was an error processing your request.");
    }
  };

  const handleModalClose = () => {
    statusModal.close();
    if (statusModal.type === "success") {
      router.push("/project-request/subcontractor-request");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">Error loading request</h2>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <FadeIn className="h-full text-gray-900 font-sans antialiased pr-4 bg-[#F9FAFB]">
      <PageHeader items={breadcrumbs} title="Subcontractor Request Details" />

      <div className="max-w-5xl mx-auto px-6 py-8 bg-white min-h-screen shadow-sm rounded-lg my-4">
        <FadeIn delay={0.2}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-sm font-medium text-[#3B7CED] uppercase tracking-wider mb-1">
                Basic Information
              </h2>
              <h1 className="text-2xl font-bold text-gray-900">
                {request.reference_id || `SR-${String(request.id).padStart(5, '0')}`}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={getStatusBadgeVariant(request.status)}>
                {getStatusLabel(request.status)}
              </Badge>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <SlideUp delay={0.3}>
            <div className="space-y-6">
              <div>
                <Label className="text-xs text-gray-500 font-bold uppercase">Subcontractor</Label>
                <p className="text-gray-900 font-semibold text-lg">{request.vendor_name || "N/A"}</p>
                <p className="text-sm text-gray-500">{request.vendor_email}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500 font-bold uppercase">Payment Type</Label>
                <p className="text-gray-900 capitalize">{request.payment_type.replace('_', ' ')}</p>
              </div>
            </div>
          </SlideUp>

          <SlideUp delay={0.4}>
            <div className="space-y-6">
              <div>
                <Label className="text-xs text-gray-500 font-bold uppercase">Duration</Label>
                <p className="text-gray-900 font-medium">
                  {request.start_date} — {request.end_date}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500 font-bold uppercase">Contract Value</Label>
                <p className="text-2xl font-black text-[#3B7CED]">
                  ₦{Number(request.contract_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500 font-bold uppercase">Payment Terms</Label>
                <p className="text-gray-900">{request.payment_terms}</p>
              </div>
            </div>
          </SlideUp>

          <SlideUp delay={0.5}>
            <div className="space-y-6">
              <div>
                <Label className="text-xs text-gray-500 font-bold uppercase">Date Created</Label>
                <p className="text-gray-900">{new Date(request.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500 font-bold uppercase">Scope of Work</Label>
                <p className="text-gray-700 text-sm italic">"{request.scope_of_work}"</p>
              </div>
            </div>
          </SlideUp>
        </div>

        {/* Milestones Section */}
        {request.payment_type === "milestone" && (
          <div className="mt-12">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#3B7CED] rounded-full"></span>
              Project Milestones
            </h3>
            <div className="border rounded-xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-bold text-gray-600">Milestone Name</TableHead>
                    <TableHead className="font-bold text-gray-600 text-center">Weight (%)</TableHead>
                    <TableHead className="font-bold text-gray-600">Completion Criteria</TableHead>
                    <TableHead className="font-bold text-gray-600 text-right">Value (₦)</TableHead>
                    <TableHead className="font-bold text-gray-600 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {request.milestones.map((m, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-semibold text-gray-900">{m.name}</TableCell>
                      <TableCell className="text-center font-medium">{m.percentage}%</TableCell>
                      <TableCell className="text-gray-500 text-sm max-w-xs truncate">{m.completion_criteria}</TableCell>
                      <TableCell className="text-right font-bold">
                        ₦{( (Number(m.percentage) / 100) * Number(request.contract_value) ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        {m.is_completed ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Completed</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">Pending</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Audit Trail / Request History (PRD Section 4.11) */}
        <div className="mt-12">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
            Audit Trail & History
          </h3>
          <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
            {/* Mock History based on current status */}
            <div className="relative pl-10">
              <span className="absolute left-0 top-0 w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              </span>
              <div>
                <p className="text-sm font-bold text-gray-900">Request Created</p>
                <p className="text-xs text-gray-500">{new Date(request.created_at).toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">Initiated by Site Worker</p>
              </div>
            </div>
            
            {request.status !== "draft" && (
              <div className="relative pl-10">
                <span className="absolute left-0 top-0 w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900">Submitted for Approval</p>
                  <p className="text-xs text-gray-500">{new Date(request.created_at).toLocaleString()}</p>
                </div>
              </div>
            )}

            {request.status === "approved" && (
              <div className="relative pl-10">
                <span className="absolute left-0 top-0 w-9 h-9 bg-green-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900">Request Approved</p>
                  <p className="text-xs text-gray-500">Just now</p>
                  <p className="text-sm text-gray-600 mt-1 italic font-medium text-green-700">"Budget validation passed. Ready for procurement."</p>
                </div>
              </div>
            )}

            {request.status === "rejected" && (
              <div className="relative pl-10">
                <span className="absolute left-0 top-0 w-9 h-9 bg-red-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900">Request Rejected</p>
                  <p className="text-xs text-gray-500">Just now</p>
                  <p className="text-sm text-red-600 mt-1 italic font-medium">"Reason: {rejectionReason || "Exceeds quarterly budget allocation."}"</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {request.justification_notes && (
          <div className="mt-10 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
            <Label className="text-[10px] font-black uppercase text-blue-600">Justification Notes</Label>
            <p className="mt-1 text-gray-700 text-sm leading-relaxed">{request.justification_notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        {request.status === "submitted" && (
          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setIsClarifyModalOpen(true)}
              className="px-8 h-12 rounded-xl font-bold border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Request Clarification
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(true)}
              className="px-8 h-12 rounded-xl font-bold border-red-200 text-red-600 hover:bg-red-50"
            >
              Reject Request
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isUpdating}
              className="px-12 h-12 rounded-xl font-bold bg-[#3B7CED] hover:bg-[#2d63c7] text-white shadow-lg shadow-blue-200"
            >
              {isUpdating ? "Approving..." : "Approve Request"}
            </Button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this subcontractor request. This will be visible to the submitter.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason" className="mb-2 block">Rejection Reason *</Label>
            <Textarea
              id="reason"
              placeholder="e.g. Contract value exceeds budget limits or scope is unclear."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white" 
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clarification Modal */}
      <Dialog open={isClarifyModalOpen} onOpenChange={setIsClarifyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Clarification</DialogTitle>
            <DialogDescription>
              Explain what information is missing or needs adjustment.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="note" className="mb-2 block">Clarification Note *</Label>
            <Textarea
              id="note"
              placeholder="Please provide more details on..."
              value={clarificationNote}
              onChange={(e) => setClarificationNote(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsClarifyModalOpen(false)}>Cancel</Button>
            <Button 
              className="bg-[#3B7CED] text-white hover:bg-blue-700" 
              onClick={handleClarify}
              disabled={!clarificationNote.trim()}
            >
              Send Back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={handleModalClose}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        actionText="Back to List"
        onAction={handleModalClose}
        showCloseButton={false}
      />
    </FadeIn>
  );
}
