"use client";

import React, { useState, useEffect } from "react";
import { useGetCompanyQuery } from "@/api/settings/companyApi";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { LoadingDots } from "@/components/shared/LoadingComponents";
import { PageGuard } from "@/components/auth/PageGuard";
import { PermissionGuard } from "@/components/ProtectedComponent";
import ReadOnlyField from "@/components/Settings/ReadOnlyField";

import FormSection from "@/components/Settings/form/FormSection";

const INDUSTRIES = [
  "Agriculture",
  "Construction",
  "Education",
  "Energy & Utilities",
  "Financial Services",
  "FMCG (Fast-Moving Consumer Goods)",
  "Healthcare",
  "Hospitality & Tourism",
  "Information Technology",
  "Manufacturing",
  "Media & Entertainment",
  "Oil & Gas",
  "Professional Services",
  "Real Estate",
  "Retail",
  "Telecommunications",
  "Transportation & Logistics",
];

export default function CompanyDetails() {
  const { data, isLoading } = useGetCompanyQuery();
  const user = useSelector((state: any) => state.auth.user);
  const tenant_company_name = useSelector(
    (state: any) => state.auth.tenant_company_name,
  );
  const router = useRouter();

  useEffect(() => {
    // no form state needed for read-only view
  }, [data]);

  if (isLoading)
    return (
      <div className="p-6 flex justify-center items-center">
        <LoadingDots count={3} />
      </div>
    );

  if (!data) return <p className="p-6">No company data available</p>;

  const phoneValue = data.phone || "—";
  const emailValue = user.email || "—";
  const websiteValue = data.website || "—";

  return (
    <PageGuard application="settings" module="company" action="view">
      <div className="pb-6 w-full mx-auto rounded-xs bg-white">
        <div className="flex px-4 justify-between border-b py-4 border-[#E2E6E9]">
          <div className="flex  items-center">
            {/* <button
              onClick={() => router.back()}
              className="mr-4 text-2xl text-[#717171] hover:underline"
            >
              &larr;
            </button> */}
            <h1 className="text-xl text-[#1A1A1A] font-normal">
              Company Details
            </h1>
          </div>
          <PermissionGuard
            application="settings"
            module="company"
            action="edit"
          >
            <button
              className="bg-[#3B7CED] text-white py-2 px-4 rounded-md"
              onClick={() => router.push("/settings/company/updatecompany/")}
            >
              Update
            </button>
          </PermissionGuard>
        </div>

        <FormSection title="Basic Information" className="pt-10">
          <div className="flex flex-col md:items-center md:flex-row gap-4 mt-6">
            {data.logo ? (
              <img
                src={
                  data.logo.startsWith("data:") ||
                  data.logo.startsWith("http") ||
                  data.logo.startsWith("blob:")
                    ? data.logo
                    : `data:image/jpeg;base64,${data.logo}`
                }
                alt="Company Logo"
                className="w-24 h-24 rounded-full object-cover bg-[#E8EFFD]"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#E8EFFD] flex items-center justify-center">
                <span className="text-3xl text-[#3B7CED] font-bold">
                  {tenant_company_name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
            )}
            <ReadOnlyField
              label="Company Name"
              value={tenant_company_name || "—"}
            />
          </div>
        </FormSection>

        <FormSection title="Contact Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <ReadOnlyField label="Email" value={emailValue} />
            <ReadOnlyField label="Phone Number" value={phoneValue} />
            <ReadOnlyField label="Website" value={websiteValue} />
          </div>
          <div className="mt-6">
            <h3 className="text-[#1A1A1A] font-semibold text-base">Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
              <ReadOnlyField
                label="Street & Number"
                value={data.street_address || "—"}
              />
              <ReadOnlyField label="City" value={data.city || "—"} />
              <ReadOnlyField label="State" value={data.state || "—"} />
              <ReadOnlyField label="Country" value={data.country || "—"} />
            </div>
          </div>
        </FormSection>

        <FormSection title="Company Registration Info">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <ReadOnlyField
              label="Registration Number"
              value={data.registration_number || "—"}
            />
            <ReadOnlyField label="Tax ID" value={data.tax_id || "—"} />
          </div>
        </FormSection>

        <FormSection title="Other Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <ReadOnlyField label="Industry" value={data.industry || "—"} />
            <ReadOnlyField
              label="Language"
              value={data.language === "en" ? "English" : data.language || "—"}
            />
            <ReadOnlyField
              label="Company Size"
              value={data.company_size || "—"}
            />
          </div>
        </FormSection>

        {data.roles && data.roles.length > 0 && (
          <FormSection title="Roles Set-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {data.roles.map((role: { id: number; name: string }) => (
                <ReadOnlyField key={role.id} label="Role" value={role.name} />
              ))}
            </div>
          </FormSection>
        )}
      </div>
    </PageGuard>
  );
}
