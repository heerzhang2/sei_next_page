"use client"
import UserContext from "./UserContext";
import React, { useCallback, useEffect, useState, useContext } from "react"
import { useRouter } from "next/navigation"

interface LinkProps {
    href: string;
    children: React.ReactNode;
    state?: any;
}
/*@deprecated  淘汰！
使用了自定义路由器的Link链接，点击这个组件的才会经过自定义路由器跳转。旧的可携带user保存当前的用户数据 state;
* */
const Link: React.FunctionComponent<LinkProps> =({href,state,children,...other}: LinkProps)=>
{
  const router ={}// useContext(RoutingContext);
    const {user, } = useContext(UserContext);
  const changeRoute = useCallback(
      (event :any )=> {
      event.preventDefault();
      if(state)
          router.history.push(href, state);
      else {
          router.history.push(href);
      }
    },
    [href, router, state],
  );
  const preloadRouteCode = useCallback(() => {
    // router.preloadCode(href, user);
  }, [href, router, user]);
  return (
    <a
      href={href}
      onClick={changeRoute}
      onMouseEnter={preloadRouteCode}
      {...other}
    >
      {children}
    </a>
  );
}


/**儿子里面若是<></>包裹的需要改造替代，支持一层层次的替换。
 * 替换旧的 validChildrenMap ； 【来由】代码里面经常出现逻辑render { boolean && <> nodes </> }这样子的会导致以前普通办法失效。
 * 可支持把被<></>包裹下的组件直接合并给上一级的级别来作为并列的儿子，只支持第一层的非嵌套的<></>标签。
 * 避免相同的key就报错，但是有副作用后果：把全部儿子的key 统一再做个修改。 "_N**"作为排他性的key;
 * */
function validChildrenFragmentSpread(children: any,assert:boolean=true) {
    let idseq=1;
    let outs: React.ReactElement<unknown, string | React.JSXElementConstructor<any>>[]=[];
    let sons=React.Children.toArray(children);
    sons.forEach((son: any, index:number, array: any) =>{
        if(React.isValidElement(son)){
            const descriptor=Object.getOwnPropertyDescriptor(son, 'type');
            if(( descriptor?.value === Symbol.for('react.fragment') )  &&  son.props  &&  son.props.hasOwnProperty("children")){
                const subChildren=Object.getOwnPropertyDescriptor(son.props, 'children');
                let nestSubNodes=React.Children.toArray(subChildren?.value);
                nestSubNodes.forEach((subnode: any, index:number, array: any) => {
                    //if( !(subnode.hasOwnProperty("key")) ||  subnode.key===`.0` ...?等 ? )
                    //Cannot assign to read only property 'key' of object '#<Object>' Object.assign(subnode,{ key: '_'+idseq });
                    //避免相同的key 就报错的情况。?和上一级的兄弟节点相同的id。
                    let modifyNode={...subnode};
                    Object.assign(modifyNode,{ key: '_N'+idseq });
                    outs.push( modifyNode );
                    idseq++;
                });
            }
            else{
                outs.push(son);       //前提假设： son该不会出现"_N**"作为key;
            }
        }else if(assert){
            throw new Error("literal text must be wrapped in <></> tag or Components");     //不合法的文字？
        }
    } );
    return outs;
}


interface DirectLinkProps extends React.HTMLAttributes<HTMLElement> {
    href: string
    children: React.ReactNode
    state?: any
    className?: string
}

/**
 * 任意都能做Link的；
 * 直接用next.js Link 导致报错In HTML, <tr> cannot be a child of <a>.
 * In HTML, <a> cannot be a child of <tbody>. This will cause a hydration error.
 */
export const DirectLink: React.FunctionComponent<DirectLinkProps> = (props: DirectLinkProps) => {
    const router = useRouter()
    const valChilds = validChildrenFragmentSpread(props.children)
    const [isVisited, setIsVisited] = useState(false)

    // Check if the link has been visited before
    useEffect(() => {
        if (typeof window !== "undefined") {
            const visitedLinks = JSON.parse(localStorage.getItem("visitedLinks") || "[]")
            const isLinkVisited = visitedLinks.some((link: any) => link.url === props.href)
            setIsVisited(isLinkVisited)

            // Clean up old links when checking visited status
            const oneWeekAgo = Date.now() - 2 * 24 * 60 * 60 * 1000
            const recentLinks = visitedLinks.filter((link: any) => link.timestamp > oneWeekAgo)

            // Save back to localStorage if we removed any old links
            if (recentLinks.length < visitedLinks.length) {
                localStorage.setItem("visitedLinks", JSON.stringify(recentLinks))
            }
        }
    }, [props.href])

    const changeRoute = useCallback(
        (event: any) => {
            event.preventDefault()
            event.stopPropagation() // 不想向祖辈组件传递点击事件。

            // Mark this link as visited in localStorage with improved management
            if (typeof window !== "undefined") {
                // Get current visited links
                const visitedLinks = JSON.parse(localStorage.getItem("visitedLinks") || "[]")

                // Add timestamp to the link data
                const newVisitedLink = {
                    url: props.href,
                    timestamp: Date.now(),
                }

                // Check if this link is already in the list
                const existingIndex = visitedLinks.findIndex((item: any) => item.url === props.href)

                if (existingIndex >= 0) {
                    // Update the timestamp if link exists
                    visitedLinks[existingIndex].timestamp = Date.now()
                } else {
                    // Add new link
                    visitedLinks.push(newVisitedLink)
                }

                // Sort by timestamp (newest first)
                visitedLinks.sort((a: any, b: any) => b.timestamp - a.timestamp)

                // Keep only the 50 most recent links
                const trimmedLinks = visitedLinks.slice(0, 50)

                // Save back to localStorage
                localStorage.setItem("visitedLinks", JSON.stringify(trimmedLinks))
                setIsVisited(true)
            }

            router.push(props.href)
        },
        [props.href, router],
    )

    const preloadRouteCode = useCallback(() => {
        router.prefetch(props.href)
    }, [props.href, router])

    return (
        <React.Fragment>
            {valChilds.map((one, row) => {
                const element = one as React.ReactElement<any>
                const originalClassName = element.props.className || ""
                const visitedClass = isVisited ? "visited-link" : ""
                //直接儿子中若是：div 和 span 标签被强制改成<a>标签了！ 有好处：状态栏可显示链接；还是保留该特性
                // Create a wrapper with an actual <a> tag to leverage browser's native visited state
                if (element.type === "span" || element.type === "div") {
                    return (
                        <a
                            href={props.href}
                            onClick={changeRoute}
                            onMouseEnter={preloadRouteCode}
                            className={`${originalClassName} ${visitedClass} cursor-pointer`}
                            style={{
                                ...element.props.style,
                                textDecoration: "none",
                            }}
                            key={row}
                        >
                            {element.props.children}
                        </a>
                    )
                }
                // For other elements, use the original approach
                return React.cloneElement(element, {
                    onClick: changeRoute,
                    onMouseEnter: preloadRouteCode,
                    className: `${originalClassName} ${visitedClass} cursor-pointer`,
                    style: {
                        ...element.props.style,
                        ...(isVisited ? { color: "rgb(6, 19, 45)" } : {}), // Darker gray color for visited links
                    },
                    key: row,
                })
            })}
        </React.Fragment>
    )
}
