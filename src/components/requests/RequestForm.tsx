"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";
import { RequestFormConfig } from "./types";

interface RequestFormProps<T extends Record<string, any>> {
  config: RequestFormConfig<T>;
}

export function RequestForm<T extends Record<string, any>>({ config }: RequestFormProps<T>) {
  const router = useRouter();
  const statusModal = useStatusModal();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<T>({
    resolver: zodResolver(config.schema as any),
    defaultValues: config.defaultValues as any,
    mode: "onBlur",
  });

  const currentValues = watch();
  const projectedCost = config.calculateProjectedCost ? config.calculateProjectedCost(currentValues) : null;

  const onSubmit = async (data: T) => {
    try {
      await config.onSubmit(data);
      statusModal.showSuccess(config.successMessage.title, config.successMessage.description);
    } catch (error) {
      statusModal.showError(
        config.errorMessage?.title || "Submission Unsuccessful",
        config.errorMessage?.description || "There was an error submitting your request. Please check your connection and try again."
      );
    }
  };

  const handleModalAction = () => {
    statusModal.close();
    if (statusModal.type === "success") {
      reset();
      router.push(config.backPath);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">{config.title}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto pb-24 pt-4 space-y-4">
        {/* Request Details Section / Header */}
        {config.renderHeader ? (
          config.renderHeader()
        ) : (
          <div className="bg-white px-4 py-6">
            <h2 className="text-sm font-medium text-[#3B7CED] mb-4">Request Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">Request ID</span>
                <span className="text-sm text-gray-600">{config.requestId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">Date</span>
                <span className="text-sm text-gray-600">{config.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">Requested by</span>
                <span className="text-sm text-gray-600">{config.requesterName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Sections */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {config.sections.map((section, sIndex) => (
            <div key={sIndex} className="bg-white px-4 py-6">
              <h2 className="text-sm font-medium text-[#3B7CED] mb-4">{section.title}</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                {section.fields.map((field) => (
                  <div key={field.name} className={`space-y-2 ${field.halfWidth ? "col-span-1" : "col-span-2"}`}>
                    <Label htmlFor={field.name} className="text-sm font-semibold text-gray-900">
                      {field.label}
                    </Label>
                    <Controller
                      name={field.name as any}
                      control={control}
                      render={({ field: controllerField }) => {
                        if (field.type === "select") {
                          return (
                            <Select
                              onValueChange={controllerField.onChange}
                              value={controllerField.value}
                            >
                              <SelectTrigger id={field.name} className="w-full">
                                <SelectValue placeholder={field.placeholder} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          );
                        }
                        if (field.type === "textarea") {
                          return (
                            <Textarea
                              id={field.name}
                              placeholder={field.placeholder}
                              rows={field.rows || 4}
                              className="resize-none"
                              {...controllerField}
                            />
                          );
                        }
                        return (
                          <Input
                            id={field.name}
                            type={field.type}
                            placeholder={field.placeholder}
                            {...controllerField}
                            aria-invalid={!!errors[field.name]}
                            className={
                              errors[field.name]
                                ? "border-red-500 focus-visible:ring-red-500/40"
                                : ""
                            }
                          />
                        );
                      }}
                    />
                    {errors[field.name] && (
                      <p className="text-sm text-red-500">
                        {(errors[field.name] as any).message}
                      </p>
                    )}
                    {!errors[field.name] && field.hintText && (
                      <p className="text-xs text-gray-500 mt-1">
                        {field.hintText}
                      </p>
                    )}
                  </div>
                ))}

                {/* Projected Cost (only shown in the last section for now, or based on logic) */}
                {sIndex === config.sections.length - 1 && projectedCost !== null && (
                  <div className="pt-5 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-900">Projected Cost</span>
                      <span className="text-lg font-bold text-gray-900">
                        N
                        {projectedCost.toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </form>
      </div>

      {/* Fixed Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 md:left-16 md:max-w-[calc(100%-4rem)] mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Button
          variant="contained"
          className="w-full max-w-2xl mx-auto h-12 text-base font-medium flex items-center justify-center block bg-[#3B7CED] hover:bg-[#2d63c7] text-white rounded-md"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit request"}
        </Button>
      </div>

      {/* Status Modal */}
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={statusModal.close}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        actionText={statusModal.type === "success" ? "Done" : "Try again"}
        onAction={handleModalAction}
        showCloseButton={false}
      />
    </div>
  );
}
