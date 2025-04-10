/** @jsxImportSource @emotion/react */
import * as React from "react";
import {css} from "@emotion/react";
import {
    Text, BlobInputList, Input, TextArea, InputLine, LineColumn, SuffixInput, useTheme, Table, TableBody, TableRow, CCell, Cell, TableHead,
} from "customize-easy-ui-component";
import {
    CCellUnit, InspectRecordLayout, InternalItemProps, RepLink, SelectHookfork, useInputControlSure,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {Each_ZdSetting, useTableEditor} from "../../hook/useRepTableEditor";
import {EditStorageContext, useStorage} from "../../StorageContext";
import {useUppyUpload} from "../../hook/useUppyUpload";

export const tail应变= <Text css={{"@media print": {fontSize: '0.75rem'}}}>
    注： 1、所测应力值为试验载荷产生的应力，不含自重产生的应力。<br/>
    2、“+”表示测点位置结构受拉，“-”表示测点位置结构受压。
</Text>;

export const config测点表=[['应变值','μ',150,(obj,setObj)=>{
    return <SuffixInput  value={obj?.μ ||''} onSave={txt=> setObj({...obj,μ: txt || undefined })}>με</SuffixInput>
}],['应力值','M',150,(obj,setObj)=>{
    return <SuffixInput  value={obj?.M ||''} onSave={txt=> setObj({...obj,M: txt || undefined })}>MPa</SuffixInput>
}]] as Each_ZdSetting[];
//不管sensit与否，都加上存储字段名 ‘应变片#型/灵’ 。
export const itemA应变应力=['应仪器型','应变片型','应变片灵','应天气','应温度','应料参E','应料参μ','应试工况','测点表','_FILE_测点','测点示意','危应第','应变设计','应变结论','应变备注'];
interface Props  extends InternalItemProps{
    //稍微一点的差别： 灵敏
    sensit?: boolean;
}
export const StrainStress =
    React.forwardRef((
        {children, show, alone = true, repId,redId, nestMd, label,sensit}: Props, ref
    ) => {
        const theme = useTheme();
        const [getInpFilter]=useMeasureInpFilter(null,itemA应变应力,);
        //对比同常的const {inp, setInp} = useItemInputControl({ ref });这里增加onSure可立刻修改storage的。就差发送保存给后端操作。尽量避免丢失刚刚上传的文件：类似数据库事务ACID回滚和确保完整。
        const {inp, setInp,onSure} = useInputControlSure({ ref,redId,nestMd });
        const breaks=[140,420,620];
        const headview=<Text variant="h5">
            测试点:按照一行2字段录入： 应变值（με）, 应力值（MPa）;
        </Text>;
        const [render测点表]=useTableEditor({breaks, inp, setInp,  headview,
            config: config测点表, table:'测点表', column:3, });
        const {modified,setModified,} =useStorage();
        const onFinish = React.useCallback(async(upfile: any, del:boolean) => {
            onSure({...inp, '_FILE_测点': upfile});
            !modified && setModified(true);
        }, [inp, modified,onSure,setModified]);
        const [uploadDom]=useUppyUpload({ repId:repId!,
            maxFile:1, onFinish, storeObj: inp?._FILE_测点 ,liveDays:10
        });
        const config=[['应变片型号','应仪器型',undefined,30],
            ['应变片'+(sensit?'灵敏度':'型式'),'应变片'+(sensit?'灵':'型'),undefined,25],
            ['天气情况','应天气',undefined,35],['温度','应温度','℃'],['材料参数E','应料参E'],['材料参数GPa μ','应料参μ']
        ];

        return <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show} redId={redId}
                                    nestMd={nestMd} alone={alone} label={label!}>
            <Text variant="h5">{label}：</Text>
            <div css={{display: 'flex',flexWrap: 'wrap',justifyContent:'space-around',alignItems:'center'}}>
                { config.map(([title,field,unit,size]:any, i:number) => {
                    return <div key={i} css={{ display: 'flex',alignItems:'center',
                        [theme.mediaQueries.md]: {marginLeft: '1rem'}
                    }}>
                        <Text css={{whiteSpace: 'nowrap',marginRight: '0.2rem'}}>{title}</Text>
                        <Input  value={inp?.[field] ||''}  size={size!}
                                onChange={e => setInp({ ...inp, [field]: e.currentTarget.value||undefined }) }/>
                        <Text css={{whiteSpace: 'nowrap',marginLeft: '0.1rem'}}>{unit}</Text>
                    </div>;
                }) }
            </div>
            测试工况：
            <TextArea  value={inp?.应试工况 ||''} rows={2}
                       onChange={e => setInp({ ...inp, 应试工况: e.currentTarget.value||undefined}) } />
            {render测点表}
            <InputLine  label='测点示意图-说明：'  lineStyle={css`max-width:unset;`}>
                <BlobInputList value={inp?.测点示意 ||''} rows={1}  datalist={[ ]}
                               onListChange={v => setInp({ ...inp, 测点示意: v || undefined}) } />
            </InputLine>
            测点示意图：
            {uploadDom}
            测试结果：
            <LineColumn column={4} >
                <InputLine  label={(sensit?'最大应力值测试点':'最危险应力点')+'为测点：'}>
                    <Input  value={inp?.危应第 ||''} onChange={e => setInp({ ...inp, 危应第: e.currentTarget.value||undefined }) }/>
                </InputLine>
                <InputLine  label='设计值=' >
                    <BlobInputList value={inp?.应变设计 ||''} rows={2}
                                   onListChange={v => setInp({ ...inp, 应变设计: v || undefined}) } />
                </InputLine>
                <InputLine  label='结果判定：' >
                    <SelectHookfork value={inp?.应变结论 ?? ''} onChange={e => {
                                    setInp({ ...inp, 应变结论: e.currentTarget.value || undefined}); }} />
                </InputLine>
            </LineColumn>
            备注：
            <TextArea  value={inp?.应变备注 ||''} rows={3}
                       onChange={e => setInp({ ...inp, 应变备注: e.currentTarget.value||undefined}) } />
            {tail应变}
    </InspectRecordLayout>;
});

