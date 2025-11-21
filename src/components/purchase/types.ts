// Shared types for purchase components
export type Status = "approved" | "pending" | "rejected" | "draft";

export type RequestRow = {
  id: string;
  product: string;
  quantity: number;
  amount: string;
  requester: string;
  status: Status;
};
