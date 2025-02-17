import { useMutation } from "react-relay";
import {useCallback, useContext, useState} from "react";
import {
  ConnectionHandler,
  RecordSourceSelectorProxy,
  RecordProxy, PayloadError
} from "relay-runtime";
//import { AddTodoInput } from "./__generated__/useLoginMutation.graphql";
import { UserContext } from "../routing/UserContext";
const graphql = require("babel-plugin-relay/macro");

//这个特别！返回{TodoEdge, User} 而不是直接返回TodoNode: Todo就可以了。!多出两个麻烦。
const mutation = graphql`
  mutation useRegisterMutation($username: String!, $password: String!, $mobile: String!, $external: String
    , $eName: String, $ePassword: String)
  {
    newUser(username: $username, password: $password, mobile: $mobile, external: $external
      , eName: $eName, ePassword: $ePassword)
  }
`;


//多输出一个参数 isInFlight 表示正在执行中;
export default function useRegisterMutation() {
  const {user, setUser} =useContext(UserContext);
  const [result, setResult] =useState(false);
  //请求还没应答isInFlight可能早就false; 说明isInFlight不是说有结果而是已经发送。
  const [commit, isInFlight] = useMutation(mutation);
  return {
    call: useCallback(
      (username : string, password : string,mobile:string,
          external:string, eName:string, ePassword:string
      ) =>
        {
          //上面回调参数是 组件编辑器触发发过来的(text, userId)=>{};
          return commit({
            variables: {
              username,
              password,
              mobile,
              external,
              eName,
              ePassword
            },
            updater: (store: RecordSourceSelectorProxy) => {
              //按照服务器应答去更新客户端缓存！这里出错onCompleted不会执行的。
            },
            onCompleted: (response) => {
              //必须把上面的updater:配置函数删除掉才能执行这个onCompleted配置函数!!
              //上面输入response实际是 "raw" server response
              const { newUser } = response as { newUser: boolean };
              // if (!mountedRef.current) {              return;            }
              //完成了 复位。 看principal/src/issue/useMutation.js:
              // requestRef.current = null;
              //setUser（）内容有问题啊？反正!=null? 登录后自然还要跳转页面的重新获取user;
              setResult( true );
              console.log("useLoginMutation返回onCompleted newUser=", newUser);
            },
            onError: error => {
              console.log("useLoginMutation返回onError =",error);
            }
          });
        }
      ,
      [commit]
    ),
    isInFlight,
    result
  };
}

