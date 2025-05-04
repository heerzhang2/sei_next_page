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
    LineColumn, Table, TableRow, CCell, TableBody, Alert, BlobInputList,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, SelectHookfork, SelectInput, useItemInputControl
} from "../../common/base";
import {useRepTableEditor, } from "../../hook/useRepTableEditor";
import {useMeasureInpFilter} from "../../common/hooks";
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import '@uppy/webcam/dist/style.min.css';
import {measurementRender} from "../../common/measure";
import {floatInterception} from "../../../common/tool";
import {Each_ZdSetting} from "@/report/hook/use-table-editor";

export const 现场结果选=["符合要求","不符合要求"];
//下结论页面：
export const ItemConclusion=
    React.forwardRef((
        { children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const theme = useTheme();
        const getInpFilter = React.useCallback((par: any) => {
            const {检验结论,新下检日,检验条件,环境,警示,现场,封闭,检验日期,} =par||{};
            return {检验结论,新下检日,检验条件,环境,警示,现场,封闭,检验日期,};
        }, []);
        const {inp, setInp} = useItemInputControl({ ref });
        const [floor, setFloor] = React.useState<string|null>(null);
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'五、现场检验意见； 附录B：现场检验条件确认'} column={0}>
                <Text  variant="h5">
                    附录B：现场检验条件确认
                </Text>
                1、环境空气中没有腐蚀性和易燃性气体及导电尘埃；<br/>
                2、检验现场清洁，没有与自动扶梯或自动人行道工作无关的物品和设备；<br/>
                3、检验现场放置表明正在进行检验的警示牌；<br/>
                4、出入口设置围栏。
                <hr/>
                <div>
                    现场检验条件确认结果的记录:
                    <Table css={{borderCollapse:'collapse'}}>
                        <TableBody>
                            <TableRow >
                                <CCell>确认日期</CCell>
                                <CCell>1、环境空气中没有腐蚀</CCell>
                                <CCell>2、检验现场清洁</CCell>
                                <CCell>3、正进行检验的警示牌</CCell>
                                <CCell>4、出入口设置围栏</CCell>
                            </TableRow>
                            {inp?.检验条件?.map((a:string,i:number)=>{
                                return <TableRow key={i}>
                                    <CCell>{a}</CCell>
                                    <CCell>{inp?.环境?.[a]||''}</CCell>
                                    <CCell>{inp?.现场?.[a]||''}</CCell>
                                    <CCell>{inp?.警示?.[a]||''}</CCell>
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
                                            环境:{...inp?.环境,[floor]:undefined}, 警示:{...inp?.警示,[floor]:undefined},
                                            现场:{...inp?.现场,[floor]:undefined}, 封闭:{...inp?.封闭,[floor]:undefined},
                                        })
                                    )}
                            >刪除</Button>
                        </SuffixInput>
                    </InputLine>
                    <InputLine label={`1、环境空气中没有腐蚀(${floor})`}>
                        <SelectInput value={ inp?.环境?.[floor!] ||''}  list={现场结果选}
                                     onChange={e => floor&&setInp({ ...inp, 环境:{...inp?.环境,[floor]: e.currentTarget.value||undefined} }) }/>
                    </InputLine>
                    <InputLine  label={`2、检验现场清洁(${floor})`}>
                        <SelectInput value={ inp?.现场?.[floor!] ||''} list={现场结果选}
                                     onChange={e => floor&&setInp({ ...inp, 现场:{...inp?.现场,[floor]: e.currentTarget.value||undefined} }) }/>
                    </InputLine>
                    <InputLine  label={`3、正进行检验的警示牌(${floor})`}>
                        <SelectInput value={ inp?.警示?.[floor!] ||''}  list={现场结果选}
                                     onChange={e => floor&&setInp({ ...inp, 警示:{...inp?.警示,[floor]: e.currentTarget.value||undefined} }) }/>
                    </InputLine>
                    <InputLine label={`4、出入口设置围栏(${floor})`}>
                        <SelectInput value={ inp?.封闭?.[floor!] ||''} list={现场结果选}
                                     onChange={e => floor&&setInp({ ...inp, 封闭:{...inp?.封闭,[floor]: e.currentTarget.value||undefined} }) }/>
                    </InputLine>
                </LineColumn>
                特殊情况下，自动扶梯与自动人行道设计文件对温度、湿度、电压、环境空气条件等进行了专门规定的，检验现场的温度、湿度、电压、
                环境空气条件等应当符合自动扶梯与自动人行道设计文件的规定。<hr/>
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
                <InputLine  label='下次检验日期' >
                    <Input  value={inp?.新下检日 ||''}  type='date'
                            onChange={e => setInp({ ...inp, 新下检日: e.currentTarget.value}) } />
                </InputLine>
                注C-1：检验报告中的“检验项目及其内容”一栏中所表述具体项目和内容前面的条文序号[如1、1.4、(1)]与《电梯监督检验和定 期检验规则——自动扶梯与自动人行道》(TSG T7005—2012)中附件A的条文序号一致。  <br/>
                注C-2：对于允许按照GB 16899—1997 及更早期标准生产的自动扶梯与自动人行道，标有★的项目可以不检验。  <br/>
                注C-3：2.2 防护、6.2 梳齿板保护、6.4 非操 纵逆转保护、6.7 梯级或者踏板的下陷保护、7.1检修控制装置的设置、7.2 检修控制装置的操作、10.2 扶手带的运行速度偏差7个项目，对于制造日期为
                1998年2月1日以前的自动扶梯与自动人行道不作为否决项，按C项处理。 <br/>
                注C-4：检验报告中的下次检验日期精确到月，只填写至检验日期下一年度的当月。
            </InspectRecordLayout>
        );
    } );

