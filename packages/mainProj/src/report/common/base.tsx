import * as React from "react";
import {CCell, } from "@/components/flexible-table";
import { Dispatch, SetStateAction } from "react";
import { MutableRefObject } from "react";
import {DirectLink} from "../../routing/Link";
import {gql, } from '@urql/next';
import {JumpTab} from "@/report/common/JumpTab";
import {PressureLayout} from "@/report/common/pressure";

//公共的复用性好的组件。
//各个检验单项子组件暴露给父组件的接口数据。
// export interface InternalItemHandResult {
//     inp: any;
//     doConfirm: ()=>{};
// }

//各个检验单项
export interface InternalItemProps{
    /**还是需要报告对象传递下来; 只有repId还不够的。 主报告的
     * */
    rep?: any;
    label?: string;
    show?: boolean;
    children?: React.ReactNode
    //报告ID号；以及verId： 正常需直接用rep?.; 可独立流转分项报告的模板例外
    repId?: string;
    verId?: string;
    //可重复加的报告实例id
    redId?: string;
    //嵌入分项报告的模板号,
    nestMd?: string;
    // refWidth?: number;
    // alone?: boolean;
    ref?: any;
}


//动态载入的类似原始记录编辑区域模板组件, 所有参数都必须？可选的，否则报错。#若要打印原始记录需求的？：可能需要单独组织类似报告printView专门打印的组件来组织编辑器汇总输出。
export interface OriginalViewProps {
    repId?: string;
    //提取编辑区需要的一部分source{data + snapshot};编辑保存后inp赋值给了data{}；
    inp?: any;
    //编辑器各个区块的汇总回流数据用到的，只有ALL printAll才有用的。
    ref?: any;
    verId: string;
    /**扩展数据Query获得; 若是编辑器复制字段的是快照语义的保存时刻取值固定到data{}。若是纯粹正是报告集成动态信息的就是最新后端获取值会随着时间更新的。
     * 关联的检验信息 relay对象
     * */
    rep?: any;
    //保证search?&from= & 能够更新页面内容。
    // qs?: any;  直接放入最后的组件也能做
    //标识每一个编辑器区块。ALL printAll _Controller特殊的。
    action: string;
    recordPrintList?: any;
}

//报告ReportStarter会在框架的两个地方引用作为入口的：1：打印预览正式报告的全屏模式(全部显示要给打印准备)；2：作为嵌入式列表导航目的的在编辑器左边页面显示的(可折叠可点击展开的)。
export interface ReportViewProps {
    repId?: string;
    //本报告(主报告不包含独立流转分项的)的data + 主报告给出的snapshot合并对象。 snapshot是不信任前端编辑人员的后端给出字段快照对象=基础信息赋值。
    source: any;
    //printing?: boolean;
    //该参数没必要啊, 组件框架带?编辑器各个区块的汇总回流数据用到的，只有ALL printAll才有用的。
    ref?: any;
    //主报告模板版本，或者当前分项报告模板版本、
    verId?: string;
    /**扩展数据获取，从路由器relay Query获得。独立流转分项+内嵌分项或主报告都可能需要提取额外的字段？。
     * 关联的检验信息 relay对象；
     * 人员权限或证书。 关联子报告情况。
     * */
    rep?: any;
    //可重复加的报告实例id，分项报告需要。嵌入式需要在正式报告显示上分项组件区分可重复的子报告。
    redId?: string;
    //嵌入式和独立流转并存的，或独立流转的出现多个同种模板的。需要重新定位序号。默认=0
    fxIdx?: number;
}
export interface ReportViewFxProps extends ReportViewProps{
    mapFxian: Map<string,PressureLayout>;
    subrid?: string;
}

export const OriginalDataMutation =gql`
    mutation useOriginalDataMutation(
        $id: ID!
        $operationType:Int!
        $data: String
        $deduction: String, $version:Int
    ) {
        modifyOriginalRecordData(id: $id, operationType: $operationType, data: $data, deduction: $deduction,version: $version) {
            id,version,type
            data
            snapshot
            modeltype,modelversion
            isp{id}
        }
    }
`;

export interface RepSureButtonProps {
    ref: React.Ref<any>;
    //局部化变量存储
    inp:  any;
    //嵌入分项报告的模板号,
    nestMd?: string;
    //可重复加的报告实例id
    redId?: string;
}
//分离”确认修改“的按钮：有些记录编辑器显示太长的就需要附加更多的此按钮。一整个编辑器的inp都会被确认到全局storage;
// export　function useRepSureButton({ ref, nestMd, redId, inp} : RepSureButtonProps
// ) {
//     React.useImperativeHandle( ref,() => ({ inp }), [inp] );
//     const {storage, setStorage, modified,setModified,} =React.useContext(EditStorageContext) as any;
//     const rskey= (nestMd? ('_'+nestMd+'_'+redId) : undefined ) as string;
//     const onSure = React.useCallback(async(newinp: any) => {
//         await  setStorage({ ...storage, ...(rskey? {[rskey]: {...storage[rskey], ...newinp}} : newinp) });
//     }, [storage,setStorage,rskey]);
//
//     return (<div css={{textAlign: 'right',padding:'0.2rem'}}>
//             <Button size="lg" intent={'primary'}
//                     onPress={ async () =>  {
//                         await onSure(inp);
//                         !modified && setModified(true);
//                     }}>
//                 修改确认
//             </Button>
//         </div>);
// }


