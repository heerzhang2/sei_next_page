/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  Text,
  Button,
  Select,
  InputLine,
  Input,
  TableHead,
  TableRow,
  CCell,
  TableBody,
  Table, ButtonRefComp
} from "customize-easy-ui-component";
import {
  InspectRecordLayout,
  InternalItemProps,
  SelectHookfork,
  useItemInputControl
} from "../../common/base";
import {DirectLink} from "../../../routing/Link";
import queryString from "query-string";
import {itemResultTransform} from "../../common/helper";
import {inspectionContent} from "./repConfig";
import {EditStorageContext} from "../../StorageContext";
import scrollIntoView from 'scroll-into-view-if-needed';

//公共的复用性好的组件；编辑、原始记录，在多数模板能通用的。不通用的要安排放在更加具体贴近的目录文件内。
//方便不同模板和不同版本的可重复引用。文件目录管理，组件按照抽象性程度和参数配置的关联度，分级分层次，标识容易区分开。

//下结论页面：
export const ItemConclusion=
  React.forwardRef((
    { children, show ,alone=true}:InternalItemProps,  ref
  ) => {
    const getInpFilter = React.useCallback((par: any) => {
      //检验人IDs编制日期编制人结论：这些字段要提升到关系数据库表中，而不是json字段里面。只能保留上级语义更强的，json半结构化数据的就不做保留。
      const {检验结论,编制日期,编制人,检验人IDs} =par||{};
      return {检验结论,编制日期,编制人,检验人IDs};
    }, []);
    const {inp, setInp} = useItemInputControl({ ref });
    return (
      <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                           alone={alone}  label={'下结论!'} column={0}>
        五、现场检验意见
        <InputLine  label='检验结论{签名后结论不能再改}' >
          <Select inputSize="md" css={{minWidth:'140px',fontSize:'1.3rem',padding:'0 1rem'}}
                  value={ inp?.检验结论  ||''}
                  onChange={e => setInp({ ...inp, 检验结论: e.currentTarget.value||undefined}) }
          >
            <option></option>
            <option>合格</option>
            <option>不合格</option>
            <option>复检合格</option>
            <option>复检不合格</option>
          </Select>
        </InputLine>
        <InputLine  label='检验人员{用户ID列表,将来签名，登录来签注}' >
          <Input  value={inp?.检验人IDs ||''} placeholder="输入本系统用户ID，将来签名后结论不能再改，多人签名：以 分割"
                  onChange={e => setInp({ ...inp, 检验人IDs: e.currentTarget.value||undefined}) } />
        </InputLine>
        <InputLine  label='编制人员{将来是提交人员，自动的}' >
          <Input  value={inp?.编制人 ||''} placeholder="目前直接输入名字，一个人"
                  onChange={e => setInp({ ...inp, 编制人: e.currentTarget.value||undefined}) } />
        </InputLine>
        <InputLine  label='编制日期{将来等于提交日，自动的}' >
          <Input  value={inp?.编制日期 ||''}  type='date'
                  onChange={e => setInp({ ...inp, 编制日期: e.currentTarget.value}) } />
        </InputLine>
        <InputLine  label='检验意见通知书编号' >
          <Input  value={inp?.意见通知书 ||''}  placeholder="目前直接输入，将来是关联自动提取"
                  onChange={e => setInp({ ...inp, 意见通知书: e.currentTarget.value}) } />
        </InputLine>
        <InputLine  label='整改反馈确认期限' >
          <Input  value={inp?.整改反馈 ||''}  type='date'
                  onChange={e => setInp({ ...inp, 整改反馈: e.currentTarget.value}) } />
        </InputLine>
        <InputLine  label='下次检验日期(不是出报告时在设备台账看到的下检日)' >
          <Input  value={inp?.新下检日 ||''}  type='date'
                  onChange={e => setInp({ ...inp, 新下检日: e.currentTarget.value}) } />
        </InputLine>
        注：特殊情况，应在备注中说明检验员所负责检验的项目编号。
      </InspectRecordLayout>
    );
  } );

