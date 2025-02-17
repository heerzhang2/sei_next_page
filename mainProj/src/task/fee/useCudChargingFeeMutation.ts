import { useMutation } from "react-relay";
import {useCallback, useContext, useState} from "react";
import {
  ConnectionHandler,
  RecordSourceSelectorProxy,
  RecordProxy, MutationParameters
} from "relay-runtime";
import {FeeItemInput, Ifop_Enu,useCudChargingFeeMutation$data} from "./__generated__/useCudChargingFeeMutation.graphql";
import {useToast} from "customize-easy-ui-component";


const graphql = require("babel-plugin-relay/macro");


//【特别问题】 底下的应答解构 bus{fees{}} 如果用fees{id}导致新增加返回的实体字段不全面，而且当前页面正好需要这个数据的情况，就会报错！！
//【注意!!】 mutation 返回的应答,假如realy前端实际有做了内省的，返回的实体会依照Global ID来替换旧的实体数据，导致自动更新页面的,已经有的字段不会删除,会替换相同字段。
//底下若是去掉   ...FeesListItem    就无法立刻更新页面数据。
//接口直接把被更新数据[fees List]统统返回的这种方式更新： 有个问题，性能不是很好。 后端负担加重了，需要后端直接把刚刚修改的对象统统地都送过来啊。
/*cudChargingFee{  bus{
        id ident type feeOk sprice  fees {  ...FeesListItem  }
         }  }
* */
const mutation = graphql`
  mutation useCudChargingFeeMutation($busTaskId: ID!,$opt: Ifop_Enu!,$inp:FeeItemInput!) {
    cudChargingFee(busTaskId:$busTaskId,opt:$opt,inp: $inp) {
      warn fee { id code manual amount fm mnum  memo } 
    }
  }
`;

/*做法 1 另一个 处理方式：
 异步，列表connection<>的动态自动更新，也不需要等待后端处理结果。
export default function useCudChargingFeeMutation() return commit(updater:{ function sharedUpdater(
*/

//做法 2 同步更新方式： 必需等待后端的应答后才能进行余下的操作。
export default function useCudChargingFeeMutation() {
  const [called, setCalled] =useState<boolean>(false);
  const [result, setResult] =useState<any>('');
  const [commit, doing] = useMutation(mutation);
  const toast = useToast();
  return {
    call:useCallback(
        (busTaskId: string, opt: Ifop_Enu, inp:FeeItemInput) => {
          let disposable= commit({
            variables: {
              busTaskId, opt, inp
            },
            /*数据更新模式考虑：增加数据前端只能提供一部分结果的。点击增加或删除累计多次之后一起再做手动刷新：业务面考虑重新计算收费金额！
            不见得：一定需要每次增加或删除就得立刻给你反馈，界面上还保留旧数据列表，等待用户明确地点击刷新。临时对删除项目页面标记红色。
            * */
            updater: (store: RecordSourceSelectorProxy, data:MutationParameters['response']| null | undefined) => {
              const payload = store.getRootField("cudChargingFee");
              if(!payload)   return;
              if (opt==="ADD") {
                //这里无法获取整个Mutation的应答结果，只能够获取字段，所以很多要再套一层结构{task,changeByUserId}好处理获取整个task。或是返回null表示失败？
                //const resFee1 = payload.getValue("bus");    .getValue()：只能用于提取非对象的标量类型字段，属于可内省模型对象的关联属性字段不能用。
                const addItem = payload.getLinkedRecord("fee");
                const changeObj = store.get(busTaskId);
                // !==双方必须同样类型    !=会转换类型（双方数据类型可不一样的）
                if (addItem!=null && changeObj != null) {
                  //若用.invalidateRecord()会让整个对象失效!，可能触发不止一个的请求{上一级路由查询，下一级路由查询是分开的2次请求包}，不会优化:后面都内省的字段前面就不需要再做请求。
                  //changeObj.invalidateRecord();    这个做法：感觉不是很好。
                  const oldArr = changeObj.getLinkedRecords("fees");
                  oldArr?.push(addItem);
                  changeObj?.setLinkedRecords(oldArr, "fees");     //修改后必须重新setXxx塞回去！
                }
              }
              else if (opt==="DEL") {
                const delId=inp.id;
                const delItem = payload.getLinkedRecord("fee");   //==null代表后端已经没有该记录
                const changeObj = store.get(busTaskId);
                if (changeObj != null && null==delItem) {
                  const oldArr = changeObj.getLinkedRecords("fees");
                  const newArr=oldArr?.filter(function (edge:RecordProxy, i:number, arr:RecordProxy<{}>[]) {
                    const itId = edge.getValue("id");
                    return  (itId !== delId);
                  });
                  changeObj?.setLinkedRecords(newArr, "fees");     //修改后必须重新setXxx塞回去！
                }
              }  //if 'UPD' 不需要，会自动覆盖的。
            },
            onCompleted: (response) => {
              //注意doing在运行到这个位置时刻，就已经是false了，代表后端已经应答doing=false。异步执行，所以结论result不一定马上有的。
              const { cudChargingFee } = response as useCudChargingFeeMutation$data;
              setResult( cudChargingFee );
      /*     toast({
                title: "后端回答了",
                subtitle: '应答=['+ cudChargingFee.warn?? +']',
                intent: "success"
              }); */
            },
            onError: error => {
              console.log("useCancellationTaskMutation回onError1 =",error);
              setResult( '报错');
              toast({
                title: "后端回答了",
                subtitle: '新Task的ID＝'+error,
                intent: "warning"
              });
            }
          });
          //必须放在commit函数之后的，才会doing逻辑=true生效,doing+called逻辑,保障同步化
          setCalled(true);
          return disposable;
        },
        [commit, toast]
    ),
    doing,
    result,
    called,
    reset: ()=>setCalled(false),
  };
}

