"use client"
import type { Metadata } from 'next'
import {TableOfContents} from "@/component/table-of-contents";
import '@/app/globals.css'
import {Button} from "@/components/ui/button";
import {SplitView} from "@/components/split-view";
import {Code, X} from "lucide-react";
import {Dialog, DialogContent} from "@/components/ui/dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useEffect, useRef, useState} from "react";
import ReportOrRecord from "@/component/reportOrRecord";
import { Drawer } from 'vaul';



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
    const [isSmallScreen, setIsSmallScreen] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("editor")
    const hasMounted = useRef(false)
    const [isLandscape, setIsLandscape] = useState(false)    //若宽高相等的=false
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
        // Check orientation on initial render
        checkOrientation()
        // Add event listener for resize and orientation change
        window.addEventListener("resize", checkOrientation)
        window.addEventListener("orientationchange", checkOrientation)
        // Clean up event listeners
        return () => {
            window.removeEventListener("resize", checkOrientation)
            window.removeEventListener("orientationchange", checkOrientation)
        }
    }, [])

    return (
        <div className="flex min-h-screen">
            <div className="flex-1 overflow-auto">
                <div className="mx-auto max-w-4xl px-6 py-8">
                    <div className="flex flex-col min-h-screen">
                        <SplitView
                            className="flex-1"
                            defaultSplit={50}
                            minLeftWidth={0}
                            minRightWidth={0}
                            leftPanel={
                                <div className="h-full flex flex-col">
                                    <div className="border-b px-4 py-2 font-medium">Preview</div>
                                    {!isSmallScreen && (
                                        <ReportOrRecord id={""} />
                                    )}
                                </div>
                            }
                            rightPanel={
                                <div className="h-full flex flex-col">
                                        <div className="border-b px-4 py-2 font-medium flex items-center gap-2">
                                            <Code className="h-4 w-4" />
                                            Editor 编制
                                        </div>
                                        {children}
                                </div>
                            }
                        />

                        <Drawer.Root open={isDialogOpen} onOpenChange={setIsDialogOpen} direction={isLandscape ? "left" : "top"}>
                            <Drawer.Trigger className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white">
                                Open Drawer
                            </Drawer.Trigger>
                            <Drawer.Portal>
                                <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                                <Drawer.Content className={`bg-white flex flex-col fixed top-0 left-0 
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
                </div>
            </div>
        </div>
    )
}


/*若Drawer加上snapPoints用的transform: translate3d(0, var(--snap-point-height, 0), 0);不适合可变宽度的页面，无法全部显示。
className="@[min-height:1024px]:max-h-[85vh]"
max-h-[calc(100vh-100px-${toolbarHeight}px)]
calc(100vh-100px-${toolbarHeight}px)
<DrawerContent
  className={`max-h-[82vh]sm:max-h-[calc(100vh-${toolbarHeight}px)]`}
  style={{
    // Fallback for browsers that don't support calc
    '--toolbar-height': `${toolbarHeight}px`,
  }}
>
className={`
                                        bg-white
                                        flex
                                        flex-col
                                        fixed
                                        top-0
                                        left-0
                                        right-0
                                        rounded-t-[10px]
                                        max-h-[calc(100vh-18px)]
                                        max-h-[calc(100vh-32px)]
                                        lg:max-h-[75vh]
                                      `}
                                        portrait:h-[calc(100vh-18px)]
                                        portrait:max-h-[calc(100vh-18px)]
                                        portrait:h-lg:h-[85vh]
                                        portrait:h-lg:max-h-[85vh]
* */