import * as React from "react";
import {InspectRecordLayout, InternalItemProps, SelectHookfork, SelectPair, useItemInputControl, 现场条件选} from "../common/base";
import {useMeasureInpFilter} from "../common/hooks";
import {arraySetInp, calcAverageArrObj, floatInterception,} from "../../common/tool";
import {TechnicalWitness} from "../park/editor";

//可以复用的组件： 尽量抽象 和 提高代码复用程度！
interface Props  extends InternalItemProps{
    label?: string;
    nos?: string;
    titles?: any[];    //可能是Node[]，不一定纯粹string;  可变的多个标题编码的。
    zjuse?: number;     //最末尾的注释的文本使用那一段话？可选择办法的。
    config?: any[];    //有配置模式的 : 表对象的默认取值；
    //技术资料 后面的备注：
    tmemo?: any;
}

export const itemA技术见证=['见证表','大备注','其它备注'];
//存储对象{no,ti,bh} [{no:'ZLQR',ti:'资料审查确认单'}, ]
const default见证1: any[] | undefined=[];
export const WitnessCraTwo=
    React.forwardRef((
        { children, show ,alone=true,redId,nestMd,label,config=default见证1,titles,tmemo}:Props,  ref
    ) => {
        const defvcbFunc = React.useCallback((par: any) => {
            const { 见证表, }=par||{};
            if(!见证表 || 见证表.length<1)   par.见证表=config;
            return  par;
        }, []);
        const [getInpFilter]=useMeasureInpFilter(null,itemA技术见证,defvcbFunc);
        const {inp, setInp} = useItemInputControl({ ref });
        return  <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter}  show={show}  redId={redId} nestMd={nestMd}
                                     alone={alone}  label={label!}>
            <TechnicalWitness  inp={inp} setInp={setInp} defaultV={config} label={titles![0]+'、技术资料和工作见证材料'}/>
            {tmemo}
            <hr/>
            <Text variant="h5">
            {titles![1]}、备注：
            </Text>
            <TextArea  value={inp?.大备注 ||''} rows={4}
                       onChange={e => setInp({ ...inp, 大备注: e.currentTarget.value||undefined}) } />
            {titles![2] && <>
                <Text variant="h5">
                    {titles![2]}：
                </Text>
                <TextArea  value={inp?.其它备注 ||''} rows={4}
                           onChange={e => setInp({ ...inp, 其它备注: e.currentTarget.value||undefined}) } />
             </>
            }
            { children }
        </InspectRecordLayout>;
    } );

const item机构速度o=['起速','下速','回转','变幅','回速'];
export const item机构速度=[] as string[];
export const itemA机构速度=['速度备注'];
item机构速度o.forEach((name, i:number)=>{
    item机构速度.push(name);         //name+'1',name+'2',name+'3'
    itemA机构速度.push(name+'r');
});
export const itemB机构速度=item机构速度.concat(itemA机构速度);       //简化name
export const defaultTl机构速度=['主起升机构起升速度','主起升机构下降速度','回转速度','变幅速度','吊具回转速度'];
/**编辑器：各机构运行速度记录: 支持项目 标题自定义 titles:['',,];
 * */
