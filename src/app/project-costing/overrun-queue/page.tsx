"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, Plus, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { ViewToggle } from "@/components/purchase/purchaseRequest/ViewToggle";
import { cn } from "../../../lib/utils";
import {
  ApprovedIcon,
  DraftIcon,
  PenddingIcon,
  RejectedIcon,
} from "@/components/shared/icons";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
} from "@/components/shared/AnimatedWrapper";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusPill } from "@/components/purchase/purchaseRequest/StatusPill";

// Mock Data matching the Purchase Request structure but for Overrun
const INITIAL_REQUESTS = [
  {
    id: "MCR-00045",
    project: "Project Alpha - Mall Construction",
    wbs: "Foundation / Concrete",
    amount: "750,000",
    requester: "John Site-Lead",
    status: "pending", // Using 'pending' to match StatusCards logic
    overrun: "250,000",
    date: "29 Apr 2026",
  },
  {
    id: "MCR-00048",
    project: "Project Beta - Office Complex",
    wbs: "Structure / Steel Works",
    amount: "1,200,000",
    requester: "Sarah Foreman",
    status: "pending",
    overrun: "200,000",
    date: "28 Apr 2026",
  },
];

export default function OverrunQueuePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [currentView, setCurrentView] = useState<"grid" | "list">("list");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Project Costing", href: "/project-costing" },
    {
      label: "Overrun Queue",
      href: "/project-costing/overrun-queue",
      current: true,
    },
  ];

  const filtered = useMemo(() => {
    if (!query.trim()) return INITIAL_REQUESTS;
    return INITIAL_REQUESTS.filter(
      (r) =>
        r.id.toLowerCase().includes(query.toLowerCase()) ||
        r.project.toLowerCase().includes(query.toLowerCase()) ||
        r.requester.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query]);

  const counts = {
    pending: filtered.length,
    approved: 0,
    rejected: 0,
    draft: 0,
  };

  const handleCardClick = (id: string) => {
    router.push(`/project-costing/overrun-queue/${id}`);
  };

  const toggleAll = () => {
    if (Object.keys(selected).length === filtered.length) {
      setSelected({});
    } else {
      const newSelected: Record<string, boolean> = {};
      filtered.forEach((r) => (newSelected[r.id] = true));
      setSelected(newSelected);
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const kpiCard = (
    label: string,
    value: number,
    icon: React.ReactNode,
    colorClass = "text-gray-700",
    borderClass = "sm:border-r border-l-transparent border-y-transparent",
  ) => (
    <Card
      className={cn(
        borderClass,
        "p-4 shadow-none rounded-none cursor-pointer hover:bg-gray-50 transition-colors border-b sm:border-b-transparent",
      )}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-lg">{icon}</div>
          <div className={cn("text-sm font-medium", colorClass)}>{label}</div>
        </div>
        <div className={cn("text-[2rem] font-bold", colorClass)}>{value}</div>
      </div>
    </Card>
  );

  return (
    <main className="min-h-screen text-gray-800 mr-4 bg-[#F9FAFB]">
      <PageHeader items={breadcrumbs} title="Overrun Queue" />

      {/* Status Cards - Perfect Replica of StatusCards.tsx */}
      <div className="bg-white rounded-md shadow hover:shadow-lg transition-shadow duration-300 p-6 pb-4 mt-6">
        <section className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiCard(
              "Awaiting PM Review",
              counts.pending,
              <PenddingIcon color="#F0B401" />,
              "text-[#F0B401]",
            )}
            {kpiCard(
              "Approved Overruns",
              counts.approved,
              <ApprovedIcon color="#2BA24D" />,
              "text-[#2BA24D]",
            )}
            {kpiCard(
              "Rejected Overruns",
              counts.rejected,
              <RejectedIcon color="#E43D2B" />,
              "text-[#E43D2B]",
            )}
            {kpiCard(
              "Draft Review",
              counts.draft,
              <DraftIcon color="#3B7CED" />,
              "text-[#3B7CED]",
              "border-transparent",
            )}
          </div>
        </section>
      </div>

      {/* Header / Search / Toggle - Perfect Replica of PurchaseRequestsPage */}
      <div className="bg-white p-6 rounded-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg text-nowrap">Overrun Entries</h2>
          <div className="relative w-xs">
            <Input
              type="text"
              className="w-full pl-10 pr-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search overrun queue..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <SearchIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>
        </div>
        <div className="flex space-x-4">
          <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
        </div>
      </div>

      {/* List / Grid View */}
      <section className="mx-auto mt-6">
        <FadeIn>
          {currentView === "list" ? (
            <Card className="rounded-lg overflow-hidden border-none shadow-none bg-transparent">
              <div className="px-6 bg-white rounded-lg py-4">
                <div className="hidden md:grid grid-cols-[48px_1.5fr_2fr_1fr_1.5fr_1fr] items-center bg-gray-100 rounded-md px-4 py-3 text-sm font-medium text-gray-500 border-b border-gray-100">
                  <div className="flex items-center">
                    <Checkbox
                      checked={
                        Object.keys(selected).length === filtered.length &&
                        filtered.length > 0
                      }
                      onCheckedChange={toggleAll}
                    />
                  </div>
                  <div>Request ID</div>
                  <div>Project & WBS</div>
                  <div>Overrun Amt</div>
                  <div>Requester</div>
                  <div>Status</div>
                </div>

                <div className="mt-2 divide-y divide-gray-100">
                  {filtered.map((req, index) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleCardClick(req.id)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors group"
                    >
                      {/* Desktop View */}
                      <div className="hidden md:grid grid-cols-[48px_1.5fr_2fr_1fr_1.5fr_1fr] items-center px-4 py-4">
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={!!selected[req.id]}
                            onCheckedChange={() => toggleOne(req.id)}
                          />
                        </div>
                        <div className="font-bold text-[#3B7CED]">{req.id}</div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {req.project}
                          </p>
                          <p className="text-xs text-gray-500">{req.wbs}</p>
                        </div>
                        <div className="font-bold text-red-600">
                          ₦{req.overrun}
                        </div>
                        <div className="text-gray-600">{req.requester}</div>
                        <div>
                          <StatusPill status={req.status as any} />
                        </div>
                      </div>

                      {/* Mobile View */}
                      <div className="md:hidden p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={!!selected[req.id]}
                                onCheckedChange={() => toggleOne(req.id)}
                              />
                            </div>
                            <span className="font-bold text-[#3B7CED]">{req.id}</span>
                          </div>
                          <StatusPill status={req.status as any} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {req.project}
                          </p>
                          <p className="text-[10px] text-gray-500">{req.wbs}</p>
                        </div>
                        <div className="flex justify-between items-end pt-2 border-t border-gray-50">
                          <div>
                            <p className="text-[9px] uppercase font-bold text-gray-400">Overrun</p>
                            <p className="text-sm font-bold text-red-600">₦{req.overrun}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] uppercase font-bold text-gray-400">Requester</p>
                            <p className="text-xs font-medium text-gray-600">{req.requester}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((req) => (
                <Card
                  key={req.id}
                  className="p-6 hover:shadow-md transition-all cursor-pointer border-gray-100"
                  onClick={() => handleCardClick(req.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-bold text-[#3B7CED]">
                      {req.id}
                    </span>
                    <StatusPill status={req.status as any} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    {req.project}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">{req.wbs}</p>
                  <div className="flex justify-between items-end pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">
                        Overrun
                      </p>
                      <p className="text-lg font-black text-red-600">
                        ₦{req.overrun}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-gray-400">
                        Requester
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        {req.requester}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </FadeIn>
      </section>
    </main>
  );
}
