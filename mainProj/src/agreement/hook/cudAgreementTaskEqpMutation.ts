import { useMutation } from "react-relay";
import {useCallback, useContext, useState} from "react";
import {
  ConnectionHandler,
  RecordSourceSelectorProxy,
  RecordProxy, MutationParameters
} from "relay-runtime";
import {Ifop_Enu,cudAgreementTaskEqpMutation$data} from "./__generated__/cudAgreementTaskEqpMutation.graphql";
import {useToast} from "customize-easy-ui-component";


import { graphql } from "relay-runtime";


//【特别问题】 底下的应答解构 bus{fees{}} 如果用fees{id}导致新增加返回的实体字段不全面，而且当前页面正好需要这个数据的情况，就会报错！！
//【注意!!】 mutation 返回的应答,假如realy前端实际有做了内省的，返回的实体会依照Global ID来替换旧的实体数据，导致自动更新页面的,已经有的字段不会删除,会替换相同字段。
//底下若是去掉   ...FeesListItem    就无法立刻更新页面数据。
//接口直接把被更新数据[fees List]统统返回的这种方式更新： 有个问题，性能不是很好。 后端负担加重了，需要后端直接把刚刚修改的对象统统地都送过来啊。
/**变更同时也直接为订阅数据更新的其它组件页面获取更新修改后的后端数据。
 * 不加上形式参数$afterdl:String,$first:Int=30,$orderBydl:String, $wheredl:TaskDetailInput就会编译报错，BoundDevices片段里面要求输入的。
* */
const mutation = graphql`
  mutation cudAgreementTaskEqpMutation($agreement: ID!,$opt: Ifop_Enu!,$devs:[ID!]!,$task: ID
  ) {
    cudEqpToAgreementTask(agreement:$agreement,opt:$opt,devs:$devs,task: $task) {
      id,status, charge, mdtime,
      tasks{id,status, eqpcnt, charge, feeOk}
    }
  }
`;


/*做法 1 另一个 处理方式：
 异步，列表connection<>的动态自动更新，也不需要等待后端处理结果。
*/

//做法 2 同步更新方式： 必需等待后端的应答后才能进行余下的操作。
//把过滤器和排序字段参数用接口单一个新参数filobj来汇聚后带入，实际含有{orderBydl: wheredl:}两个，为了能够支持不用invalidateRecord来同步。参数和默认参数不匹配还是不能兼顾到！
export default function useDefaultMutation() {
  const [called, setCalled] =useState<boolean>(false);
  const [result, setResult] =useState<any>('');
  const [commit, doing] = useMutation(mutation);
  const toast = useToast();
  return {
    call:useCallback(
        (agreement: string, opt: Ifop_Enu, devs: string[], task?: string) => {
          let disposable= commit({
            variables: {
              agreement, opt, devs, task,
            },
            /*数据更新模式考虑：这个会死等后端的应答的，不会提前更新客户机界面。 optimisticUpdater：{}才会。而onCompleted最后一步运行。
            * */
            updater: (store: RecordSourceSelectorProxy, data:MutationParameters['response']| null | undefined) => {
              const payload = store.getRootField("cudEqpToAgreementTask");
              if(!payload)   return;
              if (opt==="ADD") {
                //这里无法获取整个Mutation的应答结果，只能够获取字段，所以很多要再套一层结构{task,changeByUserId}好处理获取整个task。或是返回null表示失败？
                //const resFee1 = payload.getValue("bus");    .getValue()：只能用于提取非对象的标量类型字段，属于可内省模型对象的关联属性字段不能用。
                const addItem = payload.getLinkedRecords("tasks");     //原来是有附带内省字段.getLinkedRecord("newTask")
                const changeObj = store.get(agreement);
                // !==双方必须同样类型    !=会转换类型（双方数据类型可不一样的）
                if (addItem!=null && changeObj != null) {
                  //若用.invalidateRecord()会让整个对象失效!，可能触发不止一个的请求{上一级路由查询，下一级路由查询是分开的2次请求包}，不会优化:后面都内省的字段前面就不需要再做请求。
                  // changeObj.invalidateRecord();       //感觉不是很好。?底下的details 设备列表：过滤 排序？
                }
              }
              else if (opt==="DEL") {
                const changeObj = store.get(agreement);
                // changeObj?.invalidateRecord();      //新参数filobj只顾自个，也不能确保其他页面也能同步更新。还只能做绝上.invalidateRecord();来得稳妥。
              }else if (opt==="UPD") {
                const changeObj = store.get(agreement);
                //【神奇】光靠上面graphql内省...BoundDevices就能做到页面同步更新，也不惧connection的分页参数。但是过滤或排序参数加上后这样是无法自动更新;可能是没有传递graphql内省参数有关？
                // changeObj?.invalidateRecord();
                const newTaskObj = store.get(task!);
                // newTaskObj?.invalidateRecord();      //不加上.invalidateRecord()只能针对普通分页看着正常的；但是过滤器或排序字段填上后就不能同步双新页面了。
              }
            },
            onCompleted: (response) => {
              //注意doing在运行到这个位置时刻，就已经是false了，代表后端已经应答doing=false。异步执行，所以结论result不一定马上有的。
              const { cudEqpToAgreementTask } = response as cudAgreementTaskEqpMutation$data;
              const agreement=cudEqpToAgreementTask
              setResult( cudEqpToAgreementTask );
              let message='结果＝'+agreement?.id;
              if (opt==="ADD" && task){
                //新返回任务情况？ 需把当前任务切换为新的任务？
                sessionStorage['当前任务'] =JSON.stringify(task);
                message+=";并把新生成任务设定为当前任务了";
              }
              toast({
                title: "后端回答了",
                subtitle: message,
                intent: agreement? "success" : "warning"
              });
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

