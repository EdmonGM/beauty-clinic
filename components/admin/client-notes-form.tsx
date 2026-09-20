"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { clientNotesSchema, ClientNotesInput } from "@/lib/validations/users"
import { updateClientNotes } from "@/lib/actions/users"

type ClientNotesFormProps = {
  clientId: string
  initialNotes: string | null
}

export function ClientNotesForm({
  clientId,
  initialNotes,
}: ClientNotesFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const form = useForm<ClientNotesInput>({
    resolver: zodResolver(clientNotesSchema),
    defaultValues: { notes: initialNotes ?? "" },
  })

  function onSubmit(data: ClientNotesInput) {
    setIsPending(true)
    updateClientNotes(clientId, data).then((res) => {
      if (res.success) {
        toast.success(res.message)
        router.refresh()
        form.reset({ notes: data.notes })
      } else {
        toast.error(res.message)
      }
      setIsPending(false)
    })
  }

  return (
    <form id="client-notes-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="notes"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="client-notes-form-notes">
                Admin Notes
              </FieldLabel>
              <Textarea
                {...field}
                id="client-notes-form-notes"
                aria-invalid={fieldState.invalid}
                placeholder="Internal notes about this client (optional)"
                rows={4}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field orientation="horizontal">
          <Button
            type="submit"
            form="client-notes-form"
            size="sm"
            disabled={isPending || !form.formState.isDirty}
          >
            {isPending ? "Saving..." : "Save Notes"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
