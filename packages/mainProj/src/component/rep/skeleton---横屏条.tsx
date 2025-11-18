//src\component\rep\skeleton.tsx
"use client";

import "./skeleton.css";
import { Button } from "@/components/ui/button";
import { SplitViewSticky } from "@/components/split-view-sticky";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type React from "react";
import { useMemo, useState, useEffect, useRef, forwardRef } from "react";
import { type ReportPanelType, useEditControlContext } from "@/component/rep/editControl-provider";
import { cn } from "@/lib/utils";

// 🔑 关键：封装一个稳定的编辑器容器，避免因布局变化导致 children 重建
const EditorContainer = forwardRef<HTMLDivElement, { children: React.ReactNode, className?: string }>(
    ({ children, className = "" }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("h-full overflow-auto touch-pan-y touch-pinch-zoom", className)}
            >
                {children}
            </div>
        );
    }
);
EditorContainer.displayName = "EditorContainer";

/**
 * 报告记录结合显示的框架
 */
export default function Skeleton({
                                     children,
                                     repPanel,
                                 }: Readonly<{
    children: React.ReactNode;
    repPanel: React.ReactNode;
}>) {
    const [isSmallScreen, setIsSmallScreen] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth < 1024 : false
    );
    const { activeTab, setActiveTab } = useEditControlContext();
    const [isLandscape, setIsLandscape] = useState(false);

    // Refs for scroll containers
    const mobileEditorRef = useRef<HTMLDivElement>(null);
    const desktopEditorRef = useRef<HTMLDivElement>(null);

    // 🚫 移除 orientationchange，只监听 resize
    useEffect(() => {
        const handleResize = () => {
            const smallScreen = window.innerWidth < 1024;
            const landscape = window.innerWidth > window.innerHeight;
            setIsSmallScreen(smallScreen);
            setIsLandscape(landscape);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const handleTabChange = (value: ReportPanelType) => {
        setActiveTab(value);
    };

    const scrollToTop = () => {
        const ref = isSmallScreen ? mobileEditorRef : desktopEditorRef;
        ref.current?.scrollTo({ top: 0, behavior: "smooth" });
    };

    const scrollToBottom = () => {
        const ref = isSmallScreen ? mobileEditorRef : desktopEditorRef;
        if (ref.current) {
            ref.current.scrollTo({
                top: ref.current.scrollHeight,
                behavior: "smooth",
            });
        }
    };

    const needScrollBtn = !isSmallScreen || (isSmallScreen && activeTab === "editor");
    const scrollBtnCls = isSmallScreen && isLandscape ? "flex-row" : "flex-col";

    // 缓存 children 和 repPanel
    const memoizedChildren = useMemo(() => children, [children]);
    const memoizedRepPanel = useMemo(() => repPanel, [repPanel]);

    // 确定当前应显示的布局
    const isMobileLandscape = isSmallScreen && isLandscape;
    const isMobilePortrait = isSmallScreen && !isLandscape;

    return (
        <div className="flex flex-col">
            {needScrollBtn && (
                <div className={cn("fixed top-6 right-8 gap-7 flex z-40", scrollBtnCls)}>
                    <Button
                        variant="outline"
                        className="h-6 w-6 bg-white/50 backdrop-blur-[1px] border-transparent shadow-sm hover:bg-white/70 dark:bg-gray-800/50 dark:hover:bg-gray-800/70 rounded-full transition-all px-1 py-0"
                        onClick={scrollToTop}
                    >
                        <ChevronUp className="h-3 w-3" />
                        <span className="sr-only">滚动到头</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="h-6 w-6 bg-white/50 backdrop-blur-[1px] border-transparent shadow-sm hover:bg-white/70 dark:bg-gray-800/50 dark:hover:bg-gray-800/70 rounded-full transition-all px-1 py-0"
                        onClick={scrollToBottom}
                    >
                        <ChevronDown className="h-3 w-3" />
                        <span className="sr-only">滚动到底</span>
                    </Button>
                </div>
            )}

            {/* 桌面模式 */}
            {(!isSmallScreen) && (
                <SplitViewSticky
                    key="desktop-layout"
                    className="overflow-hidden"
                    defaultSplit={50}
                    minLeftWidth={0}
                    minRightWidth={0}
                    independentScrolling={true}
                    leftPanel={
                        <div className="flex flex-col h-screen">
                            <div className="overflow-auto flex-1 @container">{memoizedRepPanel}</div>
                        </div>
                    }
                    rightPanel={
                        <div className="h-full flex flex-col editor-panel">
                            <EditorContainer
                                ref={desktopEditorRef}
                                className="border rounded-md bg-muted/50 px-0 md:py-1"
                            >
                                {memoizedChildren}
                            </EditorContainer>
                        </div>
                    }
                    sticky={true}
                />
            )}

            {/* 移动端布局 */}
            {(isSmallScreen) && (
                <div className="h-screen bg-background">
                    {isMobileLandscape ? (
                        // 📱 横屏模式
                        <Tabs value={activeTab} className="w-full h-full flex">
                            {/* 左侧垂直 Tabs */}
                            <div className="sticky top-0 h-full flex items-center pt-10 z-10">
                                <TabsList className="flex flex-col h-auto py-4 space-y-4 bg-muted/30 vertical-tabs-list border-r">
                                    <TabsTrigger
                                        value="preview"
                                        className={cn(
                                            "vertical-tab-trigger px-3 py-6 relative transition-all duration-200",
                                            activeTab === "preview"
                                                ? "bg-primary text-primary-foreground shadow-md border-2 border-primary/20 scale-105"
                                                : "bg-background hover:bg-muted border-2 border-transparent hover:border-muted-foreground/20"
                                        )}
                                        onClick={() => handleTabChange("preview")}
                                    >
                                        <span className="vertical-text font-medium">报告</span>
                                        {activeTab === "preview" && (
                                            <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                                        )}
                                    </TabsTrigger>

                                    <TabsTrigger
                                        value="editor"
                                        className={cn(
                                            "vertical-tab-trigger px-3 py-6 relative transition-all duration-200",
                                            activeTab === "editor"
                                                ? "bg-primary text-primary-foreground shadow-md border-2 border-primary/20 scale-105"
                                                : "bg-background hover:bg-muted border-2 border-transparent hover:border-muted-foreground/20"
                                        )}
                                        onClick={() => handleTabChange("editor")}
                                    >
                                        <span className="vertical-text font-medium">编制</span>
                                        {activeTab === "editor" && (
                                            <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                                        )}
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* 右侧内容区 */}
                            <div className="flex-1 flex flex-col">
                                <div className="h-full">
                                    {activeTab === "preview" ? (
                                        <div className="px-0 md:py-1 border rounded-md bg-background h-full overflow-auto @container">
                                            {memoizedRepPanel}
                                        </div>
                                    ) : (
                                        <EditorContainer
                                            ref={mobileEditorRef}
                                            className="border rounded-md bg-muted/50 px-0 md:py-1"
                                        >
                                            {memoizedChildren}
                                        </EditorContainer>
                                    )}
                                </div>
                            </div>
                        </Tabs>
                    ) : (
                        // 📱 竖屏模式
                        <Tabs value={activeTab} className="flex flex-col h-full">
                            {/* 顶部水平 Tabs */}
                            <div className="sticky top-0 bg-white border-b shadow-sm z-10">
                                <div className="flex items-center justify-between p-0 pl-10">
                                    <TabsList className="grid w-full grid-cols-2 h-6 pt-0 bg-transparent p-0 gap-1">
                                        <TabsTrigger
                                            value="preview"
                                            className={cn(
                                                "h-6 relative transition-all duration-300 font-medium overflow-visible",
                                                activeTab === "preview"
                                                    ? "bg-primary text-primary-foreground shadow-md border-2 border-primary/20"
                                                    : "bg-muted/30 hover:bg-muted border-2 border-transparent hover:border-muted-foreground/20"
                                            )}
                                            onClick={() => handleTabChange("preview")}
                                        >
                                            报告
                                            {activeTab === "preview" && (
                                                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-red-600 rounded-full z-20" />
                                            )}
                                        </TabsTrigger>

                                        <TabsTrigger
                                            value="editor"
                                            className={cn(
                                                "h-6 relative transition-all duration-300 font-medium overflow-visible",
                                                activeTab === "editor"
                                                    ? "bg-primary text-primary-foreground shadow-md border-2 border-primary/20"
                                                    : "bg-muted/30 hover:bg-muted border-2 border-transparent hover:border-muted-foreground/20"
                                            )}
                                            onClick={() => handleTabChange("editor")}
                                        >
                                            编制
                                            {activeTab === "editor" && (
                                                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-red-600 rounded-full z-20" />
                                            )}
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                            </div>

                            {/* 内容区 */}
                            <div className="flex-1 flex flex-col">
                                <div className="h-full">
                                    {activeTab === "preview" ? (
                                        <div className="px-0 md:py-1 border rounded-md bg-background h-full overflow-auto @container">
                                            {memoizedRepPanel}
                                        </div>
                                    ) : (
                                        <EditorContainer
                                            ref={mobileEditorRef}
                                            className="border rounded-md bg-muted/50 px-0 md:py-1"
                                        >
                                            {memoizedChildren}
                                        </EditorContainer>
                                    )}
                                </div>
                            </div>
                        </Tabs>
                    )}
                </div>
            )}
        </div>
    );
}