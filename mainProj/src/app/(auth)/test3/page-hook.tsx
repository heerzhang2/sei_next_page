"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, X } from "lucide-react"

// Base schema with known fields
const baseSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    role: z.string().min(1, { message: "Please select a role" }),
    bio: z.string().optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
        message: "You must agree to the terms and conditions",
    }),
    // For dynamic fields, we'll use an array of custom fields
    customFields: z
        .array(
            z.object({
                key: z.string(),
                value: z.string(),
            }),
        )
        .optional()
        .default([]),
    // For truly dynamic fields that aren't known in advance
    // we use a record type that can accept any string key
    //动态字段列表存储{嵌套  z.record}
    dynamicData: z.record(z.string(), z.any()).optional().default({}),
})

// Type for our form values
type FormValues = z.infer<typeof baseSchema>

// Custom input component example
function CustomInput({ value, onChange, ...props }: any) {
    return (
        <div className="relative">
            <Input value={value || ""} onChange={onChange} className="pl-8" {...props} />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">#</span>
        </div>
    )
}

export default function AdvancedForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    //动态字段列表
    const [dynamicFields, setDynamicFields] = useState<string[]>([])

    // Initialize form with resolver and default values
    const form = useForm<FormValues>({
        resolver: zodResolver(baseSchema),
        defaultValues: {
            name: "",
            email: "",
            role: "",
            bio: "",
            agreeToTerms: false,
            customFields: [],
            dynamicData: {},
        },
    })

    // Setup field array for custom fields
    //原生做法：简单地 增加字段的。字段名也需要输入的做法：
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "customFields",
    })

    // Add a new dynamic field
    const addDynamicField = (fieldName: string) => {
        if (!dynamicFields.includes(fieldName) && fieldName.trim() !== "") {
            setDynamicFields([...dynamicFields, fieldName])

            // Set initial value in the form's dynamicData object
            const currentValues = form.getValues()
            form.setValue("dynamicData", {
                ...currentValues.dynamicData,
                [fieldName]: "",
            })
        }
    }

    // Effect for scrolling to errors
    useEffect(() => {
        if (isSubmitting && Object.keys(form.formState.errors).length > 0) {
            const firstErrorField = document.querySelector('[aria-invalid="true"]')
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" })
                if (firstErrorField instanceof HTMLElement) {
                    firstErrorField.focus()
                }
            }
            setIsSubmitting(false)
        }
    }, [form.formState.errors, isSubmitting])

    async function onSubmit(values: FormValues) {
        setIsSubmitting(true)
        console.log("Form values:", values)

        // Here you would normally send the data to your API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setIsSubmitting(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Regular Input */}
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

                {/* Regular Input */}
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

                {/* Select Component */}
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Textarea Component */}
                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Tell us about yourself" className="min-h-[100px]" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Checkbox Component */}
                <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>I agree to the terms and conditions</FormLabel>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />

                {/* Custom-1: customFields Input Component */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Custom-1 customFields Fields</h3>
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ key: "", value: "" })}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Field
                        </Button>
                    </div>

                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-4 items-start">
                            <FormField
                                control={form.control}
                                name={`customFields.${index}.key`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Field Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Field name" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`customFields.${index}.value`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Field Value</FormLabel>
                                        <FormControl>
                                            <CustomInput {...field} placeholder="Field value" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="button" variant="ghost" size="icon" className="mt-8" onClick={() => remove(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Dynamic Fields (added at runtime) */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Dynamic 无序列的动态-嵌套的对象 Fields</h3>
                        <div className="flex gap-2">
                            <Input
                                placeholder="New field name"
                                className="w-40"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        addDynamicField(e.currentTarget.value)
                                        e.currentTarget.value = ""
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement
                                    addDynamicField(input.value)
                                    input.value = ""
                                }}
                            >
                                Add
                            </Button>
                        </div>
                    </div>

                    {dynamicFields.map((fieldName) => (
                        <FormField
                            key={fieldName}
                            control={form.control}
                            name={`dynamicData.${fieldName}` as any}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{fieldName}</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={`Enter ${fieldName}`} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Form"}
                </Button>
            </form>
        </Form>
    )
}
