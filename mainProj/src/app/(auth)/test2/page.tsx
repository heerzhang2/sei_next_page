"use client"

import type React from "react"

import { useState } from "react"
import { FormField } from "@/components/shub"
import { MemoDatesInput } from "@/components/chub"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface FormData {
  meetingNotes: string
  projectDeadlines: string
  importantDates: string
}

export default function MemoDatesExample() {
  const [formData, setFormData] = useState<FormData>({
    meetingNotes: "",
    projectDeadlines: "项目A截止 2023-06-15\n项目B开始 2023-07-01",
    importantDates: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [jsonResult, setJsonResult] = useState<string>("")

  const handleChange = (field: keyof FormData, value = "") => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when field is changed
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate required fields
    if (!formData.meetingNotes.trim()) {
      newErrors.meetingNotes = "会议记录是必填项"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Format data as JSON
      const jsonData = JSON.stringify(formData, null, 2)
      setJsonResult(jsonData)
      console.log("提交的数据:", jsonData)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">备忘录与日期 (容器查询版本)</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit} className="@container">
          <CardContent className="space-y-6">
            <div className="columns-1 @lg:columns-2">
              <FormField id="meetingNotes" label="会议记录" required error={errors.meetingNotes}>
                <MemoDatesInput
                  id="meetingNotes"
                  value={formData.meetingNotes}
                  onChange={(value) => handleChange("meetingNotes", value)}
                  rows={3}
                  placeholder="输入会议记录，可以添加日期"
                  required
                />
              </FormField>

              <FormField id="projectDeadlines" label="项目截止日期" error={errors.projectDeadlines}>
                <MemoDatesInput
                  id="projectDeadlines"
                  value={formData.projectDeadlines}
                  onChange={(value) => handleChange("projectDeadlines", value)}
                  rows={4}
                  placeholder="输入项目截止日期"
                  dateInputWidth="8rem"
                />
              </FormField>
            </div>

            <FormField id="importantDates" label="重要日期" error={errors.importantDates}>
              <MemoDatesInput
                id="importantDates"
                value={formData.importantDates}
                onChange={(value) => handleChange("importantDates", value)}
                rows={2}
                placeholder="输入重要日期"
                dateInputWidth="12rem"
              />
            </FormField>

            {jsonResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="text-lg font-medium mb-2">提交的JSON数据:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-60">{jsonResult}</pre>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end space-x-4 border-t p-6">
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              重置
            </Button>
            <Button type="submit">提交表单</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
