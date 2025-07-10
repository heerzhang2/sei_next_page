import * as React from "react";
import {
    InternalItemProps, useItemInputControl,
} from "@/report/common/base";
import {useMeasureInpFilter} from "@/report/common/hooks";
import queryString from "query-string";
import {ChoosePipingUnits, IPipingUnitEntity} from "@/comp/ChoosePipingUnits";
import {useLazyLoadQuery} from "react-relay/hooks";
import {EditorFeatureQuery$data} from "./__generated__/EditorFeatureQuery.graphql";
import {useContext, useEffect} from "react";
import {useSelectCollision} from "@/hooks/useSelectCollision";
import {tableMoveRows, tableSetInp} from "@/common/tool";
import UserContext from "@/routing/UserContext";

// const graphql = require("babel-plugin-relay/macro");
// const EditorFeatureQuery = require('./__generated__/EditorFeatureQuery.graphql');

interface Props  extends InternalItemProps{
    label?: string;
    titles?: any[];
    //过滤，保存对本次报告有用到的特性表数据。【避免】报告没用的数据存储。
    filterCB?: (pipe:IPipingUnitEntity)=>any;
}
//rep.data{,}两个管理集合[{},]；
export const itemA单特性=['单元表','单图表'];            // ,'最后特性'
//从Relay模型获取报告才需要的字段：svp pa只保存有用到的字段：节约存储
function defModelToRepData(pipe:IPipingUnitEntity){
    //注意必须在query EditorFeatureQuery($ids: [ID])必须发起给后端的字段
    const {id,crDate,name,code,leng,level,start,stop,lay,safe,rno,svp,pa,}=pipe as any;
    const {规格,材料,设压,设温,腐蚀,焊数}=svp;
    const {工介,工压,试压,工温,防腐材,绝材,绝厚,保数}=pa;
    return { id,crDate, name,code,leng,level,start,stop,lay,safe,rno,
        svp:{规格,材料,设压,设温,腐蚀,焊数},
        pa:{工介,工压,试压,工温,防腐材,绝材,绝厚,保数}
    };
}
/**通用管道单元 特性表的编辑 选择单元 固化给后端收费模型
 * 初始化导入已经选择单元;前端独立增删单元列表;固化单元列表给后端做同步计费。单线图对象集合，特性表4个单元做一组合当作表现层输出自适应功能，主场是报告data{}json存储的管道单元对象集合。rep.bus.pipus[]
 * 固化单元列表给后端做同步计费: 约定后端检查收费状态，要承认后端对本Report的当前关联Isp/Detail模型关联pipus[]只能是本(主)报告的单元集合一一对应，要不要删除不在前端视图内的的单元，新增加漏掉的管道单元，后端决定。页面可校验不一致。
 * 特性表有顺序编排按钮。单线图自然上传顺序。
 * */
