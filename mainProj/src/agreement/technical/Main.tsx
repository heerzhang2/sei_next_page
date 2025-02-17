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
    LineColumn, Container, CheckSwitch, VerticalMenu, DdMenuItem, InputGroup, TextArea, InputDatalist, Input,
} from "customize-easy-ui-component";

import { Link as RouterLink } from "../../routing/Link";
import {PreloadedQuery, usePreloadedQuery} from "react-relay/hooks";
// import {TechnicalConfigQuery, TechnicalConfigQuery$data} from "./__generated__/TechnicalConfigQuery.graphql";
//import {noop} from "use-media/lib/utilities";

import {DivisionChooseQuery$data} from "../../unit/division/__generated__/DivisionChooseQuery.graphql";
import {Dispatch, MutableRefObject, SetStateAction, useContext, useEffect} from "react";

import {
    Disposable,
} from 'relay-runtime';
// import useUpdateDetailMutation from "./useUpdateDetailMutation";
import {InternalEditorResult} from "../../common/base";
import useBuildAgreementMutation from "../hook/useBuildAgreementMutation";
import {层门形式} from "../../device/edit/升降机";
import {设备同步作业} from "../../maintenance/DeviceMaint";
import {ChooseEqps} from "../../comp/ChooseEqps";
import RoutingContext from "../../routing/RoutingContext";
import {useMainConfig} from "../hook/useMainConfig";
import {useMainConfigQuery} from "../hook/__generated__/useMainConfigQuery.graphql";
// import {TwoHalfRightPanel} from "../../../UiDebugSave/sample/TwoHalfRightPanel";
import {useMainConfigQuery$data} from "../hook/__generated__/useMainConfigQuery.graphql";
import {会计项目录} from "../../dict/financeComm";

//import useReckonIspFeeMutation from "./useReckonIspFeeMutation";
//[HOOK限制]按钮点击函数内部直接上toast()或toaster.notify()很可能无法正常显示。而放在函数组件顶层render代码前却能正常。
import { graphql } from "relay-runtime";

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



export const 验收形式和方法 =['报告、道路运输液体危险货物罐式车辆常压容器（罐体）定期检验报告FJB/RC 1038-2015；',
    '其他'];
