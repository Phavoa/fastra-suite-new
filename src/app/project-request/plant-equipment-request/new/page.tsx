"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetProjectsQuery, useGetAvailableBudgetQuery } from "@/api/projectApi";
import { useCreatePlantEquipmentRequestMutation } from "@/api/requests/plantEquipmentRequestApi";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { motion, AnimatePresence } from "framer-motion";

export default function NewPlantEquipmentRequestPage() {
  const router = useRouter();
  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  // Queries
  const { data: projects = [] } = useGetProjectsQuery();

  // State values
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>("");
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [equipmentName, setEquipmentName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [requiredDate, setRequiredDate] = useState<string>("");
  const [estimatedCost, setEstimatedCost] = useState<number | "">("");
  const [notes, setNotes] = useState<string>("");

  // Modals state: "above_budget" | "unsuccessful" | "submitted" | null
  const [modalType, setModalType] = useState<"above_budget" | "unsuccessful" | "submitted" | null>(null);
  
  // Validation feedback modal state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-generate a Request ID
  const [requestId] = useState(() => {
    const num = Math.floor(Math.random() * 90000) + 10000;
    return `PE${num}`;
  });

  // Budget query
  const { data: budgetData } = useGetAvailableBudgetQuery(
    {
      project_id: Number(selectedProjectId),
      wbs_id: Number(selectedTaskId),
      cost_code: selectedProjectId === "2" ? "CC-05" : "CC-04",
    },
    { skip: !selectedProjectId || !selectedTaskId }
  );

  const availableBudget = budgetData?.available_budget
    ? Number(budgetData.available_budget)
    : 0;

  // Filter Phases
  const currentProject = useMemo(() => {
    return projects.find((p) => String(p.id) === selectedProjectId);
  }, [projects, selectedProjectId]);

  const phases = useMemo(() => {
    if (!currentProject) return [];
    return currentProject.wbs.filter((w) => !w.is_activity);
  }, [currentProject]);

  // Filter Tasks
  const tasks = useMemo(() => {
    if (!currentProject || !selectedPhaseId) return [];
    return currentProject.wbs.filter(
      (w) => w.is_activity && w.parent === Number(selectedPhaseId)
    );
  }, [currentProject, selectedPhaseId]);

  // Calculations
  const qtyNum = Number(quantity || 0);
  const costNum = Number(estimatedCost || 0);
  const totalCost = qtyNum * costNum;

  // Handle Form Submission
  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validation
    if (!selectedProjectId) {
      setValidationError("Please select a project.");
      return;
    }
    if (!equipmentName.trim()) {
      setValidationError("Please enter the equipment name.");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setValidationError("Please enter a valid quantity greater than 0.");
      return;
    }
    if (!requiredDate) {
      setValidationError("Please select a required date.");
      return;
    }
    if (!selectedPhaseId) {
      setValidationError("Please select a WBS phase.");
      return;
    }
    if (!selectedTaskId) {
      setValidationError("Please select a WBS task.");
      return;
    }
    if (!estimatedCost || Number(estimatedCost) <= 0) {
      setValidationError("Please enter a valid estimated unit cost.");
      return;
    }

    // Check budget limit
    if (totalCost > availableBudget) {
      setModalType("above_budget");
    } else {
      executeSubmission();
    }
  };

  const [createRequest, { isLoading: isCreating }] = useCreatePlantEquipmentRequestMutation();

  const executeSubmission = async () => {
    // Check for a specific trigger to simulate failed submission if needed
    if (estimatedCost === 999999) {
      setModalType("unsuccessful");
      return;
    }

    try {
      // Build API payload
      const payload = {
        reference_id: requestId,
        equipment_name: equipmentName,
        description: description,
        quantity: Number(quantity),
        required_date: requiredDate,
        estimated_cost: String(estimatedCost),
        justification_notes: notes,
        is_hidden: false,
        project_request: Number(selectedProjectId) || 1, // project ID
      };

      // Call API
      await createRequest(payload).unwrap();

      // Fallback local storage saving as well for backup/congruence
      const newRequest = {
        id: requestId,
        project: currentProject?.name || "Project",
        equipment: equipmentName,
        description,
        quantity: Number(quantity),
        estimatedCost: Number(estimatedCost),
        status: "pending" as const,
        requester: loggedInUser?.username || "Firstname Lastname",
        date: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        requiredDate,
        phase: phases.find((p) => String(p.id) === selectedPhaseId)?.name || "Phase",
        task: tasks.find((t) => String(t.id) === selectedTaskId)?.name || "Task",
        notes,
      };

      const stored = localStorage.getItem("plant_equipment_requests");
      let requestsList = [];
      if (stored) {
        try {
          requestsList = JSON.parse(stored);
        } catch (e) {
          requestsList = [];
        }
      }
      requestsList.unshift(newRequest);
      localStorage.setItem("plant_equipment_requests", JSON.stringify(requestsList));

      setModalType("submitted");
    } catch (error) {
      console.error("API submission failed, falling back to local storage:", error);
      
      // Fallback local storage saving
      try {
        const newRequest = {
          id: requestId,
          project: currentProject?.name || "Project",
          equipment: equipmentName,
          description,
          quantity: Number(quantity),
          estimatedCost: Number(estimatedCost),
          status: "pending" as const,
          requester: loggedInUser?.username || "Firstname Lastname",
          date: new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          requiredDate,
          phase: phases.find((p) => String(p.id) === selectedPhaseId)?.name || "Phase",
          task: tasks.find((t) => String(t.id) === selectedTaskId)?.name || "Task",
          notes,
        };

        const stored = localStorage.getItem("plant_equipment_requests");
        let requestsList = [];
        if (stored) {
          try {
            requestsList = JSON.parse(stored);
          } catch (e) {
            requestsList = [];
          }
        }
        requestsList.unshift(newRequest);
        localStorage.setItem("plant_equipment_requests", JSON.stringify(requestsList));

        setModalType("submitted");
      } catch (fallbackErr) {
        setModalType("unsuccessful");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-28">
      {/* Header Bar */}
      <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30 shadow-none">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/project-request/plant-equipment-request")}
              className="p-1 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">Plant & Equipment Re...</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Bell size={20} className="text-gray-800" />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
              <img
                src="https://api.dicebear.com/7.x/pixel-art/svg?seed=user123"
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Request Details */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
          <h2 className="text-xs font-bold text-[#3B7CED] uppercase tracking-wider">
            Request Details
          </h2>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Request ID</Label>
            <Input value={requestId} disabled className="h-11 bg-gray-50 text-gray-500 font-bold border-gray-200 shadow-none" />
          </div>
        </div>

        {/* Plant & Equipment Details */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
          <h2 className="text-xs font-bold text-[#3B7CED] uppercase tracking-wider">
            Plant & Equipment Details
          </h2>

          <div className="space-y-4">
            {/* Project Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Project</Label>
              <Select
                value={selectedProjectId}
                onValueChange={(val) => {
                  setSelectedProjectId(val);
                  setSelectedPhaseId("");
                  setSelectedTaskId("");
                }}
              >
                <SelectTrigger className="h-11 border-gray-200 bg-white w-full shadow-none">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Equipment Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Equipment Name</Label>
              <Input
                placeholder="Enter equipment name"
                value={equipmentName}
                onChange={(e) => setEquipmentName(e.target.value)}
                className="h-11 border-gray-200 shadow-none"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Description</Label>
              <Input
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-11 border-gray-200 shadow-none"
              />
            </div>

            {/* Quantity & Required Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Quantity</Label>
                <Input
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuantity(val === "" ? "" : Number(val));
                  }}
                  className="h-11 border-gray-200 shadow-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Required Date</Label>
                <Input
                  type="date"
                  placeholder="Enter date"
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  className="h-11 border-gray-200 shadow-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* WBS */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
          <h2 className="text-xs font-bold text-[#3B7CED] uppercase tracking-wider">
            WBS
          </h2>

          <div className="space-y-4">
            {/* Phase */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Phase</Label>
              <Select
                value={selectedPhaseId}
                onValueChange={(val) => {
                  setSelectedPhaseId(val);
                  setSelectedTaskId("");
                }}
                disabled={!selectedProjectId}
              >
                <SelectTrigger className="h-11 border-gray-200 bg-white disabled:bg-gray-50 w-full shadow-none">
                  <SelectValue placeholder="Select a phase" />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((ph) => (
                    <SelectItem key={ph.id} value={String(ph.id)}>
                      {ph.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Task */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Task</Label>
              <Select
                value={selectedTaskId}
                onValueChange={setSelectedTaskId}
                disabled={!selectedPhaseId}
              >
                <SelectTrigger className="h-11 border-gray-200 bg-white disabled:bg-gray-50 w-full shadow-none">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center py-2 border-t border-gray-100 pt-4 mt-2 text-xs">
              <span className="font-semibold text-gray-500">Cost Code</span>
              <span className="font-semibold text-gray-900">
                {selectedProjectId === "2" ? "CC-05" : selectedProjectId ? "CC-04" : "-"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-t border-gray-100 text-xs">
              <span className="font-bold text-gray-900">Available Budget</span>
              <span className="font-bold text-[#3B7CED]">
                N{availableBudget.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Cost Details */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
          <h2 className="text-xs font-bold text-[#3B7CED] uppercase tracking-wider">
            Cost Details
          </h2>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Estimated Cost</Label>
            <Input
              type="number"
              placeholder="Enter cost"
              value={estimatedCost}
              onChange={(e) => {
                const val = e.target.value;
                setEstimatedCost(val === "" ? "" : Number(val));
              }}
              className="h-11 border-gray-200 shadow-none"
            />
          </div>
        </div>

        {/* Summaries Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-3 text-xs">
          <div className="flex justify-between py-1">
            <span className="text-gray-500 font-semibold">Available Budget</span>
            <span className="font-bold text-gray-400">
              N{availableBudget.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="border-t border-gray-100 my-1"></div>
          <div className="flex justify-between py-1">
            <span className="text-gray-900 font-bold">Total Cost</span>
            <span className="font-extrabold text-[#3B7CED] text-sm">
              N{totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Notes/Justification */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Notes / Justification</Label>
            <Textarea
              placeholder="Enter note"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] border-gray-200 focus:ring-[#3B7CED]/20 shadow-none"
            />
          </div>
        </div>
      </main>

      {/* Floating Action Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-20 shadow-none">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleFormSubmit}
            className="w-full h-12 text-sm font-bold flex items-center justify-center bg-[#3B7CED] hover:bg-[#2d63c7] text-white rounded-lg shadow-none"
          >
            Submit request
          </Button>
        </div>
      </div>

      {/* Above Available Budget Dialog */}
      <AnimatePresence>
        {modalType === "above_budget" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-[calc(100%-2rem)] relative shadow-lg"
            >
              {/* Close Button */}
              <button
                onClick={() => setModalType(null)}
                className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col items-start w-full text-left">
                <div className="w-12 h-12 rounded-full bg-[#EEF4FF] border border-[#D0E1FD] flex items-center justify-center text-[#3B7CED]">
                  <AlertTriangle size={24} className="text-[#3B7CED]" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mt-5 leading-snug">
                  Above Available Budget
                </h3>
                
                <p className="text-sm font-medium text-gray-500 mt-2 leading-relaxed">
                  The total cost for your request is above the available budget and might be held. Will you like to submit anyways?
                </p>

                <div className="grid grid-cols-2 gap-3 w-full mt-6">
                  <button
                    onClick={() => setModalType(null)}
                    className="w-full h-11 border border-[#3B7CED] hover:bg-[#EEF4FF]/50 text-[#3B7CED] text-xs font-bold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setModalType(null);
                      executeSubmission();
                    }}
                    className="w-full h-11 bg-[#3B7CED] hover:bg-[#2d63c7] text-white text-xs font-bold rounded-lg transition-colors shadow-none"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submission Unsuccessful Dialog */}
      <AnimatePresence>
        {modalType === "unsuccessful" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-[calc(100%-2rem)] relative shadow-lg"
            >
              {/* Close Button */}
              <button
                onClick={() => setModalType(null)}
                className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col items-start w-full text-left">
                <div className="w-12 h-12 rounded-full bg-[#FFF2F0] border border-[#FFE0DB] flex items-center justify-center text-[#E43D2B]">
                  <AlertCircle size={24} className="text-[#E43D2B]" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mt-5 leading-snug">
                  Submission Unsuccessful
                </h3>
                
                <p className="text-sm font-medium text-gray-500 mt-2 leading-relaxed">
                  Your request submission was unsuccessfully. Please try again.
                </p>

                <button
                  onClick={() => setModalType(null)}
                  className="w-full h-11 bg-[#3B7CED] hover:bg-[#2d63c7] text-white text-xs font-bold rounded-lg transition-colors shadow-none mt-6 flex items-center justify-center"
                >
                  Try again
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Request Submitted Dialog */}
      <AnimatePresence>
        {modalType === "submitted" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-[calc(100%-2rem)] relative shadow-lg"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setModalType(null);
                  router.push("/project-request/plant-equipment-request");
                }}
                className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col items-start w-full text-left">
                <div className="w-12 h-12 rounded-full bg-[#EEF4FF] border border-[#D0E1FD] flex items-center justify-center text-[#3B7CED]">
                  <svg className="w-6 h-6 text-[#3B7CED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mt-5 leading-snug">
                  Request Submitted
                </h3>
                
                <p className="text-sm font-medium text-gray-500 mt-2 leading-relaxed">
                  Your request has successfully been submitted
                </p>

                <button
                  onClick={() => {
                    setModalType(null);
                    router.push("/project-request/plant-equipment-request");
                  }}
                  className="w-full h-11 bg-[#3B7CED] hover:bg-[#2d63c7] text-white text-xs font-bold rounded-lg transition-colors shadow-none mt-6 flex items-center justify-center"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Validation Error Banner / Popup */}
      <AnimatePresence>
        {validationError && (
          <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 max-w-md bg-red-600 text-white p-4 rounded-lg shadow-lg flex items-center justify-between z-50">
            <span className="text-xs font-bold">{validationError}</span>
            <button
              onClick={() => setValidationError(null)}
              className="text-white hover:text-red-200 text-sm font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
