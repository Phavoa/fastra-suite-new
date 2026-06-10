"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BasicInformationForm } from "@/components/project-costing/BasicInformationForm";
import { WBSTable } from "@/components/project-costing/wbs/WBSTable";
import { Phase } from "@/components/project-costing/types";
import { useCreateProjectCostingProjectMutation } from "@/api/projectCostingApi";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";
import { extractErrorMessage } from "@/lib/utils";

export default function NewProjectPage() {
  const router = useRouter();

  // Basic Information States
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expectedEndDate, setExpectedEndDate] = useState("");
  const [description, setDescription] = useState("");

  // WBS Table States
  const [phases, setPhases] = useState<Phase[]>([]);

  const [createProject, { isLoading }] = useCreateProjectCostingProjectMutation();
  const statusModal = useStatusModal();

  const handleSubmit = async () => {
    if (!name || !clientName) {
      statusModal.showError(
        "Missing Information",
        "Project Name and Client Name are required. Please fill in these fields before submitting."
      );
      return;
    }

    // Map Phase structure to WBS nested tree items (backend schema)
    // - PHASE: no name (auto-generated), children = [SUB_PHASE | ACTIVITY]
    // - SUB_PHASE: name required, children = [ACTIVITY]
    // - ACTIVITY: name required, budget_lines = [{ cost_category, amount }]
    const wbsPayload: import("@/types/projectCosting").WBSCreateItem[] = phases.map((phase) => ({
      element_type: "PHASE" as const,
      children: [
        // 1. Direct activities under the phase
        ...phase.activities.map((a) => ({
          element_type: "ACTIVITY" as const,
          name: a.name,
          budget_lines: [
            {
              cost_category: "LABOUR",
              amount: String(a.budget || 0),
            },
          ],
        })),
        // 2. Subphases (each containing their own activities)
        ...phase.subphases.map((sub) => ({
          element_type: "SUB_PHASE" as const,
          name: sub.name,
          children: sub.activities.map((a) => ({
            element_type: "ACTIVITY" as const,
            name: a.name,
            budget_lines: [
              {
                cost_category: "LABOUR",
                amount: String(a.budget || 0),
              },
            ],
          })),
        })),
      ],
    }));

    try {
      await createProject({
        name,
        client_name: clientName,
        project_type: projectType,
        start_date: startDate || new Date().toISOString().split("T")[0],
        expected_end_date: expectedEndDate || new Date().toISOString().split("T")[0],
        description,
        wbs: wbsPayload,
      }).unwrap();

      statusModal.showSuccess(
        "Project Created Successfully",
        `Your project "${name}" has been created and submitted for approval.`
      );
    } catch (err: any) {
      statusModal.showError(
        "Project Creation Failed",
        extractErrorMessage(
          err,
          "There was an error creating your project. Please check your inputs and try again."
        )
      );
    }
  };

  const handleModalAction = () => {
    statusModal.close();
    if (statusModal.type === "success") {
      router.push("/project-costing");
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b border-gray-100">
        <Link href="/project-costing">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Button>
        </Link>
        <h1 className="text-lg font-medium text-gray-800">New Project</h1>
      </div>

      <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-10 overflow-y-auto">
        <BasicInformationForm
          name={name}
          setName={setName}
          clientName={clientName}
          setClientName={setClientName}
          projectType={projectType}
          setProjectType={setProjectType}
          startDate={startDate}
          setStartDate={setStartDate}
          expectedEndDate={expectedEndDate}
          setExpectedEndDate={setExpectedEndDate}
          description={description}
          setDescription={setDescription}
        />
        <WBSTable phases={phases} setPhases={setPhases} />
      </div>

      {/* Footer sticky bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="bg-[#3B7CED] hover:bg-[#3065c3] text-white flex items-center gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit for Approval
        </Button>
      </div>

      {/* Status Modal */}
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={statusModal.close}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        actionText={statusModal.type === "success" ? "Done" : "Try again"}
        onAction={handleModalAction}
        showCloseButton={false}
      />
    </div>
  );
}
