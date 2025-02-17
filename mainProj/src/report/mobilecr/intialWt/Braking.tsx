/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Table, TableBody, TableRow, Text, TableHead, Cell, useTheme, LineColumn, InputLine, SuffixInput, TextArea,
} from "customize-easy-ui-component";
import {arraySetInp, calcAverageArrObj,} from "../../../common/tool";
import {InspectRecordLayout, InternalItemProps, RepLink, SelectHookfork, useItemInputControl} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";

export const tail制距= <Text css={{"@media print": {fontSize: '0.75rem'}}}>
  注：1、对于标准和设计文件同时对制动距离都有规定的，以较严规定作为检验结果判定依据。对于标准和设计文件对制动
  距离都没有规定的，相应的制动距离可不测量。<br/>
  2、对于多起升机构的起重机，仅记录其中1个主起升机构和1个副起升机构制动距离。对于其余起升机构制动距离，记录在
  备注栏。<br/>
  3、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。<br/>
  4、未检查或无需检验的，仅填检验结果栏。采用现场监督且结果合格时，可仅填检验结果栏。
</Text>;

interface Props  extends InternalItemProps{
  config?: any[];
}
//唯一性校验 是用 {value: defConfig制动, type: 'moAR'},
export const defConfig制动=[['主制距','主起升机构'],['副制距','副起升机构']];
export const itemA制动距=['制距备注'];
//【config动态注入形式：配置字段的】存储唯一性检查？ 直接用 defConfig制动 的配置存储前缀，隐含约束地排除name+'r'的存储字段。
// item制动距离o.forEach((name, i:number)=>{
//   itemA制动距离.push(name);       //item制动距离.push(name);
//   itemA制动距离.push(name+'r');
// });
export const Braking =
    React.forwardRef((
        {children, show, alone = true, refWidth,label,config=defConfig制动,}: Props, ref
    ) => {
      const itemA = React.useMemo(() => {
          let items: string[]=[];
          config.forEach(([name,title], i:number)=>{
            items.push(name+'',  name+'r');
          });
          return [...items, ...itemA制动距];
      }, [config]);
      const [getInpFilter]=useMeasureInpFilter(null,itemA,);
      const {inp, setInp} = useItemInputControl({ ref });
      return (
          <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                               alone={alone} label={label!}>
            <Text variant="h5">{label}</Text>
            { config.map(( [field,title], i:number) => {
              return<React.Fragment key={i}>项目{i+1} {'>'} {title}：
                <LineColumn>
                  { (new Array(3)).fill(null).map(( _,  w:number) => {
                    return <InputLine key={w} label={`次数${w+1}，制动距离：`}>
                      <SuffixInput  value={inp?.[field]?.[w] ||''} onSave={txt=>arraySetInp(field,w,txt,inp,setInp)}>mm</SuffixInput>
                    </InputLine>;
                  }) }
                  <InputLine  label='平均制动距离：'>
                    <Text>{calcAverageArrObj(inp?.[field],a=>a,2,3)}mm</Text>
                  </InputLine>
                  <InputLine label={title+' > 制动距离-检验结果'}>
                    <SelectHookfork value={ inp?.[field+'r'] ||''}
                                    onChange={e => setInp({ ...inp, [field+'r']: e.currentTarget.value||undefined}) }/>
                  </InputLine>
                </LineColumn>
              </React.Fragment>;
            }) }
            备注：
            <TextArea  value={inp?.制距备注 ||''} rows={3}
                       onChange={e => setInp({ ...inp, 制距备注: e.currentTarget.value||undefined}) } />

            {children}
          </InspectRecordLayout>
    );
  } );

/**起重自动距离； 固定的存储:制距备注
 * */
export const BrakingVw= ({children, orc, rep,label,config=defConfig制动,} : { orc: any, rep: any,label:any, children?: any,config?: any[],}
) => {
  const theme = useTheme();
  //[约束] 单位：mm  打印时刻一行可以同时显示一整个标题，不能超出一行！
  return <>
    <div id={'Braking'} css={{display:'block',justifyContent:'space-between',alignItems:'flex-end', [theme.mediaQueries.md]: {display:'flex'},
                    "@media print": {paddingBottom: '3.5rem', pageBreakInside: 'avoid'}, }}>
      { typeof label==='object' ?  <>{label}</>
          :
          <Text variant="h4" css={{marginTop: '1rem',
          }}>{label}</Text>
      }
      <Text css={{display: 'flex',flexDirection: 'row-reverse',marginRight: '2rem'
      }}>单位：mm</Text>
    </div>
    <Table fixed={ ["6%","%","11%","19%","16%","12%"] } tight  miniw={800} css={ {borderCollapse: 'collapse', "@media print": {marginTop: '-3.5rem'}} } >
      <TableHead>
        <TableRow>
          <CCell colSpan={2}>项目</CCell>
          <CCell>次数</CCell>
          <CCell>制动距离</CCell>
          <CCell>平均制动距离</CCell>
          <CCell>检验结果</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <RepLink ori rep={rep} tag={'Braking'}>
          { config.map(([field,title], i:number) => {
            const resFd=field+'r';
            const avdistance=calcAverageArrObj(orc?.[field],(row)=>row,2,3);
            return  <React.Fragment key={i}>
              { (new Array(3)).fill(null).map(( _,  w:number) => {
                return <TableRow key={w}>
                  {w===0 && <CCell rowSpan={3} colSpan={2}>{title}</CCell>}
                  <CCell>{w+1}</CCell>
                  <CCell>{orc?.[field]?.[w]}</CCell>
                  { w===0 && <>
                    <CCell rowSpan={3}>{avdistance}</CCell>
                    <CCell rowSpan={3}>{orc?.[resFd]}</CCell>
                  </>
                  }
                </TableRow>;
              }) }
            </React.Fragment>;
          }) }
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={5}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
              {orc.制距备注 || '／'}
            </div></Cell>
          </TableRow>
        </RepLink>
      </TableBody>
    </Table>
    {children}
  </>;
};
