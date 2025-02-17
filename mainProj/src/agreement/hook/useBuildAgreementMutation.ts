import { useMutation } from "react-relay";
import {useCallback, useState} from "react";
import { RecordSourceSelectorProxy, } from "relay-runtime";
import {useToast} from "customize-easy-ui-component";
import {AgreementInput, Ifop_Enu} from "./__generated__/useBuildAgreementMutation.graphql";
const graphql = require("babel-plugin-relay/macro");

/**新建立task: 必须最少有个设备？(无关联设备号的单独报告的任务？)
  先生成task后面再来添加eqp;
  全部采用接口函数的直接定义参数来传递输入的模式：有点麻烦/不灵活，不如嵌套一个XxxInput类型的二传手间接汇集型参数。
 最后一个参数$devs[]，允许一次添加多个关联设备: 前端不一定需要一次性添加多个Eqp的操作，多分解成单步一个设备的。多选PK单选? CUD接口；
 底下内省字段加 status，应答之后doing=false,立刻就能在react页面{逻辑判定}会生效的，连续点击按钮触发的是最新render逻辑组件按钮。
* */
const mutation = graphql`
  mutation useBuildAgreementMutation($id: ID,$opt: Ifop_Enu!,$inp:AgreementInput!) {
    cudAgreement(id: $id,opt: $opt,inp:$inp) {
      warn,
      me {
        id auditor{id username} servu{id name company{id}}
         bsType entrust,status
        }
    }
  }
`;

/** devs[] 可支持多个批量关联多个设备台账id。
 * 多个入口：都可能添加任务或给任务添加设备或只是改任务参数。
 * */
export default function useBuildAgreementMutation() {
  const [called, setCalled] =useState<boolean>(false);
  const [result, setResult] =useState<any>('');
  const [commit, doing] = useMutation(mutation);
  const toast = useToast();
  return {
    call:useCallback(
      (id:string,opt:Ifop_Enu,inp:AgreementInput) => {
        let disposable= commit({
          variables: {
            id, opt, inp
          },
          onCompleted: (response) => {
            const {cudAgreement: resp}= response as any;
            setResult(resp?.me);
            toast({
              title: "后端应答",
              subtitle: resp?.warn?? inp.status==='SUBMIT'?'申请提交成功' : '协议ID＝'+ resp?.me?.id,
              intent: resp?.warn? "error":"info"
            });
          },
          onError: error => {
            toast({
              title: "后端应答",
              subtitle: ""+error,
              intent: "warning"
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
