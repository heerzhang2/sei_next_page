import { useMutation } from "react-relay";
import {useCallback, useState} from "react";
import { RecordSourceSelectorProxy, } from "relay-runtime";
import {useToast} from "customize-easy-ui-component";
import { BusinessCat_Enum,TaskDetailInput } from "./__generated__/useBuildTaskMutation.graphql";
import { graphql } from "relay-runtime";

/**新建立task: 必须最少有个设备？(无关联设备号的单独报告的任务？)
  先生成task后面再来添加eqp;
  全部采用接口函数的直接定义参数来传递输入的模式：有点麻烦/不灵活，不如嵌套一个XxxInput类型的二传手间接汇集型参数。
 最后一个参数$devs[]，允许一次添加多个关联设备: 前端不一定需要一次性添加多个Eqp的操作，多分解成单步一个设备的。多选PK单选? CUD接口；
* */
const mutation = graphql`
  mutation useBuildTaskMutation($date: Date!,$bsType: BusinessCat_Enum!,$entrust:Boolean!,$servuId:ID!,$depId:ID,$officeId:ID,$liablerId:ID,$devs: [ID!],$in:TaskDetailInput) {
    addTask(date: $date,bsType: $bsType,entrust:$entrust,servuId:$servuId,depId:$depId,officeId:$officeId,liablerId:$liablerId,devs: $devs,in:$in) {
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

/** devs[] 可支持多个批量关联多个设备台账id。
 * 多个入口：都可能添加任务或给任务添加设备或只是改任务参数。
 * */
export default function useBuildTaskMutation() {
  const [called, setCalled] =useState<boolean>(false);
  const [result, setResult] =useState<any>('');
  const [commit, doing] = useMutation(mutation);
  const toast = useToast();
  return {
    call:useCallback(
      (date:string,bsType:BusinessCat_Enum,entrust:Boolean,servuId:String,depId?:string,officeId?:string,liablerId?:string,devs?: string[],inp?:TaskDetailInput) => {
        let disposable= commit({
          variables: {
            date, bsType, entrust, servuId, depId, officeId, liablerId,  devs, in:inp,
          },
          onCompleted: (response) => {
            setResult((response as any).addTask);
            console.log("跑到useBuildTaskMutation2输出=", response,"servuId=",servuId);
            toast({
              title: "生成任务应答",
              subtitle: '新Task的ID＝'+ (response as any).addTask.id,
              intent: "info"
            });
          },
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
