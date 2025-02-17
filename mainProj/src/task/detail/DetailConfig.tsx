/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    useTheme,
    Text,
    IconButton,
    IconArrowLeft,
    TwoHalfRightPanel,
    InputLine,
    Select,
    CommitInput,
    ButtonRefComp,
    SuffixInput,
 LineColumn, Container, CheckSwitch, VerticalMenu, DdMenuItem,
} from "customize-easy-ui-component";

import { Link as RouterLink } from "../../routing/Link";
import {PreloadedQuery, usePreloadedQuery} from "react-relay/hooks";
import {DetailConfigQuery} from "./__generated__/DetailConfigQuery.graphql";
//import {noop} from "use-media/lib/utilities";

import {DivisionChooseQuery$data} from "../../unit/division/__generated__/DivisionChooseQuery.graphql";
import {Dispatch, MutableRefObject, SetStateAction, useEffect} from "react";

import {
    Disposable,
} from 'relay-runtime';
import useUpdateDetailMutation from "./useUpdateDetailMutation";
import {InternalEditorResult} from "../../common/base";
// import {TwoHalfRightPanel} from "../../../UiDebugSave/sample/TwoHalfRightPanel";
import HashLinkObserver from "react-hash-link";


//import useReckonIspFeeMutation from "./useReckonIspFeeMutation";
//[HOOK限制]按钮点击函数内部直接上toast()或toaster.notify()很可能无法正常显示。而放在函数组件顶层render代码前却能正常。
const graphql = require("babel-plugin-relay/macro");

interface DetailConfigProps {
    id?: string;
    prepared: {
        //【特别注意】query路由器若不是提供这个类型的查询DetailConfigQuery，本组件也不会抛出异常！在usePreloadedQuery<DetailConfigQuery>()不报错！
        query: PreloadedQuery<DetailConfigQuery>;
    }
    children: React.ReactNode;
    routeData: any;
}
/**业务信息配置*/
export default function DetailConfig(props: DetailConfigProps) {
    const theme = useTheme();
    const data = usePreloadedQuery<DetailConfigQuery>(
        graphql`
            query DetailConfigQuery($detId: ID!) {
                node(id: $detId)
                {
                    id, __typename
                    ... on Detail {
                        id ident type feeOk sprice recnt
                        isp{id dev{ id type } bsType }
                        ccost fcode zmoney  mreprc nsite test cheap apprp online impor ntscop
                        varea opprn totm diame rustc turbi hardd phval conduc palka totalk dsolid 
                        phosph oilw tiron sulfit rebasi chrion dioxy carbon captem num isum
                        meter
                    }
                }
            }
        `,
        props.prepared.query,
    );
    const { node:item, }=data;    //有多个分项报告[SimpleReport]
    const {call:updateDetailFunc,doing,called, result}= useUpdateDetailMutation();
  //  const {call:cudChFeefunc, doing, called, reset, result:cudAck}= useCudChargingFeeMutation();     //删除专用，增加在子组件内部独立的；
    const commitBlurRef =React.useRef(null);
    //先试一试：直接在父辈同一个组件内直接做 编辑器方式的保存。 PreloadedQuery+Mutation()都在同一组件干。
    const [ccost, setCcost] = React.useState<number|undefined>(item?.ccost!);
    const [fcode, setFcode] = React.useState(item!.fcode);
    const [zmoney, setZmoney] = React.useState(item?.zmoney);
    const [totm, setTotm] = React.useState<number|undefined>(item!.totm!);
    //会根据参数判定输出类型啊！报错了,useRef<T>(initialValue: T|null): RefObject<T>; useRef<T>(initialValue: T): MutableRefObject<T>;
    const editorRef=React.useRef({} as InternalEditorResult);

    console.log("收费主页来taskSj:", props.routeData.params.taskId!,";isp=", props.routeData.params.ispId!, "editorRef=",editorRef.current);

    if(!item) return(
        <Text  variant="h4"　css={{ textAlign: 'center' }}>
            没找到检验ID {props.routeData.params.ispId}。
        </Text>);
  return (
      <TwoHalfRightPanel
          title={`关联的收费信息`}
          back={
              <RouterLink href={`/task/${props.routeData.params.taskId!}`}>
                  <IconButton  noBind  icon={<IconArrowLeft />}
                               variant="ghost"
                               label="后退"
                               size="md"
                               css={{
                                   marginRight: theme.spaces.sm,
                                   [theme.mediaQueries.md]: {
                                       display: "none"
                                   }
                               }}
                  />
              </RouterLink>
          }
          menu={
              <VerticalMenu>
                  <DdMenuItem label="功能待续"
                              onClick={(e) => {
                              }}/>
              </VerticalMenu>
          }
      >
        <DetailConfigInner det={item} editorRef={editorRef} />

        <ButtonRefComp
            intent="primary"
            disabled ={false}
            ref={commitBlurRef}
            css={{ marginLeft: theme.spaces.sm }}
            onPointerOver={(e :any) => {
                // @ts-ignore
                commitBlurRef!.current!.focus();
            }}
            onPress={ async () => {
                //获取最新的儿孙组件编辑器数据
                const sendInp= editorRef.current!.doConfirm() as any;
                //relay 类型报错
                let saveas={...sendInp, zmoney: (sendInp?.zmoney===undefined? '':sendInp?.zmoney+''), };
                await updateDetailFunc(props.routeData.params.detId, saveas);
            } }
        >
            更新业务信息到后端
        </ButtonRefComp>
        <RouterLink href={"/tasks"}>
            查全部任务
        </RouterLink>

      </TwoHalfRightPanel>
  );
};
/**
 * 为了避免把保存按钮也一起放入到编辑器组件中，还能把编辑后的属性数据全部提供给父辈组件，
 * 真正mutation接口函数操作+按钮触发:直接安排在上一级组件内做的。
 * 【通用模式】规定统一的数据修改保存的模式：引进专有的props.editorRef.doConfirm():来做规范和统一处理。
* */
interface DetailConfigInnerProps {
    //从上级获取老的字段属性数据:  Detail 模型;
    det: any;
    //正常情形editorRef不应该是null的，上级组件必须有保存触发按钮的;
    //通用的编辑器：字段属性被修改之后，必须回传编辑好的字段 新数据给上级组件。editorRef对上级组件暴露编辑器数据。editorRef.doConfirm()最好保持一样名字
    editorRef?: MutableRefObject<InternalEditorResult>;
}
/**业务信息配置--编辑器主体子组件
 * 制造监检：的容器，要配置sort +vart两个 放入Detail对象，否则计费没有参数的！
 * */
