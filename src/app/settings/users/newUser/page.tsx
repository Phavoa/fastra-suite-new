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
import { Checkbox } from "@/components/ui/checkbox";
import { GridCardIcon } from "@/components/icons/gridCardIcon";
import NewUserRoleSelect from "@/components/Settings/form/formRoleSelect";
import { ToastNotification } from "@/components/shared/ToastNotification";
import { PageGuard } from "@/components/auth/PageGuard";

import { z } from "zod";
import { useCreateUserMutation } from "@/api/settings/usersApi";
import { RootState } from "@/lib/store/store";

import PermissionsGrid from "@/components/Settings/PermissionsGrid";
import {
  UserPermissions,
  createEmptyPermissions,
  MODULE_KEY_MAP,
  convertApiItemsToPermissions,
} from "@/utils/modulePermissionsStore";
import { useGetPermissionTemplatesQuery } from "@/api/settings/permissionsTemplateApi";

const userCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company_role: z.coerce.number().min(1, "Role is required").optional(),
  phone_number: z.string().min(1, "Phone number is required"),
  language: z.string().min(1, "Language is required"),
  timezone: z.string().min(1, "Timezone is required"),
  in_app_notifications: z.boolean().default(true),
  email_notifications: z.boolean().default(true),
  user_image_image: z.any().optional(),
});

type UserCreateInput = z.infer<typeof userCreateSchema>;

export default function NewUser() {
  const [activeTab, setActiveTab] = useState<"basic" | "permissions">("basic");
  const router = useRouter();
  const [directPermissions, setDirectPermissions] = useState<UserPermissions>(
    createEmptyPermissions(),
  );

  const tenant_company_name = useSelector(
    (state: RootState) => state.auth.tenant_company_name,
  );
  const tenant_schema_name = useSelector(
    (state: RootState) => state.auth.tenant_schema_name,
  );

  const [createUser, { isLoading: isSubmitting }] = useCreateUserMutation();

  const { data: permissionTemplates = [], isLoading: templatesLoading } = useGetPermissionTemplatesQuery();

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
      user_image_image: null,
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
    formData.append("tenant_schema_name", tenant_schema_name || "");

    // Ensure company_role is a string-represented number
    if (data.company_role) {
      formData.append("company_role", String(data.company_role));
    }

    formData.append("phone_number", data.phone_number);
    formData.append("language", data.language);
    formData.append("timezone", data.timezone);
    formData.append(
      "in_app_notifications",
      data.in_app_notifications ? "true" : "false",
    );
    formData.append(
      "email_notifications",
      data.email_notifications ? "true" : "false",
    );

    if (data.user_image_image) {
      formData.append("user_image_image", data.user_image_image);
    }

    const permissionsPayload = Object.entries(directPermissions)
      .filter(([, perms]) => Object.values(perms).some((v) => v))
      .map(([moduleKey, perms]) => ({
        module: MODULE_KEY_MAP[moduleKey as keyof UserPermissions],
        permission_types: Object.entries(perms)
          .filter(([, selected]) => selected)
          .map(([permType]) => permType),
      }));

    formData.append("permissions", JSON.stringify(permissionsPayload));

    // Log FormData contents for debugging
    console.log("FormData entries:");
    for (const [key, value] of Array.from(formData.entries())) {
      console.log(
        `${key}:`,
        value instanceof File ? `File(${value.name})` : value,
      );
    }

    try {
      const res = await createUser(formData).unwrap();
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
        const basicFields = [
          "name",
          "email",
          "company_role",
          "phone_number",
          "language",
          "timezone",
        ];
        if (basicFields.includes(firstErrorField)) {
          setActiveTab("basic");
        } else if (firstErrorField.startsWith("user_permissions")) {
          setActiveTab("permissions");
        }

        setNotification({
          message: "Please fix the errors highlighted in the form.",
          type: "error",
          show: true,
        });
      } else {
        setNotification({
          message:
            err?.data?.detail ||
            "An unexpected error occurred. Please try again.",
          type: "error",
          show: true,
        });
      }
    }
  };

  const onInvalid = (errors: any) => {
    console.error("Validation Errors:", errors);
    const basicFields = [
      "name",
      "email",
      "company_role",
      "phone_number",
      "language",
      "timezone",
    ];
    const hasBasicErrors = basicFields.some((field) => errors[field]);

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
              activeTab === "permissions"
                ? "border-b-2 border-blue-600 text-[#3B7CED]"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("permissions")}
          >
            Module Permissions
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
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.name.message}
                      </p>
                    )}

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
                    {errors.company_role && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.company_role.message}
                      </p>
                    )}
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
                  {errors.phone_number && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.phone_number.message}
                    </p>
                  )}

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
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
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
                  {errors.language && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.language.message}
                    </p>
                  )}

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
                  {errors.timezone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.timezone.message}
                    </p>
                  )}
                </div>

                {/* Notification Preferences */}
                <div className="mt-6 flex flex-col gap-4">
                  <label className="font-medium text-sm text-[#1A1A1A]">
                    Notification Preferences
                  </label>

                  <div className="flex items-center gap-3 w-[13%] justify-between">
                    <label
                      htmlFor="in-app"
                      className="text-sm text-[#4A4A4A] cursor-pointer"
                    >
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
                  onClick={() => setActiveTab("permissions")}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Module Permissions Tab */}
          {activeTab === "permissions" && (
            <div className="w-full bg-white px-6">
              <FormSection title="Module Permissions Grid">
                <div className="mb-6 max-w-md mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apply Permission Template (Optional)
                  </label>
                  <select
                    name="template"
                    onChange={(e) => {
                      if (e.target.value) {
                        const selected = permissionTemplates.find(
                          (t: any) => t.id === Number(e.target.value),
                        );
                        if (selected) {
                          setDirectPermissions(
                            convertApiItemsToPermissions(selected.items),
                          );
                        }
                      }
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    defaultValue=""
                    disabled={templatesLoading}
                  >
                    <option value="" disabled>
                      -- Select a Template --
                    </option>
                    {permissionTemplates
                      .filter((t: any) => t.is_active)
                      .map((t: any) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="mt-4">
                  <PermissionsGrid
                    permissions={directPermissions}
                    onChange={setDirectPermissions}
                    readOnly={false}
                  />
                </div>
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
