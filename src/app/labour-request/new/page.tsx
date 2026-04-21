"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
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

const formSchema = z.object({
  project: z.string().min(1, "Please select a project"),
  numberOfWorkers: z.union([
    z.coerce
      .number()
      .positive("Enter a correct number")
      .min(1, "Enter a correct number")
      .max(100, "Maximum 100 workers"),
    z.undefined()
  ]),
  role: z.string().min(2, "Role is required").max(100, "Role name too long"),
  duration: z.string().min(1, "Please select duration"),
  dailyRate: z.union([
    z.coerce
      .number()
      .positive("Enter a valid daily rate")
      .min(0, "Daily rate cannot be negative"),
    z.undefined()
  ]),
  justification: z.string().max(500, "Notes too long (max 500 characters)").optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewLabourRequest() {
  const router = useRouter();
  const [isDevMode] = useState(true);

  const statusModal = useStatusModal();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      project: "",
      numberOfWorkers: undefined,
      role: "",
      duration: "",
      dailyRate: undefined,
      justification: "",
    },
    mode: "onBlur",
  });

  const numberOfWorkers = watch("numberOfWorkers") || 0;
  const dailyRate = watch("dailyRate") || 0;
  const projectedCost = numberOfWorkers * dailyRate;

  const onSubmit = async (data: FormValues) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Form submitted:", data);

    statusModal.showSuccess(
      "Request Submitted",
      "Your labour request has been submitted successfully. It will be reviewed by the approver."
    );
  };

  const handleTestFailure = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    statusModal.showError(
      "Submission Unsuccessful",
      "There was an error submitting your request. Please check your connection and try again."
    );
  };

  const handleModalAction = () => {
    statusModal.close();
    if (statusModal.type === "success") {
      reset();
      router.push("/labour-request");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
          <h1 className="text-xl font-semibold text-gray-900">Labour Request</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto pb-24">
        {/* Request Details Section */}
        <Card className="p-4 mb-4">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Request Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Request ID</span>
              <span className="text-sm font-medium text-gray-900">LR00001</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Date</span>
              <span className="text-sm font-medium text-gray-900">4 Apr 2024</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Requested by</span>
              <span className="text-sm font-medium text-gray-900">Firstname Lastname</span>
            </div>
          </div>
        </Card>

        {/* Labour Details Section */}
        <Card className="p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Labour Details</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Project */}
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Controller
                name="project"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="project" className="w-full">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project-1">Project #1</SelectItem>
                      <SelectItem value="project-2">Project #2</SelectItem>
                      <SelectItem value="project-3">Project #3</SelectItem>
                      <SelectItem value="project-4">Project #4</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.project && (
                <p className="text-sm text-red-500">{errors.project.message}</p>
              )}
            </div>

            {/* Number of Workers */}
            <div className="space-y-2">
              <Label htmlFor="numberOfWorkers">Number of Workers</Label>
              <Controller
                name="numberOfWorkers"
                control={control}
                render={({ field }) => (
                  <Input
                    id="numberOfWorkers"
                    type="number"
                    placeholder="Enter number of workers"
                    {...field}
                    aria-invalid={!!errors.numberOfWorkers}
                    className={
                      errors.numberOfWorkers ? "border-red-500 focus-visible:ring-red-500/40" : ""
                    }
                  />
                )}
              />
              {errors.numberOfWorkers && (
                <p className="text-sm text-red-500">{errors.numberOfWorkers.message}</p>
              )}
            </div>

            {/* Role / Trade Type */}
            <div className="space-y-2">
              <Label htmlFor="role">Role / Trade Type</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Input
                    id="role"
                    type="text"
                    placeholder="Enter role or trade type"
                    {...field}
                  />
                )}
              />
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days/weeks)</Label>
              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="duration" className="w-full">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-day">1 Day</SelectItem>
                      <SelectItem value="3-days">3 Days</SelectItem>
                      <SelectItem value="1-week">1 Week</SelectItem>
                      <SelectItem value="2-weeks">2 Weeks</SelectItem>
                      <SelectItem value="1-month">1 Month</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.duration && (
                <p className="text-sm text-red-500">{errors.duration.message}</p>
              )}
            </div>

            {/* Estimated Daily Rate */}
            <div className="space-y-2">
              <Label htmlFor="dailyRate">Estimated Daily Rate</Label>
              <Controller
                name="dailyRate"
                control={control}
                render={({ field }) => (
                  <Input
                    id="dailyRate"
                    type="number"
                    placeholder="Enter estimated daily rate"
                    {...field}
                  />
                )}
              />
              {errors.dailyRate && (
                <p className="text-sm text-red-500">{errors.dailyRate.message}</p>
              )}
            </div>

            {/* Justification Notes */}
            <div className="space-y-2">
              <Label htmlFor="justification">Justification Notes</Label>
              <Controller
                name="justification"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="justification"
                    placeholder="Enter justification notes (optional)"
                    rows={4}
                    className="resize-none"
                    {...field}
                  />
                )}
              />
              {errors.justification && (
                <p className="text-sm text-red-500">{errors.justification.message}</p>
              )}
            </div>

            {/* Projected Cost */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Projected Cost</span>
                <span className="text-lg font-semibold text-gray-900">
                  N{projectedCost.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </form>
        </Card>

        {/* Dev mode buttons */}
        {isDevMode && (
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full border-red-500 text-red-500 hover:bg-red-50"
              onClick={handleTestFailure}
            >
              Test Failure Modal (Dev Only)
            </Button>
          </div>
        )}
      </div>

      {/* Fixed Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:left-16 md:max-w-[calc(100%-4rem)] mx-auto">
        <Button
          variant="contained"
          className="w-full max-w-2xl mx-auto h-12 text-base font-medium flex items-center justify-center block"
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