function DetailConfigInner({det, editorRef}: DetailConfigInnerProps) {
    const theme = useTheme();
    //设备类型：EQP_TYPE 有些是单独报告的没关联设备台账的。 det?.type优先承认的。 安全阀需要 ="F"
    const type= det?.type?? det?.isp!.dev.type;
    //业务类型: OPE_TYPE ;
    const ope= det?.isp!.bsType;
    const [ident, setIdent] = React.useState(det!.ident);
    const [ccost, setCcost] = React.useState<number|undefined>(det?.ccost!);
    const [mreprc, setMreprc] = React.useState<number|undefined>(det?.mreprc!);
    const [nsite, setNsite] = React.useState(det?.nsite);
    const [test, setTest] = React.useState(det?.test);
    const [cheap, setCheap] = React.useState(det?.cheap);
    const [apprp, setApprp] = React.useState(det?.apprp);
    const [online, setOnline] = React.useState(det?.online);
    const [impor, setImpor] = React.useState(det?.impor);
    const [ntscop, setNtscop] = React.useState(det?.ntscop);
    //fcode若是遗留取值，前端Select列表不存在的取值，显示是空的，但是不改变Select选择的直接保存依然会把旧的取值发给后端，除非纠正或手动清除。Select组件都会遇见问题！
    const [fcode, setFcode] = React.useState(det!.fcode);
    const [varea, setVarea] = React.useState<number|undefined>(det!.varea!);
    const [opprn, setOpprn] = React.useState<number|undefined>(det!.opprn!);
    const [totm, setTotm] = React.useState<number|undefined>(det!.totm!);
    const [diame, setDiame] = React.useState<number|undefined>(det!.diame!);
    const [rustc, setRustc] = React.useState<number|undefined>(det!.rustc!);
    const [turbi, setTurbi] = React.useState<number|undefined>(det!.turbi);
    const [hardd, setHardd] = React.useState<number|undefined>(det!.hardd);
    const [phval, setPhval] = React.useState<number|undefined>(det!.phval);
    const [conduc, setConduc] = React.useState<number|undefined>(det!.conduc);
    //数值setPalka( Number(txt) )，若编辑框清空'', Number(txt)会得到0; 但setPalka( Number(txt) || undefined)会导致0值变身undefined;能支持空值的;
    const [palka, setPalka] = React.useState<number|undefined>(det!.palka);
    const [totalk, setTotalk] = React.useState<number|undefined>(det!.totalk);
    const [dsolid, setDsolid] = React.useState<number|undefined>(det!.dsolid);
    const [phosph, setPhosph] = React.useState<number|undefined>(det!.phosph);
    const [oilw, setOilw] = React.useState<number|undefined>(det!.oilw);
    const [tiron, setTiron] = React.useState<number|undefined>(det!.tiron);
    const [sulfit, setSulfit] = React.useState<number|undefined>(det!.sulfit);
    const [rebasi, setRebasi] = React.useState<number|undefined>(det!.rebasi);
    const [chrion, setChrion] = React.useState<number|undefined>(det!.chrion);
    const [dioxy, setDioxy] = React.useState<number|undefined>(det!.dioxy);
    const [carbon, setCarbon] = React.useState<number|undefined>(det!.carbon);
    const [captem, setCaptem] = React.useState<number|undefined>(det!.captem);
    const [num, setNum] = React.useState<number|undefined>(det!.num);
    const [isum, setIsum] = React.useState<number|undefined>(det!.isum);
    //在后端Java接口层只会认得null, 而undefined是前端才晓得。 meter：数据库是double,接口graphQL这层上String实际要两次转换;保证允许null取值。
    const [meter, setMeter] = React.useState<number|null>(det!.meter);

    const [zmoney, setZmoney] = React.useState(det?.zmoney);

    //'doConfirm' function makes the dependencies of useEffect change on every render. wrap the definition of 'doConfirm' in its own useCallback() Hook
    //前面添加了 async 会导致返回是一个 Promise{}并非直接的sendInp
    //看来这个函数是重武器：实际上是每一次render都会变成新的函数对象的，而不能用useCallback(() => {},)它无法获得最新编辑数据。
    function doConfirm() {
        const mutationInp={ident, ccost,mreprc, zmoney, fcode, nsite, test, cheap, apprp, online, impor, ntscop,
            varea, opprn, totm, diame,
            rustc: (type==='2'||type==='R'||type==='1')? rustc : undefined ,
            turbi, hardd, phval, conduc, palka, totalk, dsolid, phosph, oilw, tiron, sulfit,
            rebasi, chrion, dioxy, carbon, captem, num, isum,  meter: meter?.toString(),
        };
        //组织新的数据：统一放在Obj{,,};
        return mutationInp;
    }
    /*const doConfirm = React.useCallback(() => {
        const mutationInp={ ccost, totm, zmoney, fcode };
        return mutationInp;
    }, []);*/
    //const handleSelect = React.useCallback(() => confirmation, []);
    //依赖[doConfirm]必须上； 装载和卸载时一次空数组 useEffect （[]）。
    editorRef!.current = { doConfirm } as InternalEditorResult;

    console.log("DetailConfigInner准建:prepared=",ccost);
    //【问题】fcode很可能历史遗留下来的，但是value不适合的，从列表框看不出来有遗留值，后端有可能保留旧的取值。
    const list进口合格= type === '1'?  <React.Fragment>
                <option value={'J110'}>{'燃煤锅炉安全性能监督检验'}</option>
                <option value={'J120'}>{'燃油、气锅炉安全性能监督检验'}</option>
                <option value={'J180'}>{'进口承压类合格产品安全性能监督检验（锅炉）'}</option>
            </React.Fragment> :
          type === '2' ? <React.Fragment>
                  <option value={'J130'}>{'不锈钢、衬里多层容器安全性能监督检验'}</option>
                  <option value={'J150'}>{'汽车罐车、铁路罐车安全性能监督检验'}</option>
                  <option value={'J160'}>{'各类气瓶安全性能监督检验'}</option>
                  <option value={'J140'}>{'一般压力容器安全性能监督检验'}</option>
                  <option value={'J190'}>{'进口承压类合格产品安全性能监督检验（容器）'}</option>
            </React.Fragment> :
              <option value={'J170'}>{'其他设备安全性能监督检验'}</option> ;
    const list进口不合格= type === '1'?  <React.Fragment>
            <option value={'J210'}>{'燃煤锅炉安全性能监督检验'}</option>
            <option value={'J220'}>{'燃油、气锅炉安全性能监督检验'}</option>
            <option value={'J270'}>{'其他设备安全性能监督检验'}</option>
        </React.Fragment> :
        type === '2' ? <React.Fragment>
                <option value={'J230'}>{'不锈钢、衬里多层容器安全性能监督检验'}</option>
                <option value={'J250'}>{'汽车罐车、铁路罐车安全性能监督检验'}</option>
                <option value={'J260'}>{'各类气瓶安全性能监督检验'}</option>
                <option value={'J240'}>{'一般压力容器安全性能监督检验'}</option>
            </React.Fragment> :
            <option value={'J270'}>{'其他设备安全性能监督检验'}</option> ;
    //同时存在两个<Select id="fcode" 的情况： <HashLinkObserver />会定位给第一个出现的id(input)。
    return (
        <Container>
            <div css={{
                paddingTop: theme.spaces.lg,
                paddingBottom: theme.spaces.lg
            }}>
                <Text variant="h5">业务参数</Text>
                <LineColumn >
                    <HashLinkObserver />
                    <InputLine label={`报告附加标识:`}>
                        <CommitInput  value={ ident || ''}  onSave={txt => setIdent( txt || undefined) } />
                    </InputLine>
                    <InputLine  label={`施工工程费:`}>
                        <SuffixInput id="ccost"  onSave={txt=> setCcost( Number(txt) || undefined)}
                                      type="number"  value={ ccost || ''}>元</SuffixInput>
                    </InputLine>
                    <InputLine label={`改造、修理的设备价:`}>
                        <SuffixInput id="mreprc"  onSave={txt=> setMreprc( Number(txt) || undefined)}
                                      type="number"  value={ mreprc || ''}>元</SuffixInput>
                    </InputLine>
                    { (type==='F' || type==='5' || type==='4') &&
                        <InputLine label={type==='F'? '使用安全阀在线检测仪进行安全阀在线排放试验:' : type==='5'? '是否工作装置测试:' : '是否载荷试验:'}>
                            <CheckSwitch checked={test || false} onChange={e => setTest(test? undefined:true)} />
                        </InputLine>
                    }
                    { (type==='F' || type==='1' || type==='4') &&
                        <InputLine label={type==='F'? '采用实跳方式进行安全阀在线校验:' : type==='1'? '热效率是简单测试的:' : '安全监控管理系统试验派生自定期检验而非监检或首检:'}>
                            <CheckSwitch checked={cheap || false} onChange={e => setCheap(cheap? undefined:true)} />
                        </InputLine>
                    }
                    { (type==='F' || type==='1') &&
                        <InputLine label={type==='F'? '检验机构到使用单位进行离线安全阀校验的:' : '工业锅炉定型产品热效率测试:'}>
                            <CheckSwitch checked={apprp || false} onChange={e => setApprp(apprp? undefined:true)} />
                        </InputLine>
                    }
                    { (type==='F') && <React.Fragment>
                            <InputLine label={'是否在线校验,不是离线校验的:'}>
                                <CheckSwitch checked={online || false} onChange={e => setOnline(online? undefined:true)} />
                            </InputLine>
                            <InputLine label={'是否进口安全阀在线校验的:'}>
                            <CheckSwitch checked={impor || false} onChange={e => setImpor(impor? undefined:true)} />
                            </InputLine>
                        </React.Fragment>
                    }
                    { ope==='SAFETYINS' &&
                        <InputLine label={`进口合格产品安全性能监督检验:`}>
                            <Select id="fcode" inputSize="md"  value={ fcode || ''}
                                    onChange={e => setFcode( e.currentTarget.value||undefined ) } >
                                <option></option>
                                { list进口合格 } </Select>
                        </InputLine>
                    }
                    { ope==='SAFETYINS' &&
                        <InputLine label={`进口不合格产品安全性能监督检验:`}>
                            <Select id="fcode" inputSize="md"  value={ fcode || ''}
                                    onChange={e => setFcode( e.currentTarget.value||undefined ) } >
                                <option></option>
                                { list进口不合格 } </Select>
                        </InputLine>
                    }
                    { (ope==='MANUFACT' && type==='2') &&
                        <InputLine label={`压力容器产品制造过程监督检验:`}>
                            <Select id="fcode" inputSize="md"  value={ fcode || ''}
                                    onChange={e => setFcode( e.currentTarget.value||undefined ) } >
                                <option></option>
                                <option value={'2120'}>{'无缝钢瓶制造过程监督检验'}</option>
                                <option value='2130'>焊接钢瓶制造过程监督检验</option>
                                <option value='2140'>液化石油气钢瓶制造过程监督检验</option>
                                <option value={'2150'}>{'溶解乙炔钢瓶制造过程监督检验'}</option>
                            </Select>
                        </InputLine>
                    }
                    { (ope==='MANUFACT' && type==='1') &&
                        <InputLine label={'额定功率(MW)/蒸发量:'}>
                            <SuffixInput  onSave={txt=> setRustc( Number(txt) || undefined)}
                                          type="number"  value={ rustc || ''}>MW</SuffixInput>
                        </InputLine>
                    }
                    { (type==='2' || type==='R') && <React.Fragment>
                            <InputLine label={`内外表面检验:`}>
                                <SuffixInput id="varea" onSave={txt=> setVarea( Number(txt) || undefined)}
                                              type="number"  value={ varea || ''}>平方米</SuffixInput>
                            </InputLine>
                            <InputLine label={(type==='2'? `液面计、紧急切断阀及其它附件检验合计` : '其他附件检查') +'收费金额:'}>
                                <SuffixInput id="totm"  onSave={txt=> setTotm( Number(txt) || undefined)}
                                              type="number"  value={ totm || ''}>元</SuffixInput>
                            </InputLine>
                            <InputLine label={type==='2'? '除锈喷漆:' : '盛水试验:'}>
                                <SuffixInput  onSave={txt=> setRustc( Number(txt) || undefined)}
                                              type="number"  value={ rustc || ''}>{type==='2'? '平方米' : '立方米'}</SuffixInput>
                            </InputLine>
                            <InputLine label={type==='2'? '安全阀性能试验:' : '导静电测试:'}>
                                <SuffixInput  onSave={txt=> setNum(txt===''? undefined : Number(txt))}
                                              type="number"  value={ num || '' }>{type==='2'? '只' : '次'}</SuffixInput>
                            </InputLine>
                            <InputLine label={type==='2'? '液面计、紧急切断阀及其它附件检验:' : '通气阀性能试验:'}>
                                <SuffixInput  onSave={txt=> setIsum(txt===''? undefined : Number(txt))}
                                              type="number"  value={ isum || '' }>只</SuffixInput>
                            </InputLine>
                        </React.Fragment>
                    }
                    { type==='F' &&
                        <InputLine label={`工作压力:`}>
                            <SuffixInput id="opprn" onSave={txt=> setOpprn( Number(txt) || undefined)}
                                          type="number"  value={ opprn || ''}>MPa</SuffixInput>
                        </InputLine>
                    }
                    { (type==='F' || type==='2' || type==='R') && <React.Fragment>
                            <InputLine label={type==='F'? '对安全阀密封面直径进行现场检测计算:' : '没有气密性试验的收费:'}>
                                <CheckSwitch checked={ntscop || false} onChange={e => setNtscop(ntscop? undefined:true)} />
                            </InputLine>
                            <InputLine label={type==='F'? '公称通径:' : type==='2'? '耐压试验:' :'水压试验:'}>
                                <SuffixInput id="diame" onSave={txt=> setDiame( Number(txt) || undefined)}
                                              type="number"  value={ diame || ''}>{type==='F'? 'mm' : '立方米'}</SuffixInput>
                            </InputLine>
                        </React.Fragment>
                    }
                    { type==='Z' && <React.Fragment>
                            <InputLine label={ope==='TEST'? '浊度:' : '运动黏度:'}>
                                <SuffixInput  onSave={txt=> setTurbi( Number(txt) || undefined)}
                                    type="number"  value={ turbi || ''}>次</SuffixInput>
                            </InputLine>
                            <InputLine label={ope==='TEST'? '硬度:' : '密度:'}>
                                <SuffixInput  onSave={txt=> setHardd( Number(txt) || undefined)}
                                    type="number"  value={ hardd || ''}>次</SuffixInput>
                            </InputLine>
                            <InputLine label={ope==='TEST'? 'PH值:' : '水溶性酸碱:'}>
                                <SuffixInput  onSave={txt=> setPhval( Number(txt) || undefined)}
                                    type="number"  value={ phval || ''}>次</SuffixInput>
                            </InputLine>
                            <InputLine label={ope==='TEST'? '电导率:' : '闭口闪点:'}>
                                <SuffixInput  onSave={txt=> setConduc( Number(txt) || undefined)}
                                              type="number"  value={ conduc || ''}>次</SuffixInput>
                            </InputLine>
                            <InputLine label={ope==='TEST'? '磷酸根:' : '酸值:'}>
                                <SuffixInput  onSave={txt=> setPhosph(txt===''? undefined : Number(txt))}
                                              type="number"  value={ phosph }>次</SuffixInput>
                            </InputLine>
                            <InputLine label={ope==='TEST'? '油:' : '水分:'}>
                                <SuffixInput  onSave={txt=> setOilw(txt===''? undefined : Number(txt))}
                                              type="number"  value={ oilw }>次</SuffixInput>
                            </InputLine>
                            <InputLine label={ope==='TEST'? '水垢全分析:' : '残炭:'}>
                                <SuffixInput  onSave={txt=> setCarbon(txt===''? undefined : Number(txt))}
                                              type="number"  value={ carbon }>次</SuffixInput>
                            </InputLine>
                            <InputLine label={ope==='TEST'? '树脂交换容量分析:' : '5%低沸物馏出温度:'}>
                                <SuffixInput  onSave={txt=> setCaptem(txt===''? undefined : Number(txt))}
                                              type="number"  value={ captem }>次</SuffixInput>
                            </InputLine>
                       </React.Fragment>
                    }
                    { (type==='Z' && ope==='TEST') && <React.Fragment>
                        <InputLine label={'酚酞碱度:'}>
                            <SuffixInput  onSave={txt=> setPalka(txt===''? undefined : Number(txt) )}
                                          type="number"  value={ palka }  max='10' min='0'>次</SuffixInput>
                        </InputLine>
                        <InputLine label={'全碱度（总碱度）:'}>
                            <SuffixInput  onSave={txt=> setTotalk(txt===''? undefined : Number(txt))}
                                          type="number"  value={ totalk }>次</SuffixInput>
                        </InputLine>
                        <InputLine label={'溶解固形物:'}>
                            <SuffixInput  onSave={txt=> setDsolid(txt===''? undefined : Number(txt))}
                                          type="number"  value={ dsolid }>次</SuffixInput>
                        </InputLine>
                        <InputLine label={'全铁:'}>
                            <SuffixInput  onSave={txt=> setTiron(txt===''? undefined : Number(txt))}
                                          type="number"  value={ tiron }>次</SuffixInput>
                        </InputLine>
                        <InputLine label={'亚硫酸根:'}>
                            <SuffixInput  onSave={txt=> setSulfit(txt===''? undefined : Number(txt))}
                                          type="number"  value={ sulfit }>次</SuffixInput>
                        </InputLine>
                        <InputLine label={'相对碱度:'}>
                            <SuffixInput  onSave={txt=> setRebasi(txt===''? undefined : Number(txt))}
                                          type="number"  value={ rebasi }>次</SuffixInput>
                        </InputLine>
                        <InputLine label={'氯离子:'}>
                            <SuffixInput  onSave={txt=> setChrion(txt===''? undefined : Number(txt))}
                                          type="number"  value={ chrion }>次</SuffixInput>
                        </InputLine>
                        <InputLine label={'溶解氧:'}>
                            <SuffixInput  onSave={txt=> setDioxy(txt===''? undefined : Number(txt))}
                                          type="number"  value={ dioxy }>次</SuffixInput>
                        </InputLine>
                    </React.Fragment>
                    }
                    { type==='2' &&
                        <InputLine label={`容器检验部位总米数:`}>
                            <SuffixInput id="meter" onSave={txt=> setMeter(txt===''? null : Number(txt))}
                                          type="number"  value={meter===null? '' : Number(meter) }>米</SuffixInput>
                        </InputLine>
                    }
                    <InputLine label={`制造产品设备价:`}>
                        <SuffixInput id="zmoney"  onSave={txt=> setZmoney( txt || undefined)}
                                      type="number"  value={ zmoney || ''}>元</SuffixInput>
                    </InputLine>
                    { det!.recnt>0 &&
                        <InputLine label={`复检无需现场复检确认:`}>
                            <CheckSwitch checked={nsite || false} onChange={e => setNsite(nsite? undefined:true)} />
                        </InputLine>
                    }
                </LineColumn>
            </div>
        </Container>
    );
}
