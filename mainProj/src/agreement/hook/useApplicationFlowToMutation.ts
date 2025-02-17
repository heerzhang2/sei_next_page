import {useCallback, useState} from "react";
import {commitLocalUpdate, useMutation} from "react-relay";
import {ConnectionHandler, RecordProxy, RecordSource, RecordSourceSelectorProxy,} from "relay-runtime";
import {useToast} from "customize-easy-ui-component";
import {Opinion_Enum, useApplicationFlowToMutation$data} from "./__generated__/useApplicationFlowToMutation.graphql";
// import {useRemovePipingUnitMutation$data} from "../pipeline/__generated__/useRemovePipingUnitMutation.graphql";
import {useRelayEnvironment} from "react-relay/hooks";
import {ReadOnlyRecordProxy, Record, RecordSourceProxy} from "relay-runtime/lib/store/RelayStoreTypes";
import {DataID} from "relay-runtime/lib/util/RelayRuntimeTypes";
const graphql = require("babel-plugin-relay/macro");

/*
这里graphql` mutation useFlowToMutation 名字重复报错！！
* */
const mutation = graphql`
  mutation useApplicationFlowToMutation(
    $userTaskId: String!,
    $entId: ID!, $allow: Opinion_Enum=YES,
    $memo: String, $days: Int,
    $men: ID, $uri: String, $calcfee:Boolean
  ) {
    applicationFlowTo(entId: $entId,userTaskId: $userTaskId, allow:$allow,memo: $memo, men:$men,days:$days,uri:$uri,calcfee:$calcfee)
  }
`;

/**审批核准 签字确认
 * 用Toast()替代就在组件内部切换显示结果的模式，result就没必要了。
* */
export default function useMyMutation() {
  const [called, setCalled] =useState<boolean>(false);
  const [result, setResult] =useState<string>('');
  const [commit, doing] = useMutation(mutation);
  const toast = useToast();
  const environment = useRelayEnvironment();

  return {
    call:useCallback(
        (userTaskId: string, entId: string, days:number, uri: string|null, memo: string|null,
              allow?: Opinion_Enum, men?:string, calcfee?:boolean) => {
          let disposable= commit({
            variables: {
              userTaskId, entId, allow, memo, uri, days, men, calcfee
            },
            updater: (store: RecordSourceSelectorProxy, data) => {
              const { applicationFlowTo }= data as useApplicationFlowToMutation$data;
              if(!applicationFlowTo)  return;

              const fromObj0 = store.getRoot();   //正常的 store.get(parentId);
              const relayRecordSource=environment.getStore().getSource() as RecordSource;
              let  ids= relayRecordSource.getRecordIDs();   //"client:root"其它全部base64的。
              // const fromObj2 = store.getRootField("client:root:getTodos(asc:true,first:1)");  //参数容易变动
              const fromObj3 = relayRecordSource.get("getTodosQuery"); // .getRootField("getTodosQuery");  //都报错了

              //"client:root:getTodos(asc:true,first:3)"
              let fromObj = relayRecordSource.get("client:root:getTodos");

              sharedUpdater(store,  userTaskId, fromObj);
            },
            onCompleted: (response) => {
              //注意doing在运行到这个位置时刻，就已经是false了，代表后端已经应答doing=false。异步执行，所以结论result不一定马上有的。
              console.log("useCancellationTaskMutation回onCompleted 完成1=", response);
              const { applicationFlowTo } = response as { applicationFlowTo: boolean };
              setResult( '完成:'+applicationFlowTo );
              toast({
                title: "后端回答了",
                subtitle: '应答flowTo='+applicationFlowTo,
                intent: "success"
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
          //必须放在commit函数之后的，才会doing逻辑=true生效,doing+called逻辑,保障同步化
          setCalled(true);
          return disposable;
        },
        [commit, toast, environment]
    ),
    doing,
    result,
    called,
    reset: ()=>setCalled(false),
  };
}

function sharedUpdater(
    store: RecordSourceSelectorProxy,
    //parentId: string,   正常的上一级节点
    deletedID: string,   fromObj : unknown
) {

  if (!fromObj) {
    return;
  }
  //对应父辈模型所关联的集合[List]属性字段， 其旁边所标注的@connection(key: "TodoList_todos")
  const connection = ConnectionHandler.getConnection(
      fromObj as unknown as ReadOnlyRecordProxy,
      "Query__getTodos"
  );
  if (!connection) {
    return;
  }
  ConnectionHandler.deleteNode(connection, deletedID);
}

