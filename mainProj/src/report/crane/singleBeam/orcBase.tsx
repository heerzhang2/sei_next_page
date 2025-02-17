/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    InputLine, Input, TextArea, InputDatalist, Text, CheckSwitch, SuffixInput, useTheme,
    LineColumn, Table, TableRow, CCell, TableBody, BlobInputList, Button, Select, useToast,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, SelectHookfork, SelectInput, useItemInputControl, 现场结果选
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {setupItemAreaRoute} from "./orcIspConfig";
import {SimpleImg} from "../../../comp/Image";
import Img_Jgd from "../bridgeDJ/PictureJgd.png";
import {useMedia} from "use-media";
import {assertNamesUnique} from "../../common/eHelper";
import {config观测数据} from "./Regular.O-1";
// import {alltpyeofRep} from "./temp";

const itemA结论=['检验结论','新下检日','检验日期'];
//下结论页面：
export const ItemConclusion=
React.forwardRef((
    { children, show ,alone=true,refWidth}:InternalItemProps,  ref
) => {
    const [getInpFilter]=useMeasureInpFilter(null,itemA结论,);
    const {inp, setInp} = useItemInputControl({ ref });
    return (
        <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                             alone={alone}  label={'五、检验结论'}>
            <Text  variant="h5">
              五、检验结论 (报告下结论)：
            </Text>
            <InputLine  label='五、检验结论' >
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
            <InputLine  label='下次定期检验日期' >
                <Input  value={inp?.新下检日 ||''}  type='date'
                        onChange={e => setInp({ ...inp, 新下检日: e.currentTarget.value}) } />
            </InputLine>
        </InspectRecordLayout>
    );
} );


const render否有附属={
    view:(orc:any)=>{
        const has=!!(orc?.['附属装置名称']);
        return <>{has? '是':'否'}</>
    },
};
const 操作方式选=["地面操作", "司机室操作", "遥控", "操作平台操作", "地面+司机室", "地面+遥控", "遥控+司机室", "地面+遥控+司机室", "其它"];
/**台账snapshot.‘安装单位’等不能直接使用的，要本次最新:易变动。
 * */
