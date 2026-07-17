export interface Milestone {
  id?: number;
  name: string;
  percentage: string;
  completion_criteria: string;
  is_completed: boolean;
  amount?: string;
  is_paid?: boolean;
  subcontractor_request?: number;
}

export type SubcontractorRequestStatus = 
  | "draft" 
  | "submitted" 
  | "clarification_needed" 
  | "approved" 
  | "in_progress" 
  | "completed" 
  | "rejected";

export interface SubcontractorRequest {
  id: number;
  reference_id: string;
  status: SubcontractorRequestStatus;
  milestones: Milestone[];
  vendor_name: string;
  vendor_email: string;
  vendor_phone: string;
  scope_of_work: string;
  payment_type: "lump_sum" | "milestone";
  contract_value: string;
  payment_terms: string;
  start_date: string;
  end_date: string;
  justification_notes: string;
  created_at: string;
  project_request: number;
  vendor: number;
  created_by?: number;
  created_by_name?: string;
  requester?: string;
}

export interface CreateSubcontractorRequest {
  vendor: number;
  vendor_name: string;
  vendor_email: string;
  vendor_phone: string;
  scope_of_work: string;
  payment_type: string;
  contract_value: string;
  payment_terms: string;
  start_date: string;
  end_date: string;
  justification_notes: string;
  milestones: Omit<Milestone, "id" | "amount" | "is_paid" | "subcontractor_request">[];
}

export interface GetSubcontractorRequestsParams {
  ordering?: string;
  search?: string;
}
