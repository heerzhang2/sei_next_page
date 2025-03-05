"use client"
import '@/app/globals.css'
import "./split-view.css"
import {Button} from "@/components/ui/button";
import {SplitViewSticky} from "@/components/split-view-sticky";
import {X} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useEffect, useRef, useState} from "react";
import ReportOrRecord from "@/component/reportOrRecord";
import {Drawer} from 'vaul';


export default function Skelon({
                                   children,
                               }: Readonly<{
    children: React.ReactNode
}>) {
    const [isSmallScreen, setIsSmallScreen] = useState(() => {
        return window.innerWidth < 1024
    })
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("editor")
    const hasMounted = useRef(false)
    const [isLandscape, setIsLandscape] = useState(false) //若宽高相等的=false
    useEffect(() => {
        const checkScreenSize = () => {
            const smallScreen = window.innerWidth < 1024
            setIsSmallScreen(smallScreen)
            if (hasMounted.current && smallScreen) {
                setIsDialogOpen(true)
            }
        }
        setIsSmallScreen(window.innerWidth < 1024);
        window.addEventListener("resize", checkScreenSize)
        return () => window.removeEventListener("resize", checkScreenSize)
    }, [])
    useEffect(() => {
        // Set hasMounted to true after the initial render
        hasMounted.current = true
    }, [])

    const [toolbarHeight, setToolbarHeight] = useState(32) // Default toolbar height in pixels
    useEffect(() => {
        const toolbar = document.getElementById("button-toolbar")
        const updateToolbarHeight = () => {
            if (toolbar) {
                setToolbarHeight(toolbar.offsetHeight)
            }
        }
        updateToolbarHeight()
        window.addEventListener("resize", updateToolbarHeight)
        return () => {
            window.removeEventListener("resize", updateToolbarHeight)
        }
    }, [])
    const checkOrientation = () => {
        if (typeof window !== "undefined") {
            setIsLandscape(window.innerWidth > window.innerHeight)
        }
    }
    useEffect(() => {
        checkOrientation()
        window.addEventListener("resize", checkOrientation)
        window.addEventListener("orientationchange", checkOrientation)
        return () => {
            window.removeEventListener("resize", checkOrientation)
            window.removeEventListener("orientationchange", checkOrientation)
        }
    }, [])


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
                            <ReportOrRecord id={""} />
                        </div>
                    </div>
                }
                rightPanel={
                    isSmallScreen ? null:
                    <div className="h-full flex flex-col editor-panel">
                        <div className="editor-content">{children}</div>
                    </div>
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
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="flex items-center justify-between p-4 border-b">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="preview">Preview</TabsTrigger>
                                        <TabsTrigger value="editor">editor</TabsTrigger>
                                    </TabsList>

                                    <Button variant="ghost" size="icon" className="ml-2" onClick={() => setIsDialogOpen(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex-1 overflow-auto">
                                    <TabsContent value="preview" className="p-4 h-full">
                                        <div className="p-4 border rounded-md bg-background h-full overflow-auto">
                                            <ReportOrRecord id={""} />
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="editor" className="p-4 h-full">
                                        <div className="p-4 border rounded-md bg-muted/50 h-full overflow-auto">{children}</div>
                                    </TabsContent>
                                </div>
                            </Tabs>
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