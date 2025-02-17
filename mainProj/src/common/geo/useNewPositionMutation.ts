import { useMutation } from "react-relay";
import {useCallback, useState} from "react";
//import { AddressInput } from "./__generated__/useNewPositionMutation.graphql";
//import {useNewPositionMutationResponse} from "./__generated__/useNewPositionMutation.graphql";
import {useToast} from "customize-easy-ui-component";

import { graphql } from "relay-runtime";

/*const mutation = graphql`
  mutation useNewPositionMutation($par:AddressInput!) {
    newPosition(par:$par) {
      id name
    }
  }
`;*/

export default function useNewPositionMutation() {
  const [called, setCalled] =useState<boolean>(false);
  //const [result, setResult] =useState<useNewPositionMutationResponse |undefined>();
  /*const [commit, doing] = useMutation(mutation);*/
  const toast = useToast();
  return {
   /* call:useCallback(
        (par: AddressInput) => {
          let disposable= commit({
            variables: {
              par
            },
            onCompleted: (response) => {
              setResult(response as any);
              toast({
                title: "申请增加地址应答",
                subtitle: '新的ID＝'+ (response as any).newPosition.id,
                intent: "info"
              });
            },
            onError: error => {
              toast({
                title: "申请增加地址应答",
                subtitle: '返回错误:'+error,
                intent: "error"
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
    result,*/
    called,
    reset: ()=>setCalled(false),
  };
}
