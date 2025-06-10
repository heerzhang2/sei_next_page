"use client"
import React, { useCallback } from "react"
import { useRouter } from "next/navigation"

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
    className?: string
    //默认设置为=true的；
    scroll?: boolean
}

/**
 * 任意都能做Link的；
 * 直接用next.js Link 导致报错In HTML, <tr> cannot be a child of <a>.
 * In HTML, <a> cannot be a child of <tbody>. This will cause a hydration error.
 * 表头不能加上<DirectLink >传递各列宽度？
 */
export const DirectLink: React.FunctionComponent<DirectLinkProps> = (props: DirectLinkProps) => {
    const router = useRouter()
    const valChilds = validChildrenFragmentSpread(props.children)
    const changeRoute = useCallback(
        (event: any) => {
            event.preventDefault()
            event.stopPropagation() // 不想向祖辈组件传递点击事件。
            //加上scroll: false 杜绝报警 auto-scroll behavior due to `position: sticky` or `position: fixed` on element
            router.push(props.href, { scroll: props.scroll===undefined? true : props.scroll })
        },
        [props.href, router, props.scroll],
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

