"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { TabsList } from "@/components/ui/tabs"

interface ResponsiveTabsListProps extends React.ComponentPropsWithoutRef<typeof TabsList> {
  children: React.ReactNode
  scrollAmount?: number
  minTabWidth?: number
}

export function ResponsiveTabsList({
                                     children,
                                     className,
                                     scrollAmount = 360,
                                     minTabWidth = 60,
                                     ...props
                                   }: ResponsiveTabsListProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const tabsListRef = React.useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = React.useState(false)
  const [showRightArrow, setShowRightArrow] = React.useState(false)
  const [childCount, setChildCount] = React.useState(0)
  const [useScrollLayout, setUseScrollLayout] = React.useState(false)

  // Count the number of children to determine layout strategy
  React.useEffect(() => {
    if (React.Children.count(children) > 0) {
      setChildCount(React.Children.count(children))
    }
  }, [children])

  // Check if we need to use scroll layout based on available space
  React.useEffect(() => {
    const checkLayout = () => {
      if (tabsListRef.current && scrollContainerRef.current) {
        const containerWidth = scrollContainerRef.current.clientWidth
        const requiredWidth = childCount * minTabWidth

        // If the tabs would be too cramped, use scroll layout
        setUseScrollLayout(requiredWidth > containerWidth || childCount > 5)
      }
    }

    checkLayout()
    window.addEventListener("resize", checkLayout)
    return () => window.removeEventListener("resize", checkLayout)
  }, [childCount, minTabWidth])

  // Check if scrolling is needed
  const checkScroll = React.useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1) // -1 for rounding errors
    }
  }, [])

  // Add scroll event listener
  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScroll)
      // Initial check
      checkScroll()

      // Check again after content might have changed
      const resizeObserver = new ResizeObserver(() => {
        checkScroll()
      })
      resizeObserver.observe(scrollContainer)

      return () => {
        scrollContainer.removeEventListener("scroll", checkScroll)
        resizeObserver.disconnect()
      }
    }
  }, [checkScroll])

  // Scroll functions
  const scrollLeft = (e) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" })
    }
    e.preventDefault()
  }

  const scrollRight = (e) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
    e.preventDefault()
  }

  return (
      <div className="relative flex items-center w-full">
        {/* Left scroll button */}
        {showLeftArrow && useScrollLayout && (
            <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
                onClick={scrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">向左滚动</span>
            </Button>
        )}

        {/* Tabs container */}
        <div
            ref={scrollContainerRef}
            className={cn("w-full overflow-x-auto scrollbar-hide", useScrollLayout ? "px-4" : "")}
            style={{ scrollbarWidth: "none" }}
        >
          <TabsList
              ref={tabsListRef}
              className={cn(
                  // If using scroll layout, use inline-flex
                  useScrollLayout ? "inline-flex min-w-full" : "w-full grid",
                  // If few tabs and not using scroll layout, set grid columns based on count
                  !useScrollLayout && childCount === 2
                      ? "grid-cols-2"
                      : !useScrollLayout && childCount === 3
                          ? "grid-cols-3"
                          : !useScrollLayout && childCount === 4
                              ? "grid-cols-4"
                              : !useScrollLayout && childCount === 5
                                  ? "grid-cols-5"
                                  : "",
                  className,
              )}
              {...props}
          >
            {/* Apply minimum width to each tab trigger when using scroll layout */}
            {useScrollLayout
                ? React.Children.map(children, (child) => {
                  if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                      className: cn(child.props.className, `min-w-[${minTabWidth}px] whitespace-nowrap`),
                    })
                  }
                  return child
                })
                : children}
          </TabsList>
        </div>

        {/* Right scroll button */}
        {showRightArrow && useScrollLayout && (
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
                onClick={scrollRight}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">向右滚动</span>
            </Button>
        )}

        {/* Hide scrollbar styles */}
        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
  )
}
