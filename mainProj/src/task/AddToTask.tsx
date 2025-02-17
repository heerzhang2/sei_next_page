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
    IconKey, VerticalMenu, DdMenuItem
} from "customize-easy-ui-component";
//import {   useAddToTask } from "../db";
//import { useSession } from "../auth";

//import { Link as RouterLink,  } from "wouter";
import useBuildTaskMutation from "./useBuildTaskMutation";
import NewDevice from "../device/NewDevice";

import {Link as RouterLink} from "../routing/Link";
import {useContext} from "react";
import UserContext from "../routing/UserContext";
import {ContainerDesignClsTil, getFeeTitleFe} from "../dict/feeTitleFe";

import {ChooseUnit} from "../unit/ChooseUnit";
import {getFormatDate} from "../common/tool";
import {ChooseDevice} from "../device/ChooseDevice";
import { 业务类型s, } from "../device/edit/CommnBase";
import RoutingContext from "../routing/RoutingContext";
import {DeviceClassSelect} from "../device/DeviceClassSelect";
//import {Spinner} from "../comp/Spinner";
//import { awaitExpression } from "@babel/types";

//[HOOK限制]按钮点击函数内部直接上toast()或toaster.notify()很可能无法正常显示。而放在函数组件顶层render代码前却能正常。


export interface ComposeProps {
}
//这种路由写法：params:{ id }是空的，不会接收上级<Route />路由器给的:id。
export const AddToTask = ({
    ...other
}: ComposeProps) => {
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
    const [depId, setDepId] = React.useState<any>(save? save.depId : user.dep?.id);
    //const [servu, setServu] = React.useState(save? save.servu : window.history.state?.state?.servu);
    //setServu({id, name}) 单位选择伪对话框，或者预设单位取值的，保存给后端，都是只需要id+name;
    const [servu, setServu] = React.useState(save? save.servu : null);
    const [meqp, setMeqp] = React.useState(save? save.meqp : null);
    const [bsType, setBsType] = React.useState(save? save.bsType : 'REGUL');
    const [entrust, setEntrust] = React.useState(save? save.entrust : false);
    const [noTaiz, setNoTaiz] = React.useState(save? save.noTaiz : false);
    let  delayds=31;      //默认任务日期 Default task date延后天数=31天 Delayed days
    const [date, setDate] = React.useState(save&&save.date? save.date : getFormatDate(new Date(delayds*1000*60*60*24 + Date.now()) ));
    console.log("AddTask返回last页面 save=", save,"date=",date);
/*原来嵌套updateRecipe是同步等待的方式： "2018-09-12"
  const {result, submit:updateFunc,  } = useAddToTask({
    dep: ingredients && ingredients.dep,
    devs: id, date:ingredients && ingredients.date,
    });
  */
  const {call:buildTaskFunc,doing,result, called, reset}= useBuildTaskMutation();
    console.log("AddToTask页面刷新result:", result ,"called=",called);
   //const servu=window.history.state?.state?.servu;      //外部注入的参数
    console.log("AddtoTassk其它path传递参数来servu=",window.history.state?.state," servu=",servu);
    /**编辑器正在编辑数据的暂时保留(路由切换切回后还能取回)，从为对话框页面路由返回之后再利用已经修改数据。
     * 多个设备一起挑选 麻烦，这里【限制】保留一个设备meqp的跳转恢复。
     * */
    async function confirmation() {
        //假如伪对话框是嵌套的情况：连续两次弹出对话框=连续两次跳转路由页面的伪对话框，那就需要保存两次.state?.state，也需要像个堆栈那样处理，保存2次和恢复两次的编辑器已修改的状态数据，嵌套形式。
        //如果这里是第二次弹跳伪对话框情况：.state?.state的第一层保存对象!=null，必须在这里当成单独的属性再次保存：比如按规范命名为 nestedstate:{},和普通字段平等的。
        const newdat={
            depId, servu, date, meqp, bsType, entrust,noTaiz,eqptp
        };
        return newdat;
    }
    const { history } = useContext(RoutingContext);
    const [eqptp, setEqptp] = React.useState<any>(save? save.eqptp : null);

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
            title={ `新的任务创建` }
        >
            <Text variant="h5">任务明细{user.unit?.id}信息</Text>
              {!called ? (
              <div>
                <Text  variant="h6">自动生成新的任务号；任务到期日必填；不需要协议受理审核的模式可直接设立新的业务任务</Text>
              {/*   <ContainLine display={'服务单位：'}>
                      <TransparentInput  defaultValue={servu?.name}/>
                  </ContainLine>*/}
                  <InputLine label={`服务单位:`}>
                      <ChooseUnit id={servu?.id} name={servu?.name} field={'servu'}
                                  autoFocus={field==='servu'}
                                  onCancel={() => { setServu(undefined) }}
                                  onDialog={async () => { return await confirmation() } }
                      />
                  </InputLine>
                  <InputLine label={`业务类型:`}>
                      <Select inputSize="md"  value={ bsType || ''}
                              onChange={e => setBsType( e.currentTarget.value||undefined ) } >
                          { 业务类型s.map(([enumv,title],i) => (<option key={i} value={enumv}>{title}</option> )) }
                      </Select>
                  </InputLine>
                  <InputLine label={`是委托的业务:`}>
                      <CheckSwitch  checked= {entrust || false}
                                    onChange={e => setEntrust(entrust? undefined:true) } />
                  </InputLine>
                  <InputLine label='检验部门'>
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
                  </InputLine>
                  <InputLine label={`任务到期日期:`}>
                      <Input type='date'  value={ date  || ''}
                             onChange={e => setDate( e.currentTarget.value||undefined ) } />
                  </InputLine>
                  <InputLine label={`是没有设备台账的业务:`}>
                      <CheckSwitch  checked= {noTaiz || false}
                                    onChange={e => setNoTaiz(noTaiz? undefined:true) } />
                  </InputLine>
                  { noTaiz? <DeviceClassSelect  eqp={eqptp} setSelectClass={setEqptp} />
                      :
                      <InputLine label={`挑个台账中的设备:`}>
                          <ChooseDevice id={meqp?.id} name={meqp?.name} field={'meqp'}
                                        autoFocus={field==='meqp'}
                                        onCancel={() => { setMeqp(undefined) }}
                                        onDialog={async () => { return await confirmation() } }
                          />
                      </InputLine>
                  }

              </div>
              )
              :
              ( <div>
              <Text variant="h6">生成的新任务ID： {(result as any).id}</Text>
                  <Button size={'lg'} intent="primary"
                          onPress={() => {
                              sessionStorage['当前任务'] =JSON.stringify(result?.id);
                          }}
                  >设定为当前任务
                  </Button>
              </div> )
              }

          {!called && <Button size={'lg'}
                              intent="primary"
                              disabled={doing || !date}
                              css={{ marginLeft: theme.spaces.sm }}
                              onPress={() => {
                                  buildTaskFunc(date,
                                      bsType, entrust, servu?.id,
                                      depId, '', '',
                                      meqp&&[ meqp.id ], {...eqptp}
                                  );
                              }}
          >
              新设立检验任务
          </Button>
          }
          <Spinner doing={doing}/>
        </TwoHalfRightPanel>
  );
};

export default AddToTask;
