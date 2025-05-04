/** @jsxImportSource @emotion/react */
import * as React from "react";
import {css} from "@emotion/react";
import {
    Button, InputLine, Input, TextArea, Select, InputDatalist, Layer, Text, CheckSwitch, SuffixInput, IconCheckSquare, IconSquare,
    TableRow, CCell, useTheme, TableHead, TableBody, Table, Cell,  ColumnWidth,LineColumn,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout,
    InternalItemProps, SelectHookfork, useInputControlSure,
    useItemInputControl
} from "../../common/base";
// import queryString from "query-string";
import {useRepTableEditor, useTableEditor} from "../../hook/useRepTableEditor";
// import {WrapByLineColumn} from "../../../comp/base";
import {measurementRender, } from "../common";
import {arraySetInp, calcAverageArrObj, } from "../../../common/tool";
import Img_Jgd from "./PictureJgd.png";
import {SimpleImg} from "../../../comp/Image";
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import '@uppy/webcam/dist/style.min.css';
import {useUppyUpload} from "../../hook/useUppyUpload";
import {EditStorageContext} from "../../StorageContext";
import {itemResultUnqualified} from "../helper";
import {setupItemAreaRoute} from "./orcIspConfig";
import {特殊项目编码} from "./FormatOriginal";
import {useMeasureInpFilter} from "../../common/hooks";
import {Each_ZdSetting} from "@/report/hook/use-table-edit";


// export const 结果打勾等的=['√','×','无此项','-'];

//公共的复用性好的组件；编辑、原始记录，在多数模板能通用的。不通用的要安排放在更加具体贴近的目录文件内。
//方便不同模板和不同版本的可重复引用。文件目录管理，组件按照抽象性程度和参数配置的关联度，分级分层次，标识容易区分开。
//下结论页面：
export const ItemConclusionCr=
    React.forwardRef((
        { children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const theme = useTheme();
        const getInpFilter = React.useCallback((par: any) => {
            const {检验结论,新下检日,检验条件,环境,易燃} =par||{};
            return {检验结论,新下检日,检验条件,环境,易燃};
        }, []);
        const {inp, setInp} = useItemInputControl({ ref });
        const [floor, setFloor] = React.useState<string|null>(null);
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'四、结论； 附录13：现场检验条件'} column={0}>
                <Text  variant="h5">
                  附录13：现场检验条件确认
                </Text>
                1、试验的动力源、环境温度、海拔高度、风速符合标准和设计要求。<br/>
                2、检验现场不得有易燃、易爆以及腐蚀性气体。<br/>
                <hr/>
                <div>
                    现场检验条件确认结果的记录:
                    <Table css={{borderCollapse:'collapse'}}>
                        <TableBody>
                            <TableRow >
                                <CCell>确认日期</CCell>
                                <CCell>试验的动力源、环境温度、海拔高度、风速符合标准和设计要求。</CCell>
                                <CCell>检验现场不得有易燃、易爆以及腐蚀性气体。</CCell>
                            </TableRow>
                            {inp?.检验条件?.map((a:string,i:number)=>{
                                return <TableRow key={i}>
                                    <CCell>{a}</CCell>
                                    <CCell>{inp?.环境?.[a]||''}</CCell>
                                    <CCell>{inp?.易燃?.[a]||''}</CCell>
                                </TableRow>
                            }) }
                        </TableBody>
                    </Table>
                </div>
                <>新增检查确认时间=＞</>
                <LineColumn column={2} >
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

                    <InputLine label={`试验的动力源环境温度(${floor})`}>
                        <SelectHookfork value={ inp?.环境?.[floor!] ||''}
                                        onChange={e => floor&&setInp({ ...inp, 环境:{...inp?.环境,[floor]: e.currentTarget.value||undefined} }) }/>
                    </InputLine>
                    <InputLine label={`现场不得有易燃易爆(${floor})`}>
                        <SelectHookfork value={ inp?.易燃?.[floor!] ||''}
                                        onChange={e => floor&&setInp({ ...inp, 易燃:{...inp?.易燃,[floor]: e.currentTarget.value||undefined} }) }/>
                    </InputLine>
                </LineColumn>
                注：每次到现场后，在检验前应对检验条件进行确认，只有确认所有与检验相关的条件满足检验要求时，才能开始开展检验工作。<hr/>
                <Text  variant="h5">
                    四、结论 (报告下结论)：
                </Text>
                <InputLine  label='四、结论' >
                    <Select inputSize="md" css={{minWidth:'140px',fontSize:'1.3rem',padding:'0 1rem'}}
                            value={ inp?.检验结论  ||''}
                            onChange={e => setInp({ ...inp, 检验结论: e.currentTarget.value||undefined}) }
                    >
                        <option></option>
                        <option>合格</option>
                        <option>不合格</option>
                    </Select>
                </InputLine>
                <InputLine  label='下次定期检验日期' >
                    <Input  value={inp?.新下检日 ||''}  type='date'
                            onChange={e => setInp({ ...inp, 新下检日: e.currentTarget.value}) } />
                </InputLine>
            </InspectRecordLayout>
        );
    } );


const daL改造内容=[['改变主要受力结构件的结构形式','改结构形'],['改变主要机构的配置形式','改配置形'],['改变主参数','改主参']];
const 改造内容={
    view:(orc:any)=>{
        return <div css={{display: 'flex',flexDirection: 'column',alignItems: 'flex-start'}}>
            { daL改造内容.map(([desc,name] : any, i:number)=> {
                    return <div key={i} css={{display: 'flex',alignItems: 'center'}}>{orc?.[name]? <IconCheckSquare size='sm'/> : <IconSquare size='sm'/>}&nbsp;{desc}。</div>;
            }) }
        </div>
    },
    edit:(inp:any,setInp:(a:any)=>void)=>{
        return <div  key={999} css={{flex: '1 1 50%'}}>
                { daL改造内容.map(([desc,name] : any, i:number)=> {
                    return <InputLine key={i} label={`${desc}:`}>
                        <CheckSwitch  checked={inp?.[name] || false} onChange={e => setInp({...inp, [name]: inp?.[name]? undefined:true}) } />
                    </InputLine>;
                }) }
            </div>
    }
};
const daL重大修理内容=[['更换主要受力结构件','换结构件'],['更换主要机构','换机构'],['更换控制系统','换控制']];
const 重大修理内容={
    view:(orc:any)=>{
        return <div css={{display: 'flex',flexDirection: 'column',alignItems: 'flex-start'}}>
            { daL重大修理内容.map(([desc,name] : any, i:number)=> {
                return <div key={i} css={{display: 'flex',alignItems: 'center'}}>{orc?.[name]? <IconCheckSquare size='sm'/> : <IconSquare size='sm'/>}&nbsp;{desc}。</div>;
            }) }
        </div>
    },
    edit:(inp:any,setInp:(a:any)=>void)=>{
        return <div key={998} css={{flex: '1 1 50%'}}>
                { daL重大修理内容.map(([desc,name] : any, i:number)=> {
                    return <InputLine key={i} label={`${desc}:`}>
                        <CheckSwitch  checked={inp?.[name] || false} onChange={e => setInp({...inp, [name]: inp?.[name]? undefined:true}) } />
                    </InputLine>;
                }) }
          </div>
    }
};
const 检验依据={
    edit:(inp:any,setInp:(a:any)=>void)=>{
        return <InputLine  key={997}  label='检验依据：'>
                    <InputDatalist value={(inp?.[`检验依据`]) || ''} datalist={['《起重机械安全技术规程》（TSG 51-2023）',]}
                                   onListChange={v => {
                                       setInp({ ...inp, [`检验依据`]:v || undefined});
                                   } } />
             </InputLine>
    }
};
const render下检日={
    view:(orc:any)=>{      //不能用.['下检日期']它是snapshot台账的下检日期，还未没改的。
        const date=new Date(orc?.['新下检日']);
        const year=date.getFullYear()
        const month=date.getMonth()
        return <>{isNaN(year)? ' ' :year}年&nbsp;{isNaN(month)? ` ` :month}月</>
    },
};
/**
 * 不要重名了 ['附设装置名称','附设装置'] 可能莫名其妙报错的。台账snapshot.‘安装单位’等不能直接使用的，要本次最新:易变动。
 * */
