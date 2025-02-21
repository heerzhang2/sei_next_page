import {useCallback, useState} from "react";
import {useToast} from "customize-easy-ui-component";
import { gql, useMutation } from 'urql';

const mutation = gql`
  mutation useDispatchToOfficeMutation($task: ID!,$office: String!) {
    dispatchToOffice(task: $task, office:$office){
        id dep{id name} bsType date
    }
  }
`;

export default function useDispatchToOfficeMutation() {
  //返回简单结果字段
  const [result, setResult] =useState(false);
  const [commit, doing] = useMutation(mutation);
  const toast = useToast();
  return {
    call:useCallback(
      (task: string,office: string) => {
        return commit({
          variables: {
            task, office
          },
          updater: (store: RecordSourceSelectorProxy) => {
            const payload = store.getRootField("dispatchToOffice");
            if (!payload) {
              return;
            }
            //这里无法获取整个Mutation的应答结果，只能够获取字段，所以很多要再套一层结构{task,changeByUserId}好处理获取整个task。或是返回null表示失败？
            const ret: any = payload.getValue("id");
            console.log("刚useDispatchToOfficeMutation retTask=",ret);
            setResult(ret);
            //提醒用户后端回答是成功或失败
            toast({
              title: "派工返回了",
              subtitle: '新Task的ID＝'+ret,
              intent: "info"
            });
          },
          onError: error => {
            toast({title: "后端回答",subtitle: ""+error, intent: "warning"});
          }
        });
      },
      [commit,toast]
    ),
    doing,
    result
  };
}
