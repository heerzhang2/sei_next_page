/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text,
    LineColumn,
    InputLine,
    SuffixInput,
    TextArea,
    Input,
    Select,
    Button,
    BlobInputList,
    InputDatalist,
    CheckSwitch,
    useTheme, Table, TableBody, TableRow, CCell, ButtonRefComp,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout,
    InternalItemProps,
    SelectHookfork,
    SelectPair,
    useItemInputControl,
    现场条件选
} from "../common/base";
import {useMeasureInpFilter} from "../common/hooks";
import {EachMeasureItemConfig, measurementRender} from "../common/measure";
import {arraySetInp, calcAverageArrObj, floatInterception, tableSetInp} from "../../common/tool";
import {useMeasureOldVer} from "../hook/useMeasureOldVer";

interface ThicknessProps  extends InternalItemProps{
    label: string;
    // nos: string;
}
export const item受力结构=['力面厚1','力面厚2','力面厚3',];
export const itemA受力结构=['力面厚设','力面厚v','力面厚r','力面备注',];
export const itemB受力结构=item受力结构.concat(itemA受力结构);           //简化name检查
/**格式化记录或报告： 主要受力结构件断面有效厚度观测值及测量结果记录表
 * */
export const Thickness=
React.forwardRef(({ children=' 注：对于不合格的值才需测量和记录，仅记录有效厚度与设计值之比最小值之处的测量值。',
                      show ,alone=true,refWidth,label}:ThicknessProps,  ref
) => {
    const [getInpFilter]=useMeasureInpFilter(item受力结构, itemA受力结构, );        //hook死循环：改成外部定义callbackFilt  输入变量defaultV可变的。
    const {inp, setInp} = useItemInputControl({ ref });
    const aveThick=calcAverageArrObj([inp?.力面厚1o,inp?.力面厚2o,inp?.力面厚3o],(row)=>row,2);
    return (
        <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                             alone={alone}  label={label}>
            {label}<br/>
            序号1，主要受力结构件断面有效厚度，设计值（    ）mm：
            <LineColumn column={2} >
                <InputLine  label='受力结构件断面有效厚度，设计值：' >
                    <SuffixInput  value={inp?.力面厚设 ||''} onSave={txt=> setInp({...inp,力面厚设: txt || undefined })}>mm</SuffixInput>
                </InputLine>
                { measurementRender(`受力结构件断面有效厚度观测值-1`,'力面厚1','mm',inp,setInp,true) }
                { measurementRender('有效厚度观测值-2','力面厚2','mm',inp,setInp,true) }
                { measurementRender('有效厚度观测值-3','力面厚3','mm',inp,setInp,true) }
                <InputLine  label='主要受力结构件断面有效厚度平均值：'>
                    <Text>{aveThick} mm</Text>
                </InputLine>
                <InputLine  label='主要受力结构件断面有效厚度-结果值：' >
                    <SuffixInput  value={inp?.力面厚v ||''} onSave={txt=> setInp({...inp,力面厚v: txt || undefined })}>mm</SuffixInput>
                </InputLine>
                <InputLine label={`C3.7.3 检验结果`}>
                    <SelectHookfork value={ inp?.力面厚r ||''}
                                    onChange={e => setInp({ ...inp, 力面厚r: e.currentTarget.value||undefined}) }/>
                </InputLine>
            </LineColumn>
            备注：
            <TextArea  value={inp?.力面备注 ||''} rows={2}
                       onChange={e => setInp({ ...inp, 力面备注: e.currentTarget.value||undefined}) } />
            { children }
        </InspectRecordLayout>
    );
} );

