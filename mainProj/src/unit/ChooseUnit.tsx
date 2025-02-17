/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  IconButton,
  IconX,
  useToast, InputPure, SuffixInput
} from "customize-easy-ui-component";

import {useContext} from "react";
import RoutingContext from "../routing/RoutingContext";
//import { createPath } from 'history';

/**关联对象，从大列表中选择一个对象的，可套用这个伪对话框模式。
 * */
interface ChooseUnitProps {
    //关联对象id； 跳转伪对话框路由页面的，初始化选中搜索列表中的那一条。
    id?: string | undefined;
    //当前关联对象id所指向的挂接对象模型的给用户看的关键名:标题= 单位名字;
    name?: string | undefined;
    //删除当前的输入数据，关联对象id=null。
    onCancel?: () => void;
    //【关键点】伪对话框起跳前的当前编辑器数据打包; 触发了点击，保存状态，返回后才能恢复啊。正在当前编辑器页面修改的字段都存储到history.state;
    onDialog?: () => any;
    //[目的]指引转入伪对话框跳转路由页面去做state{}数据修改==选择设置某字段。
    //表示给用户看的关键字，用户以此识别编辑器是哪一个。发起人编辑器页面也需要核对emodel后提取Ndt保存数据，以及跳转当前输入焦点到刚刚被选中的伪对话目标字段autoFocus。
    //emodel?: string | undefined;

    //当前编辑的哪一个字段： 选择关联对象后要挂接字段。以及返回页面后跳转当前输入焦点到刚刚被选中的伪对话目标字段autoFocus。
    //叶子层次的非{}内嵌对象类型的：最后不可再分的属性，基本类型字段。
    field: string;
    //history.push(,state)无法传入function()给state的；@只能变相的做法，传递数据引用的结构路径名了。
    //【对象不一定就是一层】深度复制的？ 嵌套多层次结构的复杂引用对象如何办： p1field.field
    //倒数第二层的/父辈第一级的:要设置的是嵌套的第二层的对象中的字段。 比如编辑器映射字段实际是：eqp.svp.{第二层的字段}那么就应该设置p1field=“svp”;
    p1field?: string;
    //路径path+部分queryString参数; 用户选择完毕所需要的关联对象之后，点击返回URL;支持当前SPA的path路径,自带?号的;
    //reurl: string;

    autoFocus?: boolean;
}
//页面和数据分离后又要被迫整合在一块了？
//非高层次通用的组件。语义整合：　数据获取和规格化显示部分组合在一个文件内。前端graphql底层缓存：不见得每次都会发送请求给后端的。
//graphQL想把多个Query同时都坐在一个Hook函数里面一次性向后端读取，有许多障碍：页面分割，公用组件嵌套，父辈组件知晓子孙辈组件数据请求和参数还得传递数据，不过前端有缓存。

/** 伪对话框的做法！ 两个独立路由页面的接力：搜索选择路由页面传递选中的取值给发起人的编辑器路由页面。这类似于就是redux+router全局状态管理。
 * @param id 目前选择好的单位id
 * @param onCancel 取消该参数的单位选择
 * @param onDialog [伪对话框模式]保存当前用户编辑器的所有输入框编制新数值。
 * other 传递CSS参数的。
 * 改成传递 {save, field, reurl};
 * 【约束】 这里定义的 {save,field,reurl} {save:{ nestedstate:{} } 都属于伪对话框强制命名规范, 和其它字段名字不要冲突。
 * 【最大问题】需要保留当前编辑器页面的已经修改的数据，离开本页面跳转本来应该是对话框形式的但是却搞成路由独立页面的伪对话框；从伪对话框强制返回原来编辑页面路由页面，需要恢复旧的上次正在编辑修改的数据。
 * 还有：必须跨两个独立路由页面之间传递回去被选择的目标字段选中的取值，目标页面必须#非常突出#明确提示当前到底是路由列表浏览模式还是编辑器选择等待返回选择模式。
 * 另外：用户若不选择返回刚刚的编辑器路由页面呢，等于就是取消编辑器了，无法确保强制地看成真正对话框的明确必然性返回和一定归属某个父辈功能底下，很可能从编辑器逃逸。
 */
export const ChooseUnit= ({ id, name, onCancel, onDialog, field,p1field, autoFocus, ...other }:ChooseUnitProps) =>
{
  //const toast = useToast();
    //const data={unit:{company:{name:''},person:{name:''}}};
    //console.log("UnitOrChoose跑来~id+name=",id,name);
    const { history } = useContext(RoutingContext);
    const reurl= history.createHref(history.location);     //我自己现在是哪个URL,跳转伪对话框路由页面之后，还得关闭对话框=还得跳转回这个URL来啊。

  return (
    <SuffixInput  readOnly autoFocus={autoFocus}
          component={InputPure}
           value={name || '' }
           onClick={async () => {
            /*  toast({
                title: "离开:"+emodel+" 编辑器页面",
                subtitle: '字段：'+field+" 选择后点返回就可返回编辑,还原编辑状态信息",
                intent: "info"
              });*/
              const save=await onDialog!();   //编辑器来源，context已确定的；离开之前 需要临时保留数据。
               //onDialog={async () => { await setNdt(await confirmation()); } }
              console.log("ChooseUnit组件传递参数来56=",window.history.state?.state, "myurl=",reurl,"save",save);
              //准备history来担任状态传递 格式= {save:, field:''} 注意在UnitList组件新挑选了单位导致URL修改了后也要做这个history.push(,{save, field})传递。
              //【约束】这里定义的 {save,field,reurl} {save:{ nestedstate:{} }都属于伪对话框强制命名规范,和其它字段名字不要冲突。尽量不要两层伪对话框，连续跳2次的就太麻烦。
              //无法把一个函数传递给另外一个页面去接收的，history.push()后面的state:{}不能把function#当成普通对象放进去，报错，无法再传递给下一个路由页面接收的,要上React.createContext<DialogEnterReturnType>。
              //起跳转入伪对话框跳转路由页面后，对方应该依据history.state{}数据修改，然后退出对话框返回本页面时重新把history.push(,修改后的state)；要保证接续state不会丢失。
               //注意window.history.state?.state??{}的取值: 没有跳转的话,实际手动刷新浏览器页面也不能清除掉，浏览器关了重启可清除。
               history.push(`/unit/${id? id:''}`,{save, field, reurl, p1field});
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

//报错:上面若直接用 { data.unit && <IconButton 》} 点击删除报Can't perform a React state update on an unmounted component. 按钮被卸载。