/**不要重名了 ['附设装置名称','附设装置'] 可能莫名其妙报错的。台账snapshot.‘安装单位’等不能直接使用的，要本次最新:易变动。
 * 设备概况有些字段不在台账存在的，还有些不想采用台账的数据，还有些事后才能够同步给台账的；
 * */
const dbName设备概况 =[{desc:'管理单位电话',name:'管单位电'},{desc:'联系电话1',name:'联系电话'},{desc:'联系人手机',name:'联系手机'},
    {desc:'改造日期',name:'改造日期',type:'d'},
    {desc:'输送能力',name:'输送能',unit:'P/h'},
    {desc:'维保电话',name:'维保电话'},
    {desc:'安全管理人员',name:'安管人员'},{desc:'整改反馈确认期限',name:'整反期限',type:'d'},{desc:'检验意见通知书编号',name:'意见书号'},
];
//两个层次的嵌套对象存储模式：存储在"修改项"：{底下的对象分项字段} [标题，存储分项字段]
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
                检验依据：1、《电梯监督检验和定期检验规则—自动扶梯与自动人行道》（TSG T7005-2012，含1号、2号、3号修改单）；<br/>
                2.《福建省电梯安全 管理条例》<br/>
                注：“检验结果”栏：可用以下五种符号表示记录内容：“√”表示“符合”；“/”表示“无此项”；“▽”表示“资料确认符合”，“×”表示“不符合”，“△”表 示“无法检测”。
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
    [[{n:'电路动',t:'动力电路',u:'MΩ'},{n:'电路照',t:'照明电路',u:'MΩ'},{n:'电路全',t:'安全装置电路',u:'MΩ'}],'2.9','C','（1）',<div><Text>（1）动力电路、照明电路和电气安全装置电路的绝缘电阻应当符合下述要求：</Text>
        <Table tight  miniw={800}><TableBody>
            <TableRow>
                <CCell>标称电压/V</CCell><CCell>测试电压（直流）/V</CCell><CCell>绝缘电阻/MΩ</CCell>
            </TableRow>
            <TableRow>
                <CCell>安全电压</CCell><CCell>250</CCell><CCell>≥0.25</CCell>
            </TableRow>
            <TableRow>
                <CCell>≤500</CCell><CCell>500</CCell><CCell>≥1.00</CCell>
            </TableRow>
            <TableRow>
                <CCell>＞500</CCell><CCell>1000</CCell><CCell>≥1.00</CCell>
            </TableRow>
        </TableBody></Table></div>],
    [[{n:'标记径',t:'指示标记直径',u:'mm'}],'2.15','B','（1）',<Text>如果紧急停止装置位于扶手装置高度的1/2 以下，应当在 扶手装置1/2 高度以上的醒目位置张贴直径至少为80mm的
            红底白字“急停”指示标记，箭头指向紧急停止装置；</Text>],
    [[{n:'光照度',t:'光照度',u:'lx'}],'3.1','C','（1）',<Text>自动扶梯或者自动人行道周边，特别是在梳齿板的附近 应有足够的照明。在地面测出的梳齿相交线处的光照度 至少为50lx</Text>],
    [[{n:'畅通宽',t:'畅通区宽度',u:'mm'},{n:'畅通深',t:'畅通区纵深尺寸',u:'m'}],'3.2','C','（1）',
        <Text>在自动扶梯或者自动人行道的出入口，应有充分畅通的区域。该畅通区的宽度至少等于扶手带外缘距离加上每边各80mm，该畅通区纵深尺寸从扶手装置端部算起至少为2.50m；如果该区域的宽度不小于扶手带外缘之间距离的两倍
            加上每边各加上80mm，则其纵深尺寸允许 减少至2m；</Text>],
    [[{n:'护栏高',t:'固定护栏高出扶手带的距离',u:'mm'},{n:'栏带外距',t:'固定护栏与扶手带外缘距离',u:'mm'}],'3.2','C','（2）',
        <Text>如果人员在出入口可能接触到扶手带的外缘并且引起危险，则应当采取适当的预防措施。例如： ①设置固定的阻挡装置以阻止乘客进入该空间； ②在危险区域内，由建筑结构形成的固定护栏至少增加到高出扶手带100mm，并且位于
            扶手带外缘80mm至120mm之间</Text>],
    [[{n:'挡板高',t:'防护挡板高度',u:'m'},{n:'缘下距',t:'外缘下的距离',u:'mm'}],'3.4','B','（2）',
        <Text>特别是在与楼板交叉处以及各交叉设置的自动扶梯或者自动人行道之间，应当设置一个高度不小于0.30m，无 锐利边缘的垂直固定封闭防护挡板，位于扶手带上方，并且延伸至扶手带外缘下至少25mm（扶手带外缘与任何障碍物之间
            距离大于等于400mm的除外）</Text>],
    [[{n:'水平距离',t:'水平距离',u:'mm'},{n:'垂直距离',t:'垂直距离',u:'mm'}],'3.5','C','（1）',
        <Text>墙壁或者其他障碍物与扶手带外缘之间的水平距离在任何情况下均不得小于80mm，与扶手带下缘的垂直距离均不得小于25mm</Text>],
    [[{n:'带口隙',t:'开口间隙',u:'mm'}],'4.1','C','（1）',<Text>扶手带开口处与导轨或者扶手支架之间的距离在任何况下均不得大于8mm</Text>],
    [[{n:'防爬离',t:'防爬装置离地距离',u:'mm'},{n:'防爬长',t:'防爬延伸长度',u:'mm'}],'4.2','B','（1）',
        <Text>为防止人员跌落而在自动扶梯或者自动人行道的外盖板上装设的防爬装置应当位于地平面上方(1000 ±50)mm，下部与外盖板相交，平行于外盖板方向上的延伸长度不得小于1000mm，并且确保在此长度范围内无踩脚处。
            该装置的高度至少与扶手带表面齐平；</Text>],
    [[{n:'外盖宽',t:'外盖板宽度',u:'mm'},{n:'阻下缘距',t:'阻挡装置与扶手带下缘的距离',u:'mm'}],'4.2','B','（2）',
        <Text>当自动扶梯或者自动人行道与墙相邻，并且外盖板的宽度大于125mm时，在上、下端部应当安装阻挡装置以防 止人员进入外盖板区域。当自动扶梯或者自动人行道为相邻平行布置，并且共用外盖板的宽度大于125mm时，
            也应当安装这种阻挡装置。该装置应当延伸到高度距离 扶手带下缘25mm～150mm；</Text>],
    [[{n:'墙扶距',t:'建筑物（墙）与扶手带中心线或相邻扶手带中心线之间的距离',u:'mm'},{n:'防滑扶距',t:'防滑行装置与扶手带距离',u:'mm'},
        {n:'滑行间隔',t:'防滑行装置之间的间隔距离',u:'mm'},{n:'滑行高',t:'防滑行装置的高度',u:'mm'}],'4.2','B','（3）',
        <Text>当自动扶梯或者倾斜式自动人行道和相邻的墙之间装有 接近扶手带高度的扶手盖板，并且建筑物(墙)和扶手带中心线之间的距离大于300mm时，或者相邻自动扶梯或者倾斜式自动人行道的扶手带中心线之间的距离大于400mm时，应当在
            扶手盖板上装设防滑行装置。该装置应当包含固定在扶手盖板上的部件，与扶手带的距离不小于100mm，并且防滑行装置之间的间隔距离不大于1800mm，高度不小于20mm。该装置应当无锐角或者锐边。
        </Text>],
];
const item观测机房 : string[]=[];
const itemA观测机房 : string[]=[];
//初始化 存储字段
config观测数据.forEach(([_fxArr,_] : any, i:number)=> {
    if(!_fxArr || _fxArr.length<1)    throw new Error("没提供测量子项");
    const itrsName=_fxArr[0]?.n + 'r';
    _fxArr.forEach(({n,}: any, k:number)=> {
        item观测机房.push(n);
    });
    itemA观测机房.push(itrsName);
});
/**观测测量项目 （上）;
* */
export const ObservationInsulation=
    React.forwardRef((
        { children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(item观测机房,itemA观测机房);
        // const [getInpFilter]=useMeasureInpFilter(item观测表筒,itemA观测表筒,(par)=>{    CB ？  });

        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'八、观测数据及测量结果记录'}>
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
            </InspectRecordLayout>
        );
    } );
