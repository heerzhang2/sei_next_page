/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
   Cell, Input, InputLine, Table, TableHead,  Text,
} from "customize-easy-ui-component";
import {SuffixInput,} from "@/components/chub";
// import {DirectLink,} from "../../../routing/Link";
import {RepLink,} from "../../common/base";
import {usePrefixDataTable} from "../../hook/usePrefixData";
import {useThreeColumnView} from "../../hook/useThreeColumnSubr";
import {render施工单位,} from "../../common/render";
import {EachObserveConfig, useObserveTable} from "../../hook/useObserve";
import {calcAverageArrObj} from "../../../common/tool";
import type {UseFormReturn} from "react-hook-form";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui";
import {CCell, FlexibleTable, TableBody, TableHeader, TableRow,TableCell} from "@/components/flexible-table";

//仅正式报告用
const config设备 = [
  [['使用单位名称', '_$使用单位'], ],
  [['分支机构名称', '_$分支机构'] ],
  [['使用地点', '_$设备使用地点'], ],
  [['安全管理人员', '安全员'], ['联系电话', '安全员电'] ],
  [['产品名称', '_$设备名称'], ['产品型号', '_$型号'],],
  [['产品编号', '_$出厂编号'], ['制造完成日期', '_$制造日期'],],
  [['设备级别', '_$设备等级'], ['使用期限到期时间','_$使用到期时' ],],
    //记录中缺少：_$设备代码
  [['设备代码', '_$设备代码'], ['设备型式', '设型式'],],
  //'施工-改造单位名称;-安装单 -大修单
  [['施工单位名称','_$改造单位',render施工单位] ],
  [['制造单位名称', '_$制造单位']  ],
  //技术参数    ？ 单位不同于台账m/min   km/h
  [['单舱（每船、每筏）承载人数',{n:'单舱筏载',u:'人'},],  ['运行速度', '_$额定速度','km/h'] ],
  [['座舱数(或滑道数、或碰碰船数)', {n:'座舱道船',u:'个'} ],  ['运行高度','_$提升高度','m'],],
];
//拆分成2个编辑器的
const config设备上=config设备.slice(0, 10);
const config设备下=config设备.slice(10);

