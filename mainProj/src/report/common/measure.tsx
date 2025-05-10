import * as React from "react";
import type {UseFormReturn} from "react-hook-form";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui";
import { BlobInputList,SuffixInput,} from "@/components/chub";

/**针对性优化：measurementRender新版本：不拍外面用<LineColumn column={3}>嵌套后的效果也不错。
 * @param only : 只有一个测量字段的情形，否则是俩个字段。 【注意】only=false的情况在上面不要嵌套<LineColumn；嵌套两层的LineColumn布局不好。
 * @param unit 单位支持平方米的2在右上角的小写排版，所以扩充为 ReactNode ？{可兼容的}。
 * */
export const measurementRender=(label: string,nameH:string,unit:string | React.ReactNode,inp:any,setInp:React.Dispatch<React.SetStateAction<any>>,only?:boolean
)=> {
  const oName=nameH+'o';
  const vName=nameH+'v';
  if(only){
    return <div css={{display: 'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap: 'wrap'}}>
      <Text css={{marginLeft: '3rem'}}>{label}：</Text>
      <InputLine  label='观测数据' >
        <SuffixInput  value={inp?.[oName] ||''} onSave={txt=> setInp({...inp,[oName]: txt || undefined })}>{unit}</SuffixInput>
      </InputLine>
    </div>;
  }
  else return <div>
    <Text css={{marginLeft: '3rem'}}>{label}：</Text>
    {/*这里 column=一行最多就2列布局的  !important */}
    <LineColumn column={7}  >
      <InputLine  label='观测数据' >
        <SuffixInput  value={inp?.[oName] ||''} onSave={txt=> setInp({...inp,[oName]: txt || undefined })}>{unit}</SuffixInput>
      </InputLine>
      <InputLine  label='测量结果' >
        <SuffixInput  value={inp?.[vName] ||''} onSave={txt=> setInp({...inp,[vName]: txt || undefined })}>{unit}</SuffixInput>
      </InputLine>
    </LineColumn>
  </div>;
}

//新一代测量：  多个测量的子项目项目配置 【关键目的】规范化配置模式。但是解析层次可能不一样代码。
/** param t: string,小小项也即每一个行的输入的标题叙述。
 *  param n: 每个字段存储名。
 *  结果栏目的哪一 特殊行，不会计算进入顺序号。序号属于最外面一层数组。相同序号的自拆分嵌套数组模式。
 *  项目描述区域最大支持3个栏目列的生成位置：最内部嵌套t:[,,]的就是3个叙述标题。前面若有多行相同归并多行的需要占位置定义=undefined。
 *  单位字段必然有的：可遗传上一级单位配置。
 *  这整个附带的设置 有： 允许值？  ；标题抬头的自定义。
 *  结果栏目默认存储在前面牵涉范围的第一行对应的第一个找到的name；
 * 结果值 允许值 被合并只出现一个的：依据是omit设置=true,最后一个omit=标题，存储看第一个(【附带约束】只考虑同一个数组内部都一起合并的，看第一行字段名字)。
 * 测量值=>结果值,测量结果的转换规则：参数字段c:四舍五入的c='四',配合d参数='2'表示，保留小数点后2个位的位数做的四舍五入。假如单位保持不变的undefined的没那么后续跟随的采取同样的测量结果的转换规则设置！
 * 除非后面的u:进行重新声明式设置的才会重新考虑设置结果的转换规则！
 * 结果取值的存储字段：save:true; 默认的规则是只要是做了测量值=>结果值的转换规则的约定的对应的哪一行就会依据组件主配参数认定是否进行实际的存储=defaultSave=true的表示有做转换规则的行也必须都做存储。
 * defaultSave=false的表示有做转换规则的行都不做存储（omit参数认定位置实际有几个），除非有在该行位置特定定义save字段才依据save进行设计认定是否做存储的，save===undefined的看defaultSave。
 * save参数每一行都要独立自己去配置。
 * */
export interface EachMeasureItemConfig {
  //存储名: 除非是check结论特殊哪一行，否则必须配置的。
  n: string;
  /**标题区域配置：最大支持多个栏目分别的叙述，最少一个标题*/
  t: any[];        //可支持多个栏目。
  /**【较少用到的】允许项目的最小标题：只能每一行唯一，不能继承跨越多行地；特别地从上面t[]数组直接拆解出来的，只能是string类型
   * #缺点是不灵活！ #只能单独占用一个栏目列的，无法融合到前面，不能和前缀多列做空间合并的。
   * */
  x?: any;
  //单位
  u?: string;
  //【自动计算的】测量值=>结果值,测量结果的转换规则，默认没有规则。
  //但是，c必须配置，若c无配置的会导致save参数也无效！。
  c?: string;
  //保留小数点后2个位的位数; 默认=‘1’的保留1位。
  d?: string|number;
  //是否存储结果字段； 但【确保】上面的c?:字段也必须配置上。
  save?: boolean;
  //【特殊情况】结果值以及配套的允许值：被合并只出现一个；【附带约束】只考虑相等的序号指引下的同一个数组内部都一起合并的，看第一行字段名字作为结果存储名。
  //omit 要么配置=true,要么=标题，#omit=false上次合并结束； 归并几个小行的把多行Cell归并成一个的，总的编辑输入框的提示性质标题。
  omit?: boolean | string;
  /**说明这行=特殊行：对前面的多行进行汇总的结论行。 检验结果 单独占一行位置做配置的。 check=undefined才是普通的行。
   * 检验结果 的标题提示。
   * */
  check?: string;
  //同步检验项目大列表的检验结果字段，配合check才有的，sync=共享存储字段名。
  sync?: string;
}

/**新一代测量 展示
 * @param only : 只有一个测量字段的情形，否则是俩个字段。 【注意】only=false的情况在上面不要嵌套<LineColumn；嵌套两层的LineColumn布局不好。
 * @param unit 单位支持平方米的2在右上角的小写排版，所以扩充为 ReactNode ？{可兼容的}。
 * @param resDeft: 结果字段由外部规则注入的，测量结果的转换规则：同时也就不需要做存储的。 但也可能允许修改的。
 * @param resEdit: 结果字段允许修改的。 自动转换的 可能无法修改的。
 * @param allowableV 附加字段栏目 允许取值。
 * @param seqLineName  同一个序号底下的第一行的存储。
 * @param labelOmit  因为结果字段允许取值两个栏目的多行做归并的情形，提示标题。
 * @param columns  布局调整
 * @return {lcNode,outNode}   预备DOM的两个组件的组合。
 * */
export const measurementCrender=(labels: any[],nameH:string,unit:string | React.ReactNode,inp:any,setInp:React.Dispatch<React.SetStateAction<any>>,
                                 allowableV:boolean,resEdit:boolean,only?:boolean, resDeft?:any,seqLineName?:string,labelOmit?:string,columns?:number
):{ outNode: JSX.Element|undefined; lcNode: JSX.Element; } => {
  const oName=nameH+'o';
  const vName=(seqLineName??nameH)+'v';      //若resDeft提供的，和可能没有该存储的；
  const aName=nameH+'a';      //允许取值存储在
  let iDesc='';     //局限 约定为：string;  若Node合并麻烦
  for(let l=0;l<labels.length;l++){
    if(l!==0) iDesc+=" ";
    iDesc+=labels[l];
  }
  if(only) {
    return {
      lcNode:
        <div  css={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap'}}>
          <Text css={{marginLeft: '3rem'}}>{iDesc}：</Text>
          <InputLine label='观测数据'>
            <SuffixInput value={inp?.[oName] || ''}
                         onSave={txt => setInp({...inp, [oName]: txt || undefined})}>{unit}</SuffixInput>
          </InputLine>
        </div>,
      outNode: undefined,
    }
  }
  else if(labelOmit) return{
    outNode: <Text css={{marginLeft: '3rem'}} >{iDesc}：</Text> ,
    lcNode: <LineColumn column={columns??6}  >
          <InputLine  label='观测数据' >
            <SuffixInput  value={inp?.[oName] ||''} onSave={txt=> setInp({...inp,[oName]: txt || undefined })}>{unit}</SuffixInput>
          </InputLine>
          { resEdit? <InputLine  label={(labelOmit??'')+'测量结果'}>
                <SuffixInput  value={inp?.[vName] || resDeft || ''} onSave={txt=> setInp({...inp,[vName]: txt || undefined })}>{unit}</SuffixInput>
              </InputLine>
              :
              <Text>{labelOmit}测量结果= { inp?.[vName]??resDeft } </Text>
          }
          { allowableV && <InputLine  label={(labelOmit??'')+'允许值'} >
            <SuffixInput  value={inp?.[aName] ||''} onSave={txt=> setInp({...inp,[aName]: txt || undefined })}>{unit}</SuffixInput>
          </InputLine>
          }
       </LineColumn>
    };
  else return{
    lcNode: <div >
        <Text css={{marginLeft: '3rem'}} >{iDesc}：</Text>
        <LineColumn column={columns ?? 7}
           css={{         //底层是display: grid布局的
              alignItems: 'center',
              justifyItems: 'center',
           }}>
          <InputLine label='观测数据'>
            <SuffixInput value={inp?.[oName] || ''}
                         onSave={txt => setInp({...inp, [oName]: txt || undefined})}>{unit}</SuffixInput>
          </InputLine>
          {resEdit ? <InputLine label={'测量结果'}>
                <SuffixInput value={inp?.[vName] || resDeft || ''}
                             onSave={txt => setInp({...inp, [vName]: txt || undefined})}>{unit}</SuffixInput>
              </InputLine>
              :
              <Text>测量结果= {inp?.[vName] ?? resDeft} </Text>
          }
          {allowableV && <InputLine label={'允许值'}>
            <SuffixInput value={inp?.[aName] || ''}
                         onSave={txt => setInp({...inp, [aName]: txt || undefined})}>{unit}</SuffixInput>
          </InputLine>
          }
        </LineColumn>
      </div>,
      outNode: undefined,
  }
}

/**新一代测量 展示; #支持node当作标题;
 * @param only : 只有一个测量字段的情形，否则是俩个字段。 【注意】only=false的情况在上面不要嵌套<LineColumn；
 * @param unit 单位支持平方米的2在右上角的小写排版，所以扩充为 ReactNode ？{可兼容的}。
 * @param resDeft: 结果字段由外部规则注入的，测量结果的转换规则：同时也就不需要做存储的。 但也可能允许修改的。
 * @param resEdit: 结果字段允许修改的。 自动转换的 可能无法修改的。
 * @param allowableV 附加字段栏目 允许取值。
 * @param seqLineName  同一个序号底下的第一行的存储。
 * @param labelOmit  因为结果字段允许取值两个栏目的多行做归并的情形，提示标题。
 * @param item  项目简短地名字 ，item允许没有
 * @return {lcNode,}   lcNode=renderDOM
 * */
type MeasurementCProps = {
  form: UseFormReturn<any, any, any>
  item: string
  labels: any[]
  nameH: string
  unit: string | React.ReactNode;
  allowableV: boolean
    //结果字段#v 要不要保存；  =false意思：采用resDeft计算的，不能修改保存。
  resEdit: boolean
    //没有结果列的
  only?: boolean;
  //上一级计算的取值： 默认取值
  resDeft?: any;
  seqLineName?: string,
  //因为结果字段允许取值两个栏目的多行做归并的情形，提示标题。？合并：改成cbo方式的；
  labelOmit?: string,
}
/**原来measurementCrenderN返回的lcNode部分 : 旧的用纯函数const measurementCrenderN=(item:string,labels: any[],nameH:string来直接return{lcNode:做法：没法做副作用的更新能力。
 *@param children 文本其他行的。
 * 旧版是const measurementCrenderN=(item:string,labels: any[],nameH:string,unit:string | React.ReactNode,inp:any,setInp:React.Dispatch<React.SetStateAction<any>>,
 *                                  allowableV:boolean,resEdit:boolean,only?:boolean, resDeft?:any,seqLineName?:string,labelOmit?:string,columns?:number
 * ):{ outNode: JSX.Element|undefined; lcNode: JSX.Element; } => {  return{lcNode: <div >
 * */
export const MeasurementCline = ({form, item,labels,nameH,unit,
                    allowableV,resEdit,only, resDeft,seqLineName,labelOmit, }: MeasurementCProps
) =>{
  const oName=nameH+'o';
  const vName=(seqLineName??nameH)+'v';      //若resDeft提供的，和可能没有该存储的；
  const aName=nameH+'a';      //允许取值存储在
    //描述等抬头的：
  let descNodes=[];
  for(let l=0;l<labels.length;l++){
    descNodes.push(<span key={l+1}>{labels[l]}</span>);
  }
  if(!!item){
    descNodes.push(<span key={0} className="font-semibold">{item}</span>);
  }
  // const wvvalue = form.watch(vName)
  React.useEffect(() => {
    const vName=(seqLineName??nameH)+'v';       //小行的项目名字优先
    if(!only && resEdit){             //没必要保存给后端情形？
      form.setValue(vName, resDeft);
    }
    else{
      //if(wvvalue==="")  form.setValue(vName, resDeft);
    }
  }, [resDeft, seqLineName,nameH, only]);

  if(only) {
    //单独一项测量，没有结果输入框的：较为少见
   return <div >
            <div >{descNodes}{'>>'}</div>
            <FormField control={form.control} name={oName}
                render={({ field }) => (
                    <FormItem className="flex items-center gap-1 pt-1  break-inside-avoid">
                      <FormLabel className="text-balance">观测数据</FormLabel>
                      <FormControl>
                        <SuffixInput  unit={unit}  {...field}  />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )}
            />
     </div>
  }
  else if(labelOmit){
      //合并了多个行的情况： 一个标题实际对应连续几个项目小行的。文本申明对应的层次隶属关系提升到上层一级别 =》outNode。
      return <div  >
        <FormField control={form.control} name={oName}
                   render={({ field }) => (
                       <FormItem className="flex items-center gap-1 pt-1  break-inside-avoid">
                         <FormLabel className="text-balance">观测数据</FormLabel>
                         <FormControl>
                           <SuffixInput  unit={unit}  {...field}  />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                   )}
        />
        { resEdit? <FormField control={form.control} name={vName}
                              render={({ field }) => (
                                  <FormItem className="flex items-center gap-1 pt-1  break-inside-avoid">
                                    <FormLabel className="text-balance">{(labelOmit??'')+'测量结果'}</FormLabel>
                                    <FormControl>
                                      <SuffixInput  unit={unit}  {...field}  />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                              )}
            />
            :
            <Text>{labelOmit}测量结果= { resDeft } </Text>
        }
        { allowableV && <FormField control={form.control} name={aName}
                                   render={({ field }) => (
                                       <FormItem className="flex items-center gap-1 pt-1  break-inside-avoid">
                                         <FormLabel className="text-balance">{(labelOmit??'')+'允许值'}</FormLabel>
                                         <FormControl>
                                           <SuffixInput  unit={unit}  {...field}  />
                                         </FormControl>
                                         <FormMessage />
                                       </FormItem>
                                   )}
            />
        }
      </div>
  }
  else{
    //最多情况是：descNodes :可能很多文本内容。
    return <div >
      <div >{descNodes}{'>>'}</div>
      <div  className="flex flex-wrap items-center gap-1 justify-center">
        <FormField control={form.control} name={oName}
                   render={({ field }) => (
                       <FormItem className="flex items-center gap-1 pt-1  break-inside-avoid">
                         <FormLabel className="text-balance">观测数据</FormLabel>
                         <FormControl>
                           <SuffixInput  unit={unit}  {...field}  />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                   )}
        />
        {resEdit ? <FormField control={form.control} name={vName}
                              render={({ field }) => (
                                  <FormItem className="flex items-center gap-1 pt-1  break-inside-avoid">
                                    <FormLabel className="text-balance">测量结果</FormLabel>
                                    <FormControl>
                                      <SuffixInput  unit={unit}  {...field}  />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                              )}
            />
            :
            <Text>测量结果= { resDeft } </Text>
        }
        {allowableV && <FormField control={form.control} name={aName}
                              render={({ field }) => (
                                  <FormItem className="flex items-center gap-1 pt-1  break-inside-avoid">
                                    <FormLabel className="text-balance">允许值</FormLabel>
                                    <FormControl>
                                      <SuffixInput  unit={unit}  {...field}  />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                              )}
          />
        }
      </div>
    </div>
  }
};