//不合格的复检？
//不合格表unq数据生成时机：复检编制开始时初始化来的。在初检场景看到是动态校验目的前端显示表还未存储到后端数据库。
//必须依赖项目编号来匹配！ {itRes[ts].iClass}/{ts}这里ts就是 项目X.Y代码串的；  实际上{itRes[ts].fdesc}也是自动合成的。
export const ItemRecheckResult=
  React.forwardRef((
    { children, show ,alone=true,repId}:InternalItemProps,  ref
  ) => {
    const qs= queryString.parse(window.location.search);
    const getInpFilter = React.useCallback((par: any) => {
      const {unq} =par||{};
      return {unq};
    }, []);
    const {inp, setInp} = useItemInputControl({ ref });
    const {storage, setStorage} =React.useContext(EditStorageContext) as any;
    const itRes =React.useMemo(()=>itemResultTransform(storage,inspectionContent), [storage]);
    const refEdit = React.useRef(null);
    const [seq, setSeq] = React.useState<number | null>(null);   //表對象的當前一條。
    const [obj, setObj] = React.useState({no:'',c:'',b:'',rs:'',d:''});
    React.useEffect(() => {
      let size =inp?.unq?.length;
      setSeq(size>0?  size-1:null);
    }, [inp]);
    React.useEffect(() => {
      let size =inp?.unq?.length;
      let index=-1;
      inp?.unq?.forEach((value: any, i:number,) =>{
        if(value?.no===qs.from)   index=i;
      } );
      setObj(inp?.unq?.[index]);
      setSeq(index);
    }, [qs.from, inp?.unq]);
    function onModifySeq(idx:number,it:any){
      setObj(it);
      setSeq(idx);
    };
    React.useEffect(() => {
      if(refEdit.current)
          scrollIntoView(refEdit.current!, {
            behavior: 'smooth',
            scrollMode: 'if-needed',
          });
    }, [seq,qs.from]);
    // function onDeleteSeq(idx:number,it:any){
    //   inp?.unq?.splice(idx,1);
    //   setInp({...inp,unq: [...inp?.unq] });
    //   setSeq(null);
    // };
    // function onInsertSeq(idx:number,it:any){
    //   inp?.unq?.splice(idx,0, obj);
    //   setInp({...inp,unq:[...inp?.unq] });
    //   setSeq(idx);
    // };
    // function onAddSeq(idx:number){
    //   let size =inp?.unq?.push(obj);
    //   setInp( (inp?.unq&&{...inp,unq:[...inp?.unq] } )  || {...inp,unq:[obj] } );
    //   setSeq((inp?.unq&&(size-1))  || 0 );
    // };

    const editor =React.useMemo(() => {
     return <div>
        <InputLine label={`类别/编号：`}>
          <Input readOnly={true}  value={obj?.no ||''}
                 onChange={e =>setObj({...obj, no: e.currentTarget.value} ) } />
        </InputLine>
        <InputLine label={`不合格内容描述`}>
          <Input   value={obj?.b ||''}
                   onChange={e =>setObj({...obj, b: e.currentTarget.value} ) } />
        </InputLine>
        <InputLine label={`复检结果`} >
          <SelectHookfork value={obj?.rs ||''}
                          onChange={e =>setObj({...obj, rs: e.currentTarget.value} ) }
          />
        </InputLine>
        <InputLine  label='复检日期' >
          <Input  value={obj?.d ||''}  type='date'
                  onChange={e =>setObj({...obj, d: e.currentTarget.value} ) } />
        </InputLine>
        <ButtonRefComp  ref={refEdit} disabled={seq===null}
             onPress={() => {
                inp?.unq?.splice(seq, 1, obj);
                setInp({ ...inp, unq: [...inp?.unq] });
              //if(seq !== null) {。。}  else setInp({ ...inp, unq: [obj] });
        }}>{`改了${qs.from}就确认`}</ButtonRefComp>
      </div>;
      },[qs.from,seq, obj,setObj, inp?.unq, inp,setInp]);

    // const editor=<Layer elevation={"sm"} css={{ padding: '0.25rem' }}>
    //
    // </Layer>;

    const myTable=<div>
      <Table  fixed={ ["5%","11%","%","14%","14%"]  }    printColWidth={ ["26","49","520","52","71"] }
              css={ {borderCollapse: 'collapse' } }
      >
        <TableHead>
          <DirectLink  href={`/report/EL-DJ/ver/1/${repId}/ReCheck`}>
            <TableRow>
              <CCell>序号</CCell>
              <CCell>类别/编号</CCell>
              <CCell>检验不合格内容记录</CCell>
              <CCell>复检结果</CCell>
              <CCell>复检日期</CCell>
            </TableRow>
          </DirectLink>
        </TableHead>
        <TableBody>
          {inp?.unq?.map((a:any, i:number) => {
            return (
                <DirectLink key={i} href={`/report/EL-DJ/ver/1/${repId}/ReCheck?from=${a.no}`}>
                  <TableRow>
                    <CCell component="td" scope="row">{i+1}</CCell>
                    <CCell>{a.c}/{a.no}</CCell>
                    <CCell>{a.b}</CCell>
                    <CCell>{a.rs}</CCell>
                    <CCell>{a.d}</CCell>
                  </TableRow>
                </DirectLink>
            );
          })
          }
        </TableBody>
      </Table>
    </div>;
    //不合格unq表数据生成时机：不合格的报告签字的前一步时 初始化来的。在初检场景看到是动态校验目的前端显示表还未存储到后端数据库。
    return (
      <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                           alone={alone}  label={'不合格复检结果记录'} column={0}>
        <Text  variant="h5">
          四、检验不合格记录及复检结果
        </Text>
        <Button intent='primary' onPress={() =>{
          let arrUnq=itRes.failure.map((ts:any, i:number) => { return {no: ts,c: itRes[ts].iClass, b: itRes[ts].fdesc}; });
          setStorage({...storage, unq:arrUnq});
        }}
        >依据记录来初始化</Button>
        不能重复初始化。
        <hr/>
        {myTable}
        {qs.from && editor}
      </InspectRecordLayout>
    );
  } );


