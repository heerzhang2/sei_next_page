import * as React from "react";
import {EditStorageContext, useStorage} from "../StorageContext";
import {Button} from "@/components/ui";


/**【代码复用】分项报告
 * 特殊路由 的 当前分项报告的各个分项在子报告 控制
 * 新增加分项枪击确认保存后爆出hook错误了：因为右半边页面这回仅仅过render？路由没动啊。
 * */
export function useSubRepController(nestMd: string, callback: (store: any) => React.ReactNode
) {
    const getInpFilter = React.useCallback((par: any) => {
        const  SubRepIds= par?.['_'+nestMd];      //动态字段的提取。
        return { ['_'+nestMd]: SubRepIds };          //return{ 自检材料,校验材料,整改材料,资料及编号,memo,}
    }, [nestMd]);
    //实际上可以直接对storage读写。没必要加setInp逻辑的；但是setStorage影响范围大，每一次临时变动都会反馈给其它如左边页面的。影响性能啊！
    const [inp, setInp] = React.useState<any>(null);
    // const {inp, setInp} = useItemInputControl({ ref,redId,nestMd });
    const {storage, setStorage} =useStorage();
    const maxIdNumo = Math.max(...(inp?.['_'+nestMd] || [-1]) ) ??0;
    const maxIdNum =maxIdNumo<0 ? 0 : maxIdNumo;
    function onInsertSeq(idx:number){
        inp?.['_'+nestMd]?.splice(idx,0, maxIdNum+1);
        setInp({...inp, ['_'+nestMd] : [...(inp?.['_'+nestMd]||[0]) ] });
    }
    function onDeleteSeq(idx:number){
        if(idx> inp?.['_'+nestMd]?.length)  return;
        inp?.['_'+nestMd]?.splice(idx,1);
        setInp({...inp, ['_'+nestMd] : [...(inp?.['_'+nestMd]||[0]) ] });
    }
    function onAddSeq(){
        inp?.['_'+nestMd]?.push(maxIdNum+1);
        setInp({...inp, ['_'+nestMd] : [...(inp?.['_'+nestMd]||[0]) ] });
    }
    //等同了被替换掉的基础编辑区块组件的框架内容：
    React.useEffect(() => {
        storage&& setInp(getInpFilter( storage));
    }, [storage, setInp, getInpFilter] );
    const onConfirmation = React.useCallback(async() => {
        //可实际上inp对象中的数组被直接修改的，会导致storage实际也是同步已经修改了，但是也需要setStorage才能够触发左边页面render显示刚刚被修改数据变动，可能数组特别的？
        await  setStorage({ ...storage, ...inp });
    }, [inp,storage,setStorage]);

    const [fseq, setFseq] = React.useState<number|undefined>();
    const [tseq, setTseq] = React.useState<number|undefined>();
    const [dseq, setDseq] = React.useState<number|undefined>();

    // const myTable=<>
    //     {inp?.['_'+nestMd]?.map((a:any,i:number)=>{
    //         //【分项识别标签】nestObj?. 最少一个用户识别字段 <React.Fragment  key={i}>
    //         const  nestObj= storage?.['_'+nestMd+'_'+a];      //动态字段的提取。
    //         const title=callback(nestObj);
    //         return  <Popover key={i}>
    //             <PopoverRefer>
    //                 <Button  size="md" iconAfter={<IconChevronDown />} variant="ghost" css={{whiteSpace:'unset'}}>
    //                     {i+1}: {title}
    //                 </Button>
    //             </PopoverRefer>
    //             <PopoverContent>
    //                 <PopoverDescription>
    //                     <MenuList>
    //                         <MenuItem onPress={()=>onDeleteSeq(i)}>刪除这条分项</MenuItem>
    //                         <MenuItem onPress={()=>onInsertSeq(i)}>插入一条分项</MenuItem>
    //                         <MenuItem onPress={()=>onAddSeq()}>末尾新增一条分项</MenuItem>
    //                     </MenuList>
    //                 </PopoverDescription>
    //                 <PopoverClose>
    //                     <IconX/>
    //                 </PopoverClose>
    //             </PopoverContent>
    //         </Popover>
    //             ;
    //     }) }
    // </>;
    return { view: null };
  //
  //   const view=(
  //       <div elevation={"sm"}  css={{ padding: '0.25rem' }}>
  //           { inp?.['_'+nestMd]?.length>0? <>
  //                   <div>{myTable}</div>
  //                   分项报告的排序操作:
  //                   <InputLine label={`序号:`}>
  //                       <div css={{
  //                           display: 'flex',
  //                           alignItems: 'baseline',
  //                       }}>
  //                           <InputPure type="number" value={ fseq || ''}  placeholder="从第几个开始"
  //                                      onChange={e => setFseq( Number(e.currentTarget.value) ) } />
  //                           至
  //                           <InputPure type="number" value={ tseq || ''} placeholder="第几个结束，省略算单个"
  //                                      onChange={e => setTseq( Number(e.currentTarget.value) ) } />
  //                       </div>
  //                   </InputLine>
  //                   <InputLine  label='移动操作插入序号' >
  //                       <Input type="number" value={dseq ||''}
  //                              onChange={e => {
  //                                  setDseq( Number(e.currentTarget.value) )
  //                              } } />
  //                   </InputLine>
  //                   <div css={{
  //                       display: 'flex',
  //                       alignItems: 'center',
  //                       justifyContent: 'space-evenly',
  //                   }}>
  //                       <Button disabled={ !fseq || fseq<=0 || (tseq!>0 && fseq>tseq!) || !dseq || dseq<=0 || (dseq<=tseq!+1 && dseq>=fseq!)}
  //                               onClick={async () => {
  //                                   let sizem=(tseq!>fseq!)? tseq!-fseq!+1 : 1;
  //                                   let movOb=inp?.['_'+nestMd]?.splice(fseq!-1,sizem);
  //                                   if(dseq!<fseq!)
  //                                       inp?.['_'+nestMd]?.splice(dseq!-1, 0, ...movOb);
  //                                   else if((tseq && dseq!>tseq!) || (!tseq && dseq!>fseq!+1))
  //                                       inp?.['_'+nestMd]?.splice(dseq!-1, 0, ...movOb);
  //                               }}
  //                       >移动到目标序号前面
  //                       </Button>
  //                       <Button disabled={ !fseq || fseq<=0 || (tseq!>0 && fseq>tseq!)  }
  //                               onClick={async () => {
  //                                   if(tseq && tseq>=fseq!)
  //                                       inp?.['_'+nestMd]?.splice(fseq!-1, tseq!-fseq!+1);
  //                                   else if(fseq && !tseq)
  //                                       inp?.['_'+nestMd]?.splice(fseq!-1, 1);
  //                                   setStorage({ ...storage });
  //                               }}
  //                       >依序号范围删除
  //                       </Button>
  //                   </div>
  //               </>
  //           :
  //               <>
  //                   本分项模板可以新增加多份的<br/>
  //                   <Button onPress={() => {
  //                       onAddSeq()
  //                   } }
  //                   >初始化增加一个分项报告</Button>
  //                   <hr/>
  //               </>
  //           }
  //           <div css={{textAlign: 'right',padding:'0.2rem'}}>
  //               <Button size="lg" intent={'primary'}
  //                       onPress={  () =>  {
  //                           onConfirmation();
  //                           //【非常严重】不能添加下面这一行，确认点击后导致切换storage却可能并没有继承刚刚组件的修改状态了。setStorage更新丢失！！
  //                           //rfchange && history.push('/report/'+nestMd+'/ver/'+verId+'/'+repId+'/_Controller', {time: Date()} );   //目的：让'当前任务'同步最新的ID, URL强制刷新！
  //                       }}>
  //                   修改确认
  //               </Button>
  //           </div>
  //       </div>
  //   );
  //
  // return { view };
}
