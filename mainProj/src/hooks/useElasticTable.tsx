"use client"
import React, { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {Each_ZdSetting} from "@/report/hook/use-table-edit";

interface ElasticTableProps {
    // Table content array
    content: any[]
    // Table basic configuration with multiple fields
    config: Each_ZdSetting[]
    /**
     * Horizontal axis X stretching based on browser available screen area size
     * Default values = [1, 1.35, 1.70] representing stretching factors for
     * [small screen, computer screen/tablet, large desktop screen]
     */
    stretchF?: number[]
    slash?: boolean
    // Need to insert sequence numbers 1, 2, 3...
    seqT?: any
    // Sequence column width in px
    seqCw?: number
}

/**
 * Elastic table with row folding, similar to useRepTableEditor
 * Limitation: Regular linear table, no concept of span/row merging
 */
export function ElasticTable({
                                 content,
                                 config,
                                 stretchF = [1, 1.35, 1.7],
                                 slash,
                                 seqT,
                                 seqCw = 20,
                             }: ElasticTableProps) {
    // Create a ref for the table container
    const dytilRef = useRef<HTMLDivElement>(null)

    // State for window dimensions
    const [windowSize, setWindowSize] = useState({
        innerWidth: typeof window !== "undefined" ? window.innerWidth : 0,
        innerHeight: typeof window !== "undefined" ? window.innerHeight : 0,
    })

    // State for container width
    const [containerWidth, setContainerWidth] = useState(0)

    // Update window size on resize
    useEffect(() => {
        function handleResize() {
            setWindowSize({
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
            })
        }

        window.addEventListener("resize", handleResize)
        handleResize()

        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // Measure container width
    useEffect(() => {
        if (dytilRef.current) {
            setContainerWidth(dytilRef.current.offsetWidth)
        }

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width)
            }
        })

        if (dytilRef.current) {
            resizeObserver.observe(dytilRef.current)
        }

        return () => {
            if (dytilRef.current) {
                resizeObserver.unobserve(dytilRef.current)
            }
        }
    }, [dytilRef])

    // Add sequence number column if needed
    const configNew = React.useMemo(() => {
        if (seqT) return [[seqT, "_S", seqCw], ...config]
        else return config
    }, [config, seqT, seqCw])

    // Determine screen type based on dimensions
    const screenTp =
        windowSize.innerHeight > 860 && containerWidth > 1700
            ? 2
            : windowSize.innerHeight > 740 && containerWidth > 1280
                ? 1
                : 0

    const linecnt = content?.length // Total number of rows

    return (
        <div ref={dytilRef} className="box-border">
            <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-50 z-10 border-collapse table-header-group print:relative">
                <tr className="flex flex-wrap justify-around items-center">
                    <th className="flex flex-col items-start flex-wrap w-full justify-between h-auto min-h-[25px] p-0 text-left border-none border-b border-solid">
                        <div className="flex w-full flex-wrap justify-start items-stretch min-h-inherit gap-0">
                            {configNew.map(([title, tag, width]: any, k: number) => (
                                <div
                                    key={k}
                                    className={cn(
                                        "inline-flex flex-grow flex-shrink max-w-full border border-dashed box-border break-words whitespace-normal min-h-[25px]",
                                    )}
                                    style={{
                                        flexBasis: `${width * stretchF[screenTp]}px`,
                                    }}
                                >
                                    <div className="m-auto">{title}</div>
                                </div>
                            ))}
                        </div>
                    </th>
                </tr>
                </thead>
                <tbody className="border-collapse">
                {isNaN(linecnt) && (
                    <tr className="border border-solid">
                        <td className="text-center">空表</td>
                    </tr>
                )}
                {!isNaN(linecnt) &&
                    Array(linecnt)
                        .fill(null)
                        .map((_, i: number) => (
                            <tr key={i} className="flex flex-wrap justify-around items-center">
                                <td className="flex flex-col items-start flex-wrap w-full justify-between h-auto min-h-[33px] p-0 text-left border-none border-b border-solid">
                                    <div className="flex w-full flex-wrap justify-start items-stretch min-h-inherit gap-0">
                                        {configNew.map(([title, tag, width]: any, k: number) => (
                                            <div
                                                key={k}
                                                className={cn(
                                                    "inline-flex flex-grow flex-shrink max-w-full border border-dotted box-border break-words whitespace-normal min-h-[33px]",
                                                )}
                                                style={{
                                                    flexBasis: `${width * stretchF[screenTp]}px`,
                                                }}
                                            >
                                                <div className="m-auto">{"_S" === tag ? i + 1 : (content[i]?.[tag] ?? (slash && "／"))}</div>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    )
}

/**转换配置
 * */
export const copyZdConfig =(config: Each_ZdSetting[], widths:number[]) => {
    let newcfg=config.map((a:any, i:number) => [ a[0],a[1], (widths[i]? widths[i] : a[2]) ]);
    return newcfg as Each_ZdSetting[];
}
