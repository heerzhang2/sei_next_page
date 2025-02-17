/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Button,
    InputLine,
    Input,
    TextArea,
    Select,
    InputDatalist,
    Text,
    CheckSwitch,
    SuffixInput,
    useTheme,
    LineColumn,  Table,  TableRow, CCell, TableBody,  Alert,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, SelectHookfork, SelectInput, useItemInputControl
} from "../../common/base";
import {Each_ZdSetting, useRepTableEditor, useTableEditor} from "../../hook/useRepTableEditor";
import {useMeasureInpFilter} from "../../common/hooks";
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import '@uppy/webcam/dist/style.min.css';
import {EditStorageContext} from "../../StorageContext";
import {itemResultUnqualified} from "../../common/config";
import {setupItemAreaRoute} from "./orcIspConfig";
import {特殊项目编码} from "./FormatOriginal";
import {measurementRender} from "../../common/measure";
import {floatInterception} from "../../../common/tool";
import {useBalanceCoefficient} from "../hook/useBalanceCoefficient";


export const 现场结果选=["符合要求","不符合要求"];
//下结论页面：
export const ItemConclusionCr=
    React.forwardRef((
        { children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const theme = useTheme();
        const getInpFilter = React.useCallback((par: any) => {
            const {检验结论,新下检日,检验条件,环境,电压波,易燃,现场,封闭,检验日期,检验日期1} =par||{};
            return {检验结论,新下检日,检验条件,环境,电压波,易燃,现场,封闭,检验日期,检验日期1};
        }, []);
        const {inp, setInp} = useItemInputControl({ ref });
        const [floor, setFloor] = React.useState<string|null>(null);
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'五、现场检验意见； 附录F：现场检验条件确认'} column={0}>
                <Text  variant="h5">
                    附录F：现场检验条件确认
                </Text>
                1、机房或者机器设备间的空气温度保持在5℃～40℃之间；（单位：℃）<br/>
                2、电源输入电压波动在额定电压值±7％的范围内；（单位：V ）<br/>
                3、环境空气中没有腐蚀性和易燃性气体及导电尘埃；<br/>
                4、检验现场（主要指机房或者机器设备间、井道、轿顶、底坑）清洁，没有与电梯工作无关的物品和设备，基站、相关层站等检验现场放置表明正在进行检验的警示牌；<br/>
                5、对井道进行了必要的封闭。
                <hr/>
                <div>
                    现场检验条件确认结果的记录:
                    <Table css={{borderCollapse:'collapse'}}>
                        <TableBody>
                            <TableRow >
                                <CCell>确认日期</CCell>
                                <CCell>1、机房或者机器气温</CCell>
                                <CCell>2、电源输入电压波动</CCell>
                                <CCell>3、环境空气没腐蚀性</CCell>
                                <CCell>4、检验现场没有无关</CCell>
                                <CCell>5、对井道进行了封闭</CCell>
                            </TableRow>
                            {inp?.检验条件?.map((a:string,i:number)=>{
                                return <TableRow key={i}>
                                    <CCell>{a}</CCell>
                                    <CCell>{inp?.环境?.[a]||''}</CCell>
                                    <CCell>{inp?.电压波?.[a]||''}</CCell>
                                    <CCell>{inp?.易燃?.[a]||''}</CCell>
                                    <CCell>{inp?.现场?.[a]||''}</CCell>
                                    <CCell>{inp?.封闭?.[a]||''}</CCell>
                                </TableRow>
                            }) }
                        </TableBody>
                    </Table>
                </div>
                <>新增检查确认时间=＞</>
                <LineColumn column={5} >
                    <InputLine  label='首先设置当前检验日期'>
                        <SuffixInput  type='date'  value={floor||''}
                                      onSave={txt=> setFloor(txt||null)}
                        >
                            <Button onPress={() =>floor&&(inp?.检验条件?.includes(floor)? null:
                                    setInp( (inp?.检验条件&&{...inp,检验条件:[...inp?.检验条件,floor] } )
                                        || {...inp,检验条件:[floor] } )
                            )}
                            >新增</Button>
                            <Button css={{ marginTop: theme.spaces.sm }} size="sm"
                                    onPress={() => floor&&inp?.检验条件?.includes(floor) &&(
                                        setInp({...inp,检验条件:[...inp.检验条件.filter((a:string) => a!==floor )],
                                            环境:{...inp?.环境,[floor]:undefined}, 易燃:{...inp?.易燃,[floor]:undefined}
                                        })
                                    )}
                            >刪除</Button>
                        </SuffixInput>
                    </InputLine>
                    <InputLine label={`1、机房或者机器气温(${floor})`}>
                        <SuffixInput value={ inp?.环境?.[floor!] ||''}
                                        onChange={e => floor&&setInp({ ...inp, 环境:{...inp?.环境,[floor]: e.currentTarget.value||undefined} }) }>℃</SuffixInput>
                    </InputLine>
                    <InputLine label={`2、电源输入电压波动(${floor})`}>
                        <SuffixInput value={ inp?.电压波?.[floor!] ||''}
                                     onChange={e => floor&&setInp({ ...inp, 电压波:{...inp?.电压波,[floor]: e.currentTarget.value||undefined} }) }>V</SuffixInput>
                    </InputLine>
                    <InputLine  label={`3、环境空气没腐蚀性(${floor})`}>
                        <SelectInput value={ inp?.易燃?.[floor!] ||''}  list={现场结果选}
                                     onChange={e => floor&&setInp({ ...inp, 易燃:{...inp?.易燃,[floor]: e.currentTarget.value||undefined} }) }/>
                    </InputLine>
                    <InputLine  label={`4、检验现场没有无关(${floor})`}>
                        <SelectInput value={ inp?.现场?.[floor!] ||''} list={现场结果选}
                                     onChange={e => floor&&setInp({ ...inp, 现场:{...inp?.现场,[floor]: e.currentTarget.value||undefined} }) }/>
                    </InputLine>
                    <InputLine label={`5、对井道进行了封闭(${floor})`}>
                        <SelectInput value={ inp?.封闭?.[floor!] ||''} list={现场结果选}
                                     onChange={e => floor&&setInp({ ...inp, 封闭:{...inp?.封闭,[floor]: e.currentTarget.value||undefined} }) }/>
                    </InputLine>
                </LineColumn>
                注：每次到现场后，在检验前应对检验条件进行确认，只有确认所有与检验相关的条件满足检验要求时，才能开始开展检验工作。<hr/>
                <Text  variant="h5">
                    五、现场检验意见  (报告下结论)：
                </Text>
                <InputLine  label='五、现场检验意见' >
                    <Select inputSize="md" css={{minWidth:'140px',fontSize:'1.3rem',padding:'0 1rem'}}
                            value={ inp?.检验结论  ||''}
                            onChange={e => setInp({ ...inp, 检验结论: e.currentTarget.value||undefined}) }
                    >
                        <option></option>
                        <option>合格</option>
                        <option>不合格</option>
                    </Select>
                </InputLine>
                <InputLine  label='设置检验日期' >
                    <Input  value={inp?.检验日期 ||''}  type='date'
                            onChange={e => setInp({ ...inp, 检验日期: e.currentTarget.value}) } />
                </InputLine>
                <InputLine  label='检验起始日期' >
                    <Input  value={inp?.检验日期1 ||''}  type='date'
                            onChange={e => setInp({ ...inp, 检验日期1: e.currentTarget.value}) } />
                </InputLine>
                <InputLine  label='下次检验日期' >
                    <Input  value={inp?.新下检日 ||''}  type='date'
                            onChange={e => setInp({ ...inp, 新下检日: e.currentTarget.value}) } />
                </InputLine>
            </InspectRecordLayout>
        );
    } );