/**【针对比较有规律的情况】可以这样干的； 观测数据及测量结果记录 :抽象化后做配置的；特殊有 3.7 （1）；
 * 项目编号 ，类别，分项码，render检验内容与要求， [{检测项目,单位,观测名字，}] 观测名字首字段+o v r ；但是第11项目特殊：省略”间距“；
 * */
export const config观测数据下=[
    [[{n:'凸高度',t:'凸出高度',u:'mm'}],'4.3','C','（1）',<Text>    朝向梯级、踏板或胶带一侧扶手装置部分应当光滑、平齐。其压条或者镶条的装设方向与运行方向不一致时，其凸出高度应当不大于3mm，坚固并且具有圆角
                    或者倒角的边缘。</Text>],
    [[{n:'护板间隙',t:'护壁板间隙',u:'mm'}],'4.4','C','（1）',<Text>护壁板之间的间隙应当不大于4mm，其边缘呈圆角或者倒角状</Text>],
    [[{n:'单侧隙',t:'单侧水平间隙',u:'mm'},{n:'两侧隙',t:'两侧间隙总和',u:'mm'}],'4.6','B','（1）',
            <Text>自动扶梯或者自动人行道的围裙板应当设置在梯级、踏板或者胶带的两侧，任何一侧的水平间隙应当不大于4mm，并且两侧对称位置处的间隙总和不大于7mm。</Text>],
    [[{n:'踏围垂隙',t:'垂直间隙',u:'mm'}],'4.6','B','（2）',
        <Text>如果自动人行道的围裙板设置在踏板或者胶带之上，则踏板表面与围裙板下端所测得的垂直间隙应当不大于4mm；踏板或者胶带产生横向移动时，不允许踏板或者胶带的侧边与围裙板垂直投影间产生间隙</Text>],
    [[{n:'夹突出',t:'防夹装置突出量',u:'mm'}],'4.7','C','（2）', <Text>从围裙板垂直表面起的突出量最小为33mm，最大为50mm；</Text>],
    [[{n:'刚水突出',t:'刚性水平突出量',u:'mm'},{n:'柔性突出',t:'柔性突出量',u:'mm'}],'4.7','C','（3）',<Text>刚性部件有18mm到25mm的水平突出，柔性部件的水平突出量最小为15mm，
             最大为30mm；</Text>],
    [[{n:'斜区垂距',t:'倾斜区段的垂直距离',u:'mm'}],'4.7','C','（4）', <Text>在倾斜区段，刚性部件最下缘与梯级前缘连线的垂直距离在25mm和30mm之间；</Text>],
    [[{n:'渡区距',t:'过渡区段和水平区段的距离',u:'mm'}],'4.7','C','（5）', <Text>在过渡区段和水平区段，刚性部件最下缘与梯级表面最高位置的距离在25mm和55mm之间；</Text>],
    [[{n:'围上倾角',t:'向上倾斜角',u:'°'},{n:'围下斜角',t:'向下倾斜角',u:'°'}],'4.7','C','（6）', <Text>刚性部件的下表面与围裙板形成向上不小于25°的倾斜角，上表面与围裙板形成向下
                不小于25°倾斜角；</Text>],
    [[{n:'夹端点位',t:'防夹装置端点位置',u:'mm'}],'4.7','C','（7）', <Text>末端部分逐渐缩减并且与围裙板平滑相连，其端点位于梳齿与踏面相交线前（梯级侧）不小于50mm，最大
                150mm的位置</Text>],
    [[{n:'啮合深',t:'啮合深度',u:'mm'},{n:'齿间隙',t:'间隙',u:'mm'}],'5.1','C','（1）',<Text>梳齿板梳齿或者踏面齿应当完好，不得有缺损。梳齿板梳齿与踏板面齿槽的啮合深度应当至少为4mm，
                间隙不超过4mm</Text>],
    [[{n:'逆运行时',t:'自动启动运行时间',u:'s'}],'8.2','C','（1）',<Text>采用自动启动的自动扶梯或者自动人行道，当乘客从预定运行方向相反的方向进入时，应当仍按照预先确定的方向启动，运行时间应当不少于10s。
            </Text>],
    [[{n:'停行时间',t:'自动停止运行时间',u:'s'}],'8.2','C','（2）',<Text>当乘客通过后，自动扶梯或者自动人行道应当有足够的时间（至少为预期乘客输送时间再加上10s）才能自动停止运行</Text>],
    [[{n:'制停距扶',t:'制停距离',u:'m'}],'10.3','B','（1）',<Text>（1）空载和有载向下运行的自动扶梯：<br/>
        名义速度　   制停距离范围<br/>
        0.50m/s 　   0.20m～1.00m<br/>
        0.65m/s 　   0.30m～1.30m<br/>
        0.75m/s 　   0.40m～1.50m</Text>],
    [[{n:'制停距道',t:'制停距离',u:'m'}],'10.3','B','（2）',<Text>（2）空载和有载水平运行或者有载向下运行的自动人行道：<br/>
        名义速度     制停距离范围<br/>
        0.50m/s 　　 0.20m～1.00m<br/>
        0.65m/s 　　 0.30m～1.30m<br/>
        0.75m/s 　　 0.40m～1.50m<br/>
        0.90m/s 　　 0.55m～1.70m</Text>],
];
const item观测护板 : string[]=[];
const itemA观测护板 : string[]=[];
//初始化 存储字段
config观测数据下.forEach(([_fxArr,_] : any, i:number)=> {
    if(!_fxArr || _fxArr.length<1)    throw new Error("没提供测量子项");
    const itrsName=_fxArr[0]?.n + 'r';
    _fxArr.forEach(({n,}: any, k:number)=> {
        item观测护板.push(n);
    });
    itemA观测护板.push(itrsName);
});
/**观测测量项目 （下）;
 * */