export const config设备概况=[
    [['安装改造重大修理单位名称','新安装单']],
    [['施工单位特种设备生产许可证（受理决定书）编号','许可书号'],['安装改造重大修理单位负责人','安装单负']],
    [['施工单位生产许可证许可子项目','施许可子'],['施工单位联系电话','施工联系']],
    [['使用单位名称','_$使用单位']],
    [['使用单位地址','_$使用单位地址']],
    [['分支机构','_$分支机构']],
    [['分支机构地址','_$分支机构地址']],
    [['产权单位名称','_$产权单位']],
    [['产权单位地址','_$产权单位地址']],
    [['使用单位联系人','使单联人'],['使用单位安全管理人员','安全员']],
    [['使用单位联系电话','使单联电'],['安全管理人员联系电话','安全员电']],
    [['使用单位统一社会信用代码','_$使用单位信用码'],['管理部门类型','_$使管部类型']],
    [['制造单位名称','_$制造单位']],
    [['制造单位特种设备生产许可证编号','生产许号'],['制造单位生产许可证许可子项目','制许可子']],
    [['操纵方式',{n:'操纵方式',t:'l',l:['地面操纵','司机室操纵','遥控','多点操纵','其他']}],['作业环境',{n:'作业环境',t:'l',l:['室内','室外','吊运熔融金属','吊运炽热固体','防爆','绝缘']}]],
    [['防爆等级','_$防爆等级'],['进口情况','_$进口类型']],
    [['制造日期','_$制造日期'],['投入使用日期','_$投用日期']],
    [['单位内编号','_$单位内部编号'],['设计使用年限','_$设计年限']],
    [['使用地点','使用地']],
    [['设备使用地点所在区域','使区域']],
    [['跨度','_$跨度','m'],['额定起重量','_$额定起重量','t']],
    [['起升速度','_$起升速','m/min'],['生产率','_$生产率','t/h']],
    [['起升高度',{n:'起升高度',t:'n',u:'m'}],['工作级别','_$工作级别']],
    [['主起升机构额定起重量',{n:'主起额起',u:'t'}],['副起升机构额定起重量','_$起升副额起','t']],
    [['大车速度','_$大车速度','m/min'],['小车速度','_$小车速度','m/min']],
    [['悬臂端有效长度L1','_$悬臂长1','m'],['悬臂端有效长度L2','_$悬臂长2','m']],
    [['其他主要参数',{n:'其他参数',t:'m'}]],
    [['检验时吊具',{n:'检吊具',t:'l',l:['吊钩','集装箱吊具','抓斗','起重电磁铁','真空吸盘','夹钳','其他']}],['主起升机构起升悬挂部件',{n:'主起悬挂',t:'l',l:['钢丝绳','环链','纤维绳','钢铰线','其他']}]],
    [['检验依据','检验依据',检验依据]],
    [['下次定期检验日期',undefined,render下检日],['是否流动作业',{n:'流动作业',t:'b'}]],
    [['现场检验条件',{r:'见附录13'}],['是否型式试验样机',{n:'型试样机',t:'b'}]],
    [['附设装置名称','附设装']],
    [['重大修理内容','',重大修理内容]],
    [['改造内容','',改造内容]],
    [['备注',{n:'概备注',t:'m'}]],
    ];
const dbName设备概况 =[] as any;
config设备概况.forEach(([[desc,name,cb],add2p] : any, i:number)=> {
    const [desc2, name2, cb2] = add2p || [];
    //【关键】名字变体,{n:'型试样机',t:'b'} 对象含义 .t：有几种情况t='b'布尔;='d'日期;='l'列表;默认是Input ,若又有u字段是单位辨识，就是附加后缀的input;另外l字段是文本数组[];r是文本代数据库:替代。t='n'纯数字,’m‘多行备注
    if(typeof name==='string' && !name?.startsWith('_$'))  dbName设备概况.push({name,desc,cb});
    else if(typeof name==='object' && name.n && !name.r)  dbName设备概况.push({name:name.n, desc,cb, type:name.t,unit:name.u,list:name.l});
    if(typeof name2==='string' && name2 && !name2.startsWith('_$'))  dbName设备概况.push({name:name2,desc:desc2,cb:cb2});
    else if(typeof name2==='object' && name2.n && !name2.r)  dbName设备概况.push({name:name2.n, desc:desc2,cb:cb2, type:name2.t,unit:name2.u,list:name2.l});
});

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
            daL改造内容.forEach(([_,name] : any, i:number)=> {
                fields[name] =par[name];
            })
            daL重大修理内容.forEach(([_,name] : any, i:number)=> {
                fields[name] =par[name];
            })
            return fields;
        }, []);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'二、设备概况'}>
                设备概况除了台账外还需要修改的部分:
                <LineColumn  column={3} >
                    {           /* 剔除最后一个”备注“要单独处理的 */
                        dbName设备概况.map(({name,desc,cb,type,unit,list} : any, i:number)=> {
                            if(i>=dbName设备概况.length-1)      return <React.Fragment key={i}></React.Fragment>;
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
                备注：
                <TextArea  value={inp?.概备注 ||''} rows={5}
                         onChange={e => setInp({ ...inp, 概备注: e.currentTarget.value||undefined}) } />
            </InspectRecordLayout>
        );
    } );

//导航配置表：顺序固定不能改动！！
// export const VsProjects默认=[{name:'压力容器定期检验结论',do:true,ha:'Conclusion'},{name:'压力容器资料审查',do:true,ha:'InformationReview'},
//     {name:'宏观检验',do:true,ml:'压力容器宏观检查报告',ha:'Structural'},
//     {name:'安全附件检验'},{name:'附加检验报告',ml:'附加检验报告',ha:'AdditionalTest'},{name:'壁厚测定',ha:'rp_thickmVs_'},{name:'强度校核'},{name:'射线检测'},{name:'超声检测',ml:'超声波检测报告'},
//     {name:'衍射时差法（TOFD）超声检测',ha:'rp_tofd_'},{name:'磁粉检测'},{name:'渗透检测'},{name:'声发射检测'},{name:'光谱分析',ml:'材料成分分析（光谱分析）报告'},
//     {name:'硬度检测'},{name:'金相分析'},{name:'耐压试验'},{name:'气密性试验'},{name:'氨检漏试验'},{name:'氦、卤素检漏试验'}];


const item观测表筒=['卷筒板','绳夹数','绳夹间','编结长','安圈数','敞护高','电阻N','电阻T','电阻I','备磁铁'];
const itemA观测表筒=['绳钢圈r','敞护高r','接地阻r','备磁铁r',];
export const ObservationDrum=
    React.forwardRef((
        { children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(item观测表筒,itemA观测表筒);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'附录1：观测值及测量结果记录表C3.8.1 - C3.11.7'} column={0}>
                附录1：观测值及测量结果记录表<br/>
                C3.8.1项目的：
                <LineColumn column={4} >
                    { measurementRender('卷筒上压板数量','卷筒板','个',inp,setInp) }
                    { measurementRender('绳夹数量','绳夹数','个',inp,setInp) }
                    { measurementRender('绳夹间距','绳夹间','mm',inp,setInp) }
                    { measurementRender('钢丝绳编结长度','编结长','mm',inp,setInp) }
                    { measurementRender('安全圈数','安圈数','圈',inp,setInp) }
                    <div>
                        C3.8.1项目的：检验结果
                        <InputLine label='检验结果'>
                            <SelectHookfork value={ inp?.绳钢圈r ||''}
                                            onChange={e => setInp({ ...inp, 绳钢圈r: e.currentTarget.value||undefined}) }/>
                        </InputLine>
                    </div>
                </LineColumn>
                C3.10项目的：
                { measurementRender('敞开式司机室护栏高度','敞护高','m',inp,setInp) }
                <InputLine label='C3.10检验结果'>
                    <SelectHookfork value={ inp?.敞护高r ||''}
                            onChange={e => setInp({ ...inp, 敞护高r: e.currentTarget.value||undefined}) }/>
                </InputLine>
                C3.11.3项目的：
                { measurementRender('TN系统重复接地电阻','电阻N','Ω',inp,setInp) }
                { measurementRender('TT系统接地电阻','电阻T','Ω',inp,setInp) }
                { measurementRender('IT系统接地电阻','电阻I','Ω',inp,setInp) }
                <InputLine label='C3.11.3检验结果'>
                    <SelectHookfork value={ inp?.接地阻r ||''}
                                    onChange={e => setInp({ ...inp, 接地阻r: e.currentTarget.value||undefined}) }/>
                </InputLine>
                C3.11.7项目的：
                { measurementRender('起重电磁铁：备用电池能够保持起重电磁铁吸附额定载荷的时间','备磁铁','min',inp,setInp) }
                <InputLine label='C3.11.7检验结果'>
                    <SelectHookfork value={ inp?.备磁铁r ||''}
                                    onChange={e => setInp({ ...inp, 备磁铁r: e.currentTarget.value||undefined}) }/>
                </InputLine>
            </InspectRecordLayout>
        );
    } );

const 默认仪器=[{n:'综合气象仪'},{n:'水准仪'},{n:'钢卷尺'},{n:'钢板尺'},{n:'万用表'},{n:'绝缘电阻仪'},{n:'接地电阻仪'},{n:'测距仪'},{n:'游标卡尺'},
    {n:'经纬仪'},{n:'秒表'},{n:'力矩扳手'},{n:'测厚仪'},{n:'点温计'},{n:'全站仪'},{n:'手持式特斯拉计'},{n:'磁粉探伤仪'},{n:'应变应力测试仪'}];