export type SelectValDescPair = [string, string];    //一对的，转义说明和存储用字。


export interface AntCheckProps
            extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  //topDivStyle?: SerializedStyles;
  defaultChecked?: boolean,
  //外部传递来的状态宿主，点击改变inp。
  inp: any,
  setInp: Dispatch<SetStateAction<any>>,
  //子项目名字
  item: string;
  //父项目名字，若sup为空，item直接挂到inp底下第一层属性，否则嵌套在sup底下，支持2两层楼属性。
  sup?: string;
}
//用来简化重复的部分，就像是一个语法糖。
// export const AntCheck: React.FunctionComponent<AntCheckProps> = ({
//               label,
//               id,
//               //topDivStyle,
//               defaultChecked=false,
//               inp,
//               setInp,
//               sup,
//               item,
//               ...other
// }) => {
//
//   //inp属性inp['witnessConfirm']=false可直接改，但做 inp['tool']['vernierCaliper'] = !(inp['tool']['vernierCaliper'])就不生效？!!
//   //     defaultChecked={ defaultChecked  } err but not both). Decide between using a controlled or uncontrolled input element
//
//   return (
//       <Check label={label}
//              checked={ (sup?  inp?.[sup]?.[item]  :  inp?.[item] ) || defaultChecked }
//              onChange={e => {
//                    setInp( (sup&& inp&&{ ...inp,  [sup]: { ...inp[sup],  [item]  :   !( inp[sup]  &&  inp[sup][item] )   }    } )
//                            ||  (sup&& { [sup]: { [item] :  !defaultChecked }  } )
//                            ||  (inp&&{ ...inp,   [item]  :  ! inp[item] } )
//                            ||  { [item]  :  !defaultChecked }   )
//                  }  }
//       />
//   );
// };



//par代表整体原后端数据，itemVal是当前条目的截取部分数据。
//把par 直接保存到了useRef做成的 那个不可变previousState当中。
//总的show按钮各分区项目show的控制，以单一个逻辑变量无法完全正确操纵！必须传递然后合并成独立一个show逻辑。
export interface ItemControlProps {
  ref: React.Ref<any>;
  show: boolean;
  //par: any;   改成回调模式，上级深度控制下级，去除组件参数，避免多头受控，可能死循环。   par={},
  //接受par输入的过滤器，回调 过滤有用数据。
  filter: (par: any) => {};
}


export interface ItemInputControlProps {
  ref: React.Ref<any>;
  //接受par输入的过滤器，回调 过滤有用数据。
  //filter: (par: any) => {};
    //可重复加的报告实例id
    redId?: string;
    //嵌入分项报告的模板号,
    nestMd?: string;
}
/**回流数据关键：各个编辑器页面setInp之后还需要确认，以及保存到后端的。要依赖useImperativeHandle汇集本报告所有的编辑器最新数据。
 * 编辑区块组件若传递的ref=null就会导致无法通过这个模式上传数据给上级父辈组件去做inp回流。
 * 这里返回的inp是局部化部分字段在context保存的最新取值，而setInp只是局部更新本地的inp对象，也就不会主动更新给context存储的；
 * */
export　function useItemInputControl({ ref,
                                 } : ItemInputControlProps
) {
  const [inp, setInp] = React.useState<any>(null);
  //用回调钩子setShow来替换；原先的show参数下传配合在useCollapse内部useEffect(() [defaultShow] 做修正方式。
  //回调钩子的模式。在上层父组件去统一调用本函数的，这里仅仅生成函数的代码但还未执行。
  //【廢棄】setShow功能，無需排序和全部開或拉上。用在ALL printAll情况【全部确认保存】点击触发的，向上级父辈组件暴露ref.currest.inp对象，这里inp都是局部化的字段，不支持数组嵌套的寻址模式。
      //   const rskey= nestMd? ('_'+nestMd+'_'+redId) : (redId? redId:undefined) as string;
      //   eos.show && setStorage({ ...storage, ...(rskey? {[rskey]: {...storage[rskey], ...inp}} : inp) });
      //   const inp2Storage= rskey? {[rskey]: inp} : inp;
  React.useImperativeHandle( ref,() => ({ inp }), [inp] );
  return {inp, setInp};
}


