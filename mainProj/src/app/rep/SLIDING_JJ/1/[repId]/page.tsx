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


export default function Page() {
  let photos = Array.from({ length: 6 }, (_, i) => i + 1);
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSmallScreen, setIsSmallScreen] = useState(false)
    const hasMounted = useRef(false)
    useEffect(() => {
        const checkScreenSize = () => {
            const smallScreen = window.innerWidth < 1024
            setIsSmallScreen(smallScreen)
            if (hasMounted.current && smallScreen) {
                setIsDialogOpen(true)
            }
        }
        window.addEventListener("resize", checkScreenSize)
        return () => window.removeEventListener("resize", checkScreenSize)
    }, [])
    useEffect(() => {
        hasMounted.current = true
    }, [])

  return (
      <>
          <div className="flex-1 overflow-auto">
              <div className="mx-auto px-6 py-8">
                  <div  className="flex flex-col min-h-screen">
                      <header className="border-b">
                          <div className="container flex items-center justify-between h-14">
                              <h1 className="text-xl font-bold">Split View Demo</h1>

                          </div>
                      </header>
                      <ReportOrRecord id={''} />
                  </div>
              </div>
          </div>
          <>
              <Button className="block xl:hidden fixed bottom-0 right-0" variant="outline" onClick={() => setIsDialogOpen(true)}>
                  Outline
              </Button>
              <div className="hidden xl:block w-64 shrink-0 border-l p-4">
                  <div className="sticky top-16">
                      <TableOfContents items={tableOfContentsItems} />
                  </div>
              </div>
              <Drawer.Root open={isDialogOpen} onOpenChange={setIsDialogOpen} direction={"right"}>
                  <Drawer.Trigger className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white">
                      Open Drawer
                  </Drawer.Trigger>
                  <Drawer.Portal>
                      <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                      <Drawer.Content
                          className={`bg-white flex flex-col fixed top-0 right-0 
                            rounded-l-[10px] w-[50vw] min-w-[15rem] max-w-[30rem] h-[100vh]
                          `}
                      >
                          <div className="w-full h-full overflow-auto p-4 rounded-t-[10px]">
                              <Drawer.Title className="font-medium text-gray-900 mt-8">New Project
                              </Drawer.Title>
                              <TableOfContents items={tableOfContentsItems} />
                          </div>
                      </Drawer.Content>
                  </Drawer.Portal>
              </Drawer.Root>
          </>
      </>
  );
}

export const tableOfContentsItems = [
  { title: "Creating a page", url: "#creating-a-page" },
  { title: "Creating a layout", url: "#creating-a-layout" },
  { title: "Creating a nested route", url: "#creating-a-nested-route" },
  { title: "Nesting layouts", url: "#nesting-layouts" },
  { title: "Linking between pages", url: "#linking-between-pages" },
  { title: "API Reference", url: "#api-reference" },
  { title: "editfor-area-23", url: "#editfor-area-23" },
]
