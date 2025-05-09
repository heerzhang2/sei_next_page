"use client"
import {useMediaPrint} from "@/hooks/use-media-print";

export default function Page() {
    useMediaPrint(true,true)
    return  null
}
