'use client'

import React from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

import { TableOfContents } from '@/component/table-of-contents'
import { useEditControlContext } from '@/component/rep/editControl-provider'
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

interface SidebarProps {
    items: {
        title: string
        url: string
    }[]
}

export default function ImprovedSidebar({ items }: SidebarProps) {
    const { activeTab, setActiveTab } = useEditControlContext()

    // Handle sidebar state changes
    const handleOpenChange = (open: boolean) => {
        if (open && setActiveTab !== null) {
            setActiveTab('preview')
        }
    }

    return (
        <SidebarProvider onOpenChange={handleOpenChange}>
            {/* Desktop sidebar - always visible */}
            <div className="hidden xl:block w-64 shrink-0 border-l p-4">
                <div className="sticky top-16">
                    <TableOfContents items={items} />
                </div>
            </div>

            {/* Mobile sidebar - uses shadcn Sidebar */}
            <div className="xl:hidden print:hidden">
                <Sidebar side="right" variant="floating" className="print:hidden">
                    <SidebarHeader className="flex justify-between items-center">
                        <h2 className="text-lg font-medium">Outline</h2>
                        <SidebarTrigger>
                            <X className="h-4 w-4" />
                        </SidebarTrigger>
                    </SidebarHeader>
                    <SidebarContent>
                        <div className="p-4">
                            <TableOfContents items={items} />
                        </div>
                    </SidebarContent>
                </Sidebar>

                {/* Trigger button */}
                <div className="fixed bottom-4 right-4 z-10 print:hidden">
                    <SidebarTrigger asChild>
                        <Button className="rounded-full shadow-lg">
                            Outline
                        </Button>
                    </SidebarTrigger>
                </div>
            </div>
        </SidebarProvider>
    )
}
