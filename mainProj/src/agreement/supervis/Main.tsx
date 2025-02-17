/** @jsxImportSource @emotion/react */
import * as React from "react";
import {MutableRefObject} from "react";
import {
    CheckSwitch,
    CommitInput,
    Container,
    Input,
    InputDatalist,
    InputLine,
    LineColumn,
    Select,
    SuffixInput,
    Text,
    TextArea,
    useTheme,
} from "customize-easy-ui-component";
import {PreloadedQuery} from "react-relay/hooks";
// import {TechnicalConfigQuery, TechnicalConfigQuery$data} from "./__generated__/TechnicalConfigQuery.graphql";
//import {noop} from "use-media/lib/utilities";
// import useUpdateDetailMutation from "./useUpdateDetailMutation";
import {InternalEditorResult} from "../../common/base";
import {ChooseEqps} from "../../comp/ChooseEqps";
import {useMainConfig} from "../hook/useMainConfig";
// import {TwoHalfRightPanel} from "../../../UiDebugSave/sample/TwoHalfRightPanel";
import {useMainConfigQuery, useMainConfigQuery$data} from "../hook/__generated__/useMainConfigQuery.graphql";
import {业务类型s} from "../../device/edit/CommnBase";
import {AdminunitChoose} from "../../common/geo/AdminunitChoose";

//import useReckonIspFeeMutation from "./useReckonIspFeeMutation";
//[HOOK限制]按钮点击函数内部直接上toast()或toaster.notify()很可能无法正常显示。而放在函数组件顶层render代码前却能正常。
const graphql = require("babel-plugin-relay/macro");

interface DetailConfigProps {
    id?: string;
    prepared: {
        //【特别注意】query路由器若不是提供这个类型的查询DetailConfigQuery，本组件也不会抛出异常！在usePreloadedQuery<DetailConfigQuery>()不报错！
        query: PreloadedQuery<useMainConfigQuery>;
    }
    children: React.ReactNode;
    routeData: any;
}

/**【好例子】组件复用最新模式：充分肢解和拼装。
 * */
export default function Main(props: DetailConfigProps) {
    const {frame,sibling,agreement,editorRef} =useMainConfig(props);
    return (
      <>
          { React.cloneElement(
              frame,
              {
                  children:  <>
                      <DetailConfigInner det={agreement} editorRef={editorRef} />
                      {sibling}
                  </> ,
              }
          ) }
      </>
  );
};


