"use client"
import "@/app/globals.css"
import "./split-view.css"
import { Button } from "@/components/ui/button"
import { SplitViewSticky } from "@/components/split-view-sticky"
import { X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReportOrRecord from "@/component/reportOrRecord"
import { Drawer } from "vaul"
import type React from "react"
import { useState, useEffect, useRef } from "react"

export default function Skelon({
                                   children,
                               }: Readonly<{
    children: React.ReactNode
}>) {
    const [isSmallScreen, setIsSmallScreen] = useState(() => {
        return typeof window !== "undefined" ? window.innerWidth < 1024 : false
    })
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("editor")
    const [isLandscape, setIsLandscape] = useState(false)

    // Refs for content scrolling
    const previewContentRef = useRef<HTMLDivElement>(null)
    const editorContentRef = useRef<HTMLDivElement>(null)
    const contentContainerRef = useRef<HTMLDivElement>(null)

    // Store scroll positions for each tab
    const [scrollPositions, setScrollPositions] = useState({
        preview: 0,
        editor: 0,
    })

    // Combined resize handler
    useEffect(() => {
        const handleResize = () => {
            // Check screen size
            const smallScreen = window.innerWidth < 1024
            setIsSmallScreen(smallScreen)
            // Check orientation
            setIsLandscape(window.innerWidth > window.innerHeight)
        }
        // Initial calls
        handleResize()
        // Add event listeners
        window.addEventListener("resize", handleResize)
        window.addEventListener("orientationchange", handleResize)
        // Cleanup
        return () => {
            window.removeEventListener("resize", handleResize)
            window.removeEventListener("orientationchange", handleResize)
        }
    }, [isSmallScreen])

    useEffect(() => {
        if (isSmallScreen) setIsDialogOpen(true)
    }, [isSmallScreen])

    // Save scroll position when scrolling
    useEffect(() => {
        const handleScroll = () => {
            if (contentContainerRef.current) {
                setScrollPositions((prev) => ({
                    ...prev,
                    [activeTab]: contentContainerRef.current?.scrollTop || 0,
                }))
            }
        }

        const container = contentContainerRef.current
        if (container) {
            container.addEventListener("scroll", handleScroll)
            return () => container.removeEventListener("scroll", handleScroll)
        }
    }, [activeTab, contentContainerRef])

    // Restore scroll position when tab changes
    useEffect(() => {
        if (contentContainerRef.current) {
            // Use requestAnimationFrame to ensure the DOM has updated
            requestAnimationFrame(() => {
                if (contentContainerRef.current) {
                    contentContainerRef.current.scrollTop = scrollPositions[activeTab]
                }
            })
        }
    }, [activeTab, scrollPositions])

    // Handle tab change
    const handleTabChange = (value: string) => {
        // Save current scroll position before changing tabs
        if (contentContainerRef.current) {
            setScrollPositions((prev) => ({
                ...prev,
                [activeTab]: contentContainerRef.current?.scrollTop || 0,
            }))
        }

        // Change the active tab
        setActiveTab(value)
    }

    return (
        <div className="flex flex-col split-view-container">
            <SplitViewSticky
                className="flex-1 overflow-auto"
                defaultSplit={50}
                minLeftWidth={0}
                minRightWidth={0}
                independentScrolling={true}
                leftPanel={
                    <div className="flex flex-col split-view-panel h-max">
                        <div className="overflow-auto flex-1">
                            <ReportOrRecord id={""} children={children} />
                        </div>
                    </div>
                }
                rightPanel={
                    isSmallScreen ? null : (
                        <div className="h-full flex flex-col editor-panel">
                            <div className="editor-content">{children}</div>
                        </div>
                    )
                }
                sticky={true}
            />

            <Drawer.Root open={isDialogOpen} onOpenChange={setIsDialogOpen} direction={isLandscape ? "left" : "top"}>
                <Drawer.Trigger className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white">
                    Open Drawer
                </Drawer.Trigger>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                    <Drawer.Content
                        className={`bg-white flex flex-col fixed top-0 left-0 
                            landscape:bottom-0 
                            portrait:right-0
                            landscape:rounded-r-[10px]
                            portrait:rounded-b-[10px]
                            landscape:w-[calc(100vw-18px)] 
                            landscape:max-w-[calc(100vw-18px)]
                            landscape:lg:max-w-[85vw]
                            sm-portrait:h-[calc(100vh-18px)]
                            lg-portrait:h-[85vh]
                          `}
                    >
                        <div className="w-full h-full overflow-auto p-4 rounded-t-[10px]">
                            <Drawer.Handle />
                            <Drawer.Title className="font-medium text-gray-900 mt-8">New Project</Drawer.Title>
                            <Drawer.Description className="leading-6 mt-2 text-gray-600">
                                Get started by filling in the information below to create your new project.
                            </Drawer.Description>

                            {/* Conditional rendering based on orientation */}
                            {isLandscape ? (
                                <Tabs value={activeTab}>
                                <div className="flex h-full mt-4">
                                    {/* Vertical tabs layout for landscape */}
                                    <div className="flex flex-col w-full h-full">
                                        <div className="flex items-center justify-between p-4 border-b">
                                            <h2 className="text-lg font-medium">Project Editor</h2>
                                            <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(false)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="flex flex-row h-full relative">
                                            {/* Sticky Vertical TabsList with vertical text */}
                                            <div className="sticky top-0 h-full flex items-center">
                                                <TabsList className="flex flex-col h-auto py-4 space-y-6 bg-muted/30 vertical-tabs-list">
                                                    <TabsTrigger
                                                        value="preview"
                                                        className="vertical-tab-trigger px-2 py-6"
                                                        onClick={() => handleTabChange("preview")}
                                                    >
                                                        <span className="vertical-text">Preview</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="editor"
                                                        className="vertical-tab-trigger px-2 py-6"
                                                        onClick={() => handleTabChange("editor")}
                                                    >
                                                        <span className="vertical-text">Editor</span>
                                                    </TabsTrigger>
                                                </TabsList>
                                            </div>

                                            {/* Content area with ref for scrolling */}
                                            <div ref={contentContainerRef} className="flex-1 overflow-auto">

                                                    <div ref={previewContentRef}>
                                                        <TabsContent value="preview" className="p-4 h-full m-0">
                                                            <div className="p-4 border rounded-md bg-background h-full overflow-auto">
                                                                <ReportOrRecord id={""} />
                                                            </div>
                                                        </TabsContent>
                                                    </div>
                                                    <div ref={editorContentRef}>
                                                        <TabsContent value="editor" className="p-4 h-full m-0">
                                                            <div className="p-4 border rounded-md bg-muted/50 h-full overflow-auto">{children}</div>
                                                        </TabsContent>
                                                    </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                </Tabs>
                            ) : (
                                /* Portrait mode with sticky tabs */
                                <div className="flex flex-col h-full">
                                    <div className="sticky top-0 z-10 bg-white border-b">
                                        <div className="flex items-center justify-between p-4">
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="preview" onClick={() => handleTabChange("preview")}>
                                                    Preview
                                                </TabsTrigger>
                                                <TabsTrigger value="editor" onClick={() => handleTabChange("editor")}>
                                                    Editor
                                                </TabsTrigger>
                                            </TabsList>

                                            <Button variant="ghost" size="icon" className="ml-2" onClick={() => setIsDialogOpen(false)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div ref={contentContainerRef} className="flex-1 overflow-auto">
                                        <Tabs value={activeTab}>
                                            <div ref={previewContentRef}>
                                                <TabsContent value="preview" className="p-4 h-full">
                                                    <div className="p-4 border rounded-md bg-background h-full overflow-auto">
                                                        <ReportOrRecord id={""} />
                                                    </div>
                                                </TabsContent>
                                            </div>
                                            <div ref={editorContentRef}>
                                                <TabsContent value="editor" className="p-4 h-full">
                                                    <div className="p-4 border rounded-md bg-muted/50 h-full overflow-auto">{children}</div>
                                                </TabsContent>
                                            </div>
                                        </Tabs>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        </div>
    )
}



/*
    <div className="split-view-sticky-container" ref={ref}>
      <div className={`split-view-sticky ${isSticky ? "sticky" : ""}`}>{children}</div>
      <style jsx>{`
        .split-view-sticky-container {
          position: relative;
        }
        .split-view-sticky {
          transition: top 0.3s;
        }
        .sticky {
          position: sticky;
          top: 0;
          z-index: 10;
          background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
`}</style>
    </div>
* */