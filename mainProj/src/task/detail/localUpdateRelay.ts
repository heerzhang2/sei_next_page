import {useCallback, } from "react";
import {commitLocalUpdate, } from "react-relay";
import {ConnectionHandler, } from "relay-runtime";
import {useRelayEnvironment} from "react-relay/hooks";
import { graphql } from "relay-runtime";


/**列表的多个项目的 多选选择模式处理。 通常是extend Type xxx {selected :Boolean }
 * 不用理会服务器：客户机浏览器界面上直接处理Relay Store。
 * */
export function useToggleItemSelect() {
  const environment = useRelayEnvironment();
  return {
    call:useCallback(
        (objID: string) => {
          commitLocalUpdate(environment, store => {
              const relayObj= store.get(objID);
              if(!relayObj)   return;
              const selected= relayObj.getValue("selected") as boolean;
              relayObj.setValue(!selected,"selected");
          });
        },
        [environment]
    ),
  };
}