export const config梯子 = [
    [{n: '台净高', t: ['（1）通道与平台','通道、斜梯和平台的净空高度'], u: 'm', c: '四'}],
    [{n: '台净宽', t: [undefined,'运动部分附近的通道和平台的净宽度'], c: '四'}],
    [{n: '高不净宽', t: [undefined,'如果设有扶手或者栏杆，在高度不超过0.6m的范围内，通道的净宽度'], c: '四'}],
    [{n: '固道净宽', t: [undefined,'固定部分之间的通道净宽度'], c: '四'}],
    [{n: '少使高', t: [undefined,'起重机械结构件内部很少使用的进出通道','最小净空高度'], c: '四'}],
    [{n: '少使道宽', t: [undefined,undefined,'通道净宽度'], c: '四'}],
    [{n: '维保净高', t: [undefined,'只用于维护保养的平台，其上面的净空高度'], c: '四'}],
    [{n: '缝隙最宽', t: [undefined,'通道基面上缝隙长度等于或者大于200mm时，其最大宽度'], u: 'mm', c: '四'}],
    [{n: '动线上距', t: [undefined,'通道区域与裸露动力线，上方距离'], u: 'm', c: '四'}],
    [{n: '动线左右', t: [undefined,'通道区域与裸露动力线，左右距离'], c: '四'}],
    [{n: '动线下距', t: [undefined,'通道区域与裸露动力线，下方距离'], c: '四'}],
    [{n: '斜梯角', t: ['（2）梯子与栏杆','斜梯','斜梯的倾斜角'], u: '°', c: '四'}],
    [{n: '斜栏间距', t: [undefined,undefined,'主要斜梯栏杆的间距'], u: 'm', c: '四'}],
    [{n: '他斜栏间', t: [undefined,undefined,'其他斜梯栏杆的间距'], c: '四'}],
    [{n: '斜靠栏高', t: [undefined,undefined,'斜梯的一侧靠墙壁时，栏杆高度'], c: '四'}],
    [{n: '梯级宽', t: [undefined,undefined,'梯级的净宽度'], c: '四'}],
    [{n: '梯级高', t: [undefined,undefined,'单个梯级的高度'], c: '四'}],
    [{n: '梯级进深', t: [undefined,undefined,'梯级的进深'], c: '四'}],
    [{n: '直撑杆间', t: [undefined,'直梯','直梯两侧撑杆的间距'], c: '四'}],
    [{n: '撑梯级宽', t: [undefined,undefined,'两侧撑杆之间梯级宽度'], c: '四'}],
    [{n: '直梯级间', t: [undefined,undefined,'梯级的间距'], c: '四'}],
    [{n: '直梯固距', t: [undefined,undefined,'梯级与固定结构件距离'], c: '四'}],
    [{n: '直护圈径', t: [undefined,undefined,'从高处有跌落危险的直梯，护圈直径'], c: '四'}],
    [{n: '直杆高出', t: [undefined,undefined,'直梯的两边撑杆比最上一个梯级高出的高度'], c: '四'}],
    [{n: '栏垂高', t: [undefined,'栏杆的垂直高度'], u: 'm', c: '四'}],
    [{n: '脚板高', t: [undefined,'踢脚板高度'], c: '四'}],
    [{n: '栏中间距', t: [undefined,'中间横杆，其与踢脚板或者栏杆的距离'], c: '四'}],
    [{n: '栏不道高', t: [undefined,'对净高不超过1.3m的通道，栏杆的高度'], c: '四'}],
    [{n: '扶手断长', t: ['围栏','沿建筑物墙壁或者实体墙结构设有的通道，允许用扶手代替栏杆，扶手的中断长度'], c: '四'}],
    [{n: '围绳高', t: [undefined,'护绳(如钢丝绳、链条)，高度'], c: '四'}],
    [{check: 'C3.7.4'}],
] as EachMeasureItemConfig[][];

interface Props  extends InternalItemProps{
    label?: string;
    nos?: string;
    titles?: any[];    //可能是Node[]，不一定纯粹string;
    zjuse?: number;     //最末尾的注释的文本使用那一段话？可选择办法的。
    config?: any[];    //有配置模式的
}
export const Ladder =
React.forwardRef((
    {children, show, alone = true, refWidth,label}: Props, ref
) => {
    const {inp, setInp} = useItemInputControl({ref});
    const {render,itemObservation, itemObservationA,}=useMeasureOldVer(inp,setInp, config梯子, false ,false);
    const itemA = React.useMemo(() => {
        return [...itemObservationA, '梯子备注'];
    }, [itemObservationA]);
    const [getInpFilter] = useMeasureInpFilter(itemObservation, itemA,);
    return (
        <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                             alone={alone} label={label!}>
            {label}<br/>
            { render }
            备注：
            <TextArea  value={inp?.梯子备注 ||''} rows={5}
                       onChange={e => setInp({ ...inp, 梯子备注: e.currentTarget.value||undefined}) } />
            注：1、对于不合格的值才需测量和记录，未测量或无需测量的观测值和结果值栏可不填，检验结果栏都需填。<br/>
            2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
        </InspectRecordLayout>
    );
} );

