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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Option, DeliveryOrderFormData } from "./types";

interface DeliveryOrderFormProps {
  register: UseFormRegister<DeliveryOrderFormData>;
  setValue: UseFormSetValue<DeliveryOrderFormData>;
  watch: UseFormWatch<DeliveryOrderFormData>;
  control?: Control<DeliveryOrderFormData>;
  errors: FieldErrors<DeliveryOrderFormData>;
  locationOptions: Option[];
  userOptions: Option[];
  isLoadingLocations: boolean;
  isLoadingUsers: boolean;
  onSourceLocationChange: (value: string) => void;
}

export default function DeliveryOrderForm({
  register,
  setValue,
  watch,
  control,
  errors,
  locationOptions,
  userOptions,
  isLoadingLocations,
  isLoadingUsers,
  onSourceLocationChange,
}: DeliveryOrderFormProps) {
  const renderSelect = (
    name: keyof DeliveryOrderFormData,
    label: string,
    options: Option[],
    isLoading: boolean,
    placeholder: string,
    required = false,
    useController = false
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
                  if (name === "source_location") onSourceLocationChange(value);
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
            if (name === "source_location") onSourceLocationChange(value);
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
        {/* Source Location */}
        {renderSelect(
          "source_location",
          "Source Location",
          locationOptions,
          isLoadingLocations,
          "Select source location",
          true,
          !!control
        )}

        {/* Customer Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Customer Name <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("customer_name")}
            placeholder="Enter customer name..."
            className="h-11"
          />
          {errors.customer_name && (
            <p className="text-sm text-red-500">
              {errors.customer_name.message}
            </p>
          )}
        </div>

        {/* Delivery Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Delivery Address <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("delivery_address")}
            placeholder="Enter delivery address..."
            className="h-11"
          />
          {errors.delivery_address && (
            <p className="text-sm text-red-500">
              {errors.delivery_address.message}
            </p>
          )}
        </div>

        {/* Delivery Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Delivery Date <span className="text-red-500">*</span>
          </label>
          <Input {...register("delivery_date")} type="date" className="h-11" />
          {errors.delivery_date && (
            <p className="text-sm text-red-500">
              {errors.delivery_date.message}
            </p>
          )}
        </div>

        {/* Shipping Policy */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Shipping Policy
          </label>
          <Textarea
            {...register("shipping_policy")}
            placeholder="Enter shipping policy..."
            className="min-h-11"
          />
        </div>

        {/* Return Policy */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Return Policy
          </label>
          <Textarea
            {...register("return_policy")}
            placeholder="Enter return policy..."
            className="min-h-11"
          />
        </div>

        {/* Assigned To */}
        {renderSelect(
          "assigned_to",
          "Assigned To",
          userOptions,
          isLoadingUsers,
          "Select assigned user",
          true,
          !!control
        )}
      </div>
    </motion.div>
  );
}