export const ObservationWainscot=
    React.forwardRef((
        { children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(item观测护板,itemA观测护板);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'八、观测数据及测量结果记录（下）'}>
                八、观测数据及测量结果记录（下）<br/>
                {
                    config观测数据下.map(([_fxArr,tag,iclas,fxno,node]: any, i:number)=> {
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


/**根据标记替换存储指端： 末尾加上'复'
 * */
const nameof = (name:string,reIsp?:boolean) => {
    return reIsp? name+'复' : name;
}
interface DeviationItemProps  extends InternalItemProps{
    reIsp?: boolean;
}
// const item偏差=['锁啮深'];
const itemA偏差=['行距离','左错离','右错离','行距离r','左度偏','右度偏','专仪测r'];
export const Deviation=
    React.forwardRef(({ children, show ,alone=true,refWidth,reIsp}:DeviationItemProps,  ref
    ) => {
        const myItemA =React.useMemo(()=>itemA偏差.map(o=>nameof(o,reIsp)),
            [reIsp]);           //确保 不死循环
        const [getInpFilter]=useMeasureInpFilter(null,  myItemA, );
        const {inp, setInp} = useItemInputControl({ ref });
        const cDresultL=100* inp?.[nameof('左错离',reIsp)] / inp?.[nameof('行距离',reIsp)];
        const cDresultR=100* inp?.[nameof('右错离',reIsp)] / inp?.[nameof('行距离',reIsp)];
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={`附录A${(reIsp&&'(复检）')||''}：空载梯级（踏板、胶带）和扶手带运行速度偏差`}>
                附录A{reIsp&&<Text css={{fontSize:'1.7rem'}}>(复检）</Text>}：空载梯级（踏板、胶带）和扶手带运行速度偏差：
                <hr/>
                项目 10.2C 检验内容观测数据录入计算和判定<br/>
                方法一：
                <LineColumn column={6}>
                    <InputLine label={`实际运行距离S`}>
                        <SuffixInput  value={inp?.[nameof('行距离',reIsp)] ||''} onSave={txt=> setInp({...inp,
                            [nameof('行距离',reIsp)]: txt || undefined })}>mm</SuffixInput>
                    </InputLine>
                    <InputLine label={`左侧扶手带与梯级（踏板、胶 带）错位距离Sl`}>
                        <SuffixInput  value={inp?.[nameof('左错离',reIsp)] ||''} onSave={txt=> setInp({...inp,
                            [nameof('左错离',reIsp)]: txt || undefined })}>mm</SuffixInput>
                    </InputLine>
                    <InputLine label={`右侧扶手带与梯级（踏板、胶 带）错位距离Sr`}>
                        <SuffixInput  value={inp?.[nameof('右错离',reIsp)] ||''} onSave={txt=> setInp({...inp,
                            [nameof('右错离',reIsp)]: txt || undefined })}>mm</SuffixInput>
                    </InputLine>
                </LineColumn>
                计算结果 - 左侧扶手带空载运行速度与梯级速度偏差δl （δl =100Sl /S） 》 ({!isNaN(cDresultL) && floatInterception(cDresultL,1)} %)<br/>
                计算结果 - 右侧扶手带空载运行速度与梯级速度偏差δr （δr =100Sr /S） 》 ({!isNaN(cDresultR) && floatInterception(cDresultR,1)} %)<br/>
                判断标准：允许偏差为0～+2%<br/>
                <InputLine label={`方法一的-结果判定`}>
                    <SelectHookfork value={inp?.[nameof('行距离r',reIsp)] ||''}
                                    onChange={e => setInp({ ...inp,
                                        [nameof('行距离r',reIsp)]: e.currentTarget.value||undefined}) }/>
                </InputLine>
                备注：1.方法一与方法二只需要选取一种；2.错位距离Sl 、Sr的判定，当扶手带超前于梯级（踏板、胶带）时为正值，反之为负值<br/><br/>
                方法二：<br/>
                采用专用测量仪器直接测量-
                <LineColumn column={6}>
                    <InputLine label={`左侧扶手带空载运行速度与梯级速度偏差δl`}>
                        <SuffixInput  value={inp?.[nameof('左度偏',reIsp)] ||''} onSave={txt=> setInp({...inp,
                            [nameof('左度偏',reIsp)]: txt || undefined })}>%</SuffixInput>
                    </InputLine>
                    <InputLine label={`右侧扶手带空载运行速度与梯级速度偏差δr`}>
                        <SuffixInput  value={inp?.[nameof('右度偏',reIsp)] ||''} onSave={txt=> setInp({...inp,
                            [nameof('右度偏',reIsp)]: txt || undefined })}>%</SuffixInput>
                    </InputLine>
                </LineColumn>
                判断标准：允许偏差为0～+2%<br/>
                <InputLine label={`方法二的-结果判定`}>
                    <SelectHookfork value={inp?.[nameof('专仪测r',reIsp)] ||''}
                                    onChange={e => setInp({ ...inp,
                                        [nameof('专仪测r',reIsp)]: e.currentTarget.value||undefined}) }/>
                </InputLine>
            </InspectRecordLayout>
        );
    } );


const itemA见证=['限速速校','自检编','整改报编','他资编','大备注'];
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
                <LineColumn column={3}>

                    <InputLine label={`1、维保自检材料`}>
                        <BlobInputList value={inp?.['自检编'] ||''}   datalist={['材料名称《自动扶梯与自动人行道年度自行检查报告》,编号：']}
                                       onListChange={v => setInp({...inp, 自检编: v || undefined}) } />
                    </InputLine>
                    <InputLine label={`2、限速器动作速度校验材料`}>
                        <BlobInputList value={inp?.['限速速校'] ||''}   datalist={['材料名称《限速器动作速度校验报告》，编号：']}
                                       onListChange={v => setInp({...inp, 限速速校: v || undefined}) } />
                    </InputLine>
                    <InputLine label={`3、使用单位整改反馈材料`}>
                        <BlobInputList value={inp?.['整改报编'] ||''}   datalist={['材料名称《》，编号：']}
                                       onListChange={v => setInp({...inp, 整改报编: v || undefined}) } />
                    </InputLine>
                    <InputLine label={`4、其他资料及编号`}>
                        <BlobInputList  value={inp?.['他资编'] ||''}
                                        onListChange={v => setInp({ ...inp, 他资编: v || undefined}) } />
                    </InputLine>

                </LineColumn>
                    <div>七、备注:
                        <BlobInputList  value={inp?.['大备注'] ||''}  rows={5}
                                        datalist={['本报告为复检报告，本次复检仅对上次不合格报告的不合格项进行复检，其余项目单项结论引用上次不合格报告中相对应项目的结论']}
                                        onListChange={v => setInp({ ...inp, 大备注: v || undefined}) } />
                    </div>
            </InspectRecordLayout>
        );
    } );

