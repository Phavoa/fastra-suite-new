"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Pencil, Trash, X, Plus, ChevronDown } from "lucide-react";
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
import {
  useGetAvailableBudgetQuery,
} from "@/api/projectApi";
import {
  useGetProjectCostingProjectsQuery,
  useGetProjectCostingProjectQuery,
} from "@/api/projectCostingApi";
import { useGetProductsQuery } from "@/api/purchase/productsApi";
import { useGetInventoryProductsQuery } from "@/api/inventory/productsApi";
import { useGetCurrenciesQuery } from "@/api/purchase/currencyApi";
import { useGetVendorsQuery } from "@/api/purchase/vendorsApi";
import { useGetTenantUsersQuery } from "@/api/settings/tenantUserApi";
import { useCreateProjectPurchaseRequestMutation } from "@/api/requests/projectPurchaseRequestApi";
import { useGetActiveLocationsFilteredQuery } from "@/api/inventory/locationApi";
import { StatusModal } from "@/components/shared/StatusModal";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

interface ItemState {
  id: string;
  isEditing: boolean;
  productName: string;
  productId?: string;
  quantity: number;
  unitCost: number;
  description: string;
  error?: string;
}

export default function NewPurchaseRequestPage() {
  const router = useRouter();
  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  // API queries
  const { data: rawCostingProjects = [] } = useGetProjectCostingProjectsQuery({});
  const { data: rawInventoryProducts = [] } = useGetInventoryProductsQuery({});
  const { data: dbProducts = [] } = useGetProductsQuery({});
  const { data: currencies } = useGetCurrenciesQuery({});
  const { data: vendors } = useGetVendorsQuery({});
  const { data: tenantUsers } = useGetTenantUsersQuery({});
  const { data: activeLocations, isLoading: isLoadingLocations } = useGetActiveLocationsFilteredQuery();
  const [createProjectPurchaseRequest, { isLoading: isCreating }] =
    useCreateProjectPurchaseRequestMutation();

  // Local state for dropdown options
  const [customProducts, setCustomProducts] = useState<
    { id: string; name: string }[]
  >([]);

  // Form selections
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>("");
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [requiredDate, setRequiredDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Product Lines
  const [items, setItems] = useState<ItemState[]>([
    {
      id: "1",
      isEditing: true,
      productName: "",
      quantity: 0,
      unitCost: 0,
      description: "",
    },
  ]);

  const [isProductLinesCollapsed, setIsProductLinesCollapsed] = useState(false);

  // Submission status modal
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    description: "",
  });

  // Unique Request ID and Date
  const [requestId] = useState(
    () => `PR${String(Math.floor(Math.random() * 90000) + 10000)}`,
  );
  const [formattedDate] = useState(() => {
    return new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  });

  // Available Budget Query
  const { data: budgetData } = useGetAvailableBudgetQuery(
    {
      project_id: Number(selectedProjectId),
      wbs_id: Number(selectedTaskId),
      cost_code: "CC-04",
    },
    { skip: !selectedProjectId || !selectedTaskId },
  );

  // Filter Phases (parent WBS) from Project Costing
  const approvedProjects = useMemo(() => {
    const list = Array.isArray(rawCostingProjects)
      ? rawCostingProjects
      : (rawCostingProjects as any)?.results || [];
    return list.filter((p: any) => {
      if (!p) return false;
      const st = String(p.status || "").toUpperCase();
      return (
        st === "APPROVED" ||
        st === "ACTIVE" ||
        p.is_approved === true ||
        !p.status
      );
    });
  }, [rawCostingProjects]);

  const { data: costingProjectDetail } = useGetProjectCostingProjectQuery(
    Number(selectedProjectId),
    { skip: !selectedProjectId || isNaN(Number(selectedProjectId)) },
  );

  const currentProject = useMemo(() => {
    return (
      costingProjectDetail ||
      approvedProjects.find((p: any) => String(p.id) === selectedProjectId)
    );
  }, [costingProjectDetail, approvedProjects, selectedProjectId]);

  const wbsList = useMemo(() => {
    if (!currentProject) return [];

    if (Array.isArray((currentProject as any).wbs) && (currentProject as any).wbs.length > 0) {
      return (currentProject as any).wbs;
    }

    const items: any[] = [];
    const phasesArray = Array.isArray(currentProject.phases)
      ? currentProject.phases
      : Array.isArray((currentProject as any)?.phase_list)
        ? (currentProject as any).phase_list
        : [];

    phasesArray.forEach((ph: any, idx: number) => {
      const phaseId = ph.id || ph.phase_id || `phase-${idx + 1}`;
      const phaseName = ph.name || ph.phase_name || `Phase ${idx + 1}`;

      items.push({
        id: phaseId,
        name: phaseName,
        is_activity: false,
      });

      const acts = Array.isArray(ph.activities)
        ? ph.activities
        : Array.isArray(ph.activity_list)
          ? ph.activity_list
          : [];

      acts.forEach((act: any, actIdx: number) => {
        const actId =
          act.id || act.activity_id || `act-${phaseId}-${actIdx + 1}`;
        const actName =
          act.name || act.activity_name || `Activity ${actIdx + 1}`;
        items.push({
          ...act,
          id: actId,
          name: actName,
          is_activity: true,
          parent: phaseId,
          amount: Number(
            act.available_budget ??
            act.budget ??
            act.amount ??
            act.budgeted_amount ??
            act.total_amount ??
            act.cost ??
            0
          ),
        });
      });
    });

    if (Array.isArray((currentProject as any).activities)) {
      (currentProject as any).activities.forEach((act: any, actIdx: number) => {
        const actId = act.id || act.activity_id || `act-${actIdx + 1}`;
        if (!items.some((it) => String(it.id) === String(actId))) {
          items.push({
            ...act,
            id: actId,
            name: act.name || act.activity_name || `Activity ${actIdx + 1}`,
            is_activity: true,
            parent: act.phase || act.phase_id || act.parent || null,
            amount: Number(
              act.available_budget ??
              act.budget ??
              act.amount ??
              act.budgeted_amount ??
              act.total_amount ??
              act.cost ??
              0
            ),
          });
        }
      });
    }

    return items;
  }, [currentProject]);

  const phases = useMemo(() => {
    return wbsList.filter((w: any) => !w.is_activity);
  }, [wbsList]);

  // Filter Tasks (activity WBS with selected phase parent)
  const tasks = useMemo(() => {
    if (!selectedPhaseId) return [];
    return wbsList.filter(
      (w: any) => w.is_activity && String(w.parent) === String(selectedPhaseId),
    );
  }, [wbsList, selectedPhaseId]);

  // Selected Activity/Task object from WBS
  const selectedTaskObj = useMemo(() => {
    return tasks.find((t: any) => String(t.id) === String(selectedTaskId));
  }, [tasks, selectedTaskId]);

  const availableBudget = useMemo(() => {
    // 1. If we have a selected task/activity from WBS/Project Costing, get its budget/amount
    if (selectedTaskObj) {
      const budgetVal = Number(
        selectedTaskObj.available_budget ??
        selectedTaskObj.amount ??
        selectedTaskObj.budget ??
        selectedTaskObj.budgeted_amount ??
        selectedTaskObj.total_amount ??
        selectedTaskObj.cost ??
        0
      );
      if (!isNaN(budgetVal) && budgetVal !== 0) {
        return budgetVal;
      }
    }
    // 2. Otherwise if the legacy API returned a non-zero budget, use it
    if (budgetData?.available_budget && Number(budgetData.available_budget) > 0) {
      return Number(budgetData.available_budget);
    }
    // 3. Or check the selected phase if task not picked yet
    if (selectedPhaseId) {
      const phaseObj = phases.find((p: any) => String(p.id) === String(selectedPhaseId));
      if (phaseObj) {
        const phaseBudget = Number(
          (phaseObj as any).available_budget ??
          (phaseObj as any).amount ??
          (phaseObj as any).budget ??
          (phaseObj as any).total_amount ??
          0
        );
        if (!isNaN(phaseBudget) && phaseBudget > 0) return phaseBudget;
      }
    }
    // 4. Or check the project-level available budget
    if (currentProject) {
      const projBudget = Number(
        (currentProject as any).available_budget ??
        (currentProject as any).budget ??
        (currentProject as any).total_budget ??
        0
      );
      if (!isNaN(projBudget) && projBudget > 0) {
        return projBudget;
      }
    }
    return 0;
  }, [selectedTaskObj, budgetData, selectedPhaseId, phases, currentProject]);

  // Normalize inventory products
  const invProductsList = useMemo(() => {
    if (!rawInventoryProducts) return [];
    if (Array.isArray(rawInventoryProducts)) return rawInventoryProducts;
    if ((rawInventoryProducts as any).results && Array.isArray((rawInventoryProducts as any).results)) {
      return (rawInventoryProducts as any).results;
    }
    return [];
  }, [rawInventoryProducts]);

  // Combine products
  const allProducts = useMemo(() => {
    const list: { id: string; name: string; standardCost?: number; description?: string }[] = [];
    invProductsList.forEach((ip: any) => {
      if (ip && (ip.product_name || ip.name)) {
        const pName = String(ip.product_name || ip.name).trim();
        if (!list.some((item) => item.name.toLowerCase() === pName.toLowerCase())) {
          list.push({
            id: String(ip.id),
            name: pName,
            standardCost: Number(ip.standard_cost || ip.estimated_unit_cost || 0),
            description: ip.description || ip.product_description || "",
          });
        }
      }
    });
    dbProducts.forEach((dp: any) => {
      if (dp && dp.product_name) {
        const pName = String(dp.product_name).trim();
        if (!list.some((item) => item.name.toLowerCase() === pName.toLowerCase())) {
          list.push({
            id: String(dp.id),
            name: pName,
            standardCost: Number(dp.standard_cost || dp.estimated_unit_cost || 0),
            description: dp.product_description || dp.description || "",
          });
        }
      }
    });
    customProducts.forEach((cp) => {
      if (!list.some((item) => item.name.toLowerCase() === cp.name.toLowerCase())) {
        list.push({
          ...cp,
          standardCost: 0,
          description: "",
        });
      }
    });
    return list;
  }, [invProductsList, dbProducts, customProducts]);

  // Total cost
  const totalCost = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  }, [items]);

  // Handle adding another product line
  const addAnotherProduct = () => {
    // Automatically save any unsaved item if valid, else keep editing
    const unsavedIndex = items.findIndex((item) => item.isEditing);
    if (unsavedIndex > -1) {
      const unsaved = items[unsavedIndex];
      if (!unsaved.productName) {
        setItems((prev) =>
          prev.map((it, idx) =>
            idx === unsavedIndex ? { ...it, error: "Enter product name" } : it,
          ),
        );
        return;
      }
    }

    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        isEditing: true,
        productName: "",
        quantity: 0,
        unitCost: 0,
        description: "",
      },
    ]);
  };

  // Handle saving an item (Done button)
  const saveItem = (id: string) => {
    const item = items.find((it) => it.id === id);
    if (!item) return;

    if (!item.productName.trim()) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, error: "Enter product name" } : it,
        ),
      );
      return;
    }

    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, isEditing: false, error: undefined } : it,
      ),
    );
  };

  // Handle editing a completed item
  const editItem = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, isEditing: true } : it)),
    );
  };

  // Handle deleting an item
  const deleteItem = (id: string) => {
    if (items.length === 1) {
      // Keep at least one empty item
      setItems([
        {
          id: String(Date.now()),
          isEditing: true,
          productName: "",
          quantity: 0,
          unitCost: 0,
          description: "",
        },
      ]);
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Handle submit form
  const handleSubmit = async () => {
    // Validate main details
    if (!selectedProjectId) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Validation Error",
        description: "Please select a project.",
      });
      return;
    }
    if (!location) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Validation Error",
        description: "Please select site location.",
      });
      return;
    }
    if (!requiredDate) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Validation Error",
        description: "Please select a required by date.",
      });
      return;
    }
    if (!selectedPhaseId || !selectedTaskId) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Validation Error",
        description: "Please select phase and activity.",
      });
      return;
    }

    // Validate and auto-save items
    let hasUnsavedOrInvalid = false;
    const validatedItems = items.map((item) => {
      if (item.isEditing) {
        if (!item.productName.trim()) {
          hasUnsavedOrInvalid = true;
          return { ...item, error: "Enter product name" };
        }
        return { ...item, isEditing: false, error: undefined };
      }
      return item;
    });

    if (hasUnsavedOrInvalid) {
      setItems(validatedItems);
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Validation Error",
        description: "Please resolve all errors in the Product Line items.",
      });
      return;
    }

    setItems(validatedItems);

    // Resolve TenantUser profile ID for the requester
    const currentUserProfile = tenantUsers?.find(
      (tu) => tu.user_id === loggedInUser?.id,
    );
    const requesterId = currentUserProfile?.id || loggedInUser?.id || 1;

    // Build API payload
    const phaseName = phases.find((p: any) => String(p.id) === selectedPhaseId)?.name || "Phase";
    const taskName = tasks.find((t: any) => String(t.id) === selectedTaskId)?.name || "Task";
    const projectName = currentProject?.name || "Project";

    const locationName = activeLocations?.find((loc) => String(loc.id) === location)?.location_name || location || "Lagos Site";
    const linesPayload = validatedItems.map((item) => {
      const cleanId = item.productId || item.id;
      const parsedId = parseInt(cleanId);
      const productDbId = !isNaN(parsedId)
        ? parsedId
        : (invProductsList.find(
            (p: any) =>
              String(p.product_name || p.name || "").toLowerCase() === item.productName.toLowerCase(),
          )?.id ||
          dbProducts.find(
            (p) =>
              String(p.product_name || "").toLowerCase() === item.productName.toLowerCase(),
          )?.id ||
          invProductsList[0]?.id ||
          dbProducts[0]?.id ||
          1);

      return {
        product: productDbId,
        description: item.description || item.productName || "",
        quantity: String(item.quantity || 1),
        estimated_unit_cost: String(item.unitCost || 0),
        qty: item.quantity || 1,
        estimated_unit_price: String(item.unitCost || 0),
      };
    });

    const purposeStr = `Project: ${projectName} | Phase: ${phaseName} | Activity: ${taskName} | Notes: ${notes}`;

    const payload: any = {
      project: Number(selectedProjectId) || 1,
      activity: String(selectedTaskId || ""),
      site_location: locationName,
      required_by_date: requiredDate,
      notes: purposeStr,
      lines: linesPayload,

      status: "pending" as const,
      currency: currencies?.[0]?.id || 1,
      requester: requesterId,
      requesting_location: location || String(activeLocations?.[0]?.id || 1),
      purpose: purposeStr,
      vendor: vendors?.[0]?.id || 1,
      items: linesPayload,
    };

    try {
      const result = await createProjectPurchaseRequest(payload).unwrap();

      const newRequest = {
        id: result?.id || `pr-${Date.now()}`,
        reference_id: result?.reference_id || requestId,
        title: validatedItems.map((it) => it.productName).join(", "),
        status: (result?.status || "pending") as any,
        quantity: validatedItems.reduce(
          (acc, it) => acc + Number(it.quantity || 0),
          0,
        ),
        amount: totalCost,
        requester: loggedInUser?.username || "Firstname Lastname",
        date: formattedDate,
        project: projectName,
        location: locationName,
        requiredDate,
        phase: phaseName,
        task: taskName,
        notes,
        lines: validatedItems.map((item, idx) => ({
          id: idx + 1,
          productName: item.productName,
          description: item.description || "",
          quantity: Number(item.quantity || 1),
          unitCost: Number(item.unitCost || 0),
          lineTotal: Number(item.quantity || 1) * Number(item.unitCost || 0),
        })),
      };

      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Request Submitted",
        description: "Your request has successfully been submitted",
      });
    } catch (err: any) {
      console.warn("API submission failed, falling back to local storage:", err);
      
      const newRequest = {
        id: `pr-${Date.now()}`,
        reference_id: requestId,
        title: validatedItems.map((it) => it.productName).join(", "),
        status: "pending" as const,
        quantity: validatedItems.reduce(
          (acc, it) => acc + Number(it.quantity || 0),
          0,
        ),
        amount: totalCost,
        requester: loggedInUser?.username || "Firstname Lastname",
        date: formattedDate,
        project: projectName,
        location: locationName,
        requiredDate,
        phase: phaseName,
        task: taskName,
        notes,
        lines: validatedItems.map((item, idx) => ({
          id: idx + 1,
          productName: item.productName,
          description: item.description || "",
          quantity: Number(item.quantity || 1),
          unitCost: Number(item.unitCost || 0),
          lineTotal: Number(item.quantity || 1) * Number(item.unitCost || 0),
        })),
      };

      const stored = localStorage.getItem("project_purchase_requests");
      let requestsList = [];
      if (stored) {
        try {
          requestsList = JSON.parse(stored);
        } catch (e) {
          requestsList = [];
        }
      }
      requestsList.unshift(newRequest);
      localStorage.setItem(
        "project_purchase_requests",
        JSON.stringify(requestsList),
      );

      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Request Submitted (Offline)",
        description: "Submission saved locally. API reported: " + (err.data?.message || err.message || "Connection issue"),
      });
    }
  };

  const handleModalClose = () => {
    setStatusModal((prev) => ({ ...prev, isOpen: false }));
    if (statusModal.type === "success") {
      router.push("/project-request/purchase-request");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-28">
      {/* Header Bar */}
      <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">
              Purchase Request
            </h1>
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

      {/* Main Form Fields */}
      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Request Details Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
            {/* <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" /> */}
            Request Details
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Request ID
              </Label>
              <Input
                value={requestId}
                readOnly
                className="bg-gray-50 border-gray-200 text-gray-500 h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Date
              </Label>
              <Input
                value={formattedDate}
                readOnly
                className="bg-gray-50 border-gray-200 text-gray-500 h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Requested by
              </Label>
              <Input
                value={loggedInUser?.username || "Firstname Lastname"}
                readOnly
                className="bg-gray-50 border-gray-200 text-gray-500 h-11"
              />
            </div>
          </div>
        </div>

        {/* Purchase Details Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
            {/* <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" /> */}
            Purchase Details
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Project
              </Label>
              <Select
                value={selectedProjectId}
                onValueChange={(val) => {
                  setSelectedProjectId(val);
                  setSelectedPhaseId("");
                  setSelectedTaskId("");
                }}
              >
                <SelectTrigger className="h-11 border-gray-200 focus:ring-[#3B7CED]/20 bg-white">
                  <SelectValue
                    placeholder="Select a project"
                    className="w-full"
                  />
                </SelectTrigger>
                <SelectContent>
                  {approvedProjects.map((p: any) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} {p.project_code ? `(${p.project_code})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Site Location
              </Label>
              <Input
                type="text"
                placeholder="Enter site location e.g. Lagos Site"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-11 border-gray-200 focus:ring-[#3B7CED]/20 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Required By Date
              </Label>
              <Input
                type="date"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="h-11 border-gray-200 focus:ring-[#3B7CED]/20"
              />
            </div>
          </div>
        </div>

        {/* WBS Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
            {/* <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" /> */}
            WBS
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Phase
              </Label>
              <Select
                value={selectedPhaseId}
                onValueChange={(val) => {
                  setSelectedPhaseId(val);
                  setSelectedTaskId("");
                }}
                disabled={!selectedProjectId}
              >
                <SelectTrigger className="h-11 border-gray-200 focus:ring-[#3B7CED]/20 bg-white disabled:bg-gray-50 disabled:text-gray-400">
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

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Activity
              </Label>
              <Select
                value={selectedTaskId}
                onValueChange={setSelectedTaskId}
                disabled={!selectedPhaseId}
              >
                <SelectTrigger className="h-11 border-gray-200 focus:ring-[#3B7CED]/20 bg-white disabled:bg-gray-50 disabled:text-gray-400">
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

            <div className="flex justify-between items-center py-2 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-900">
                Available Budget
              </span>
              <span className="text-xs font-semibold text-[#3B7CED]">
                ₦
                {availableBudget.toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Product Line Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-5">
          <div
            onClick={() => setIsProductLinesCollapsed(!isProductLinesCollapsed)}
            className="flex justify-between items-center cursor-pointer select-none"
          >
            <h2 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
              Product Line
            </h2>
            <ChevronDown
              className={`h-5 w-5 text-[#3B7CED] transition-transform duration-200 ${
                isProductLinesCollapsed ? "" : "rotate-180"
              }`}
            />
          </div>

          {!isProductLinesCollapsed && (
            <div className="space-y-4">
              {items.map((item, index) => {
                if (item.isEditing) {
                  return (
                    <ItemEditForm
                      key={item.id}
                      item={item}
                      index={index}
                      allProducts={allProducts}
                      onSave={saveItem}
                      onDelete={deleteItem}
                      onUpdate={(patch) => {
                        setItems((prev) =>
                          prev.map((it) =>
                            it.id === item.id ? { ...it, ...patch } : it,
                          ),
                        );
                      }}
                    />
                  );
                }

                return (
                  <div
                    key={item.id}
                    className="p-4 border border-gray-200 rounded-lg bg-[#F8FAFC] relative space-y-1.5"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-gray-400">
                        Item {index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => editItem(item.id)}
                          className="p-1 rounded-md hover:bg-gray-200 transition-colors text-blue-500"
                          aria-label="Edit Item"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteItem(item.id)}
                          className="p-1 rounded-md hover:bg-gray-200 transition-colors text-red-500"
                          aria-label="Delete Item"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-bold text-gray-900">
                        {item.productName}
                      </h3>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-gray-800 font-medium">
                        {item.quantity} QTY
                      </span>
                      <span className="text-xs font-bold text-[#3B7CED]">
                        ₦
                        {(item.quantity * item.unitCost).toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-xs text-gray-500 italic mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Add Another Product Button */}
              <button
                type="button"
                onClick={addAnotherProduct}
                className="w-full h-12 border-2 border-dashed border-blue-200 hover:border-[#3B7CED] hover:bg-blue-50/20 text-[#3B7CED] rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Plus size={16} />
                Add Another Product
              </button>
            </div>
          )}
        </div>

        {/* Cost Summary Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center py-1">
            <span className="text-xs font-semibold text-gray-500">
              Available Budget
            </span>
            <span className="text-xs font-semibold text-gray-500">
              ₦
              {availableBudget.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-t border-gray-100 pt-3">
            <span className="text-xs font-semibold text-gray-900">
              Total Cost
            </span>
            <span className="text-xs font-bold text-[#3B7CED]">
              ₦{totalCost.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="space-y-1.5 pt-2">
            <Label className="text-xs font-semibold text-gray-700">
              Notes / Justification
            </Label>
            <Textarea
              placeholder="Enter note"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] border-gray-200 focus:ring-[#3B7CED]/20"
            />
          </div>
        </div>
      </main>

      {/* Floating Action Submit Button */}
      <div className="fixed bottom-0 left-16 right-0 bg-white border-t border-gray-100 p-4 z-20">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleSubmit}
            className="w-full h-12 text-sm font-bold flex items-center justify-center bg-[#3B7CED] hover:bg-[#2d63c7] text-white rounded-lg shadow-sm"
          >
            Submit request
          </Button>
        </div>
      </div>

      {/* Status Modal */}
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={handleModalClose}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.description}
        actionText="Done"
        onAction={handleModalClose}
        showCloseButton={false}
      />
    </div>
  );
}

// Subcomponent for item editing form
function ItemEditForm({
  item,
  index,
  allProducts,
  onSave,
  onDelete,
  onUpdate,
}: {
  item: ItemState;
  index: number;
  allProducts: Array<{ id: string; name: string; standardCost?: number; description?: string }>;
  onSave: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (patch: Partial<ItemState>) => void;
}) {
  const [searchQuery, setSearchQuery] = useState(item.productName);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return allProducts;
    return allProducts.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [allProducts, searchQuery]);

  const exactMatch = useMemo(() => {
    return allProducts.some(
      (p) => p.name.toLowerCase() === searchQuery.toLowerCase(),
    );
  }, [allProducts, searchQuery]);

  const handleSelect = (name: string, id: string) => {
    const selectedProd = allProducts.find((p) => p.id === id || p.name.toLowerCase() === name.toLowerCase());
    onUpdate({
      productName: name,
      productId: id,
      ...(selectedProd?.standardCost ? { unitCost: selectedProd.standardCost } : {}),
      ...(selectedProd?.description ? { description: selectedProd.description } : {}),
      error: undefined,
    });
    setSearchQuery(name);
    setIsOpen(false);
  };

  const handleAddNew = (name: string) => {
    onUpdate({ productName: name, productId: `custom-${Date.now()}`, error: undefined });
    setSearchQuery(name);
    setIsOpen(false);
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white relative space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-500">
          Item {index + 1}
        </span>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors text-red-500"
          aria-label="Remove Item"
        >
          <X size={16} />
        </button>
      </div>

      {/* Product Name Search Select */}
      <div className="space-y-1.5 relative" ref={dropdownRef}>
        <Label className="text-xs font-semibold text-gray-700">
          Product name
        </Label>
        <div className="relative">
          <input
            type="text"
            placeholder="Select a product"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onUpdate({ productName: e.target.value });
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className={`w-full h-11 px-3 pr-10 border rounded-lg text-sm bg-white focus:outline-none transition-all ${
              item.error
                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-gray-200 focus:border-[#3B7CED] focus:ring-1 focus:ring-[#3B7CED]"
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {item.error && (
          <p className="text-xs text-red-500 mt-1">{item.error}</p>
        )}

        {isOpen && (
          <div className="absolute top-full left-0 w-full z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1 py-1">
            {/* Filtered list */}
            {filteredProducts.map((prod) => (
              <button
                key={prod.id}
                type="button"
                onClick={() => handleSelect(prod.name, prod.id)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {prod.name}
              </button>
            ))}

            {/* Add new option if no exact match */}
            {searchQuery.trim() && !exactMatch && (
              <button
                type="button"
                onClick={() => handleAddNew(searchQuery.trim())}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#2BA24D] hover:bg-green-50 transition-colors border-t border-gray-100"
              >
                + Add new: "{searchQuery.trim()}"
              </button>
            )}

            {filteredProducts.length === 0 && !searchQuery.trim() && (
              <div className="px-4 py-2.5 text-sm text-gray-400 text-center">
                No products found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quantity & Cost Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700">
            Quantity
          </Label>
          <Input
            type="number"
            placeholder="Enter quantity"
            value={item.quantity || ""}
            onChange={(e) =>
              onUpdate({ quantity: Math.max(0, Number(e.target.value || 0)) })
            }
            className="h-11 border-gray-200 focus:ring-[#3B7CED]/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700">
            Estimated unit cost
          </Label>
          <Input
            type="number"
            placeholder="Enter cost"
            value={item.unitCost || ""}
            onChange={(e) =>
              onUpdate({ unitCost: Math.max(0, Number(e.target.value || 0)) })
            }
            className="h-11 border-gray-200 focus:ring-[#3B7CED]/20"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-700">
          Description
        </Label>
        <Input
          placeholder="Enter descriptions"
          value={item.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="h-11 border-gray-200 focus:ring-[#3B7CED]/20"
        />
      </div>

      {/* Done Button */}
      <button
        type="button"
        onClick={() => onSave(item.id)}
        className="w-full h-11 bg-[#2BA24D] hover:bg-[#238c41] text-white rounded-lg text-sm font-semibold flex items-center justify-center transition-colors mt-2"
      >
        Done
      </button>
    </div>
  );
}
