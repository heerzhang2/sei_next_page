/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Table, TableBody, TableRow, Text, TableHead, Input,
} from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, RepLink, SelectHookfork, useItemInputControl} from "../../common/base";
import { useOmnipotentPrefTitle} from "../../hook/useOmnipotentPref";
import {useMeasureInpFilter} from "../../common/hooks";
import {objNestSet} from "../../../common/tool";

export const tail流动专= <Text css={{"@media print": {fontSize: '0.75rem'}}}>
    注：<br/>
    1、对于采用油缸支撑起重作业的流动式起重机在密封性能试验时，载荷稳定后的
    15min 内变幅液压油缸和垂直支腿液压油缸的回缩量应不大于 2mm，载荷下沉量不
    大于 15mm；<br/>
    2、对于采用液压系统的集装箱正面吊运起重机在额定载荷试验时，吊具下沉量在
    10min 内不大于 150mm；<br/>
    3、采用液压支腿的铁路起重机在密封性能试验时，10min 内活塞杆回缩量不大
    于 2mm 和设计文件的要求。<br/>
    4、集装箱正面吊运起重机爬坡度符合设计文件和产品标准的要求；<br/>
    5、铁路起重机的水平仪安装精度，应当以底架上的回转支承安装平面为基准，安装精度在±0.5°范围内；铁路起重机对中装置
    显示正确。<br/>
    6、未检查或无需检验的，仅填检验结果栏。
</Text>;

//通用配置
const itemsChk =[
    ['幅杆回缩',[],'变幅油缸的活塞杆回缩量','mm', [],],
    ['重下沉',[],'重物下沉量','mm', ],
    ['腿杆回缩',[],'支腿油缸的活塞杆回缩量','mm', ],
    ['正吊爬坡',[],'集装箱正面吊运起重机爬坡度','°',],
    ['水平仪精',[],'铁路起重机的水平仪安装精度','°',],
];
export const itemA流动专: string[] = [ ];
itemsChk.forEach(([name, _, _2], i: number) => {
    itemA流动专.push(name as string);
});
export const SpecialTopic =
React.forwardRef((
    {children, show, alone = true, refWidth, label, }: InternalItemProps, ref
) => {
  const {inp, setInp} = useItemInputControl({ref});
  const [getInpFilter] = useMeasureInpFilter(null, itemA流动专,);
  const config = itemsChk;
  const titNode=useOmnipotentPrefTitle({config, });
  return (
      <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                           alone={alone} label={label!}>
        <Text variant="h5">{label}：</Text>
        {config.map(([name,tils,item,unit,]:any, i: number) => {
          return <React.Fragment key={i}>
              <Text variant="h5">{titNode[i]}</Text>
              观测结果
              <Input value={inp?.[name]?.v || ''} size={11}
                     style={{display: 'inline-flex', width: 'unset'}}
                     onChange={e => objNestSet(name, 'v', e.currentTarget.value, inp, setInp)}/>
              (单位：{unit})， 检验结果
              <div css={{width: '12rem', display: 'inline-flex', "& > div": {width: '100%'}}}>
                  <SelectHookfork value={inp?.[name]?.r || ''}
                                  onChange={e => objNestSet(name, 'r', e.currentTarget.value, inp, setInp)}/>
              </div>
              。
          </React.Fragment>;
        })}
        <br/>
        {children}
      </InspectRecordLayout>
    );
});
//附录7 C4.3.2.5.4 流动式起重机
export const SpecialTopicVw = ({orc, rep,children,label}: { orc: any, rep: any,children?: any,label:any}
) => {
    const config = itemsChk;
  return <>
    <div css={{"@media print": {paddingBottom: '4rem', pageBreakInside: 'avoid'}}}>
      <Text variant="h4" css={{marginTop: '1rem'}}>{label}</Text>
    </div>
    <Table id='SpecialTopic' fixed={["%","10%","30%","15%"]}
           css={{borderCollapse: 'collapse', "@media print": {marginTop: '-4rem'}}} tight miniw={800}>
      <TableHead>
          <TableRow><CCell>测量工况</CCell><CCell>测量单位</CCell><CCell>观测结果</CCell><CCell>检验结果</CCell></TableRow>
      </TableHead>
      <TableBody>
        <RepLink ori rep={rep} tag={'SpecialTopic'}>
          {config.map(([name,_tls,item,unit]: any, i:number) => {
              return <TableRow key={i}>
                    <CCell>{item}</CCell><CCell>{unit}</CCell>
                  <CCell>{orc?.[name]?.v || ''}</CCell>
                  <CCell>{orc?.[name]?.r || ''}</CCell>
              </TableRow>
          })}
        </RepLink>
      </TableBody>
    </Table>
      {children}
  </>;
};
