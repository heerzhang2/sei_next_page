/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, InputLine, Table, TableRow, CCell, TableBody, LineColumn, BlobInputList, SuffixInput,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, RepLink, SelectHookfork, useItemInputControl,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {arraySetInp, calcAverageArrObj,} from "../../../common/tool";
import {resTranslJd} from "../../common/helper";


export const itemA限速器轿=['限制单','限额速','气速下','械速下','气速上','械速上','度下限','度上限','速器论'].map(a=>a+'轿');
//usecj==1=轿厢限速器；
export const LimiterSpeed=
    React.forwardRef(({ children, show ,alone=true,refWidth,label}:InternalItemProps,  ref
    ) => {
        const baseN= '轿';
        const [getInpFilter]=useMeasureInpFilter(null, itemA限速器轿, );        //hook死循环
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={label+`：轿厢`}>
                <Text variant="h5">
                    {label}
                </Text>轿厢限速器，其基本参数是：<br/>
                <LineColumn>
                    <InputLine  label='限速器制造单位' >
                        <BlobInputList  value={inp?.['限制单'+baseN] ||''}
                                        onListChange={v => setInp({...inp,['限制单'+baseN]:v || undefined}) }/>
                    </InputLine>
                    <InputLine  label='额定速度' >
                        <SuffixInput  value={inp?.['限额速'+baseN] ||''} onSave={txt=> setInp({...inp,['限额速'+baseN]: txt || undefined })}>m/s</SuffixInput>
                    </InputLine>
                </LineColumn>
                <hr/>
                轿厢限速器的观测值： {'>>'}
                <LineColumn column={2} >
                    <div>
                        <Text css={{marginLeft: '3rem'}}>电气动作速度（下行） 测量值</Text>
                        <LineColumn column={8}  >
                            { (new Array(3)).fill(null).map(( _,  w:number) => {
                                return <InputLine key={w} label={`v1${w+1} =`}>
                                    <SuffixInput  value={inp?.['气速下'+baseN]?.[w] ||''} onSave={txt=>arraySetInp('气速下'+baseN,w,txt,inp,setInp)}>m/s</SuffixInput>
                                </InputLine>;
                            }) }
                            <Text>电气动作速度（下行）平均值= {calcAverageArrObj(inp?.['气速下'+baseN],a=>a,2,3)} m/s</Text>
                        </LineColumn>
                    </div>
                    <div>
                        <Text css={{marginLeft: '3rem'}}>机械动作速度（下行） 测量值</Text>
                        <LineColumn column={8}  >
                            { (new Array(3)).fill(null).map(( _,  w:number) => {
                                return <InputLine key={w} label={`v2${w+1} =`}>
                                    <SuffixInput  value={inp?.['械速下'+baseN]?.[w] ||''} onSave={txt=>arraySetInp('械速下'+baseN,w,txt,inp,setInp)}>m/s</SuffixInput>
                                </InputLine>;
                            }) }
                            <Text>机械动作速度（下行）平均值= {calcAverageArrObj(inp?.['械速下'+baseN],a=>a,2,3)} m/s</Text>
                        </LineColumn>
                    </div>
                    <div>
                        <Text css={{marginLeft: '3rem'}}>电气动作速度（上行） 测量值</Text>
                        <LineColumn column={8}  >
                            { (new Array(3)).fill(null).map(( _,  w:number) => {
                                return <InputLine key={w} label={`v3${w+1} =`}>
                                    <SuffixInput  value={inp?.['气速上'+baseN]?.[w] ||''} onSave={txt=>arraySetInp('气速上'+baseN,w,txt,inp,setInp)}>m/s</SuffixInput>
                                </InputLine>;
                            }) }
                            <Text>电气动作速度（上行）平均值= {calcAverageArrObj(inp?.['气速上'+baseN],a=>a,2,3)} m/s</Text>
                        </LineColumn>
                    </div>
                    <div>
                        <Text css={{marginLeft: '3rem'}}>机械动作速度（上行） 测量值</Text>
                        <LineColumn column={8}  >
                            { (new Array(3)).fill(null).map(( _,  w:number) => {
                                return <InputLine key={w} label={`v4${w+1} =`}>
                                    <SuffixInput  value={inp?.['械速上'+baseN]?.[w] ||''} onSave={txt=>arraySetInp('械速上'+baseN,w,txt,inp,setInp)}>m/s</SuffixInput>
                                </InputLine>;
                            }) }
                            <Text>机械动作速度（上行）平均值= {calcAverageArrObj(inp?.['械速上'+baseN],a=>a,2,3)} m/s</Text>
                        </LineColumn>
                    </div>
                </LineColumn>
                <LineColumn column={6} >
                    <InputLine  label='动作速度下限值' >
                        <SuffixInput  value={inp?.['度下限'+baseN] ||''} onSave={txt=> setInp({...inp,['度下限'+baseN]: txt || undefined })}>m/s</SuffixInput>
                    </InputLine>
                    <InputLine  label='动作速度上限值' >
                        <SuffixInput  value={inp?.['度上限'+baseN] ||''} onSave={txt=> setInp({...inp,['度上限'+baseN]: txt || undefined })}>m/s</SuffixInput>
                    </InputLine>
                    <InputLine label='轿厢限速器-校验结论'>
                        <SelectHookfork value={inp?.['速器论'+baseN] ||''}
                                        onChange={e => setInp({ ...inp, ['速器论'+baseN]: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
                <Text css={{fontSize:'0.8rem'}}>
                    {children ? children :
                        <>
                            注：
                            1.发现调节部位封记缺损等可能影响限速器动作速度的情况，应当通过现场测试动作速度的方式予以确认。
                        </>
                    }
                </Text>
            </InspectRecordLayout>
        );
    } );

export const itemA限速器对=['限制单','限额速','气速下','械速下','气速上','械速上','度下限','度上限','速器论'].map(a=>a+'对');
itemA限速器对.push('对限电气速','对限机械速');
//对重限速器
export const DzLimiterSpeed=
    React.forwardRef(({ children, show ,alone=true,refWidth,label}:InternalItemProps,  ref
    ) => {
        const baseN= '对';
        const [getInpFilter]=useMeasureInpFilter(null, itemA限速器对, );        //hook死循环
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={label+`：对重`}>
                <Text variant="h5">
                    {label}
                </Text>对重（平衡重）限速器（下行），其基本参数是：<br/>
                <LineColumn>
                    <InputLine  label='限速器制造单位' >
                        <BlobInputList  value={inp?.['限制单'+baseN] ||''}
                                        onListChange={v => setInp({...inp,['限制单'+baseN]:v || undefined}) }/>
                    </InputLine>
                    <InputLine  label='额定速度' >
                        <SuffixInput  value={inp?.['限额速'+baseN] ||''} onSave={txt=> setInp({...inp,['限额速'+baseN]: txt || undefined })}>m/s</SuffixInput>
                    </InputLine>
                </LineColumn>
                <LineColumn>
                        <InputLine  label='标牌电气动作速度' >
                            <SuffixInput  value={inp?.['对限电气速'] ||''} onSave={txt=> setInp({...inp,对限电气速: txt || undefined })}>m/s</SuffixInput>
                        </InputLine>
                        <InputLine  label='标牌机械动作速度' >
                            <SuffixInput  value={inp?.['对限机械速'] ||''} onSave={txt=> setInp({...inp,对限机械速: txt || undefined })}>m/s</SuffixInput>
                        </InputLine>
                </LineColumn>
                <hr/>
                对重限速器（下行）的观测值： {'>>'}
                <LineColumn column={2} >
                    <div>
                        <Text css={{marginLeft: '3rem'}}>电气动作速度（下行） 测量值</Text>
                        <LineColumn column={8}  >
                            { (new Array(3)).fill(null).map(( _,  w:number) => {
                                return <InputLine key={w} label={`v1${w+1} =`}>
                                    <SuffixInput  value={inp?.['气速下'+baseN]?.[w] ||''} onSave={txt=>arraySetInp('气速下'+baseN,w,txt,inp,setInp)}>m/s</SuffixInput>
                                </InputLine>;
                            }) }
                            <Text>电气动作速度（下行）平均值= {calcAverageArrObj(inp?.['气速下'+baseN],a=>a,2,3)} m/s</Text>
                            {/* const avspeed2=calcAverageArrObj(orc.主降速表,(row)=>{return row?.d/row?.t},2); */}
                        </LineColumn>
                    </div>
                    <div>
                        <Text css={{marginLeft: '3rem'}}>机械动作速度（下行） 测量值</Text>
                        <LineColumn column={8}  >
                            { (new Array(3)).fill(null).map(( _,  w:number) => {
                                return <InputLine key={w} label={`v2${w+1} =`}>
                                    <SuffixInput  value={inp?.['械速下'+baseN]?.[w] ||''} onSave={txt=>arraySetInp('械速下'+baseN,w,txt,inp,setInp)}>m/s</SuffixInput>
                                </InputLine>;
                            }) }
                            <Text>机械动作速度（下行）平均值= {calcAverageArrObj(inp?.['械速下'+baseN],a=>a,2,3)} m/s</Text>
                        </LineColumn>
                    </div>
                </LineColumn>
                <LineColumn column={6} >
                    <InputLine  label='动作速度下限值' >
                        <SuffixInput  value={inp?.['度下限'+baseN] ||''} onSave={txt=> setInp({...inp,['度下限'+baseN]: txt || undefined })}>m/s</SuffixInput>
                    </InputLine>
                    <InputLine  label='动作速度上限值' >
                        <SuffixInput  value={inp?.['度上限'+baseN] ||''} onSave={txt=> setInp({...inp,['度上限'+baseN]: txt || undefined })}>m/s</SuffixInput>
                    </InputLine>
                    <InputLine label='对重限速器-校验结论'>
                        <SelectHookfork value={inp?.['速器论'+baseN] ||''}
                                        onChange={e => setInp({ ...inp, ['速器论'+baseN]: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
                <Text css={{fontSize:'0.8rem'}}>
                    {children ? children :
                        <>
                            注：
                            1.发现调节部位封记缺损等可能影响限速器动作速度的情况，应当通过现场测试动作速度的方式予以确认。
                        </>
                    }
                </Text>
            </InspectRecordLayout>
        );
    } );

/**限速器校验 正式报告
 * @param usecj： 2=对重限速器？默认=1=轿厢限速器； 轿厢 4个标牌速度在台账有，没再次录入。
 * */
const 轿厢限速器校验= ({ orc,  rep, } : { orc: any, rep: any}
) => {
    const baseN= '轿';
    return <>
            <RepLink  ori  rep={rep} tag={'Limiter'}>
                <TableRow>
                    <CCell colSpan={8}>*A1.3.4.1轿厢限速器</CCell>
                </TableRow>
                <TableRow>
                    <CCell>限速器制造单位</CCell>
                    <CCell colSpan={3}>{orc?.['限制单'+baseN] || '/'}</CCell>
                    <CCell>额定速度</CCell>
                    <CCell colSpan={2}>{orc?.['限额速'+baseN] || '/'}</CCell>
                    <CCell>m/s</CCell>
                </TableRow>
                <TableRow>
                    <CCell>限速器型号</CCell>
                    <CCell colSpan={3}>{orc?.['限速器'+'型号'] || '/'}</CCell>
                    <CCell>限速器编号</CCell>
                    <CCell colSpan={3}>{orc?.['限速器'+'编号'] || '/'}</CCell>
                </TableRow>
                <TableRow>
                    <CCell>标牌电气动作速度（下行）</CCell>
                    <CCell colSpan={2}>{orc?.['限速'+'下电气速'] || '/'}</CCell>
                    <CCell>m/s</CCell>
                    <CCell>标牌机械动作速度（下行）</CCell>
                    <CCell colSpan={2}>{orc?.[ '限速'+'下机械速'] || '/'}</CCell>
                    <CCell>m/s</CCell>
                </TableRow>
                <TableRow>
                    <CCell>标牌电气动作速度（上行）</CCell>
                    <CCell colSpan={2}>{orc?.[ '限速'+'上电气速'] || '/'}</CCell>
                    <CCell>m/s</CCell>
                    <CCell>标牌机械动作速度（上行）</CCell>
                    <CCell colSpan={2}>{orc?.[ '限速'+'上机械速'] || '/'}</CCell>
                    <CCell>m/s</CCell>
                </TableRow>
                { [['下',[1,2]],['上',[3,4]]].map(([flt,bq], i:number) => {
                    return  <React.Fragment key={i}>
                            <TableRow>
                                <CCell rowSpan={3}>电气动作速度（{flt}行）测量值</CCell>
                                <CCell>v{bq[0]}1 =</CCell>
                                <CCell>{orc?.['气速'+flt+baseN]?.[0] || '/'}</CCell>
                                <CCell>m/s</CCell>
                                <CCell rowSpan={3}>机械动作速度（{flt}行）测量值</CCell>
                                <CCell>v{bq[1]}1 =</CCell>
                                <CCell>{orc?.['械速'+flt+baseN]?.[0] || '/'}</CCell>
                                <CCell>m/s</CCell>
                            </TableRow>
                            <TableRow>
                                <CCell>v{bq[0]}2 =</CCell>
                                <CCell>{orc?.['气速'+flt+baseN]?.[1] || '/'}</CCell>
                                <CCell>m/s</CCell>
                                <CCell>v{bq[1]}2 =</CCell>
                                <CCell>{orc?.['械速'+flt+baseN]?.[1] || '/'}</CCell>
                                <CCell>m/s</CCell>
                            </TableRow>
                            <TableRow>
                                <CCell>v{bq[0]}3 =</CCell>
                                <CCell>{orc?.['气速'+flt+baseN]?.[2] || '/'}</CCell>
                                <CCell>m/s</CCell>
                                <CCell>v{bq[1]}3 =</CCell>
                                <CCell>{orc?.['械速'+flt+baseN]?.[2] || '/'}</CCell>
                                <CCell>m/s</CCell>
                            </TableRow>
                            <TableRow>
                                <CCell>电气动作速度（{flt}行）平均值</CCell>
                                <CCell colSpan={2}>{calcAverageArrObj(orc?.['气速'+flt+baseN],a=>a,2,3)}</CCell>
                                <CCell>m/s</CCell>
                                <CCell>机械动作速度（{flt}行）平均值</CCell>
                                <CCell colSpan={2}>{calcAverageArrObj(orc?.['械速'+flt+baseN],a=>a,2,3)}</CCell>
                                <CCell>m/s</CCell>
                            </TableRow>
                    </React.Fragment>;
                }) }
                <TableRow>
                    <CCell>动作速度下限值</CCell>
                    <CCell colSpan={2}>{orc?.['度下限'+baseN] || '/'}</CCell>
                    <CCell>m/s</CCell>
                    <CCell>动作速度上限值</CCell>
                    <CCell colSpan={2}>{orc?.['度上限'+baseN] || '/'}</CCell>
                    <CCell>m/s</CCell>
                </TableRow>
                <TableRow>
                    <CCell>校验结论</CCell>
                    <CCell colSpan={7}>{resTranslJd(orc?.['速器论'+baseN]) || '/'}</CCell>
                </TableRow>
            </RepLink>
    </>;
};

const 对重限速器校验= ({ orc,  rep, } : { orc: any, rep: any}
) => {
    const baseN= '对';
    return <>
        <RepLink  ori  rep={rep} tag={'DzLimiter'}>
                <TableRow>
                    <CCell colSpan={8}>*A1.3.5对重（平衡重）限速器（下行）</CCell>
                </TableRow>
                <TableRow>
                    <CCell>限速器制造单位</CCell>
                    <CCell colSpan={3}>{orc?.['限制单'+baseN] || '/'}</CCell>
                    <CCell>额定速度</CCell>
                    <CCell colSpan={2}>{orc?.['限额速'+baseN] || '/'}</CCell>
                    <CCell>m/s</CCell>
                </TableRow>
                <TableRow>
                    <CCell>限速器型号</CCell>
                    <CCell colSpan={3}>{orc?.[ '对限速'+'型号'] || '/'}</CCell>
                    <CCell>限速器编号</CCell>
                    <CCell colSpan={3}>{orc?.[ '对限速'+'编号'] || '/'}</CCell>
                </TableRow>
                <TableRow>
                    <CCell>标牌电气动作速度</CCell>
                    <CCell colSpan={2}>{orc?.[ '对限'+'电气速'] || '/'}</CCell>
                    <CCell>m/s</CCell>
                    <CCell>标牌机械动作速度</CCell>
                    <CCell colSpan={2}>{orc?.[ '对限'+'机械速'] || '/'}</CCell>
                    <CCell>m/s</CCell>
                </TableRow>
                { [['下',[1,2]],].map(([flt,bq], i:number) => {
                    //都是下行的：去除上行
                    return  <React.Fragment key={i}>
                            <TableRow>
                                <CCell rowSpan={3}>电气动作速度测量值</CCell>
                                <CCell>v{bq[0]}1 =</CCell>
                                <CCell>{orc?.['气速'+flt+baseN]?.[0] || '/'}</CCell>
                                <CCell>m/s</CCell>
                                <CCell rowSpan={3}>机械动作速度测量值</CCell>
                                <CCell>v{bq[1]}1 =</CCell>
                                <CCell>{orc?.['械速'+flt+baseN]?.[0] || '/'}</CCell>
                                <CCell>m/s</CCell>
                            </TableRow>
                            <TableRow>
                                <CCell>v{bq[0]}2 =</CCell>
                                <CCell>{orc?.['气速'+flt+baseN]?.[1] || '/'}</CCell>
                                <CCell>m/s</CCell>
                                <CCell>v{bq[1]}2 =</CCell>
                                <CCell>{orc?.['械速'+flt+baseN]?.[1] || '/'}</CCell>
                                <CCell>m/s</CCell>
                            </TableRow>
                            <TableRow>
                                <CCell>v{bq[0]}3 =</CCell>
                                <CCell>{orc?.['气速'+flt+baseN]?.[2] || '/'}</CCell>
                                <CCell>m/s</CCell>
                                <CCell>v{bq[1]}3 =</CCell>
                                <CCell>{orc?.['械速'+flt+baseN]?.[2] || '/'}</CCell>
                                <CCell>m/s</CCell>
                            </TableRow>
                            <TableRow>
                                <CCell>电气动作速度平均值</CCell>
                                <CCell colSpan={2}>{calcAverageArrObj(orc?.['气速'+flt+baseN],a=>a,2,3)}</CCell>
                                <CCell>m/s</CCell>
                                <CCell>机械动作速度平均值</CCell>
                                <CCell colSpan={2}>{calcAverageArrObj(orc?.['械速'+flt+baseN],a=>a,2,3)}</CCell>
                                <CCell>m/s</CCell>
                            </TableRow>
                    </React.Fragment>;
                }) }
                <TableRow>
                    <CCell>动作速度下限值</CCell>
                    <CCell colSpan={2}>{orc?.['度下限'+baseN] || '/'}</CCell>
                    <CCell>m/s</CCell>
                    <CCell>动作速度上限值</CCell>
                    <CCell colSpan={2}>{orc?.['度上限'+baseN] || '/'}</CCell>
                    <CCell>m/s</CCell>
                </TableRow>
                <TableRow>
                    <CCell>校验结论</CCell>
                    <CCell colSpan={7}>{resTranslJd(orc?.['速器论'+baseN]) || '/'}</CCell>
                </TableRow>
        </RepLink>
    </>;
};
/**可打印的
 * */
export const LimiterSpeedVw= ({children, orc, rep,label } : { orc: any, rep: any,label:any, children?: any}
) => {
    // const theme = useTheme();
    const gcRows=(orc?.轿门表?.length??1) + (orc?.间隙表?.length??1);
    return <>
        <div css={{"@media print": {paddingBottom: '4rem', pageBreakInside: 'avoid'}}}>
            <Text variant="h5" css={{marginTop: '1rem',
            }}>{label}</Text>
        </div>
        <Table id='Limiter' fixed={ ["20%","8%","15%","8%","%","8%","12%","8%"] }
                  tight  miniw={800} css={ {borderCollapse: 'collapse', "@media print": {marginTop: '-4rem'}} } >
         <TableBody>
             {轿厢限速器校验({orc, rep})}
             {对重限速器校验({orc, rep})}
         </TableBody>
        </Table>
        <Text css={{fontSize:'0.8rem'}}>
            {children ? children :
                <>
                    注：
                    1.发现调节部位封记缺损等可能影响限速器动作速度的情况，应当通过现场测试动作速度的方式予以确认。
                </>
            }
        </Text>
    </>;
};
