/** @jsxImportSource @emotion/react */
import * as React from "react";
import {useContext, useRef} from "react";
import {FragmentRefs} from "relay-runtime";
import UserContext from "../routing/UserContext";
import {
  Button, DdMenuItem, IconAtSign,
  Dialog, DialogClose, DialogContent, DialogDescription, DialogHeading,
  IconButton, IconX,
  InputLine,
  InputPure,
  MenuItem,
  SuffixInput,
  useTheme
} from "customize-easy-ui-component";
// import {Dialog,DialogClose, DialogContent, DialogDescription, DialogHeading} from "@/comp/Dialog";
import useDispatchToOfficeMutation from "./useDispatchToOfficeMutation";
import {OfficeChoose} from "../common/user/OfficeChoose";
import useDispatchToLiablerMutation from "./useDispatchToLiablerMutation";
import {OneUserChoose} from "../common/user/OneUserChoose";


//FragmentRef 直接上这个转换？ FragmentRefs<"DeviceListItem"> | FragmentRefs<"DeviceListItem"> | null;
export type TaskLikeData = {
  readonly id: string;
  readonly office: {
    readonly id: string;
    readonly name: string;
  } | null;
  liabler: {
    readonly id: string;
    readonly person: {
      readonly id: string;
      readonly name: string;
    } | null;
  };
  readonly detail_list: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
       // readonly " $fragmentSpreads": FragmentRefs<"DeviceListItem">;  老不认识Hook？稍微改点源码就不识别hook
        isp: {
          no: string;
        };
      } | null;
    } | null> | null;
  }
};


/**类型若是用: OneTaskWraper$data["node"] || 多个数据源定义有差别的报错，捆绑到数据源类型？。
 * 分解出来可复用的组件重复利用Hook新模式，task参数：整个task可用的字段的对象。
 * */
export function useOfficeDialogMenu(task: TaskLikeData) {
  const {user} = useContext(UserContext);
  const theme = useTheme();
  const [diaOffi, setDiaOffi] = React.useState(false);
  const [office, setOffice] = React.useState<any>(task?.office);
  const {call:dispatch2offiFunc,doing, result:_}= useDispatchToOfficeMutation();
  //console.log("复用useOfficeDialogMenu组件task=", task);
  const menu=(
      <DdMenuItem label="部门内分配任务给科室" onPress={() => { setDiaOffi(true) } } />
  );
  const dialog=(
      <Dialog open={diaOffi} onOpenChange={setDiaOffi}>
        <DialogContent >
          <DialogHeading>
            配置和选择
          </DialogHeading>
          <DialogDescription>
            <div>
              <InputLine label={`科室选定(点击进入选择):`}>
                <OfficeChoose  name={office?.name!}  oobj={office}  setEditorVar={setOffice}/>
              </InputLine>
            </div>
            {user && <Button
                intent="primary"
                disabled={false}
                css={{ marginLeft: theme.spaces.sm }}
                onPress={() => {  //按钮里面看不到最新的input取值的。
                  dispatch2offiFunc(task?.id!, office?.id);
                  setDiaOffi(false);
                }}
            >
              部门内分配任务给科室
            </Button>
            }
          </DialogDescription>
          <DialogClose>关闭</DialogClose>
        </DialogContent>
      </Dialog>
  );

  return {
    menu,
    dialog,
  };
};


/**代码抽取复用和拼装方式之一：Hook形式的。
 * 【报错】第四个字符必须大写字母！useliablerDialogMenu 要改成 useLiablerDialogMenu；
 * React Hook "useContext" is called in function "useLiablerDialogMenu" that is neither a React function component nor a custom React Hook function. React component names
 must start with an uppercase letter. React Hook names must start with the word "use"
 *派工到责任人, 参数task的类型：任务对象数据。: any 还是依据输入对象的来源typescript文件来塑型更好点。
 * */
export function useLiablerDialogMenu(task: TaskLikeData) {
  const details = task?.detail_list?.edges?.map(edge=> edge?.node);
  const typicisp = details && details[0]?.isp;         //典型Isp
  const {user} = useContext(UserContext);
  const theme = useTheme();
  const [diaconf, setDiaconf] = React.useState(false);
  //任务负责人 User实体|graphQL Type模型;
  const [liabler, setLiabler] = React.useState<any>(task?.liabler);       //任务负责人
  const [repNos, setRepNos] = React.useState<any>(typicisp?.no);      //典型Isp的报告编号
  const {call:dispatch2liablFunc,doing:doingliabl, result:_l}= useDispatchToLiablerMutation();
  //console.log("复用useOfficeDialogMenu组件task=", task);
  const menu=(
      <DdMenuItem label="科室内分配任务给责任人" onPress={() => { setDiaconf(true) } } />
  );
  const dialog=(
      <Dialog open={diaconf} onOpenChange={setDiaconf}>
        <DialogContent >
          <DialogHeading>
            配置和选择
          </DialogHeading>
          <DialogDescription>
            <div>
              <InputLine label={`配置人员(点击进入选择):`}>
                <OneUserChoose  name={liabler?.person?.name!}   setEditorVar={setLiabler}
                                oobj={liabler}  />
              </InputLine>
              <InputLine label={`报告编号(@序列@):`}>
                <SuffixInput  placeholder="多设备编号递增用@包裹,如@003@"
                              component={InputPure}  value={repNos || '' }
                              onChange={e =>setRepNos( e.currentTarget.value||undefined ) }
                >
                  <IconButton  variant="ghost"  icon={<IconAtSign />}  label="@"
                               onClick={ (e) => {
                                 setRepNos((repNos??'')+'@');
                               } }
                  />
                  <IconButton  variant="ghost"  icon={<IconX />}  label="X"
                               onClick={ (e) => {
                                 setRepNos(undefined);
                               } }
                  />
                </SuffixInput>
              </InputLine>
            </div>
            {liabler && <Button
                intent="primary"
                disabled={false}
                css={{ marginLeft: theme.spaces.sm }}
                onPress={() => {  //按钮里面看不到最新的input取值的。
                  dispatch2liablFunc(task?.id!, liabler?.id, repNos);
                  setDiaconf(false);
                }}
            >
              科室内分配任务给
            </Button>
            }
          </DialogDescription>
          <DialogClose>关闭</DialogClose>
        </DialogContent>
      </Dialog>
  );

  return {
    menu,
    dialog,
  };
};

