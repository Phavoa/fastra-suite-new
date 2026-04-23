"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import moment from "moment-timezone";
import ISO6391 from "iso-639-1";
import { useSelector } from "react-redux";

import Form from "@/components/Settings/form/form";
import FormSection from "@/components/Settings/form/FormSection";
import FormInput from "@/components/Settings/form/FormInput";
import FormImageUpload from "@/components/Settings/form/FormImageUpload";
import FormSelect from "@/components/Settings/form/FormSelect";
import SignaturePad from "@/components/Settings/form/SignaturePad";
import { Checkbox } from "@/components/ui/checkbox";
import { GridCardIcon } from "@/components/icons/gridCardIcon";
import NewUserRoleSelect from "@/components/Settings/form/formRoleSelect";
import { ToastNotification } from "@/components/shared/ToastNotification";
import { PageGuard } from "@/components/auth/PageGuard";

import { z } from "zod";
import { useCreateUserMutation } from "@/api/settings/usersApi";
import { useGetAccessGroupsByApplicationQuery } from "@/api/settings/accessGroupRightApi";
import { RootState } from "@/lib/store/store";

const userCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company_role: z.coerce.number().min(1, "Role is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  language: z.string().min(1, "Language is required"),
  timezone: z.string().min(1, "Timezone is required"),
  in_app_notifications: z.boolean().default(true),
  email_notifications: z.boolean().default(true),
  user_image_image: z.any().optional(),
  signature_image: z.any().optional(),
  access_codes: z.record(z.string(), z.string().min(1, "Access group is required")).optional(),
});

type UserCreateInput = z.infer<typeof userCreateSchema>;