/**应变应力测试
 * @property sensit: 一点文字差别
 * */
export const StrainStressVw= ({orc, rep, label,sensit} :{orc:any, rep:any, label:any,sensit?:boolean}
) => {
    const theme = useTheme();
    const rowsc=Math.ceil(orc?.测点表?.length/2) || 0;        //最多抵达行个数
    //因“测点1 2”列的并不在config字段，无法上const [renderRows,]=useRep2hTableViewer(config测点表, '测点表', orc,true,true,true);
    return <>
        <div  css={{"@media print": {paddingBottom: '5rem', pageBreakInside: 'avoid'}} }>
            <Text variant="h4" css={{marginTop: '1rem',}}>{label}</Text>
        </div>
        <Table id={'StrainStress'} fixed={ ["8.2%","3%","39%","11%","%"] }
               css={ {borderCollapse: 'collapse', "@media print": {marginTop: '-5rem'}} }  tight  miniw={800}>
            <TableBody>
                <RepLink ori rep={rep} tag={'StrainStress'}>
                    <TableRow>
                        <CCell colSpan={2}>应变片型号</CCell>
                        <CCell>{orc?.应仪器型}</CCell>
                        <CCell>{'应变片'+(sensit?'灵敏度':'型式')}</CCell>
                        <CCell>{orc?.['应变片'+(sensit?'灵':'型')]}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell colSpan={2}>天气情况</CCell>
                        <CCell>{orc?.应天气}</CCell>
                        <CCell>温度</CCell>
                        <CCellUnit unit={'℃'}>{orc?.应温度}</CCellUnit>
                    </TableRow>
                    <TableRow>
                        <CCell colSpan={2}>材料参数</CCell>
                        <CCell>E={orc?.应料参E}</CCell>
                        <CCell>GPa &nbsp;&nbsp; μ=</CCell>
                        <CCell>{orc?.应料参μ}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>测试工况</CCell>
                        <Cell colSpan={4}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                            {orc.应试工况}
                        </div></Cell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </Table>
        <Table fixed={ ["10%","20%","20%","10%","20%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
            <TableHead>
                <TableRow>
                    <CCell>测试点</CCell>
                    <CCell>应变值（με）</CCell>
                    <CCell>应力值（MPa）</CCell>
                    <CCell>测试点</CCell>
                    <CCell>应变值（με）</CCell>
                    <CCell>应力值（MPa）</CCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <RepLink ori rep={rep} tag={'StrainStress'}>
                    { (new Array(rowsc)).fill(null).map((_, i:number) => {
                        return <TableRow key={i}>
                            { [1,2].map((raft, g:number) => {
                                return <React.Fragment key={g}>
                                    <CCell>{i*2+g<orc?.测点表?.length && '测点'+(i*2+raft) }</CCell>
                                    <CCell>{orc?.测点表?.[i*2+g]?.μ}</CCell>
                                    <CCell>{orc?.测点表?.[i*2+g]?.M}</CCell>
                                </React.Fragment>;
                            }) }
                        </TableRow>;
                    }) }
                </RepLink>
            </TableBody>
        </Table>
        <Table fixed={ ["10%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
            <TableBody>
                <RepLink ori rep={rep} tag={'StrainStress'}>
                    <TableRow>
                        <Cell colSpan={2} css={ {"@media print": { height: undefined },  padding: 0,} }>
                            测点示意图：&nbsp;{orc?.测点示意}
                            <div css={{display: 'flex',justifyContent: 'space-around',alignItems: 'center', margin: '1px 0' }}>
                                { orc?._FILE_测点?.url &&
                                    <img src={process.env.REACT_APP_OSS_ENDP+orc?._FILE_测点?.url} alt={orc?._FILE_测点?.url}
                                         css={{
                                             maxHeight: '14cm',   //在这个元素的上一级元素可以自己加一个固定高度值，就像一张纸打印的应该多高的取值。这个用固定高度会导致图片自动的横竖比例不均衡压缩=会变形啊！24cm是纸张大约最多高度=报告最大图片高。
                                             maxWidth: '-webkit-fill-available',
                                             [theme.mediaQueries.lg]: {maxHeight: '18cm', maxWidth: undefined},           //普通图片+大屏幕限制高度才是关键的。
                                             //【想法】大约一整页height: '96vh' +底下一个行的。
                                             "@media print": { maxWidth: '100%'},        //对A4纸张竖版的高度26cm基本都是图片整张纸，这里没考虑多个图片在宽度方向上的并排布局：可用软件合并。
                                         }}
                                    />
                                }
                            </div>
                        </Cell>
                    </TableRow>
                    <TableRow>
                        <CCell>测试结果</CCell>
                        <Cell>{(sensit?'最大应力值测试点':'最危险应力点')+'为测点'}（ {orc?.危应第} ）</Cell>
                    </TableRow>
                    <TableRow>
                        <CCell>设计值</CCell>
                        <CCell>{orc?.应变设计}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>结果判定</CCell>
                        <CCell>{orc?.应变结论 || '／'}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>备注</CCell>
                        <Cell><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                            {orc.应变备注 || '／'}
                        </div></Cell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </Table>
        {tail应变}
    </>;
};
