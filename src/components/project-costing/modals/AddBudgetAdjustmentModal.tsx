import React, { useState, useEffect } from "react";
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
import { Plus, X, AlertTriangle } from "lucide-react";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";
import { 
  useCreateBudgetAdjustmentMutation,
  useGetProjectSettingsQuery,
  useUpdateProjectSettingsMutation 
} from "@/api/projectCostingApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project?: any;
}

interface AdjustmentLine {
  id: string;
  adjustment_type: "EXISTING" | "NEW";
  activityId?: string;
  activityName: string;
  phaseId?: string;
  phaseName: string;
  direction: "INCREASE" | "DECREASE";
  currentAmount?: number;
  quantity: number;
  rate: number;
  amount: number;
  reason?: string;
}

export function AddBudgetAdjustmentModal({ isOpen, onClose, project }: Props) {
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  
  // Modals & API
  const statusModal = useStatusModal();
  const [createBudgetAdjustment, { isLoading: isSubmitting }] = useCreateBudgetAdjustmentMutation();
  
  // Project settings query & mutation
  const { data: projectSettings, refetch: refetchSettings } = useGetProjectSettingsQuery(
    project?.id,
    { skip: !project?.id || !isOpen }
  );
  const [updateProjectSettings, { isLoading: isUpdatingSettings }] = useUpdateProjectSettingsMutation();

  // State for lines
  const [adjustmentLines, setAdjustmentLines] = useState<AdjustmentLine[]>([]);
  
  // Form State
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedPhaseForNew, setSelectedPhaseForNew] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [rate, setRate] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [direction, setDirection] = useState<"INCREASE" | "DECREASE">("INCREASE");
  const [reason, setReason] = useState("");
  const [newActivityName, setNewActivityName] = useState("");
  const [overallReason, setOverallReason] = useState("");

  const allowBudgetDecrease = projectSettings?.allow_budget_decrease ?? project?.allow_budget_decrease ?? true;

  // Parse phases and structure activities by Phase
  const phasesList: { id: string; name: string; activities: any[] }[] = [];
  const allActivities: any[] = [];
  let phasesTotalSum = 0;

  if (project?.phases) {
    try {
      const phasesArr = typeof project.phases === 'string' ? JSON.parse(project.phases) : project.phases;
      if (Array.isArray(phasesArr)) {
        phasesArr.forEach((phase: any, pIndex: number) => {
          const pName = phase.name || `Phase ${pIndex + 1}`;
          const phaseId = String(phase.id || phase.uuid || `phase-${pIndex}`);
          const phaseObj = {
            id: phaseId,
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
              phasesTotalSum += actAmt;
              const actObj = {
                activity_id: String(act.id || act.uuid || `${phaseObj.id}-act-${aIndex}`),
                activity_name: act.name || `Activity ${aIndex + 1}`,
                wbs_code: act.serial_number
                  ? `ACT-${act.serial_number}`
                  : act.sn
                  ? `S/N ${act.sn}`
                  : `Act ${aIndex + 1}`,
                phase_id: phaseId,
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

  let rawBudgetNum = 0;
  let originalBudgetNum = 0;
  if (project?.financials) {
    try {
      const fin = typeof project.financials === 'string' ? JSON.parse(project.financials) : project.financials;
      rawBudgetNum = Number(fin?.budget || 0);
      originalBudgetNum = Number(fin?.original_budget || fin?.budget || 0);
    } catch (e) {
      console.error(e);
    }
  }

  const budgetNum = rawBudgetNum > 0 ? rawBudgetNum : (phasesTotalSum > 0 ? phasesTotalSum : Number(project?.budget || project?.total_budget || 0));
  const origBudgetNum = originalBudgetNum > 0 ? originalBudgetNum : (phasesTotalSum > 0 ? phasesTotalSum : Number(project?.budget || project?.total_budget || 0));
  const currentBudgetNum = budgetNum;
  const totalStagedAdjustment = adjustmentLines.reduce((acc, line) => acc + (line.direction === "DECREASE" ? -line.amount : line.amount), 0);
  const proposedTotalBudget = budgetNum + totalStagedAdjustment;

  const selectedActivityObj = allActivities.find(
    (a) => String(a.activity_id) === String(selectedActivity)
  );

  const handleEnableBudgetDecrease = async () => {
    try {
      await updateProjectSettings({
        id: project.id,
        body: { allow_budget_decrease: true }
      }).unwrap();
      refetchSettings();
      statusModal.showSuccess("Settings Updated", "Budget decrease is now enabled for this project.");
    } catch (err) {
      console.error("Failed to update project settings", err);
      statusModal.showError("Update Failed", "Failed to update project settings. Please try again.");
    }
  };

  const addLine = () => {
    const qNum = Number(quantity) || 1;
    const rNum = Number(rate) || 0;
    let amtNum = Number(amountInput);
    if (!amtNum || isNaN(amtNum)) {
      amtNum = qNum * rNum;
    }

    if (amtNum <= 0) {
      statusModal.showError("Validation Error", "Amount or Quantity * Rate must be greater than 0.");
      return;
    }

    let actName = "";
    let actId = undefined;
    let phName = "";
    let phId = undefined;
    let currAmt = undefined;

    if (activeTab === "existing") {
      if (!selectedActivity) {
        statusModal.showError("Validation Error", "Please select an activity to adjust.");
        return;
      }
      if (!selectedActivityObj) return;

      actName = selectedActivityObj.activity_name;
      actId = selectedActivityObj.activity_id;
      phName = selectedActivityObj.phase_name;
      phId = selectedActivityObj.phase_id;
      currAmt = selectedActivityObj.amount;

      if (direction === "DECREASE" && amtNum > (currAmt || 0)) {
        statusModal.showError(
          "Invalid Decrease Amount",
          `Decrease amount (₦${amtNum.toLocaleString()}) cannot exceed current activity budget (₦${(currAmt || 0).toLocaleString()}).`
        );
        return;
      }
    } else {
      if (!newActivityName.trim()) {
        statusModal.showError("Validation Error", "Please enter a name for the new activity.");
        return;
      }
      const targetPhase = phasesList.find((p) => p.id === selectedPhaseForNew) || phasesList[0];
      if (!targetPhase) {
        statusModal.showError("Validation Error", "No phase available to attach activity to.");
        return;
      }
      actName = newActivityName.trim();
      phName = targetPhase.name;
      phId = targetPhase.id;
    }

    const newLine: AdjustmentLine = {
      id: Math.random().toString(36).substr(2, 9),
      adjustment_type: activeTab === "existing" ? "EXISTING" : "NEW",
      activityId: actId,
      activityName: actName,
      phaseId: phId,
      phaseName: phName,
      direction,
      currentAmount: currAmt,
      quantity: qNum,
      rate: rNum,
      amount: amtNum,
      reason: reason.trim() || undefined,
    };

    setAdjustmentLines([...adjustmentLines, newLine]);
    
    // Reset form
    setQuantity("1");
    setRate("");
    setAmountInput("");
    setReason("");
    setNewActivityName("");
    setSelectedActivity("");
  };

  const removeLine = (id: string) => {
    setAdjustmentLines(adjustmentLines.filter((l) => l.id !== id));
  };

  const handleSubmit = async () => {
    if (adjustmentLines.length === 0) {
      statusModal.showError("Validation Error", "Please add at least one adjustment line before submitting.");
      return;
    }

    const hasDecrease = adjustmentLines.some((l) => l.direction === "DECREASE");
    if (hasDecrease && !allowBudgetDecrease) {
      statusModal.showError(
        "Budget Decrease Restricted",
        "Budget decrease is disabled in project settings (allow_budget_decrease: false). Please enable it in project settings first."
      );
      return;
    }
    
    const topReason = overallReason.trim() || adjustmentLines.map((l) => l.reason).filter(Boolean)[0] || "Budget adjustment request";
    
    try {
      const payload = {
        reason: topReason,
        lines: adjustmentLines.map((line) => {
          if (line.adjustment_type === "EXISTING") {
            return {
              adjustment_type: "EXISTING",
              activity: line.activityId,
              direction: line.direction,
              quantity: line.quantity,
              rate: line.rate,
            };
          } else {
            return {
              adjustment_type: "NEW",
              phase: line.phaseId,
              activity_name: line.activityName,
              direction: line.direction,
              quantity: line.quantity,
              rate: line.rate,
            };
          }
        }),
      };

      await createBudgetAdjustment({
        id: project.id,
        body: payload,
      }).unwrap();

      statusModal.showSuccess(
        "Action Successful",
        `Successfully submitted budget adjustment request with ${adjustmentLines.length} line(s).`
      );
      
      setAdjustmentLines([]);
      setOverallReason("");
    } catch (error: any) {
      console.error("Failed to create budget adjustment:", error);
      let errorMsg = "Failed to submit budget adjustments. Please check your data and try again.";
      if (error?.data?.detail) {
        errorMsg = error.data.detail;
      } else if (error?.data?.message) {
        errorMsg = error.data.message;
      } else if (error?.data?.error) {
        errorMsg = typeof error.data.error === "string" ? error.data.error : JSON.stringify(error.data.error);
      }
      statusModal.showError("Submission Failed", errorMsg);
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
                  <p className="text-xl font-bold text-gray-900">₦{origBudgetNum.toLocaleString()}</p>
                  <Badge variant="outline" className="text-gray-400 border-gray-300 font-normal text-[10px] py-0 px-1.5">Locked</Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Current Approved Budget</p>
                <p className="text-xl font-bold text-gray-900">₦{currentBudgetNum.toLocaleString()}</p>
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
                          <SelectItem key={p.id} value={p.id}>
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
                    onClick={() => setDirection("INCREASE")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded border text-sm font-medium transition-colors ${
                      direction === "INCREASE"
                        ? "border-green-600 bg-green-50 text-green-700 font-semibold"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    ↗ Increase Budget
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection("DECREASE")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded border text-sm font-medium transition-colors ${
                      direction === "DECREASE"
                        ? "border-red-600 bg-red-50 text-red-700 font-semibold"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    ↘ Decrease Budget
                  </button>
                </div>
                
                {/* Warning if decrease is chosen but allow_budget_decrease is false */}
                {direction === "DECREASE" && !allowBudgetDecrease && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800 flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Budget decrease is currently disabled</span> for this project in Project Settings.
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline"
                      disabled={isUpdatingSettings}
                      onClick={handleEnableBudgetDecrease} 
                      className="text-xs h-7 px-2.5 bg-white border-amber-300 text-amber-900 hover:bg-amber-100 font-medium shrink-0"
                    >
                      {isUpdatingSettings ? "Enabling..." : "Enable in Settings"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-900">Quantity</label>
                  <Input 
                    placeholder="1" 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => {
                      setQuantity(e.target.value);
                      if (rate && e.target.value) {
                        setAmountInput(String(Number(e.target.value) * Number(rate)));
                      }
                    }} 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-900">Rate / Unit Cost (₦)</label>
                  <Input 
                    placeholder="e.g. 100000" 
                    type="number" 
                    value={rate} 
                    onChange={(e) => {
                      setRate(e.target.value);
                      if (quantity && e.target.value) {
                        setAmountInput(String(Number(quantity) * Number(e.target.value)));
                      }
                    }} 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Total Line Amount (₦)</label>
                <Input 
                  placeholder="Enter or computed total amount" 
                  type="number" 
                  value={amountInput} 
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    if (e.target.value && (!rate || !quantity)) {
                      setQuantity("1");
                      setRate(e.target.value);
                    }
                  }} 
                />
              </div>

              <Button type="button" onClick={addLine} className="w-full mt-2 bg-[#3B7CED] hover:bg-[#3065c3] text-white flex items-center justify-center gap-2 font-medium">
                <Plus className="h-4 w-4" /> Add Adjustment Line
              </Button>
            </div>
          </div>
          
          {/* Added Lines Summary */}
          {adjustmentLines.length > 0 && (
            <div className="flex flex-col gap-3 mt-2">
              <h3 className="font-semibold text-gray-900">Adjustment Lines ({adjustmentLines.length})</h3>
              <div className="flex flex-col gap-3">
                {adjustmentLines.map((line) => (
                  <div key={line.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-xs flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-800">{line.phaseName}</span>
                        <Badge variant="outline" className="text-xs py-0.5 px-2 rounded-full border-gray-200 text-gray-500 font-normal">
                          {line.adjustment_type === "NEW" ? "New Activity" : "Existing Activity"}
                        </Badge>
                        <Badge className={`text-xs py-0.5 px-2 rounded-full font-medium border-0 ${
                          line.direction === "INCREASE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {line.direction}
                        </Badge>
                      </div>
                      <button type="button" onClick={() => removeLine(line.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-end mt-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-gray-700 font-medium">
                          {line.activityName} {line.quantity && line.rate ? `• Qty: ${line.quantity} @ ₦${line.rate.toLocaleString()}` : ""}
                        </span>
                        {line.currentAmount !== undefined && line.adjustment_type === "EXISTING" && (
                          <span className="text-[11px] text-gray-500">
                            Current: ₦{line.currentAmount.toLocaleString()} → New: ₦{(line.currentAmount + (line.direction === "DECREASE" ? -line.amount : line.amount)).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className={`text-sm font-bold ${line.direction === "INCREASE" ? "text-green-600" : "text-red-500"}`}>
                        {line.direction === "INCREASE" ? "+" : "-"}₦{line.amount.toLocaleString()}
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
