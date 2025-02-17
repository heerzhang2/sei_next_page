//import { useMutation } from "react-relay";
import {useCallback, useContext, useEffect, useState} from "react";
import { RecordSource, RecordSourceSelectorProxy } from "relay-runtime";
import {useRelayEnvironment, useMutation} from 'react-relay/hooks';
import { UserContext } from "../routing/UserContext";
import RoutingContext from "../routing/RoutingContext";

import { graphql } from "relay-runtime";

//注销
//这个特别！返回{TodoEdge, User} 而不是直接返回TodoNode: Todo就可以了。!多出两个麻烦。
const mutation = graphql`
  mutation useLogoutMutation {
    logout
  }
`;


//多输出一个参数 isInFlight 表示正在执行中;
export default function useLogoutMutation() {
  const {user, setUser} =useContext(UserContext);
  //请求还没应答isInFlight可能早就false; 说明isInFlight不是说有结果而是已经发送。
  const [result, setResult] =useState(false);
  const environment = useRelayEnvironment();
  const [commit, isInFlight] = useMutation(mutation);
  const { history } = useContext(RoutingContext);
  useEffect(() => {
    if(result)   history.replace("/");
  }, [result,history]);
  return {
    call: useCallback(
      () =>
        {
          //上面回调参数是 组件编辑器触发发过来的(text, userId)=>{};
          return commit({
            variables: {
            },
            updater: (store: RecordSourceSelectorProxy) => {
              //按照服务器应答去更新客户端缓存！这里出错onCompleted不会执行的。
            },
            onCompleted: (response) => {
              //必须把上面的updater:配置函数删除掉才能执行这个onCompleted配置函数!!
              //上面输入response实际是 "raw" server response
              const { logout } = response as { logout: boolean };
              // if (!mountedRef.current) {              return;            }
              //完成了 复位。 看principal/src/issue/useMutation.js:
              // requestRef.current = null;
              //setUser（）内容有问题啊？反正!=null? 登录后自然还要跳转页面的重新获取user;
              setResult( true );
              setUser(null );
              //注销了，必须清空所有数据。 若页面没切换的会重新获取数据，代价大
              const relayRecordSource=environment.getStore().getSource() as RecordSource;
              relayRecordSource.clear();
              //window.location.href = "/";
              //history.replace("/");
              console.log("useLogoutMutation返回onCompleted =", logout);
            },
            onError: error => {
              console.log("useLoginMutation返回onError =",error);
            }
          });
        }
      ,
      [commit, setUser,environment]
    ),
    isInFlight,
    result
  };
}