export const MoveSpeed=
    React.forwardRef(({ children, show ,alone=true,refWidth,label,titles=defaultTl机构速度,zjuse=1,
                      }:Props,  ref
    ) => {
        //距离#存储用 *o;   时间#存储用 *v;
        const [getInpFilter]=useMeasureInpFilter(item机构速度,itemA机构速度,);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={label!}>
                {label}<br/>
                { item机构速度o.map((field, i:number) => {
                    let arrobj=[];
                    for(let e=0;e<3;e++){
                        arrobj.push({d: inp?.[field+'o']?.[e], t:inp?.[field+'v']?.[e]});
                    }
                    return  <React.Fragment key={i}>
                        项目 {'>'} {titles[i]}：
                        <LineColumn column={5} css={{
                            alignItems: 'center',
                            justifyItems: 'center',
                        }}>
                            { (new Array(4===i? 3:4)).fill(null).map(( _,  w:number) => {
                                return <React.Fragment key={w}>
                                    <InputLine key={w} label={`次数${w+1}，${4===i?'圈数':'距离'}：`}>
                                        <SuffixInput  value={inp?.[field+'o']?.[w] ||''} onSave={txt=>arraySetInp(field+'o', w, txt,inp,setInp)}>{4===i?'r':'m'}</SuffixInput>
                                    </InputLine>
                                    <InputLine key={w} label={`次数${w+1}，时间：`}>
                                        <SuffixInput  value={inp?.[field+'v']?.[w] ||''} onSave={txt=>arraySetInp(field+'v', w, txt,inp,setInp)}>min</SuffixInput>
                                    </InputLine>
                                    <Text>速度（{4===i?'r':'m'}/min)= {floatInterception(inp?.[field+'o']?.[w]/inp?.[field+'v']?.[w], 2)} </Text>
                                </React.Fragment>;
                            }) }
                            <InputLine  label={`平均速度（${4===i?'r':'m'}/min)：`}>
                                <Text>{calcAverageArrObj(arrobj,(row)=>{return row?.d/row?.t},2,4===i? 3:4)}</Text>
                            </InputLine>
                            <InputLine label={titles[i]+'检验结果'}>
                                <SelectHookfork value={ inp?.[field+'r'] ||''}
                                                onChange={e => setInp({ ...inp, [field+'r']: e.currentTarget.value||undefined}) }/>
                            </InputLine>
                        </LineColumn>
                    </React.Fragment>;
                }) }
                备注：
                <TextArea  value={inp?.速度备注 ||''} rows={4}
                           onChange={e => setInp({ ...inp, 速度备注: e.currentTarget.value||undefined}) } />
                {1===zjuse && <>
                    注：1、对于起升速度、下降速度、回转速度、变幅速度，测3次计算平均值。
                    2、对于产品标准和设计文件同时对速度允许偏差都有规定的，以较严规定作为检验结果判定依据。对于产品标准和设计 文件对速度允许偏差都没有规定的，相应的速度仅测量，不作检验结果判定。
                    3、对于多起升机构或多小车运行机构的起重机，仅记录其中1个主起升机构的速度。对于其余起升机构的速度测量值， 记录在备注栏。
                    4、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
                    5、未检查或无需检验的，仅填检验结果栏。
                    </>
                }
                { children }
            </InspectRecordLayout>
        );
    } );

const item制动距离o=['主制距','副制距'];
// export const item制动距离=[] as string[];
export const itemA制动距离=['制距备注'];
item制动距离o.forEach((name, i:number)=>{
    itemA制动距离.push(name);       //item制动距离.push(name);
    itemA制动距离.push(name+'r');
});
export const defaultTl制动距离=['主起升机构','副起升机构'];
export const Braking=
    React.forwardRef(({ children, show ,alone=true,refWidth,label,titles=defaultTl制动距离}:Props,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(null,itemA制动距离,);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={label!}>
                {label}, 单位：mm<br/>
                { item制动距离o.map(( field, i:number) => {
                    return<React.Fragment key={i}>项目 {'>'} {titles[i]}：
                        <LineColumn>
                            { (new Array(3)).fill(null).map(( _,  w:number) => {
                                return <InputLine key={w} label={`次数${w+1}，制动距离：`}>
                                    <SuffixInput  value={inp?.[field]?.[w] ||''} onSave={txt=>arraySetInp(field,w,txt,inp,setInp)}>mm</SuffixInput>
                                </InputLine>;
                            }) }
                            <InputLine  label='平均制动距离：'>
                                <Text>{calcAverageArrObj(inp?.[field],a=>a,2,3)}mm</Text>
                            </InputLine>
                            <InputLine label={titles[i]+' > 制动距离-检验结果'}>
                                <SelectHookfork value={ inp?.[field+'r'] ||''}
                                                onChange={e => setInp({ ...inp, [field+'r']: e.currentTarget.value||undefined}) }/>
                            </InputLine>
                        </LineColumn>
                    </React.Fragment>;
                }) }
                备注：
                <TextArea  value={inp?.制距备注 ||''} rows={3}
                           onChange={e => setInp({ ...inp, 制距备注: e.currentTarget.value||undefined}) } />
                { children }
            </InspectRecordLayout>
        );
    } );

