/** @jsxImportSource @emotion/react */
import * as React from "react";
import {useTheme,} from "customize-easy-ui-component";
import {useMeasure} from "customize-easy-ui-component/esm/Hooks/use-measure";
import {useWindowSize} from "customize-easy-ui-component/esm/Hooks/use-window-size";

import {Each_ZdSetting} from "@/report/hook/use-table-editor";

interface ElasticTableProps {
    //表格数组内容
    content: any[];
    //表格的基本配置  多字段
    config: Each_ZdSetting[];
    /**水平轴X方向依据浏览器可用屏幕区域大小来进行拉伸，默认是小屏幕的，配置分别代表了两阶段拉伸[小屏幕,电脑屏|平板电脑, 台式机的超大屏幕]的拉伸系数；
     * 缺省取值=[1, 1.35, 1.70];
     * */
    stretchF?: number[];
    slash?: boolean;
    //需要插入序号， 1，2，3。。
    seqT?:any;
    //序号列宽度px数
    seqCw?:number;
}

/**（表行折叠的）弹性表格， 类比useRepTableEditor； #局限性：普通线性表格，没有span概念/跨行融合的。
 * 管道特性表? 有额外的签名和备注，还要可点某一行击跳转功能的，可能采用这个模式还需考虑？ # 比横版打印好 @。
 *   <colgroup class="col-group-1" span="2"></colgroup> <colgroup class="col-group-2"></colgroup>
 *   使用<table>、<tr>和<td>元素可能会更容易实现这一点。然而，请注意，这种方法会牺牲一些可访问性和响应式设计的灵活性
 * 和Table表格的取值相同 const height=rheight? rheight : ( tableSectionType === "TableHead" ? (vtight? 25 : 31) : (vtight? 33 : 49) );
 * 若用display: grid; grid-template-columns: 也没办法啊。
 * */
export function useElasticTable({content, config, stretchF = [1, 1.35, 1.7],slash,seqT,seqCw=20}: ElasticTableProps) {
    const theme = useTheme();
    const configNew =React.useMemo(()=>{
        if(seqT)   return [[seqT, '_S', seqCw ], ...config];
        else  return config;
    },[config,seqT,seqCw]);
    //表格的全字段名称所在栏目div:
    const {innerHeight,} = useWindowSize();       //浏览器TAB内窗口全局大小; 两阶段拉伸[电脑屏|平板电脑, 台式机的超大屏幕]
    const dytilRef = React.useRef<HTMLDivElement>(null);
    const barRect = useMeasure(dytilRef as React.RefObject<HTMLElement>);
    const hBarWidth = barRect?.width || 0;
    //屏幕的类型 ：大中小屏的区分；
    const screenTp = (innerHeight!) > 860 && hBarWidth > 1700 ? 2 : (innerHeight!) > 740 && hBarWidth > 1280 ? 1 : 0;
    const linecnt = content?.length;        //最多抵达行的总个数；

    const thisTable = <table css={{width: '100%', borderCollapse: 'collapse'}}>
        <thead
            css={{
                position: 'sticky',        //用'fixed'的更离奇；'sticky',   position: 'relative',
                top: `0px`,
                background: 'ghostwhite',
                zIndex: theme.zIndices.sticky,
                borderCollapse: 'collapse',
                display: 'table-header-group',
                "@media print": {position: 'relative',}
            }}
        >
        <tr className="HBar"
            css={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center'}}>
            <th css={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                width: '-webkit-fill-available',
                justifyContent: 'space-between',
                height: 'unset',
                minHeight: '25px',
                padding: 'unset !important',
                textAlign: 'unset',
                border: 'none',
                borderBottom: '1px solid'
            }}>
                <div css={{
                    display: 'flex',
                    width: '-webkit-fill-available',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-start',
                    alignItems: 'stretch',
                    minHeight: 'inherit',
                    gap: 0,
                }}>
                    {configNew.map(([title, tag, width]: any, k: number) => {
                        //数据行 不考虑加： whiteSpace: 'break-spaces', 若超长的 重叠显示的；
                        return (
                            <div key={k} css={{
                                display: 'inline-flex',
                                flexBasis: width * stretchF[screenTp],
                                flexGrow: 1,
                                flexShrink: 1,
                                maxWidth: '100%',
                                border: '1px dashed',
                                boxSizing: 'border-box',
                                overflowWrap: 'anywhere',
                                whiteSpace: 'initial',
                                minHeight: '25px',
                            }}>
                                <div css={{margin: 'auto'}}>
                                    {title}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </th>
        </tr>
        </thead>
        <tbody css={{borderCollapse: 'collapse',}}>
        {isNaN(linecnt) && <tr css={{border: '1px solid'}}><td css={{textAlign: 'center'}}>空表</td></tr>}
        {!isNaN(linecnt) && (new Array(linecnt)).fill(null).map((_, i: number) => {
            const domRow = <tr
                css={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center'}}>
                <td css={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    width: '-webkit-fill-available',
                    justifyContent: 'space-between',
                    height: 'unset',
                    minHeight: '33px',
                    padding: 'unset !important',
                    textAlign: 'unset',
                    border: 'none',
                    borderBottom: '1px solid'
                }}>
                    <div css={{
                        display: 'flex',
                        width: '-webkit-fill-available',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start',
                        alignItems: 'stretch',
                        minHeight: 'inherit',
                        gap: 0,
                    }}>
                        {configNew.map(([title, tag, width]: any, k: number) => {
                            //数据行 不考虑加： whiteSpace: 'break-spaces', 若超长的 重叠显示的；
                            return (
                                <div key={k} css={{
                                    display: 'inline-flex',
                                    flexBasis: width * stretchF[screenTp],
                                    flexGrow: 1,
                                    flexShrink: 1,
                                    maxWidth: '100%',
                                    border: '1px dotted',
                                    boxSizing: 'border-box',
                                    overflowWrap: 'anywhere',
                                    whiteSpace: 'initial',
                                    minHeight: '33px',
                                }}>
                                    <div css={{margin: 'auto'}}>
                                     {'_S'===tag? (i+1) : (content[i]?.[tag] ?? (slash&&'／')) }
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </td>
            </tr>;
            return <React.Fragment key={i}>
                {domRow}
            </React.Fragment>;
        })}
        </tbody>
    </table>;

    const render = <>
        <div ref={dytilRef} css={{boxSizing: 'border-box'}}>
            {thisTable}
        </div>
    </>
    return [render];
}

/**转换配置
 * */
export const copyZdConfig =(config: Each_ZdSetting[], widths:number[]) => {
    let newcfg=config.map((a:any, i:number) => [ a[0],a[1], (widths[i]? widths[i] : a[2]) ]);
    return newcfg as Each_ZdSetting[];
}
