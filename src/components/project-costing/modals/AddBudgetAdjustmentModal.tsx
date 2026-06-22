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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";
import { useCreateActivityBudgetLineMutation } from "@/api/projectCostingApi";

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
  costCategory: string;
  amount: number;
  reason: string;
}

export function AddBudgetAdjustmentModal({ isOpen, onClose, project }: Props) {
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  
  // Modals & API
  const statusModal = useStatusModal();
  const [createBudgetLine, { isLoading: isSubmitting }] = useCreateActivityBudgetLineMutation();

  // State for lines
  const [adjustmentLines, setAdjustmentLines] = useState<AdjustmentLine[]>([]);
  
  // Form State
  const [selectedActivity, setSelectedActivity] = useState("");
  const [costCategory, setCostCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [newActivityName, setNewActivityName] = useState("");

  const budgetNum = project?.total_budget ? Number(project.total_budget) : 0;
  
  // Calculate current approved budget including adjustments
  const currentBudgetNum = budgetNum + adjustmentLines.reduce((acc, line) => acc + line.amount, 0);
  
  let activities: any[] = [];
  if (project?.financials) {
    try {
      const fin = typeof project.financials === "string" ? JSON.parse(project.financials) : project.financials;
      if (fin?.by_activity && Array.isArray(fin.by_activity)) {
        activities = fin.by_activity;
      }
    } catch (e) {
      console.error(e);
    }
  }

  const handleAddLine = () => {
    if (!amount || !costCategory || !reason) {
      alert("Please fill all required fields");
      return;
    }

    if (activeTab === "existing" && !selectedActivity) {
      alert("Please select an activity");
      return;
    }
    
    if (activeTab === "new" && !newActivityName) {
      alert("Please enter a new activity name");
      return;
    }

    let actName = newActivityName;
    if (activeTab === "existing") {
      const act = activities.find(a => a.activity_id === selectedActivity);
      actName = act ? act.activity_name : "Unknown Activity";
    }

    const newLine: AdjustmentLine = {
      id: Math.random().toString(36).substr(2, 9),
      type: activeTab,
      activityId: activeTab === "existing" ? selectedActivity : undefined,
      activityName: actName,
      costCategory,
      amount: Number(amount),
      reason,
    };

    setAdjustmentLines([...adjustmentLines, newLine]);
    
    // Reset form
    setAmount("");
    setReason("");
    setNewActivityName("");
    setSelectedActivity("");
    setCostCategory("");
  };

  const removeLine = (id: string) => {
    setAdjustmentLines(adjustmentLines.filter(l => l.id !== id));
  };

  const handleSubmit = async () => {
    if (adjustmentLines.length === 0) {
      statusModal.showError("Validation Error", "Please add at least one adjustment line before submitting.");
      return;
    }
    
    try {
      await Promise.all(
        adjustmentLines.map(line => 
          createBudgetLine({
            cost_category: line.costCategory,
            amount: line.amount.toString(),
            // The API doesn't fully document activity mapping in CreateActivityBudgetLineRequest, 
            // but we pass it through so the backend can use it if configured to accept it
            // @ts-ignore
            activity: line.activityId || undefined,
          }).unwrap()
        )
      );

      statusModal.showSuccess(
        "Action Successful",
        `Successfully submitted ${adjustmentLines.length} budget adjustment line(s).`
      );
      
      setAdjustmentLines([]);
      // Let the user click 'Done' on the status modal to close everything, 
      // or we could close it automatically. We'll leave it up to them.
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
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-white">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900">Add Budget Adjustment</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Create a structured budget adjustment request. All changes require approval before becoming active.
          </p>
        </DialogHeader>

        <div className="px-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto pb-4">
          {/* Budget Summary */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Budget Summary</h3>
            <div className="flex gap-12">
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">Original Approved Budget</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">{budgetNum > 0 ? `N${budgetNum.toLocaleString()}` : "N/A"}</p>
                  <Badge variant="outline" className="text-gray-400 border-gray-300 font-normal py-0">Locked</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">Current Approved Budget</p>
                <p className="text-2xl font-bold text-[#3B7CED]">{currentBudgetNum > 0 ? `N${currentBudgetNum.toLocaleString()}` : "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Add Adjustment Lines Card */}
          <div className="border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Add Adjustment Lines</h3>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-6">
              <button
                type="button"
                className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "existing" 
                    ? "border-blue-500 text-blue-500" 
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
                    ? "border-blue-500 text-blue-500" 
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
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-900">WBS Activity</label>
                    <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                      <SelectTrigger className="w-full text-gray-500">
                        <SelectValue placeholder="Select Activity" />
                      </SelectTrigger>
                      <SelectContent>
                        {activities.length > 0 ? (
                          activities.map((act) => (
                            <SelectItem key={act.activity_id} value={act.activity_id}>
                              {act.activity_name} ({act.wbs_code})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No activities available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-900">Activity Name</label>
                    <Input placeholder="Enter activity name" value={newActivityName} onChange={(e) => setNewActivityName(e.target.value)} />
                  </div>
                </>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Cost Category</label>
                <Select value={costCategory} onValueChange={setCostCategory}>
                  <SelectTrigger className="w-full text-gray-500">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LABOUR">Labour</SelectItem>
                    <SelectItem value="MATERIAL_CONSUMPTION">Material Consumption</SelectItem>
                    <SelectItem value="PLANT_EQUIPMENT">Plant Equipment</SelectItem>
                    <SelectItem value="SUB_CONTRACTOR">Sub Contractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">{activeTab === "new" ? "Budget Amount" : "Adjustment Amount"}</label>
                <Input placeholder="Enter amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Reason for Adjustment</label>
                <Input placeholder="Enter reason" value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>

              <Button type="button" onClick={handleAddLine} className="w-full mt-2 bg-[#3B7CED] hover:bg-[#3065c3] text-white flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" /> Add Adjustment
              </Button>
            </div>
          </div>
          
          {/* Added Lines Summary */}
          {adjustmentLines.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900 mb-4">{adjustmentLines.length} Adjustment Line{adjustmentLines.length > 1 ? 's' : ''} Added</h3>
              <div className="flex flex-col gap-3">
                {adjustmentLines.map((line) => (
                  <div key={line.id} className="flex justify-between items-center bg-white p-3 rounded border border-gray-100 shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-800">{line.activityName}</span>
                        <Badge variant="outline" className="text-[10px] py-0 border-gray-200 text-gray-400">
                          {line.type === "new" ? "New Activity" : "Existing"}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">{line.costCategory} • {line.reason}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${line.amount >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {line.amount >= 0 ? "+" : ""}N{line.amount.toLocaleString()}
                      </span>
                      <button onClick={() => removeLine(line.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>

        <div className="p-6 pt-0 flex justify-end">
          <Button onClick={handleSubmit} className="bg-[#3B7CED] hover:bg-[#3065c3] text-white px-6 w-full sm:w-auto">
            Submit for approval
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
