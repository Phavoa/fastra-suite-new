"use client";

import React from "react";
import Link from "next/link";
import { FileText, FileCheck, ShieldAlert } from "lucide-react";
import { NavBar } from "@/components/shared/TopBar/reusableTopBar";
import { useModulePermissions } from "@/hooks/useModulePermissions";

export default function ApproverDashboardPage() {
  const { canDo } = useModulePermissions();

  const showMakeRequest = canDo("projectRequest", "requester") || canDo("projectRequest", "manager") || canDo("projectRequest", "administrator");
  const showApproveRequest = canDo("projectRequest", "approver") || canDo("projectRequest", "administrator");

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <NavBar title="Approver Dashboard" items={[]} backUrl="/" />
      
      <main className="max-w-2xl mx-auto p-4 pt-6">
        <div className="space-y-4">
          {showMakeRequest && (
            <Link href="/project-request/make-request" className="block">
              <div className="bg-white border border-green-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <FileText className="w-6 h-6 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold text-green-600 mb-1">Make a request</h2>
                    <p className="text-sm text-gray-500">Create a new purchase, labour, or equipment request</p>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {showApproveRequest && (
            <Link href="/project-request/approve" className="block">
              <div className="bg-white border border-blue-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <FileCheck className="w-6 h-6 text-[#3B7CED] mt-0.5 shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold text-[#3B7CED] mb-1">Approve Requests</h2>
                    <p className="text-sm text-gray-500">Review and approve pending requests from team members</p>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {!showMakeRequest && !showApproveRequest && (
            <div className="bg-white border border-red-200 rounded-lg p-6 text-center">
              <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-600 mb-1">Access Restricted</h3>
              <p className="text-sm text-gray-500">
                You do not have permission to submit or approve requests on this module.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