export interface InputReproducibleProps {
    //可重复分项报告的基础表：
    table: string;
    //可重复分项报告编辑器的”序号“，0开始的
    index: number;
    inp: any;
    setInp: React.Dispatch<React.SetStateAction<any>>;
    // ref: React.Ref<any>;
    //接受par输入的过滤器，回调 过滤有用数据。
    //filter: (par: any) => {};
    //可重复加的报告实例id
    redId?: string;
    //嵌入分项报告的模板号,
    nestMd?: string;
}
//只处理可重复分项报告编辑器的：【特殊替代】inp, setInp;  除了删除自己这个分项子报告。
// export　function useInputReproducible({table,index, inp, setInp} : InputReproducibleProps
// ) {
//     const setInpr = React.useCallback(async(newinpr: any) => {
//         //也不能@处理删除这一行!
//         if(!(inp[table]))   inp[table]=[];
//         inp[table][index]=newinpr;
//         await setInp({...inp});
//     }, [table,index,inp,setInp]);
//     return {inpr:inp?.[table]?.[index],  setInpr};
// }

//Hook编译报错，不允许直接套数组()=> 回调函数模式创建；需要包裹一层Component()规避检查。
//若本组件没有重新加载，{count}数组长度变化，会导致ｈｏｏｋ报错。  重命名也逃不掉报错。
//count=下拉组件亦即独立展示项目个数；
//HOOK机制要求，useXXX() 次数与顺序都不允许变化。HOOK报错。
//外部采用路由模式，组件进入后采取根据入口参数来调节count的就没问题，count不会因为两次render表现出个数差异。
export function useProjectListAs({count} :{count:number}) {
  const array= new Array(count).fill(null);
  function WrappedComp(i: number) {
        return React.useRef<InternalItemHandResult>(null);
  };
  return React.useRef<MutableRefObject<InternalItemHandResult>[] | null>(array.map((i) => WrappedComp(i) ) as any);
}





export const 现场结果选=["符合要求","不符合要求"];
export const 现场条件选=[["✔","符合"],["✘","不符合"]] as SelectValDescPair[];
export function twoForkSelect(res: string) {
    return "✔"===res? "符合要求" : "✘"===res? "不符合要求" : res;
}
export function twoForkSelectS(res: string) {
    return "✔"===res? "符合" : "✘"===res? "不符合" : res;
}

export type CCellUnitProps = {
    unit: React.ReactNode;
    children: React.ReactNode;
    colSpan?: number;
    rowSpan?: number;
    className?: string;
};
/**CCell带了单位两个布局 ；有些单位是有上下标的影响，加flex-wrap: wrap;
 */
export const CCellUnit = ({
                              unit,
                              children,
                              colSpan,
                              rowSpan,
                              className,
                          }: CCellUnitProps) => {
    return (
        <CCell colSpan={colSpan} rowSpan={rowSpan}>
            <div className={`flex justify-around items-center flex-wrap ${className || ""}`}>
                {typeof children === 'string' ? (
                    <span className="whitespace-nowrap">{children}</span>
                ) : (
                    <>{children}</>
                )}

                {typeof unit === 'string' ? (
                    <span className="lg:whitespace-nowrap print:whitespace-nowrap">
                        {unit}
                    </span>
                ) : (
                    <div className="inline-flex">{unit}</div>
                )}
            </div>
        </CCell>
    );
};
/**目的：避免代码重复性质的字符串的出现太多了：   通常报告表格的点击转编辑器
 * @param ori 是原始记录页面的
 * 注意DirectLink：主动把直接儿子的 div或span改成了 <a>标签。
 */
export const RepLink= ( {rep, children, tag, ori, subrid,redId}
                        : {rep:any, children:React.ReactNode, tag:string,ori?:boolean,subrid?:string,redId?:number}
) => {
    if(subrid){
        if(ori)
            return <JumpTab  href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/${tag}?original=1&subrid=${subrid}&redId=${redId}#${tag}`}>
                {children}
            </JumpTab>;
        else
            return <JumpTab tab="preview" href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/${tag}&subrid=${subrid}&redId=${redId}#${tag}`}>
                {children}
            </JumpTab>;
    }
    if(ori)
        return <JumpTab  href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/${tag}?original=1#${tag}`}>
            {children}
        </JumpTab>;
    else
        return <JumpTab tab="preview" href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/${tag}#${tag}`}>
            {children}
        </JumpTab>;
};
/*修改打印的默认文件名
* */
export function RepTitleUpdate({code,original}: {code:string,original?:boolean}) {
    React.useEffect(() => {
        document.title = `${code}-${original? '原始记录':'报告'}`
    }, [code, original])
    return null
}
