import { useMutation } from "react-relay";
import {useCallback, useContext, useState} from "react";
import {
  ConnectionHandler,
  RecordSourceSelectorProxy,
  RecordProxy, PayloadError
} from "relay-runtime";
//import { AddTodoInput } from "./__generated__/useLoginMutation.graphql";
import { UserContext } from "../routing/UserContext";
import {useToast} from "customize-easy-ui-component";
const graphql = require("babel-plugin-relay/macro");

//这个特别！返回{TodoEdge, User} 而不是直接返回TodoNode: Todo就可以了。!多出两个麻烦。
const mutation = graphql`
  mutation useLoginMutation($username: String!, $password: String!) {
    authenticate(username: $username, password: $password)
    { accessToken, user{id username} }
  }
`;

/**账户登录
 * */
export default function useLoginMutation() {
  const [called, setCalled] =useState<boolean>(false);
  // const [result, setResult] =useState<string>('');
  const [commit, doing] = useMutation(mutation);
  const toast = useToast();
  const {user, setUser} =useContext(UserContext);

  return {
    call:useCallback(
        (username : string, password : string ) =>{
          let disposable= commit({
            variables: {
              username,
              password
            },
            updater: (store: RecordSourceSelectorProxy) => {
              //正常应答的第一步就到这里
              //接口是简单类型的返回值，不可以调用getRootField，报错
              //const payload = store.getRootField("cancellationTask");
            },
            onCompleted: (response) => {
              //注意doing在运行到这个位置时刻，就已经是false了，代表后端已经应答doing=false。异步执行，所以结论result不一定马上有的。
              const { authenticate } = response as { authenticate: boolean };
              // setResult( String(authenticate) );
              if(authenticate){         //死等服务端的回答中:
                setUser({authenticate: true} );
                window.location.href = "/";       //强制刷新页面是不经过APP路由器的。后端应答cookie已保存Token,切换URL就复用该token来验证用户。
              }else {
                toast({
                  title: "后端应答",
                  subtitle: '验证失败',
                  intent: "error"
                });
              }
            },
            onError: error => {
              //前端自己处理的报错也会跑到这里:
              // setResult( '报错');
              toast({
                title: "后端应答",
                subtitle: ''+error,
                intent: "error"
              });
            }
          });
          //必须放在commit函数之后的，才会doing逻辑=true生效,doing+called逻辑,保障同步化
          setCalled(true);
          return disposable;
        },
        [commit, toast, setUser]
    ),
    doing,
    // result,
    called,
    reset: ()=>setCalled(false),
  };
}