export const 报告设备详情= ( {theme, orc, rep } : { orc: any,rep:any, theme:any}
) => {
  const renderUpper=usePrefixDataTable({config: config设备上, orc, rep, slash:true});
  const [firstPart,_s]=useThreeColumnView({orc, config:config设备下,slash:true,
                embedCol: [ <CCell rowSpan={2}>设备技术参数</CCell> ] });
  return <React.Fragment>
    <Table id={'Survey'} fixed={ ["6.1%","6%","38%","12.1%","4%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <RepLink rep={rep} tag={'Survey'}>
          {renderUpper}
        </RepLink>
      </TableBody>
    </Table>
    <Table fixed={ ["4.8%","27.6%","16%","13.6%","8.1%","18.6%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <RepLink rep={rep} tag={'Survey'}>
          {firstPart}
        </RepLink>
        <TableRow>
          <CCell colSpan={2}>检验依据</CCell>
          <CCell colSpan={5}>《大型游乐设施安全技术规程》（TSG 71-2023）</CCell>
        </TableRow>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Conclusion#Conclusion`}>
          <TableRow>
            <CCell>检验结论</CCell><CCell colSpan={6}>
            <Text variant="h1" css={{fontSize:orc?.检验结论?.length>12? '1.4rem':'2.8rem',
                      margin: 'auto',padding:'0 1rem'}}>{orc?.检验结论}</Text></CCell>
          </TableRow>
        </DirectLink>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Witness#Witness`}>
          <TableRow>
            <CCell>备注</CCell>
            <Cell split={true} colSpan={6}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
              {orc.大备注 ?? '／'}
            </div></Cell>
          </TableRow>
        </DirectLink>
        <TableRow>
          <CCell colSpan={2}>下次定期检验日期</CCell>
          <CCell colSpan={5}>{orc.新下检日 ?? '／'}</CCell>
        </TableRow>
      </TableBody>
    </Table>
  </React.Fragment>;
};


//有备注列的： 拆解成 3个部分编辑器的。    config: ((orc: any) => EachObserveConfig[][]) | EachObserveConfig[][];
export const 测量备注三半= ({ orc, rep,label,config,fixed=["2%", "5%", "3%", "6%", "%", "15%", "5%", "9%", "7%", "5%", "11%"],children,
                              config2, config3, mem}
           : { orc: any, rep: any,label:string,fixed?:string[],children?: React.ReactNode,
                  config: EachObserveConfig[][]; config2: EachObserveConfig[][]; config3: EachObserveConfig[][]; mem?: string; }
) => {
  const [render1, seq1e]=useObserveTable({rep,orc, config:config,memoF:true,tag:'Measure'});
  const [render2, seq2e]=useObserveTable({rep,orc, config:config2,memoF:true,seqOfs:seq1e,tag:'Measure2'});
    // const newconfig = React.useMemo(() => {
    //   return (typeof config === 'function' ? config(orc) : config);
    // }, [orc, config]);
  const [render3, ]=useObserveTable({rep,orc, config:config3,memoF:true,seqOfs:seq2e,tag:'Measure3'});
  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>{label}</Text>
    <Table fixed={fixed}  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
      <TableHead>
        <TableRow>
          <CCell><Text css={{fontSize:'0.8rem'}}>序号</Text></CCell><CCell colSpan={2}>项目编号</CCell>
          <CCell colSpan={2}>检验内容与要求</CCell><CCell>检测项目</CCell><CCell>单位</CCell><CCell>观测数据</CCell>
          <CCell>测量结果</CCell><CCell><Text css={{fontSize:'0.8rem'}}>结果判定</Text></CCell><CCell>备注</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <RepLink ori rep={rep} tag='Measure'>
          {render1}
        </RepLink>
        <RepLink ori rep={rep} tag='Measure2'>
          {render2}
        </RepLink>
        <RepLink ori rep={rep} tag='Measure3'>
          {render3}
          {mem && <TableRow>
                  <CCell colSpan={2}>备注</CCell>
                  <Cell colSpan={9}><div css={{minHeight: '2rem', whiteSpace: 'pre-wrap'}}>{orc?.[mem] || '／'}</div></Cell>
              </TableRow>
          }
        </RepLink>
      </TableBody>
    </Table>
    {children? children :
        <Text css={{fontSize:'0.8rem'}}>
          注：本表所列项目无测量时，观测数据和测量结果可不填，但结果判定应填写，对不适用项填“/”。
        </Text>
    }
  </>;
};
/*单一个编辑区的, 有设计值列；
* */
export const 测量允许检测= ({ orc, rep,label,config,fixed=["4.1%", "16%", "9%", "6%", "%", "19%", "6%", "10%", "9%", "11%", "8%"],children,
                              mem, tag='Measure'}
                            : { orc: any, rep: any,label:string,fixed?:string[],children?: React.ReactNode,
              config: EachObserveConfig[][];  mem?: string; tag?: string}
) => {
  const [render1, ]=useObserveTable({rep,orc, config:config, tag, allowableV:true});
  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>{label}</Text>
    <Table fixed={fixed}  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
      <TableHead>
        <TableRow>
          <CCell><Text css={{fontSize:'0.8rem'}}>序号</Text></CCell><CCell colSpan={5}>检测项目</CCell>
          <CCell>单位</CCell><CCell>观测数据</CCell>
          <CCell>测量结果</CCell><CCell>设计值</CCell><CCell><Text css={{fontSize:'0.8rem'}}>结果判定</Text></CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <RepLink ori rep={rep} tag={tag}>
          {render1}
          {mem && <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={10}><div css={{minHeight: '2rem', whiteSpace: 'pre-wrap'}}>{orc?.[mem] || '／'}</div></Cell>
          </TableRow>
          }
        </RepLink>
      </TableBody>
    </Table>
    {children? children :
        <Text css={{fontSize:'0.8rem'}}>
          注：本表所列项目无测量时，观测数据和测量结果可不填，但结果判定应填写，对不适用项填“/”。
        </Text>
    }
  </>;
};

//有备注列的： 拆解成2个部分编辑器的。
export const 测量备注两半= ({ orc, rep,label,config,fixed=["2%", "5%", "3%", "6%", "%", "15%", "5%", "9%", "7%", "5%", "11%"],children,
                              config2, mem}
                  : { orc: any, rep: any,label:string,fixed?:string[],children?: React.ReactNode,
                  config: EachObserveConfig[][]; config2: EachObserveConfig[][]; mem?: string; }
) => {
  const [render1, seq1e]=useObserveTable({rep,orc, config:config,memoF:true,tag:'Measure'});
  const [render2, ]=useObserveTable({rep,orc, config:config2,memoF:true,seqOfs:seq1e,tag:'Measure2'});
  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>{label}</Text>
    <Table fixed={fixed}  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
      <TableHead>
        <TableRow>
          <CCell><Text css={{fontSize:'0.8rem'}}>序号</Text></CCell><CCell colSpan={2}>项目编号</CCell>
          <CCell colSpan={2}>检验内容与要求</CCell><CCell>检测项目</CCell><CCell>单位</CCell><CCell>观测数据</CCell>
          <CCell>测量结果</CCell><CCell><Text css={{fontSize:'0.8rem'}}>结果判定</Text></CCell><CCell>备注</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <RepLink ori rep={rep} tag='Measure'>
          {render1}
        </RepLink>
        <RepLink ori rep={rep} tag='Measure2'>
          {render2}
          {mem && <TableRow>
            <CCell colSpan={2}>备注</CCell>
            <Cell colSpan={9}><div css={{minHeight: '2rem', whiteSpace: 'pre-wrap'}}>{orc?.[mem] || '／'}</div></Cell>
          </TableRow>
          }
        </RepLink>
      </TableBody>
    </Table>
    {children? children :
        <Text css={{fontSize:'0.8rem'}}>
          注：本表所列项目无测量时，观测数据和测量结果可不填，但结果判定应填写，对不适用项填“/”。
        </Text>
    }
  </>;
};

export const tail测仪器= <Text css={{"@media print": {fontSize: '0.75rem'}}}>
  注：1、性能状态一栏中用“√”表示正常，用“×”表示不正常。
  <Text css={{display: 'flex', marginLeft: '1.5rem', "@media print": {fontSize: '0.75rem'}}}>
    2、若仪器设备性能状态不正常，应更换为性能状态正常的仪器设备，并填写在预留栏中。<br/>
    3、新增使用的仪器设备应填写在预留栏中。<br/>
    4、未使用的仪器设备可不填写。
  </Text>
</Text>;

export const InstrumentVw = ({orc, rep, label,nbhead}:
                               { orc: any, rep: any, label: any,nbhead?:boolean }
) => {
  return <>
    <div css={{ "@media print": {
                paddingBottom: nbhead? '4rem' : undefined,
                pageBreakInside: nbhead? 'avoid' : undefined,
                pageBreakBefore: nbhead? undefined : 'always',
          }
      }}>
      <RepLink rep={rep} ori tag={'Instrument'}>
        <Text variant="h4" css={{marginTop: nbhead? '1rem':undefined }}>
          {label}
        </Text>
      </RepLink>
    </div>
    <Table id={'Instrument'} fixed={["%", "24%", "22%", "8%", "8%"]}  tight miniw={800}
                 css={{borderCollapse: 'collapse', "@media print": {marginTop: nbhead? '-4rem': undefined} }}>
      <TableHead>
        <TableRow>
          <CCell rowSpan={2}>仪器设备名称</CCell>
          <CCell rowSpan={2}>型号规格</CCell>
          <CCell rowSpan={2}>仪器设备编号</CCell>
          <CCell colSpan={2}>性能状态</CCell>
        </TableRow>
        <TableRow>
          <CCell>开机后</CCell>
          <CCell>关机前</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <RepLink rep={rep} ori tag={'Instrument'}>
          {orc.仪器表?.map((o: any, i: React.Key) => {
            return (
                <TableRow key={i}>
                  <CCell>{o.n}</CCell>
                  <CCell>{o.t}</CCell>
                  <CCell css={{wordBreak: 'break-all'}}>{o.i}</CCell>
                  <CCell>{o.o}</CCell>
                  <CCell css={{wordBreak: 'break-all'}}>{o.f}</CCell>
                </TableRow>
            );
          })}
        </RepLink>
      </TableBody>
    </Table>
    {tail测仪器}
  </>;
};
/*测量结果列的标题有 附加了（）单位；
* */
export const 测量结果单位 = ({orc, rep, label, config,children, mem, tag = 'Measure', runit,
                               fixed = ["4.1%", "16%", "9%", "6%", "%", "19%", "7%", "12%", "14%", "11%"] }
                 : { orc: any, rep: any, label: string, fixed?: string[], children?: React.ReactNode,
                               config: EachObserveConfig[][]; mem?: string; tag?: string, runit?: any }
) => {
  const [render1,] = useObserveTable({rep, orc, config: config, tag, allowableV: true});
  return <>
    <h4 css={{
      marginTop: '1rem',
    }}>{label}</h4>
    <FlexibleTable columnWidths={fixed} css={{borderCollapse: 'collapse'}}>
      <TableHeader>
        <TableRow>
          <CCell><span css={{fontSize: '0.8rem'}}>序号</span></CCell><CCell colSpan={5}>检测项目</CCell>
          <CCell>单位</CCell><CCell>观测数据</CCell>
          <CCell>测量结果{runit}</CCell><CCell><span css={{fontSize: '0.8rem'}}>结果判定</span></CCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        <RepLink ori rep={rep} tag={tag}>
          {render1}
          {mem && <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={9}>
              <div css={{minHeight: '2rem', whiteSpace: 'pre-wrap'}}>{orc?.[mem] || '／'}</div>
            </Cell>
          </TableRow>
          }
        </RepLink>
      </TableBody>
    </FlexibleTable>
    {children ? children :
        <span css={{fontSize: '0.8rem'}}>
          注：本表所列项目无测量时，观测数据和测量结果可不填，但结果判定应填写，对不适用项填“/”。
        </span>
    }
  </>;
};
//可通用的：
export const genCBoOmit = (name: string, unit: string, title?: any) => {
  return {
    edit: (inp: any, setInp: (a: any) => void) => {
      return [true, <div css={{textAlign: 'center'}}><Text css={{fontWeight: 800}}>{title}：</Text>
        <InputLine label='观测数据'>
          <SuffixInput value={inp?.[name + 'o'] || ''}
                       onSave={txt => setInp({...inp, [name + 'o']: txt || undefined})}>{unit}</SuffixInput>
        </InputLine>
      </div>]
    },
    view: (orc: any) => {
      return [false, <>
        <CCell>{orc?.[name + 'o']}</CCell>
      </>]
    },
  };
};
/**高阶函数 生成器
 * */
export const genCBoAver = (nvar: string[], index: number, resvDg: number) => {
  return {
    view: (orc: any) => {
      let valuAr = nvar.map((name: any, c: number) => orc?.[name]);
      const aveVal = calcAverageArrObj(valuAr, (row) => row, resvDg);
      return [false, <>
        <CCell>{orc?.[nvar[index]]}</CCell>
        {0 === index && <CCell split rowSpan={nvar.length}>{aveVal}</CCell>
        }
      </>]
    },
  };
};
//可通用的： 一组 测量子项目的 求平均数；
export const genCBoAve = (nmar: string[], resvDg: number, unit: string, title?: any) => {
  return {
    edit: (inp: any, setInp: (a: any) => void) => {
      let valuAr = nmar.map((tag, p: number) =>
          inp?.[tag + 'o']
      );
      const avHs = calcAverageArrObj(valuAr, (row) => row, resvDg);
      return [true, <div css={{textAlign: 'center'}}><Text css={{fontWeight: 800}}>{title}：</Text>
        <InputLine label='观测数据'>
          <SuffixInput value={inp?.[nmar[0] + 'o'] || ''}
                       onSave={txt => setInp({...inp, [nmar[0] + 'o']: txt || undefined})}>{unit}</SuffixInput>
        </InputLine>
        <Text css={{display: 'ruby'}}>计算的测量结果： {avHs} {unit}</Text>
      </div>]
    },
    view: (orc: any) => {
      let valuAr = nmar.map((tag, p: number) =>
          orc?.[tag + 'o']
      );
      const avHs = calcAverageArrObj(valuAr, (row) => row, resvDg);
      return [false, <>
        <CCell>{orc?.[nmar[0] + 'o']}</CCell>
        <CCell split rowSpan={nmar.length}>{avHs}</CCell>
      </>]
    },
  };
};

export const genCBoAvAl = (nmar: string[], resvDg: number, unit: string, title?: any) => {
  return  (orc:any,parOrc:any)=> {
    return {
      edit: (form: UseFormReturn<any, any, any>) => {
        let valuAr = nmar.map((name: any, c: number) =>{
          const ovalue = form.watch(name + 'o')
          return ovalue
        } );
        const avHs = calcAverageArrObj(valuAr, (row) => row, resvDg);
        return [true, <div css={{textAlign: 'center'}}>
          <span className="font-semibold">{title}：</span>
          <div  >
            <FormField
                control={form.control}
                name={nmar[0] + 'o'}
                render={({ field }) => (
                    <FormItem className="flex items-center gap-1 pt-1 break-inside-avoid">
                      <FormLabel>观测数据</FormLabel>
                      <FormControl>
                        <SuffixInput  unit={unit}  {...field}  />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )}
            />
            <FormField control={form.control} name={nmar[0] + 'a'}
                       render={({ field }) => (
                           <FormItem>
                             <FormLabel>设计值</FormLabel>
                             <FormControl>
                               <Input  {...field}/>
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                       )}
            />
          </div>
          <Text css={{display: 'ruby'}}>计算的测量结果： {avHs} {unit}</Text>
        </div>]
      },
      view: () => {
        let valuAr = nmar.map((name: any, c: number) => orc?.[name + 'o']);
        const avHs = calcAverageArrObj(valuAr, (row) => row, resvDg);
        return [false, <>
          <CCell>{orc?.[nmar[0] + 'o']}</CCell>
          <CCell split rowSpan={nmar.length}>{avHs}</CCell>
          <CCell split rowSpan={nmar.length}>{orc?.[nmar[0] + 'a']}</CCell>
        </>]
      },
    };
  }
};
//搞成2层的 高阶函数：
export const genCBoOmitAl = (name: string, unit: string, title?: any) => {
  return  (orc:any,parOrc:any)=> {
    return {
      edit: (form: UseFormReturn<any, any, any>) => {
        return [true, <div className="flex flex-wrap items-center gap-1 justify-center">
          <span className="font-semibold">{title}：</span>
          <FormField
              control={form.control}
              name={name + 'o'}
              render={({ field }) => (
                  <FormItem className="flex items-center gap-1 pt-1 break-inside-avoid">
                    <FormLabel>观测数据</FormLabel>
                    <FormControl>
                      <SuffixInput  unit={unit}  {...field}  />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
              )}
          />
        </div>]
      },
      view: () => {
        return [false, <>
        <CCell>{orc?.[name + 'o']}</CCell>
        </>]
      },
    }
  }
};