const itemA现场 = ['检验条件'];
/**类似通用的二维表格，但有不同点：必须有一个关键字段唯一性判定；互动流程稍微有差别。适合小数量数据集合。 aDateObj直接倒手...inp;同一个对象参考inp?.检验条件?.find()。
 * */
export const SiteConditionMbcr =
React.forwardRef((
    {children, show, alone = true, refWidth, label}: Props, ref
) => {
    const theme = useTheme();
    const [getInpFilter] = useMeasureInpFilter(null, itemA现场,);
    const {inp, setInp} = useItemInputControl({ref});
    const [floor, setFloor] = React.useState<string | null>(null);
    const aDateObj = inp?.检验条件?.find((t: any) => t.d === floor);
    const dateBlurRef = React.useRef(null);
    return (
        <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                             alone={alone} label={label!}>
            <Text variant="h5">{label}</Text>
            1、试验的动力源、环境温度、海拔高度、风速符合标准和设计要求。<br/>
            2、检验现场不得有易燃、易爆以及腐蚀性气体。
            <hr/>
            <div>现场检验条件确认结果的记录:
                <Table css={{borderCollapse: 'collapse'}} tight miniw={800}>
                    <TableBody>
                        <TableRow>
                            <CCell>确认日期</CCell>
                            <CCell>1、试验的动力源、环境温度、海拔高度、风速符合标准和设计要求</CCell>
                            <CCell>2、检验现场不得有易燃、易爆以及腐蚀性气体</CCell>
                        </TableRow>
                        {inp?.检验条件?.map((obj: any, i: number) => {
                            return <TableRow key={i}>
                                <CCell>{obj?.d}</CCell>
                                <CCell>{obj?.T || ''}</CCell>
                                <CCell>{obj?.y || ''}</CCell>
                            </TableRow>
                        })}
                    </TableBody>
                </Table>
            </div>
            <>新增检查确认时间=＞</>
            <LineColumn>
                <InputLine label='首先设置当前检验日期'>
                    <SuffixInput type='date' onPointerOut={(e: any) => {
                        // @ts-ignore
                        dateBlurRef!.current!.focus();
                    }}
                                 value={floor || ''} onSave={txt => setFloor(txt || null)}>
                        <ButtonRefComp disabled={aDateObj || !floor} ref={dateBlurRef}
                                       onPress={() => setInp({
                                           ...inp,
                                           检验条件: (inp?.检验条件 ? [...inp?.检验条件, {d: floor}] : [{d: floor}])
                                       })}
                        >新增</ButtonRefComp>
                        <Button disabled={!aDateObj || !floor}
                                css={{marginTop: theme.spaces.sm}} size="sm"
                                onPress={() => setInp({
                                    ...inp,
                                    检验条件: [...inp?.检验条件?.filter((t: any) => t.d !== floor)],
                                })}
                        >刪除</Button>
                    </SuffixInput>
                </InputLine>
                <InputLine label={`1、试验的动力源、环境温度、海拔高度、风速(${floor})`}>
                    <SelectPair value={aDateObj?.T || ''} dlist={现场条件选} onChange={e => {
                        if (floor && aDateObj) {
                            aDateObj.T = e.currentTarget.value || undefined;
                            setInp({...inp});
                        }
                    }}/>
                </InputLine>
                <InputLine label={`2、检验现场不得有易燃、易爆以及腐蚀性气体(${floor})`}>
                    <SelectPair value={aDateObj?.y || ''} dlist={现场条件选} onChange={e => {
                        if (floor && aDateObj) {
                            aDateObj.y = e.currentTarget.value || undefined;
                            setInp({...inp});
                        }
                    }}/>
                </InputLine>
            </LineColumn>
            注：每次到现场后，在检验前应对检验条件进行确认，只有确认所有与检验相关的条件满足检验要求时，才能开始开展检验工作。
        </InspectRecordLayout>
    );
});
interface ItemConclusionProps  extends Props{
    //需要加上 检验日期1 的编辑？
    startd?: boolean;
    nxtstyp?: string;
}
export const itemA结论 = ['检验结论', '新下检日','检验日期','检验日期1'];
//下结论页面：
export const ItemConclusion =
    React.forwardRef((
        {children, show, alone = true, refWidth,label,startd=false,nxtstyp='定期检验'}: ItemConclusionProps, ref
    ) => {
        const [getInpFilter] = useMeasureInpFilter(null, itemA结论,);
        const {inp, setInp} = useItemInputControl({ref});
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label!}>
                <Text variant="h5">
                    {label} (报告下结论)：
                </Text>
                <InputLine label='检验结论'>
                    <Select inputSize="md" css={{minWidth: '140px', fontSize: '1.3rem', padding: '0 1rem'}}
                            value={inp?.检验结论 || ''}
                            onChange={e => setInp({...inp, 检验结论: e.currentTarget.value || undefined})}
                    >
                        <option></option>
                        <option>合格</option>
                        <option>不合格</option>
                    </Select>
                </InputLine>
                <InputLine label='设置检验日期'>
                    <Input value={inp?.检验日期 || ''} type='date'
                           onChange={e => setInp({...inp, 检验日期: e.currentTarget.value})}/>
                </InputLine>
                {startd &&
                    <InputLine  label='检验起始日期' >
                        <Input  value={inp?.检验日期1 ||''}  type='date'
                                onChange={e => setInp({ ...inp, 检验日期1: e.currentTarget.value}) } />
                    </InputLine>
                }
                <InputLine label={`下次${nxtstyp}日期`}>
                    <Input value={inp?.新下检日 || ''} type='date'
                           onChange={e => setInp({...inp, 新下检日: e.currentTarget.value})}/>
                </InputLine>
            </InspectRecordLayout>
        );
    });