//【注意】回调函数局限：若加<React.Fragment > 会导致<InputLine 内勤套render时刻无法穿透提供 props 给输入组件的：层次层级不配套，造成样式不一致问题！
const config仪器表=[['仪器设备名称','n',130],['型号规格','t',115],['仪器设备编号','i',115],
    ['开机后','o',65,(obj,setObj)=>{
        return <SelectHookfork value={ obj?.o ||''} onChange={e => setObj({ ...obj, o: e.currentTarget.value||undefined})}/>
    }],
    ['关机前','f',65,(obj,setObj)=>{
        return <SelectHookfork value={ obj?.f ||''} onChange={e => setObj({ ...obj, f: e.currentTarget.value||undefined})}/>
    }],
] as Each_ZdSetting[];

export const ItemInstrumentTable=
    React.forwardRef((
        { children, show ,alone=true,redId,nestMd}:InternalItemProps,  ref
    ) => {
        const breaks=[140,420,620];     //看内容调整: 更紧凑点的
        const headview=<Text variant="h5">
            一、主要检验仪器设备性能检查：“性能状态”一栏分为俩字段(1)开机后和(2)关机前。
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
        </>;

        const {render}=useRepTableEditor({ref,nestMd,show,alone,redId,
            config: config仪器表, table:'仪器表', column:3, breaks, label:'一、主要检验仪器设备性能检查', headview,tailview, defaultV:默认仪器,
        });
        return render;
    } );

const config见证材料=[['代号','no',142],['名称','nm',278],['编号','sn',182],] as Each_ZdSetting[];
const config六记事=[['名称','nm',242],['编号','no',145],['备注','me',230],] as Each_ZdSetting[];
export const Evaluation=
    React.forwardRef((
        { children, show ,alone=true,redId,nestMd}:InternalItemProps,  ref
    ) => {

        const getInpFilter = React.useCallback((par: any) => {
            const {见证表, 记事表,大备注} = par;
            return {见证表, 记事表,大备注};
        }, []);
        const {inp, setInp} = useItemInputControl({ ref });

        const breaks=[140,420,620];     //看内容调整: 更紧凑点的
        const headview=<Text variant="h5">
            五、技术资料和工作见证材料:
        </Text>;
        const [render见证]=useTableEditor({config: config见证材料, table:'见证表', column:3, breaks,  headview, inp, setInp});
        const head记事=<Text variant="h5">
            六、记事:
        </Text>;
        const [render记事]=useTableEditor({config: config六记事, table:'记事表', column:3, breaks,  headview:head记事, inp, setInp});



        return  <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter}  show={show}  redId={redId} nestMd={nestMd}
                                       alone={alone}  label={'五、技术资料见证 六、记事 七、备注'}>
            {render见证}
            <hr/>
            {render记事}
            <hr/>
            七、备注
            <TextArea  value={inp?.大备注 ||''} rows={4}
                       onChange={e => setInp({ ...inp, 大备注: e.currentTarget.value||undefined}) } />
        </InspectRecordLayout>;
    } );