/**没有编辑的字段不在这。不要重名了 ['附设装置名称','附设装置'] 可能莫名其妙报错的。台账snapshot.‘安装单位’等不能直接使用的，要本次最新:易变动。
 * 设备概况有些字段不在台账存在的，还有些不想采用台账的数据，还有些事后才能够同步给台账的；
 * */
const dbName设备概况 =[{desc:'管理单位电话',name:'管单位电'},{desc:'联系电话1',name:'联系电话'},{desc:'联系人手机',name:'联系手机'},
    {desc:'改造日期',name:'改造日期',type:'d'}, {desc:'对重安全钳型号',name:'对钳型'},{desc:'层门锁型号',name:'层门锁型'},{desc:'轿门锁型号',name:'轿门锁型'},
    {desc:'对重块总高度',name:'对重高'},{desc:'是否设置附加装置',name:'是附加装',type:'b'},
    {desc:'施工单位许可证子项目',name:'施许子项',type:'l',list:['曳引驱动乘客电梯','曳引驱动载货电梯','曳引驱动乘客电梯（含消防员电梯）']},
    {desc:'施工单位许可证编号',name:'施许可号'},
    {desc:'施工单位许可证级别',name:'施许可级',type:'l',list:['A1','A2','A','B','C','不分级','/']},
    {desc:'维保电话',name:'维保电话'},{desc:'施工单位名称',name:'施工单位'},{desc:'施工类别',name:'施工类别'},
];
//两个层次的嵌套对象存储模式：存储在"修改项"：{底下的对象分项字段} [标题，存储分项字段]
export const 大修改项目=[['限速器','限'],['安全钳','钳'],['缓冲器','缓'],['门锁','锁'],['悬挂装置','悬'],['上行超速保护装置','超'],['驱动主机','主'],['控制柜','柜'],
    ['轿厢意外移动保护装置','意'],['层门','门'], ['含有电子元件的安全电路','路'],['可编程电子安全相关系统','程'],['自动救援操作装置','救'],['能量回馈节能装置','节'],['IC卡系统','卡']];
/**注意这里的ref不是窗口<DIV ref={ref}>的哪一个;而是 React.useRef<InternalItemHandResult>(null)类似的传递数据和接口函数的,不是一个东西;
 * */
export const DeviceSurvey=
    React.forwardRef((
        { children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const getInpFilter = React.useCallback((par: any) => {
            let fields={} as any;
            dbName设备概况.forEach(({name}:any, i:number)=> {
                fields[name] =par[name];
            });
            fields['修改项'] =par?.修改项;         //【特别】两层的对象存储
            return fields;
        }, []);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'一、设备概况'}>
                没法事前申请变更在台账中生效的还需要修正的设备概况部分:
                <LineColumn  column={3} >
                    {           /* 剔除最后一个”备注“要单独处理的 */
                        dbName设备概况.map(({name,desc,cb,type,unit,list} : any, i:number)=> {
                            // if(i>=dbName设备概况2.length-1)      return <React.Fragment key={i}></React.Fragment>;
                            if(cb?.edit){
                                return  cb.edit(inp,setInp);
                            }
                            else if(type==='l') return <InputLine key={i} label={desc}>
                                    <InputDatalist value={(inp?.[name]) || ''} datalist={list}
                                               onListChange={v => {
                                                   setInp({ ...inp, [name]:v || undefined});
                                               } } />
                                </InputLine>;
                            else if(type==='d') return  <InputLine key={i} label={desc}>
                                    <Input  value={inp?.[name] ||''}  type='date'
                                            onChange={e => setInp({ ...inp, [name]: e.currentTarget.value}) } />
                                </InputLine>;
                            else if(type==='b') return  <InputLine key={i} label={desc}>
                                <CheckSwitch  checked={inp?.[name] || false} onChange={e => setInp({...inp, [name]: inp?.[name]? undefined:true}) } />
                                </InputLine>;
                            else if(type==='m')  return <div key={i}>{desc}:
                                         <TextArea  value={inp?.[name] ||''} rows={4}
                                            onChange={e => setInp({ ...inp, [name]: e.currentTarget.value||undefined}) } />
                                    </div>;
                            else if(unit) return  <InputLine key={i} label={desc}>
                                    <SuffixInput  value={inp?.[name] ||''} onSave={txt=> setInp({...inp,[name]: txt || undefined })}
                                              type={type==='n'? "number": undefined}>{unit}</SuffixInput>
                                </InputLine>;
                            else return  <InputLine label={desc+`:`} key={i}>
                                    <Input  value={inp?.[name] ||''} type={type==='n'? "number": undefined}
                                            onChange={e => {
                                                setInp({...inp,[name]:e.currentTarget.value || undefined});
                                            } } />
                                </InputLine>;
                        })
                    }
                </LineColumn>
                重大维修（改造）项目：
                <LineColumn  column={8}>
                    {大修改项目.map(([desc,name] : any, i:number)=> {
                        return <InputLine key={i} label={`${desc}:`}>
                            <CheckSwitch  checked={inp?.修改项?.[name] || false} onChange={e => setInp({...inp,
                                修改项: {...inp?.修改项, [name]: inp?.修改项?.[name]? undefined:true} })
                            } />
                        </InputLine>;
                    }) }
                </LineColumn>
                检验依据：1、TSG T7001-2009 《电梯监督检验和定期检验规则－曳引与强制驱动电梯》及1号、2号、3号修改单；<br/>
                2、《福建省电梯安全管理条例》<br/>
                注：“检验结果”栏：可用以下五种符号表示记录内容：：“√”表示“符合”；“/”表示“无此项”；“▽”表示“资料确认符合”，“×”表示“不符合”，“△”表示“无法检测”。
               </InspectRecordLayout>
        );
    } );

//【注意】回调函数局限：若加<React.Fragment > 会导致<InputLine 内勤套render时刻无法穿透提供 props 给输入组件的：层次层级不配套，造成样式不一致问题！
const config仪器表=[['测量设备名称','n',140],['规格型号','t',120],['测量设备编号','i',142],
    ['性能状态-开机后','o',75,(obj,setObj)=>{
        return <SelectHookfork value={ obj?.o ||''} onChange={e => setObj({ ...obj, o: e.currentTarget.value||undefined})}/>
    }],
    ['性能状态-关机前','f',75,(obj,setObj)=>{
        return <SelectHookfork value={ obj?.f ||''} onChange={e => setObj({ ...obj, f: e.currentTarget.value||undefined})}/>
    }],
] as Each_ZdSetting[];

export const ItemInstrumentTable=
    React.forwardRef((
        { children, show ,alone=true,redId,nestMd}:InternalItemProps,  ref
    ) => {
        const headview=<Text variant="h5">
            二、主要测量设备性能检查：
        </Text>;
        const tailview=<>
            <Text>
                注：1、性能状态一栏中用“√”表示正常，用“×”表示不正常。
                <Text css={{display: 'flex', marginLeft:'2rem'}}>
                    2、若仪器设备性能状态不正常，应更换为性能状态正常的仪器设备，并填写在预留栏中。<br/>
                    3、新增使用的仪器设备应填写在预留栏中。<br/>
                    4、未使用的仪器设备可不填写。
                </Text>
            </Text>
            <br/><hr/>
            { !alone && show &&
                <Text variant="h5">
                    三、检验记录
                </Text>
            }
        </>;
        const {render}=useRepTableEditor({ref,nestMd,show,alone,redId,
            config: config仪器表, table:'仪器表', column:4,  label:'二、主要测量设备性能检查', headview,tailview,
        });
        return render;
    } );