export const PropertySolidify3=
    React.forwardRef((
        { children, show ,alone=true,redId,nestMd,label,titles,rep,filterCB=defModelToRepData}:Props,  ref
    ) => {
        const {user} = useContext(UserContext);
        const toast = useToast();
        const qs= queryString.parse(window.location.search);
        const ppcode =qs?.ppcode;
        const [getInpFilter]=useMeasureInpFilter(null,itemA单特性,);
        const {inp, setInp} = useItemInputControl({ ref });
        //【？】跳转的，不考虑保存当前编辑器，后续可从save来恢复跳回来页面的编辑器那些已经修改的数据遗留得住。
        const {save, field, reurl}= window.history.state?.state??{};      //通用伪对话框传递格式:save是编辑器保存的。
        //假如从多选选定设备页面返回的："移出多选集" : "加入多选集" 操作过后，将会导致save.devs[]对象变身成了设备页面的经过SessionStorage倒腾一手的对象。
        const edt = save;
        //若从save{dat:{devs:[{},]}}恢复的，confirm已经解析为对象Object:【可能从伪对话框返回】
        let  dat = edt?.dat instanceof Object?  edt?.dat : JSON.parse(edt?.dat || '{}');
        //未受到到这里活动编辑器所污染的后端或数据库当前储存版本的【容易混淆逻辑】； ？storage未保存的;==inp, setInp();
        //const  datDB = req?.dat && JSON.parse(req?.dat || '{}');
        //【琢磨】仅仅存在于短期流程活动使用的需要结构化吗？成本和收益对比？,本来应当是关联对象的却被非结构化，graphQL没办法内省的，片段快照某些关键字段？？
        //非结构化关联对象的和正常JPA关联对象的优缺点对照： 前者适合于频繁新增删除的，关系生存时间短暂的，后端基本不参与计算的。
        //因为ChooseEqps对话框选择设备之后返回的实际数据字段通常是save.devs而不是我这非结构化json存储到了dat:{devs{[]}}，所以需要转换 #前提条件save?.devs表示挑选设备列表伪对话框之后调回来的。
        //当前页面编辑器的数据集合： 初始化来自？ 若为对话框回来的，报告后端给的存储。 dat?.devs
        const [devs, setDevs] = React.useState(save?.devs? save.devs : inp?.单元表);
        useEffect(() => {
            setDevs(save?.devs? save.devs : inp?.单元表);
        }, [inp?.单元表, save?.devs, setDevs]);
        //重新依据devs集合来提取后端的信息：
        let devpipids=devs?.map((eqp: { id: any; })=>eqp.id);

        //useQueryLoader()和usePreloadedQuery没法放入同一个组件;Rendered more hooks than during the previous render.只能上下级嵌套组件
        // const [queryReference, loadQuery] = useQueryLoader(TechnicalFieldQuery);
        //正常loadQuery useQueryLoader必须嵌套组件，否则HOOK报错。
        //@不想嵌套组件的话，$就只能用不推荐模式：fetch a GraphQL query during render，性能较差，延迟大，render同时数据再次调整就会render多次。但relay缓存过的就不会重复查。
        //【注意】底下字段是所有版本的编辑器共享的，字段需更全面的； 保存给 报告 记录展示需要用到的字段：
        const data = useLazyLoadQuery<typeof EditorFeatureQuery>(
            graphql`
            query EditorFeatureQuery($ids: [ID]) {
                modelNodes(ids: $ids) {
                    id,
                    ... on PipingUnit {
                        pipe{id,cod,oid,useu{id,name}}, rno,code,reg,ust,proj,name,leng,start,stop,dets{id},crDate,nxtd1,nxtd2,
                        level,lay,safe,thik,dia, svp,pa, insd,used, desu{id,name}, insu{id,name}
                    }
                    __typename
                }
            }
        `,
            {ids: devpipids},
            {fetchPolicy: 'store-or-network'},
        );

        //有必要？做个 ES搜索引擎 索引，就是给no报告号的搜索加速？？
        const { modelNodes: devpis1 }=data ||{} as EditorFeatureQuery$data;

        //直接和Relay模型一致 devs:{ svp, pa}，保存给原始记录的data{}； 选定单元保存那一刻获取的做��快照的静态化报告数据。
        //把devpis.svp转换成对象再塞给devpis; 后续用到devpis的地方模型字段svp就不在是json了，svp已从string变身对象。json提前就转!
        //inp?.单元表 ：？==devs:[ { svp, pa}],
        //【单向】流动数据更新。前端+后端两个部分的字段混合。这可以被编辑器修改的数据的。
        const devpis =React.useMemo(() => {
            //取得【数据库最新数据】后，更新给多选编辑器。ChoosePipingUnits随后点采用后，再利用onSetEqps传递给inp的;
            //再从后端数据库提取的：传递给了当前页面的多选编辑器，从而赋值给了SesstionStorage的。
            //这个?.__typename来区分到底是普通Eqp还是PipingUnit; 管道单元用rno替代cod做设备关键字。
            return devpis1?.map((devp: {svp: string; pa:string }, i: number) => {
                    const  svp = JSON.parse(devp?.svp || '{}');       //关键字段变更参数应当不会出现在.pa{json}当中的,省略。
                    const  pa = JSON.parse(devp?.pa || '{}');
                    return  {...devp, svp, pa};
                }
            );
        }, [devpis1]);

        //为了修改可以在React页面立刻同步显示需要的，不能直接修改原数组对象。 腾挪dat?.devs到了ispdvs：受编辑器控制的
        //不需要0所以下面的<InputPure type="number" value={ fseq || ''}，若要0取值的要改成value={ fseq || '0'}才能显示为0的。
        //【注意】Select组件必须加上<option></option>否则默认第一条,后端可能根本就没有数据 也显示默认第一条。
        //【关键】字段：在首次发起流程或者退回到编制申请重新提交时刻，send取值决定了BPMN的审批是2层的还是1层审批人的。
        async function confirmation() {
            //【前提条件】devs和paramx俩个数组的各自的顺序不能随意变化，oldpars，allmp这两个实际和他们是强制关联的，二维数组结构！！
            // const{使用单, 服务单, 设备种}= dat;
            //正好对应了后端内部class EqpTechnicalFieldDat{}，后端参与非结构化内容利用;
            const newdat={
                dat: {
                    devs,
                },
            };
            //伪对话框跳转恢复也会用到的。
            return newdat;
        }
        //列表挑选冲突的明细看看：
        const renderRow=(row:any, index:number)=>{
            return <ListFlexRow>
                <Text>{row.code}</Text> <Text>{row.rno}</Text> <Text>{row.name}</Text> <Text>{row.start}</Text> <Text>{row.stop}</Text>
            </ListFlexRow>;
        };
        //新增加pipe，已经删除，更新：ID；保留顺序，不要依据实体DB台账给的Relay的顺序。
        const handleMulSelModify = React.useCallback((pipes: Array<IPipingUnitEntity>) => {
            setDevs(pipes);
            const taizMap = new Map<string,any>();
            pipes?.forEach((row:any, i:number) => {
                const torep=filterCB(row);      //给数据库的存储
                const key=row?.id + row?.crDate;
                //const key={id:row?.id, crDate:row?.crDate};  $假如#对象作为key的无法检索出来!!
                taizMap.set(key, torep);
            });
            //顺序被编辑扰乱掉。采信inp?.单元表?顺序， 从旧数据inp?.单元表.[{}]搬过来
            let tmpt: any[]=[];
            inp?.单元表?.forEach((row:any, i:number) => {
                const key=row?.id + row?.crDate;        //拼凑key可行性;
                const tzpp=taizMap.get(key);
                if(tzpp){     //已经签名的单元： 特性参数也能再被变动？
                    const torep=filterCB(tzpp);
                    const {sgm, mm, pic}=row;            //pic 关联的单线图 []。        mm不是=单元台账的备注，而是=报告里面的备注。 sgm：签名人;
                    tmpt.push({...torep, sgm, mm, pic });
                    //直接删除，剩下：后续新增加的
                    taizMap.delete(key);
                }
                //else tmpt.push(reprow);       丢弃的? 原本报告单元表中的单元--关联的图片OSS?遗忘
            });
            for (let [keys, row] of taizMap){
                tmpt.push(row);
            }
            //【保存数据库之前】采信编辑结果#保存确认，但还没有提交给DB后端保存！。  filterCB【过滤】对报告无用的字段信息。保存到了报告data存储{};
            setInp({...inp, 单元表: tmpt });         //存储融合前端的备注等字段+合并了：后端模型字段
        }, [inp, setInp,setDevs,filterCB]);
        //单元选择，需要牟定到关键字，当前的inp?.单元表[tableIdx]所指代的某一行，可能和ChoosePipingUnits弹出页面上看见的不是相等的列表。【初始】看URL页面ppcode=?;
        const {tableIdx,setTableIdx, selectCollision,setScoSel}=useSelectCollision({ table:inp?.单元表,
            keyMap:(a:any)=>a?.code, renderRow,init:ppcode as string, label:'从报告中选个单元：'});
        const [totNo, setTotNo] = React.useState<number>(undefined!==tableIdx? tableIdx+1 : 0);
        const [movSize, setMovSize] = React.useState<number>(1);
        React.useEffect(() => {
            setTotNo(undefined!==tableIdx? tableIdx+1 : 0);
        }, [tableIdx, setTotNo]);
        const onMulSelClickPp = React.useCallback((pp: IPipingUnitEntity) => {
            inp?.单元表?.forEach((row:any, i:number) => {
                if(row?.id===pp.id && row?.crDate==pp?.crDate){     //已经签名的单元： 特性参数也能再被变动？
                    setTableIdx(i);
                    setScoSel(undefined);
                    return;
                }
            });
        }, [inp?.单元表,setTableIdx,setScoSel]);
        //InputDatalist组件只能是唯一性文本的列表，才能做回溯的。 若重复只改更改搜索字段，或回到多选组件接力选定唯一一个单元。
        //【按钮】<IconShoppingCart />="采用当前多选集"； 【+】之前是IconRefreshCcw复位清空。 推测不会退出编辑模式，save图标会退出编辑模式，但是两个都会回调onSetEqps()。
        return <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show} redId={redId}
                                    nestMd={nestMd} alone={alone} label={label!}>
            <Text variant="h5">{label}：</Text>
            先从台账挑选管道单元：
            <InputLine label={`多个管道单元挑选(快照模式):`}>
                <ChoosePipingUnits  field={'devs'}  jsoned={true}
                                    autoFocus={field==='devs'}
                                    onSetEqps={(all) => {
                                        //采信编辑结果#保存确认，但还没有提交给DB后端保存！。  【过滤】对报告无用的字段信息。保存到了报告data存储{};
                                        handleMulSelModify(all);             //存储融合前端的备注等字段+合并了：后端模型字段
                                    }}
                                    onDialog={async () => {
                                        return await confirmation();
                                    } }
                                    devices={devpis}
                                    orgDevs={inp?.单元表  as any}
                                    onSelect={(pip,index) => {
                                        onMulSelClickPp(pip);
                                    }}
                                    edit={true}
                                    pipe={{id:rep?.isp?.dev?.id, name:rep?.isp?.dev?.cod}}
                />
            </InputLine>
            { selectCollision }
            当前选定管道单元在报告管道单元表中的序号={undefined!==tableIdx? tableIdx+1 :'?'}，管道编号={inp?.单元表?.[tableIdx!]?.code}；
            <div>
                <InputLine label={undefined===tableIdx? '要先去选单元':`为第${tableIdx! + 1}个单元,做备注`}>
                    <BlobInputList value={inp?.单元表?.[tableIdx!]?.mm || ''}  disabled={undefined===tableIdx}
                                   onListChange={v => {
                                       tableSetInp('单元表', tableIdx!, inp, setInp, 'mm', v || undefined);
                                   }}/>
                </InputLine>
                从台账获得的特性表，核对后保存到报告中。
                <br/>
                给单元做排序：把本单元起的<Input value={movSize}  style={{display: 'inline-flex', width: 'unset'}}
                                                max={999} min={1} type={"number"}
                                                onChange={e => setMovSize(Number(e.currentTarget.value))}/>个单元，移动到序号
                <Input value={totNo}  style={{display: 'inline-flex', width: 'unset'}}
                       max={1000} min={-1} type={"number"}
                       onChange={e => setTotNo(Number(e.currentTarget.value))}/>
                前面去。去
                <Button intent="primary" disabled={undefined===tableIdx}
                        onPress={async () => {
                            const succ=await tableMoveRows('单元表', tableIdx!, inp, setInp, totNo-1, movSize);
                            if(!succ)
                                toast({title: "无效", subtitle: tableIdx+"=<"+(totNo-1)+"<="+(tableIdx! +movSize), intent: "warning"});
                        }}
                >执行</Button>移动顺序。
                <hr/>
                签字人是谁：{inp?.单元表?.[tableIdx!]?.sgm?.name || ''}。<br/>
                {inp?.单元表?.[tableIdx!]?.sgm?.username === user?.username ?
                    <Button intent="primary" disabled={undefined===tableIdx}
                            onPress={async () => {
                                await tableSetInp('单元表', tableIdx!, inp, setInp, 'sgm', undefined);
                            }}
                    >去除签名</Button>
                    :
                    <Button intent="primary" disabled={undefined===tableIdx}
                            onPress={async () => {
                                const me = {username: user?.username, name: user?.person?.name};
                                await tableSetInp('单元表', tableIdx!, inp, setInp, 'sgm', me);
                            }}
                    >签名</Button>
                }
                <br/>关联了{inp?.单元表?.[tableIdx!]?.pic?.length||0}个单线图的管理序号:
                {inp?.单元表?.[tableIdx!]?.pic?.map((seq: any,tx:number) => {
                    return <RouterLink key={tx} href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/LineDiagram?dxtix=`+seq+`#LineDiagram`}>
                        <Text variant="h5" css={{display: 'inline-block'}}>&nbsp;序号{seq+1}&nbsp;</Text>
                    </RouterLink>
                } ) }


                {/*<br/>特殊情形：让模板自行去计算结果？为避免管道特性表后面尾随空白页。*/}
                {/*<InputLine label={'特性表在打印时是否在最后一页？以后模板可自动计算'}>*/}
                {/*    <CheckSwitch  checked={inp?.最后特性 || false} onChange={e => setInp({...inp, 最后特性: inp?.最后特性? undefined:true}) } />*/}
                {/*</InputLine>*/}

            </div>
        </InspectRecordLayout>;
    });
