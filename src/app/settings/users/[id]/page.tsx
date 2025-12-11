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
import ReadOnlyField from "@/components/Settings/ReadOnlyField";
import { LoadingDots } from "@/components/shared/LoadingComponents";

import {
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
} from "@/api/settings/usersApi";

interface CompanyRoleDetails {
  id: number;
  name: string;
}

interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  company_role: number | null;
  company_role_details?: CompanyRoleDetails | null;
  phone_number: string;
  language: string;
  timezone: string;
  in_app_notifications: boolean;
  email_notifications: boolean;
  signature_image?: File | string | null;
  user_image_image?: File | string | null;
}

export default function UsersDetails() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params?.id);
  console.log(userId)

  const tenant_company_name = useSelector(
    (state: any) => state.auth.tenant_company_name
  );

  const { data: userData, isLoading } = useGetUserByIdQuery(userId, {
    skip: !userId,
  });

  console.log(userData)
  const [updateUser] = useUpdateUserByIdMutation();

  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "access">("basic");

  const [form, setForm] = useState<UserData>({
    first_name: "",
    last_name: "",
    email: "",
    company_role: null,
    company_role_details: null,
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
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        company_role: userData.company_role || null,
        company_role_details: userData.company_role_details || null,
        phone_number: userData.phone_number || "",
        language: userData.language || "en",
        timezone: userData.timezone || "Africa/Abidjan",
        in_app_notifications: userData.in_app_notifications ?? true,
        email_notifications: userData.email_notifications ?? true,
        signature_image: userData.signature || null,
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAccessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAccessRights((prev) => ({ ...prev, [name]: value }));
  };

  const base64ToFile = (base64: string, fileName: string) => {
  if (!base64.startsWith("data:")) {
    console.warn("Invalid base64 string provided:", base64);
    return null;
  }

  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], fileName, { type: mime });
};


  const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editMode) return;

  try {
    // Use FormData to send files
    const formData = new FormData();

    // Append normal fields
    formData.append("first_name", form.first_name);
    formData.append("last_name", form.last_name);
    formData.append("email", form.email);
    if (form.company_role !== null) formData.append("company_role", String(form.company_role));
    formData.append("phone_number", form.phone_number);
    formData.append("language", form.language);
    formData.append("timezone", form.timezone);
    formData.append("in_app_notifications", String(form.in_app_notifications));
    formData.append("email_notifications", String(form.email_notifications));

    // Append files if they exist
    if (form.signature_image instanceof File) {
      formData.append("signature_image", form.signature_image);
    }
    if (form.user_image_image instanceof File) {
      formData.append("user_image_image", form.user_image_image);
    }

    // Append access code

    for (const [key, value] of formData.entries()) {
  console.log(key, value);
}

    await updateUser({ id: userId, data: formData }).unwrap();

    if (Object.values(accessRights).some(Boolean)) {
      // TODO: replace this console.log with actual API call
      console.log("Access rights to update:", accessRights);
    }

    alert("User updated successfully!");
    setEditMode(false);
  } catch (err: any) {
    console.error(err);
    if (err?.data) {
      alert(JSON.stringify(err.data, null, 2));
    } else {
      alert("Failed to update user");
    }
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

  if (isLoading) return <LoadingDots />;

  // ----------------- Render -----------------
  return (
    <div className="pb-6 w-full mx-auto mw-full rounded-xs bg-white">
      {/* Top bar */}
      <div className="flex px-6 justify-between border-b py-4 border-[#E2E6E9]">
        <div className="flex px-6 items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 text-2xl text-[#717171] hover:underline"
          >
            &larr;
          </button>
          <h1 className="text-xl text-[#1A1A1A] font-normal">User Details</h1>
        </div>
        <button
          className="text-[#3B7CED]"
          onClick={() => setEditMode((prev) => !prev)}
        >
          {editMode ? "Back to View" : "Edit"}
        </button>
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
        <Form>
          {/* Basic Information Section */}
          <FormSection title="Basic Information" className="pt-10">
            <div className="flex items-center w-full gap-4 mt-6">
              {editMode ? (
                  <FormImageUpload
      label="User Image"
      image={
        form.user_image_image instanceof File
          ? URL.createObjectURL(form.user_image_image)
          : form.user_image_image
          ? `data:image/png;base64,${form.user_image_image}`
          : null
      }
      textToDisplay="Upload User Photo"
      onChange={(file) => handleFileChange("user_image_image", file)}
    />
  ) : (
    <img
      src={
        form.user_image_image instanceof File
          ? URL.createObjectURL(form.user_image_image)
          : form.user_image_image
          ? `data:image/png;base64,${form.user_image_image}`
          : "/images/userAvatar.png"
      }
      className="w-20 h-20 rounded-full"
      alt="User"
    />)}
              <div className="border-l border-[#E6E6E6] py-2 pl-10 ml-6 grid grid-cols-2 gap-8 w-[60%]">
                {editMode ? (
                  <>
                    <FormInput
                      label="First Name"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      placeholder="Enter First Name"
                      required
                    />
                    <FormInput
                      label="Last Name"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      placeholder="Enter Last Name"
                      required
                    />
                  </>
                ) : (
                  <div className="border-r border-[#E6E6E6]">
                    <ReadOnlyField
                    label="Name"
                    value={`${form.first_name} ${form.last_name}`.trim() || "—"}
                  />
                  </div>
                )}

                {editMode ? (
                  <NewUserRoleSelect
                    value={form.company_role ?? 0}
                    onChange={(val) =>
                      setForm((prev) => ({ ...prev, company_role: val }))
                    }
                  />
                ) : (
                  <ReadOnlyField label="Role" value={form.company_role_details?.name} />
                )}
              </div>
            </div>
          </FormSection>

          {/* Contact Info */}
          <FormSection title="Contact Information">
            <div className={`grid ${editMode ? 'grid-cols-3' : "grid-cols-6"} gap-4 mt-4`}>
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
                 <div className="border-r border-[#E6E6E6]">
                <ReadOnlyField label="Phone Number" value={form.phone_number} />
                </div>
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
               <div className="ml-6">
                 <ReadOnlyField label="Email" value={form.email} />
                 </div>
              )}
            </div>
          </FormSection>

          {/* Companies */}
          <FormSection title="Companies">
            <div className="flex items-center gap-4 border border-[#A9B3BC] mt-6 p-4 px-8 rounded-xs w-fit">
              <div className="w-15 h-15 flex items-center justify-center bg-[#E8EFFD] rounded-full">
                <GridCardIcon className="w-4 h-4 text-[#3B7CED]" />
              </div>
              <div>
                <h4 className="text-[#1a1a1a]">Company name</h4>
                <p className="text-[#8C9AA6] text-base">
                  {tenant_company_name || "No Company Available"}
                </p>
              </div>
            </div>
          </FormSection>

          {/* Preferences */}
          <FormSection title="Preferences">
            <div className={`grid ${editMode ? 'grid-cols-3' : "grid-cols-6"} gap-4 mt-4`}>
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
                 <div className="border-r border-[#E6E6E6]">
                <ReadOnlyField label="Language" value={form.language} />
                </div>
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
                <div className="ml-6">
                  <ReadOnlyField label="Timezone" value={form.timezone} />
                </div>
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
                  className="flex items-center gap-3 w-full justify-between"
                >
                  {editMode ? (
                    <>
                      <label htmlFor={key} className="text-sm text-[#7A8A98] cursor-pointer">
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
                    <div className="flex items-center gap-3">
                      <label className=" text-[#7A8A98]">
                        {key === "in_app_notifications"
                          ? "In-app Notifications"
                          : "Email Notifications"}
                      </label>

                      <Checkbox
                        checked={Boolean(form[key as keyof UserData])} 
                        disabled 
                      />
                    </div>
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
    // Ignore empty signatures
    if (!base64) {
      setForm((prev) => ({ ...prev, signature_image: null }));
      return;
    }

    // If base64 does not include the data URL prefix, add it
    let normalized = base64;
    if (!base64.startsWith("data:")) {
          normalized = `data:image/png;base64,${base64}`;
    }

    const file = base64ToFile(normalized, "signature.png");

    setForm((prev) => ({
      ...prev,
      signature_image: file,
    }));
  }}
/>


            ) : (
              <img
                src={
                    form.signature_image
                      ? `data:image/png;base64,${form.signature_image}`
                      : "/images/signature-placeholder.png"
                  }
                alt="Signature"
                className="h-20"
              />
            )}
          </FormSection>

          {/* Footer Buttons */}
          {editMode && activeTab === "basic" && (
            <div className="mt-6 flex justify-end gap-4 px-6">
              <button
                type="button"
                onClick={() => setActiveTab("access")}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          )}
        </Form>
      )}

      {/* Access Rights Tab */}
      {activeTab === "access" && (
  <Form onSubmit={handleSave}>
    <FormSection title="Applications">

      {/* GRID WRAPPER — outside the map */}
     <div className={editMode ? "grid grid-cols-3 gap-5 pt-6" : "grid grid-cols-4 gap-5 pt-6"}>

  {Object.entries(accessRights).map(([key, value]) => (
    <div
      key={key}
      className={!editMode ? "border-r border-gray-300 pr-4" : ""}
    >
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
        <ReadOnlyField
          label={key.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          value={
            accessOptions.find((opt) => opt.value === value)?.label || "—"
          }
          className="text-[#3B7CED]"
        />
      )}
    </div>
  ))}
</div>


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
