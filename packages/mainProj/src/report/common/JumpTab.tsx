"use client"
import React, { useCallback } from "react"
import { useRouter } from "next/navigation"
import {validChildrenFragmentSpread} from "@/routing/Link";
import {ReportPanelType, useEditControlContext} from "@/component/rep/editControl-provider";

interface JumpTabProps extends React.HTMLAttributes<HTMLElement> {
    href: string
    children: React.ReactNode
    className?: string      //没有用到？
    //默认设置为=true的；
    scroll?: boolean
    tab?: ReportPanelType
}
/**替代DirectLink：报告编辑器的Context底下的，附带Tabs跳转能力； div span :被替换为<a>; 剥离一层嵌套标签的;
 * 类似上一代的 JumpOrgTag
 */
export const JumpTab: React.FunctionComponent<JumpTabProps> = (props: JumpTabProps) => {
    const router = useRouter()
    const { setActiveTab } = useEditControlContext()
    const valChilds = validChildrenFragmentSpread(props.children)
    //除了push跟随的跳转，其余功能的类似/routing/Link.tsx；
    const changeRoute = useCallback(
        (event: any) => {
            event.preventDefault()
            event.stopPropagation() // 不想向祖辈组件传递点击事件。
            //加上scroll: false 杜绝报警 auto-scroll behavior due to `position: sticky` or `position: fixed` on element
            router.push(props.href, { scroll: props.scroll===undefined? true : props.scroll })
            if(setActiveTab!==null){
                //这里运行实际更早，tab内容还未加载完成的。 push(props.href若有hash标签如#Instrument但是目标Tab没有的hash就无法滚动到正常标签位置。
                setActiveTab(props.tab ?? "editor");
            }
        },
        [props.href,props.tab,props.scroll,router,setActiveTab],
    )
    const preloadRouteCode = useCallback(() => {
        router.prefetch(props.href)
    }, [props.href, router])

    return (
        <React.Fragment>
            {valChilds.map((one, row) => {
                const element = one as React.ReactElement<any>
                const originalClassName = element.props.className || ""
                //直接儿子中若是：div 和 span 标签被强制改成<a>标签了！ 有好处：状态栏可显示链接；还是保留该特性
                //只能直接的，不能时{render}方式嵌套的？   但是<div className="丢失?">{render}</div>却可以的。
                // Create a wrapper with an actual <a> tag to leverage browser's native visited state
                if (element.type === "span" || element.type === "div") {
                    return (
                        <a
                            href={props.href}
                            onClick={changeRoute}
                            onMouseEnter={preloadRouteCode}
                            className={`${originalClassName} cursor-pointer`}
                            style={{
                                ...element.props.style,
                                textDecoration: "none",
                            }}
                            key={row}
                            id={props.id}
                        >
                            {element.props.children}
                        </a>
                    )
                }
                // For other elements, use the original approach
                return React.cloneElement(element, {
                    onClick: changeRoute,
                    onMouseEnter: preloadRouteCode,
                    className: `${originalClassName} cursor-pointer`,
                    style: {
                        ...element.props.style,
                       //别加上 ...(isVisited ? { color: "rgb(21, 175, 53)" } : {}), // Darker gray color for visited links
                    },
                    key: row,
                })
            })}
        </React.Fragment>
    )
}
