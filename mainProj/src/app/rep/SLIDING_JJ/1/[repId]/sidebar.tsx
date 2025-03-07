"use client"
import Link from 'next/link';
import {ContentSection} from "@/component/content-section";
import ReportOrRecord from "@/component/reportOrRecord";
// import { ContentSection } from "./content-section"
import {TableOfContents} from "@/component/table-of-contents";
import {Button} from "@/components/ui/button";
import React, {useEffect, useRef, useState} from "react";
import {Drawer} from "vaul";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {X} from "lucide-react";
import {useEditControlContext} from "@/app/rep/SLIDING_JJ/1/[repId]/editControl-provider";

interface SidebarProps {
    items: {
        title: string
        url: string
    }[]
}

export default function Sidebar({ items }: SidebarProps) {
    const { activeTab, setActiveTab } = useEditControlContext()
    // let photos = Array.from({ length: 6 }, (_, i) => i + 1);
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen && setActiveTab!==null) {
            setActiveTab("preview");
        }
        setIsDialogOpen(newOpen)
    }

  return (
      <>
          <div className="hidden xl:block w-64 shrink-0 border-l p-4">
              <div className="sticky top-16">
                  <TableOfContents items={items} />
              </div>
          </div>
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
              <div style={{ pointerEvents: 'auto' }}>
                  <Drawer.Root open={isDialogOpen} onOpenChange={handleOpenChange} direction={"right"}>
                      <Drawer.Trigger className="flex xl:hidden fixed bottom-0 right-0 h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white">
                        Outline
                      </Drawer.Trigger>
                      <Drawer.Portal>
                          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                          <Drawer.Content
                              className={`bg-white flex flex-col fixed top-0 right-0 
                                    rounded-l-[10px] w-[50vw] min-w-[15rem] max-w-[30rem] h-[100vh]
                                  `}>
                              <div className="w-full h-full overflow-auto p-4 rounded-t-[10px]">
                                  <Drawer.Title className="font-medium text-gray-900 mt-8"></Drawer.Title>
                                  <TableOfContents items={items} />
                                  <Drawer.Description className="leading-6 mt-2 text-gray-600"></Drawer.Description>
                              </div>
                          </Drawer.Content>
                      </Drawer.Portal>
                  </Drawer.Root>
              </div>
          </div>
      </>
  );
}
