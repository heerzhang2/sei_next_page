"use client"
import "./skeleton.css"
import { Button } from "@/components/ui/button"
import { SplitViewSticky } from "@/components/split-view-sticky"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { type ReportPanelType, useEditControlContext } from "@/component/rep/editControl-provider"

/**报告记录结合显示的框架
 * */
export default function Skeleton({
                                     children,
                                     repPanel,
                                 }: Readonly<{
    children: React.ReactNode
    repPanel: React.ReactNode
}>) {
    const [isSmallScreen, setIsSmallScreen] = useState(() => {
        return typeof window !== "undefined" ? window.innerWidth < 1024 : false
    })
    const { activeTab, setActiveTab } = useEditControlContext()
    const [isLandscape, setIsLandscape] = useState(false)
    // Refs for scroll containers
    const mobileEditorRef = useRef<HTMLDivElement>(null)
    const desktopEditorRef = useRef<HTMLDivElement>(null)

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

    // Handle tab change
    const handleTabChange = (value: ReportPanelType) => {
        // Change the active tab
        setActiveTab(value)
    }

    // Scroll functions
    const scrollToTop = () => {
        if (isSmallScreen) {
            mobileEditorRef.current?.scrollTo({ top: 0, behavior: "smooth" })
        } else {
            desktopEditorRef.current?.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    const scrollToBottom = () => {
        if (isSmallScreen) {
            if (mobileEditorRef.current) {
                mobileEditorRef.current.scrollTo({
                    top: mobileEditorRef.current.scrollHeight,
                    behavior: "smooth",
                })
            }
        } else {
            if (desktopEditorRef.current) {
                desktopEditorRef.current.scrollTo({
                    top: desktopEditorRef.current.scrollHeight,
                    behavior: "smooth",
                })
            }
        }
    }
    const needScrollBtn = !isSmallScreen || (isSmallScreen && activeTab === "editor")
    return (
        <div className="flex flex-col">
            {needScrollBtn && (
                <div className="fixed top-6 right-8 flex flex-col gap-7 z-40">
                    <Button
                        variant="outline"
                        className="h-6 w-6 bg-white/50 backdrop-blur-[1px] border-transparent shadow-sm hover:bg-white/70 dark:bg-gray-800/50 dark:hover:bg-gray-800/70 rounded-full transition-all px-1 py-0" // 关键修改
                        onClick={scrollToTop}
                    >
                        <ChevronUp className="h-3 w-3" />
                        <span className="sr-only">滚动到头</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="h-6 w-6 bg-white/50 backdrop-blur-[1px] border-transparent shadow-sm hover:bg-white/70 dark:bg-gray-800/50 dark:hover:bg-gray-800/70 rounded-full transition-all px-1 py-0" // 关键修改
                        onClick={scrollToBottom}
                    >
                        <ChevronDown className="h-3 w-3" />
                        <span className="sr-only">滚动到底</span>
                    </Button>
                </div>
            )}

            {isSmallScreen ? (
                <>
                    {isLandscape ? (
                        <div className="flex h-screen bg-background">
                            <div className="flex flex-col w-full h-full">
                                <Tabs value={activeTab}>
                                    <div className="flex flex-row h-screen relative">
                                        {/* Enhanced Sticky Vertical TabsList */}
                                        <div className="sticky top-0 h-full flex items-center pt-10">
                                            <TabsList className="flex flex-col h-auto py-4 space-y-4 bg-muted/30 vertical-tabs-list border-r">
                                                <TabsTrigger
                                                    value="preview"
                                                    className={`
                                                        vertical-tab-trigger px-3 py-6 relative transition-all duration-200
                                                        ${
                                                        activeTab === "preview"
                                                            ? "bg-primary text-primary-foreground shadow-md border-2 border-primary/20 scale-105"
                                                            : "bg-background hover:bg-muted border-2 border-transparent hover:border-muted-foreground/20"
                                                    }
                                                      `}
                                                    onClick={() => handleTabChange("preview")}
                                                >
                                                    <span className="vertical-text font-medium">报告</span>
                                                    {/* 激活指示器 */}
                                                    {activeTab === "preview" && (
                                                        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                                                    )}
                                                </TabsTrigger>

                                                <TabsTrigger
                                                    value="editor"
                                                    className={`
                                                        vertical-tab-trigger px-3 py-6 relative transition-all duration-200
                                                        ${
                                                        activeTab === "editor"
                                                            ? "bg-primary text-primary-foreground shadow-md border-2 border-primary/20 scale-105"
                                                            : "bg-background hover:bg-muted border-2 border-transparent hover:border-muted-foreground/20"
                                                    }
                                                      `}
                                                    onClick={() => handleTabChange("editor")}
                                                >
                                                    <span className="vertical-text font-medium">编制</span>
                                                    {/* 激活指示器 */}
                                                    {activeTab === "editor" && (
                                                        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                                                    )}
                                                </TabsTrigger>
                                            </TabsList>
                                        </div>

                                        <div className="flex-1">
                                            <div className="h-screen">
                                                <div className={`${activeTab === "preview" ? "block" : "hidden"} h-full p-0`}>
                                                    <div className="px-0 md:py-1 border rounded-md bg-background h-full overflow-auto">
                                                        {repPanel}
                                                    </div>
                                                </div>
                                                <div className={`${activeTab === "editor" ? "block" : "hidden"} h-full p-0`}>
                                                    <div ref={mobileEditorRef}
                                                        id="tabEditor-boundary"
                                                        className="px-0 md:py-1 border rounded-md bg-muted/50 h-full overflow-auto touch-pan-y touch-pinch-zoom"
                                                    >
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
                        // 手机竖屏的 Portrait mode with enhanced sticky tabs
                        <Tabs value={activeTab}>
                            <div className="flex flex-col h-screen">
                                <div className="sticky top-0 bg-white border-b shadow-sm z-10">
                                    <div className="flex items-center justify-between p-0 pl-10">
                                        <TabsList className="grid w-full grid-cols-2 h-6 pt-0 bg-transparent p-0 gap-1">
                                            <TabsTrigger
                                                value="preview"
                                                className={`
                            h-6 relative transition-all duration-300 font-medium overflow-visible
                            ${
                                                    activeTab === "preview"
                                                        ? "bg-primary text-primary-foreground shadow-md border-2 border-primary/20"
                                                        : "bg-muted/30 hover:bg-muted border-2 border-transparent hover:border-muted-foreground/20"
                                                }
                          `}
                                                onClick={() => handleTabChange("preview")}
                                            >
                                                报告
                                                {/* 底部激活指示器 */}
                                                {activeTab === "preview" && (
                                                    <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-primary-foreground rounded-full z-20 bg-red-600" />
                                                )}
                                            </TabsTrigger>

                                            <TabsTrigger
                                                value="editor"
                                                className={`
                            h-6 relative transition-all duration-300 font-medium overflow-visible
                            ${
                                                    activeTab === "editor"
                                                        ? "bg-primary text-primary-foreground shadow-md border-2 border-primary/20"
                                                        : "bg-muted/30 hover:bg-muted border-2 border-transparent hover:border-muted-foreground/20"
                                                }
                          `}
                                                onClick={() => handleTabChange("editor")}
                                            >
                                                编制
                                                {/* 底部激活指示器 */}
                                                {activeTab === "editor" && (
                                                    <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-primary-foreground rounded-full z-20 bg-red-600" />
                                                )}
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="h-[calc(100vh-33px)]">
                                        <div className={`${activeTab === "preview" ? "block" : "hidden"} h-full p-0`}>
                                            <div className="px-0 md:py-1 border rounded-md bg-background h-full overflow-auto">
                                                {repPanel}
                                            </div>
                                        </div>
                                        <div className={`${activeTab === "editor" ? "block" : "hidden"} h-full p-0`}>
                                            <div
                                                ref={mobileEditorRef}
                                                id="tabEditor-boundary"
                                                className="px-0 md:py-1 border rounded-md bg-muted/50 h-full overflow-auto touch-pan-y touch-pinch-zoom"
                                            >
                                                {children}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Tabs>
                    )}
                </>
            ) : (
                <SplitViewSticky //正常电脑屏幕的,overflow-hidden避免右半边页面俩个滚动条。
                    className="overflow-hidden"
                    defaultSplit={50}
                    minLeftWidth={0}
                    minRightWidth={0}
                    independentScrolling={true}
                    leftPanel={
                        <div className="flex flex-col h-screen">
                            <div className="overflow-auto flex-1">{repPanel}</div>
                        </div>
                    }
                    rightPanel={
                        <div className="h-full flex flex-col editor-panel">
                            <div ref={desktopEditorRef} className="editor-content overflow-auto">
                                {children}
                            </div>
                        </div>
                    }
                    sticky={true}
                />
            )}
        </div>
    )
}
