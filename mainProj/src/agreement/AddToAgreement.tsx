/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text,
    Button,
    useTheme,
    useToast,
    LayerLoading,
    Spinner,
    Input,
    TwoHalfRightPanel,
    Container,
    MenuItem,
    MenuList,
    InputLine,
    Select,
    CheckSwitch,
    IconButton,
    IconArrowLeft,
    IconKey, VerticalMenu, DdMenuItem, CommitInput
} from "customize-easy-ui-component";
//import {   useAddToTask } from "../db";
//import { useSession } from "../auth";

//import { Link as RouterLink,  } from "wouter";
import useBuildAgreementMutation from "./hook/useBuildAgreementMutation";
// import NewDevice from "../device/NewDevice";

import {Link as RouterLink} from "../routing/Link";
import {useContext} from "react";
import UserContext from "../routing/UserContext";
import {ContainerDesignClsTil, getFeeTitleFe} from "../dict/feeTitleFe";

import {ChooseUnit} from "../unit/ChooseUnit";
import {getFormatDate} from "../common/tool";
// import {ChooseDevice} from "../device/ChooseDevice";
// import { 业务类型s, } from "../device/edit/CommnBase";
import RoutingContext from "../routing/RoutingContext";
// import {ChooseEqps} from "../comp/ChooseEqps";
//import {Spinner} from "../comp/Spinner";
//import { awaitExpression } from "@babel/types";

//[HOOK限制]按钮点击函数内部直接上toast()或toaster.notify()很可能无法正常显示。而放在函数组件顶层render代码前却能正常。

export const 协议类型s=[["supervis","检验检测、监检协议书"],["technical","技术服务协议"]];
export const agreementTypeMap = new Map();
协议类型s.map(([enumt,desc],i) => (agreementTypeMap.set(enumt, desc)) );


