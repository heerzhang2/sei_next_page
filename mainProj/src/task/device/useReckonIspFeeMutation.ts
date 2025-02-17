import { useMutation } from "react-relay";
import {useCallback, useState} from "react";
import { RecordSourceSelectorProxy, } from "relay-runtime";
import {useToast} from "customize-easy-ui-component";
const graphql = require("babel-plugin-relay/macro");

/*新建立task: 必须最少有个设备？(无关联设备号的单独报告的任务？)
先生成task后面再来添加eqp;
【特别注意】 useReckonIspFeeMutation 在FeeEntrance组件也用上了！FeeEntrance正显示FeesListItem列表；这时间点击按钮发起计算，后端应答返回fees：
底下 bus{  id,fees{  id   } 也需要提供其余字段数据,自动计算新增加的fee: 被当前显示FeesListItem组件正好显示的，
fees[]若刚刚被添加的收费项目，若没有这些字段，就会报错！
假如底下的改成： fees{
          id code manual amount fm mnum pipus{ id }
          memo  }
 如果pipus{}不做更多字段的内省：Mutation触发按钮正当前显示的页面用到了 fees{ pipus{ id } }：就会导致数据可能不全！新增加记录项没有读取到某些字段;Relay也不会自动读取。
【怪异】这个情况下, Relay对当前页面的东西自动更新，或者组件直接提取当前页面的数据的情况的：Relay没办法自动冲后端发起请求去提取不全的那些字段数据。除非路由后再进入当前页面才会发起后端请求。
【注意】更新对当前页面的影响：新增数据时，务必把当前页面以及内含组件的数据需求都能覆盖到位，否则新的实体对象可能没有提取到数据，会爆错误。
 针对bus{}实体和FeeEntrance组件来看：还必须把当前页面的数据全部都能覆盖到位，点击路由再进入当前页面的时刻才不会再次去发起后端请求获取更多数据，否则会两次发起后端请求的。
【关键】当前页面牵涉的所有字段，当前Mutation返回结果若是ADD新增加记录的，那么必须内省全部当前看得到的页面隐含的属性字段，否则路由再进入当前页面时必然再次出发后端请求(因为新增记录缺失字段)。
* */
const mutation = graphql`
  mutation useReckonIspFeeMutation($id: ID!) {
    reckonIspFee(id: $id) {
      parms,
      bus{
        id, __typename, feeOk
         fees{
          id
            code manual amount fm mnum pipus{ id code rno leng }
           detail{id task{id}} memo
        }
      }
    }
  }
`;

export default function useReckonIspFeeMutation() {
  const [called, setCalled] =useState<boolean>(false);
  const [result, setResult] =useState<any>('');
  const [commit, doing] = useMutation(mutation);
  const toast = useToast();
  return {
    call:useCallback(
      (id: string) => {
        let disposable= commit({
          variables: {
            id
          },
          onCompleted: (response) => {
            setResult((response as any).reckonIspFee);
            toast({
              title: "后端有应答",
              subtitle: '返回的ID＝'+ (response as any).reckonIspFee.bus.id,
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
