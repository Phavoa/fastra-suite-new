import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: number;
  username: string;
  email: string;
  user_image: string | null;
}

export interface UserAccess {
  application: string;
  access_groups: string;
}

export interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  tenant_id: number | null;
  tenant_schema_name: string | null;
  tenant_company_name: string | null;
  isOnboarded: boolean | null;
  user_accesses: UserAccess[];
}

const initialState: AuthState = {
  user: null,
  access_token: null,
  refresh_token: null,
  tenant_id: null,
  tenant_schema_name: null,
  tenant_company_name: null,
  isOnboarded: null,
  user_accesses: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<AuthState>) => {
      return { ...state, ...action.payload };
    },
    clearAuthData: (state) => {
      return initialState;
    },
  },
});

export const { setAuthData, clearAuthData } = authSlice.actions;
export default authSlice.reducer;
