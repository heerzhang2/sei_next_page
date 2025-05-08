"use client"
// import "@/app/globals.css"
import "./skeleton.css"
import { Button } from "@/components/ui/button"
import { SplitViewSticky } from "@/components/split-view-sticky"
import { X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReportOrRecord from "@/report/recreation/slidingJj/reportOrRecord"
import { Drawer } from "vaul"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import {ReportPanelType, useEditControlContext} from "@/component/rep/editControl-provider";

/**报告记录结合显示的框架
* */
export default function Skeleton({
                                   children,repPanel
                               }: Readonly<{
    children: React.ReactNode,
    repPanel: React.ReactNode
}>) {
    const [isSmallScreen, setIsSmallScreen] = useState(() => {
        return typeof window !== "undefined" ? window.innerWidth < 1024 : false
    })
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const { activeTab, setActiveTab } = useEditControlContext()

    const [isLandscape, setIsLandscape] = useState(false)

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

    // Handle tab change
    const handleTabChange = (value: ReportPanelType) => {
        // Change the active tab
        setActiveTab(value)
    }

    return (
       <div className="flex flex-col">
            {isSmallScreen? <>
                {isLandscape ? (
                    <div className="flex h-full">
                        {/*手机横屏的 Vertical tabs layout for landscape */}
                        <div className="flex flex-col w-full h-full">
{/*                            <div className="hidden flex items-center justify-between p-4 border-b">
                                <h2 className="text-lg font-medium">Project Editor</h2>
                                <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>*/}
                            <Tabs value={activeTab}>
                                <div className="flex flex-row h-screen relative">
                                    {/* Sticky Vertical TabsList with vertical text */}
                                    <div className="sticky top-0 h-full flex items-center">
                                        <TabsList
                                            className="flex flex-col h-auto py-4 space-y-6 bg-muted/30 vertical-tabs-list">
                                            <TabsTrigger
                                                value="preview"
                                                className="vertical-tab-trigger px-2 py-6"
                                                onClick={() => handleTabChange("preview")}
                                            >
                                                <span className="vertical-text">报告</span>
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="editor"
                                                className="vertical-tab-trigger px-2 py-6"
                                                onClick={() => handleTabChange("editor")}
                                            >
                                                <span className="vertical-text">编制</span>
                                            </TabsTrigger>
                                            <Button variant="ghost" size="icon" className="ml-2"
                                                    onClick={() => setIsDialogOpen(false)}>
                                                <X className="h-4 w-4"/>
                                            </Button>
                                        </TabsList>
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-screen">
                                            <div
                                                className={`${activeTab === "preview" ? "block" : "hidden"} h-full p-0`}>
                                                <div
                                                    className="px-0 md:py-1 border rounded-md bg-background h-full overflow-auto ">
                                                    {repPanel}
                                                </div>
                                            </div>
                                            <div
                                                className={`${activeTab === "editor" ? "block" : "hidden"} h-full p-0`}>
                                                <div
                                                    className="px-0 md:py-1 border rounded-md bg-muted/50 h-full overflow-auto  touch-pan-y touch-pinch-zoom">
                                                    {children}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Tabs>
                        </div>
                    </div>

                ) : (
                    /*手机竖屏的 Portrait mode with sticky tabs */
                    <Tabs value={activeTab}>
                        <div className="flex flex-col h-screen">
                            <div className="sticky top-0  bg-white border-b">
                                <div className="flex items-center justify-between p-0">
                                    <TabsList className="grid w-full grid-cols-2 h-6 pt-0">
                                        <TabsTrigger value="preview" className="h-6"
                                                     onClick={() => handleTabChange("preview")}>
                                            报告
                                        </TabsTrigger>
                                        <TabsTrigger value="editor" className="h-6"
                                                     onClick={() => handleTabChange("editor")}>
                                            编制
                                        </TabsTrigger>
                                    </TabsList>
                                    <Button variant="ghost" size="sm" className="ml-2"
                                            onClick={() => setIsDialogOpen(false)}>
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="h-[calc(100vh-33px)]">
                                    <div className={`${activeTab === "preview" ? "block" : "hidden"} h-full p-0`}>
                                        <div
                                            className="px-0 md:py-1 border rounded-md bg-background h-full overflow-auto ">
                                            {repPanel}
                                        </div>
                                    </div>
                                    <div className={`${activeTab === "editor" ? "block" : "hidden"} h-full p-0`}>
                                        <div id='tabEditor-boundary'
                                            className="px-0 md:py-1 border rounded-md bg-muted/50 h-full overflow-auto ">
                                            {children}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Tabs>
                )}
                </>
                :
                <SplitViewSticky      //正常电脑屏幕的,overflow-hidden避免右半边页面俩个滚动条。
                    className="overflow-hidden"
                    defaultSplit={50}
                    minLeftWidth={0}
                    minRightWidth={0}
                    independentScrolling={true}
                    leftPanel={
                        <div className="flex flex-col h-screen">
                            <div className="overflow-auto flex-1">
                                {repPanel}
                            </div>
                        </div>
                    }
                    rightPanel={
                        <div className="h-full flex flex-col editor-panel">
                            <div className="editor-content">{children}</div>
                        </div>
                    }
                    sticky={true}
               />
            }
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