/**简易版的原始记录 打印 位于最前面的内容
 * */
export const FrontCover =
    React.forwardRef((
        {children, show, alone = true, refWidth}: InternalItemProps, ref
    ) => {
        // const theme = useTheme();
        const getInpFilter = React.useCallback((par: any) => {
            // const {} = par || {};
            return {};
        }, []);
        const {inp, setInp} = useItemInputControl({ref});
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={'填 写 须 知'}>
                <Text variant="h5">
                    填 写 须 知
                </Text>
                1、本记录适用于电动单梁起重机、整机滚装形式出厂的轮胎式集装箱门式起重机、轨道式
                集装箱门式起重机、岸边集装箱起重机、装卸桥(指卸船机)的首次检验。<br/>
                2、检查结果栏“[ ]”可用以下四种符号表示记录内容：
                <div css={{marginLeft: '2rem', display: 'flex',}}>
                    “√” — 表示该项记录内容为“符合”或“合格”；<br/>
                    “／” — 表示该项记录内容为“无此项”（表示“不适用”或“不需检验”）；<br/>
                    “×” — 表示该项记录内容为“不符合”或“不合格”；<br/>
                    “△” — 表示该项记录内容为“无法检验”。
                </div>
                3、3、“结论”栏填“√”表示“合格” 、“×”表示“不合格”、 “／”表示“无此 项”（“不适用”或“不需检验”）。<br/>
                当“检验结果”为“△”时，“结论”为“×”。<br/>
                4、检验人员、校核人员签字应齐全。
            </InspectRecordLayout>
        );
    });

