/** @jsxImportSource @emotion/react */
import * as React from "react";
import {Text, Table, TableRow, TableBody, Cell, TextArea, TableHead,} from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, RepLink, useItemInputControl,} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {TailMenRowIspCheck} from "../../contain/rarelyVary";

export interface ExplanatoryProps extends InternalItemProps {
    desc?: string;
    //存储字段名
    stname?: string;
}
//const itemA长文=[ ];       //'长文字页'
/**纯粹文字录入的附页，页不做管理对象分页形式的。简易做法：
* */
export const Explanatory =
React.forwardRef(({ children, show ,alone=true,redId,nestMd,refWidth,desc='说明叙述',label,stname='长文字页'}:ExplanatoryProps,  ref
) => {
    const itemA = React.useMemo(() => {
        return [ stname, ];
    }, [stname]);
    const [getInpFilter]=useMeasureInpFilter(null,itemA,);
    const {inp, setInp} = useItemInputControl({ ref,redId,nestMd });
    return (
        <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                             alone={alone} label={label!}>
            <Text variant="h5">{label}</Text>
            {desc}:
            <TextArea  value={inp?.[stname] ||''} css={{minHeight:'70vh'}}
                       onChange={e => setInp({...inp, [stname]: e.currentTarget.value || undefined})}/>
            { children }
        </InspectRecordLayout>
    );
});

export interface ExplanatoryVwProps{
    orc: any;
    rep: any;
    // children?: React.ReactNode;
    title: string;
    desc?: string;
    hash?: string;
    stname?: string;
}
/**最简单的办法 :空白 文字
 * FootMenRowIspCheck 要求2列表格；
 * */
export const ExplanatoryVw= ({ orc, rep, title,desc,hash,stname='长文字页'}: ExplanatoryVwProps
) => {
    return <>
        <div id={hash ?? "Explanatory"}>
            <div css={{"@media print": {paddingBottom: '5rem', pageBreakInside: 'avoid'}}}>
                <Text variant="h2" css={{textAlign: 'center', marginTop: '1rem',
                }}>{title}</Text>
                <div css={{display: 'flex', justifyContent: 'space-between'}}>
                    <Text>工程名称：{orc?.工程名称}</Text>
                    <Text>报告编号：{rep.isp.no}</Text>
                </div>
            </div>
            <Table fixed={  ["62%","%"]   }
                        css={{borderCollapse: 'collapse', "@media print": {marginTop: '-5rem'}}} tight miniw={800}>
                {desc &&  <TableHead>
                        <TableRow><Cell colSpan={2}>{desc}:</Cell></TableRow>
                    </TableHead>
                }
                <TableBody>
                    <RepLink rep={rep} tag={hash ??'Explanatory'}>
                        <TableRow>
                            <Cell split={true} colSpan={2}>
                                <div css={{minHeight: '2rem', whiteSpace: 'pre-wrap'}}>
                                    {orc?.[stname] || '／'}
                                </div>
                            </Cell>
                        </TableRow>
                    </RepLink>
                </TableBody>
            </Table>
            <TailMenRowIspCheck orc={orc} rep={rep} cap='监检' href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/ProjectList#ProjectList`}/>
        </div>
    </>;
};
