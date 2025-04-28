"use client"
import {useMediaPrint} from "@/hooks/use-media-print";

export default function Page({ params
                     }: Readonly<{
    params: Promise<{ repId: string }>,
}>) {
    useMediaPrint(true,true)
    return  null     //主页面合并到 layout.tsx 中了
}
