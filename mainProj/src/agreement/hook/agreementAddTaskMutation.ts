import { useMutation } from "react-relay";
import {useCallback, useState} from "react";
import { RecordSourceSelectorProxy, } from "relay-runtime";
import {useToast} from "customize-easy-ui-component";
import { BusinessCat_Enum } from "./__generated__/agreementAddTaskMutation.graphql";
const graphql = require("babel-plugin-relay/macro");

/**新建立task: 必须最少有个设备？(无关联设备号的单独报告的任务？)
  先生成task后面再来添加eqp;
  全部采用接口函数的直接定义参数来传递输入的模式：有点麻烦/不灵活，不如嵌套一个XxxInput类型的二传手间接汇集型参数。
 最后一个参数$devs[]，允许一次添加多个关联设备: 前端不一定需要一次性添加多个Eqp的操作，多分解成单步一个设备的。多选PK单选? CUD接口；
 graphql`‘’描述定义体和容易重名冲突！ 整个工程范围不能同样名字。如mutation useBuildTaskMutation 必须换个名字啊@必须跟随module name文件名。
* */
const mutation = graphql`
  mutation agreementAddTaskMutation($agreId:ID!,$date: Date!,$bsType: BusinessCat_Enum!,$entrust:Boolean,$devs: [ID!]) {
    agreementAddTask(agreId: $agreId, date: $date,bsType: $bsType,entrust:$entrust,devs: $devs) {
      id date dep{id name} office{id name} liabler{id username} servu{id name company{id}}
      type bsType entrust
      detail_list {
        edges {
          node {
           id type ident
            isp{id dev{id,oid,cod}} 
          }
        }
      }
    }
  }
`;

/**可以缺省输出hook
 * */
export default function useDefaultMutation() {
  const [called, setCalled] =useState<boolean>(false);
  const [result, setResult] =useState<any>('');
  const [commit, doing] = useMutation(mutation);
  const toast = useToast();
  return {
    call:useCallback(
      (agreId:string, date:string,bsType:BusinessCat_Enum,entrust:Boolean,devs?: string[]) => {
        let disposable= commit({
          variables: {
            agreId, date, bsType, entrust, devs
          },
          onCompleted: (response) => {
            setResult((response as any).agreementAddTask);
            console.log("跑到useBuildTaskMutation2输出=", response);
            toast({
              title: "生成任务应答",
              subtitle: '新Task的ID＝'+ (response as any).agreementAddTask?.id,
              intent: "info"
            });
          },
          onError: error => {
            console.log("agreementAddTaskMutation：",error);
            toast({
              title: "后端回答",
              subtitle: ''+error,
              intent: "warning"
            });
          }
        });
        //必须放在commit函数之后的，才会doing逻辑=true生效,doing+called逻辑,保障同步化
        setCalled(true);
        return disposable;
      },
      [commit,toast]
    ),
    doing,
    result,
    called,
    reset: ()=>setCalled(false),
  };
}

