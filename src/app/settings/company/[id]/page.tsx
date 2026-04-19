"use client";

import React, { useState, useEffect } from "react";
import {
  useGetCompanyQuery,
  useUpdateCompanyMutation,
} from "@/api/settings/companyApi";
import { FaPlusCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";

import Form from "@/components/Settings/form/form";
import FormSection from "@/components/Settings/form/FormSection";
import FormInput from "@/components/Settings/form/FormInput";
import FormImageUpload from "@/components/Settings/form/FormImageUpload";
import FormSubmitButton from "@/components/Settings/form/FormSubmitButton";
import FormSelect from "@/components/Settings/form/FormSelect";
// import { industries } from "@teclone/industries";
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
import { useSelector } from "react-redux";
import ISO6391 from "iso-639-1";
import { LoadingDots } from "@/components/shared/LoadingComponents";

export default function CompanyDetails() {
  const { data, isLoading } = useGetCompanyQuery();
  const [updateCompany] = useUpdateCompanyMutation();
  const user = useSelector((state: any) => state.auth.user);
  const tenant_company_name = useSelector(
    (state: any) => state.auth.tenant_company_name,
  );
  const router = useRouter();

  const [form, setForm] = useState({
    phone: "",
    street_address: "",
    city: "",
    state: "",
    country: "",
    registration_number: "",
    tax_id: "",
    industry: "",
    language: "en",
    company_size: "",
    website: "",
    roles: [] as string[],
    logoPreview: null as string | null,
    logoFile: null as File | null,
  });

  useEffect(() => {
    if (data) {
      setForm({
        phone: data.phone ?? "",
        street_address: data.street_address ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
        country: data.country ?? "",
        registration_number: data.registration_number ?? "",
        tax_id: data.tax_id ?? "",
        industry: data.industry ?? "",
        language: data.language ?? "en",
        company_size: data.company_size ?? "",
        website: data.website ?? "",
        roles: data.roles?.map((r: any) => r.name) ?? [""], // convert objects to string names
        logoPreview: data.logo ? data.logo : null,
        logoFile: null,
      });
    }
  }, [data]);

  const handleInput = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Strip the prefix (e.g., "data:image/jpeg;base64,")
        const rawBase64 = base64String.split(",")[1];
        setForm({
          ...form,
          logoFile: file,
          logoPreview: rawBase64,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setForm({
        ...form,
        logoFile: null,
        logoPreview: null,
      });
    }
  };

  const handleRoleChange = (index: number, value: string) => {
    const newRoles = [...form.roles];
    newRoles[index] = value;
    setForm({ ...form, roles: newRoles });
  };

  const addRole = () => {
    setForm({ ...form, roles: [...form.roles, ""] });
  };

  const languageOptions = [{ label: "English", value: "en" }];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fd = new FormData();

    // Append only the fields the backend expects:
    fd.append("phone", form.phone);
    fd.append("street_address", form.street_address);
    fd.append("city", form.city);
    fd.append("state", form.state);
    fd.append("country", form.country);
    fd.append("registration_number", form.registration_number);
    fd.append("tax_id", form.tax_id);
    fd.append("industry", form.industry);
    fd.append("language", form.language);
    fd.append("company_size", form.company_size);
    fd.append("website", form.website);

    // roles must be JSON
    const cleanedRoles = form.roles.filter((r) => r.trim() !== "");
    fd.append("roles", JSON.stringify(cleanedRoles.map((r) => ({ name: r }))));

    // image if changed
    if (form.logoFile && form.logoPreview) {
      fd.append("logo_image", form.logoPreview);
    }

    for (let pair of fd.entries()) {
      console.log(pair[0], pair[1]); // verify what's being sent
    }

    await updateCompany(fd).unwrap();

    router.push("/settings");
  };

  if (isLoading)
    return (
      <div className="p-6 flex justify-center items-center">
        <LoadingDots count={3} /> {/* animated loader */}
      </div>
    );

  const industryOptions = INDUSTRIES.map((item) => ({
    label: item,
    value: item,
  }));

  const handleSelect = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      <Form onSubmit={handleSubmit}>
      {/* Basic Info */}
      <FormSection title="Basic Information">
        <div className="flex items-center gap-8">
          <FormImageUpload
            label="Logo"
            image={form.logoPreview}
            onChange={handleImageChange}
            textToDisplay="Click to Update Company Logo"
          />
          {/* Tenant Company Name & Email */}
          <div className="flex flex-col justify-center">
            <p className="text-[#1A1A1A] text-base">Comapany Name</p>
            <p className="font-normal text-lg text-[#8C9AA6]">
              {tenant_company_name}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="flex flex-col justify-center">
            <p className="text-[#1A1A1A] text-base">Company Name</p>
            <input
              name="company Name"
              placeholder="Enter your company name"
              type="text"
              className="border border-[#7A8A98] p-2 text-sm"
            />
          </div>
        </div>
      </FormSection>

      {/* Address */}
      <FormSection title="Contact Information">
        <div className="w-full">
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div className="flex flex-col justify-center">
              <FormInput
                label="Email"
                name="email"
                value={user.email}
                placeholder="Enter your email"
                onChange={handleInput}
              />
            </div>
            <FormInput
              label="Phone Number"
              name="phone"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={handleInput}
            />
            <FormInput
              label="Website"
              name="website"
              placeholder="Enter your company website here"
              value={form.website}
              onChange={handleInput}
            />
          </div>
          <div className="mt-6">
            <h3 className="text-[#1A1A1A] font-semibold text-base">Address</h3>
            <div className="grid grid-cols-3 gap-4 mt-3">
              <FormInput
                label="Street & Number"
                placeholder="Enter your street & number"
                name="street_address"
                value={form.street_address}
                onChange={handleInput}
              />
              <FormInput
                label="City"
                name="city"
                placeholder="Enter your city"
                value={form.city}
                onChange={handleInput}
              />
              <FormInput
                label="State"
                name="state"
                placeholder="Enter your state"
                value={form.state}
                onChange={handleInput}
              />
              <FormInput
                label="Country"
                name="country"
                placeholder="Enter your country"
                value={form.country}
                onChange={handleInput}
              />
            </div>
          </div>
        </div>
      </FormSection>

      {/* Registration Info */}
      <FormSection title="Company Registration Info">
        <div className="grid grid-cols-3 gap-4 mt-4">
          <FormInput
            label="Registration Number"
            name="registration_number"
            placeholder="Enter your company registration number"
            value={form.registration_number}
            onChange={handleInput}
          />
          <FormInput
            label="Tax ID"
            name="tax_id"
            value={form.tax_id}
            placeholder="Enter your company Tax Identification Number"
            onChange={handleInput}
          />
        </div>
      </FormSection>

      {/* Other Info */}
      <FormSection title="Other Information">
        <div className="grid grid-cols-3 gap-4 mt-4">
          <FormSelect
            label="Industry"
            name="industry"
            placeholder="Select your company Industry"
            value={form.industry}
            options={industryOptions}
            onChange={(e) => handleSelect("industry", e.target.value)}
          />
          <FormSelect
            label="Language"
            name="language"
            value={form.language}
            placeholder="Select your language"
            options={languageOptions}
            onChange={(e) => handleSelect("language", e.target.value)}
          />
          <FormInput
            label="Company Size"
            name="company_size"
            value={form.company_size}
            onChange={handleInput}
          />
        </div>
      </FormSection>

      <FormSection title="Roles Set-up">
        <div className="grid grid-cols-5 gap-4 mt-4 items-end">
          {form.roles.map((role, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <FormInput
                label="Role"
                name={`role-${idx}`}
                value={role}
                onChange={(e) => handleRoleChange(idx, e.target.value)}
                className="flex-1"
              />
              {form.roles.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const newRoles = [...form.roles];
                    newRoles.splice(idx, 1);
                    setForm({ ...form, roles: newRoles });
                  }}
                  className="w-5 h-5 shrink-0 flex items-center justify-center bg-red-500 text-white rounded-full text-xs font-bold mt-6"
                >
                  -
                </button>
              )}
            </div>
          ))}

          <div className="flex items-center h-full pb-1">
            <button
              type="button"
              onClick={addRole}
              className="flex items-center gap-2 text-[#7A8A98] text-sm hover:text-[#3B7CED] transition-colors"
            >
              <FaPlusCircle className="w-5 h-5" />
              Add more role
            </button>
          </div>
        </div>
      </FormSection>

      <div className="w-full flex justify-end py-6 px-6">
        <FormSubmitButton label="Save Changes" />
      </div>
      </Form>
    </div>
  );
}
