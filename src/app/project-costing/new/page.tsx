"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BasicInformationForm } from "@/components/project-costing/BasicInformationForm";
import { WBSTable } from "@/components/project-costing/wbs/WBSTable";
import { Phase, Subphase, Activity } from "@/components/project-costing/types";
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importedFileName, setImportedFileName] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        if (!data || data.length === 0) {
          statusModal.showError("Invalid File", "The uploaded Excel file is empty.");
          return;
        }

        const firstRow = data[0];
        const hasPhase = "Phase" in firstRow;
        const hasActivity = "Activity" in firstRow;
        
        if (!hasPhase || !hasActivity) {
          statusModal.showError("Invalid Format", "The Excel file must contain 'Phase' and 'Activity' columns.");
          return;
        }

        const newPhases: Phase[] = [];
        const generateId = () => Math.random().toString(36).substr(2, 9);

        data.forEach((row) => {
          const phaseName = String(row.Phase || "").trim();
          const subphaseName = String(row.Subphase || "").trim();
          const activityName = String(row.Activity || "").trim();
          const quantity = Number(row.Quantity) || 1;
          const rate = Number(row.Rate) || 0;
          const budget = quantity * rate;

          if (!phaseName || !activityName) return; 

          let phase = newPhases.find((p) => p.name === phaseName);
          if (!phase) {
            phase = { id: generateId(), name: phaseName, subphases: [], activities: [] };
            newPhases.push(phase);
          }

          const activityObj: Activity = { id: generateId(), name: activityName, quantity, rate, budget };

          if (subphaseName) {
            let subphase = phase.subphases.find((s) => s.name === subphaseName);
            if (!subphase) {
              subphase = { id: generateId(), name: subphaseName, activities: [] };
              phase.subphases.push(subphase);
            }
            subphase.activities.push(activityObj);
          } else {
            phase.activities.push(activityObj);
          }
        });

        setPhases(newPhases);
        statusModal.showSuccess("Import Successful", "The WBS has been populated from the Excel file.");
      } catch (err) {
        statusModal.showError("Parsing Error", "There was an error reading the Excel file. Please ensure it is a valid format.");
      }
    };
    reader.readAsBinaryString(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!name || !clientName) {
      statusModal.showError(
        "Missing Information",
        "Project Name and Client Name are required. Please fill in these fields before submitting."
      );
      return;
    }

    // Map Phase structure to backend schema
    const phasesPayload = phases.map((phase) => ({
      name: phase.name,
      activities: [
        // Direct activities
        ...phase.activities.map((a) => ({
          name: a.name,
          amount: a.budget || 0,
          quantity: a.quantity || 1,
          rate: a.rate || a.budget || 0,
        })),
        // Flatten subphase activities into the phase
        ...phase.subphases.flatMap((sub) => 
          sub.activities.map((a) => ({
            name: `${sub.name} - ${a.name}`,
            amount: a.budget || 0,
            quantity: a.quantity || 1,
            rate: a.rate || a.budget || 0,
          }))
        ),
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
        phases: phasesPayload,
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
    if (statusModal.type === "success" && statusModal.title === "Project Created Successfully") {
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

        {/* Documents Section */}
        <section>
          <h2 className="text-[#3B7CED] text-base font-medium mb-4">
            Documents
          </h2>
          <div className="flex items-center">
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-6 py-6 border-2 border-dashed border-[#3B7CED] opacity-80 rounded text-[#3B7CED] hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add a document</span>
            </button>
            {importedFileName && (
              <div className="ml-4 flex items-center text-sm text-gray-600">
                <span className="font-medium text-gray-800 mr-2">File loaded:</span> {importedFileName}
              </div>
            )}
          </div>
        </section>

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
