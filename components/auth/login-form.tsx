"use client"

import { signInAction } from "@/lib/actions/auth"
import { LoginInput, loginSchema } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState } from "react"

export function LoginForm() {
  const router = useRouter()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginInput) {
    setIsLoggingIn(true)
    const response = await signInAction(data)
    if (response.success) {
      router.push("/")
      router.refresh()
    } else {
      toast.error(response.message)
    }
    setIsLoggingIn(false)
  }

  return (
    <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-form-email">Email</FieldLabel>
              <Input
                {...field}
                id="login-form-email"
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
              <FieldLabel htmlFor="login-form-password">Password</FieldLabel>
              <Input
                {...field}
                id="login-form-password"
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
            form="login-form"
            className="w-full"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
