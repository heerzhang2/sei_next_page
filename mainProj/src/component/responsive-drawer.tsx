"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"

export default function ResponsiveDrawer() {
  const [open, setOpen] = useState(false)
  const [toolbarHeight, setToolbarHeight] = useState(32) // Default toolbar height in pixels

  // Get toolbar height on mount and window resize
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Main content */}
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Responsive Drawer Example</h1>
        <Button onClick={() => setOpen(true)}>Open Drawer</Button>

        <div className="mt-8">
          <p>The drawer will:</p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>Display at 82vh height on large screens</li>
            <li>Display at (100vh - toolbar height) on small screens</li>
            <li>Adapt to both portrait and landscape orientations on mobile</li>
          </ul>
        </div>
      </div>



      {/* Drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent
          className={`
            bg-white 
            flex 
            flex-col 
            fixed 
            top-0 
            left-0 
            right-0 
            rounded-t-[10px]
            max-h-[70vh]            
            sm:max-h-[calc(100vh-${toolbarHeight}px)]
          `}
          style={{
            // Fallback for browsers that don't support calc in class names
            "--toolbar-height": `${toolbarHeight}px`,
          }}
        >
          <div className="p-4 flex-1 overflow-auto">
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-4">Drawer Content</h2>

            <div className="space-y-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="p-4 border rounded">
                  Item {i + 1}
                </div>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
