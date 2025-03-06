"use client"

import {TableOfContents} from "@/component/table-of-contents";
import {Button} from "@/components/ui/button";
import {useEffect, useRef, useState} from "react";

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
        { title: "editfor-area-23", url: "#editfor-area-23" },
    ]
    const [isSmallScreen, setIsSmallScreen] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
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

    return (<>
      <div   className="flex min-h-screen">
          <div className="flex-1 overflow-auto">
              <div className="mx-auto px-6 py-8">
                  <div  className="flex flex-col min-h-screen">
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
          <div className="hidden xl:block w-64 shrink-0 border-l p-4">
              <div className="sticky top-16">
                  <TableOfContents items={tableOfContentsItems} />
              </div>
          </div>
      </div>
        </>
  )
}
