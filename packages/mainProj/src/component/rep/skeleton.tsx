// src\component\rep\skeleton.tsx
"use client";

import "./skeleton.css";
import { Button } from "@/components/ui/button";
import { SplitViewSticky } from "@/components/split-view-sticky";
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { type ReportPanelType, useEditControlContext } from "@/component/rep/editControl-provider";
import { cn } from "@/lib/utils";

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

    // const globalEditorRef = useRef<HTMLDivElement>(null);
    const editorContentRef = useRef<HTMLDivElement>(null);
    const hiddenContainerRef = useRef<HTMLDivElement>(null);

    // 编辑器插槽引用
    const desktopSlotRef = useRef<HTMLDivElement>(null);
    const mobileLandscapeSlotRef = useRef<HTMLDivElement>(null);
    const mobilePortraitSlotRef = useRef<HTMLDivElement>(null);

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

    // 修复：确保编辑器内容只在编辑器标签激活时显示
    useEffect(() => {
        if (!editorContentRef.current) return;

        let targetSlot: HTMLElement | null = null;

        if (!isSmallScreen) {
            // 桌面模式 - 总是显示在右侧
            targetSlot = desktopSlotRef.current;
        } else {
            // 移动模式 - 只在编辑器标签激活时显示
            if (activeTab === 'editor') {
                if (isLandscape) {
                    targetSlot = mobileLandscapeSlotRef.current;
                } else {
                    targetSlot = mobilePortraitSlotRef.current;
                }
            } else {
                // 报告标签激活时，移回隐藏容器
                targetSlot = hiddenContainerRef.current;
            }
        }

        // 如果找到目标插槽且编辑器内容不在该插槽中，则移动
        if (targetSlot && editorContentRef.current.parentElement !== targetSlot) {
            // 保存滚动位置：获取当前父容器的 scrollTop
            const currentParent = editorContentRef.current.parentElement;
            const scrollTop = currentParent ? currentParent.scrollTop : 0;

            // 移动编辑器内容
            targetSlot.appendChild(editorContentRef.current);

            // 恢复滚动位置：设置新父容器的 scrollTop
            if (targetSlot !== hiddenContainerRef.current) { // 如果不是移到隐藏容器
                targetSlot.scrollTop = scrollTop;
            }
        }
    }, [isSmallScreen, isLandscape, activeTab]);

    const handleTabChange = (value: ReportPanelType) => {
        setActiveTab(value);
    };

    const scrollToTop = () => {
        const parent = editorContentRef.current?.parentElement;
        if (parent) {
            parent.scrollTop = 0; // 或者使用 parent.scrollTo({ top: 0, behavior: 'smooth' })
        }
    };

    const scrollToBottom = () => {
        const element = editorContentRef.current;
        if (element) {
            const parent = element.parentElement;
            if (parent) {
                parent.scrollTop = parent.scrollHeight; // 或者使用 parent.scrollTo({ top: parent.scrollHeight, behavior: 'smooth' })
            }
        }
    };

    const needScrollBtn = !isSmallScreen || (isSmallScreen && activeTab === "editor");
    const scrollBtnCls = isSmallScreen && isLandscape ? "flex-row" : "flex-col";

    // 缓存 children 和 repPanel
    const memoizedChildren = useMemo(() => children, [children]);
    const memoizedRepPanel = useMemo(() => repPanel, [repPanel]);

    const isDesktop = !isSmallScreen;
    const isMobileLandscape = isSmallScreen && isLandscape;
    const isMobilePortrait = isSmallScreen && !isLandscape;

    // 桌面端左侧面板
    const desktopLeftPanel = useMemo(() => (
        <div className="flex flex-col h-screen">
            <div className="overflow-auto flex-1 @container">{memoizedRepPanel}</div>
        </div>
    ), [memoizedRepPanel]);

    // 移动端横屏布局 - 修复：确保报告标签下不显示编辑器内容
    const mobileLandscapeTabs = useMemo(() => (
        <Tabs value={activeTab} orientation="vertical" className="w-full h-full flex! flex-row!">
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
            <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
                <div className="h-full min-h-0 overflow-hidden"> {/* 关键：添加 min-h-0 和 overflow-hidden */}
                    {activeTab === "preview" ? (
                        // 报告标签 - 只显示报告内容
                        <div className="h-full overflow-auto @container">
                            {memoizedRepPanel}
                        </div>
                    ) : (
                        // 编辑器标签 - 只显示编辑器插槽
                        <div className="mobile-editor-slot h-full overflow-auto" ref={mobileLandscapeSlotRef}>
                            {/* 编辑器内容将动态插入这里 */}
                        </div>
                    )}
                </div>
            </div>
        </Tabs>
    ), [activeTab, memoizedRepPanel]);

    // 移动端竖屏布局 - 修复滚动问题
    const mobilePortraitTabs = useMemo(() => (
        <Tabs value={activeTab} orientation="horizontal" className="flex! flex-col! h-full min-h-0"> {/* 关键：添加 min-h-0，使用 ! 覆盖默认样式 */}
            <div className="sticky top-0 bg-white border-b shadow-sm z-10 flex-shrink-0"> {/* 关键：添加 flex-shrink-0 */}
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
                            {activeTab === "editor" && (
                                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-primary-foreground rounded-full z-20 bg-red-600" />
                            )}
                        </TabsTrigger>
                    </TabsList>
                </div>
            </div>
            <div className="flex-1 min-h-0"> {/* 关键：使用 min-h-0 而不是固定高度 */}
                {activeTab === "preview" ? (
                    // 报告标签 - 只显示报告内容
                    <div className="h-full overflow-auto @container bg-background">
                        {memoizedRepPanel}
                    </div>
                ) : (
                    // 编辑器标签 - 只显示编辑器插槽
                    <div className="mobile-editor-slot h-full" ref={mobilePortraitSlotRef}>
                        {/* 编辑器内容将动态插入这里 */}
                    </div>
                )}
            </div>
        </Tabs>
    ), [activeTab, memoizedRepPanel]);

    return (
        <div className="flex flex-col h-screen">
            {/* 隐藏的编辑器容器 */}
            <div className="hidden-editor-container" ref={hiddenContainerRef}>
                {/* 不再需要 GlobalEditorContainer 包裹，或者保留但不传 ref */}
                <div className="global-editor-container">
                    <div ref={editorContentRef}>
                        {memoizedChildren}
                    </div>
                </div>
            </div>
            {needScrollBtn && (
                <div className={cn("fixed top-6 right-8 gap-7 flex z-40", scrollBtnCls)}>
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
            {/* 直接根据条件渲染，不再用 absolute 容器包裹 */}
            {isDesktop ? (
                <SplitViewSticky
                    className="flex-1 overflow-hidden" // 使用 flex-1 填充剩余空间
                    independentScrolling={true}
                    leftPanel={desktopLeftPanel}
                    rightPanel={
                        <div className={cn("h-full flex flex-col editor-panel w-full")}>
                            <div className="editor-slot h-full" ref={desktopSlotRef}>
                                {/* 编辑器内容将动态插入这里 */}
                            </div>
                        </div>
                    }
                    sticky={true}
                />
            ) : (
                // 移动端布局直接渲染，不包裹在 absolute div 内
                isMobileLandscape ? mobileLandscapeTabs : mobilePortraitTabs
            )}
        </div>
    );
}
