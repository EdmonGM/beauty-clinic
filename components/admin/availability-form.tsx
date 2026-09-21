"use client"

import { Controller, UseFormReturn } from "react-hook-form"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreateAvailabilityInput } from "@/lib/validations/availability"

type AvailabilityFormProps = {
  form: UseFormReturn<CreateAvailabilityInput>
  onSubmitAction: (data: CreateAvailabilityInput) => void
}

const DAY_OPTIONS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]

export function AvailabilityForm({ form, onSubmitAction }: AvailabilityFormProps) {
  return (
    <form id="availability-form" onSubmit={form.handleSubmit(onSubmitAction)}>
      <FieldGroup>
        <Controller
          name="dayOfWeek"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="availability-form-day">Day</FieldLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="availability-form-day"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {DAY_OPTIONS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <FieldGroup className="flex-row">
          <Controller
            name="startTime"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="availability-form-start">Start</FieldLabel>
                <Input
                  {...field}
                  id="availability-form-start"
                  type="time"
                  aria-invalid={fieldState.invalid}
                  placeholder="09:00"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="endTime"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="availability-form-end">End</FieldLabel>
                <Input
                  {...field}
                  id="availability-form-end"
                  type="time"
                  aria-invalid={fieldState.invalid}
                  placeholder="17:00"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldGroup>
    </form>
  )
}