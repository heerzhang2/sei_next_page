"use client"

import React, { useState, useEffect, useRef } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import "./vertical-tabs.css"

export default function PreservedTabsContent({
                                                 children,
                                             }: Readonly<{
    children: React.ReactNode
}>) {
    const [isLandscape, setIsLandscape] = useState(false)
    const [activeTab, setActiveTab] = useState("tab1")

    // Store form input values to preserve them between tab switches
    const [formValues, setFormValues] = useState({
        tab1Input: "",
        tab2Input: "",
    })

    useEffect(() => {
        const handleResize = () => {
            setIsLandscape(window.innerWidth > window.innerHeight)
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        window.addEventListener("orientationchange", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
            window.removeEventListener("orientationchange", handleResize)
        }
    }, [])

    // Handle tab change - save scroll position before switching
    const handleTabChange = (value: string) => {
        // Change the active tab
        setActiveTab(value)
    }

    // Handle input changes to preserve form values
    const handleInputChange = (tab: string, value: string) => {
        setFormValues((prev) => ({
            ...prev,
            [`${tab}Input`]: value,
        }))
    }

    // Generate content with form inputs for demonstration
    const generateTabContent = (tabName: string, tabKey: "tab1Input" | "tab2Input") => {
        return (
            <div className="space-y-6">
                <h3 className="text-lg font-medium">{tabName} Content</h3>
                <p className="text-muted-foreground">
                    This tab preserves form input values and scroll position when switching tabs.
                </p>

                <div className="p-4 border rounded-md">
                    <label htmlFor={`${tabName}-input`} className="block text-sm font-medium mb-2">
                        Enter some text (will be preserved when switching tabs):
                    </label>
                    <input
                        id={`${tabName}-input`}
                        type="text"
                        value={formValues[tabKey]}
                        onChange={(e) => handleInputChange(tabName.toLowerCase().replace(" ", ""), e.target.value)}
                        className="w-full p-2 border rounded-md"
                        placeholder="Type something here..."
                    />
                </div>

                {/* Additional content to make it scrollable */}
                <div className="mt-8 space-y-4">
                    {Array.from({ length:"Tab 2"===tabName? 1: 20 }).map((_, i) => (
                        <div key={i} className="p-4 border rounded-md">
                            <h4 className="font-medium">Section {i + 1}</h4>
                            <p>
                                This is section {i + 1} of the {tabName} content.
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const tabs_content=<div className="flex-1">
        {/* We use CSS to hide/show content instead of unmounting */}
        <div className="h-full">
            <div className={`${activeTab === "tab1" ? "block" : "hidden"} h-full`}>
                <div
                    className="border rounded-md bg-background h-full overflow-auto p-4 scrollable-content"
                >
                    {generateTabContent("Tab 1", "tab1Input")}
                </div>
            </div>
            <div className={`${activeTab === "tab2" ? "block" : "hidden"} h-full`}>
                <div
                    className="border rounded-md bg-background h-full overflow-auto p-4 scrollable-content"
                >
                    {generateTabContent("Tab 2", "tab2Input")}
                </div>
            </div>
        </div>
    </div>;

    // SOLUTION 1: Using CSS to preserve tab content in the DOM
        return ( isLandscape?
            <div className="w-full h-[80vh] border rounded-md">
                <div className="p-4 bg-muted/20 border-b">
                    <h2 className="text-xl font-bold">Preserved Tab Content Demo</h2>
                    <p className="text-sm text-muted-foreground">
                        Form inputs and scroll positions are preserved when switching tabs
                    </p>
                </div>

                <div className="flex h-full">
                    {/* This is the correct structure for Tabs */}
                    <Tabs value={activeTab} className="w-full flex">
                        <div className="sticky top-0 h-full flex items-center">
                            <TabsList className="flex flex-col h-auto py-4 space-y-6 bg-muted/30 vertical-tabs-list">
                                <TabsTrigger
                                    value="tab1"
                                    className="vertical-tab-trigger px-2 py-6"
                                    onClick={() => handleTabChange("tab1")}
                                >
                                    <span className="vertical-text">Tab 1</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="tab2"
                                    className="vertical-tab-trigger px-2 py-6"
                                    onClick={() => handleTabChange("tab2")}
                                >
                                    <span className="vertical-text">Tab 2</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        {tabs_content}

                    </Tabs>
                </div>
            </div>
        :
            <div className="w-full h-[80vh] border rounded-md">
                <div className="p-4 bg-muted/20 border-b">
                    <h2 className="text-xl font-bold">Preserved Tab Content Demo</h2>
                    <p className="text-sm text-muted-foreground">
                        Form inputs and scroll positions are preserved when switching tabs
                    </p>
                </div>
                <Tabs value={activeTab} className="h-full flex flex-col">
                <div className="flex flex-col h-full">
                    {/* This is the correct structure for Tabs */}

                        <div className="sticky top-0 z-10 bg-white border-b sticky-tabs-container">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="tab1" onClick={() => handleTabChange("tab1")}>
                                    Tab 1
                                </TabsTrigger>
                                <TabsTrigger value="tab2" onClick={() => handleTabChange("tab2")}>
                                    Tab 2
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        {tabs_content}


                </div>
            </Tabs>
            </div>
        )

}

