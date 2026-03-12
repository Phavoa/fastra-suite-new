"use client";

import React from "react";
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  FieldErrors,
  Control,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Option, InternalTransferFormData } from "@/types/internalTransfer";

interface InternalTransferFormProps {
  register: UseFormRegister<InternalTransferFormData>;
  setValue: UseFormSetValue<InternalTransferFormData>;
  watch: UseFormWatch<InternalTransferFormData>;
  control?: Control<InternalTransferFormData>;
  errors: FieldErrors<InternalTransferFormData>;
  sourceLocationOptions: Option[];
  destinationLocationOptions: Option[];
  isLoadingSourceLocations: boolean;
  isLoadingDestinationLocations: boolean;
  onSourceLocationChange: (value: string) => void;
  onDestinationLocationChange: (value: string) => void;
  dateCreated?: string;
}

export default function InternalTransferForm({
  register,
  setValue,
  watch,
  control,
  errors,
  sourceLocationOptions,
  destinationLocationOptions,
  isLoadingSourceLocations,
  isLoadingDestinationLocations,
  onSourceLocationChange,
  onDestinationLocationChange,
  dateCreated,
}: InternalTransferFormProps) {
  const renderSelect = (
    name: keyof InternalTransferFormData,
    label: string,
    options: Option[],
    isLoading: boolean,
    placeholder: string,
    required = false,
    useController = false,
    onChange?: (value: string) => void
  ) => {
    const SelectComponent =
      useController && control ? (
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const selectedLabel = options.find(
              (opt) => opt.value === field.value
            )?.label;
            return (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  if (onChange) onChange(value);
                }}
                disabled={isLoading}
              >
                <SelectTrigger size="md" className="h-11 w-full">
                  <SelectValue>
                    {selectedLabel || (isLoading ? "Loading..." : placeholder)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="__loading__" disabled>
                      Loading...
                    </SelectItem>
                  ) : options.length === 0 ? (
                    <SelectItem value="__no_options__" disabled>
                      No options available
                    </SelectItem>
                  ) : (
                    options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            );
          }}
        />
      ) : (
        <Select
          value={watch(name) || ""}
          onValueChange={(value) => {
            setValue(name, value);
            if (onChange) onChange(value);
          }}
          disabled={isLoading}
        >
          <SelectTrigger size="md" className="h-11 w-full">
            <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem value="__loading__" disabled>
                Loading...
              </SelectItem>
            ) : options.length === 0 ? (
              <SelectItem value="__no_options__" disabled>
                No options available
              </SelectItem>
            ) : (
              options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      );

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {SelectComponent}
        {errors[name] && (
          <p className="text-sm text-red-500">{errors[name].message}</p>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
      className="mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Date Created */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Date Created
          </label>
          <Input
            type="text"
            value={
              dateCreated
                ? new Date(dateCreated).toLocaleDateString()
                : new Date().toLocaleDateString()
            }
            readOnly
            className="h-11 bg-gray-50"
          />
        </div>

        {/* Source Location */}
        {renderSelect(
          "source_location",
          "Source Location",
          sourceLocationOptions,
          isLoadingSourceLocations,
          "Select source location",
          true,
          !!control,
          onSourceLocationChange
        )}

        {/* Destination Location */}
        {renderSelect(
          "destination_location",
          "Destination Location",
          destinationLocationOptions,
          isLoadingDestinationLocations,
          "Select destination location",
          true,
          !!control,
          onDestinationLocationChange
        )}
      </div>
    </motion.div>
  );
}