export const 支付方式 =['一次性支付','其他'];


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
    //默认委托的 technical
    const [bsType, setBsType] = React.useState(save? save.bsType : det?.bsType);
    const [entrust, setEntrust] = React.useState(det?.entrust);
    const [transferor, setTransferor] = React.useState(save? save.transferor : det?.transferor);
    const [complDate, setComplDate] = React.useState(save? save.complDate : det?.complDate);
    const [charge, setCharge] = React.useState(save? save.charge : det?.charge);
    // const [dxDevs, setDxDevs,] = useStorageState<[]>(
    //     sessionStorage,
    //     '设备多选集'
    // );
    //[特殊问题] save遗留：就算刷新页面也会留存旧的save除非URL页面路由更新跳转后再点击路由回来，save才会丢失。手动退出编辑状态，devs和编辑器其它选择跳转编辑影响。一个页面有两组的设备选择组件devs1[]devs2[]不支持吧。
    //编辑模式从未对话框页面跳转返回后才会有save.devs ，而Relay读取送到det?.devs
    const [devs, setDevs] = React.useState(save? save.devs : det?.devs);
    const  aux = JSON.parse((save? save.aux : det?.aux) || '{}');    //非构化处理。好处是数据库字段灵活增删，数据库优化压力更小，坏处就是被放入JSON字段查询搜索统计和关联操作有点麻烦了。
    const [项目名, set项目名] = React.useState(aux?.项目名);
    const [服务内容, set服务内容] = React.useState(aux?.服务内容);
    const [验收法, set验收法] = React.useState(aux?.验收法);
    const [支付式, set支付式] = React.useState(aux?.支付式);
    const [feemode, setFeemode] = React.useState(aux?.feemode);
    const [收费, set收费] = React.useState(aux?.收费);
    const [期限, set期限] = React.useState(aux?.期限);
    const [address, setAddress] = React.useState(aux?.address);
    const [备注, set备注] = React.useState(aux?.备注);
    const [项性质, set项性质] = React.useState(aux?.项性质);
    const [accKind, setAccKind] = React.useState(aux?.accKind || '机电类');
    const  accSorts= 会计项目录[accKind!];       // const  accSorts= 会计项目录[`${accKind}`];         //不能直接引用？
    const [会项类, set会项类] = React.useState(aux?.会项类);
    const [生效点, set生效点] = React.useState(aux?.生效点);

    // const [meqp, setMeqp] = React.useState(save? save.meqp : null);
    //'doConfirm' function makes the dependencies of useEffect change on every render. wrap the definition of 'doConfirm' in its own useCallback() Hook
    //前面添加了 async 会导致返回是一个 Promise{}并非直接的sendInp
    //看来这个函数是重武器：实际上是每一次render都会变成新的函数对象的，而不能用useCallback(() => {},)它无法获得最新编辑数据。
    // function doConfirm() {
    //     const aux={项目名, 服务内容, 验收法, 支付式, feemode, 收费, 期限, address, 备注,
    //             项性质, accKind, 会项类, };
    //     const mutationInp={ ptno, entrust, bsType, transferor, complDate, charge,
    //         devs: devs?.map((eqp: { id: any; })=>eqp.id),
    //         aux: JSON.stringify(aux)
    //     };
    //     //项目名称
    //     return mutationInp;
    // }

    function confirmation() {
        const aux={项目名, 服务内容, 验收法, 支付式, feemode, 收费, 期限, address, 备注,
            项性质, accKind, 会项类, 生效点 };
        return {
            ptno, entrust, bsType, transferor, complDate, charge,
            devs: devs?.map((eqp: { id: any; })=>eqp.id),
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
                <Text variant="h5">技术服务协议</Text>
                <LineColumn >
                    <InputLine label={`协议编号:`}>
                        <CommitInput  value={ ptno || ''}  onSave={txt => setPtno( txt || undefined) } />
                    </InputLine>
                    <InputLine label={`项目名称:`}>
                        <CommitInput  value={ 项目名 || ''}  onSave={txt => set项目名( txt || undefined) } />
                    </InputLine>
                    <InputLine label="主要服务内容:">
                        <TextArea required rows={5} placeholder="需详细说明，以供相关人员做审批"
                                  value={服务内容} onChange={e => set服务内容( e.currentTarget.value||undefined ) }
                        />
                    </InputLine>
                    <InputLine label={`期限（包括进度）:`}>
                        <CommitInput  value={ 期限 || ''}  onSave={txt => set期限( txt || undefined) } />
                    </InputLine>
                    <InputLine label={`服务日期(截止):`}>
                        <Input type='date'  value={ complDate  || ''}
                               onChange={e => setComplDate( e.currentTarget.value||undefined ) } />
                    </InputLine>
                    <InputLine label={`验收形式和方法:`}>
                        <InputDatalist value={ 验收法 || ''} datalist={验收形式和方法}
                                       onListChange={v => set验收法(v ||undefined)} />
                    </InputLine>
                    <InputLine label={`支付方式:`}>
                        <InputDatalist value={ 支付式 || ''} datalist={支付方式}
                                       onListChange={v => set支付式(v ||undefined)} />
                    </InputLine>
                    <InputLine label={`收费模式:`}>
                        <Select inputSize="md"  value={ feemode || ''}
                                onChange={e => setFeemode( e.currentTarget.value||undefined ) } >
                            <option >实际服务总费用</option>
                            <option >实际工作量结算</option>
                        </Select>
                    </InputLine>
                    <InputLine label={`收费(文字):`}>
                        <CommitInput  value={ 收费 || ''}  onSave={txt => set收费( txt || undefined) } />
                    </InputLine>
                    <InputLine label={`收费(关联计算):`}>
                        <SuffixInput  onSave={txt=> setCharge( Number(txt) || undefined)}
                                      type="number"  value={ charge || ''}>元</SuffixInput>
                    </InputLine>
                    <InputLine label={`服务地点或设备所在地:`}>
                        <CommitInput  value={ address || ''}  onSave={txt => setAddress( txt || undefined) } />
                    </InputLine>
                    <InputLine label="备注:">
                        <TextArea required rows={3}
                                  value={备注} onChange={e => set备注( e.currentTarget.value||undefined ) }
                        />
                    </InputLine>
                    <InputLine label={`项目性质:`}>
                        <Select inputSize="md"  value={ 项性质 || ''}
                                onChange={e => set项性质( e.currentTarget.value||undefined ) } >
                            <option >一般类</option>
                            <option >重点类</option>
                            <option >专项类</option>
                            <option >科技成果转化类</option>
                        </Select>
                    </InputLine>
                    <InputLine label={`选择项目种类:`}>
                        <Select inputSize="md"  value={ accKind || ''}
                                onChange={e => setAccKind( e.currentTarget.value||undefined ) }
                        >
                            { Object.keys(会计项目录).map((key) => (<option key={key} value={key}>
                                { key }
                            </option> )) }
                        </Select>
                    </InputLine>
                    <InputLine label={`选择项目类别:`}>
                        <Select inputSize="md"  value={ 会项类 || ''}
                                onChange={e => set会项类( e.currentTarget.value||undefined ) }
                        >
                            { accSorts?.map((one : any) => (<option key={one.NODE_ID} value={one.NODE_ID}>
                                { one.NODE_NAME }
                            </option> )) }
                        </Select>
                    </InputLine>

                    <InputLine label={`生效时间节点:`}>
                        <Select inputSize="md"  value={ 生效点 || ''}
                                onChange={e => set生效点( e.currentTarget.value||undefined ) } >
                            <option >甲方支付服务费用</option>
                            <option >双方签字盖章</option>
                        </Select>
                    </InputLine>
                    <InputLine label={`关联台账中的设备(直接来自当前设备选择包):`}>
                        <ChooseEqps  field={'devs'}
                                    autoFocus={field==='devs'}
                                    onSetEqps={(all) => { setDevs(all) }}
                                    onDialog={async () => { return await confirmation() } }
                                    devices={devs}
                                    orgDevs={det?.devs  as any}
                                    edit={true} />
                    </InputLine>

                </LineColumn>
            </div>
        </Container>
    );
}
