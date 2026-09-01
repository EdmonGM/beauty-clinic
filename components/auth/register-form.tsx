"use client"

import { signUpAction } from "@/lib/actions/auth"
import { RegisterInput, registerSchema } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "../ui/input"
import Link from "next/link"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"

export function RegisterForm() {
  const router = useRouter()
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: RegisterInput) {
    const response = await signUpAction(data)
    if (response.success) router.push("/")
  }
  // async function onSubmit(data: RegisterInput) {
  //   setIsPending(true)
  //   const { error } = await authClient.signUp.email({ ...data })
  //   setIsPending(false)
  //   if (error) return
  //   router.push("/")
  //   router.refresh()
  // }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Create new account</CardTitle>
        <CardDescription>Register to start booking treatments.</CardDescription>
      </CardHeader>
      <CardContent>
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-form-password">
                    Password
                  </FieldLabel>
                  <Input
                    {...field}
                    id="register-form-password"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your password"
                    type="password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <Field orientation="horizontal">
          <Button type="submit" form="login-form" className="w-full">
            Register
          </Button>
        </Field>
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
