//src\component\rep\layout-wrapper.tsx
"use client"
import type React from "react"
import { Suspense, useEffect, useMemo } from "react"
import { useQuery } from "@urql/next"
import ReportLayout from "@/component/rep/reportLayout"
import { type ReportParams, ReportQuery } from "@/component/rep/report-data"
import PageSectionOrientation from "@/components/page-section-orientation"
import BrowsingPattern from "@/component/rep/browsingPattern"
import { useParams, useSearchParams } from "next/navigation"
import { useActualRepId } from "@/report/hook/use-actual-rep-id"
import { EditControlProvider } from "@/component/rep/editControl-provider"
import ReportMakeable from "@/common/ReportMakeable"
import {ReportEntryProps} from "@/report/common/base";
import { useNetworkStatusContext } from "@/contexts/network-status-context";

interface ReportLayoutWrapperProps {
    children: React.ReactNode
    ReportView: React.ComponentType<ReportEntryProps>
    useCatalog: () => any[]
}

export function ReportLayoutWrapper({ children, ReportView, useCatalog }: ReportLayoutWrapperProps) {
    const params = useParams() as unknown as ReportParams;
    const repId = useActualRepId();
    const { action } = params;
    const searchParams = useSearchParams();
    const print = "1" === searchParams!.get("print");
    const { isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable } = useNetworkStatusContext()

    // 当 repId 为空时暂停查询，避免发送无效请求
    const shouldPauseQuery = !repId

    // 使用 requestPolicy 控制缓存策略，而不是 pause（pause 会阻止缓存读取）
    const requestPolicy = useMemo(() => {
        if (!isClientOnline || !isGraphQLBackendReachable || !isNextJSServerReachable) {
            return "cache-only"
        }
        return "cache-and-network"
    }, [isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable])

    const [result] = useQuery({
        query: ReportQuery,
        variables: { id: repId },
        pause: shouldPauseQuery,
        requestPolicy,
    });
    const { getReport: report } = result?.data || {};
    const catItems = useCatalog();

    // 处理 hash 跳转：hash 路由跳转的时序问题。第一次访问时，页面组件和数据还没有完全加载完成，所以 hash 跳转失效
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        // 等待 DOM 完全渲染后再处理 hash
        const handleHashNavigation = () => {
            const hash = window.location.hash;
            if (hash) {
                const targetId = hash.slice(1); // 移除 # 号
                
                // 多次尝试找到目标元素
                const scrollToElement = (attempts = 0) => {
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        // 使用 scrollIntoView 进行平滑滚动
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        return true;
                    }
                    
                    // 如果没找到且还有重试次数，继续尝试
                    if (attempts < 5) {
                        setTimeout(() => scrollToElement(attempts + 1), 200 + attempts * 100);
                    }
                    return false;
                };
                
                // 使用 requestAnimationFrame 确保在下一个渲染周期开始
                requestAnimationFrame(() => {
                    scrollToElement();
                });
            }
        };

        // 监听 hash 变化
        window.addEventListener('hashchange', handleHashNavigation);
        
        // 当数据加载完成且 report 可用时处理 hash
        if (!result.fetching && report) {
            // 延迟一点时间确保 DOM 已经渲染
            const timer = setTimeout(handleHashNavigation, 100);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('hashchange', handleHashNavigation);
            };
        }

        return () => {
            window.removeEventListener('hashchange', handleHashNavigation);
        };
    }, [result.fetching, report]);

    if (repId === "*") return null;

    return (
        <EditControlProvider>
            <PageSectionOrientation>
                <Suspense fallback={<div>Loading...</div>}>
                    {action ? (
                        <ReportLayout key="report-layout-stable" repPanel={<ReportView rep={report} />} items={catItems}>
                            <ReportMakeable />
                            {children}
                        </ReportLayout>
                        ) : print ? (
                        <>
                    {children}
                    <ReportView rep={report} printMode />
                </>
                ) : (
                <div className="flex h-screen print:h-auto">
                    {children}
                    <BrowsingPattern items={catItems}>
                        <ReportView rep={report} />
                    </BrowsingPattern>
                </div>
                )}
            </Suspense>
        </PageSectionOrientation>
    </EditControlProvider>
    );
}