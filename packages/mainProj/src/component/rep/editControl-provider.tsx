//src\component\rep\editControl-provider.tsx
"use client"

import type React from "react"
import { createContext, useState, useContext, type ReactNode } from "react"

export type ReportPanelType ="preview"|"editor"
// Define the shape of our context
type CountContextType = {
  activeTab: ReportPanelType
  setActiveTab: React.Dispatch<React.SetStateAction<ReportPanelType>>
}

// Create the context with a default value
export const EditControlContext = createContext<CountContextType | undefined>(undefined)

// Custom hook to use the context
export function useEditControlContext() {
  const context = useContext(EditControlContext)

  if (context === undefined) {
    throw new Error("useCountContext must be used within a EditControlContext")
  }

  return context
}

// Provider component
export function EditControlProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<ReportPanelType>("editor")

  // The value that will be provided to consumers
  const value = {
    activeTab,
    setActiveTab,
  }

  return <EditControlContext.Provider value={value}>{children}</EditControlContext.Provider>
}

