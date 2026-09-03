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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ServiceInput } from "@/lib/validations"

type Category = {
  id: string
  name: string
}

type ServiceFormProps = {
  categories: Category[]
  form: UseFormReturn<ServiceInput>
  onSubmitAction: (data: ServiceInput) => void
}

export function ServiceForm({
  form,
  onSubmitAction,
  categories,
}: ServiceFormProps) {
  return (
    <form id="service-form" onSubmit={form.handleSubmit(onSubmitAction)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="service-form-name">Name</FieldLabel>
              <Input
                {...field}
                id="service-form-name"
                aria-invalid={fieldState.invalid}
                placeholder="Service name"
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
              <FieldLabel htmlFor="service-form-description">
                Description
              </FieldLabel>
              <Textarea
                {...field}
                id="service-form-description"
                aria-invalid={fieldState.invalid}
                placeholder="Service description (optional)"
                rows={3}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <FieldGroup className="flex-row">
          <Controller
            name="price"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="service-form-price">Price ($)</FieldLabel>
                <Input
                  {...field}
                  id="service-form-price"
                  type="number"
                  step={1}
                  min={0}
                  aria-invalid={fieldState.invalid}
                  placeholder="0.00"
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="durationMinutes"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="service-form-duration">
                  Duration (minutes)
                </FieldLabel>
                <Input
                  {...field}
                  id="service-form-duration"
                  type="number"
                  min={1}
                  aria-invalid={fieldState.invalid}
                  placeholder="30"
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <Controller
          name="categoryId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Category</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="isActive"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <FieldLabel htmlFor="service-form-active">Active</FieldLabel>
              <Switch
                id="service-form-active"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  )
}
