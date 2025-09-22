"use client"

import { useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface LoginRedirectConfirmProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    onConfirm: () => void
    onCancel?: () => void
}

export function LoginRedirectConfirm({
                                         open,
                                         onOpenChange,
                                         title,
                                         description,
                                         onConfirm,
                                         onCancel,
                                     }: LoginRedirectConfirmProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        onClick={() => {
                            onCancel?.()
                            onOpenChange(false)
                        }}
                    >
                        取消
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>确认</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export function useLoginRedirectConfirm() {
    const [isOpen, setIsOpen] = useState(false)
    const [config, setConfig] = useState<{
        title: string
        description: string
        onConfirm: () => void
        onCancel?: () => void
    }>({
        title: "",
        description: "",
        onConfirm: () => {},
    })

    const showConfirm = (title: string, description: string, onConfirm: () => void, onCancel?: () => void) => {
        setConfig({ title, description, onConfirm, onCancel })
        setIsOpen(true)
    }
    const hiddenConfirm = () => {
        setIsOpen(false)
    }
    const ConfirmDialog =<LoginRedirectConfirm
            open={isOpen}
            onOpenChange={setIsOpen}
            title={config.title}
            description={config.description}
            onConfirm={() => {
                config.onConfirm()
                setIsOpen(false)
            }}
            onCancel={config.onCancel}
        />

    return { showConfirm, ConfirmDialog, hiddenConfirm }
}
