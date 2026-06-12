"use client"

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from "zod"
import { toast } from 'sonner'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from '@/components/ui/button'
import { navigate } from 'next/dist/client/components/segment-cache/navigation'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'

const formSchema = z.object({
  email: z.string().email("Enter a valid email"), // Note: fixed z.email() typo to z.string().email() so it doesn't crash on render
  password: z.string().min(8).max(50),
})

const LoginPage = () => {
  // FIX: This hook belongs inside the component function body!
  const [errorMessage, seterrorMessage] = useState("")

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode:"onChange"
  })

  const {login} = useAuth();

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit({email, password}) {
    const response = await login(email, password);
    console.log(response);
  }

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)} method='POST'>

        <Card className="w-full max-w-sm p-4">
        <CardHeader>
        <CardTitle className="font-extrabold ">Login in your account </CardTitle>
        <CardDescription className="flex gap-3"> <p>Enter your credentials to start your study syncing right away</p> </CardDescription>
        
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email" className="font-extrabold">Email</FieldLabel>

              <Input
                {...field}
                id="email"
                aria-invalid={fieldState.invalid}
                placeholder="Enter your email"
                autoComplete="off"
                
              />

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

{/* password filed */}

         <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password" className="font-extrabold">Password</FieldLabel>

              <Input
                {...field}
                id="password"
                aria-invalid={fieldState.invalid}
                placeholder="Enter your password"
                autoComplete="off"

                type="password"
              />

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

         
        </CardContent>
        <CardFooter className="m-2 flex flex-col gap-2">
            <CardDescription> Sign up to register an account <Button variant="link" asChild>
        <Link href="/signup">Sign Up</Link>
      </Button></CardDescription>
<Button type="submit" vairant="default" className="w-full" >Login</Button>

        </CardFooter>

  

</Card>
      </form>
    </div>
  )
}

export default LoginPage