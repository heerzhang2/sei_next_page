"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { useLoginRedirectConfirm } from "@/components/login-redirect-confirm"
import { toast } from "sonner"

/*报告编制的页面必须登录用户才能进去：能用编辑器不一定有权限改，真要保存后端还会控制权限。
上一级父组件依旧是服务端SSR的情形下：
报告编制状态的，没登录的就必须要先登录，不能匿名浏览
若服务端登陆过期accessToken失效的，登录前后authjs.session-token=会变长了
* */
const ReportMakeable = () => {
    const session = useSession()
    const searchParams = useSearchParams()
    const [make, setMake] = useState(false)
    const { isClientOnline, isOnline, isGraphQLBackendReachable } = useNetworkStatus()
    const { showConfirm, ConfirmDialog } = useLoginRedirectConfirm()

    useEffect(() => {
        const make = searchParams.get("make")
        setMake(!!make)
    }, [searchParams])

    useEffect(() => {
        if (isClientOnline && isOnline && isGraphQLBackendReachable) {
            if (!(session?.data?.user as any)?.accessToken || !session?.data?.user) {
                console.log("ReportMakeable: 需要登录", session)
                showConfirm(
                    "需要登录",
                    "报告编制功能需要登录后才能使用。是否现在跳转到登录页面？",
                    () => {
                        window.location.href = "/login"
                    },
                    () => {
                        toast.info("已取消登录", {
                            description: "您可以继续浏览，但无法使用编制功能。",
                            duration: 5000,
                        })
                    },
                )
            }
        }
    }, [session, isClientOnline, isOnline, isGraphQLBackendReachable, showConfirm])

    return <ConfirmDialog />
}

export default ReportMakeable