const item观测表绝=['主回阻','滑轮阻','车架阻','门架阻','交流感','直流感','空吸盘','显示数','载荷显','油前温','油后温','温升值','温升允'];
const itemA观测表绝=['绝缘起r','空吸盘r','显示数r','压油温v','压油温r','观测备注'];
export const ObservationInsula=
    React.forwardRef((
        { children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(item观测表绝,itemA观测表绝);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'附录1：观测值及测量结果记录表C3.14 - C4.7.2.3'} column={0}>
                附录1：观测值及测量结果记录表（2）<br/>
                C3.14项目的：
                { measurementRender('主回路、控制回路、电气设备的相间绝缘电阻和对地绝缘电阻','主回阻','MΩ',inp,setInp) }
                绝缘起重机：<br/>
                <LineColumn column={3} >
                    { measurementRender('吊钩与钢丝绳动滑轮组之间绝缘电阻','滑轮阻','MΩ',inp,setInp,true) }
                    { measurementRender('起升机构与小车架之间绝缘电阻','车架阻','MΩ',inp,setInp,true) }
                    { measurementRender('小车架与桥架或者门架之间绝缘电阻','门架阻','MΩ',inp,setInp,true) }
                </LineColumn>
                { measurementRender('小车架上的感应电压-交流','交流感','V',inp,setInp) }
                { measurementRender('小车架上的感应电压-直流','直流感','V',inp,setInp) }
                C3.14项目的：检验结果
                <InputLine label='C3.14检验结果'>
                    <SelectHookfork value={ inp?.绝缘起r ||''}
                                    onChange={e => setInp({ ...inp, 绝缘起r: e.currentTarget.value||undefined}) }/>
                </InputLine>
                C4.5.2.4项目的：
                { measurementRender('真空吸盘：如果出现电源故障，真空吸盘能够保持载荷的时间','空吸盘','min',inp,setInp) }
                <InputLine label='C4.5.2.4检验结果'>
                    <SelectHookfork value={ inp?.空吸盘r ||''}
                                    onChange={e => setInp({ ...inp, 空吸盘r: e.currentTarget.value||undefined}) }/>
                </InputLine>
                C4.6.1项目的：起重量显示装置显示数值的误差：
                <LineColumn column={4} >
                    { measurementRender('起重量显示误差-显示数值(t)','显示数','t',inp,setInp,true) }
                    { measurementRender('起重量显示误差-试验载荷值(t)','载荷显','t',inp,setInp,true) }
                    <InputLine label='起重量显示装置显示数值的误差-结果值'>
                        <SuffixInput  value={inp?.载荷显v ||''} onSave={txt=> setInp({...inp,载荷显v: txt || undefined })}>%</SuffixInput>
                    </InputLine>
                    <InputLine label='C4.6.1检验结果'>
                        <SelectHookfork value={ inp?.显示数r ||''}
                                        onChange={e => setInp({ ...inp, 显示数r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
                C4.7.2.3项目的：液压系统油液温升:
                <LineColumn column={2} >
                    { measurementRender('试验前温度','油前温','℃',inp,setInp,true) }
                    { measurementRender('试验后温度','油后温','℃',inp,setInp,true) }
                    { measurementRender('温升值','温升值','℃',inp,setInp,true) }
                    { measurementRender('温升允许值','温升允','℃',inp,setInp,true) }
                    <InputLine  label='C4.7.2.3结果值：' >
                        <SuffixInput  value={inp?.压油温v ||''} onSave={txt=> setInp({...inp,压油温v: txt || undefined })}>℃</SuffixInput>
                    </InputLine>
                    <InputLine label='C4.7.2.3检验结果'>
                        <SelectHookfork value={ inp?.压油温r ||''}
                                        onChange={e => setInp({ ...inp, 压油温r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
                备注：
                <TextArea  value={inp?.观测备注 ||''} rows={4}
                           onChange={e => setInp({ ...inp, 观测备注: e.currentTarget.value||undefined}) } />
                注：1、未测量或无需测量的，仅填检验结果栏。
                2、其他需记录的测量值和结果值填在备注栏中。
                3、对有多个起升机构的设备，C3.8.1记录主起升机构，其余起升机构记录在备注栏中。
                4、分别抽查主回路、控制回路、电气设备的相间绝缘电阻和对地绝缘电阻，记录其中的最小值。
            </InspectRecordLayout>
        );
    } );

const 默认几何尺寸=[{n:'跨度'},{n:'轨距'},{n:'基距'},{n:'有效悬臂长度L1'},{n:'有效悬臂长度L2'},{n:'主起升高度'},{n:'副起升高度'}];
const config几何尺寸=[['检验项目','n',186],['观测值','o',98],['结果值','v',98],['允许偏差','ad',98]] as Each_ZdSetting[];
const item安全距观=['距固定','距扶手','距出入','垂出入','垂不准','保养距','人险距','输最距'];
const itemA安全距观=['安全距r','输线电压','安距备注','几何表','几何备注','几何表r'];
export const SafetyDistance=
    React.forwardRef(({ children, show ,alone=true}:InternalItemProps,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(item安全距观,itemA安全距观,(par)=>{
            const { 几何表 }=par||{};
            if(!几何表 || 几何表.length<1)   par.几何表=默认几何尺寸;
            return  par;
        });
        const {inp, setInp} = useItemInputControl({ ref });
        const breaks=[140,420,620];
        const headview=<Text variant="h5">
         主要几何尺寸观测值及测量结果记录表；按照一行3个字段录入的：单位为m;
        </Text>;
        const [render几何尺寸]=useTableEditor({breaks, inp, setInp,  headview,
                        config: config几何尺寸, table:'几何表', column:3,  defaultV:默认几何尺寸, noDelAdd:true, fixColumn:1});

        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'附录2：C3.3安全距离，附录3：C3.6几何尺寸'}>
                附录2：C3.3  安全距离观测值及测量结果记录表<br/>
                （1）运动部分与建筑物净距：
                { measurementRender('距固定部分','距固定','m',inp,setInp) }
                { measurementRender('距作何栏杆或扶手','距扶手','m',inp,setInp) }
                { measurementRender('距出入区','距出入','m',inp,setInp) }
                （2）运动部分的下界限线：
                { measurementRender('与下方的一般出入区之间的垂直距离','垂出入','m',inp,setInp) }
                { measurementRender('与通常不准人出入的下方的固定或活动部分及与栏杆顶部的垂直距离','垂不准','m',inp,setInp) }
                (3)运动部分的上界限线与上方的固定或活动部分之间的垂直距离：
                { measurementRender('在保养区域和维修平台等处的距离','保养距','m',inp,setInp) }
                { measurementRender('如果不会对人员产生危险时的距离','人险距','m',inp,setInp) }
                (4)与输电线的最小距离，线路电压（       ）kv：
                <InputLine  label='线路电压：' >
                    <SuffixInput  value={inp?.输线电压 ||''} onSave={txt=> setInp({...inp,输线电压: txt || undefined })}>kv</SuffixInput>
                </InputLine>
                { measurementRender(`(4)与输电线的最小距离，线路电压（${inp?.输线电压||''}）kv`,'输最距','m',inp,setInp) }
                <InputLine label='附录2：C3.3 安全距离观测量-检验结果'>
                    <SelectHookfork value={ inp?.安全距r ||''}
                                    onChange={e => setInp({ ...inp, 安全距r: e.currentTarget.value||undefined}) }/>
                </InputLine>
                备注：
                <TextArea  value={inp?.安距备注 ||''} rows={4}
                           onChange={e => setInp({ ...inp, 安距备注: e.currentTarget.value||undefined}) } />
                注：1、对于不合格的值才需测量和记录，未测量或无需测量的，仅填检验结果栏。
                2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
                <hr/>
                附录3：C3.6  主要几何尺寸观测值及测量结果记录表（适于改造监检）
                {render几何尺寸}
                <InputLine label='附录3：C3.6 主要几何尺寸-检验结果'>
                    <SelectHookfork value={ inp?.几何表r ||''}
                                    onChange={e => setInp({ ...inp, 几何表r: e.currentTarget.value||undefined}) }/>
                </InputLine>
                备注：
                <TextArea  value={inp?.几何备注 ||''} rows={4}
                           onChange={e => setInp({ ...inp, 几何备注: e.currentTarget.value||undefined}) } />
                <Text>
                    注：1、以设计图样要求作为检验结果判定依据。
                    <Text css={{display: 'flex', marginLeft:'2rem'}}>
                        2、有多个起升机构的，其余机构的起升高度测量值和结果填在备注栏中。<br/>
                        3、未测量或无需测量的，仅填检验结果栏。
                    </Text>
                </Text>
            </InspectRecordLayout>
        );
    } );

const item受力梯子=['力面厚1','力面厚2','力面厚3',];
const itemA受力梯子=['力面厚设','力面厚v','力面厚r','力面备注','梯子表','梯子表r','梯子备注'];
const config梯子走台=[['检验项目','n',390],['单位','u',49],['观测值','o',74,(obj,setObj)=>{
        return <SuffixInput  value={obj?.o ||''} onSave={txt=> setObj({...obj,o: txt || undefined })}>{obj?.u}</SuffixInput>
    }],['结果值','v',64]] as Each_ZdSetting[];
export const 默认梯子走台=[{n:'通道、斜梯和平台的净空高度',u:'m'},{n:'运动部分附近的通道和平台的净宽度',u:'m'},{n:'如果设有扶手或者栏杆，在高度不超过0.6m的范围内，通道的净宽度',u:'m'},
    {n:'固定部分之间的通道净宽度',u:'m'},{n:'起重机械结构件内部很少使用的进出通道最小净空高度',u:'m'},{n:'内部很少使用的...通道净宽度',u:'m'},{n:'只用于维护保养的平台，其上面的净空高度',u:'m'},
    {n:'通道基面上缝隙长度等于或者大于200mm时，其最大宽度',u:'mm'},{n:'通道区域与裸露动力线，上方距离',u:'m'},{n:'通道区域与裸露动力线，左右距离',u:'m'},{n:'通道区域与裸露动力线，下方距离',u:'m'},
    {n:'斜梯 > 斜梯的倾斜角',u:'°'},{n:'主要斜梯栏杆的间距',u:'m'},{n:'其他斜梯栏杆的间距',u:'m'},{n:'斜梯的一侧靠墙壁时，栏杆高度',u:'m'},{n:'梯级的净宽度',u:'m'},{n:'单个梯级的高度',u:'m'},
    {n:'梯级的进深',u:'m'},{n:'直梯 > 直梯两侧撑杆的间距',u:'m'},{n:'两侧撑杆之间梯级宽度',u:'m'},{n:'梯级的间距',u:'m'},{n:'梯级与固定结构件距离',u:'m'},
    {n:'从高处有跌落危险的直梯，护圈直径',u:'m'},{n:'直梯的两边撑杆比最上一个梯级高出的高度',u:'m'},{n:'栏杆的垂直高度',u:'m'},{n:'踢脚板高度',u:'m'},{n:'中间横杆，其与踢脚板或者栏杆的距离',u:'m'},
    {n:'对净高不超过1.3m的通道，栏杆的高度',u:'m'},{n:'沿建筑物墙壁或者实体墙结构设有的通道，允许用扶手代替栏杆，扶手的中断长度',u:'m'},{n:'护绳(如钢丝绳、链条)，高度',u:'m'} ];
export const Thickness=
    React.forwardRef(({ children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(item受力梯子,itemA受力梯子,(par)=>{
            const { 梯子表 }=par||{};
            if(!梯子表 || 梯子表.length<1)   par.梯子表=默认梯子走台;
            return  par;
        });
        const {inp, setInp} = useItemInputControl({ ref });
        const breaks=[140,420,620];
        const headview=<Text variant="h5">
            主要几何尺寸观测值及测量结果记录表；按照一行3个字段录入的：单位为m;
        </Text>;
        const [render梯子走台]=useTableEditor({breaks, inp, setInp,  headview,
            config: config梯子走台, table:'梯子表', column:3,  defaultV:默认梯子走台, noDelAdd:true, fixColumn:2});
        const aveThick=calcAverageArrObj([inp?.力面厚1o,inp?.力面厚2o,inp?.力面厚3o],(row)=>row,2);
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'附录4：C3.7.3主要受力结构，附录5：C3.7.4梯子、走台和栏杆'}>
                附录4：C3.7.3  主要受力结构件断面有效厚度观测值及测量结果记录表<br/>
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
                    <InputLine label='C3.7.3检验结果'>
                        <SelectHookfork value={ inp?.力面厚r ||''}
                                        onChange={e => setInp({ ...inp, 力面厚r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
                备注：
                <TextArea  value={inp?.力面备注 ||''} rows={2}
                           onChange={e => setInp({ ...inp, 力面备注: e.currentTarget.value||undefined}) } />
                注：1、对于不合格的值才需测量和记录，仅记录有效厚度与设计值之比最小值之处的测量值。
                2、未测量或无需测量的，仅填检验结果栏。
                <hr/>
                附录5：C3.7.4 梯子、走台和栏杆观测值及测量结果记录表
                {render梯子走台}
                <InputLine label='C3.7.4梯子、走台和栏杆观测测量-检验结果'>
                    <SelectHookfork value={ inp?.梯子表r ||''}
                                    onChange={e => setInp({ ...inp, 梯子表r: e.currentTarget.value||undefined}) }/>
                </InputLine>
                备注：
                <TextArea  value={inp?.梯子备注 ||''} rows={4}
                           onChange={e => setInp({ ...inp, 梯子备注: e.currentTarget.value||undefined}) } />
                <Text>
                    注：1、对于不合格的值才需测量和记录，未测量或无需测量的，仅填检验结果栏。
                    <Text css={{display: 'flex', marginLeft:'2rem'}}>
                        2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
                    </Text>
                </Text>
            </InspectRecordLayout>
        );
    } );

const config起升高度=[['次数','n',60],['显示屏数值H1','H1',122],['H2','H2',70],['测量值h1','h1',86],['h2','h2',70],['计算值H','H',86],['h','h',70]] as Each_ZdSetting[];
export const 默认起升高度=[{n:'1次'},{n:'2次'},{n:'3次'}];
const item起升高度=['偏斜','风速'] as any;
const itemA起升高度=['起高表','起高表r','行程表','行程表r','偏斜r','风速r','监控备注'];
const config运行行程=[['类别','n',100],['显示屏数值S1','S1',120],['S2','S2',88],['测量值s','s',88],['计算值S','S',88]] as Each_ZdSetting[];
export const 默认运行行程=[{n:'(1)小车'},{n:'(2)大车'}];
export const Monitoring=
    React.forwardRef(({ children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(item起升高度,itemA起升高度,(par)=>{
            const { 起高表,行程表 }=par||{};
            if(!起高表)   par.起高表=默认起升高度.map(r=>{return {}});       //需剔除掉固定显示数据的'n'字段：避免保存给数据库！。
            if(!行程表)   par.行程表=默认运行行程.map(r=>{return {}});
            return  par;
        });
        const {inp, setInp} = useItemInputControl({ ref });
        const breaks=[140,420,620];
        const headview=<Text variant="h5">
            C4.2.2.5.1.1 起升高度（m)；按照一行6个字段录入的：单位为m;
        </Text>;
        const [render起高表]=useTableEditor({breaks, inp, setInp,  headview,
            config: config起升高度, table:'起高表', column:3,  defaultV:默认起升高度, noDelAdd:true, fixColumn:1});
        const headvw2=<Text variant="h5">
            C4.2.2.5.1.2 运行行程（m)；按照一行4个字段录入的：单位为m;
        </Text>;
        const [render行程表]=useTableEditor({breaks, inp, setInp,  headview:headvw2,
            config: config运行行程, table:'行程表', column:3,  defaultV:默认运行行程, noDelAdd:true, fixColumn:1});

        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'附录6：C4.2.2.5和C4.9.7安全监控管理系统验证'}>
                附录6：C4.2.2.5和C4.9.7安全监控管理系统参数验证表<br/>
                序号1，项目编号 C4.2.2.5.1.1 起升高度（m)：
                {render起高表}
                <InputLine label='C4.2.2.5.1.1 起升高度（m)-检验结果'>
                    <SelectHookfork value={ inp?.起高表r ||''}
                                    onChange={e => setInp({ ...inp, 起高表r: e.currentTarget.value||undefined}) }/>
                </InputLine>
                C4.2.2.5.1.2 运行行程（m)：
                {render行程表}
                <InputLine label='C4.2.2.5.1.2 运行行程（m)-检验结果'>
                    <SelectHookfork value={ inp?.行程表r ||''}
                                    onChange={e => setInp({ ...inp, 行程表r: e.currentTarget.value||undefined}) }/>
                </InputLine>
                序号3： C4.2.2.5.1.4 运行偏斜（m)：
                <LineColumn column={2} >
                    <InputLine  label='大车-显示屏数值：' >
                        <SuffixInput  value={inp?.偏斜o ||''} onSave={txt=> setInp({...inp,偏斜o: txt || undefined })}>mm</SuffixInput>
                    </InputLine>
                    <InputLine  label='大车-测量值：' >
                        <SuffixInput  value={inp?.偏斜v ||''} onSave={txt=> setInp({...inp,偏斜v: txt || undefined })}>mm</SuffixInput>
                    </InputLine>
                    <InputLine label='C4.2.2.5.1.4 运行偏斜-检验结果'>
                        <SelectHookfork value={ inp?.偏斜r ||''}
                                        onChange={e => setInp({ ...inp, 偏斜r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
                序号4： C4.9.7.1风速：
                <LineColumn column={2} >
                    <InputLine  label='风速-显示屏数值：' >
                        <SuffixInput  value={inp?.风速o ||''} onSave={txt=> setInp({...inp,风速o: txt || undefined })}>mm</SuffixInput>
                    </InputLine>
                    <InputLine  label='风速-测量值：' >
                        <SuffixInput  value={inp?.风速v ||''} onSave={txt=> setInp({...inp,风速v: txt || undefined })}>mm</SuffixInput>
                    </InputLine>
                    <InputLine label='C4.9.7.1风速-检验结果'>
                        <SelectHookfork value={ inp?.风速r ||''}
                                        onChange={e => setInp({ ...inp, 风速r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
                备注：
                <TextArea  value={inp?.监控备注 ||''} rows={4}
                           onChange={e => setInp({ ...inp, 监控备注: e.currentTarget.value||undefined}) } />
                <Text>
                    注：1、显示值和测量值不大于5%时，检验结果符合要求。
                    <Text css={{display: 'flex', marginLeft:'2rem'}}>
                        2、未检查或无需检验的，仅填检验结果栏。
                    </Text>
                </Text>
            </InspectRecordLayout>
        );
    } );
const config吊具回转=[['次数','n',150],['圈数(r)','d',110],['时间(min)','t',120]] as Each_ZdSetting[];
const config主起升速=[['次数','n',132],['距离(m)','d',110],['时间(min)','t',110]] as Each_ZdSetting[];
const 默认主起升速=[{n:'1'},{n:'2'},{n:'3'},{n:'4'}];
const itemA主起升速=['起升速表','起升速表r','主降速表','主降速表r','大车运','大车运r','小车运','小车运r','吊回速','吊回速r','速度备注'];
export const Speed=
    React.forwardRef(({ children, show ,alone=true}:InternalItemProps,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(null,itemA主起升速,(par)=>{
            const { 起升速表,主降速表,大车运,小车运,吊回速, }=par;
            if(!起升速表)   par.起升速表=默认主起升速;       //需剔除掉固定显示数据的'n'字段：避免保存给数据库！。
            if(!主降速表)   par.主降速表=默认主起升速;
            if(!大车运)   par.大车运=默认主起升速;
            if(!小车运)   par.小车运=默认主起升速;
            if(!吊回速)   par.吊回速=默认主起升速.slice(0,3);
            return  par;
        });
        const {inp, setInp} = useItemInputControl({ ref });
        const breaks=[140,420,620];
        const headview=<Text variant="h5">
            主起升机构起升速度：
        </Text>;
        const [render主起升速]=useTableEditor({breaks, inp, setInp,  headview,
            config: config主起升速, table:'起升速表', column:3,  defaultV:默认主起升速, maxRf:2});
        const headvw2=<Text variant="h5">
            主起升机构下降速度：
        </Text>;
        const [render主降速表]=useTableEditor({breaks,inp,setInp,headview:headvw2,
            config: config主起升速, table:'主降速表', column:3,  defaultV:默认主起升速, maxRf:2});
        const headvw3=<Text variant="h5">
            大车运行速度：
        </Text>;
        const [render大车运表]=useTableEditor({breaks,inp,setInp,headview:headvw3,
            config: config主起升速, table:'大车运', column:3,  defaultV:默认主起升速, maxRf:2});
        const headvw4=<Text variant="h5">
            小车运行速度：
        </Text>;
        const [render小车运表]=useTableEditor({breaks,inp,setInp,headview:headvw4,
            config: config主起升速, table:'小车运', column:3,  defaultV:默认主起升速, maxRf:2});
        const headvw5=<Text variant="h5">
            吊具回转速度：
        </Text>;
        const [render吊具回转]=useTableEditor({breaks,inp,setInp,headview:headvw5,
            config: config吊具回转, table:'吊回速', column:3,  defaultV:默认主起升速.slice(0,3), maxRf:2});

        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'附录7：C4.3.2.1各机构运行速度记录表'}>
                附录7：C4.3.2.1各机构运行速度记录表<br/>
                {render主起升速}
                <InputLine label='主起升机构起升速度-检验结果'>
                    <SelectHookfork value={ inp?.起升速表r ||''}
                                    onChange={e => setInp({ ...inp, 起升速表r: e.currentTarget.value||undefined}) }/>
                </InputLine>
                {render主降速表}
                <InputLine label='主起升机构下降速度-检验结果'>
                    <SelectHookfork value={ inp?.主降速表r ||''}
                                    onChange={e => setInp({ ...inp, 主降速表r: e.currentTarget.value||undefined}) }/>
                </InputLine>
                {render大车运表}
                <InputLine label='大车运行速度-检验结果'>
                    <SelectHookfork value={ inp?.大车运r ||''}
                                    onChange={e => setInp({ ...inp, 大车运r: e.currentTarget.value||undefined}) }/>
                </InputLine>
                {render小车运表}
                <InputLine label='小车运行速度-检验结果'>
                    <SelectHookfork value={ inp?.小车运r ||''}
                                    onChange={e => setInp({ ...inp, 小车运r: e.currentTarget.value||undefined}) }/>
                </InputLine>
                {render吊具回转}
                <InputLine label='吊具回转速度-检验结果'>
                    <SelectHookfork value={ inp?.吊回速r ||''}
                                    onChange={e => setInp({ ...inp, 吊回速r: e.currentTarget.value||undefined}) }/>
                </InputLine>
                备注：
                <TextArea  value={inp?.速度备注 ||''} rows={5}
                           onChange={e => setInp({ ...inp, 速度备注: e.currentTarget.value||undefined}) } />
                注：1、对于起升速度、下降速度、大车运行速度、小车运行速度，电动单梁起重机测4次计算平均值，轮胎式集装箱门式起重机和岸边集装箱起重机测3次计算平均值，其余起重机测1次。
                2、对于产品标准和设计文件同时对速度允许偏差都有规定的，以较严规定作为检验结果判定依据。对于产品标准和设计文件对速度允许偏差都没有规定的，相应的速度仅测量，不作检验结果判定。
                3、对于多起升机构或多小车运行机构的起重机，仅记录其中1个主起升机构和主小车运行机构的速度。对于其余起升机构和小车运行机构的速度测量值，记录在备注栏。
                4、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
                5、防爆型桥门式起重机的速度应符合TSG51-2023 A6.3.3的规定。
                6、未检查或无需检验的，仅填检验结果栏。
            </InspectRecordLayout>
        );
    } );
export const guide机构同步=[['同一小车起升机构','同小构'],['不同小车起升机构','不小构'],['不同小车运行机构','不小行'],['其他机构','他机构']];
const itemA制动距离=['主制距','主制距r','副制距','副制距r','制距备注','同小构','不小构','不小行','他机构','同步性r','同步备注'];
export const Braking=
    React.forwardRef(({ children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(null,itemA制动距离,);
        const {inp, setInp} = useItemInputControl({ ref });
        const breaks=[230,510,820,1100,1320];     //依据内容长度和column数目标作微调
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'附录8：C4.3.2.2起升机构制动距离，附录9：C4.3.2.3各机构同步性能'}>
                附录8：C4.3.2.2起升机构制动距离记录表, 单位：mm<br/>
                { [['主起升机构','主制距','主制距r'],['副起升机构','副制距','副制距r']].map(([title,field,resFd], i:number) => {
                    return  <React.Fragment key={i}>
                        项目 {'>'} {title}：
                        <LineColumn column={5} breaks={breaks} >
                            { (new Array(3)).fill(null).map(( _,  w:number) => {
                                return <InputLine key={w} label={`次数${w+1}，制动距离：`}>
                                        <SuffixInput  value={inp?.[field]?.[w] ||''} onSave={txt=>arraySetInp(field,w,txt,inp,setInp)}>mm</SuffixInput>
                                    </InputLine>;
                            }) }
                            <InputLine  label='平均制动距离：'>
                                <Text>{calcAverageArrObj(inp?.[field],a=>a,2,3)}mm</Text>
                            </InputLine>
                            <InputLine label={title+' > 制动距离-检验结果'}>
                                <SelectHookfork value={ inp?.[resFd] ||''}
                                    onChange={e => setInp({ ...inp, [resFd]: e.currentTarget.value||undefined}) }/>
                            </InputLine>
                        </LineColumn>
                    </React.Fragment>;
                }) }
                备注：
                <TextArea  value={inp?.制距备注 ||''} rows={2}
                           onChange={e => setInp({ ...inp, 制距备注: e.currentTarget.value||undefined}) } />
                注：1、对于标准和设计文件同时对制动距离都有规定的，以较严规定作为检验结果判定依据。对于标准和设计文件对制动距离都没有规定的，相应的制动距离可不测量。
                2、对于多起升机构的起重机，仅记录其中1个主起升机构和1个副起升机构制动距离。对于其余起升机构制动距离，记录在备注栏。
                3、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
                4、未检查或无需检验的，仅填检验结果栏。
                <hr/>
                附录9：C4.3.2.3各机构同步性能记录表<br/>
                { guide机构同步.map(([title,field,resFd], i:number) => {
                    return  <React.Fragment key={i}>
                        项目 {'>'} {title}：
                        <ColumnWidth clnWidth={320} >
                            <InputLine  label='单位：'>
                                <Input  value={inp?.[field]?.u ||''}
                                        onChange={e => setInp({ ...inp, [field]:{...inp?.[field], u: e.currentTarget.value||undefined} }) } />
                            </InputLine>
                            <InputLine  label='机构1：'>
                                <div css={{display: 'flex',alignItems: 'center'}}>
                                    <Input  value={inp?.[field]?.fu ||''}
                                            onChange={e => setInp({ ...inp, [field]:{...inp?.[field], fu: e.currentTarget.value||undefined} }) } />
                                     /
                                    <Input  value={inp?.[field]?.fd ||''}
                                            onChange={e => setInp({ ...inp, [field]:{...inp?.[field], fd: e.currentTarget.value||undefined} }) } />
                                </div>
                            </InputLine>
                            <InputLine  label='机构2：'>
                                <div css={{display: 'flex',alignItems: 'center'}}>
                                    <Input  value={inp?.[field]?.su ||''}
                                            onChange={e => setInp({ ...inp, [field]:{...inp?.[field], su: e.currentTarget.value||undefined} }) } />
                                     /
                                    <Input  value={inp?.[field]?.sd ||''}
                                            onChange={e => setInp({ ...inp, [field]:{...inp?.[field], sd: e.currentTarget.value||undefined} }) } />
                                </div>
                            </InputLine>
                            <ColumnWidth clnWidth={160} >
                                <InputLine  label='偏差测量值：'>
                                    <Input  value={inp?.[field]?.m ||''}
                                            onChange={e => setInp({ ...inp, [field]:{...inp?.[field], m: e.currentTarget.value||undefined} }) } />
                                </InputLine>
                                <InputLine  label='偏差允计值：'>
                                    <Input  value={inp?.[field]?.l ||''}
                                            onChange={e => setInp({ ...inp, [field]:{...inp?.[field], l: e.currentTarget.value||undefined} }) } />
                                </InputLine>
                            </ColumnWidth>
                        </ColumnWidth>
                    </React.Fragment>;
                }) }
                <InputLine label='C4.3.2.3各机构同步性能记录表-检验结果'>
                    <SelectHookfork value={ inp?.同步性r ||''}
                                    onChange={e => setInp({ ...inp, 同步性r: e.currentTarget.value||undefined}) }/>
                </InputLine>
                备注：
                <TextArea  value={inp?.同步备注 ||''} rows={4}
                           onChange={e => setInp({ ...inp, 同步备注: e.currentTarget.value||undefined}) } />
                <Text>注：1、以设计文件偏差允计值单位为准，测量相应的偏差值。
                    2、测量高度或行程时，单位填mm；测量速度时，单位填m/min。
                    3、未检查或无需检验的，仅填检验结果栏。
                </Text>
            </InspectRecordLayout>
        );
    } );
const itemA静态刚度=['载标高1','载标高2','额载标1','额载标2','额载变1','额载变2','上拱翘1','上拱翘2','要静刚','要上拱','要静刚r','要上拱r','静刚备注'];
export const Stiffness=
    React.forwardRef(({ children, show ,alone=true}:InternalItemProps,  ref
    ) => {
        const theme = useTheme();
        const [getInpFilter]=useMeasureInpFilter(null,itemA静态刚度,);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'附录10：C4.3.2.5主梁静态刚度C4.4.2.4主梁跨中上拱度'}>
                附录10  C4.3.2.5 主梁静态刚度、C4.4.2.4主梁跨中上拱度和有效悬臂处上翘度测量记录<br/>
                <SimpleImg url={Img_Jgd}/>
                测量工况: 空载标高h(静载试验后)：<br/>
                { [['主梁1','载标高1'],['主梁2','载标高2']].map(([title,field], i:number) => {
                    return  <React.Fragment key={i}>
                        空载标高 {'>'} {title} 各测量点：
                        <div css={{display: 'flex',flexWrap: 'wrap',justifyContent:'space-around',alignItems:'center'}}>
                            { [['D','d'],['A','a'],['C','C'],['B','b'],['E','e']].map(([name,tag], f:number) => {
                            return <div key={f} css={{ display: 'flex',alignItems:'center',
                                            minWidth: 'min(30vmin, 7rem)', maxWidth: 'min(35vmin, 13rem)',
                                            [theme.mediaQueries.md]: {minWidth: 'min(30vmin, 11rem)', maxWidth: 'min(40vmin, 19rem)'}
                                        }}>
                                    {name}
                                    <Input  value={inp?.[field]?.[tag] ||''}
                                        onChange={e => setInp({ ...inp, [field]:{...inp?.[field], [tag]: e.currentTarget.value||undefined} }) }/>
                                </div>;
                            }) }
                        </div>
                    </React.Fragment>;
                }) }
                { [['额载标高h\'','额载标'],['额载C（D E)点变形量△h','额载变'],['上拱度和上翘度','上拱翘']].map(([title,field], i:number) => {
                    return <React.Fragment key={i}>
                            { [['主梁1','1'],['主梁2','2']].map(([point,suf], g:number) => {
                                return <React.Fragment key={g}>
                                    工况:{title} {'>'} {point} 各点：
                                    <div css={{display: 'flex',flexWrap: 'wrap',justifyContent:'space-around',alignItems:'center'}}>
                                        { [['D','d'],['C','C'],['E','e']].map(([name,tag], f:number) => {
                                            return <div key={f} css={{ display: 'flex',alignItems:'center',
                                                        minWidth: 'min(30vmin, 7rem)', maxWidth: 'min(35vmin, 13rem)',
                                                        [theme.mediaQueries.md]: {minWidth: 'min(30vmin, 11rem)', maxWidth: 'min(40vmin, 19rem)'}
                                                    }}>
                                                {name}
                                                <Input  value={inp?.[field+suf]?.[tag] ||''}
                                                     onChange={e => setInp({ ...inp, [field+suf]:{...inp?.[field+suf], [tag]: e.currentTarget.value||undefined} }) }/>
                                            </div>;
                                        }) }
                                    </div>
                                </React.Fragment>;
                            }) }
                    </React.Fragment>;
                }) }
                { [['C4.3.2.5','要静刚','静刚度要求值'],['C4.4.2.4','要上拱','上拱度和上翘度要求值']].map(([title,field,desc], i:number) => {
                    return <React.Fragment key={i}>
                        {title} {'>'} {desc} 各点：
                        <div css={{display: 'flex',flexWrap: 'wrap',justifyContent:'space-around',alignItems:'center'}}>
                            { [['D','d'],['C','C'],['E','e']].map(([name,tag], f:number) => {
                                return <div key={f} css={{ display: 'flex',alignItems:'center',
                                    minWidth: 'min(30vmin, 7rem)', maxWidth: 'min(35vmin, 13rem)',
                                    [theme.mediaQueries.md]: {minWidth: 'min(30vmin, 11rem)', maxWidth: 'min(40vmin, 19rem)'}
                                }}>
                                    {name}
                                    <Input  value={inp?.[field]?.[tag] ||''}
                                            onChange={e => setInp({ ...inp, [field]:{...inp?.[field], [tag]: e.currentTarget.value||undefined} }) }/>
                                </div>;
                            }) }
                            <InputLine label='检验结果'>
                                <SelectHookfork value={ inp?.[field+'r'] ||''}
                                                onChange={e => setInp({ ...inp, [field+'r']: e.currentTarget.value||undefined}) }/>
                            </InputLine>
                        </div>
                    </React.Fragment>;
                }) }
                备注：
                <TextArea  value={inp?.静刚备注 ||''} rows={6}
                           onChange={e => setInp({ ...inp, 静刚备注: e.currentTarget.value||undefined}) } />
                <Text>注：1、h、h' 为各相应测点的相应测点的相对标高读数，标尺读数小的一端朝下。
                    2、对于产品标准和设计文件同时对静态刚度、上拱度或上翘度上都有规定的，以较严规定作为检验结果判定依据。对于标准和设计文件都没有规定的，相应的项目可不测量。
                    3、对于C4.4.2.4，以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
                    4、未检查或无需检验的，仅填检验结果栏。
                </Text>
            </InspectRecordLayout>
        );
    } );

