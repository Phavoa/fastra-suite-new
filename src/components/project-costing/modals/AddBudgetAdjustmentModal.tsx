import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";
import { useCreateBudgetAdjustmentMutation } from "@/api/projectCostingApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project?: any;
}

interface AdjustmentLine {
  id: string;
  type: "existing" | "new";
  activityId?: string;
  activityName: string;
  phaseName: string;
  currentAmount?: number;
  costCategory: string;
  quantity: number;
  rate: number;
  amount: number;
  reason: string;
}

export function AddBudgetAdjustmentModal({ isOpen, onClose, project }: Props) {
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  
  // Modals & API
  const statusModal = useStatusModal();
  const [createBudgetAdjustment, { isLoading: isSubmitting }] = useCreateBudgetAdjustmentMutation();

  // State for lines
  const [adjustmentLines, setAdjustmentLines] = useState<AdjustmentLine[]>([]);
  
  // Form State
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedPhaseForNew, setSelectedPhaseForNew] = useState("");
  const [costCategory, setCostCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [direction, setDirection] = useState<"increase" | "decrease">("increase");
  const [reason, setReason] = useState("");
  const [newActivityName, setNewActivityName] = useState("");
  const [overallReason, setOverallReason] = useState("");

  let budgetNum = 0;
  if (project?.financials) {
    try {
      const fin = typeof project.financials === 'string' ? JSON.parse(project.financials) : project.financials;
      budgetNum = Number(fin?.budget || 0);
    } catch (e) {
      console.error(e);
    }
  }
  
  // Current approved budget from backend
  const currentBudgetNum = budgetNum;
  const totalStagedAdjustment = adjustmentLines.reduce((acc, line) => acc + line.amount, 0);
  const proposedTotalBudget = budgetNum + totalStagedAdjustment;
  
  // Parse phases and structure activities by Phase
  const phasesList: { id: string; name: string; activities: any[] }[] = [];
  const allActivities: any[] = [];

  if (project?.phases) {
    try {
      const phasesArr = typeof project.phases === 'string' ? JSON.parse(project.phases) : project.phases;
      if (Array.isArray(phasesArr)) {
        phasesArr.forEach((phase: any, pIndex: number) => {
          const pName = phase.name || `Phase ${pIndex + 1}`;
          const phaseObj = {
            id: String(phase.id || `phase-${pIndex}`),
            name: pName,
            activities: [] as any[],
          };
          if (phase.activities && Array.isArray(phase.activities)) {
            phase.activities.forEach((act: any, aIndex: number) => {
              const actAmt = Number(
                act.amount !== undefined
                  ? act.amount
                  : act.budget !== undefined
                  ? act.budget
                  : Number(act.quantity || 1) * Number(act.rate || 0)
              );
              const actObj = {
                activity_id: String(act.id || `${phaseObj.id}-act-${aIndex}`),
                activity_name: act.name || `Activity ${aIndex + 1}`,
                wbs_code: act.serial_number
                  ? `ACT-${act.serial_number}`
                  : act.sn
                  ? `S/N ${act.sn}`
                  : `Act ${aIndex + 1}`,
                phase_name: pName,
                amount: actAmt,
                budget: actAmt,
              };
              phaseObj.activities.push(actObj);
              allActivities.push(actObj);
            });
          }
          phasesList.push(phaseObj);
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  const selectedActivityObj = allActivities.find(
    (a) => String(a.activity_id) === String(selectedActivity)
  );

  const handleAddLine = () => {
    if (activeTab === "existing" && !selectedActivity) {
      alert("Please select an activity");
      return;
    }
    
    if (activeTab === "new" && !newActivityName) {
      alert("Please enter a new activity name");
      return;
    }

    let amtNum = Number(amountInput);
    let qNum = Number(quantity);
    let rNum = Number(rate);

    if (amountInput && !isNaN(amtNum) && amtNum > 0) {
      qNum = 1;
      rNum = amtNum;
    } else if (isNaN(qNum) || isNaN(rNum) || qNum <= 0 || rNum <= 0) {
      alert("Please enter a valid adjustment amount");
      return;
    } else {
      amtNum = qNum * rNum;
    }

    const finalAmount = direction === "decrease" ? -Math.abs(amtNum) : Math.abs(amtNum);

    let actName = newActivityName;
    let phaseName = selectedPhaseForNew || phasesList[0]?.name || "General Phase";
    let currentAmount: number | undefined = undefined;

    if (activeTab === "existing") {
      actName = selectedActivityObj ? selectedActivityObj.activity_name : "Unknown Activity";
      phaseName = selectedActivityObj ? selectedActivityObj.phase_name : "General Phase";
      currentAmount = selectedActivityObj ? selectedActivityObj.amount : 0;
    }

    const newLine: AdjustmentLine = {
      id: Math.random().toString(36).substr(2, 9),
      type: activeTab,
      activityId: activeTab === "existing" ? selectedActivity : undefined,
      activityName: actName,
      phaseName,
      currentAmount,
      costCategory: costCategory || "LABOUR",
      quantity: qNum,
      rate: rNum,
      amount: finalAmount,
      reason,
    };

    setAdjustmentLines([...adjustmentLines, newLine]);
    
    // Reset form
    setQuantity("");
    setRate("");
    setAmountInput("");
    setReason("");
    setNewActivityName("");
    setSelectedActivity("");
    setCostCategory("");
  };

  const removeLine = (id: string) => {
    setAdjustmentLines(adjustmentLines.filter((l) => l.id !== id));
  };

  const handleSubmit = async () => {
    if (adjustmentLines.length === 0) {
      statusModal.showError("Validation Error", "Please add at least one adjustment line before submitting.");
      return;
    }
    
    const topReason = overallReason.trim() || adjustmentLines.map((l) => l.reason).filter(Boolean)[0] || "Budget adjustment request";
    
    try {
      await createBudgetAdjustment({
        id: project.id,
        body: {
          reason: topReason,
          lines: adjustmentLines.map((line) => ({
            adjustment_type: line.type === "new" ? "NEW" : "EXISTING",
            activity: line.type === "existing" ? (!isNaN(Number(line.activityId)) ? Number(line.activityId) : line.activityId) : undefined,
            activity_name: line.type === "new" ? line.activityName : undefined,
            phase_name: line.phaseName,
            quantity: line.quantity,
            rate: line.rate,
            cost_category: line.costCategory || undefined,
            reason: line.reason || undefined,
          })),
        },
      }).unwrap();

      statusModal.showSuccess(
        "Action Successful",
        `Successfully submitted budget adjustment request with ${adjustmentLines.length} line(s).`
      );
      
      setAdjustmentLines([]);
      setOverallReason("");
    } catch (error) {
      console.error(error);
      statusModal.showError(
        "Submission Failed",
        "Failed to submit budget adjustments. Please check your data and try again."
      );
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[580px] p-0 overflow-hidden bg-white">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900">Create Budget Adjustment</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Create a structured budget adjustment request. All changes require approval before becoming active.
          </p>
        </DialogHeader>

        <div className="px-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto pb-4">
          {/* Budget Summary */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Budget Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Original Approved Budget</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-gray-900">{budgetNum > 0 ? `₦${budgetNum.toLocaleString()}` : "N/A"}</p>
                  <Badge variant="outline" className="text-gray-400 border-gray-300 font-normal text-[10px] py-0 px-1.5">Locked</Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Current Approved Budget</p>
                <p className="text-xl font-bold text-gray-900">{currentBudgetNum > 0 ? `₦${currentBudgetNum.toLocaleString()}` : "N/A"}</p>
              </div>
              {adjustmentLines.length > 0 && (
                <div>
                  <p className="text-xs text-[#3B7CED] font-semibold mb-1">Proposed Budget (Preview)</p>
                  <p className="text-xl font-bold text-[#3B7CED]">
                    ₦{proposedTotalBudget.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-900 block mb-1.5">Reason for Adjustment</label>
              <Input
                placeholder="Enter reason"
                value={overallReason}
                onChange={(e) => setOverallReason(e.target.value)}
              />
            </div>
          </div>

          {/* Add Adjustment Lines Card */}
          <div className="border border-gray-200 rounded-lg p-5 bg-white">
            <h3 className="font-semibold text-gray-900 mb-4">Add Adjustment Lines</h3>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-6">
              <button
                type="button"
                className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "existing" 
                    ? "border-[#3B7CED] text-[#3B7CED]" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => { setActiveTab("existing"); setSelectedActivity(""); setNewActivityName(""); }}
              >
                Adjust Existing Activities
              </button>
              <button
                type="button"
                className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "new" 
                    ? "border-[#3B7CED] text-[#3B7CED]" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => { setActiveTab("new"); setSelectedActivity(""); setNewActivityName(""); }}
              >
                Add New Activity
              </button>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-4">
              {activeTab === "existing" ? (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Select Activity & Phase</label>
                  <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                    <SelectTrigger className="w-full text-gray-700 h-10">
                      <SelectValue placeholder="Choose an activity to adjust" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {phasesList.length > 0 ? (
                        phasesList.map((p) => (
                          <SelectGroup key={p.id}>
                            <SelectLabel className="text-[#3B7CED] font-bold text-xs uppercase px-2 py-1.5 bg-blue-50/80 rounded my-1 flex items-center justify-between">
                              <span>Phase: {p.name}</span>
                              <span className="text-gray-700 font-semibold normal-case text-xs">
                                Total: ₦{p.activities.reduce((s: number, a: any) => s + (a.amount || 0), 0).toLocaleString()}
                              </span>
                            </SelectLabel>
                            {p.activities.map((act) => (
                              <SelectItem key={act.activity_id} value={act.activity_id} className="py-2.5">
                                <div className="flex items-center justify-between gap-6 w-full">
                                  <span className="font-medium text-gray-800">{act.activity_name}</span>
                                  <span className="font-bold text-xs text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 shrink-0">
                                    ₦{Number(act.amount || 0).toLocaleString()}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No activities available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  {/* Connected Phase & Current Amount Banner */}
                  {selectedActivityObj && (
                    <div className="flex items-center justify-between px-3.5 py-2 bg-blue-50/80 border border-blue-100 rounded-md text-xs">
                      <div className="flex items-center gap-2 text-[#3B7CED]">
                        <span className="font-bold uppercase tracking-wider">Connected Phase:</span>
                        <span className="font-semibold text-gray-800">{selectedActivityObj.phase_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <span className="font-medium text-gray-500">Current Budget:</span>
                        <span className="font-bold text-sm text-gray-900 bg-white px-2 py-0.5 rounded border border-blue-200">
                          ₦{Number(selectedActivityObj.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-900">Target Phase</label>
                    <Select value={selectedPhaseForNew} onValueChange={setSelectedPhaseForNew}>
                      <SelectTrigger className="w-full text-gray-700 h-10">
                        <SelectValue placeholder={phasesList[0]?.name ? `Select Phase (e.g. ${phasesList[0].name})` : "Select target phase"} />
                      </SelectTrigger>
                      <SelectContent>
                        {phasesList.map((p) => (
                          <SelectItem key={p.id} value={p.name}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-900">Activity Name</label>
                    <Input placeholder="Enter activity name" value={newActivityName} onChange={(e) => setNewActivityName(e.target.value)} />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Budget Change Direction</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDirection("increase")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded border text-sm font-medium transition-colors ${
                      direction === "increase"
                        ? "border-green-600 bg-green-50 text-green-700 font-semibold"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    ↗ Increase Budget
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection("decrease")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded border text-sm font-medium transition-colors ${
                      direction === "decrease"
                        ? "border-red-600 bg-red-50 text-red-700 font-semibold"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    ↘ Decrease Budget
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Adjustment Amount (₦)</label>
                <Input placeholder="Enter Amount" type="number" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} />
              </div>

              <Button type="button" onClick={handleAddLine} className="w-full mt-2 bg-[#3B7CED] hover:bg-[#3065c3] text-white flex items-center justify-center gap-2 font-medium">
                <Plus className="h-4 w-4" /> Add Adjustment Line
              </Button>
            </div>
          </div>
          
          {/* Added Lines Summary */}
          {adjustmentLines.length > 0 && (
            <div className="flex flex-col gap-3 mt-2">
              <h3 className="font-semibold text-gray-900">Adjustment Lines</h3>
              <div className="flex flex-col gap-3">
                {adjustmentLines.map((line) => (
                  <div key={line.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-xs flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-800">{line.phaseName}</span>
                        <Badge variant="outline" className="text-xs py-0.5 px-2 rounded-full border-gray-200 text-gray-500 font-normal">
                          {line.type === "new" ? "New Activity" : "Existing Activity"}
                        </Badge>
                      </div>
                      <button type="button" onClick={() => removeLine(line.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-end mt-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-gray-700 font-medium">
                          {line.activityName} {line.reason ? `• ${line.reason}` : ""}
                        </span>
                        {line.currentAmount !== undefined && line.type === "existing" && (
                          <span className="text-[11px] text-gray-500">
                            Current: ₦{line.currentAmount.toLocaleString()} → New: ₦{(line.currentAmount + line.amount).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className={`text-sm font-bold ${line.amount >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {line.amount >= 0 ? "+" : ""}₦{line.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 pt-2 flex justify-end border-t border-gray-100 bg-gray-50/50">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#3B7CED] hover:bg-[#3065c3] text-white px-6 w-full sm:w-auto font-medium">
            {isSubmitting ? "Submitting..." : "Submit for approval"}
          </Button>
        </div>
        </DialogContent>
      </Dialog>
      
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => {
          statusModal.close();
          if (statusModal.type === "success") {
            onClose(); // Close the budget modal as well if successful
          }
        }}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        actionText={statusModal.type === "success" ? "Done" : "Try again"}
      />
    </>
  );
}
