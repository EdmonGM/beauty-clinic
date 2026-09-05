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
import { CategoryInput } from "@/lib/validations"

type CategoryFormProps = {
  form: UseFormReturn<CategoryInput>
  onSubmitAction: (data: CategoryInput) => void
}

export function CategoryForm({ form, onSubmitAction }: CategoryFormProps) {
  return (
    <form id="category-form" onSubmit={form.handleSubmit(onSubmitAction)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="category-form-name">Name</FieldLabel>
              <Input
                {...field}
                id="category-form-name"
                aria-invalid={fieldState.invalid}
                placeholder="Category name"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="category-form-description">
                Description
              </FieldLabel>
              <Textarea
                {...field}
                id="category-form-description"
                aria-invalid={fieldState.invalid}
                placeholder="Category description (optional)"
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