export const config设备概况=[
    [['使用单位名称','_$使用单位']],
    [['使用单位地址','_$使用单位地址']],
    [['分支机构名称','_$分支机构']],
    [['分支机构地址','_$分支机构地址']],
    [['使用地点','_$设备使用地点']],
    [['安全管理人员','安全员'],['联系电话','安全员电']],
    [['设备代码','_$设备代码'],['使用登记证编号','_$使用证号']],
    [['单位内编码','_$单位内部编号'],['注册代码','_$注册代码']],
    [['额定起重量','_$额定起重量','t'],['制造日期','_$制造日期']],
    [['主起升机构1额定起重量','_$主升1额起量','t'],['主起升机构2额定起重量','_$主升2额起量','t']],
    [['副起升机构1额定起重量','_$副升1额起量','t'],['副起升机构2额定起重量','_$副升2额起量','t']],
    [['工作级别','_$工作级别'],['跨度','_$跨度','m']],
    [['产品编号','_$出厂编号'],['防爆标志','_$防爆标志']],
    [['易燃易爆物质','_$易燃易爆物'],['使用场所防爆等级','_$场所防爆级']],
    [['起升速度','_$起升速','m/min'],['起升高度',{n:'起升高度',t:'n',u:'m'}]],
    [['大车运行速度','_$大车速度','m/min'],['小车运行速度','_$小车速度','m/min']],
    [['悬臂端有效长度L1','_$悬臂长1','m'],['悬臂端有效长度L2','_$悬臂长2','m']],
    [['操作方式',{n:'操纵方式',t:'l',l:操作方式选}],['作业环境',{n:'作业环境',t:'l',l:['室内','室外','吊运熔融金属','吊运炽热固体','防爆','绝缘']}]],
    [['主起升机构吊具型式','_$主升吊具型'],['主起升机构起升悬挂部件',{n:'主起悬挂',t:'l',l:['钢丝绳','环链','纤维绳','钢铰线','其他']}]],
    [['生产率','_$生产率','t/h'],['检验类别',{r:'首次检验'}]],
    [['投入使用日期','_$投用日期'],['设计使用年限','_$设计年限','年']],
    [['是否有附属装置',undefined,render否有附属],['附属装置名称','_$附属装置名称']],
    [['是否应装监控系统',{n:'应装监控',t:'b'}],['检验时主起升机构吊具型式',{n:'检吊具',t:'l',l:['吊钩','集装箱吊具','抓斗','电磁吸盘','真空吸盘','夹钳',"横梁",'其他']}]],
    [['制造单位生产许可证编号（型式试验备案号）','生产许号'],['制造单位生产许可证许可子项目','制许可子']],
    [['安装单位生产许可证（受理决定书）编号','许可书号'],['安装单位生产许可证许可子项目','施许可子']],
    [['设备联系人','_$设备联系人'],['联系人电话','_$设备联系手机']],
    [['产权单位名称','_$产权单位']],
    [['制造单位名称','_$制造单位']],
    [['改造单位名称','_$改造单位']],
    [['安装单位名称','_$安装单位']],
    [['重大修理单位名称','_$维修单位']],
    [['维保单位名称','_$维保单位']],
    [['整改反馈确认期限',{n:'改反馈期',t:'d'}],['管理部门类型','_$使管部类型']],
    [['下次检验日期','_$新下检日'],['是否流动作业',{n:'流动作业',t:'b'}]],
    [['现场检验条件',{r:'见附录B'}],['是否型式试验样机',{n:'型试样机',t:'b'}]],
    [['检验意见通知书编号','意通知号']],
    [['检验依据',{r:'《起重机械定期检验规则》（TSG Q7015-2016）'}]],
    /*报告接收#3个字段？属于业务层面的，不放在这里*/
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
const itemA设备概况=['概备注'];
//初始化 存储字段
dbName设备概况.forEach(({name}:any, i:number)=> {
    itemA设备概况.push(name);
});
/**注意这里的ref不是窗口<DIV ref={ref}>的哪一个;而是 React.useRef<InternalItemHandResult>(null)类似的传递数据和接口函数的,不是一个东西;
 * */
export const DeviceSurvey=
React.forwardRef((
    { children, show ,alone=true,refWidth}:InternalItemProps,  ref
) => {
    const [getInpFilter]=useMeasureInpFilter(null,itemA设备概况,);
    const {inp, setInp} = useItemInputControl({ ref });
    return (
        <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                             alone={alone}  label={'二、设备概况'}>
            设备概况除了台账外还需要修改的部分:
            <LineColumn  column={4} >
                {           /* 剔除最后一个”备注“要单独处理的 */
                    dbName设备概况.map(({name,desc,cb,type,unit,list} : any, i:number)=> {
                        // if(i>=dbName设备概况.length-1)      return <React.Fragment key={i}></React.Fragment>;
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
                        else if(type==='B')  return  <InputLine key={i} label={desc}>
                            <BlobInputList  value={inp?.[name] ||''} datalist={list}
                                            onListChange={v => setInp({ ...inp, [name]: v || undefined}) } />
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
            <br/>
            { !alone && show &&<>
                    <hr/>
                    <Text variant="h5">
                        三、检验记录
                    </Text>
               </>
            }
        </InspectRecordLayout>
    );
} );

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

const itemA静态刚度=['载标高1','载标高2','额载标1','额载标2','额载变1','额载变2','挠度要','挠检验果'];
export const Stiffness=
    React.forwardRef(({ children, show ,alone=true}:InternalItemProps,  ref
    ) => {
        const theme = useTheme();
        const [getInpFilter]=useMeasureInpFilter(null,itemA静态刚度,);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'附录A 11.3.1.3项 主梁挠度值测量记录'}>
                附录A 11.3.1.3项 主梁挠度值测量记录，单位mm<br/>
                <SimpleImg url={Img_Jgd}/>
                测量工况: 空载标高h(静载试验后)：<br/>
                { [['主梁1','载标高1'],['主梁2','载标高2']].map(([title,field], i:number) => {
                    return  <React.Fragment key={i}>
                        空载标高h {'>'} {title} 各测量点：
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
                { [['额载标高h\'','额载标'],['额载C（D E)点变形量△h','额载变']].map(([title,field], i:number) => {
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
                { [['11.3.1.3','挠度要','挠度要求值'],].map(([title,field,desc], i:number) => {
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
                        </div>
                    </React.Fragment>;
                }) }
                { [['11.3.1.3','挠检验果','检验结果'],].map(([title,field,desc], i:number) => {
                    return <React.Fragment key={i}>
                        {title} {'>'} {desc} 各点：
                        <div css={{display: 'flex',flexWrap: 'wrap',justifyContent:'space-around',alignItems:'center'}}>
                            { [['D','d'],['C','C'],['E','e']].map(([name,tag], f:number) => {
                                return <div key={f} css={{ display: 'flex',alignItems:'center',
                                    minWidth: 'min(30vmin, 7rem)', maxWidth: 'min(35vmin, 13rem)',
                                    [theme.mediaQueries.md]: {minWidth: 'min(30vmin, 11rem)', maxWidth: 'min(40vmin, 19rem)'}
                                }}>
                                    {name}
                                    <SelectHookfork value={inp?.[field]?.[tag] ||''}
                                                    onChange={e => setInp({ ...inp, [field]:{...inp?.[field], [tag]: e.currentTarget.value||undefined} }) }/>
                                </div>;
                            }) }

                        </div>
                    </React.Fragment>;
                }) }
                <Text>注：h,h',为各相应测点的相应测点的相对标高读数，测量所用标尺读数小的一端朝下。
                </Text>
            </InspectRecordLayout>
        );
    } );

/**存储方式缺点：实际几行数据啊不清晰； "见证材": {"0": "desc#", "1": "", }, "见证编": {"0": "no#", "1": ""}, 这个方式：遍历不方便，多字段关联性，固定的表格记录rows数的 编排？排序seq==tag。
 * 正规原始记录想要省略不显示空行的做法：全判定多个分解字段?==''。 if(inp?.['见证材']?.[tag] || inp?.['见证编']?.[tag]) return  else null【因此】要固定大小的行集合。？版本兼容性差？
 * */
const itemA见证材料=['见证材','见证编','大备注','其它备注'];
export const Witness=
React.forwardRef(({ children, show ,alone=true}:InternalItemProps,  ref
) => {
    // const theme = useTheme();
    const [getInpFilter]=useMeasureInpFilter(null,itemA见证材料,);
    const {inp, setInp} = useItemInputControl({ ref });
    return (
        <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                             alone={alone}  label={'六、见证材料 七、备注 八、其它备注'}>
            六、见证材料<br/>
            { (new Array(4).fill(null)).map((_seq, tag:number) => {
                return <LineColumn column={5} key={tag}>
                    <InputLine  label='资料描述：' >
                        <BlobInputList  value={inp?.['见证材']?.[tag] ||''}
                                        onListChange={v => setInp({ ...inp, 见证材:{...inp?.['见证材'], [tag]: v||undefined} }) }
                            datalist={['起重机自行检查证明','起重机使用工况、安装基础、试验载荷证明']}
                        />
                    </InputLine>
                    <InputLine  label='资料编号：' >
                        <Input  value={inp?.['见证编']?.[tag] ||''}
                                onChange={e => setInp({ ...inp, 见证编:{...inp?.['见证编'], [tag]: e.currentTarget.value||undefined} }) }/>
                    </InputLine>
                </LineColumn>;
            }) }
            七、备注
                <BlobInputList  value={inp?.['大备注'] ||''}  rows={8}
                                datalist={['本报告为复检报告，本次复检仅对上次不合格报告的不合格项进行复检，其余项目单项结论引用上次不合格报告中相对应项目的结论']}
                                onListChange={v => setInp({ ...inp, 大备注: v || undefined}) } />
            注：本备注栏的内容在检验报告备注栏内体现。<br/>
            八、其它备注
            <BlobInputList  value={inp?.['其它备注'] ||''}  rows={4}
                            onListChange={v => setInp({ ...inp, 其它备注: v || undefined}) } />
        </InspectRecordLayout>
    );
} );

const itemA现场=['检验条件','现场','环境','前准备','工作电','安检验','其他防'];
/**
 * 允许设置 children:' '；
* */
export const SiteCondition=
React.forwardRef((
    { children, show ,alone=true,refWidth}:InternalItemProps,  ref
) => {
    const theme = useTheme();
    const [getInpFilter]=useMeasureInpFilter(null,itemA现场,);
    const {inp, setInp} = useItemInputControl({ ref });
    const [floor, setFloor] = React.useState<string|null>(null);
    return (
        <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                             alone={alone}  label={'附录B：现场检验条件确认'}>
            <Text  variant="h5">
              附录B：现场检验条件确认
            </Text>
            1、检验现场的环境和场地条件符合检验要求，没有影响检验的物品、设施、无关人员等，并且设置相应的警示标志，如围挡、警戒线等。<br/>
            2、使用单位的检验前准备工作应当满足检验要求。<br/>
            3、工作电源满足检验需要。<br/>
            4、现场应具备安全检验条件，不应有开展检验可能危及检验人员或者他人安全和健康的因素存在。<br/>
            5、气候条件和照明满足检验要求。<br/>
            6、其他必要的安全保护和防护措施满足检验需求。如需要进行现场射线检测时，隔离出透照区，设置安全标志；防爆设备现场，具有良好的通风，确保环境空气中的爆炸性气体或者可燃性粉尘物质最高浓度不超过爆炸下限值的10%等。
            <hr/>
            <div>
                现场检验条件确认结果的记录:
                <Table css={{borderCollapse:'collapse'}}>
                    <TableBody>
                        <TableRow >
                            <CCell>确认日期</CCell>
                            <CCell>1、现场的环境场地</CCell>
                            <CCell>2、使用单位的检验前准备</CCell>
                            <CCell>3、工作电源</CCell>
                            <CCell>4、安全检验条件</CCell>
                            <CCell>5、气候条件照明</CCell>
                            <CCell>6、其他必要的防护</CCell>
                        </TableRow>
                        {inp?.检验条件?.map((a:string,i:number)=>{
                            return <TableRow key={i}>
                                <CCell>{a}</CCell>
                                <CCell>{inp?.现场?.[a]||''}</CCell>
                                <CCell>{inp?.前准备?.[a]||''}</CCell>
                                <CCell>{inp?.工作电?.[a]||''}</CCell>
                                <CCell>{inp?.安检验?.[a]||''}</CCell>
                                <CCell>{inp?.环境?.[a]||''}</CCell>
                                <CCell>{inp?.其他防?.[a]||''}</CCell>
                            </TableRow>
                        }) }
                    </TableBody>
                </Table>
            </div>
            <>新增检查确认时间=＞</>
            <LineColumn column={5} >
                <InputLine  label='首先设置当前检验日期'>
                    <SuffixInput  type='date'  value={floor||''} onSave={txt=> setFloor(txt||null)} >
                        <Button onPress={() =>floor&&(inp?.检验条件?.includes(floor)? null:
                                setInp( (inp?.检验条件&&{...inp,检验条件:[...inp?.检验条件,floor] } )
                                    || {...inp,检验条件:[floor] } )
                        )}
                        >新增</Button>
                        <Button css={{ marginTop: theme.spaces.sm }} size="sm"
                                onPress={() => floor&&inp?.检验条件?.includes(floor) &&(
                                    setInp({...inp,检验条件:[...inp.检验条件.filter((a:string) => a!==floor )],
                                        环境:{...inp?.环境,[floor]:undefined},
                                        现场:{...inp?.现场,[floor]:undefined},
                                        前准备:{...inp?.前准备,[floor]:undefined},
                                        工作电:{...inp?.工作电,[floor]:undefined},
                                        安检验:{...inp?.安检验,[floor]:undefined},
                                        其他防:{...inp?.其他防,[floor]:undefined},
                                    })
                                )}
                        >刪除</Button>
                    </SuffixInput>
                </InputLine>
                <InputLine label={`1、现场的环境场地(${floor})`}>
                    <SelectInput value={ inp?.现场?.[floor!] ||''}  list={现场结果选}
                                 onChange={e => floor&&setInp({ ...inp, 现场:{...inp?.现场,[floor]: e.currentTarget.value||undefined} }) }/>
                </InputLine>
                <InputLine label={`2、使用单位的检验前准备(${floor})`}>
                    <SelectInput value={ inp?.前准备?.[floor!] ||''}  list={现场结果选}
                                 onChange={e => floor&&setInp({ ...inp, 前准备:{...inp?.前准备,[floor]: e.currentTarget.value||undefined} }) }/>
                </InputLine>
                <InputLine label={`3、工作电源(${floor})`}>
                    <SelectInput value={ inp?.工作电?.[floor!] ||''}  list={现场结果选}
                                 onChange={e => floor&&setInp({ ...inp, 工作电:{...inp?.工作电,[floor]: e.currentTarget.value||undefined} }) }/>
                </InputLine>
                <InputLine label={`4、安全检验条件(${floor})`}>
                    <SelectInput value={ inp?.安检验?.[floor!] ||''}  list={现场结果选}
                                 onChange={e => floor&&setInp({ ...inp, 安检验:{...inp?.安检验,[floor]: e.currentTarget.value||undefined} }) }/>
                </InputLine>
                <InputLine  label={`5、气候条件照明(${floor})`}>
                    <SelectInput value={ inp?.环境?.[floor!] ||''} list={现场结果选}
                                 onChange={e => floor&&setInp({ ...inp, 环境:{...inp?.环境,[floor]: e.currentTarget.value||undefined} }) }/>
                </InputLine>
                <InputLine  label={`6、其他必要的防护(${floor})`}>
                    <SelectInput value={ inp?.其他防?.[floor!] ||''} list={现场结果选}
                                 onChange={e => floor&&setInp({ ...inp, 其他防:{...inp?.其他防,[floor]: e.currentTarget.value||undefined} }) }/>
                </InputLine>
            </LineColumn>
            注：每次到现场后，在检验前应对检验条件进行确认，只有确认所有与检验相关的条件满足检验要求时，才能开始开展检验工作。
        </InspectRecordLayout>
    );
} );

/**开启编制时的：默认值初始化操作。  若打印：本编辑器全部都不显示。
 * */
export const EntranceSetup=
React.forwardRef((
    { children, show ,alone=true,repId,verId,rep}:InternalItemProps,  ref
) => {
    const atPrint = useMedia('print');
    const theme= useTheme();
    const toast = useToast();
    const checkName=true;      //开发测试完，改成=false, 测试时 REACT_APP_TEST 需设置， 开发模式的校对开关。
    const doCheckNames = React.useCallback((verId: string) => {
        // const nameMap = new Map();      //只有对象可以作为键。不能使用基本类型作为WeakMap的键。
        const impressionismAs=setupItemAreaRoute({verId:verId!, repId:repId!,noDefault:true, theme});
        const result=assertNamesUnique([{value:rep?.tzFields},{value:impressionismAs?.Item,type:'impr'},{value:itemA结论,},{value:itemA设备概况},
                          {value:itemA静态刚度},{value:itemA见证材料},{value:itemA现场},{value:config观测数据,type:'mesA'}]);
        toast({title: "完成！", subtitle: result? "没发现冲突":"测试开关没开", intent: "success"});
    }, [rep?.tzFields, repId, theme, toast]);
    const getInpFilter = React.useCallback((par: any) => {
        // const {unq} =par||{};    return {unq};
    }, []);
    const {inp, setInp} = useItemInputControl({ ref });
    // const {storage, setStorage} =React.useContext(EditStorageContext) as any;
    if(atPrint)   return null;
    else return (
        <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                             alone={alone}  label={'初始化本报告，默认值配置等'}>
            { checkName && <div>
                <Text variant="h5">
                 构建开发模板时的工具：校验模板的存储name冲突；
                </Text>
                <Button intent='primary' onPress={() =>{
                    doCheckNames(verId!);
                    // console.log("被最多用的报告模板 alltpyeofRep",alltpyeofRep);
                    // setStorage({...storage, unq:arrUnq});
                }}>校验模板name唯一性</Button>
             </div>
            }
            <hr/>
        </InspectRecordLayout>
    );
} );

