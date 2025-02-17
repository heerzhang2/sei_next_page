import {useCallback, useState} from "react";
import { useMutation } from "react-relay";
import {RecordSourceSelectorProxy,} from "relay-runtime";
import {useToast} from "customize-easy-ui-component";
const graphql = require("babel-plugin-relay/macro");

const mutation = graphql`
  mutation useCancellationTaskMutation(
    $task: ID!
    $reason: String
  ) {
    cancellationTask(task: $task,  reason: $reason)
  }
`;

/*
底下的 call:useCallback() 回调函数只能异步执行，无法用await 来等待同步化的。只能采用setResult和doing来修正和同步化处置。
返回的 result实际不是很有用的, relay直接替换Query关联数据。
返回的 doing, called, reset主要是提供同步机制，让用户等待后端的应答，不允许并发地搞其它的操作。
调用接口操作的组件可以通过 useEffect + Spinner 来保障接口的同步化，让用户务必要耐心等待后端应答后才能继续上路，避免异步并发可能导致逻辑混乱。
* */
export default function useCancellationTaskMutation() {
  const [called, setCalled] =useState<boolean>(false);
  const [result, setResult] =useState<string>('');
  const [commit, doing] = useMutation(mutation);
  const toast = useToast();
  return {
    call:useCallback(
      (task: string,reason: string) => {
        let disposable= commit({
          variables: {
            task, reason
          },
          updater: (store: RecordSourceSelectorProxy) => {
            //正常应答的第一步就到这里
            //接口是简单类型的返回值，不可以调用getRootField，报错
            //const payload = store.getRootField("cancellationTask");
          },
          onCompleted: (response) => {
            //注意doing在运行到这个位置时刻，就已经是false了，代表后端已经应答doing=false。异步执行，所以结论result不一定马上有的。
            console.log("useCancellationTaskMutation回onCompleted 完成1=", response);
            const { cancellationTask } = response as { cancellationTask: string };
            setResult( '完成:'+cancellationTask );
            toast({
              title: "后端回答",
              subtitle: '应答cancellationTask='+cancellationTask,
              intent: cancellationTask? "error": "success"
            });
          },
          onError: error => {
            //前端自己处理的报错也会跑到这里:
            console.log("useCancellationTaskMutation回onError1 =",error);
            setResult( '报错');
            toast({
              title: "派工返回了",
              subtitle: '新Task的ID＝'+error,
              intent: "info"
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
