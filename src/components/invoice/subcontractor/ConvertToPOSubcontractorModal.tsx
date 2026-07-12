"use client";

import { useState, useEffect } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  User,
  Briefcase,
  DollarSign,
  Building,
  Calendar,
  Clock,
  CheckCircle,
} from "lucide-react";

interface Milestone {
  id: number;
  name: string;
  description: string;
  amount: number;
}

interface ConvertToPOSubcontractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  onNextStep: () => void;
  onBackStep: () => void;
  onIssuePO: () => void;
  formatCurrency: (amount: number) => string;
}

const mockData = {
  subcontractorName: "John Doe",
  scopeOfWork: "Engineering",
  contractValue: 600000,
  projectName: "Concrete Works",
  wbs: "WBS-1.3.1 – Concrete Works",
  paymentType: "Milestone",
  milestones: [
    { id: 1, name: "Milestone 1", description: "Description", amount: 200000 },
    { id: 2, name: "Milestone 2", description: "Description", amount: 200000 },
    { id: 3, name: "Milestone 3", description: "Description", amount: 200000 },
  ],
};

export default function ConvertToPOSubcontractorModal({
  isOpen,
  onClose,
  currentStep,
  onNextStep,
  onBackStep,
  onIssuePO,
  formatCurrency,
}: ConvertToPOSubcontractorModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const renderStepIndicator = () => (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
            currentStep === 1 ? "bg-blue-600 text-white" : "bg-green-500"
          }`}
        >
          {currentStep === 1 ? (
            1
          ) : (
            <CheckCircle className="w-4 h-4 text-white bg-green-500" />
          )}
        </div>
        <span
          className={`text-sm ${
            currentStep === 1 ? "text-gray-900 font-medium" : "text-gray-500"
          }`}
        >
          Review Details
        </span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300" />
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
            currentStep === 2
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          2
        </div>
        <span
          className={`text-sm ${
            currentStep === 2 ? "text-gray-900 font-medium" : "text-gray-500"
          }`}
        >
          Confirm & Issue
        </span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <>
      <div className="space-y-6">
        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className=" rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Subcontractor Name
            </p>
            <p className="text-sm font-medium text-gray-900">
              {mockData.subcontractorName}
            </p>
          </div>
          <div className=" rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Scope of Work
            </p>
            <p className="text-sm font-medium text-gray-900">
              {mockData.scopeOfWork}
            </p>
          </div>
          <div className=" rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Contract Value
            </p>
            <p className="text-sm font-bold text-gray-900">
              {formatCurrency(mockData.contractValue)}
            </p>
          </div>
          <div className=" rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Project Name
            </p>
            <p className="text-sm font-medium text-gray-900">
              {mockData.projectName}
            </p>
          </div>
          <div className=" rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              WBS element
            </p>
            <p className="text-sm font-medium text-gray-900">{mockData.wbs}</p>
          </div>
          <div className=" rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Payment Type
            </p>
            <p className="text-sm font-medium text-gray-900">
              {mockData.paymentType}
            </p>
          </div>
        </div>

        {/* Milestones */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Milestones</h3>
          <div className=" border border-gray-200 p-4 rounded-lg">
            {mockData.milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className={`${index % 2 === 0 ? "bg-gray-50" : ""} px-4 py-3 border border-gray-200 flex items-center justify-between`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {milestone.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {milestone.description}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(milestone.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 border-t border-gray-200 mt-6">
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={onNextStep}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          Review & Confirm
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="space-y-6">
        {/* Notice Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <p className="text-sm text-amber-800">
            Once issued, this Purchase Order will be sent to{" "}
            <strong>{mockData.subcontractorName}</strong>. The Committed Amount
            of <strong>{formatCurrency(mockData.contractValue)}</strong> will be
            locked against <strong>{mockData.wbs}</strong> until payment is
            confirmed or the PO is cancelled.
          </p>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className=" rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Subcontractor Name
            </p>
            <p className="text-sm font-medium text-gray-900">
              {mockData.subcontractorName}
            </p>
          </div>
          <div className=" rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Scope of Work
            </p>
            <p className="text-sm font-medium text-gray-900">
              {mockData.scopeOfWork}
            </p>
          </div>
          <div className=" rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Contract Value
            </p>
            <p className="text-sm font-bold text-gray-900">
              {formatCurrency(mockData.contractValue)}
            </p>
          </div>
          <div className=" rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Project Name
            </p>
            <p className="text-sm font-medium text-gray-900">
              {mockData.projectName}
            </p>
          </div>
          <div className=" rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Payment Type
            </p>
            <p className="text-sm font-medium text-gray-900">
              {mockData.paymentType}
            </p>
          </div>
          <div className=" rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              WBS element
            </p>
            <p className="text-sm font-medium text-gray-900">{mockData.wbs}</p>
          </div>
        </div>

        {/* Milestones */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Milestones</h3>
          <div className="border border-gray-200 rounded-lg p-4">
            {mockData.milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className={`${index % 2 === 0 ? "bg-gray-50" : ""} px-4 py-3 border border-gray-200 flex items-center justify-between`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {milestone.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {milestone.description}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(milestone.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 border-t border-gray-200 mt-6">
        <button
          onClick={onBackStep}
          className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Back
        </button>
        <button
          onClick={onIssuePO}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Issue Purchase Order
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-50 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Convert to Purchase Order
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Originating Request: REQ-2024-0041
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {renderStepIndicator()}
            {currentStep === 1 ? renderStep1() : renderStep2()}
          </div>
        </div>
      </div>
    </>
  );
}
