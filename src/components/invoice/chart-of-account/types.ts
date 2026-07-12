export interface Account {
  code: string;
  name: string;
  type: "Assets" | "Liabilities" | "Equity" | "Revenue" | "Expenses";
  balance: number;
  isCategory?: boolean;
  children?: Omit<Account, "isCategory" | "children">[];
}