/**【针对比较有规律的情况】可以这样干的； 观测数据及测量结果记录 :抽象化后做配置的；特殊有 3.7 （1）；
 * 项目编号 ，类别，分项码，render检验内容与要求， [{检测项目,单位,观测名字，}] 观测名字首字段+o v r ；但是第11项目特殊：省略”间距“；
 * */
export const config观测数据=[
    [[{n:'高出平',t:'高出平面',u:'m'},{n:'水平角',t:'水平方向夹角',u:'(°)'}],'2.1','C','（1）',<Text>采用梯子作为通道时，必须符合以下条件：①通往机房(机器设备间)的通道不应当高出楼梯所到平面4m；②梯子必须固
            定在通道上而不能被移动；③梯子高度超过1.50m时，其与水平方向的夹角应当在65°～75°之间，并不易滑动或者翻转；④靠近梯子顶端应当设置容易握到的把手
            </Text>],
    [[{n:'道门宽',t:'宽度',u:'m'},{n:'道门高',t:'高度',u:'m'}],'2.1','C','（3）',<Text>机房通道门的宽度应当不小于0.60m，高度应当不小于1.80m。</Text>],
    [[{n:'深度柜',t:'深度',u:'m'},{n:'宽度柜',t:'宽度',u:'m'},{n:'高度柜',t:'高度',u:'m'}],'2.3','C','（1）',<Text>在控制柜前有一块净空面积，其深度不小于0.70m，宽度为0.50 m或者控制柜全宽（两者中的大值），
        净高度不小于2m</Text>],
    [[{n:'净空面',t:'水平净空面积',u:<>m<sup>2</sup></>},{n:'高度修',t:'高度',u:'m'}],'2.3','C','（2）',<Text>对运动部件进行维修和检查以及紧急操作的地方有一块不小于0.50m×0.60m的水平净空面积，其净高度不
        小于2m</Text>],
    [[{n:'高差地',t:'高差',u:'m'}],'2.3','C','（3）',<Text>机房地面高度不一并且相差大于0.50m时,应当设置楼梯或者台阶，并且设置护栏</Text>],
    [[{n:'框高度',t:'圈框高度',u:'mm'}],'2.4','C','（1）',<Text>机房地面上的开口应当尽可能小，位于井道上方的开口必须采用圈框，此圈框应当凸出地面至少50mm</Text>],
    [[{n:'电路动',t:'动力电路',u:'MΩ'},{n:'电路照',t:'照明电路',u:'MΩ'},{n:'电路全',t:'安全装置电路',u:'MΩ'}],'2.11','C','（1）',<div><Text>（1）动力电路、照明电路和电气安全装置电路的绝缘电阻应当符合下述要求：</Text>
        <Table tight  miniw={800}><TableBody>
            <TableRow>
                <CCell>标称电压/V</CCell><CCell>测试电压（直流）/V</CCell><CCell>绝缘电阻/MΩ</CCell>
            </TableRow>
            <TableRow>
                <CCell>安全电压</CCell><CCell>250</CCell><CCell>≥0.25</CCell>
            </TableRow>
            <TableRow>
                <CCell>≤500</CCell><CCell>500</CCell><CCell>≥0.50</CCell>
            </TableRow>
            <TableRow>
                <CCell>＞500</CCell><CCell>1000</CCell><CCell>≥1.00</CCell>
            </TableRow>
        </TableBody></Table></div>],
    [[{n:'制导行',t:'计算制导行程',u:'m'},{n:'测行程',t:'测量值',u:'m'}],'3.2','C','（2）',<Text>当轿厢完全压在缓冲器上时，对重导轨有不小于0.1 +0.035v2（m）的制导行程。</Text>],
    [[{n:'安门高',t:'高度',u:'m'},{n:'安门宽',t:'宽度',u:'m'}],'3.4','C','（1）',<Text>当相邻两层门地坎的间距大于11m时，其间应当设置高度不小于1.80m、宽度不小于0.35m的井道安全门
            （使用轿厢安全门时除外）。</Text>],
    [[{n:'修门高',t:'高度',u:'m'},{n:'修门宽',t:'宽度',u:'m'}],'3.5','C','（1）',<Text>井道检修门高度不小于1.40m，宽度不小于0.60m。</Text>],
];
const item观测机房=['距高大','距高小',];
const itemA观测机房=['距高大r',];
//初始化 存储字段
config观测数据.forEach(([_fxArr,_] : any, i:number)=> {
    if(!_fxArr || _fxArr.length<1)    throw new Error("没提供测量子项");
    const itrsName=_fxArr[0]?.n + 'r';
    _fxArr.forEach(({n,}: any, k:number)=> {
        item观测机房.push(n);
    });
    itemA观测机房.push(itrsName);
});

