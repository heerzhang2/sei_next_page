/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  Text, InputLine, SuffixInput, LineColumn,
} from "customize-easy-ui-component";


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
 * 【对比】多出一个“判断标准”的栏目， 需要编辑器带上。
 * */
export interface EachMeasureCritConfig {
  //存储名: 除非是check结论特殊哪一行，否则必须配置的。
  n: string;
  /**标题区域配置：最大支持多个栏目分别的叙述，最少一个标题*
   * t[0] 项目的栏目标题: 类型随意，就是可以render的文本。
   * 第一行个的t[]分解列个数不能少于底下同一个区间的分解列数。
   */
  t: any[];        //可支持多个栏目。
  /**项目的最小标题：只能每一行唯一，不能继承跨越多行地；特别地从上面t[]数组直接拆解出来的
   * */
  x?: any;
  //单位
  u?: string;
  //判定标准的一列栏目的render Node; 如果有第一个行就必须配置的才行。
  //【规则】连续的采用一行的是配置 undefined(跨行span), 空的没有该字段设置的要配为=null; #整份config的第一行cit:不能undefined，若=undefined就是没有该栏目的场景！
  cit?: any;
  //测量值=>结果值,测量结果的转换规则，默认没有规则。
  c?: string;
  //保留小数点后2个位的位数; 默认=‘1’的保留1位。
  d?: string|number;
  //是否存储结果字段；
  save?: boolean;
  //结果值以及配套的允许值：被合并只出现一个；【附带约束】只考虑相等的序号指引下的同一个数组内部都一起合并的，看第一行字段名字作为结果存储名。
  //omit 要么配置=true,要么=标题，#不允许设置omit=false! 归并几个小行的把多行Cell归并成一个的，总的编辑输入框的提示性质标题。【须有结束配合】 omit:' ',
  //vlNe omit配合:omit='*标记？', vlNe可以用于输入编辑器融合，不仅仅是斜杠融合了。
  omit?: boolean | string;
  /**说明这行=特殊行：对前面的多行进行汇总的结论行。 检验结果 单独占一行位置做配置的。 check=undefined才是普通的行。
   * 检验结果 的标题提示。
   * */
  check?: string;
  //同步检验项目大列表的检验结果字段，配合check才有的，sync=共享存储字段名。
  sync?: string;
  //不可以编辑的且显示为"/"的占位格子。 数字就是该块rowSpan大小。 参数 vlNe 在设计区块的第一行和最后一行都配置了。 结果栏跨几行画斜杠，计算span。
  //vlNe原本是斜杠多行占位的。 【特例】假如omit是字符串的，表示可编辑区的跨行融合模式。vlNe表明跨几行的。
  vlNe?: number;
  //为了解决：编辑器【冗余】太显示多了：前缀t[]继承性导致重复太多文字了，不友好。设置slim=''表示默认缩减，可node替换。
  slim?: any;
}

/**新一代测量 展示; #支持node坐标题;
 * @param only : 只有一个测量字段的情形，否则是俩个字段。 【注意】only=false的情况在上面不要嵌套<LineColumn；
 * @param unit 单位支持平方米的2在右上角的小写排版，所以扩充为 ReactNode ？{可兼容的}。
 * @param resDeft: 结果字段由外部规则注入的，测量结果的转换规则：同时也就不需要做存储的。 但也可能允许修改的。
 * @param resEdit: 结果字段允许修改的。 自动转换的 可能无法修改的。
 * @param allowableV 附加字段栏目 允许取值。
 * @param seqLineName  同一个序号底下的第一行的存储。
 * @param labelOmit  因为结果字段允许取值两个栏目的多行做归并的情形，提示标题。
 * @param columns  布局调整
 * @param item  项目简短地名字 ，item允许没有
 * @return {lcNode,outNode}   预备DOM的两个组件的组合。 差别：lcNode是嵌套在<LineColumn底下的。outNode是在外部的和<LineColumn是并行的关系。
 * */
type MeasurementLineCritProps = {
  children?: React.ReactNode
  item: string
  labels: any[]
  nameH: string
  unit: string | React.ReactNode;
  inp: any
  setInp: React.Dispatch<React.SetStateAction<any>>;
  allowableV: boolean
  resEdit: boolean
  only?: boolean;
  resDeft?: any;
  seqLineName?: string,
  labelOmit?: string,
  columns?: number
  /**判定标准的 render Node*/
  cit?: any;
}
/**原来measurementCrenderN返回的lcNode部分 : 旧的用纯函数const measurementCrenderN=(item:string,labels: any[],nameH:string来直接return{lcNode:做法：没法做副作用的更新能力。
 *@param children 文本其他行的。
 * 旧版是const measurementCrenderN=(item:string,labels: any[],nameH:string,unit:string | React.ReactNode,inp:any,setInp:React.Dispatch<React.SetStateAction<any>>,
 *                                  allowableV:boolean,resEdit:boolean,only?:boolean, resDeft?:any,seqLineName?:string,labelOmit?:string,columns?:number
 * ):{ outNode: JSX.Element|undefined; lcNode: JSX.Element; } => {  return{lcNode: <div >
 * */
export const MeasurementLineCrit = ({ children, item,labels,nameH,unit,inp,setInp,
        allowableV,resEdit,only, resDeft,seqLineName,labelOmit,columns,cit }: MeasurementLineCritProps
) =>{
  const oName=nameH+'o';
  const vName=(seqLineName??nameH)+'v';      //若resDeft提供的，和可能没有该存储的；
  const aName=nameH+'a';      //允许取值存储在
  let descNodes=[];
  //抬头说明哪一行 组装：
  for(let l=0;l<labels.length;l++){
    descNodes.push(<Text key={l+2} css={{marginLeft: l>0? '1rem':'unset'}}>{labels[l]}</Text>);
  }
  if(!!item){
    descNodes.push(<Text key={0} css={{marginLeft: '1rem'}}>{item}</Text>);
  }
  if(cit)
    descNodes.push(<Text key={1} css={{marginLeft: '1rem'}}>判断标准: {cit} ；</Text>);

  React.useEffect(() => {
    if(!only && resEdit){             //需 && resEdit：没必要保存给后端情形？ 不然后端多出该字段的 **v:
      const vName=(seqLineName??nameH)+'v';
      setInp({...inp,[vName]: resDeft});
    }
  }, [resDeft, seqLineName,nameH, only,setInp]);    //不加上inp

  if(only) {
    //较为少见到的：
    return <div  css={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap'}}>
            <div css={{marginLeft: '0rem'}}>{descNodes}{' >>'}</div>
            <InputLine label='观测数据'>
              <SuffixInput value={inp?.[oName] || ''}
                           onSave={txt => setInp({...inp, [oName]: txt || undefined})}>{unit}</SuffixInput>
            </InputLine>
          </div>
  }
  else if(labelOmit){
    //合并了多个行的情况： 一个标题实际对应连续几个项目小行的。文本申明对应的层次隶属关系提升到上层一级别 =》outNode。
    return <LineColumn column={columns??6}  >
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
  }
  else{
    //【最多情况】： 带有结果取值的栏目，是跑到这里：#是嵌套了俩层次的<LineColumn组件的。
    return <div >
      <div css={{marginLeft: '0rem'}}>{descNodes}{' >'}</div>
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
    </div>
  }
};

