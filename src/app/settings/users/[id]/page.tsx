"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import moment from "moment-timezone";
import ISO6391 from "iso-639-1";

import Form from "@/components/Settings/form/form";
import FormSection from "@/components/Settings/form/FormSection";
import FormInput from "@/components/Settings/form/FormInput";
import FormSubmitButton from "@/components/Settings/form/FormSubmitButton";
import FormImageUpload from "@/components/Settings/form/FormImageUpload";
import FormSelect from "@/components/Settings/form/FormSelect";
import SignaturePad from "@/components/Settings/form/SignaturePad";
import { Checkbox } from "@/components/ui/checkbox";
import { GridCardIcon } from "@/components/icons/gridCardIcon";
import NewUserRoleSelect from "@/components/Settings/form/formRoleSelect";

import {
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
} from "@/api/settings/usersApi";

interface UserData {
  name: string;
  email: string;
  company_role: number | null;
  phone_number: string;
  language: string;
  timezone: string;
  in_app_notifications: boolean;
  email_notifications: boolean;
  signature_image: File | null;
  user_image_image: File | string | null;
}

export default function UsersDetails() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params?.id);

  const tenant_company_name = useSelector(
    (state: any) => state.auth.tenant_company_name
  );

  const { data: userData, isLoading } = useGetUserByIdQuery(userId, {
    skip: !userId,
  });
  const [updateUser] = useUpdateUserByIdMutation();

  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "access">("basic");

  const [form, setForm] = useState<UserData>({
    name: "",
    email: "",
    company_role: null,
    phone_number: "",
    language: "en",
    timezone: "Africa/Abidjan",
    in_app_notifications: true,
    email_notifications: true,
    signature_image: null,
    user_image_image: null,
  });

  const [accessRights, setAccessRights] = useState<Record<string, string>>({});

  // ----------------- Load user data into state -----------------
  useEffect(() => {
    if (userData) {
      setForm({
        name: userData.name || "",
        email: userData.email || "",
        company_role: userData.company_role || null,
        phone_number: userData.phone_number || "",
        language: userData.language || "en",
        timezone: userData.timezone || "Africa/Abidjan",
        in_app_notifications: userData.in_app_notifications ?? true,
        email_notifications: userData.email_notifications ?? true,
        signature_image: null,
        user_image_image: userData.user_image || null,
      });

      const rights = (userData as any).access_rights || {};
      setAccessRights({
        purchase_request: rights.purchase_request || "",
        inventory: rights.inventory || "",
        sales: rights.sales || "",
        human_resources: rights.human_resources || "",
        accounting: rights.accounting || "",
      });
    }
  }, [userData]);

  // ----------------- Handlers -----------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  const handleFileChange = (name: "signature_image" | "user_image_image", file: File | null) => {
    setForm((prev) => ({ ...prev, [name]: file }));
  };

  const base64ToFile = (base64: string, filename: string) => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleAccessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAccessRights((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMode) return;

    try {
      const payload: any = { ...form };
      if (form.signature_image instanceof File) {
        payload.signature_image = form.signature_image;
      }
      if (form.user_image_image instanceof File) {
        payload.user_image_image = form.user_image_image;
      }
      payload.access_rights = accessRights;

      await updateUser({ id: userId, data: payload }).unwrap();
      alert("User updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update user");
    }
  };

  // ----------------- Options -----------------
  const languageOptions = ISO6391.getAllCodes().map((code) => ({
    label: ISO6391.getName(code),
    value: code,
  }));

  const timezoneOptions = moment.tz.names().map((tz) => ({
    label: tz,
    value: tz,
  }));

  const accessOptions = [
    { label: "No Access", value: "" },
    { label: "Read Only", value: "read" },
    { label: "Read/Write", value: "write" },
  ];

  if (isLoading) return <p>Loading user details...</p>;

  // ----------------- Render -----------------
  return (
    <div className="pb-6 w-full mx-auto max-w-6xl rounded-xs bg-white">
      {/* Top bar */}
      <div className="flex px-6 items-center border-b py-4 border-[#E2E6E9] justify-between">
        <button
          onClick={() => router.back()}
          className="mr-4 text-2xl text-[#717171] hover:underline"
        >
          &larr;
        </button>
        <h1 className="text-xl text-[#1A1A1A] font-normal">User Details</h1>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-6 items-center">
        <button
          className={`px-4 py-4 -mb-px font-medium ${
            activeTab === "basic"
              ? "border-b-2 border-blue-600 text-[#3B7CED]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("basic")}
        >
          Basic Settings
        </button>
        <button
          className={`px-4 py-2 -mb-px font-medium ${
            activeTab === "access"
              ? "border-b-2 border-blue-600 text-[#3B7CED]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("access")}
        >
          Access Rights
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "basic" && (
        <Form onSubmit={handleSave}>
          <FormSection title="Basic Information" className="pt-10">
            <div className="flex items-center w-full gap-4">
              {editMode ? (
                <FormImageUpload
                  label="User Image"
                  image={
                    form.user_image_image instanceof File
                      ? URL.createObjectURL(form.user_image_image)
                      : (form.user_image_image as string | null)
                  }
                  textToDisplay="Upload User Photo"
                  onChange={(file) => handleFileChange("user_image_image", file)}
                />
              ) : (
                <img
                  src={
                    form.user_image_image instanceof File
                      ? URL.createObjectURL(form.user_image_image)
                      : (form.user_image_image as string) || "/images/userAvatar.png"
                  }
                  className="w-20 h-20 rounded-full"
                  alt="User"
                />
              )}

              <div className="border-l border-[#E6E6E6] py-6 pl-10 ml-6 grid grid-cols-2 gap-8 w-[60%]">
                {editMode ? (
                  <FormInput
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter Name"
                    required
                  />
                ) : (
                  <p className="text-[#1A1A1A]">{form.name}</p>
                )}

                {editMode ? (
                  <NewUserRoleSelect
                    value={form.company_role ?? 0}
                    onChange={(val) =>
                      setForm((prev) => ({ ...prev, company_role: val }))
                    }
                  />
                ) : (
                  <p className="text-[#1A1A1A]">Role: {form.company_role}</p>
                )}
              </div>
            </div>
          </FormSection>

          {/* Contact Info */}
          <FormSection title="Contact Information">
            <div className="grid grid-cols-3 gap-6 mt-4">
              {editMode ? (
                <FormInput
                  label="Phone Number"
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              ) : (
                <p>Phone: {form.phone_number}</p>
              )}

              {editMode ? (
                <FormInput
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  type="email"
                  required
                />
              ) : (
                <p>Email: {form.email}</p>
              )}
            </div>
          </FormSection>

          {/* Company */}
          <FormSection title="Companies">
            <div className="flex items-center gap-4 border border-[#A9B3BC] mt-6 p-4 rounded-xs w-fit">
              <div className="w-15 h-15 flex items-center justify-center bg-[#E8EFFD] rounded-full">
                <GridCardIcon className="w-2 h-2 text-[#3B7CED]" />
              </div>
              <div>
                <h4 className="text-[#1a1a1a]">Company Name</h4>
                <p className="text-[#8C9AA6] font-medium text-base">
                  {tenant_company_name || "No Company Available"}
                </p>
              </div>
            </div>
          </FormSection>

          {/* Preferences */}
          <FormSection title="Preferences">
            <div className="grid grid-cols-2 gap-6">
              {editMode ? (
                <FormSelect
                  label="Language"
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                  placeholder="Select language"
                  options={languageOptions}
                />
              ) : (
                <p>Language: {form.language}</p>
              )}

              {editMode ? (
                <FormSelect
                  label="Timezone"
                  name="timezone"
                  value={form.timezone}
                  onChange={handleChange}
                  placeholder="Select timezone"
                  options={timezoneOptions}
                />
              ) : (
                <p>Timezone: {form.timezone}</p>
              )}
            </div>

            {/* Notification Preferences */}
            <div className="mt-6 flex flex-col gap-4">
              <label className="font-medium text-sm text-[#1A1A1A]">
                Notification Preferences
              </label>

              {["in_app_notifications", "email_notifications"].map((key) => (
                <div
                  key={key}
                  className="flex items-center gap-3 w-[13%] justify-between"
                >
                  {editMode ? (
                    <>
                      <label htmlFor={key} className="text-sm text-[#4A4A4A] cursor-pointer">
                        {key === "in_app_notifications"
                          ? "In-app Notifications"
                          : "Email Notifications"}
                      </label>
                      <Checkbox
                        checked={Boolean(form[key as keyof UserData])}
                        onCheckedChange={(checked) =>
                          setForm((prev) => ({
                            ...prev,
                            [key]: Boolean(checked),
                          }))
                        }
                        id={key}
                      />
                    </>
                  ) : (
                    <p>
                      {key === "in_app_notifications"
                        ? "In-app Notifications: "
                        : "Email Notifications: "}
                      {form[key as keyof UserData] ? "Yes" : "No"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </FormSection>

          {/* Signature */}
          <FormSection title="Signature">
            {editMode ? (
              <SignaturePad
                onChange={(base64) => {
                  if (base64) {
                    const file = base64ToFile(base64, "signature.png");
                    setForm((prev) => ({ ...prev, signature_image: file }));
                  } else {
                    setForm((prev) => ({ ...prev, signature_image: null }));
                  }
                }}
              />
            ) : (
              <img
                src={
                  form.signature_image instanceof File
                    ? URL.createObjectURL(form.signature_image)
                    : "/images/signature-placeholder.png"
                }
                alt="Signature"
                className="h-20"
              />
            )}
          </FormSection>

          {/* Footer Buttons */}
          {editMode && (
            <div className="mt-6 flex justify-end gap-4 px-6">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          )}
        </Form>
      )}

      {/* Access Rights Tab */}
      {activeTab === "access" && (
        <Form onSubmit={handleSave}>
          <FormSection title="Applications">
            {Object.entries(accessRights).map(([key, value]) => (
              <div className="grid grid-cols-3 gap-5 pt-6" key={key}>
                {editMode ? (
                  <FormSelect
                    label={key.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    name={key}
                    value={value}
                    onChange={handleAccessChange}
                    placeholder="Select An Access Group"
                    options={accessOptions}
                  />
                ) : (
                  <p>
                    {key.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}:{" "}
                    {value || "—"}
                  </p>
                )}
              </div>
            ))}
          </FormSection>

          {editMode && (
            <div className="mt-6 flex justify-end gap-4 px-6">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          )}
        </Form>
      )}
    </div>
  );
}
