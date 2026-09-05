"use client"

import { signUpAction } from "@/lib/actions/auth"
import { RegisterInput, registerSchema } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "../ui/input"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"

export function RegisterForm() {
  const router = useRouter()
  const [isRegistering, setIsRegistering] = useState(false)
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: RegisterInput) {
    setIsRegistering(true)
    const response = await signUpAction(data)
    if (response.success) {
      router.push("/")
      router.refresh()
    } else {
      toast.error(response.message)
    }
    setIsRegistering(false)
  }

  return (
    <form id="register-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-form-name">Name</FieldLabel>
              <Input
                {...field}
                id="register-form-name"
                aria-invalid={fieldState.invalid}
                placeholder="Enter your name"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-form-email">Email</FieldLabel>
              <Input
                {...field}
                id="register-form-email"
                aria-invalid={fieldState.invalid}
                placeholder="Enter your email"
                type="email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-form-password">Password</FieldLabel>
              <Input
                {...field}
                id="register-form-password"
                aria-invalid={fieldState.invalid}
                placeholder="Enter your password"
                type="password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field orientation="horizontal">
          <Button
            type="submit"
            form="register-form"
            className="w-full"
            disabled={isRegistering}
          >
            {isRegistering ? "Registering..." : "Register"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
