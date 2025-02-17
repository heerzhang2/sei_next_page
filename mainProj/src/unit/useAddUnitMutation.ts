import { useMutation } from "react-relay";
import {useCallback, useState} from "react";
import {
  RecordSourceSelectorProxy,
} from "relay-runtime";
import { UnitCommonInput } from "./__generated__/useAddUnitMutation.graphql";
import {useAddUnitMutation$data} from "./__generated__/useAddUnitMutation.graphql";
import {useToast} from "customize-easy-ui-component";

import { graphql } from "relay-runtime";

//这个特别！返回{TodoEdge, User} 而不是直接返回TodoNode: Todo就可以了。!多出两个麻烦。
const mutation = graphql`
  mutation useAddUnitMutation($unit: UnitCommonInput!) {
    newUnitExternalSource(unit: $unit) {
      id  company{id name}, person {id name}
    }
  }
`;

export default function useAddUnitMutation() {
  const [called, setCalled] =useState<boolean>(false);
  const [result, setResult] =useState<useAddUnitMutation$data |undefined>();
  const [commit, doing] = useMutation(mutation);
  const toast = useToast();
  return {
    call:useCallback(
        (unit: UnitCommonInput) => {
          let disposable= commit({
            variables: {
              unit
            },
            updater: (store: RecordSourceSelectorProxy, data) => {
              const payload = store.getRootField("newUnitExternalSource");
              if (!payload) {
                return;
              }
              //const retUnitId: any = payload.getValue("id");
              //setResult(retUnitId);
              //sharedUpdater(store, isp, payload);
            },
            onCompleted: (response) => {
              setResult(response as any);
              console.log("跑到useAddUnitMutation输出=", response);
              toast({
                title: "增加单位应答",
                subtitle: '新单位的ID＝'+ (response as any).newUnitExternalSource.id,
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

