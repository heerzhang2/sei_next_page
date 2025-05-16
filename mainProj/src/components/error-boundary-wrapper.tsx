"use client"

import type { ReactNode } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { ErrorFallback } from "./error-fallback"

interface ErrorBoundaryWrapperProps {
  children: ReactNode
}

export function ErrorBoundaryWrapper({ children }: ErrorBoundaryWrapperProps) {
  return <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
}
