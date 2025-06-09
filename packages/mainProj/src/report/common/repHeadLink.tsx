"use client"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type React from "react"

interface RepHeadLinkProps {
    template: string
    verId: string
    repId: string
    rep: any
}
/**报告的头部功能区
* */
export function RepHeadLink({ template, verId, repId, rep }: RepHeadLinkProps) {
    const searchParams = useSearchParams()
    const original = "1" === searchParams!.get("original")
    const pdfUri = original ? rep?.link?.ori : rep?.link?.rep

    return (
        <div id="BeginOfRep" className="print:hidden text-center mb-4 md:mb-0">
            <div className="space-y-3 border-b">
                {pdfUri ? (
                    <div className="space-y-2">
                        <Link
                            href={`${process.env.NEXT_PUBLIC_OSS_ENDP}${pdfUri}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 py-1" // 移除 w-full
                        >
                            有Pdf版
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-1 p-1 text-xs bg-gray-50 rounded-lg">
                    没有Pdf版
                    </div>
                )}
            </div>
        </div>
    )
}