//检验项目的标准化展示组件
export interface ItemUniversalProps  extends React.HTMLAttributes<HTMLDivElement>{
  show?: boolean;
  alone?: boolean;
  //检验项目配置对象标准的索引.[x].[y] ； 这里x是大项目；y是检验项目{还可拆分成几个更小项目的}。比如对应action="2.1"就是x=1,y=0的配置。
  x: number;
  y: number;
  inspectionContent: any[];
  ref?: any;
  /**每一个项目一个编辑器：前面说明*/
  procedure?: any;     //传递一个检验项目开头流程性内容，显示的格式等。
  /**每一个子项目 可能在前面定制编辑器内容的*/
  details?: any[];     //传递各个子项目X.Y.z?(若没有子项目的，就算项目本身[0])的定制，测量数据细节内容。
}
//每个正在编辑的项目。
//引进Render Props模式提高复用能力 { details[0](inp,setInp)  }；就可以配置成通用的组件。
//【通用的电梯原始记录的编辑器】对应action=x.y下标分解方式的路由器的组件入口：createItem('item1.1', <ItemUniversal x={0} y={0})
//这里配置的details有可能是 subItems 否则依据names 来配套的。编辑器组件定死用<SelectHookfork的。
export const ItemUniversal=
  React.forwardRef((
    { children, show=true, procedure, details, x, y ,alone=true,inspectionContent}:ItemUniversalProps,  ref
  ) => {
    const getInpFilter = React.useCallback((par: any) => {
      let fields={} as any;
      //配置动态命名的字段获取旧的值，还想保存修改数据，还要界面同步显示变化数值的场景，就按这里做法。
      inspectionContent[x].items[y].names?.map((aName:string,i:number)=> {
        const namexD = `${aName}_D`;
        fields[aName] =par[aName];
        fields[namexD] =par[namexD];
        return null;
      });
      inspectionContent[x].items[y].addNames.forEach((name:string)=>
        fields[name] =par[name]
      );
      return fields;
    }, [x,y,inspectionContent]);
    const {inp, setInp} = useItemInputControl({ ref });
    //因为Hook不能用逻辑条件，只能上组件分解了，按条件分解两个组件。
    //下拉列表标题=检验类别+项目内容；
    //逻辑组件内部的钩子Hook有差异需求。分解成两个组件逻辑合并后，性能是有提升。
    return (
      <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                alone={alone} label={`${inspectionContent[x].items[y].iClass}${inspectionContent[x].items[y].label}`}
                column={0}
      >
        <div css={{ display: 'flex', justifyContent: 'space-around' }}>
          <Text variant="h6">检验项目: {`${x + 1}.${y + 1}`}</Text>
          <Text variant="h6">{`${x + 1} ${inspectionContent[x].bigLabel}`}</Text>
        </div>
        <div css={{ display: 'flex', justifyContent: 'space-around' }}>
          <Text variant="h6">{`${x + 1}.${y + 1} ${inspectionContent[x].items[y].label}`}</Text>
          <Text variant="h6">检验类别 {`${inspectionContent[x].items[y].iClass}`}  </Text>
        </div>
        <hr/>
        {procedure}
        <Text variant="h5">
          查验结果
        </Text>
        {inspectionContent[x].items[y].subItems ? (inspectionContent[x].items[y].subItems?.map((a:any, i:number) => {
            const namex = `${inspectionContent[x].items[y].names[i]}`;
            const namexD = `${inspectionContent[x].items[y].names[i]}_D`;
            return <React.Fragment key={i}>
              {details![i] && details![i](inp, setInp)}
              <InputLine label={inspectionContent[x].items[y].subItems[i]}>
                <SelectHookfork value={(inp?.[namex]) || ''} onChange={e => {
                  inp[namex] = e.currentTarget.value || undefined;
                  setInp({ ...inp });
                }}
                />
              </InputLine>
              <InputLine label='描述或问题'>
                <Input value={(inp?.[namexD]) || ''} onChange={e => {
                  inp[namexD] = e.currentTarget.value || undefined;
                  setInp({ ...inp });
                }}
                />
              </InputLine>
            </React.Fragment>;
          }))
          :
          (inspectionContent[x].items[y].names?.map((a:any, i:number) => {
            const namex = `${inspectionContent[x].items[y].names[i]}`;
            const namexD = `${inspectionContent[x].items[y].names[i]}_D`;
            return <React.Fragment key={i}>
              {details![i] && details![i](inp, setInp)}
              <InputLine label={inspectionContent[x].items[y].label}>
                <SelectHookfork value={(inp?.[namex]) || ''} onChange={e => {
                  inp[namex] = e.currentTarget.value || undefined;
                  setInp({ ...inp });
                }}
                />
              </InputLine>
              <InputLine label='描述或问题'>
                <Input value={(inp?.[namexD]) || ''} onChange={e => {
                  inp[namexD] = e.currentTarget.value || undefined;
                  setInp({ ...inp });
                }}
                />
              </InputLine>
            </React.Fragment>;
          }))
        }
      </InspectRecordLayout>
    );
  } );





