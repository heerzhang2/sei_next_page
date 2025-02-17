import {useCallback, useState} from "react";
import { useMutation } from "react-relay";
import {RecordSourceSelectorProxy,} from "relay-runtime";
import {useToast} from "customize-easy-ui-component";
import { graphql } from "relay-runtime";

//变更命令执行，后端真的返回应答Task对象内省部分字段{id,status},真的可以立刻更新页面的。Relay自动刷新页面显示。
const mutation = graphql`
  mutation useFinishTaskMutation(
    $taskId: ID!
  ) {
    finishTask(taskId: $taskId){
      id,status
    }
  }
`;

export default function useFinishTaskMutation() {
  const [called, setCalled] =useState<boolean>(false);
  const [result, setResult] =useState<string>('');
  const [commit, doing] = useMutation(mutation);
  const toast = useToast();
  return {
    call:useCallback(
      (taskId: string) => {
        let disposable= commit({
          variables: {
            taskId
          },
          updater: (store: RecordSourceSelectorProxy) => { },
          onCompleted: (response) => {
            const { finishTask } = response as any;
            setResult( '完成:'+finishTask );
            toast({
              title: "后端回答了",
              subtitle: '应答finishTask='+finishTask,
              intent: "info"
            });
          },
          onError: error => {
            setResult( '报错');
            toast({
              title: "派工返回了",
              subtitle: '新Task的ID＝'+error,
              intent: "info"
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
