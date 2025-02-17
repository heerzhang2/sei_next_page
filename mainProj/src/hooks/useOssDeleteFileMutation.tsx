/** @jsxImportSource @emotion/react */
import { useMutation } from "react-relay";
import {useCallback, useContext, useState} from "react";
// import { RecordSourceSelectorProxy, } from "relay-runtime";
import {AlertContent,Button, useToast} from "customize-easy-ui-component";
import * as React from "react";
import RoutingContext from "../routing/RoutingContext";
import { graphql } from "relay-runtime";

//原本.ts 加了toast组件丰富内容，改成tsx :报错

/**删除minIO文件： 真的删掉 ’成功‘ 若不存在该文件返回： '不存在'；
* */
const mutation = graphql`
  mutation useOssDeleteFileMutation($file: String!,$key: String,$value: String) {
    ossDeleteFile(file: $file,key: $key,value:$value)
  }
`;

/** devs[] 可支持多个批量关联多个设备台账id。
 * 多个入口：都可能添加任务或给任务添加设备或只是改任务参数。 toast支持链接转移
 * */
export default function useOssDeleteFileMutation(callback: (resp: any,arIndex:number) => void) {
  const [called, setCalled] =useState<boolean>(false);
  const [result, setResult] =useState<any>('');
  const [commit, doing] = useMutation(mutation);
  const toast = useToast();
  const { history } = useContext(RoutingContext);

  return {
    call:useCallback(
      (file:string,arIndex:number,key?:string,value?:string) => {
        let disposable= commit({
          variables: {
            file, key, value
          },
          onCompleted: (response) => {
            const {ossDeleteFile: resp}= response as any;
            setResult(resp);
            toast({
              title: "后端应答",
              subtitle: resp==='成功'?'申请提交成功' : '不正常：'+resp,
              intent: resp!=='成功'? "error":"info",
              content: <AlertContent title={"申请单的链接："}>
                      <Button onPress={() =>{
                          history.push('/request/'+resp?.me?.id);
                      } }>跳转到该申请单页面</Button>
                </AlertContent>,
            });
            callback(resp,arIndex);
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
      [commit,toast, callback,history]
    ),
    doing,
    result,
    called,
    reset: ()=>setCalled(false),
  };
}