const config测点表=[['应变值（με）','μ',150],['应力值（MPa）','M',150]] as Each_ZdSetting[];
const itemA应变应力=['应仪器型','应变片型','应天气','应风速','应温度1','应温度2','应试工况','测点表','_FILE_测点','测点示意','危应第','危工况','安全系数','危结论','应变备注'];
export const StrainStress=
    React.forwardRef(({ children, show ,alone=true,repId,redId,nestMd,refWidth}:InternalItemProps,  ref
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
        const {modified,setModified,} =React.useContext(EditStorageContext) as any;
        const onFinish = React.useCallback(async(upfile: any, del:boolean) => {
            onSure({...inp, '_FILE_测点': upfile});
            !modified && setModified(true);
        }, [inp, modified,onSure,setModified]);
        const [uploadDom]=useUppyUpload({ repId:repId!,
            maxFile:1, onFinish, storeObj: inp?._FILE_测点 ,liveDays:10
        });

        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'附录11：C4.8.1应变应力测试记录表'}>
                附录11：C4.8.1应变应力测试记录表<br/>
                <div css={{display: 'flex',flexWrap: 'wrap',justifyContent:'space-around',alignItems:'center'}}>
                { [['仪器型号','应仪器型',undefined,30],['应变片型式','应变片型',undefined,25],['天气情况','应天气',undefined,35],['风速','应风速','m/s'],['温度','应温度1','℃'],['温度','应温度2']
                    ].map(([title,field,unit,size]:any, i:number) => {
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
                  <Input value={inp?.测点示意 ||''}
                      onChange={e => setInp({...inp,测点示意: e.currentTarget.value||undefined }) } />
                </InputLine>
                测点示意图：
                {uploadDom}
                测试结果：
                <LineColumn column={2} >
                    <InputLine  label='最危险应力点为第 ：' >
                        <SuffixInput  value={inp?.危应第 ||''} onSave={txt=> setInp({...inp,危应第: txt || undefined })}>点</SuffixInput>
                    </InputLine>
                    <InputLine  label='危险点-工况：' >
                        <Input  value={inp?.危工况 ||''}
                                onChange={e => setInp({ ...inp, 危工况: e.currentTarget.value||undefined }) }/>
                    </InputLine>
                    <InputLine  label='安全系数n=' >
                        <Input  value={inp?.安全系数 ||''}
                                onChange={e => setInp({ ...inp, 安全系数: e.currentTarget.value||undefined }) }/>
                    </InputLine>
                    <InputLine  label='测试结论：' >
                        <Input  value={inp?.危结论 ||''}
                                onChange={e => setInp({ ...inp, 危结论: e.currentTarget.value||undefined }) }/>
                    </InputLine>
                </LineColumn>
                备注：
                <TextArea  value={inp?.应变备注 ||''} rows={3}
                           onChange={e => setInp({ ...inp, 应变备注: e.currentTarget.value||undefined}) } />
                <Text>
                    注：可另附记表单。无需检验的，仅填测试结论栏。
                </Text>
            </InspectRecordLayout>
        );
    } );
export const config附设装置=[['附表序号','n',35],['设备种类','y',150,(obj,setObj)=>{
        return <Select inputSize="md" css={{minWidth:'140px',fontSize:'1.3rem',padding:'0 1rem'}}
              value={obj?.y ||''} onChange={e => setObj({ ...obj, y: e.currentTarget.value||undefined}) }>
            <option></option> <option>桥架型起重机、臂架型起重机、电动葫芦等起重设备</option> <option>升降机等登机设备</option> </Select>
        }],['设备名称','t',80],['设备型号','m',70],['额定起重量','Q',50],
                ['产品编号','p',68],['制造单位','u',112],['检验结果','r',35,(obj,setObj)=>{
            return <SelectHookfork value={ obj?.r ||''} onChange={e => setObj({ ...obj, r: e.currentTarget.value||undefined}) }/>
        }],['备注','Z',80]] as Each_ZdSetting[];
const 默认附设装置=[{n:'1',y:'桥架型起重机、臂架型起重机、电动葫芦等起重设备'},{n:'2',y:'桥架型起重机、臂架型起重机、电动葫芦等起重设备'},{n:'3',y:'升降机等登机设备'}];
export const config漏磁检=[['测量点','n',100],['左端','l',92],['中间','m',92],['右端','R',92],['结果值','r',92]] as Each_ZdSetting[];
const 默认漏磁检=[{n:'2mm'},{n:'50mm'},{n:'100mm'}];
const itemA漏磁检=['漏磁表','漏磁表r','漏磁备注','附设表',];
export const Magnetic=
    React.forwardRef(({ children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const theme = useTheme();
        const [getInpFilter]=useMeasureInpFilter(null,itemA漏磁检,(par)=>{
            const { 漏磁表,附设表,}=par;
            if(!漏磁表)   par.漏磁表=默认漏磁检;       //需剔除掉固定显示数据的'n'字段：避免保存给数据库！。
            if(!附设表)   par.附设表=默认附设装置;          //【特别注意】不能用附设装需改名附设表，同名字导致错误不好解决不易发现，
            return  par;
        });
        const {inp, setInp} = useItemInputControl({ ref });
        const breaks=[210,352,620,960];
        const headview=<Text variant="h5">
            附录12：C4.9.8.1漏磁检查记录表：单位：Gs
        </Text>;
        const [render漏磁检]=useTableEditor({breaks, inp, setInp,  headview,
            config: config漏磁检, table:'漏磁表', column:4,  defaultV:默认漏磁检, noDelAdd:true, fixColumn:1,maxRf:3});

        const headvw2=<Text variant="h5">
          附录14， C3.4附设装置检验项目：
        </Text>;
        const breaks2=[280,620];
        const editAs=(obj:any, setObj:React.Dispatch<React.SetStateAction<any>>, seq:number | null)=>{
           const table='附设表';
           return <Layer elevation={"sm"} css={{display: 'flex',justifyContent: 'center',flexDirection: 'column',width: '-webkit-fill-available',
                             [theme.mediaQueries.md]: {flexDirection: 'row',padding:'0.25rem'}
                }}>
               {seq===null? '新' : seq!+1}
               <div className="editLinc" css={{width: '-webkit-fill-available'}}>
                   <LineColumn className="editItems" column={3} >
                       {(config附设装置).map(([title,tag, _, callback]:any,i:number) => {
                           if(tag==='Z')  return  <React.Fragment key={i}></React.Fragment>;
                           else return (
                               <InputLine key={i} label={title+'：'}
                                          css={{ "& .InputLine__Head": {alignItems: 'center'} }}
                               >
                                   { callback ? callback(obj,setObj)
                                       :
                                       <Input value={obj?.[tag] ||''}
                                              onChange={e => {
                                                  setObj({...obj, [tag]: (e.currentTarget.value||undefined)});
                                              } } />
                                   }
                               </InputLine>
                           );
                       } )  }
                   </LineColumn>
                   备注：
                   <TextArea  value={obj?.Z ||''} rows={3}
                              onChange={e => setObj({ ...obj, Z: e.currentTarget.value||undefined}) } />
                   <Button onPress={() => {
                       if(seq !== null) {
                           inp?.[table]?.splice(seq, 1, obj);    //替换掉的
                           setInp({ ...inp, [table]: [...inp?.[table]] });
                       }
                       else if(inp?.[table]?.length>0){
                           inp?.[table]?.splice(inp?.[table]?.length, 0, obj);    //尾巴加
                           setInp({ ...inp, [table]: [...inp?.[table]] });
                       }
                       else  setInp({ ...inp, [table]: [obj] });
                   } }
                   >{(inp?.[table]?.length>0 && seq!==null)? `改一组就确认`: `新增一组`}</Button>
               </div>
           </Layer>;
        };
        const [render附设装置]=useTableEditor({breaks:breaks2,inp,setInp,
            headview:headvw2, config: config附设装置, table:'附设表', column:2,  defaultV:默认附设装置, editAs,maxRf:1});

        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'附录12：C4.9.8.1漏磁检查,附录14：C3.4附设装置检验'}>
                {render漏磁检}
                <InputLine label='附录12：C4.9.8.1漏磁检查记录表-检验结果'>
                    <SelectHookfork value={ inp?.漏磁表r ||''}
                                    onChange={e => setInp({ ...inp, 漏磁表r: e.currentTarget.value||undefined}) }/>
                </InputLine>
                备注：
                <TextArea  value={inp?.漏磁备注 ||''} rows={2}
                           onChange={e => setInp({ ...inp, 漏磁备注: e.currentTarget.value||undefined}) } />
                注：未检查或无需检验的，仅填检验结果栏。<hr/>
                附录14   C3.4附设装置检验项目<br/>
                附表14-1 桥架型起重机、臂架型起重机、电动葫芦等起重设备:
                <Table css={{borderCollapse: 'collapse'}}>
                    <TableHead>
                        <TableRow><CCell>序号</CCell><CCell>检验内容</CCell></TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow><CCell>1</CCell><Cell>金属结构无明显可见的损伤、缺陷。</Cell></TableRow>
                        <TableRow><CCell>2</CCell><Cell>各主要零部件和电气设备无明显可见的损伤、缺陷。</Cell></TableRow>
                        <TableRow><CCell>3</CCell><Cell>空载试验，操纵系统动作可靠、准确，各机构运行正常，无异常噪声等现象；起升高度限位、运行行程限位、幅度限位等安全保护装置动作可靠、准确。急停开关功能正常。</Cell></TableRow>
                    </TableBody>
                </Table>
                附表14-3 升降机等登机设备:
                <Table css={{borderCollapse: 'collapse'}}>
                    <TableHead>
                        <TableRow><CCell>序号</CCell><CCell>检验内容</CCell></TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow><CCell>1</CCell><Cell>金属结构无明显可见的损伤、缺陷。</Cell></TableRow>
                        <TableRow><CCell>2</CCell><Cell>吊笼门应当能够完全遮蔽开口，并且配备机械锁在运行状态下门不能被打开；所有吊笼门都处于关闭位置时，吊笼才能启动和保持运行。</Cell></TableRow>
                        <TableRow><CCell>3</CCell><Cell>层门应与吊笼电气或机械联锁，只有在吊笼底板在登机平台时，该平台的层门方可打开。所有层门处于关闭和锁紧位置时，吊笼才能启动和保持运行。</Cell></TableRow>
                        <TableRow><CCell>4</CCell><Cell>空载试验，操纵系统动作可靠、准确，各机构运行正常，无异常噪声等现象；限位开关、极限开关等安全保护装置动作可靠、准确。急停开关功能正常。</Cell></TableRow>
                    </TableBody>
                </Table>
                {render附设装置}
                注：对于附表14三个表，无需检验的，仅填检验结果栏。可另附表单。
            </InspectRecordLayout>
        );
    } );
