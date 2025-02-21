import {useCallback, useState} from "react";
import {useToast} from "customize-easy-ui-component";
import { gql, useMutation } from 'urql';

/**整个任务都是用同一个配置的；
 * 但还允许单独针对某个Eqp或某个分项报告另外继续修改特别设置的。
 * */
const mutation = gql`
  mutation useDispatchTaskToMutation($task: ID!,$date:Date!, $verify: ID!,$ispmen:[ID!]!,
    $reviewer: ID!,$approver: ID!,$modeltype: String,$modelversion: Int) 
  {
    dispatchTaskTo(id: $task,taskDate:$date, verify:$verify,ispmen:$ispmen,reviewerId:$reviewer,approverId:$approver,
                modeltype:$modeltype,modelversion:$modelversion){
        id dep{id name} bsType date
    }
  }
`;

export default function useDispatchTaskToMutation() {
  //返回简单结果字段
  const [result, setResult] =useState<string>('');
  const [commit, doing] = useMutation(mutation);
  const toast = useToast();
  return {
    call:useCallback(
      (task: string,date: string,verify: string,ispmen: string[],reviewer: string,approver: string,
                  modeltype: string,modelversion:number) => {
        return commit({
          variables: {
            task, date, verify, ispmen, reviewer, approver,modeltype,modelversion
          },
          updater: (store: RecordSourceSelectorProxy) => {
            const payload = store.getRootField("dispatchTaskTo");
            if (!payload) {
              return;
            }
            //这里无法获取整个Mutation的应答结果，只能够获取字段，所以很多要再套一层结构{task,changeByUserId}好处理获取整个task。或是返回null表示失败？
            const ret = payload.getValue("id");
            console.log("刚 useDispatchTaskToMutation retTask=",ret);
            setResult(ret as string);
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
