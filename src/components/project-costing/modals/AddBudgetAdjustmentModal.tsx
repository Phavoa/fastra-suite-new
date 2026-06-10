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
import { Plus } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project?: any;
}

export function AddBudgetAdjustmentModal({ isOpen, onClose, project }: Props) {
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");

  const budgetNum = project?.total_budget ? Number(project.total_budget) : 0;
  
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-white">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900">Add Budget Adjustment</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Create a structured budget adjustment request. All changes require approval before becoming active.
          </p>
        </DialogHeader>

        <div className="px-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
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
                <p className="text-2xl font-bold text-gray-900">{budgetNum > 0 ? `N${budgetNum.toLocaleString()}` : "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Add Adjustment Lines Card */}
          <div className="border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Add Adjustment Lines</h3>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-6">
              <button
                className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "existing" 
                    ? "border-blue-500 text-blue-500" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("existing")}
              >
                Adjust Existing Activities
              </button>
              <button
                className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "new" 
                    ? "border-blue-500 text-blue-500" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("new")}
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
                    <Select>
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
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-900">Cost Category</label>
                    <Select>
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
                    <label className="text-sm font-semibold text-gray-900">Adjustment Amount</label>
                    <Input placeholder="Enter amount" type="number" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-900">Reason for Adjustment</label>
                    <Input placeholder="Enter reason" />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-900">Activity Name</label>
                    <Input placeholder="Enter activity name" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-900">Budget Amount</label>
                    <Input placeholder="Enter budget amount" type="number" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-900">Reason for Adjustment</label>
                    <Input placeholder="Enter reason" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-900">Cost Category</label>
                    <Select>
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


                </>
              )}

              <Button className="w-full mt-2 bg-[#3B7CED] hover:bg-[#3065c3] text-white flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" /> Add Adjustment
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 flex justify-end">
          <Button onClick={onClose} className="bg-[#3B7CED] hover:bg-[#3065c3] text-white px-6">
            Submit for approval
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
