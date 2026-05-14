"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Bell, User } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";
import { Button } from "@/components/ui/button";

const DataField = ({ label, value, fullWidth = false }: { label: string; value: string | React.ReactNode; fullWidth?: boolean }) => (
  <div className={`flex flex-col gap-1 ${fullWidth ? "col-span-2" : ""}`}>
    <p className="text-[13px] text-gray-400 font-medium">{label}</p>
    <p className="text-[14px] font-semibold text-gray-900">{value}</p>
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <h2 className="text-[17px] font-normal text-[#3B7CED] mb-4 mt-6 first:mt-0">{title}</h2>
);

export default function RequestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const user = useSelector((state: RootState) => state.auth?.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const requestId = typeof params.id === "string" ? params.id : "PR00001";
  
  // Determine variant based on ID prefix
  const isPettyCash = requestId.startsWith("PC");
  const isLabour = requestId.startsWith("LR");
  const isSubcontractor = requestId.startsWith("SC");
  const isPlantEquipment = requestId.startsWith("PE");
  const isPurchase = requestId.startsWith("PR") || (!isPettyCash && !isLabour && !isSubcontractor && !isPlantEquipment);

  // Common Dummy Data
  const commonData = {
    requestedBy: "Firstname Lastname",
    date: "4 Apr 2024",
    project: "Building project",
    phase: "Roofing",
    task: "P.O.P",
    note: "This is a short description of the item",
    availableBudget: "N5,000,000.00"
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-32">
      {/* Custom Header */}
      <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-xl md:text-2xl font-normal text-gray-900">Approve Request</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={24} className="text-gray-900" />
            </button>
            <div className="w-8 h-8 bg-[#ffcdd2] rounded-full flex items-center justify-center overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={18} className="text-red-900" />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 bg-white min-h-[calc(100vh-64px)] shadow-sm">
        <SectionHeader title="Basic Information" />
        
        {/* Dynamic Basic Information */}
        <div className="grid grid-cols-2 gap-y-5 gap-x-4">
          <DataField label="Request Type" value={
            isPettyCash ? "Petty Cash Request" : 
            isLabour ? "Labour Request" : 
            isSubcontractor ? "Subcontractor Request" :
            isPlantEquipment ? "Plant & Equipment Request" :
            "Purchase Request"
          } />
          <DataField label="Requested by" value={commonData.requestedBy} />
          
          <DataField label="Request ID" value={requestId} />
          <DataField label="Date" value={commonData.date} />
          
          <div className="col-span-2 border-t border-gray-200 my-1"></div>
          
          <DataField label="Project" value={commonData.project} />
          
          {isPettyCash && (
            <>
              <DataField label="Purpose / Expense Category" value="Engineer" />
              <DataField label="Description of Expense" value="This is a short description of the expense" fullWidth />
            </>
          )}

          {isLabour && (
            <>
              <DataField label="Role / Trade Type" value="Engineer" />
              <DataField label="Number of Workers" value="12" />
            </>
          )}

          {isSubcontractor && (
            <>
              <DataField label="Scope of Work" value="Engineer" />
              <DataField label="Subcontractor Name" value="Firstname Lastname" fullWidth />
              <DataField label="Start Date" value="4 Apr 2024" />
              <DataField label="End Date" value="4 Apr 2024" />
            </>
          )}

          {isPlantEquipment && (
            <>
              <DataField label="Equipment Name" value="Engineer" />
              <DataField label="Description" value="This is a short description of the item" fullWidth />
              <DataField label="Quantity" value="24" />
              <DataField label="Required Date" value="4 Apr 2024" />
            </>
          )}

          {isPurchase && (
            <>
              <DataField label="Required By Date" value="16 Apr 2024" />
              <DataField label="Site Location" value="Lagos" />
            </>
          )}
        </div>

        <SectionHeader title="WBS" />
        <div className="grid grid-cols-2 gap-y-5 gap-x-4">
          <DataField label="Phase" value={commonData.phase} />
          <DataField label="Task" value={commonData.task} />
        </div>

        {/* Dynamic Cost Details / Products */}
        {isPettyCash && (
          <>
            <SectionHeader title="Cost Details" />
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <DataField label="Amount Requested" value="N500,000" fullWidth />
              <DataField label="Note" value={commonData.note} fullWidth />
            </div>
          </>
        )}

        {isLabour && (
          <>
            <SectionHeader title="Cost Details" />
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <DataField label="Duration (days/weeks)" value="1 week" />
              <DataField label="Estimated Daily Rate" value="N800,000" />
              <DataField label="Note" value={commonData.note} fullWidth />
            </div>
          </>
        )}

        {isSubcontractor && (
          <>
            <SectionHeader title="Cost Details" />
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <DataField label="Contract Value (Estimated)" value="N500,000" />
              <DataField label="Payment Terms" value="N500,000" />
              <DataField label="Note" value={commonData.note} fullWidth />
            </div>
          </>
        )}

        {isPlantEquipment && (
          <>
            <SectionHeader title="Cost Details" />
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <DataField label="Estimated Cost" value="N500,000" fullWidth />
              <DataField label="Note" value={commonData.note} fullWidth />
            </div>
          </>
        )}

        {isPurchase && (
          <>
            <SectionHeader title="Products" />
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[14px] font-semibold text-gray-900">Cassava</span>
                    <span className="text-[14px] font-semibold text-gray-900">N500,000</span>
                  </div>
                  <div className="text-[12px] text-gray-600 mb-1">24 QTY</div>
                  <div className="text-[12px] text-gray-400">This is a short description of the item</div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <DataField label="Note" value={commonData.note} fullWidth />
            </div>
          </>
        )}
      </main>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 md:py-6 z-40">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-sm font-bold text-gray-900">
              <span>Available Budget</span>
              <span>{commonData.availableBudget}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-gray-900">
              <span>Total Cost</span>
              <span className="text-[#3B7CED]">
                {isLabour ? "N1,500,000.00" : "N500,000.00"}
              </span>
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              className="flex-1 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 h-12 text-base font-semibold"
            >
              Reject
            </Button>
            <Button 
              className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-white h-12 text-base font-semibold"
            >
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