/**前一个版本URL后加?from=2.1.2（4）来定位滚动到最尾部的独立新编辑器，感觉？不如直接在内容位置扩充编辑器。
 * */
export const config复检表=[['类别','c',30],['编号','no',84],['不合格内容','b',150],['复检结果','rs',50,(obj,setObj)=>{
    return <SelectHookfork value={ obj?.rs ||''} onChange={e => setObj({ ...obj, rs: e.currentTarget.value||undefined}) }/>
}],['复检日期','d',65,(obj,setObj)=>{
    return <Input  value={obj?.d ||''}  type='date' onChange={e => setObj({ ...obj, d: e.currentTarget.value}) } />
}]] as Each_ZdSetting[];
export const ItemRecheckResult=
    React.forwardRef((
        { children, show ,alone=true,repId,verId}:InternalItemProps,  ref
    ) => {
        const theme= useTheme();
        // const qs= queryString.parse(window.location.search);

        const impressionismAs =React.useMemo(() => {
            return setupItemAreaRoute({verId:verId!, repId:repId!, theme});
        }, [verId, repId, theme]);
        // const {renderIspContent} =useLikeCraneSupervision({itRes:orc,ItemArs:impressionismAs?.Item, model:'CR-JJ',ver:verId, repNo:`${repId}`});
        const getInpFilter = React.useCallback((par: any) => {
            const {unq} =par||{};
            return {unq};
        }, []);
        const {inp, setInp} = useItemInputControl({ ref });
        const {storage, setStorage} =React.useContext(EditStorageContext) as any;
        // const itRes =React.useMemo(()=>itemResultUnqualified(storage,inspectionContent), [storage]);
        // const refEdit = React.useRef<HTMLDivElement | null>(null);
        const [_, setSeq] = React.useState<number | null>(null);   //表對象的當前一條。
        // const [obj, setObj] = React.useState({no:'',c:'',b:'',rs:'',d:''});
        React.useEffect(() => {
            let size =inp?.unq?.length;
            setSeq(size>0?  size-1:null);
        }, [inp]);
        // React.useEffect(() => {
        //     let size =inp?.unq?.length;
        //     let index=-1;
        //     inp?.unq?.forEach((value: any, i:number,) =>{
        //         if(value?.no===qs.from)   index=i;
        //     } );
        //     setObj(inp?.unq?.[index]);
        //     setSeq(index);
        // }, [qs.from, inp?.unq]);
        // React.useEffect(() => {
        //     if(refEdit.current)
        //         scrollIntoView(refEdit.current!, {
        //             behavior: 'smooth',
        //             scrollMode: 'if-needed',
        //         });
        // }, [seq,qs.from]);

        const 默认复检表 =React.useMemo(()=>itemResultUnqualified(storage, impressionismAs?.Item,{noCB: 特殊项目编码 }),
            [storage,impressionismAs?.Item]);
        const breaks=[210,352,620,960];
        const headview=<Text variant="h5">
            附录15  检验不合格项目内容
        </Text>;
        //不是真的默认不变的不能用  defaultV:默认复检表,
        const [renderTab]=useTableEditor({breaks, inp, setInp,  headview,
            config: config复检表, table:'unq', column:4, defaultV:默认复检表, noDelAdd:true, fixColumn:2,maxRf:2,saveFixC:true});


        // const editor =React.useMemo(() => {
        //     return <div>
        //         <ButtonRefComp  ref={refEdit} disabled={seq===null}
        //                         onPress={() => {
        //                             inp?.unq?.splice(seq, 1, obj);
        //                             setInp({ ...inp, unq: [...inp?.unq] });
        //                             //if(seq !== null) {。。}  else setInp({ ...inp, unq: [obj] });
        //                         }}>{`改了${qs.from}就确认`}</ButtonRefComp>
        //     </div>;
        // },[qs.from,seq, obj, inp,setInp]);


        //不合格unq表数据生成时机：不合格的报告签字的前一步时 初始化来的。在初检场景看到是动态校验目的前端显示表还未存储到后端数据库。
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'附录15：检验不合格项目内容'} column={0}>
                <Button intent='primary' onPress={() =>{
                    let arrUnq=itemResultUnqualified(storage, impressionismAs?.Item,{noCB: 特殊项目编码 });
                    // let arrUnq22=itRes.failure.map((ts:any, i:number) => { return {no: ts,c: itRes[ts].iClass, b: itRes[ts].fdesc}; });
                    setStorage({...storage, unq:arrUnq});
                }}
                >依据记录来初始化本表默认值</Button>但不能重复初始化！
                <hr/>
                {renderTab}
            </InspectRecordLayout>
        );
    } );