const item机构速度o=['起速','下速','横速','纵速','回速'];
export const item机构速度=[] as string[];
export const itemA机构速度=['速度备注'];
item机构速度o.forEach((name, i:number)=>{
    item机构速度.push(name);         //name+'1',name+'2',name+'3'
    itemA机构速度.push(name+'r');
});
export const defaultTl机构速度=['起升速度','下降速度','横移速度','纵移速度','回转速度'];
/**编辑器：各机构运行速度记录: 支持项目 标题自定义 titles:['',,];
 * 最后的注解文本 不一样？ zjuse:参数映射一段。
 * */
export const MoveSpeed=
React.forwardRef(({ children, show ,alone=true,refWidth,label,titles=defaultTl机构速度,
    }:Props,  ref
) => {
    //距离#存储用 *o;   时间#存储用 *v;
    const [getInpFilter]=useMeasureInpFilter(item机构速度,itemA机构速度,);
    const {inp, setInp} = useItemInputControl({ ref });
    return (
        <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                             alone={alone}  label={label!}>
            <Text variant="h5">{label}</Text>
            { ['起速','下速','横速','纵速','回速'].map((field, i:number) => {
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
                        { (new Array(3)).fill(null).map(( _,  w:number) => {
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
                            <Text>{calcAverageArrObj(arrobj,(row)=>{return row?.d/row?.t},2,3)}</Text>
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
            { children? children
                :
               <div>
                注：1、对于产品标准和设计文件同时对速度允许偏差都有规定的，以较严规定作为检验结果判定依据。对于产品标准和设计文件对速度允许偏差都没有规定的，相应的速度可不测量。<br/>
                2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。若机构有其他速度需要测量且不符合规定的，应在备注栏中填写。
              </div>
            }
        </InspectRecordLayout>
    );
} );

export const items漏磁检=[['2mm','场强2'],['50mm','场强5'],['100mm','场强10']];
export const itemA漏磁检=['场强2','场强5','场强10','漏磁检r','漏磁备注'];
/**漏磁检查记录
 * 储存直接用数组序号来指代位置 左端 中间 右端。 结果值也不保存。
 * */
export const MagneticLeak=
React.forwardRef(({ children, show ,alone=true,refWidth,label,
                  }:Props,  ref
) => {
    const [getInpFilter]=useMeasureInpFilter(null,itemA漏磁检,);
    const {inp, setInp} = useItemInputControl({ ref });
    return (
        <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                             alone={alone}  label={label!}>
            {label}，测磁场强度，单位：Gs<br/>
            { items漏磁检.map(([title,field], i:number) => {
                return  <React.Fragment key={i}>
                    项目{i+1} {'>'} 在 {title} 处：
                    <LineColumn>
                        { ['左端','中间','右端'].map(( prefix,  w:number) => {
                            return <InputLine key={w} label={`${prefix}，磁场强度：`}>
                                    <SuffixInput  value={inp?.[field]?.[w] ||''} onSave={txt=>arraySetInp(field, w, txt,inp,setInp)}>Gs</SuffixInput>
                                </InputLine>;
                        }) }
                        <InputLine  label={`结果值：`}>
                            <Text>{calcAverageArrObj(inp?.[field],a=>a,1,3)}</Text>
                        </InputLine>
                    </LineColumn>
                </React.Fragment>;
            }) }
            <InputLine label={'检验结果'}>
                <SelectHookfork value={ inp?.漏磁检r ||''}
                                onChange={e => setInp({ ...inp, 漏磁检r: e.currentTarget.value||undefined}) }/>
            </InputLine>
            备注：
            <TextArea  value={inp?.漏磁备注 ||''} rows={4}
                       onChange={e => setInp({ ...inp, 漏磁备注: e.currentTarget.value||undefined}) } />
            { children }
        </InspectRecordLayout>
    );
} );
export const itemA结论 = ['检验结论', '新下检日','检验日期','检验日期1'];
//下结论页面：
export const ItemConclusion =
    React.forwardRef((
        {children, show, alone = true, refWidth,label}: Props, ref
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
                <InputLine  label='检验起始日期' >
                    <Input  value={inp?.检验日期1 ||''}  type='date'
                            onChange={e => setInp({ ...inp, 检验日期1: e.currentTarget.value}) } />
                </InputLine>
                <InputLine label='下次定期检验日期'>
                    <Input value={inp?.新下检日 || ''} type='date'
                           onChange={e => setInp({...inp, 新下检日: e.currentTarget.value})}/>
                </InputLine>
            </InspectRecordLayout>
        );
    });
/**技术资料和工作见证材料; 【布局】不对齐，限定输入框宽度。
 * 存储在其上一级组件已经定义好了，默认值等
 *  */
export const TechnicalWitness= ( { inp,  setInp, defaultV,label,nums=6} : { inp: any,setInp: React.Dispatch<React.SetStateAction<any>>,defaultV?:any,label:any,nums?:number}
) => {
    return (
        <div>
            <Text variant="h5">
              {label}: <Button onPress={() => {setInp({ ...inp, 见证表: defaultV});} }>清空全表至默认</Button>
            </Text>
            { (new Array(nums)).fill(null).map(( _,  w:number) => {
                return <React.Fragment key={w}>
                    序号 {w+1} ：
                    <div css={{display: 'flex', flexWrap: 'wrap',justifyContent: 'space-evenly'}}>
                        <div css={{display: 'inline-flex', alignItems: 'center',whiteSpace: 'nowrap'}}>
                            代号
                            <Input value={inp?.见证表?.[w]?.no ||''} size={2} style={{display: 'inline-flex', width: 'unset'}}
                                   onChange={e =>tableSetInp('见证表',w, inp,setInp,'no',e.currentTarget.value||undefined)}/>
                        </div>
                        <div css={{display: 'inline-flex', alignItems: 'center',whiteSpace: 'nowrap'}}>
                            名称
                            <Input value={inp?.见证表?.[w]?.ti ||''} size={42} style={{display: 'inline-flex', width: 'unset'}}
                                   onChange={e =>tableSetInp('见证表',w, inp,setInp,'ti',e.currentTarget.value||undefined)}/>
                        </div>
                        <div css={{display: 'inline-flex', alignItems: 'center',whiteSpace: 'nowrap'}}>
                            编号
                            <Input value={inp?.见证表?.[w]?.bh ||''} size={13} style={{display: 'inline-flex', width: 'unset'}}
                                   onChange={e =>tableSetInp('见证表',w, inp,setInp,'bh',e.currentTarget.value||undefined)}/>
                        </div>
                    </div>
                </React.Fragment>;
            }) }
        </div>
    );
};
export const Notepad= ( { inp,  setInp, defaultV,label,nums=4} : { inp: any,setInp: React.Dispatch<React.SetStateAction<any>>,defaultV?:any,label:any,nums?:number}
) => {
    return (
        <div>
            <Text variant="h5">
               {label}: <Button onPress={() => {setInp({ ...inp, 记事表: defaultV});} }>清空全表至默认</Button>
            </Text>
            { (new Array(nums)).fill(null).map(( _,  w:number) => {
                return <React.Fragment key={w}>
                    序号 {w+1} ：
                    <div css={{display: 'flex', flexWrap: 'wrap',justifyContent: 'space-evenly'}}>
                        <div css={{display: 'inline-flex', alignItems: 'center',whiteSpace: 'nowrap'}}>
                            名称
                            <Input value={inp?.记事表?.[w]?.nm ||''} size={38} style={{display: 'inline-flex', width: 'unset'}}
                                   onChange={e =>tableSetInp('记事表',w, inp,setInp,'nm',e.currentTarget.value||undefined)}/>
                        </div>
                        <div css={{display: 'inline-flex', alignItems: 'center',whiteSpace: 'nowrap'}}>
                            编号
                            <Input value={inp?.记事表?.[w]?.bh ||''} size={13} style={{display: 'inline-flex', width: 'unset'}}
                                   onChange={e =>tableSetInp('记事表',w, inp,setInp,'bh',e.currentTarget.value||undefined)}/>
                        </div>
                        <div css={{display: 'inline-flex', alignItems: 'center',whiteSpace: 'nowrap'}}>
                            备注
                            <Input value={inp?.记事表?.[w]?.mo ||''} size={22} style={{display: 'inline-flex', width: 'unset'}}
                                   onChange={e =>tableSetInp('记事表',w, inp,setInp,'mo',e.currentTarget.value||undefined)}/>
                        </div>
                    </div>
                </React.Fragment>;
            }) }
        </div>
    );
};

/**注意这里的ref不是窗口<DIV ref={ref}>的哪一个;而是 React.useRef<InternalItemHandResult>(null)类似的传递数据和接口函数的,不是一个东西;
 * 简易版的原始记录打印：末尾增加文本“三、检验记录”。
 * */
export const DeviceSurvey =
React.forwardRef((
    {children, show, alone = true, refWidth,label,config}: Props, ref
) => {
    const [surveyItems, itemA设备概况] = React.useMemo(() => {
        const surveyItems = [] as any;          //布局2排的，转为正常的1排列表
        config?.forEach(([[desc, name, cb], add2p]: any, i: number) => {
            const [desc2, name2, cb2] = add2p || [];
            //【关键】名字变体,{n:'型试样机',t:'b'} 对象含义 .t：有几种情况t='b'布尔;='d'日期;='l'列表;默认是Input ,若又有u字段是单位辨识，就是附加后缀的input;另外l字段是文本数组[];r是文本代数据库:替代。t='n'纯数字,’m‘多行备注
            if (typeof name === 'string' && !name?.startsWith('_$')) surveyItems.push({name, desc, cb});
            else if (typeof name === 'object' && name.n && !name.r) surveyItems.push({name: name.n, desc, cb, type: name.t, unit: name.u, list: name.l});
            if (typeof name2 === 'string' && name2 && !name2.startsWith('_$')) surveyItems.push({name: name2, desc: desc2, cb: cb2});
            else if (typeof name2 === 'object' && name2.n && !name2.r) surveyItems.push({name: name2.n, desc: desc2, cb: cb2, type: name2.t, unit: name2.u, list: name2.l});
        });
        const itemA设备概况: string[] = [];
        //初始化 存储字段
        surveyItems.forEach(({name,cb}: any, i: number) => {
            if(cb?.names)   itemA设备概况.push(...cb?.names);
            else  itemA设备概况.push(name);
        });
        return [surveyItems, itemA设备概况];
    }, [config]);
    const [getInpFilter] = useMeasureInpFilter(null, itemA设备概况,);
    const {inp, setInp} = useItemInputControl({ref});
    //若有 备注 必须配置在最后一个的。
    const lastAiObj=surveyItems[surveyItems.length-1];
    const isMemoLast= lastAiObj?.type==='m';
    return (
        <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                             alone={alone} label={label??'二、设备概况'}>
            设备概况除在台账业务信息中可修改外还需修改的部分:
            <LineColumn column={4}>
                {
                    surveyItems.map(({name, desc, cb, type, unit, list}: any, i: number) => {
                        if(isMemoLast && (surveyItems.length-1)===i)  return null;
                        if (cb?.edit) {
                            return <React.Fragment key={i}>{ cb.edit(inp, setInp) }</React.Fragment>;
                        } else if (type === 'l') return <InputLine key={i} label={desc}>
                            <InputDatalist value={(inp?.[name]) || ''} datalist={list}
                                           onListChange={v => {
                                               setInp({...inp, [name]: v || undefined});
                                           }}/>
                        </InputLine>;
                        else if (type === 'd') return <InputLine key={i} label={desc}>
                            <Input value={inp?.[name] || ''} type='date'
                                   onChange={e => setInp({...inp, [name]: e.currentTarget.value})}/>
                        </InputLine>;
                        else if (type === 'b') return <InputLine key={i} label={desc}>
                            <CheckSwitch checked={inp?.[name] || false}
                                         onChange={e => setInp({...inp, [name]: inp?.[name] ? undefined : true})}/>
                        </InputLine>;
                        else if (type === 'B') return <InputLine key={i} label={desc}>
                            <BlobInputList value={inp?.[name] || ''} datalist={list}
                                           onListChange={v => setInp({...inp, [name]: v || undefined})}/>
                        </InputLine>;
                        else if (type === 'm') return <div key={i}>{desc}:
                            <TextArea value={inp?.[name] || ''} rows={4}
                                      onChange={e => setInp({...inp, [name]: e.currentTarget.value || undefined})}/>
                        </div>;
                        else if (unit) return <InputLine key={i} label={desc}>
                            <SuffixInput value={inp?.[name] || ''}
                                         onSave={txt => setInp({...inp, [name]: txt || undefined})}
                                         type={type === 'n' ? "number" : undefined}>{unit}</SuffixInput>
                        </InputLine>;
                        else return <InputLine label={desc + `:`} key={i}>
                                <Input value={inp?.[name] || ''} type={type === 'n' ? "number" : undefined}
                                       onChange={e => {
                                           setInp({...inp, [name]: e.currentTarget.value || undefined});
                                       }}/>
                            </InputLine>;
                    })
                }
            </LineColumn>
            { isMemoLast && <>
                {lastAiObj.desc}:
                <TextArea value={inp?.[lastAiObj.name] || ''} rows={5}
                          onChange={e => setInp({...inp, [lastAiObj.name]: e.currentTarget.value || undefined})}/>
                </>
            }
            {!alone && show && <>
                <hr/>
                <Text variant="h5">
                    三、检验记录
                </Text>
            </>
            }
        </InspectRecordLayout>
    );
});


export const itemA现场 = ['检验条件'];
/**类似通用的二维表格，但有不同点：必须有一个关键字段唯一性判定；互动流程稍微有差别。适合小数量数据集合。
 * */
export const SiteConditionPark =
React.forwardRef((
    {children, show, alone = true, refWidth, label}: Props, ref
) => {
    const theme = useTheme();
    const [getInpFilter] = useMeasureInpFilter(null, itemA现场,);
    const {inp, setInp} = useItemInputControl({ref});
    const [floor, setFloor] = React.useState<string | null>(null);
    const aDateObj=inp?.检验条件?.find((t:any)=>t.d===floor);
    // const naDateObjs=inp?.检验条件?.filter((t:any)=>t.d!==floor)||[];        //【约束】d日期：必须作唯一性关键字；
    const dateBlurRef =React.useRef(null);
    return (
        <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                             alone={alone} label={label!}>
            <Text variant="h5">
              {label}
            </Text>
            1、试验的动力源、环境温度、海拔高度、风速符合标准和设计要求。<br/>
            2、检验现场不得有易燃、易爆以及腐蚀性气体。
            <hr/>
            <div>
                现场检验条件确认结果的记录:
                <Table css={{borderCollapse: 'collapse'}}  tight  miniw={800}>
                    <TableBody>
                        <TableRow>
                            <CCell>确认日期</CCell>
                            <CCell>1、试验的动力源、环境温度、海拔高度、风速符合标准和设计要求</CCell>
                            <CCell>2、检验现场不得有易燃、易爆以及腐蚀性气体</CCell>
                        </TableRow>
                        {inp?.检验条件?.map((obj: any, i: number) => {
                            return <TableRow key={i}>
                                <CCell>{obj?.d}</CCell>
                                <CCell>{obj?.x || ''}</CCell>
                                <CCell>{obj?.y || ''}</CCell>
                            </TableRow>
                        })}
                    </TableBody>
                </Table>
            </div>
            <>新增检查确认时间=＞</>
            <LineColumn>
                <InputLine label='首先设置当前检验日期'>
                    <SuffixInput type='date' onPointerOut={(e :any) => { // @ts-ignore
                                    dateBlurRef!.current!.focus(); }}
                                 value={floor || ''} onSave={txt => setFloor(txt || null)}>
                        <ButtonRefComp disabled={aDateObj || !floor}  ref={dateBlurRef}
                                       onPress={() => setInp({...inp, 检验条件: (inp?.检验条件? [...inp?.检验条件, {d: floor}] : [{d: floor}]) } )}
                        >新增</ButtonRefComp>
                        <Button disabled={!aDateObj || !floor}
                                css={{marginTop: theme.spaces.sm}} size="sm"
                                onPress={() =>setInp({...inp, 检验条件: [...inp?.检验条件?.filter((t:any)=>t.d !==floor)],}) }
                        >刪除</Button>
                    </SuffixInput>
                </InputLine>
                <InputLine label={`1、试验的动力源、环境(${floor})`}>
                    <SelectPair value={aDateObj?.x || ''} dlist={现场条件选} onChange={e =>{
                        if(floor && aDateObj){
                            aDateObj.x=e.currentTarget.value || undefined;
                            setInp({...inp});
                        }} }/>
                </InputLine>
                <InputLine label={`2、检验现场不得有易燃(${floor})`}>
                    <SelectPair value={aDateObj?.y || ''} dlist={现场条件选} onChange={e =>{
                        if(floor && aDateObj){
                            aDateObj.y=e.currentTarget.value || undefined;
                            setInp({...inp});
                        }} }/>
                </InputLine>
            </LineColumn>
            注：每次到现场后，在检验前应对检验条件进行确认，只有确认所有与检验相关的条件满足检验要求时，才能开始开展检验工作。
        </InspectRecordLayout>
    );
});

/**简易版的原始记录 打印 位于最前面的内容
 * */
export const FrontCover=
    React.forwardRef((
        { children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        // const theme = useTheme();
        const getInpFilter = React.useCallback((par: any) => {
            // const {} =par||{};
            return {};
        }, []);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'填 写 须 知'}>
                <Text variant="h5">
                    填 写 须 知
                </Text>
                1、本记录适用于电动单梁起重机、整机滚装形式出厂的轮胎式集装箱门式起重机、轨道式 集装箱门式起重机、岸边集装箱起重机、装卸桥(指卸船机)的首次检验。<br/>
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
    } );

