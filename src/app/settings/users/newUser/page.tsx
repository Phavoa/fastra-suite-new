"use client";

import React, { useState } from "react";
import Form from "@/components/Settings/form/form";
import FormSection from "@/components/Settings/form/FormSection";
import FormInput from "@/components/Settings/form/FormInput";
import FormSubmitButton from "@/components/Settings/form/FormSubmitButton";
import FormImageUpload from "@/components/Settings/form/FormImageUpload";
import { useCreateUserMutation } from "@/api/settings/usersApi";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { GridCardIcon } from "@/components/icons/gridCardIcon";
import ISO6391 from "iso-639-1";
import moment from "moment-timezone";
import FormSelect from "@/components/Settings/form/FormSelect";
import { Checkbox } from "@/components/ui/checkbox";
import SignaturePad from "@/components/Settings/form/SignaturePad";
import NewUserRoleSelect from "@/components/Settings/form/formRoleSelect";

interface UserData {
  name: string;
  email: string;
  company_role: number;
  phone_number: string;
  language: string;
  timezone: string;
  in_app_notifications: boolean;
  email_notifications: boolean;
  access_codes: string[];
  signature_image: string | null;
  user_image_image: File | null;
}



export default function NewUser() {
  const [form, setForm] = useState<UserData>({
    name: "",
    email: "",
    company_role: 0,
    phone_number: "",
    language: "en",
    timezone: "Africa/Abidjan",
    in_app_notifications: true,
    email_notifications: true,
    access_codes: [] as string[],
    signature_image: "",
    user_image_image: null as File | null,
  });

  const [activeTab, setActiveTab] = useState<"basic" | "access">("basic");
  const tenant_company_name = useSelector((state:any) => state.auth.tenant_company_name)

  const [createUser, { isLoading }] = useCreateUserMutation();
  const router = useRouter();

  const handleFileChange = (
  name: "signature_image" | "user_image_image",
  file: File | null
) => {
  if (name === "user_image_image") {
    // expects File | null
    setForm(prev => ({ ...prev, user_image_image: file }));
  }

  if (name === "signature_image" && file) {
    // signature needs base64 string
    const reader = new FileReader();
    reader.onload = () => {
      setForm(prev => ({ ...prev, signature_image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }
};


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, type } = e.target;

    const value =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
        ? Number((e.target as HTMLInputElement).value)
        : (e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = error => reject(error);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: any = { ...form };

      if (form.user_image_image) {
        payload.user_image_image = await fileToBase64(form.user_image_image);
      }

      await createUser(payload).unwrap();
      router.push("/settings/users");
    } catch (err) {
      console.error(err);
      alert("Failed to create user");
    }
  };


    const languageOptions = ISO6391.getAllCodes().map((code) => ({
        label: ISO6391.getName(code),
        value: code,
        }));


// Timezone options
const timezoneOptions = moment.tz.names().map((tz) => ({
  label: tz,
  value: tz,
}));

  return (
    <div className="pb-6  w-full mx-auto mw-full rounded-xs bg-white">
      {/* Top bar */}
      <div className="flex px-6 items-center border-b py-4 border-[#E2E6E9] ">
        <button
          onClick={() => router.back()}
          className="mr-4 text-2xl text-[#717171] hover:underline"
        >
          &larr;
        </button>
        <h1 className="text-xl text-[#1A1A1A] font-normal">Create User</h1>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 mb-6 px-6 items-center">
        <button
          className={`px-4 py-4 -mb-px font-medium  ${
            activeTab === "basic" ? "border-b-2 border-blue-600 text-[#3B7CED]" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("basic")}
        >
          Basic Settings
        </button>
        <button
          className={`px-4 py-2 -mb-px font-medium ${
            activeTab === "access" ? "border-b-2 border-blue-600 text-[#3B7CED]" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("access")}
        >
          Access Rights
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "basic" && (
        <Form onSubmit={handleSubmit}>
          <FormSection title="Basic Information" className="pt-10">
            <div className="flex items-center w-full gap-4">
              <FormImageUpload
                label="User Image"
                image={form.user_image_image ? URL.createObjectURL(form.user_image_image) : null}
                textToDisplay="Upload User Photo"
                onChange={(file) => handleFileChange("user_image_image", file)}
              />

              <div className="border-l border-[#E6E6E6] py-6 pl-10 ml-6 grid grid-cols-2 gap-8 w-[60%]">
                <FormInput
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your Name here"
                  required
                />
                {/* Company Role Select */}
                <NewUserRoleSelect
                    value={form.company_role}
                    onChange={(val) => setForm((prev) => ({ ...prev, company_role: val }))}
                />
              </div>
            </div>
          </FormSection>
        <FormSection title="Contact Information">
            <div className="grid grid-cols-3 gap-6 mt-4">
                <FormInput
                label="Phone Number"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
                />

                <FormInput
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email address"
                type="email"
                required
                />
            </div>
        </FormSection>

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

         <FormSection title="Preferences">
            <div className="grid grid-cols-2 gap-6">
                {/* Language */}
                <FormSelect
                label="Language"
                name="language"
                value={form.language}
                onChange={handleChange}
                placeholder="Select language"
                options={languageOptions}
                />

                {/* Timezone */}
                <FormSelect
                label="Timezone"
                name="timezone"
                value={form.timezone}
                onChange={handleChange}
                placeholder="Select timezone"
                options={timezoneOptions}
                />
            </div>

            {/* Notification Preferences */}
            <div className="mt-6 flex flex-col gap-4">
                <label className="font-medium text-sm text-[#1A1A1A]">Notification Preferences</label>

                <div className="flex items-center gap-3 w-[13%] justify-between">
                <label htmlFor="in-app" className="text-sm text-[#4A4A4A] cursor-pointer">
                    In-app Notifications
                </label>
                <Checkbox
                    checked={form.in_app_notifications}
                    onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, in_app_notifications: Boolean(checked) }))
                    }
                    id="in-app"
                />
                </div>

                <div className="flex items-center gap-3 w-[13%] justify-between">
                <label htmlFor="email-notif" className="text-sm text-[#4A4A4A] cursor-pointer">
                Email Notifications
                </label>
                <Checkbox
                    checked={form.email_notifications}
                    onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, email_notifications: Boolean(checked) }))
                    }
                    id="email-notif"
                />
                </div>
            </div>
        </FormSection>

        <FormSection title="Signature">
            <SignaturePad
                onChange={(base64) =>
                setForm((prev) => ({ ...prev, signature_image: base64 }))
                }
            />
            </FormSection>



            <div className="mt-6 flex justify-end gap-4 px-6">
                {/* Cancel Button */}
                <button
                    type="button"
                    className="px-8 py-2 border rounded text-gray-700 hover:bg-gray-100"
                    onClick={() => router.push("/settings/users")}
                >
                    Cancel
                </button>

                {/* Next Button */}
                <button
                    type="button"
                    className="px-8 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => setActiveTab("access")}
                >
                    Next
                </button>
                </div>

        </Form>
        )}

            {activeTab === "access" && (
            <div className="text-gray-700 text-lg">Access Rights (coming soon)</div>
            )}
                </div>
            );
}
