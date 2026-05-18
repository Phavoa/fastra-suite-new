"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, User } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";
import { Button } from "@/components/ui/button";

// Dummy data based on the provided mockup
const DUMMY_REQUESTS = [
  {
    id: "PR00001",
    project: "Project 1",
    type: "Purchase Request",
    requester: "Firstname Lastname",
  },
  {
    id: "LR00001",
    project: "Project 1",
    type: "Labour Request",
    requester: "Firstname Lastname",
  },
  {
    id: "PC00001",
    project: "Project 1",
    type: "Petty Cash Request",
    requester: "Firstname Lastname",
  },
  {
    id: "SC00001",
    project: "Project 1",
    type: "Subcontractor Request",
    requester: "Firstname Lastname",
  },
  {
    id: "PE00001",
    project: "Project 1",
    type: "Plant & Equipment Request",
    requester: "Firstname Lastname",
  },
];

export default function ApproveRequestPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth?.user);

  const [requests, setRequests] = useState(DUMMY_REQUESTS);

  const handleApprove = (id: string) => {
    // Implement approval logic here
    console.log("Approved", id);
    // Remove from list for demo purposes
    setRequests(requests.filter((req) => req.id !== id));
  };

  const handleReject = (id: string) => {
    // Implement rejection logic here
    console.log("Rejected", id);
    // Remove from list for demo purposes
    setRequests(requests.filter((req) => req.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Custom Header with Back Button */}
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
            <h1 className="text-xl md:text-2xl font-normal text-gray-900">
              Approve Request
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={24} className="text-gray-900" />
            </button>
            <div className="w-8 h-8 bg-[#ffcdd2] rounded-full flex items-center justify-center overflow-hidden">
              {/* In a real app we'd use the user's avatar image here if available */}
              {user?.user_image ? (
                <img
                  src={user.user_image}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={18} className="text-red-900" />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pt-6 pb-24">
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-[#3B7CED] transition-colors"
              onClick={() =>
                router.push(`/project-request/approve/${request.id}`)
              }
            >
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-xs font-bold text-[#3B7CED] mb-0.5 block">
                    {request.id}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    {request.project}
                  </h3>
                </div>

                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-medium mb-0.5">
                      Request Type
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {request.type}
                    </p>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xs text-gray-400 font-medium mb-0.5">
                      Requester
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {request.requester}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 h-10 font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(request.id);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    className="flex-1 border border-[#22c55e] bg-[#22c55e] hover:bg-[#16a34a] text-white h-10 font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(request.id);
                    }}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {requests.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No pending requests to approve.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
