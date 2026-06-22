'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import React from 'react'
import { z } from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
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
import { Button } from '@/components/ui/button'
import { navigate } from 'next/dist/client/components/segment-cache/navigation'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'


const SignUpPage = () => {
 
   
    const formSchema = z.object({
        name: z.string().min(3, "The name must me aleast 3 characters long").max(50, "Name has to be in range below 50 characters or above 3"),
        email: z.email("Please enter valid email"),
        password: z.string().min(8).max(50),
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
        mode: "onChange"
    })

    const { signup } = useAuth()
    const  isSubmitting = form.formState.isSubmitting;
    const [errorMessage, setErrorMessage] = useState();

 const router = useRouter();

    async function onSubmit({ name, email, password }) {

        const response = await signup(name, email, password);
        if (response?.success) {
            toast.success("Thank you for registering account, Please login to continue", {
                position: "bottom-right",
            });
            // Redirect to the dashboard layout view
            router.push("/dashboard");
        } else {
            setErrorMessage(response?.message || "Authentication failed. Please try again.");
            toast.error(response?.message);
        }
    }







return (
    <div className='flex justify-center items-center w-screen h-screen'>
        <form onSubmit={form.handleSubmit(onSubmit)} method='POST'>
            <Card className="w-md gap-4 flex flex-col">
                <CardHeader>
                    <CardTitle className="font-bold"> Register for an account</CardTitle>
                    <CardDescription> Sign up for the account student and start your productivity increase</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col p-3 gap-4">
                    <Controller
                        name='name'
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="email" className="font-extrabold"> Full Name </FieldLabel>
                                <Input
                                    {...field}
                                    autoComplete="off"
                                    id="name"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="e.g Yaksh patel"
                                />

                                {fieldState.invalid && (<FieldError errors={[fieldState.error]}>

                                </FieldError>)

                                }

                            </Field>


                        )}

                    />

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
                                    placeholder="Create a strong password"
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
                <CardFooter className="flex flex-col gap-2">
                    <CardDescription> Already have an account? <Button variant="link" asChild>
                        <Link href="/login">Log In</Link>
                    </Button></CardDescription>
                    <Button type="submit" vairant="default" className="w-full" >Sign Up</Button>
                </CardFooter>




            </Card>


        </form>

    </div>
)
}

export default SignUpPage