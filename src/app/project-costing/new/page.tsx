"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Plus, Paperclip, Link2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BasicInformationForm } from "@/components/project-costing/BasicInformationForm";
import { WBSTable } from "@/components/project-costing/wbs/WBSTable";
import { Phase, Activity } from "@/components/project-costing/types";
import { useCreateProjectCostingProjectMutation } from "@/api/projectCostingApi";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";
import { extractErrorMessage } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [extraColumns, setExtraColumns] = useState<string[]>([]);

  // External Documents States
  const [documents, setDocuments] = useState<{ name: string; url?: string; file?: File }[]>([]);
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [createProject, { isLoading }] = useCreateProjectCostingProjectMutation();
  const statusModal = useStatusModal();

  const wbsFileInputRef = useRef<HTMLInputElement>(null);
  const [importedFileName, setImportedFileName] = useState("");

  // Handler for adding a URL Link
  const handleAddLink = () => {
    const nameTrim = linkName.trim();
    let urlTrim = linkUrl.trim();
    if (!nameTrim || !urlTrim) return;

    // Standardize URL schema
    if (!/^https?:\/\//i.test(urlTrim)) {
      urlTrim = `https://${urlTrim}`;
    }

    setDocuments((prev) => [...prev, { name: nameTrim, url: urlTrim }]);
    setLinkName("");
    setLinkUrl("");
  };

  // Handler for uploading files (External Documents)
  const handleFileUploadExternal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newDocs = Array.from(files).map((f) => ({
      name: f.name,
      file: f,
    }));
    setDocuments((prev) => [...prev, ...newDocs]);
  };

  // Handler for removing a document or link
  const handleRemoveDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // Handler for importing WBS Excel sheet
  const handleWBSImport = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const sheetData = XLSX.utils.sheet_to_json<any>(ws);

        if (!sheetData || sheetData.length === 0) {
          statusModal.showError("Invalid File", "The uploaded Excel file is empty.");
          return;
        }

        // Get headers of first row to inspect headers correctly
        const range = XLSX.utils.decode_range(ws["!ref"] || "");
        const headers: string[] = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell = ws[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
          let val = "";
          if (cell && cell.t) val = XLSX.utils.format_cell(cell);
          headers.push(val.trim());
        }

        // Validate the 6 mandatory columns (case-insensitive checks)
        const normalizedHeaders = headers.map((h) => h.toLowerCase());
        const mandatory = ["s/n", "phase", "activity", "quantity", "rate", "amount"];
        const missing = mandatory.filter((m) => !normalizedHeaders.includes(m));

        if (missing.length > 0) {
          statusModal.showError(
            "Invalid Format",
            `The Excel file is missing mandatory columns: ${missing.map((m) => `"${m.toUpperCase()}"`).join(", ")}`
          );
          return;
        }

        // Identify extra columns
        const mandatoryLower = new Set(mandatory);
        const extraCols = headers.filter(
          (h) => h && !mandatoryLower.has(h.toLowerCase())
        );
        setExtraColumns(extraCols);

        // Map column header name to matching state keys
        const headerToKey = (headerName: string) => {
          const lower = headerName.toLowerCase();
          if (lower === "s/n") return "sn";
          if (lower === "phase") return "phase";
          if (lower === "activity") return "name";
          if (lower === "quantity") return "quantity";
          if (lower === "rate") return "rate";
          if (lower === "amount") return "budget";
          return headerName; // custom column name
        };

        const newPhases: Phase[] = [];
        const generateId = () => Math.random().toString(36).substr(2, 9);

        sheetData.forEach((row) => {
          const rowObj: any = {};
          Object.keys(row).forEach((rawKey) => {
            const matchedHeader = headers.find(
              (h) => h.toLowerCase() === rawKey.toLowerCase().trim()
            );
            if (matchedHeader) {
              const mappedKey = headerToKey(matchedHeader);
              let val = row[rawKey];
              if (["quantity", "rate", "budget"].includes(mappedKey)) {
                val = Number(val) || 0;
              }
              rowObj[mappedKey] = val;
            }
          });

          const phaseName = String(rowObj.phase || "").trim();
          const activityName = String(rowObj.name || "").trim();
          const sn = String(rowObj.sn || "").trim();
          const quantity = Number(rowObj.quantity) || 1;
          const rate = Number(rowObj.rate) || 0;
          const budget = Number(rowObj.budget) || (quantity * rate);

          if (!phaseName || !activityName) return;

          let phase = newPhases.find((p) => p.name === phaseName);
          if (!phase) {
            phase = { id: generateId(), name: phaseName, activities: [] };
            newPhases.push(phase);
          }

          // Gather custom fields
          const extraFields: any = {};
          extraCols.forEach((col) => {
            extraFields[col] = rowObj[col] !== undefined ? String(rowObj[col]) : "";
          });

          const activityObj: Activity = {
            id: generateId(),
            sn,
            name: activityName,
            quantity,
            rate,
            budget,
            ...extraFields,
          };

          phase.activities.push(activityObj);
        });

        setPhases(newPhases);
        statusModal.showSuccess(
          "Import Successful",
          "The WBS has been populated from the Excel file."
        );
      } catch (err) {
        console.error(err);
        statusModal.showError(
          "Parsing Error",
          "There was an error reading the Excel file. Please ensure it is a valid format."
        );
      }
    };
    reader.readAsBinaryString(file);

    if (wbsFileInputRef.current) {
      wbsFileInputRef.current.value = "";
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
      activities: phase.activities.map((a) => {
        const payloadAct: any = {
          name: a.name,
          amount: a.budget || 0,
          quantity: a.quantity || 1,
          rate: a.rate || a.budget || 0,
        };
        // Add dynamic columns
        extraColumns.forEach((col) => {
          if (a[col] !== undefined) {
            payloadAct[col] = a[col];
          }
        });
        if (a.sn) {
          payloadAct.sn = a.sn;
        }
        return payloadAct;
      }),
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
        // Include documents URL/labels if the backend is ready for them
        documents: documents.map((d) => ({
          name: d.name,
          url: d.url || "",
        })),
      } as any).unwrap();

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
    <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center">
          <Link href="/project-costing">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
          </Link>
          <h1 className="text-lg font-medium text-gray-800">New Project</h1>
        </div>

        <Button
          type="button"
          onClick={() => setIsPanelOpen(true)}
          variant="outline"
          className="border-[#3B7CED] text-[#3B7CED] hover:bg-blue-50 flex items-center gap-2 h-9 text-xs"
        >
          <Paperclip className="w-4 h-4" />
          <span>Documents & Links ({documents.length})</span>
        </Button>
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

        {/* WBS Excel Import Section */}
        <section>
          <h2 className="text-[#3B7CED] text-base font-medium mb-4">
            Documents (WBS Excel Import)
          </h2>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              ref={wbsFileInputRef}
              onChange={handleWBSImport}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => wbsFileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-6 py-6 border-2 border-dashed border-[#3B7CED] opacity-80 rounded text-[#3B7CED] hover:bg-blue-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Import WBS Excel</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 text-white p-3 rounded-lg shadow-lg text-xs border border-gray-800 max-w-xs z-50">
                  <p className="font-semibold mb-1">Mandatory WBS Columns:</p>
                  <ol className="list-decimal pl-4 space-y-0.5 font-normal text-gray-200">
                    <li>S/N</li>
                    <li>Phase</li>
                    <li>Activity</li>
                    <li>Quantity</li>
                    <li>Rate</li>
                    <li>Amount</li>
                  </ol>
                  <p className="mt-1.5 text-[10px] text-gray-400">* Additional columns will be imported as custom text fields.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {importedFileName && (
              <div className="text-xs text-gray-600 flex items-center gap-1.5 bg-blue-50/50 px-3 py-3 rounded border border-blue-100">
                <span className="font-semibold text-gray-800">Imported WBS:</span>
                <span className="truncate max-w-[150px]">{importedFileName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setImportedFileName("");
                    setPhases([]);
                    setExtraColumns([]);
                  }}
                  className="text-gray-400 hover:text-red-500 font-bold text-sm ml-1"
                  title="Clear imported WBS"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </section>

        <WBSTable
          phases={phases}
          setPhases={setPhases}
          extraColumns={extraColumns}
          setExtraColumns={setExtraColumns}
        />
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

      {/* Side Over Panel / Drawer */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 transition-opacity"
          onClick={() => setIsPanelOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-[460px] max-w-[90vw] bg-white shadow-2xl border-l border-gray-100 flex flex-col transition-transform duration-300 ease-in-out transform ${
          isPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-[#3B7CED] text-lg font-medium">Documents & Links</h2>
            <p className="text-xs text-gray-500 mt-1">Manage files and links for this project.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsPanelOpen(false)}
            className="text-gray-400 hover:text-gray-600 font-bold text-xl p-1"
          >
            ×
          </button>
        </div>

        {/* Panel Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-8">
          {/* File Upload Section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-700 font-medium">Upload Files</h3>
            <input
              type="file"
              multiple
              className="hidden"
              id="external-doc-upload"
              onChange={handleFileUploadExternal}
            />
            <label
              htmlFor="external-doc-upload"
              className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded hover:border-[#3B7CED] hover:bg-blue-50/20 transition-all cursor-pointer text-gray-500 hover:text-[#3B7CED] text-sm font-medium"
            >
              <Paperclip className="w-4 h-4" />
              Click to select files
            </label>
          </div>

          {/* Link Attachment Section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-700 font-medium">Attach Web Link</h3>
            <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded border border-gray-100">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600 font-medium">Link Label</label>
                <Input
                  placeholder="e.g. Live PRD"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  className="h-9 bg-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600 font-medium">Link URL</label>
                <Input
                  placeholder="https://example.com/prd"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="h-9 bg-white"
                />
              </div>
              <Button
                type="button"
                onClick={handleAddLink}
                className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-9 mt-2 flex items-center gap-1"
              >
                <Link2 className="w-4 h-4" /> Attach Link
              </Button>
            </div>
          </div>

          {/* List of Attachments */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-700 font-medium">Currently Attached</h3>
            {documents.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400 border border-dashed border-gray-100 rounded">
                No documents or links attached yet.
              </div>
            ) : (
              <div className="border border-gray-200 rounded bg-white divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                {documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center px-3 py-2 text-sm text-gray-700 font-normal"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {doc.url ? (
                        <Link2 className="w-4 h-4 text-[#3B7CED] shrink-0" />
                      ) : (
                        <Paperclip className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                      {doc.url ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3B7CED] hover:underline truncate"
                        >
                          {doc.name}
                        </a>
                      ) : (
                        <span className="truncate">{doc.name}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(idx)}
                      className="text-gray-400 hover:text-red-500 shrink-0 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <Button
            type="button"
            onClick={() => setIsPanelOpen(false)}
            className="bg-[#3B7CED] hover:bg-[#3065c3] text-white w-full"
          >
            Done
          </Button>
        </div>
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
