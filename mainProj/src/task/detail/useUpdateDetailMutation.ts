import { useMutation } from "react-relay";
import {useCallback, useContext, useState} from "react";
import {
  ConnectionHandler,
  RecordSourceSelectorProxy,
  RecordProxy, MutationParameters
} from "relay-runtime";
import {DetailInput, useUpdateDetailMutation$data} from "./__generated__/useUpdateDetailMutation.graphql";
import {useToast} from "customize-easy-ui-component";


const graphql = require("babel-plugin-relay/macro");


//【特别问题】 底下的应答解构 bus{fees{}} 如果用fees{id}导致新增加返回的实体字段不全面，而且当前页面正好需要这个数据的情况，就会报错！！
//【注意!!】 mutation 返回的应答,假如realy前端实际有做了内省的，返回的实体会依照Global ID来替换旧的实体数据，导致自动更新页面的,已经有的字段不会删除,会替换相同字段。
//底下若是去掉   ...FeesListItem    就无法立刻更新页面数据。
//接口直接把被更新数据[fees List]统统返回的这种方式更新： 有个问题，性能不是很好。 后端负担加重了，需要后端直接把刚刚修改的对象统统地都送过来啊。
/*同样是嵌入的 graphql 语法描述语句体内部，可以直接引用预定义的fragment Xxx片段。 比如：
      graphql`
          fragment FeesListItem on Charging {
              id code manual amount fm mnum pipus{ id code rno leng }
              detail{id task{id}} memo
          }
      `,
报错！Fragments in graphql tags must start with the module name ('useUpdateDetailMutation'). Got 'DetailConfigs' instead.
只能采用TS模块的文件名来做fragment定义名字！
babel-plugin-relay/macro: BabelPluginRelay: Expected exactly one definition per graphql tag. Learn more: https://www.npmjs.com/package/babel-plugin-relay
【结论】没办法独立定义fragment，必须用 useFragment(graphql` 这样定义。要避免重复定义啊：只能看有没有正常定义的片段fragment;
*/
const mutation = graphql`
  mutation useUpdateDetailMutation($id: ID!,$inp:DetailInput!) {
    updateDetail(id:$id, inp:$inp) {
      id ident type feeOk sprice
      isp{id dev{ id } }
      ccost fcode zmoney totm
    }
  }
`;

/**通常更新：业务信息*/
export default function useXxMutation() {
  const [called, setCalled] =useState<boolean>(false);
  const [result, setResult] =useState<any>('');
  const [commit, doing] = useMutation(mutation);
  const toast = useToast();
  return {
    call:useCallback(
        (id: string, inp:DetailInput) => {
          let disposable= commit({
            variables: {
             id,  inp
            },
            /*数据更新模式考虑：增加数据前端只能提供一部分结果的。点击增加或删除累计多次之后一起再做手动刷新：业务面考虑重新计算收费金额！
            不见得：一定需要每次增加或删除就得立刻给你反馈，界面上还保留旧数据列表，等待用户明确地点击刷新。临时对删除项目页面标记红色。
            * */
            updater: (store: RecordSourceSelectorProxy, data:MutationParameters['response']| null | undefined) => {
              const payload = store.getRootField("updateDetail");
              if(!payload)   return;
               //if 'UPD' 不需要，会自动覆盖的。
            },
            onCompleted: (response) => {
              //注意doing在运行到这个位置时刻，就已经是false了，代表后端已经应答doing=false。异步执行，所以结论result不一定马上有的。
              const { updateDetail } = response as useUpdateDetailMutation$data;
              setResult( updateDetail );
      /*     toast({
                title: "后端回答了",
                subtitle: '应答=['+ cudChargingFee.warn?? +']',
                intent: "success"
              }); */
            },
            onError: error => {
              //setResult( '报错');
              toast({
                title: "后端回答了",
                subtitle: '错误＝'+error,
                intent: "warning"
              });
            }
          });
          //必须放在commit函数之后的，才会doing逻辑=true生效,doing+called逻辑,保障同步化
          setCalled(true);
          return disposable;
        },
        [commit, toast]
    ),
    doing,
    result,
    called,
    reset: ()=>setCalled(false),
  };
}