export const ObservationRoom=
    React.forwardRef((
        { children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(item观测机房,itemA观测机房);
        // const [getInpFilter]=useMeasureInpFilter(item观测表筒,itemA观测表筒,(par)=>{    CB ？  });

        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'八、观测数据及测量结果记录(上)'}>
                八、观测数据及测量结果记录<br/>
                {
                    config观测数据.map(([_fxArr,tag,iclas,fxno,node]: any, i:number)=> {
                        if(!_fxArr || _fxArr.length<1)    throw new Error("没提供测量子项");
                        const itrsName=_fxArr[0]?.n + 'r';     //结论存储在第一个分项目开头的字段
                        return  <React.Fragment key={i}>
                            <Text variant="h5">
                                {iclas} {tag} {fxno}：
                            </Text>
                            { typeof node === "string"?
                                <Text>{node}</Text>
                                :
                                node
                            }
                            <LineColumn  column={4} >
                                {   _fxArr.map(({n,t,u}: any, k:number)=> {
                                      return <React.Fragment key={k} >
                                                { measurementRender(t, n, u, inp, setInp) }
                                            </React.Fragment>;
                                     })
                                }
                                <InputLine label={`${tag} ${fxno}结果判定:`} key={i}>
                                    <SelectHookfork value={ inp?.[itrsName] ||''}
                                                    onChange={e => setInp({ ...inp, [itrsName]: e.currentTarget.value||undefined}) }/>
                                </InputLine>
                            </LineColumn>
                        </React.Fragment>;
                    })
                }
                <Text variant="h5">
                    B 3.7 （1）：
                </Text>
                <Text>轿厢与面对轿厢入口的井道壁的间距不大于0.15m，对于局部高度小于0.50m或者采用垂直滑动门的载货电梯，该间距可以增加到 0.20m。</Text>
                <LineColumn  column={4} >
                   { measurementRender('局部高度>0.5m时，间距', '距高大', 'm', inp, setInp) }
                   { measurementRender('局部高度≤0.5m时或采用垂直滑动门的载货电梯时，间距', '距高小', 'm', inp, setInp) }
                    <InputLine label={`3.7 （1）`} >
                        <SelectHookfork value={ inp?.距高大r ||''}
                                        onChange={e => setInp({ ...inp, 距高大r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
            </InspectRecordLayout>
        );
    } );
export const config观测薄板=[
    [[{n:'薄板高',t:'高度',u:'mm'},{n:'薄板宽',t:'宽度',u:'mm'}],'3.8','C','（1）',<Text>形成一个与层门地坎直接连接的连续垂直表面，由光滑而坚硬的材料构成（如金属薄板）；其高度不小于 开锁区域的一半加上50mm，
                    宽度不小于门入口的净宽度两边各加25mm。</Text>],
    [[{n:'隔下高',t:'隔障下高度',u:'m'},{n:'隔上高',t:'隔障上高度',u:'m'},{n:'隔边宽',t:'隔障两边宽度',u:'m'}],'3.9','C','（1）',<Text>对重（平衡重）的运行区域应当采用刚性隔障保护，该隔障从底坑地面上不大于0.30m处，向上延伸
                            到离底坑地面至少2.50m的高度，宽度应当至少等于对重（平衡重）宽度两边各加0.10m</Text>],
    [[{n:'障上高',t:'隔障上高度',u:'m'},{n:'部件距',t:'运动部件距离',u:'m'},{n:'障边宽',t:'隔障两边宽度',u:'m'}],'3.9','C','（2）',<Text>在装有多台电梯的井道中，不同电梯的运动部件之间应当设置隔障，隔障应当至少从轿厢、对重行程
            的最低点延伸到最 低层站楼面以上2.50m高度，并且有足够的宽度以防止人员从一个底坑通往另一个底坑，如果轿厢顶部边缘和相邻电梯的运动部件之间的水平距离小于0.5m，隔障应当贯穿整个井道，宽度至少等于运动部件或者运动部件的需要保护部分的
                宽度每边各加0.10m。</Text>],
    [[{n:'撞缓许',t:'最大允许值',u:'mm'},{n:'撞缓距',t:'测量值',u:'mm'}],'3.15','B','（5）',<Text>对重缓冲器附近应当设置永久性的明显标识，标明当轿厢位于顶层端站平层位置时，对重装置撞板与其缓冲器顶面间的
                最大允许垂直距离；并且该垂直距离不超过最大允许值。</Text>],
    [[{n:'脚板高',t:'护脚板高度',u:'m'}],'4.2','C','（1）',<Text>由扶手、0.10m高的护脚板和位于护栏高度一半处的中间栏杆组成。</Text>],
    [[{n:'扶手高',t:'扶手高度',u:'m'}],'4.2','C','（2）',<Text>当护栏扶手外缘与井道壁的自由距离不大于0.85m 时，扶手高度不小于0.70m，当该距离大于0.85m 时，扶手高度不小于1.10m</Text>],
    [[{n:'顶边距',t:'轿顶边缘距离',u:'m'},{n:'手件距',t:'扶手与部件距离',u:'m'}],'4.2','C','（3）',<Text>护栏装设在距轿顶边缘最大为0.15m之内，并且其扶 手外缘和井道中的任何部件之间的水平距离不小于 0.10m。</Text>],
    [[{n:'与重离',t:'距离',u:'mm'}],'4.4','C','（1）',<Text>轿厢及关联部件与对重之间的距离应当不小于50mm</Text>],
    [[{n:'轿深度',t:'轿厢深度',u:'m'},{n:'轿宽度',t:'轿厢宽度',u:'m'},{n:'轿面积',t:'面积',u:<>m<sup>2</sup></>}],'4.6','C','（1）',<Text>轿厢有效面积测量计算。</Text>],
    [[{n:'护板高',t:'护脚板高度',u:'m'}],'4.9','C','（1）',<Text>轿厢地坎下应当装设护脚板，其垂直部分的高度不小于0.75m，宽度不小于层站入口宽度。</Text>],
    [[{n:'断丝数',t:'断丝数',u:'根'}],'5.1','C','②',<Text>一个捻距内出现的断丝数</Text>],
    [[{n:'丝直径',t:'钢丝绳直径',u:'mm'},{n:'丝公称',t:'公称直径',u:'mm'}],'5.1','C','③',<Text>磨损后的钢丝绳直径小于钢丝绳公称直径的90%。</Text>],
];
const item观测薄板=['距高大','距高小',];
const itemA观测薄板=['距高大r',];
//初始化 存储字段
config观测薄板.forEach(([_fxArr,_] : any, i:number)=> {
    if(!_fxArr || _fxArr.length<1)    throw new Error("没提供测量子项");
    const itrsName=_fxArr[0]?.n + 'r';
    _fxArr.forEach(({n,}: any, k:number)=> {
        item观测薄板.push(n);
    });
    itemA观测薄板.push(itrsName);
});
export const ObservationSheet=
    React.forwardRef((
        { children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(item观测薄板,itemA观测薄板);
        // const [getInpFilter]=useMeasureInpFilter(item观测表筒,itemA观测表筒,(par)=>{    CB ？  });
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'八、观测数据及测量结果记录(下)'}>
                八、观测数据及测量结果记录<br/>
                {
                    config观测薄板.map(([_fxArr,tag,iclas,fxno,node]: any, i:number)=> {
                        if(!_fxArr || _fxArr.length<1)    throw new Error("没提供测量子项");
                        const itrsName=_fxArr[0]?.n + 'r';     //结论存储在第一个分项目开头的字段
                        return  <React.Fragment key={i}>
                            <Text variant="h5">
                                {iclas} {tag} {fxno}：
                            </Text>
                            { typeof node === "string"?
                                <Text>{node}</Text>
                                :
                                node
                            }
                            <LineColumn  column={4} >
                                {   _fxArr.map(({n,t,u}: any, k:number)=> {
                                    return <React.Fragment key={k} >
                                        { measurementRender(t, n, u, inp, setInp) }
                                    </React.Fragment>;
                                })
                                }
                                <InputLine label={`${tag} ${fxno}结果判定:`} key={i}>
                                    <SelectHookfork value={ inp?.[itrsName] ||''}
                                                    onChange={e => setInp({ ...inp, [itrsName]: e.currentTarget.value||undefined}) }/>
                                </InputLine>
                            </LineColumn>
                        </React.Fragment>;
                    })
                }
                注：本表所列项目检验人员无测量的，观测数据和观测结果可不填写，但结果判定要填写，不适用的项填“/"。
            </InspectRecordLayout>
        );
    } );

const config导轨表=[['层站','n',55],['轿厢左侧顶面','zd',60],['轿厢左侧侧面','zc',60,],['轿厢右侧顶面','yd',60],['轿厢右侧侧面','yc',60],['对重左侧有钳','zq',60],
            ['对重右侧有钳','yq',60],['对重左侧无钳','zw',60],['对重右侧无钳','yw',60], ['轿厢轨距偏','jp',50],['对重轨距偏','zp',50]] as Each_ZdSetting[];
const itemA导轨=['导轨表','轿厢导轨z','轿厢导轨y','轿厢导轨r','有钳v','有钳r','无钳v','无钳r','偏轿厢v','偏轿厢r','偏对重v','偏对重r'];
export const GuideRail=
    React.forwardRef(({ children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(null,itemA导轨,);
        const {inp, setInp} = useItemInputControl({ ref });
        const headview=<Text variant="h5">
            附录A 电梯导轨检验记录：参照上面样表的第7行的标注的各列的简化后的列名来进行录入。单位：mm
        </Text>;
        const [render导轨表]=useTableEditor({inp, setInp,  headview,
            config: config导轨表, table:'导轨表', column:8});
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'附录A 电梯导轨检验记录'}>

                样表格式如下：
                <Table tight  miniw={800}><TableBody>
                    <TableRow>
                        <CCell rowSpan={2}>项目编号</CCell><CCell colSpan={10}>3.6导轨C</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell colSpan={4}>（3）</CCell><CCell colSpan={2}>（3）</CCell><CCell colSpan={2}>（3）</CCell><CCell>（4）</CCell><CCell>（4）</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>检验内容</CCell><CCell colSpan={4}>轿厢导轨</CCell><CCell colSpan={4}>对重导轨导轨垂直偏差</CCell><CCell>轿厢导轨</CCell><CCell>对重导轨</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>观测数据</CCell><CCell colSpan={2}>左侧导轨垂直偏差</CCell><CCell colSpan={2}>右侧导轨垂直偏差</CCell><CCell rowSpan={2}>左侧</CCell><CCell rowSpan={2}>右侧</CCell><CCell rowSpan={2}>左侧</CCell><CCell rowSpan={2}>右侧</CCell><CCell rowSpan={2}>轨距偏差</CCell><CCell rowSpan={2}>轨距偏差</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell></CCell><CCell>顶面</CCell><CCell>侧面</CCell><CCell>顶面</CCell><CCell>侧面</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>层站</CCell><CCell colSpan={4}>每列导轨工作面每5m铅垂线测量值间的相对最大偏差均应小于下列数值：0≤x≤1.2；</CCell><CCell colSpan={2}>有安全钳：0≤x≤1.2</CCell><CCell colSpan={2}>无安全钳：0≤x≤2</CCell><CCell>0≤x≤2</CCell><CCell>0≤x≤3</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell></CCell><CCell>轿厢左侧顶面</CCell><CCell>轿厢左侧侧面</CCell><CCell>轿厢右侧顶面</CCell><CCell>轿厢右侧侧面</CCell><CCell>对重左侧有钳</CCell><CCell>对重右侧有钳</CCell><CCell>对重左侧无钳</CCell><CCell>对重右侧无钳</CCell><CCell>轿厢轨距偏</CCell><CCell>对重轨距偏</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>测量结果</CCell><CCell colSpan={2}></CCell><CCell colSpan={2}></CCell><CCell colSpan={2}></CCell><CCell colSpan={2}></CCell><CCell></CCell><CCell></CCell>
                    </TableRow>
                </TableBody></Table>
                {render导轨表}
                <hr/>
                上表最后的两行结果拆出来：
                <LineColumn column={6}>
                    <InputLine label={`3.6导轨C（3）轿厢导轨,左侧导轨垂直偏差-测量结果`}>
                        <Input  value={inp?.['轿厢导轨z'] ||''}
                                onChange={e => setInp({...inp, 轿厢导轨z: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`3.6导轨C（3）轿厢导轨,右侧导轨垂直偏差-测量结果`}>
                        <Input  value={inp?.['轿厢导轨y'] ||''}
                                onChange={e => setInp({...inp, 轿厢导轨y: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`3.6导轨C（3）轿厢导轨-检验结果`}>
                        <SelectHookfork value={ inp?.轿厢导轨r ||''}
                                        onChange={e => setInp({ ...inp, 轿厢导轨r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                    <InputLine label={`3.6导轨C（3）对重导轨导轨垂直偏差,有安全钳-测量结果`}>
                        <Input  value={inp?.['有钳v'] ||''}
                                onChange={e => setInp({...inp, 有钳v: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`3.6导轨C（3）对重导轨导轨垂直偏差,有安全钳-检验结果`}>
                        <SelectHookfork value={ inp?.有钳r ||''}
                                        onChange={e => setInp({ ...inp, 有钳r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                    <InputLine label={`3.6导轨C（3）对重导轨导轨垂直偏差,无安全钳-测量结果`}>
                        <Input  value={inp?.['无钳v'] ||''}
                                onChange={e => setInp({...inp, 无钳v: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`3.6导轨C（3）对重导轨导轨垂直偏差,无安全钳-检验结果`}>
                        <SelectHookfork value={ inp?.无钳r ||''}
                                        onChange={e => setInp({ ...inp, 无钳r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                    <InputLine label={`3.6导轨C（4）轿厢导轨-测量结果`}>
                        <Input  value={inp?.['偏轿厢v'] ||''}
                                onChange={e => setInp({...inp, 偏轿厢v: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`3.6导轨C（4）轿厢导轨-检验结果`}>
                        <SelectHookfork value={ inp?.偏轿厢r ||''}
                                        onChange={e => setInp({ ...inp, 偏轿厢r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                    <InputLine label={`3.6导轨C（4）对重导轨-测量结果`}>
                        <Input  value={inp?.['偏对重v'] ||''}
                                onChange={e => setInp({...inp, 偏对重v: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`3.6导轨C（4）对重导轨-检验结果`}>
                        <SelectHookfork value={ inp?.偏对重r ||''}
                                        onChange={e => setInp({ ...inp, 偏对重r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
                注1：左右侧导轨的区别，对轿厢导轨以检验人员站在层门处面朝轿厢为参照，对对重导轨以检验人员面朝被测导轨为参照。<br/>
                注2：所抽检的层站需填写。抽检结果符合要求的，在测量结果填所测量的数值区间范围（min-max），并在相应项目检验结果内打“√”；抽检结果有不符合要求 的，需填写不合格的观测数据，并在相应项目检验结果中打“×”。
            </InspectRecordLayout>
        );
    } );

const item空间=['进导程','自垂距','轿顶间','横梁间'];
const itemA空间=['空高差H','进导程r','自垂距r','轿顶间r','横梁间r'];
export const Headspace=
    React.forwardRef(({ children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(item空间,itemA空间,);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'附录B 当对重压实缓冲器时，顶部空间数据的测量记录'}>
                附录B 当对重压实缓冲器时，顶部空间数据的测量记录。 单位：m<br/>
                项目编号 3.2.1 C; 对重完全压缩在缓冲器上测出的层门地坎与轿门地坎的高差值（H）：
                <InputLine label='对重完全压缩在缓冲器上测出的层门地坎与轿门地坎的高差值（H）'>
                    <Input  value={inp?.['空高差H'] ||''}
                            onChange={e => setInp({...inp, 空高差H: e.currentTarget.value || undefined}) } />
                </InputLine>
                <hr/>
                项目编号 3.2.1 C ① 轿厢导轨应提≥ 0.1+0.035V<sup>2</sup>的进一步制导行程（B<sub>1</sub>）
                <LineColumn column={6}>
                    <InputLine label='要求值B1'>
                        <Input  value={inp?.['进导程o'] ||''}
                                onChange={e => setInp({...inp, 进导程o: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label='轿厢在上端站平层位置时所测量的各个轿顶空间个值（C1）'>
                        <Input  value={inp?.['进导程v'] ||''}
                                onChange={e => setInp({...inp, 进导程v: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <Text>对重完全压缩在缓冲 器上计算出的轿顶空间各个值 A1=C1-H= { floatInterception(inp?.['进导程v']-inp?.['空高差H'],3) }</Text>
                    <InputLine label={`3.2.1 C ①-判定结论`}>
                        <SelectHookfork value={ inp?.进导程r ||''}
                                        onChange={e => setInp({ ...inp, 进导程r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
                <hr/>
                项目编号 3.2.1 C ② 轿顶可站人的最高面积的水平面与相应井道顶最低部件的水平面之间的自由垂直距离B<sub>2</sub>≥1.0+0.035V<sup>2</sup>
                <LineColumn column={6}>
                    <InputLine label='要求值B2'>
                        <Input  value={inp?.['自垂距o'] ||''}
                                onChange={e => setInp({...inp, 自垂距o: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label='轿厢在上端站平层位置时所测量的各个轿顶空间个值（C2）'>
                        <Input  value={inp?.['自垂距v'] ||''}
                                onChange={e => setInp({...inp, 自垂距v: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <Text>对重完全压缩在缓冲 器上计算出的轿顶空间各个值 A2=C2-H= { floatInterception(inp?.['自垂距v']-inp?.['空高差H'],3) }</Text>
                    <InputLine label={`3.2.1 C ②-判定结论`}>
                        <SelectHookfork value={ inp?.自垂距r ||''}
                                        onChange={e => setInp({ ...inp, 自垂距r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
                <hr/>
                项目编号 3.2.1 C ③ 井道顶的最低部件与轿顶设备的最高部件之间的间距B<sub>3</sub>(不包括导靴、钢丝绳 附件等)不小于0.3 +0.035V<sup>2</sup>,与导靴或滚轮、 曳引绳附件、垂直滑动门的横梁或部件的最高部分之间的间距B<sub>4</sub>不小于0.1 +0.035V<sup>2</sup>
                <LineColumn column={6}>
                    <InputLine label='要求值B3'>
                        <Input  value={inp?.['轿顶间o'] ||''}
                                onChange={e => setInp({...inp, 轿顶间o: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label='轿厢在上端站平层位置时所测量的各个轿顶空间个值（C3）'>
                        <Input  value={inp?.['轿顶间v'] ||''}
                                onChange={e => setInp({...inp, 轿顶间v: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <Text>对重完全压缩在缓冲器上计算出的轿顶空间各个值 A3=C3-H= { floatInterception(inp?.['轿顶间v']-inp?.['空高差H'],3) }</Text>
                    <InputLine label='要求值B4'>
                        <Input  value={inp?.['横梁间o'] ||''}
                                onChange={e => setInp({...inp, 横梁间o: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label='轿厢在上端站平层位置时所测量的各个轿顶空间个值（C4）'>
                        <Input  value={inp?.['横梁间v'] ||''}
                                onChange={e => setInp({...inp, 横梁间v: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <Text>对重完全压缩在缓冲器上计算出的轿顶空间各个值 A4=C4-H= { floatInterception(inp?.['横梁间v']-inp?.['空高差H'],3) }</Text>
                    <InputLine label={`3.2.1 C ③-判定结论`}>
                        <SelectHookfork value={ inp?.横梁间r ||''}
                                        onChange={e => setInp({ ...inp, 横梁间r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
            </InspectRecordLayout>
        );
    } );

const item底坑=['坑间1','坑间2','坑间3','底距4','底距5','底距6','底距7' ];
const itemA底坑=['坑高差H','坑间r','底距4r','底距5r','底距6r','底距7r'];
export const  Pitspace=
    React.forwardRef(({ children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(item底坑,itemA底坑,);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'附录C 当轿厢压实缓冲器时，底坑空间数据的测量记录'}>
                附录C：当轿厢压实缓冲器时，底坑空间数据的测量记录。 单位：m<br/>
                项目编号 3.13 C; 轿厢完全压缩在缓冲器上测出的层门地坎与轿门地坎的高差值（H）：
                <InputLine label='轿厢完全压缩在缓冲器上测出的层门地坎与轿门地坎的高差值（H）'>
                    <Input  value={inp?.['坑高差H'] ||''}
                            onChange={e => setInp({...inp, 坑高差H: e.currentTarget.value || undefined}) } />
                </InputLine>
                <hr/>
                项目编号 3.13 C ① 底坑中有一个不小于 0.50m×0.60m×1.0m的空间（任一面朝下即可）；
                <LineColumn column={6}>
                    <InputLine label='轿厢在下端站平层位置时所测量的各底坑空间值A1'>
                        <Input  value={inp?.['坑间1o'] ||''}
                                onChange={e => setInp({...inp, 坑间1o: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <Text>轿厢完全压缩在缓冲器上计算出的底坑空间各个值 (A1-H)= { floatInterception(inp?.['坑间1o']-inp?.['坑高差H'],2,'ceil') }</Text>

                    <InputLine label='底坑空间值A2'>
                        <Input  value={inp?.['坑间2o'] ||''}
                                onChange={e => setInp({...inp, 坑间2o: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <Text>轿厢完全压缩在缓冲器上计算出的底坑空间各个值 (A2)= { floatInterception(inp?.['坑间2o'],2,'ceil') }</Text>
                    <InputLine label='底坑空间值A3'>
                        <Input  value={inp?.['坑间3o'] ||''}
                                onChange={e => setInp({...inp, 坑间3o: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <Text>轿厢完全压缩在缓冲器上计算出的底坑空间各个值 (A3)= { floatInterception(inp?.['坑间3o'],2,'ceil') }</Text>
                    <InputLine label={`3.13 C ①-判定结论`}>
                        <SelectHookfork value={ inp?.坑间r ||''}
                                        onChange={e => setInp({ ...inp, 坑间r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
                <hr/>
                项目编号 3.13 C ②第一部分检验内容与要求：底坑底面与轿厢最低部件的自由垂直距离不小于0.50m；
                <LineColumn column={6}>
                    <InputLine label='轿厢在下端站平层位置时所测量的各底坑空间值,垂直距离A4'>
                        <Input  value={inp?.['底距4o'] ||''}
                                onChange={e => setInp({...inp, 底距4o: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <Text>轿厢完全压缩在缓冲器上计算出的底坑空间各个值 (A4-H)= { floatInterception(inp?.['底距4o']-inp?.['坑高差H'],2) }</Text>
                    <InputLine label={`3.2.1 C ②垂直距离A4-判定结论`}>
                        <SelectHookfork value={ inp?.底距4r ||''}
                                        onChange={e => setInp({ ...inp, 底距4r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
                项目编号 3.13 C ②第二部分检验内容与要求：当垂直滑动门的部件、护脚板和相邻井道壁之间，轿厢最低部件和导轨之间的水平距离在0.15m之内时，此垂直距离允许减少到0.10m；
                <LineColumn column={6}>
                    <InputLine label='轿厢在下端站平层位置时所测量的各底坑空间值,垂直距离A5'>
                        <Input  value={inp?.['底距5o'] ||''}
                                onChange={e => setInp({...inp, 底距5o: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <Text>轿厢完全压缩在缓冲器上计算出的底坑空间各个值 (A5-H)= { floatInterception(inp?.['底距5o']-inp?.['坑高差H'],2) }</Text>
                    <InputLine label={`3.2.1 C ②垂直距离A5-判定结论`}>
                        <SelectHookfork value={ inp?.底距5r ||''}
                                        onChange={e => setInp({ ...inp, 底距5r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
                项目编号 3.13 C ②第三部分检验内容与要求：当轿厢最低部件和导轨之间的水平距离大于0.15m但小于0.50m 时，此垂直距离可按线性关系增加至0.50m；
                <LineColumn column={6}>
                    <InputLine label='轿厢在下端站平层位置时所测量的各底坑空间值,垂直距离A6'>
                        <Input  value={inp?.['底距6o'] ||''}
                                onChange={e => setInp({...inp, 底距6o: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <Text>轿厢完全压缩在缓冲器上计算出的底坑空间各个值 (A6-H)= { floatInterception(inp?.['底距6o']-inp?.['坑高差H'],2) }</Text>
                    <InputLine label={`3.2.1 C ②垂直距离A6-判定结论`}>
                        <SelectHookfork value={ inp?.底距6r ||''}
                                        onChange={e => setInp({ ...inp, 底距6r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
                <hr/>
                项目编号 3.13 C ③ 底坑中固定的最高部件和轿厢最低部件之间的距离不小于 0.30m；
                <LineColumn column={6}>
                    <InputLine label='轿厢在下端站平层位置时所测量的各底坑空间值,距离A7'>
                        <Input  value={inp?.['底距7o'] ||''}
                                onChange={e => setInp({...inp, 底距7o: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <Text>轿厢完全压缩在缓冲器上计算出的底坑空间各个值 (A7-H)= { floatInterception(inp?.['底距7o']-inp?.['坑高差H'],2) }</Text>
                    <InputLine label={`3.2.1 C ③距离A7-判定结论`}>
                        <SelectHookfork value={ inp?.底距7r ||''}
                                        onChange={e => setInp({ ...inp, 底距7r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
            </InspectRecordLayout>
        );
    } );

const config间隙表=[['层站','n',66],['门扇间间隙','j',60],['扇与门套间隙','t',60,],['门扇地坎间隙','s',60],['扇施力间隙','p',60],['门刀地坎间距','i',60],
    ['滚轮地坎间距','g',60],['层地轿地坎距','d',60],['门锁啮合长','l',60]] as Each_ZdSetting[];
const item间隙=['锁啮深'];
const itemA间隙=['间隙表','扇间隙','扇套隙','扇坎隙','门扇隙r','施力隙','施力隙r','刀地间','轮地间','门地间r','地地距','地地距r', '锁啮长','锁啮长r','锁啮深r'];
export const DoorGap=
    React.forwardRef(({ children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(item间隙,itemA间隙,);
        const {inp, setInp} = useItemInputControl({ ref });
        const headview=<Text variant="h5">
            附录D 电梯层门间隙、门锁啮合深度等检验记录：参照上面样表的第6行的标注的各列的简化后的列名来进行录入,最后1列和结果行拆出单独录入。单位：mm
        </Text>;
        const [render间隙表]=useTableEditor({inp, setInp,  headview,
            config: config间隙表, table:'间隙表', column:8});
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'附录D 电梯层门间隙、门锁啮合深度等检验记录'}>
                样表格式如下：
                <Table tight  miniw={800}><TableBody>
                    <TableRow>
                        <CCell>项目编号</CCell><CCell colSpan={3}>6.3（1）</CCell><CCell>6.3（2）</CCell><CCell colSpan={2}>6.12</CCell><CCell>6.1</CCell><CCell>6.9(1)</CCell><CCell>6.9(2)</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>项目类别</CCell><CCell colSpan={3}>C</CCell><CCell>C</CCell><CCell colSpan={2}>C</CCell><CCell>C</CCell><CCell>B</CCell><CCell>B</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>检验内容</CCell><CCell>层门门扇间间隙</CCell><CCell>层门门扇与门套间隙</CCell><CCell>层门扇与地坎间隙</CCell><CCell>层门扇间施力间隙</CCell><CCell>轿门门刀与层门地坎间距</CCell><CCell>门锁滚轮与轿门地坎间距</CCell><CCell>层门地坎与轿门地坎水平距离</CCell><CCell>门锁啮合长度</CCell><CCell>轿门锁啮合深度</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell rowSpan={2}>判断标准</CCell><CCell colSpan={3}>新安装检验： 客梯：x≤6， 货梯：x≤8；</CCell><CCell>旁开门： x≤30</CCell><CCell rowSpan={2} colSpan={2}>x≥5</CCell><CCell rowSpan={2}>x≤35</CCell><CCell rowSpan={2}>x≥7</CCell><CCell rowSpan={2}>x≥7</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell colSpan={3}>非首次检验货梯：x≤10</CCell><CCell>中分门总 和： x≤45</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>层站</CCell><CCell>门扇间间隙</CCell><CCell>扇与门套间隙</CCell><CCell>门扇地坎间隙</CCell><CCell>扇施力间隙</CCell><CCell>门刀地坎间距</CCell><CCell>滚轮地坎间距</CCell><CCell>层地轿地坎距</CCell><CCell>门锁啮合长</CCell><CCell></CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>测量结果</CCell><CCell></CCell><CCell></CCell><CCell></CCell><CCell></CCell><CCell></CCell><CCell></CCell><CCell></CCell><CCell></CCell><CCell></CCell>
                    </TableRow>
                </TableBody></Table>
                {render间隙表}
                <hr/>
                上表最后两行结果行,最后1列的录入拆出来：
                <LineColumn column={6}>
                    <InputLine label={`6.3（1）,层门门扇间间隙-测量结果`}>
                        <Input  value={inp?.['扇间隙'] ||''}
                                onChange={e => setInp({...inp, 扇间隙: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.3（1）,层门门扇与门套间隙-测量结果`}>
                        <Input  value={inp?.['扇套隙'] ||''}
                                onChange={e => setInp({...inp, 扇套隙: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.3（1）,层门扇与地坎间隙-测量结果`}>
                        <Input  value={inp?.['扇坎隙'] ||''}
                                onChange={e => setInp({...inp, 扇坎隙: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.3（1）-检验结果`}>
                        <SelectHookfork value={ inp?.门扇隙r ||''}
                                        onChange={e => setInp({ ...inp, 门扇隙r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                    <InputLine label={`6.3（2）扇施力间隙-测量结果`}>
                        <Input  value={inp?.['施力隙'] ||''}
                                onChange={e => setInp({...inp, 施力隙: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.3（2）扇施力间隙-检验结果`}>
                        <SelectHookfork value={ inp?.施力隙r ||''}
                                        onChange={e => setInp({ ...inp, 施力隙r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                    <InputLine label={`6.12 轿门门刀与层门地坎间距-测量结果`}>
                        <Input  value={inp?.['刀地间'] ||''}
                                onChange={e => setInp({...inp, 刀地间: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.12 门锁滚轮与轿门地坎间距-测量结果`}>
                        <Input  value={inp?.['轮地间'] ||''}
                                onChange={e => setInp({...inp, 轮地间: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.12 -检验结果`}>
                        <SelectHookfork value={ inp?.门地间r ||''}
                                        onChange={e => setInp({ ...inp, 门地间r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                    <InputLine label={`6.1 层地轿地坎距-测量结果`}>
                        <Input  value={inp?.['地地距'] ||''}
                                onChange={e => setInp({...inp, 地地距: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.1 层地轿地坎距-检验结果`}>
                        <SelectHookfork value={ inp?.地地距r ||''}
                                        onChange={e => setInp({ ...inp, 地地距r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                    <InputLine label={`6.9(1) 门锁啮合长-测量结果`}>
                        <Input  value={inp?.['锁啮长'] ||''}
                                onChange={e => setInp({...inp, 锁啮长: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.9(1) 门锁啮合长-检验结果`}>
                        <SelectHookfork value={ inp?.锁啮长r ||''}
                                        onChange={e => setInp({ ...inp, 锁啮长r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                    <InputLine label={`6.9(2)轿门锁啮合深度-观测数据`}>
                        <Input  value={inp?.['锁啮深o'] ||''}
                                onChange={e => setInp({...inp, 锁啮深o: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.9(2)轿门锁啮合深度-测量结果`}>
                        <Input  value={inp?.['锁啮深v'] ||''}
                                onChange={e => setInp({...inp, 锁啮深v: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.9(2)轿门锁啮合深度-检验结果`}>
                        <SelectHookfork value={ inp?.锁啮深r ||''}
                                        onChange={e => setInp({ ...inp, 锁啮深r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
                注1：所抽检的层站需填写。抽检结果符合要求的，在测量结果填所测量的数值区间范围（min-max），并在相应项目检验结 果内打“√”；抽检结果有不符合要求的，需填写不合格的观测数据，并在相应项目检验结果中打“×”。
            </InspectRecordLayout>
        );
    } );

const config平衡表=[['P(载重量)与Pe(额定载重量)的百分比(%)','n',158],['P(kg)','P',90],['电压V（V）上行','u',84,(obj,setObj)=>{
    return <SuffixInput  value={obj?.u ||''} onSave={txt=> setObj({...obj,u: txt || undefined })}>V</SuffixInput>
}],['电压V（V）下行','d',84,(obj,setObj)=>{
    return <SuffixInput  value={obj?.d ||''} onSave={txt=> setObj({...obj,d: txt || undefined })}>V</SuffixInput>
}],['电流I（A）上行','s',84,(obj,setObj)=>{
    return <SuffixInput  value={obj?.s ||''} onSave={txt=> setObj({...obj,s: txt || undefined })}>A</SuffixInput>
}],['电流I（A）下行','x',84,(obj,setObj)=>{
    return <SuffixInput  value={obj?.x ||''} onSave={txt=> setObj({...obj,x: txt || undefined })}>A</SuffixInput>
}]] as Each_ZdSetting[];
export const 默认平衡比例=[30,40,45,50,60];
const itemA平衡=['额定载荷','平衡表','中部速','速百分','衡系数','衡仪果'];
export const Equilibrium=
    React.forwardRef(({ children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const defvcbFunc = React.useCallback((par: any) => {
            const { 平衡表 }=par||{};
            if(!平衡表 || 平衡表.length<1){
                let 默认平衡=[] as any;
                if(!(par.额定载荷))     return par;   //必须作为前置条件的！ throw new Error("额定载荷没数据"); 打印简易原始记录没有注入数据的？
                默认平衡比例.forEach((percent, i:number)=> {          //额定载荷：不会随意改的基础技术参数。
                    let obj={n:percent, P: (par.额定载荷)*percent/100};
                    默认平衡.push(obj);
                });
                par.平衡表=默认平衡;            //defaultV:默认平衡,
            }
            return  par;
        }, []);
        const [getInpFilter]=useMeasureInpFilter(null,itemA平衡,defvcbFunc);
        const {inp, setInp} = useItemInputControl({ ref });
        const headview=<Text variant="h5">
            附录E 8.1B平衡系数试验和8.8C电梯速度检验记录；
        </Text>;
        const [render平衡表]=useTableEditor({inp, setInp,  headview,
                    config: config平衡表, table:'平衡表',  noDelAdd:true, fixColumn:2, column:6});
        //制图所需数据的转换： n:[30, 40, 45, 50, 60]排序； A:{s x} V:{u d}
        let yu: number[]=[];
        let yd: number[]=[];
        let ytype='';
        //【前提条件】inp?.平衡表的存储DB后 顺序不能改掉的：必须[30,40,45,50,60]对应顺序的。
        inp?.平衡表?.forEach((clObj:any, i:number)=> {
            if(clObj?.n!==默认平衡比例[i])    throw new Error("顺序30,40,45,50,60不能改");
            yu[i]=clObj?.s;
            yd[i]=clObj?.x;
        });
        if( yu.some(a=> !a) || yd.some(a=> !a) )
        {
            inp?.平衡表?.forEach((clObj:any, i:number)=> {
                if(clObj?.n!==默认平衡比例[i])    throw new Error("顺序30,40,45,50,60不能改");
                yu[i]=clObj?.u;
                yd[i]=clObj?.d;
            });
            if( !yu.some(a=> !a) && !yd.some(a=> !a) )
                ytype='V';
        }
        else ytype='A';
        const {renderMap}=useBalanceCoefficient({type:ytype, yu ,yd });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'附录E 8.1B平衡系数试验和8.8C电梯速度检验记录'}>
                {inp?.额定载荷?  render平衡表 : <Alert intent={"error"} title={'没有额定载荷数据，就无法试验'}/>}
                <hr/>
                当轿厢内载重量为额定载重量的50%时，轿厢向下运行至行程中部时速度v={inp?.['中部速']} m/min：
                <LineColumn column={4}>
                    <InputLine label={`轿厢向下运行至行程中部时速度v`}>
                        <SuffixInput  value={inp?.['中部速'] ||''} onSave={txt=> setInp({...inp,中部速: txt || undefined })}>m/min</SuffixInput>
                    </InputLine>
                    <InputLine label={`1、所测的速度v与额定速度的百分比为`}>
                        <SuffixInput  value={inp?.['速百分'] ||''} onSave={txt=> setInp({...inp,速百分: txt || undefined })}>%</SuffixInput>
                    </InputLine>
                    <InputLine label={`2、经测定，绘成曲线后，交叉点的对应的横坐标即为此台电梯的平衡系数为K`}>
                        <SuffixInput  value={inp?.['衡系数'] ||''} onSave={txt=> setInp({...inp,衡系数: txt || undefined })}>%</SuffixInput>
                    </InputLine>
                    <InputLine label={`用平衡系数专用测量仪器测量结果`}>
                       <SuffixInput  value={inp?.['衡仪果'] ||''} onSave={txt=> setInp({...inp,衡仪果: txt || undefined })}>%</SuffixInput>
                    </InputLine>
                </LineColumn>
                {inp?.额定载荷 && renderMap}
            </InspectRecordLayout>
        );
    } );

const itemA见证=['过程记编','自检编','整改报编','他资编','大备注'];
export const Witness=
    React.forwardRef(({ children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(null,itemA见证,);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'六、见证材料、七、备注'}>
                注：特殊情况，应在备注中说明检验员所负责检验的项目编号。<br/>
                六、见证材料
                <LineColumn column={6}>
                    <InputLine label={`1、《施工过程记录》编号`}>
                        <Input  value={inp?.['过程记编'] ||''}
                                onChange={e => setInp({...inp, 过程记编: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`2、《施工自检报告》编号`}>
                        <Input  value={inp?.['自检编'] ||''}
                                onChange={e => setInp({...inp, 自检编: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`3、《施工单位整改报告》编号`}>
                        <Input  value={inp?.['整改报编'] ||''}
                                onChange={e => setInp({...inp, 整改报编: e.currentTarget.value || undefined}) } />
                    </InputLine>
                </LineColumn>
                    <div>4、其他资料及编号:
                        <TextArea  value={inp?.['他资编'] ||''} rows={3}
                                   onChange={e => setInp({ ...inp, 他资编: e.currentTarget.value||undefined}) } />
                    </div>

                    <div>七、备注:
                        <TextArea  value={inp?.['大备注'] ||''} rows={5}
                                   onChange={e => setInp({ ...inp, 大备注: e.currentTarget.value||undefined}) } />
                    </div>
            </InspectRecordLayout>
        );
    } );

