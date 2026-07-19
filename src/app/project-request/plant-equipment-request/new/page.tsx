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
import { useGetAvailableBudgetQuery } from "@/api/projectApi";
import {
  useGetProjectCostingProjectsQuery,
  useGetProjectCostingProjectQuery,
} from "@/api/projectCostingApi";
import { useCreatePlantEquipmentRequestMutation } from "@/api/requests/plantEquipmentRequestApi";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { motion, AnimatePresence } from "framer-motion";
import { StatusModal } from "@/components/shared/StatusModal";

export default function NewPlantEquipmentRequestPage() {
  const router = useRouter();
  const loggedInUser = useSelector((state: RootState) => state.auth.user);
  const loggedInUserName = React.useMemo(() => {
    if (!loggedInUser) return "Current User";
    const anyUser = loggedInUser as any;
    return `${anyUser.first_name || ""} ${anyUser.last_name || ""}`.trim() || loggedInUser.username || "Current User";
  }, [loggedInUser]);

  // Queries
  const { data: rawCostingProjects = [] } = useGetProjectCostingProjectsQuery({});

  // Filter approved/active projects
  const projects = useMemo(() => {
    const list = Array.isArray(rawCostingProjects)
      ? rawCostingProjects
      : (rawCostingProjects as any)?.results || [];
    return list.filter((p: any) => {
      const st = String(p.status || "").toUpperCase();
      return st === "APPROVED" || st === "ACTIVE" || p.is_approved === true || !p.status;
    });
  }, [rawCostingProjects]);

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
      cost_code: "CC-04",
    },
    { skip: !selectedProjectId || !selectedTaskId }
  );

  const availableBudget = budgetData?.available_budget
    ? Number(budgetData.available_budget)
    : 0;

  // Fetch full project detail for WBS cascade
  const { data: costingProjectDetail } = useGetProjectCostingProjectQuery(
    Number(selectedProjectId),
    { skip: !selectedProjectId || isNaN(Number(selectedProjectId)) },
  );

  // Build a flat WBS list from either .wbs or .phases[].activities structure
  const wbsList = useMemo(() => {
    const proj: any = costingProjectDetail || projects.find((p: any) => String(p.id) === selectedProjectId);
    if (!proj) return [];
    if (Array.isArray(proj.wbs) && proj.wbs.length > 0) return proj.wbs;
    const items: any[] = [];
    const phasesArr = Array.isArray(proj.phases)
      ? proj.phases
      : Array.isArray(proj.phase_list) ? proj.phase_list : [];
    phasesArr.forEach((ph: any, pi: number) => {
      const phId = ph.id || ph.phase_id || `phase-${pi + 1}`;
      const phName = ph.name || ph.phase_name || `Phase ${pi + 1}`;
      items.push({ id: phId, name: phName, is_activity: false });
      const acts = Array.isArray(ph.activities) ? ph.activities
        : Array.isArray(ph.activity_list) ? ph.activity_list : [];
      acts.forEach((act: any, ai: number) => {
        items.push({
          ...act,
          id: act.id || act.activity_id || `act-${phId}-${ai + 1}`,
          name: act.name || act.activity_name || `Activity ${ai + 1}`,
          is_activity: true,
          parent: phId,
        });
      });
    });
    return items;
  }, [costingProjectDetail, projects, selectedProjectId]);

  const phases = useMemo(() => {
    return wbsList.filter((w: any) => !w.is_activity);
  }, [wbsList]);

  // Filter Tasks
  const tasks = useMemo(() => {
    if (!selectedPhaseId) return [];
    return wbsList.filter(
      (w: any) => w.is_activity && String(w.parent) === String(selectedPhaseId)
    );
  }, [wbsList, selectedPhaseId]);

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
      setValidationError("Please select a WBS activity.");
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
      const ensureValidUUID = (val: string): string => {
        if (!val) return "";
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(val)) return val;
        const numericVal = parseInt(val, 10);
        if (!isNaN(numericVal)) {
          const hexString = numericVal.toString(16).padStart(12, "0");
          return `00000000-0000-0000-0000-${hexString}`;
        }
        return val;
      };

      // Build API payload
      const payload: any = {
        reference_id: requestId,
        equipment_name: equipmentName,
        description: description,
        quantity: Number(quantity),
        required_date: requiredDate,
        estimated_cost: String(estimatedCost),
        justification_notes: notes,
        is_hidden: false,
        project_request: Number(selectedProjectId) || 1, // project ID
        activity: ensureValidUUID(selectedTaskId),
        wbs_element: ensureValidUUID(selectedTaskId),
      };

      // Call API
      await createRequest(payload).unwrap();
      setModalType("submitted");
    } catch (error) {
      console.error("API submission failed:", error);
      setModalType("unsuccessful");
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
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Request ID</Label>
              <Input value={requestId} disabled className="h-11 bg-gray-50 text-gray-500 font-bold border-gray-200 shadow-none" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Date</Label>
              <Input value={new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} disabled className="h-11 bg-gray-50 text-gray-500 font-normal border-gray-200 shadow-none" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Requested by</Label>
              <Input value={loggedInUserName} disabled className="h-11 bg-gray-50 text-gray-500 font-normal border-gray-200 shadow-none" />
            </div>
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
                  {projects.map((p: any) => (
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
                  {phases.map((ph: any) => (
                    <SelectItem key={ph.id} value={String(ph.id)}>
                      {ph.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Activity */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Activity</Label>
              <Select
                value={selectedTaskId}
                onValueChange={setSelectedTaskId}
                disabled={!selectedPhaseId}
              >
                <SelectTrigger className="h-11 border-gray-200 bg-white disabled:bg-gray-50 w-full shadow-none">
                  <SelectValue placeholder="Select an activity" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((t: any) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
      <StatusModal
        isOpen={modalType === "above_budget"}
        onClose={() => setModalType(null)}
        type="warning"
        title="Above Available Budget"
        message="The total cost for your request is above the available budget and might be held. Will you like to submit anyways?"
        actionText="Submit"
        onAction={() => {
          setModalType(null);
          executeSubmission();
        }}
        secondaryText="Cancel"
        onSecondary={() => setModalType(null)}
        showCloseButton={true}
      />

      {/* Submission Unsuccessful Dialog */}
      <StatusModal
        isOpen={modalType === "unsuccessful"}
        onClose={() => setModalType(null)}
        type="error"
        title="Submission Unsuccessful"
        message="Your request submission was unsuccessfully. Please try again."
        actionText="Try again"
        onAction={() => setModalType(null)}
        showCloseButton={true}
      />

      {/* Request Submitted Dialog */}
      <StatusModal
        isOpen={modalType === "submitted"}
        onClose={() => {
          setModalType(null);
          router.push("/project-request/plant-equipment-request");
        }}
        type="success"
        title="Request Submitted"
        message="Your request has successfully been submitted"
        actionText="Done"
        onAction={() => {
          setModalType(null);
          router.push("/project-request/plant-equipment-request");
        }}
        showCloseButton={true}
      />

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
