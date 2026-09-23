"use client"

import { Controller, UseFormReturn } from "react-hook-form"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CreateBlockedSlotInput } from "@/lib/validations/blocked-slots"

type BlockedSlotFormProps = {
  form: UseFormReturn<CreateBlockedSlotInput>
  onSubmitAction: (data: CreateBlockedSlotInput) => void
}

export function BlockedSlotForm({
  form,
  onSubmitAction,
}: BlockedSlotFormProps) {
  return (
    <form id="blocked-slot-form" onSubmit={form.handleSubmit(onSubmitAction)}>
      <FieldGroup>
        <Controller
          name="startsAt"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="blocked-slot-form-start">
                Starts At
              </FieldLabel>
              <Input
                {...field}
                id="blocked-slot-form-start"
                type="datetime-local"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="endsAt"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="blocked-slot-form-end">Ends At</FieldLabel>
              <Input
                {...field}
                id="blocked-slot-form-end"
                type="datetime-local"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="reason"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="blocked-slot-form-reason">Reason</FieldLabel>
              <Textarea
                {...field}
                id="blocked-slot-form-reason"
                aria-invalid={fieldState.invalid}
                placeholder="Reason (optional)"
                rows={3}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  )
}
