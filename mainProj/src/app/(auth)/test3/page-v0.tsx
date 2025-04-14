"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// Example schema - replace with your actual validation schema
const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
})

export default function FormWithScroll() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasErrors, setHasErrors] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
        },
    })

    // This effect runs after render when there are errors
    useEffect(() => {
        // Only run if we've attempted to submit and have errors
        if (isSubmitting && Object.keys(form.formState.errors).length > 0) {
            // Find the first error element
            const firstErrorField = document.querySelector('[aria-invalid="true"]')

            if (firstErrorField) {
                // Scroll to the error with a small offset
                firstErrorField.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                })

                // Focus on the error field
                if (firstErrorField instanceof HTMLElement) {
                    firstErrorField.focus()
                }
            }

            setIsSubmitting(false)
            setHasErrors(true)
        }
    }, [form.formState.errors, isSubmitting])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)

        // If we previously had errors, reset the flag
        if (hasErrors) {
            setHasErrors(false)
        }

        // Your form submission logic here
        console.log(values)

        // If submission is successful, reset the isSubmitting flag
        setIsSubmitting(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Your email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Form"}
                </Button>
            </form>
        </Form>
    )
}
