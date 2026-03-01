import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define types for requests and responses
export interface RegisterRequest {
  company_name: string;
  user: {
    email: string;
    password1: string;
    password2: string;
  };
}

export interface RegisterResponse {
  detail: string;
  tenant_url: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  refresh_token: string;
  access_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    user_image: string | null;
  };
  tenant_id: number;
  tenant_schema_name: string;
  tenant_company_name: string;
  isOnboarded: boolean;
  user_accesses: Array<{
    application: string;
    access_groups: string;
  }>;
}

export interface ForgetPasswordRequest {
  email: string;
}

export interface ForgetPasswordResponse {
  detail: string;
  role: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  detail: string;
}

export interface ResetPasswordRequest {
  email: string;
  new_password: string;
  confirm_password: string;
}

export interface ResetPasswordResponse {
  detail: string;
}

export interface VerifyEmailRequest {
  token: string;
  tenant: string;
}

export interface VerifyEmailResponse {
  detail: string;
  message?: string;
}

export interface ResendVerificationRequest {
  tenant: string;
}

export interface ResendVerificationResponse {
  detail: string;
  message?: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: "/register/",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/login/",
        method: "POST",
        body,
      }),
    }),
    forgetPassword: builder.mutation<
      ForgetPasswordResponse,
      ForgetPasswordRequest
    >({
      query: (body) => ({
        url: `${process.env.NEXT_PUBLIC_APP_API_URL}/request-forgotten-password/`,
        method: "POST",
        body,
      }),
    }),
    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (body) => ({
        url: `${process.env.NEXT_PUBLIC_APP_API_URL}/verify-otp/`,
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<
      ResetPasswordResponse,
      ResetPasswordRequest
    >({
      query: (body) => ({
        url: "/reset-password/",
        method: "POST",
        body,
      }),
    }),
    verifyEmail: builder.query<VerifyEmailResponse, VerifyEmailRequest>({
      query: ({ token, tenant }) => ({
        url: `https://${tenant}.${process.env.NEXT_PUBLIC_API_DOMAIN}/company/email-verify?token=${token}`,
        method: "GET",
      }),
    }),
    resendVerificationEmail: builder.mutation<
      ResendVerificationResponse,
      ResendVerificationRequest
    >({
      query: ({ tenant }) => ({
        url: `https://${tenant}.fastrasuiteapi.com.ng/company/resend-verification-email/`,
        method: "POST",
        body: {},
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useForgetPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useVerifyEmailQuery,
  useResendVerificationEmailMutation,
} = authApi;