//这种路由写法：params:{ id }是空的，不会接收上级<Route />路由器给的:id。
/*申请单新增：
考虑合理性交互模式：ChooseEqps组件新增加更多设备的显示？若都放在TwoHalf左边也不友好，最好直接放在主页面也就是TwoHalf右半边页面上返回就能弹出显示。
* */
export const AddToAgreement = ({
    ...other
}) => {
  const theme = useTheme();
  const toast = useToast();
    const {user} = useContext(UserContext);
//  const ref = React.useRef(null);
//  const {user,} = useSession();
  //const [loading, setLoading] = React.useState(false);
  //const [editing, setEditing] = React.useState(!readOnly);
  /*const [content, ] = React.useState(() => {
    return defaultDescription
      ? ''
      : null;
  });*/
  //const [image, ] = React.useState(defaultImage);
 // const [title, setTitle] = React.useState(defaultTitle);
  //const [credit, ] = React.useState(defaultCredit);
  //ingredients 原来是[]数组，改成对象。ingredients.length无定义了。
  //const [ingredients, setIngredients] = React.useState<any>( {dep:'二部'　} );

    //不可以直接上Object的，select value=只能简单类型，<option key={i} value={dep}>
    //【兼容考虑】跳转并提供预设参数的模式.PK.弹转伪对话框待返回; save{}有设置默认字段取值的，不一定都算是伪对话框弹起转传递的;可能是跳转并提供预设参数的模式,save字段信息很少的。
    const {save, field}= window.history.state?.state??{};      //通用伪对话框传递格式field=上次跳转目标选择字段。

    //if(save && field)   save[field]= {id, name: unit.name};
    //从跳转伪对话框页面之前做了保存的编辑器恢复数据。
    // const [depId, setDepId] = React.useState<any>(save? save.depId : user.dep?.id);
    //const [servu, setServu] = React.useState(save? save.servu : window.history.state?.state?.servu);
    //setServu({id, name}) 单位选择伪对话框，或者预设单位取值的，保存给后端，都是只需要id+name;
    const [servu, setServu] = React.useState(save? save.servu : null);
    // const [meqp, setMeqp] = React.useState(save? save.meqp : null);
    const [ptno, setPtno] = React.useState(save? save.ptno : null);
    const [pttype, setPttype] = React.useState(save? save.pttype : 'technical');
    // const [bsType, setBsType] = React.useState(save? save.bsType : 'REGUL');
    // const [entrust, setEntrust] = React.useState(save? save.entrust : false);
    let  delayds=31;      //默认任务日期 Default task date延后天数=31天 Delayed days
    const [date, setDate] = React.useState(save&&save.date? save.date : getFormatDate(new Date(delayds*1000*60*60*24 + Date.now()) ));
    console.log("AddTask返回last页面 save=", save,"date=",date);
/*原来嵌套updateRecipe是同步等待的方式： "2018-09-12"
  const {result, submit:updateFunc,  } = useAddToTask({
    dep: ingredients && ingredients.dep,
    devs: id, date:ingredients && ingredients.date,
    });
  */
  const {call:buildTaskFunc,doing,result, called, reset}= useBuildAgreementMutation();
    console.log("AddToTask页面刷新result:", result ,"called=",called);
   //const servu=window.history.state?.state?.servu;      //外部注入的参数
    console.log("AddtoTassk其它path传递参数来servu=",window.history.state?.state," servu=",servu);
    const defaultIspu= localStorage['默认检验机构']? JSON.parse(localStorage['默认检验机构']) : undefined;
    const [ispu, setIspu] = React.useState(save? save.ispu : defaultIspu);
    /**编辑器正在编辑数据的暂时保留(路由切换切回后还能取回)，从为对话框页面路由返回之后再利用已经修改数据。
     * 多个设备一起挑选 麻烦，这里【限制】保留一个设备meqp的跳转恢复。
     * */
    async function confirmation() {
        return {
            servu, ptno, pttype, ispu
        };
    }
    const { history } = useContext(RoutingContext);

  //if(doing)  return <Spinner/>;
  return (
        <TwoHalfRightPanel
            back={
                <RouterLink  href="/tasks">
                    <IconButton label="后退"  variant="ghost"
                        size="md"  noBind  icon={<IconArrowLeft />}
                        css={{
                            marginRight: theme.spaces.sm,
                            [theme.mediaQueries.md]: {
                                display: "none"
                            }
                        }}
                    />
                </RouterLink>
             }
            menu={
                <VerticalMenu>
                    <DdMenuItem label="其他功能"
                                onClick={ () => {
                                }}/>
                </VerticalMenu>
            }
            title={ `新的协议受理申请单` }
        >
            <Text variant="h5">新协议申请准备发起概要，发起应答有id后继续编制申请单明细模式；检验员也可以发起申请（代客户申请业务）</Text>
              {!called ? (
              <div>
                <Text  variant="h6">申请单编号自己填，以区分协议</Text>
                  <InputLine label={`服务单位:`}>
                      <ChooseUnit id={servu?.id} name={servu?.name} field={'servu'}
                                  autoFocus={field==='servu'}
                                  onCancel={() => { setServu(undefined) }}
                                  onDialog={async () => { return await confirmation() } }
                      />
                  </InputLine>
{/*                  <InputLine label={`业务类型:`}>
                      <Select inputSize="md"  value={ bsType || ''}
                              onChange={e => setBsType( e.currentTarget.value||undefined ) } >
                          { 业务类型s.map(([enumv,title],i) => (<option key={i} value={enumv}>{title}</option> )) }
                      </Select>
                  </InputLine>
                  <InputLine label={`是委托的业务:`}>
                      <CheckSwitch  checked= {entrust || false}
                                    onChange={e => setEntrust(entrust? undefined:true) } />
                  </InputLine>*/}

{/*                  <InputLine label='检验部门'>
                      <Select value={ depId || ''}
                              onChange={e =>{
                                  setDepId( e.currentTarget.value||undefined );
                              } }
                      >
                          <option> </option>
                          { user.unit?.dvs.map((depm: any,i: number) => (
                              <option key={i} value={depm.id}>{depm.name}</option>
                          )) }
                      </Select>
                  </InputLine>*/}

{/*                  <InputLine label={`任务到期日期:`}>
                      <Input type='date'  value={ date  || ''}
                             onChange={e => setDate( e.currentTarget.value||undefined ) } />
                  </InputLine>*/}
                  <InputLine label={`协议编号(标识):`}>
                      <CommitInput  value={ ptno || ''}  onSave={txt=> setPtno(txt||undefined)}/>
                  </InputLine>
                  <InputLine label={`申请协议类型:`}>
                      <Select inputSize="md"  value={ pttype || ''}
                              onChange={e => setPttype( e.currentTarget.value||undefined ) } >
                          { 协议类型s.map(([enumv,title],i) => (<option key={i} value={enumv}>{title}</option> )) }
                      </Select>
                  </InputLine>
                  <InputLine label={`检验检测机构:`}>
                      <Select  css={{ minWidth:'230px' }}
                              defaultValue={ispu}
                              onChange={e =>{
                                  setIspu( e.currentTarget.value || '');
                                  localStorage['默认检验机构'] =JSON.stringify(e.currentTarget.value || '');
                              } } >
                          <option key={0} value={''}></option>
                          { user?.ispUnits.map((agency: any, i: number) => (<option key={i+1} value={agency.unit.id}>{agency.unit.name}</option> )) }
                      </Select>
                  </InputLine>
              </div>
              )
              :
              (
                  <div>
                    <Text variant="h6">生成的新协议ID： {(result as any)?.id}</Text>
                      <Button size={'lg'} intent="primary"
                              onPress={() => {
                                  history.push(`/agreement/${result.id}/${pttype}`);
                              }}
                      >进入该协议的细节编制
                      </Button>
                </div>
              )
              }

          {!called &&
              <Button size={'lg'}
                              intent="primary"
                              disabled={doing || !servu?.id || !ptno || !ispu}
                              css={{ marginLeft: theme.spaces.sm }}
                              onPress={() => {
                                  //devs: meqp&&[ meqp.id ]
                                  buildTaskFunc('','ADD',
                                      { servu: servu?.id, ptno, pttype, ispu}
                                  );
                              }}
              >
              新协议申请准备发起
              </Button>
          }
          <Spinner doing={doing}/>
        </TwoHalfRightPanel>
  );
};

export default AddToAgreement;
