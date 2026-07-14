"use client"

import React, { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast, Toaster } from "sonner"
import * as z from "zod"
import { authClient } from "@/lib/auth-client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { signInSchema } from "@/schemas/signInSchema"

const SignInPage = () => {

    const [isSubmitting, setIsSubmitting] = useState(false)
    const router =  useRouter()

    // zod implementation
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: "",
            password: "", 
            
        }
    })

    const onSubmit = async (formData: z.infer<typeof signInSchema>) => {
        setIsSubmitting(true)
        try {
            const { error } = await authClient.signIn.email({
                email: formData.identifier,
                password: formData.password,
                callbackURL: "/dashboard",
                rememberMe: false,
            })

            if (error) {
                toast.error(error.message ?? "Sign in failed")
                return
            }

            toast.success("Signed in successfully")
            router.push("/dashboard")
        } catch {
            toast.error("Something went wrong while signing in")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Toaster />
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">Join Mystery Message</h1>
                <p className="mb-4">Sign In to start your anonymous adventure</p>
            </div>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                    <Controller
                        name="identifier"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    {...field}
                                    id="email"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Enter your email"
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
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input
                                    {...field}
                                    id="password"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Enter password"
                                    autoComplete="current-password"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </FieldGroup>
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                        </>) : ("Sign In")}
                    </Button>
                </div>
            </form>
            <div className="text-center mt-4">
                <p>
                    Register yourself!{' '}
                    <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
                        Sign Up
                    </Link>
                </p>
            </div>
            </div>
            
        </div>
    )
}

export default SignInPage;