export default function NewUser() {
  const [activeTab, setActiveTab] = useState<"basic" | "access">("basic");
  const router = useRouter();
  
  const tenant_company_name = useSelector(
    (state: RootState) => state.auth.tenant_company_name
  );

  const [createUser, { isLoading: isSubmitting }] = useCreateUserMutation();
  const { data: accessGroupsByApp, isLoading: isLoadingGroups } = useGetAccessGroupsByApplicationQuery();

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
    show: boolean;
  }>({
    message: "",
    type: "success",
    show: false,
  });

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState,
    setError,
    clearErrors,
  } = useForm<UserCreateInput>({
    resolver: zodResolver(userCreateSchema) as any,
    mode: "all", // Still use mode for real-time updates if needed
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      language: "en",
      timezone: "Africa/Lagos",
      in_app_notifications: true,
      email_notifications: true,
      company_role: 0,
      access_codes: {},
    },
  });

  const { errors } = formState;

  const languageOptions = ISO6391.getAllCodes().map((code) => ({
    label: ISO6391.getName(code),
    value: code,
  }));

  const timezoneOptions = moment.tz.names().map((tz) => ({
    label: tz,
    value: tz,
  }));

  const userImage = watch("user_image_image");

  const onSubmit = async (data: UserCreateInput) => {
    console.log("Submitting form data object:", data);
    const formData = new FormData();
    
    // Explicitly add fields
    formData.append("name", data.name);
    formData.append("email", data.email);
    
    // Ensure company_role is a string-represented number
    const roleId = String(data.company_role);
    formData.append("company_role", roleId);
    
    formData.append("phone_number", data.phone_number);
    formData.append("language", data.language);
    formData.append("timezone", data.timezone);
    formData.append("in_app_notifications", data.in_app_notifications ? "true" : "false");
    formData.append("email_notifications", data.email_notifications ? "true" : "false");

    if (data.user_image_image) {
      formData.append("user_image_image", data.user_image_image);
      formData.append("image", data.user_image_image);
    }

    if (data.signature_image) {
      formData.append("signature_image", data.signature_image);
    }

    if (data.access_codes) {
      Object.entries(data.access_codes).forEach(([appName, code]) => {
        if (code) {
          console.log(`Adding access code for ${appName}: ${code}`);
          formData.append("access_codes", code);
        }
      });
    }

    // Log FormData contents for debugging
    console.log("FormData entries:");
    for (const [key, value] of Array.from(formData.entries())) {
      console.log(`${key}:`, value instanceof File ? `File(${value.name})` : value);
    }

    try {
      await createUser(formData).unwrap();
      setNotification({
        message: `User ${data.name} created successfully!`,
        type: "success",
        show: true,
      });
      setTimeout(() => {
        router.push("/settings/users");
      }, 2000);
    } catch (err: any) {
      console.error("Submission error:", err);
      
      const backendErrors = err?.data?.error;
      if (Array.isArray(backendErrors)) {
        backendErrors.forEach((errorObj: any) => {
          Object.entries(errorObj).forEach(([field, message]) => {
            setError(field as any, {
              type: "manual",
              message: message as string,
            });
          });
        });

        // Switch to the tab with the first error
        const firstErrorField = Object.keys(backendErrors[0])[0];
        const basicFields = ["name", "email", "company_role", "phone_number", "language", "timezone"];
        if (basicFields.includes(firstErrorField)) {
          setActiveTab("basic");
        } else if (firstErrorField.startsWith("access_codes")) {
          setActiveTab("access");
        }
        
        setNotification({
          message: "Please fix the errors highlighted in the form.",
          type: "error",
          show: true,
        });
      } else {
        setNotification({
          message: err?.data?.detail || "An unexpected error occurred. Please try again.",
          type: "error",
          show: true,
        });
      }
    }
  };

  const onInvalid = (errors: any) => {
    console.error("Validation Errors:", errors);
    const basicFields = ["name", "email", "company_role", "phone_number", "language", "timezone"];
    const hasBasicErrors = basicFields.some(field => errors[field]);
    
    if (hasBasicErrors && activeTab !== "basic") {
      setNotification({
        message: "Please check for errors in the Basic Settings tab.",
        type: "error",
        show: true,
      });
      setActiveTab("basic");
    } else {
      setNotification({
        message: "Please fill in all required fields correctly.",
        type: "error",
        show: true,
      });
    }
  };

  const base64ToFile = (base64: string, filename: string) => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(onSubmit, onInvalid)(e);
  };

  return (
    <PageGuard application="settings" module="user" action="create">
      <div className="pb-6 w-full mx-auto mw-full rounded-xs bg-white">
        {/* Top bar */}
        <div className="flex px-6 items-center border-b py-4 border-[#E2E6E9]">
          <button
            type="button"
            onClick={() => router.back()}
            className="mr-4 text-2xl text-[#717171] hover:underline"
          >
            &larr;
          </button>
          <h1 className="text-xl text-[#1A1A1A] font-normal">Create User</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6 items-center">
          <button
            type="button"
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
            type="button"
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

        <form onSubmit={handleFormSubmit}>
          {/* Tab Content */}
          {activeTab === "basic" && (
            <div className="w-full bg-white">
              {/* Basic Info */}
              <FormSection title="Basic Information" className="pt-10">
                <div className="flex items-center w-full gap-4">
                  <FormImageUpload
                    label="User Image"
                    image={userImage ? URL.createObjectURL(userImage) : null}
                    textToDisplay="Upload User Photo"
                    onChange={(file) => setValue("user_image_image", file)}
                  />

                  <div className="border-l border-[#E6E6E6] py-6 pl-10 ml-6 grid grid-cols-2 gap-8 w-[60%]">
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <FormInput
                          label="Name"
                          {...field}
                          value={field.value as string}
                          placeholder="Enter your Name here"
                          required
                        />
                      )}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}

                    <Controller
                      name="company_role"
                      control={control}
                      render={({ field }) => (
                        <NewUserRoleSelect
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    {errors.company_role && <p className="text-red-500 text-xs mt-1">{errors.company_role.message}</p>}
                  </div>
                </div>
              </FormSection>

              {/* Contact Info */}
              <FormSection title="Contact Information">
                <div className="grid grid-cols-3 gap-6 mt-4">
                  <Controller
                    name="phone_number"
                    control={control}
                    render={({ field }) => (
                      <FormInput
                        label="Phone Number"
                        {...field}
                        value={field.value as string}
                        placeholder="Enter phone number"
                        required
                      />
                    )}
                  />
                  {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number.message}</p>}

                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <FormInput
                        label="Email"
                        {...field}
                        value={field.value as string}
                        placeholder="Enter email address"
                        type="email"
                        required
                      />
                    )}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
              </FormSection>

              {/* Companies */}
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
                  <Controller
                    name="language"
                    control={control}
                    render={({ field }) => (
                      <FormSelect
                        label="Language"
                        {...field}
                        value={field.value as string}
                        placeholder="Select language"
                        options={languageOptions}
                      />
                    )}
                  />
                  {errors.language && <p className="text-red-500 text-xs mt-1">{errors.language.message}</p>}

                  <Controller
                    name="timezone"
                    control={control}
                    render={({ field }) => (
                      <FormSelect
                        label="Timezone"
                        {...field}
                        value={field.value as string}
                        placeholder="Select timezone"
                        options={timezoneOptions}
                      />
                    )}
                  />
                  {errors.timezone && <p className="text-red-500 text-xs mt-1">{errors.timezone.message}</p>}
                </div>

                {/* Notification Preferences */}
                <div className="mt-6 flex flex-col gap-4">
                  <label className="font-medium text-sm text-[#1A1A1A]">
                    Notification Preferences
                  </label>

                  <div className="flex items-center gap-3 w-[13%] justify-between">
                    <label htmlFor="in-app" className="text-sm text-[#4A4A4A] cursor-pointer">
                      In-app Notifications
                    </label>
                    <Controller
                      name="in_app_notifications"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="in-app"
                        />
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-3 w-[13%] justify-between">
                    <label
                      htmlFor="email-notif"
                      className="text-sm text-[#4A4A4A] cursor-pointer"
                    >
                      Email Notifications
                    </label>
                    <Controller
                      name="email_notifications"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="email-notif"
                        />
                      )}
                    />
                  </div>
                </div>
              </FormSection>

              {/* Signature Pad */}
              <FormSection title="Signature">
                <SignaturePad
                  onChange={(base64) => {
                    if (base64) {
                      const file = base64ToFile(
                        `data:image/png;base64,${base64}`,
                        "signature.png"
                      );
                      setValue("signature_image", file);
                    } else {
                      setValue("signature_image", null);
                    }
                  }}
                />
              </FormSection>

              {/* Footer Buttons */}
              <div className="mt-6 flex justify-end gap-4 px-6 pb-6">
                <button
                  type="button"
                  className="px-8 py-2 border rounded text-gray-700 hover:bg-gray-100"
                  onClick={() => router.push("/settings/users")}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="px-8 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => setActiveTab("access")}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Access Rights Tab */}
          {activeTab === "access" && (
            <div className="w-full bg-white px-6">
              <FormSection title="Applications">
                {isLoadingGroups ? (
                  <p>Loading access groups...</p>
                ) : (
                  <div className="grid grid-cols-3 gap-5 pt-6">
                    {accessGroupsByApp?.data?.map((app: any) => (
                      <Controller
                        key={app.application}
                        name={`access_codes.${app.application}`}
                        control={control}
                        render={({ field }) => (
                          <FormSelect
                            label={app.application}
                            {...field}
                            value={field.value || ""}
                            placeholder="Select An Access Group"
                            options={app.access_groups.map((group: any) => ({
                              label: group.group_name,
                              value: group.access_code,
                            }))}
                          />
                        )}
                      />
                    ))}
                  </div>
                )}
              </FormSection>

              <div className="mt-12 flex justify-end gap-4 pb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("basic")}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}
        </form>

        <ToastNotification
          message={notification.message}
          type={notification.type}
          show={notification.show}
          onClose={closeNotification}
        />
      </div>
    </PageGuard>
  );
}
