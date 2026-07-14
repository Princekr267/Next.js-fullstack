'use client'
import { verifySchema } from '@/schemas/verifySchema'
import { ApiResponse } from '@/types/API_Response'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { useParams, useRouter } from 'next/navigation'
import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from "zod"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"


function VerifyAccount() {
    const router = useRouter()
    const params = useParams<{username: string}>()
    

    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema)
    })

    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        try{
            const response = await axios.post(`/api/verify-code`, {
                username: params.username,
                code: data.code
            })
            toast.success("Success", {
                description: response.data.message
            })
        } catch (err) {
            console.error("Error in signup of user", err)
            const axiosError = err as AxiosError<ApiResponse>;
            const errorMessage = axiosError.response?.data.message
            toast.error(errorMessage ?? "Signup failed")
        }
    }

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">Verify your account</h1>
                <p className="mb-4">Enter the verrification code sent to your email</p>
            </div>
             <form className='space-y-8' onSubmit={form.handleSubmit(onSubmit)}>
                <Controller
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Enter code</FieldLabel>
                    <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter your verification code here"
                        autoComplete="off"
                    />
                    
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                )}
                />
            </form>
        </div>
 
    </div>
  )
}

export default VerifyAccount