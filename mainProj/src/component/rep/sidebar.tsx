"use client"
import Link from 'next/link';
import {TableOfContents} from "@/component/table-of-contents";
import {Button} from "@/components/ui/button";
import React, {useEffect, useRef, useState} from "react";
import {Drawer} from "vaul";
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
        if (newOpen && setActiveTab!==null) {
            setActiveTab("preview");
        }
        setIsDialogOpen(newOpen)
    }

    return (
        <>
            {/* Desktop sidebar - always visible */}
            <div className="hidden xl:block w-64 shrink-0 border-l p-4">
                <div className="sticky top-16">
                    <TableOfContents items={items} />
                </div>
            </div>

            {/* Mobile sidebar with Vaul drawer */}
            <div className="print:hidden" style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
                <div style={{ pointerEvents: 'auto' }}>
                    <Drawer.Root open={isDialogOpen} onOpenChange={handleOpenChange} direction={"right"}>
                        <Drawer.Trigger className="flex xl:hidden fixed bottom-4 right-4 h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white">
                            Outline
                        </Drawer.Trigger>
                        <Drawer.Portal>
                            {/* Improved overlay with higher opacity and z-index */}
                            <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                            <Drawer.Content
                                className={`bg-white flex flex-col fixed top-0 right-0 
                                    rounded-l-[10px] w-[50vw] min-w-[15rem] max-w-[30rem] h-[100vh]
                                    z-[51] shadow-xl
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
                </div>
            </div>
        </>
    );
}
