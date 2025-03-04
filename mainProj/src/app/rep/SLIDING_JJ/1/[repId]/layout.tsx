"use client"
import type { Metadata } from 'next'
import {TableOfContents} from "@/component/table-of-contents";
// import './globals.css'
import {Button} from "@/components/ui/button";
import {SplitView} from "@/components/split-view";
import {Code, X} from "lucide-react";
import {Dialog, DialogContent} from "@/components/ui/dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useEffect, useRef, useState} from "react";

// export const metadata: Metadata = {
//   title: 'v0 App',
//   description: 'Created with v0',
//   generator: 'v0.dev',
// }

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
    const tableOfContentsItems = [
        { title: "Creating a page", url: "#creating-a-page" },
        { title: "Creating a layout", url: "#creating-a-layout" },
        { title: "Creating a nested route", url: "#creating-a-nested-route" },
        { title: "Nesting layouts", url: "#nesting-layouts" },
        { title: "Linking between pages", url: "#linking-between-pages" },
        { title: "API Reference", url: "#api-reference" },
    ]
    const [isSmallScreen, setIsSmallScreen] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("preview")
    const hasMounted = useRef(false)
    const [code, setCode] = useState(`function greeting() {
  return "Hello, world!";
}

// Call the function
console.log(greeting());`)


    useEffect(() => {
        const checkScreenSize = () => {
            const smallScreen = window.innerWidth < 1024
            setIsSmallScreen(smallScreen)
            // Only open dialog if component has already mounted and we're transitioning to small screen
            if (hasMounted.current && smallScreen) {
                setIsDialogOpen(true)
            }
        }
        // checkScreenSize()
        window.addEventListener("resize", checkScreenSize)
        return () => window.removeEventListener("resize", checkScreenSize)
    }, [])
    useEffect(() => {
        // Set hasMounted to true after the initial render
        hasMounted.current = true
    }, [])



    return (<>
      <div className="flex min-h-screen">
          {/* Left sidebar navigation */}
          {/*<div className="hidden lg:block w-64 shrink-0 border-r p-4"> Left sidebar content </div>*/}

          {/* Main content */}
          <div className="flex-1 overflow-auto">
              <div className="mx-auto max-w-4xl px-6 py-8">

                  <div className="flex flex-col min-h-screen">
                      {/* Header */}
                      <header className="border-b">
                          <div className="container flex items-center justify-between h-14">
                              <h1 className="text-xl font-bold">Split View Demo</h1>
                              {isSmallScreen && (
                                  <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                                      Open Preview
                                  </Button>
                              )}
                          </div>
                      </header>

                      {children}

                  </div>


              </div>
          </div>

          {/* Right sidebar with table of contents */}
          <div className="hidden xl:block w-64 shrink-0 border-l p-4">
              <div className="sticky top-16">
                  <TableOfContents items={tableOfContentsItems} />
              </div>
          </div>
      </div>
        </>
  )
}