/**
 * 为了避免把保存按钮也一起放入到编辑器组件中，还能把编辑后的属性数据全部提供给父辈组件，
 * 真正mutation接口函数操作+按钮触发:直接安排在上一级组件内做的。
 * 【通用模式】规定统一的数据修改保存的模式：引进专有的props.editorRef.doConfirm():来做规范和统一处理。
* */
interface DetailConfigInnerProps {
    //从上级获取老的字段属性数据:  Agreement 模型;
    det: useMainConfigQuery$data["node"];
    //正常情形editorRef不应该是null的，上级组件必须有保存触发按钮的;
    //通用的编辑器：字段属性被修改之后，必须回传编辑好的字段 新数据给上级组件。editorRef对上级组件暴露编辑器数据。editorRef.doConfirm()最好保持一样名字
    editorRef?: MutableRefObject<InternalEditorResult>;
}
/**业务信息配置--编辑器主体子组件*/
function DetailConfigInner({det, editorRef}: DetailConfigInnerProps) {
    const theme = useTheme();
    //设备类型：EQP_TYPE 有些是单独报告的没关联设备台账的。 det?.type优先承认的。
    // const type= det?.;
    const {save, field}= window.history.state?.state??{};      //通用伪对话框传递格式field=上次跳转目标选择字段。
    //业务类型: OPE_TYPE ;
    const ope= det?.bsType;
    const [ptno, setPtno] = React.useState(det!.ptno);
    //默认法定的 supervis ,默认业务类型'INSTA' #必须设置，否则为null但是界面显示第一条项目。
    const [bsType, setBsType] = React.useState(save? save.bsType : det?.bsType??'INSTA');
    // const [entrust, setEntrust] = React.useState(det?.entrust);
    const [transferor, setTransferor] = React.useState(save? save.transferor : det?.transferor);
    // const [complDate, setComplDate] = React.useState(save? save.complDate : det?.complDate);
    const [charge, setCharge] = React.useState(save? save.charge : det?.charge);
    //[特殊问题] save遗留：就算刷新页面也会留存旧的save除非URL页面路由更新跳转后再点击路由回来，save才会丢失。手动退出编辑状态，devs和编辑器其它选择跳转编辑影响。一个页面有两组的设备选择组件devs1[]devs2[]不支持吧。
    //编辑模式从未对话框页面跳转返回后才会有save.devs ，而Relay读取送到det?.devs
    const [devs, setDevs] = React.useState(save? save.devs : det?.devs);
    const [ad, setAd] = React.useState(save? save.ad : det?.ad);
    const  aux = JSON.parse((save? save.aux : det?.aux) || '{}');    //非构化处理。好处是数据库字段灵活增删，数据库优化压力更小，坏处就是被放入JSON字段查询搜索统计和关联操作有点麻烦了。
    const [进场时, set进场时] = React.useState(aux?.进场时);
    const [进场手, set进场手] = React.useState(aux?.进场手);
    const [联系手, set联系手] = React.useState(aux?.联系手);
    const [转款人, set转款人] = React.useState(aux?.转款人);
    const [转款话, set转款话] = React.useState(aux?.转款话);
    const [检检费, set检检费] = React.useState(aux?.检检费);
    const [无损费, set无损费] = React.useState(aux?.无损费);
    const [理化费, set理化费] = React.useState(aux?.理化费);
    const [其他费, set其他费] = React.useState(aux?.其他费);
    const [检依据, set检依据] = React.useState(aux?.检依据 || "1. 《中华人民共和国特种设备安全法》、《特种设备安全监察条例》;\n");
    const [未尽事, set未尽事] = React.useState(aux?.未尽事);

    function confirmation() {
        const aux={进场时,进场手,联系手,转款人,转款话, 检检费, 无损费, 理化费, 其他费, 检依据, 未尽事};
        //注意 ad: 读取过来是对象，更新后端INPUT需要映射修改为 GlobalID; 还是放入到发送给后端的最后一步再修改吧。这里和伪对话框的save恢复有冲突就不做转换。
        return {
            ptno,  bsType, transferor, charge, ad,
            devs: devs?.map((eqp: { id: any; }) => eqp.id),
            aux: JSON.stringify(aux)
        };
    }
    //简易方式暴露ref操作接口给上级组件 ，让父辈组件的按钮能够直接执行子组件的回调钩子函数
    editorRef!.current = { doConfirm: confirmation } as InternalEditorResult;


    return (
        <Container>
            <div css={{
                paddingTop: theme.spaces.lg,
                paddingBottom: theme.spaces.lg
            }}>
                <Text variant="h5">检验检测、监检协议书</Text>
                <LineColumn >
                    <InputLine label={`协议编号:`}>
                        <CommitInput  value={ ptno || ''}  onSave={txt => setPtno( txt || undefined) } />
                    </InputLine>
                    <InputLine label={`进场时间:`}>
                        <Input type='date'  value={ 进场时  || ''}
                               onChange={e => set进场时( e.currentTarget.value||undefined ) } />
                    </InputLine>
                    <InputLine label={`进场联系手机:`}>
                        <CommitInput  value={ 进场手 || ''}  onSave={txt => set进场手( txt || undefined) } />
                    </InputLine>
                    <InputLine label={`任务联系手机:`}>
                        <CommitInput  value={ 联系手 || ''}  onSave={txt => set联系手( txt || undefined) } />
                    </InputLine>

                    <InputLine label={`转款单位(非选择):`}>
                        <CommitInput  value={ transferor || ''}  onSave={txt => setTransferor( txt || undefined) } />
                    </InputLine>
                    <InputLine label={`转款联系人:`}>
                        <CommitInput  value={ 转款人 || ''}  onSave={txt => set转款人( txt || undefined) } />
                    </InputLine>
                    <InputLine label={`转款联系电话:`}>
                        <CommitInput  value={ 转款话 || ''}  onSave={txt => set转款话( txt || undefined) } />
                    </InputLine>

                    <InputLine label={`收费(协议校核):`}>
                        <SuffixInput  onSave={txt=> setCharge( Number(txt) || undefined)}
                                      type="number"  value={ charge || ''}>元</SuffixInput>
                    </InputLine>

                    <InputLine label={`所属区域(选择):`}>
                        <AdminunitChoose  name={ad?.name}   setEditorVar={setAd}
                                          pos={ad}  onCancel={() => { setAd(undefined) }} />
                    </InputLine>
                    <InputLine label={`业务类型:`}>
                        <Select inputSize="md"  value={ bsType || ''}
                                onChange={e => setBsType( e.currentTarget.value||undefined ) } >
                            { 业务类型s.map(([enumv,title],i) => (<option key={i} value={enumv}>{title}</option> )) }
                        </Select>
                    </InputLine>

                    <InputLine label={`关联台账中的设备(直接来自当前设备选择包):`}>
                        <ChooseEqps  field={'devs'}
                                    autoFocus={field==='devs'}
                                    onSetEqps={(all) => { setDevs(all) }}
                                    onDialog={ () => { return confirmation() } }
                                    devices={devs}
                                    orgDevs={det?.devs  as any}
                                    edit={true} />
                    </InputLine>

                    <InputLine label={`其中：检验检测费:`}>
                        <SuffixInput  onSave={txt=> set检检费( Number(txt) || undefined)}
                                      type="number"  value={ 检检费 || ''}>元</SuffixInput>
                    </InputLine>
                    <InputLine label={`无损检测费:`}>
                        <SuffixInput  onSave={txt=> set无损费( Number(txt) || undefined)}
                                      type="number"  value={ 无损费 || ''}>元</SuffixInput>
                    </InputLine>
                    <InputLine label={`理化试验费:`}>
                        <SuffixInput  onSave={txt=> set理化费( Number(txt) || undefined)}
                                      type="number"  value={ 理化费 || ''}>元</SuffixInput>
                    </InputLine>
                    <InputLine label={`应力测试费等其他:`}>
                        <SuffixInput  onSave={txt=> set其他费( Number(txt) || undefined)}
                                      type="number"  value={ 其他费 || ''}>元</SuffixInput>
                    </InputLine>
                    <InputLine label={`检验检测依据:`}>
                        <TextArea required rows={3}
                                  value={检依据|| ''} onChange={e => set检依据( e.currentTarget.value||undefined ) }
                        />
                    </InputLine>
                    <InputLine label={`未尽事宜商定:`}>
                        <TextArea required rows={3}
                                  value={未尽事|| ''} onChange={e => set未尽事( e.currentTarget.value||undefined ) }
                        />
                    </InputLine>
                </LineColumn>
            </div>
        </Container>
    );
}

