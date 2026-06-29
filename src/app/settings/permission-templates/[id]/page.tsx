"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Form from "@/components/Settings/form/form";
import FormSection from "@/components/Settings/form/FormSection";
import FormInput from "@/components/Settings/form/FormInput";
import PermissionsGrid from "@/components/Settings/PermissionsGrid";
import ReadOnlyField from "@/components/Settings/ReadOnlyField";
import {
  getPermissionTemplates,
  savePermissionTemplate,
  deletePermissionTemplate,
  PermissionTemplate,
  UserPermissions,
  createEmptyPermissions,
} from "@/utils/modulePermissionsStore";
import StatusModal, { useStatusModal } from "@/components/shared/StatusModal";

export default function PermissionTemplateDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params?.id as string;

  const [editMode, setEditMode] = useState(false);
  const [template, setTemplate] = useState<PermissionTemplate | null>(null);
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<UserPermissions>(createEmptyPermissions());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusModal = useStatusModal();

  useEffect(() => {
    if (templateId) {
      const allTemplates = getPermissionTemplates();
      const found = allTemplates.find((t) => t.id === templateId);
      if (found) {
        setTemplate(found);
        setName(found.name);
        setPermissions(found.permissions);
      } else {
        statusModal.showError("Not Found", "The requested permission template was not found.");
        setTimeout(() => {
          router.push("/settings/permission-templates");
        }, 1500);
      }
    }
  }, [templateId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    if (!name.trim()) {
      statusModal.showError("Validation Error", "Template name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedTemplate: PermissionTemplate = {
        ...template,
        name: name.trim(),
        permissions,
      };

      savePermissionTemplate(updatedTemplate);
      setTemplate(updatedTemplate);
      setEditMode(false);
      statusModal.showSuccess("Success", "Permission template updated successfully!");
    } catch (error) {
      console.error(error);
      statusModal.showError("Error", "Failed to update permission template.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveToggle = () => {
    if (!template) return;
    try {
      const updated = { ...template, isArchived: !template.isArchived };
      savePermissionTemplate(updated);
      setTemplate(updated);
      statusModal.showSuccess(
        "Success",
        `Template has been ${updated.isArchived ? "archived" : "activated"} successfully!`
      );
    } catch (error) {
      console.error(error);
      statusModal.showError("Error", "Failed to toggle archive status.");
    }
  };

  const handleDelete = () => {
    if (!template) return;
    
    // Show a confirmation dialog or action
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this template? This action cannot be undone."
    );

    if (confirmDelete) {
      try {
        deletePermissionTemplate(template.id);
        statusModal.showSuccess("Success", "Template deleted successfully.");
        setTimeout(() => {
          router.push("/settings/permission-templates");
        }, 1500);
      } catch (error) {
        console.error(error);
        statusModal.showError("Error", "Failed to delete template.");
      }
    }
  };

  if (!template) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="pb-6 w-full mx-auto mw-full rounded-xs bg-white">
      {/* Top bar */}
      <div className="flex px-6 justify-between border-b py-4 border-[#E2E6E9]">
        <div className="flex px-6 items-center">
          <button
            onClick={() => router.push("/settings/permission-templates")}
            className="mr-4 text-2xl text-[#717171] hover:underline"
          >
            &larr;
          </button>
          <h1 className="text-xl text-[#1A1A1A] font-normal">Template Details</h1>
        </div>
        <div className="flex gap-4">
          <button
            className="text-gray-500 hover:text-amber-600 transition-colors text-sm"
            onClick={handleArchiveToggle}
          >
            {template.isArchived ? "Unarchive Template" : "Archive Template"}
          </button>
          <button
            className="text-red-500 hover:text-red-700 transition-colors text-sm"
            onClick={handleDelete}
          >
            Delete
          </button>
          <button
            className="text-[#3B7CED] text-sm"
            onClick={() => setEditMode((prev) => !prev)}
          >
            {editMode ? "Back to View" : "Edit"}
          </button>
        </div>
      </div>

      <Form onSubmit={handleSave} className="p-6">
        <FormSection title="Template Information" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {editMode ? (
              <FormInput
                label="Template Name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Template name"
                required
              />
            ) : (
              <ReadOnlyField label="Template Name" value={name} />
            )}

            <ReadOnlyField
              label="Status"
              value={
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    template.isArchived
                      ? "bg-amber-50 text-amber-600 border border-amber-200"
                      : "bg-green-50 text-green-600 border border-green-200"
                  }`}
                >
                  {template.isArchived ? "Archived" : "Active"}
                </span>
              }
            />
          </div>
        </FormSection>

        <FormSection title="Permissions Configuration">
          <p className="text-sm text-gray-500 mb-4 mt-2">
            This grid defines the active permission set for this template.
          </p>
          <PermissionsGrid
            permissions={permissions}
            onChange={setPermissions}
            readOnly={!editMode}
          />
        </FormSection>

        {editMode && (
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setName(template.name);
                setPermissions(template.permissions);
              }}
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-150 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </Form>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={statusModal.close}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
      />
    </div>
  );
}
