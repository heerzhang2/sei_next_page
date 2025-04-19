"use client"
import Link from 'next/link';
import {ContentSection} from "@/component/content-section";
import ReportOrRecord from "@/report/recreation/slidingJj/reportOrRecord";
import {TableOfContents} from "@/component/table-of-contents";
import {Button} from "@/components/ui/button";
import React, {useEffect, useRef, useState} from "react";
import {Drawer} from "vaul";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import { X } from 'lucide-react';
import {useEditControlContext} from "@/component/rep/editControl-provider";

interface SidebarProps {
    items: {
        title: string
        url: string
    }[]
}

export default function Sidebar({ items }: SidebarProps) {
    const { activeTab, setActiveTab } = useEditControlContext()
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen && setActiveTab !== null) {
            setActiveTab("preview");
        }
        setIsDialogOpen(newOpen)
    }

    // Create a separate function to open the sidebar
    const openSidebar = (e: React.MouseEvent) => {
        // This is crucial - we need to stop the event completely
        e.preventDefault();
        e.stopPropagation();
        if(setActiveTab!==null)  setActiveTab("preview");
        setIsDialogOpen(true);
        return false; // Ensure no further handling
    }

    return (
        <>
            {/* Desktop sidebar - always visible */}
            <div className="hidden xl:block w-64 shrink-0 border-l p-1">
                <div className="sticky top-16">
                    <TableOfContents items={items} />
                </div>
            </div>

            {/* Custom trigger button - NOT using Drawer.Trigger */}
            <div
                className="print:hidden xl:hidden fixed bottom-4 right-4 z-[1000]"
                style={{ isolation: 'isolate' }} // Creates a new stacking context
            >
                <Button
                    onClick={openSidebar}
                    className="h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full px-4 text-sm font-medium shadow-lg"
                >
                    Outline
                </Button>
            </div>

            {/* Mobile sidebar with Vaul drawer */}
            <Drawer.Root open={isDialogOpen} onOpenChange={handleOpenChange} direction={"right"}>
                {/* We don't use Drawer.Trigger anymore */}
                <Drawer.Portal>
                    {/* Transparent overlay that only blocks interactions */}
                    <Drawer.Overlay className="fixed inset-0 bg-transparent z-[1001]" />
                    <Drawer.Content
                        className={`bg-white flex flex-col fixed top-0 right-0 
                              rounded-l-[10px] w-[50vw] min-w-[15rem] max-w-[30rem] h-[100vh]
                              z-[1002] shadow-xl border-l border-gray-200
                            `}>
                        <div className="w-full h-full overflow-auto p-4 rounded-t-[10px]">
                            <div className="flex justify-between items-center mb-4">
                                <Drawer.Title className="font-medium text-gray-900">Outline</Drawer.Title>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="h-8 w-8"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <TableOfContents items={items} />
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        </>
    );
}
