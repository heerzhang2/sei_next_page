/** @jsxImportSource @emotion/react */
//注意！本组件已经淘汰！
import * as React from "react";
import {
  IconButton,
  IconX,
  useToast, InputPure, SuffixInput
} from "customize-easy-ui-component";

import {useContext} from "react";
import RoutingContext from "../routing/RoutingContext";



interface UnitOrChooseProps {
    //跳转伪对话框路由页面的，初始化选中搜索列表中的那一条。
    id?: string | undefined;
    //当前id所指向的挂接对象模型的给用户看的关键名:标题= 单位名字;
    name?: string | undefined;
    onCancel?: () => void;
    //触发了点击，保存状态，返回后才能恢复啊。
    onDialog?: () => void;
    //表示给用户看的关键字，用户以此识别编辑器是哪一个。发起人编辑器页面也需要核对emodel后提取Ndt保存数据，以及跳转当前输入焦点到刚刚被选中的伪对话目标字段autoFocus。
    emodel?: string | undefined;
    //当前编辑的哪一个字段： 选择关联对象后要挂接字段。以及返回页面后跳转当前输入焦点到刚刚被选中的伪对话目标字段autoFocus。
    field?: string | undefined;
    //路径path+部分queryString参数; 用户选择完毕所需要的关联对象之后，点击返回URL;支持当前SPA的path路径,自带?号的;
    erurl?: string | undefined;
    autoFocus?: boolean;
}
//页面和数据分离后又要被迫整合在一块了？
//非高层次通用的组件。语义整合：　数据获取和规格化显示部分组合在一个文件内。前端graphql底层缓存：不见得每次都会发送请求给后端的。
//graphQL想把多个Query同时都坐在一个Hook函数里面一次性向后端读取，有许多障碍：页面分割，公用组件嵌套，父辈组件知晓子孙辈组件数据请求和参数还得传递数据，不过前端有缓存。
/** @Deprecated
 * 这个是伪对话框的做法！ 两个独立路由页面的接力：搜索选择路由页面传递选中的取值给发起人的编辑器路由页面。这类似于就是redux+router全局状态管理。
 * 【旧版本】旧的做法需要setNdt从顶级路由注入Context的，ndt保存已修改编辑器数据，还需要URL?search&=多个参数&=配合的。新版本依赖history.state存储。
 * @param id 目前选择好的单位id
 * @param onCancel 取消该参数的单位选择
 * @param onDialog [伪对话框模式]保存当前用户编辑器的所有输入框编制新数值。
 * other 传递CSS参数的。
 * 原先是传递emodel emid field这3个参数，目前改成传递 emodel + erurl + field 这3个参数;
 * 【最大问题】需要保留当前编辑器页面的已经修改的数据，离开本页面跳转本来应该是对话框形式的但是却搞成路由独立页面的伪对话框；从伪对话框强制返回原来编辑页面路由页面，需要恢复旧的上次正在编辑修改的数据。
 * 还有：必须跨两个独立路由页面之间传递回去被选择的目标字段选中的取值，目标页面必须#非常突出#明确提示当前到底是路由列表浏览模式还是编辑器选择等待返回选择模式。
 * 另外：用户若不选择返回刚刚的编辑器路由页面呢，等于就是取消编辑器了，无法确保强制地看成真正对话框的明确必然性返回和一定归属某个父辈功能底下，很可能从编辑器逃逸。
 */
export const UnitOrChoose= ({ id, name, onCancel, onDialog, emodel, field, erurl,autoFocus, ...other }:UnitOrChooseProps) =>
{
  const toast = useToast();
    //const data={unit:{company:{name:''},person:{name:''}}};
    //console.log("UnitOrChoose跑来~id+name=",id,name);
    //这里history实际=createBrowserHistory最后来自from 'history' 4.10.1版本：包原型是function push(path, state)；
    const { history } = useContext(RoutingContext);

  return (
    <SuffixInput  readOnly autoFocus={autoFocus}
          component={InputPure}
           value={name || '' }
           onClick={async () => {
              toast({
                title: "离开:"+emodel+" 编辑器页面",
                subtitle: '字段：'+field+" 选择后点返回就可返回编辑,还原编辑状态信息",
                intent: "info"
              });
              await onDialog!();   //编辑器来源，context已确定的；离开之前 需要临时保留数据。
              history.push(`/unit/${id? id:''}?&emodel=${emodel}&erurl=${erurl}&field=${field}`);
            } }
          {...other}
    >
       <IconButton
          variant="ghost"
          icon={<IconX />}
          label="删除"
          css={{
            display: name ?  undefined : 'none'
          }}
          onClick={async (e) => {
            await onCancel!();
            e.preventDefault();
            e.stopPropagation();
          } }
        />
    </SuffixInput>
  );
}

//上面若直接用 { data.unit && <IconButton 》} 点击删除报错Can't perform a React state update on an unmounted component. 按钮被卸载。

