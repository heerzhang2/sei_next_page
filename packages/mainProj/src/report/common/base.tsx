import * as React from "react";
import {Dispatch, SetStateAction} from "react";
import {CCell,} from "@/components/flexible-table";
import {gql,} from '@urql/next';
import {JumpTab} from "@/report/common/JumpTab";
import {PressureLayout} from "@/report/common/pressure";
import {cn} from "@/lib/utils";
import Head from 'next/head';
import {useSearchParams} from "next/navigation";

//各个检验单项
export interface InternalItemProps{
    /**还是需要报告对象传递下来; 只有repId还不够的。 主报告的
     * */
    rep?: any;
    label?: string;
    show?: boolean;
    children?: React.ReactNode
    //报告ID号；以及verId： 正常需直接用rep?.; 可独立流转分项报告的模板例外
    // repId?: string;
    verId?: string;
    //可重复加的报告实例id
    redId?: number;
    // alone?: boolean;
    subrid?: string;
    //独立流转可重复分项
    modType?: string;
}


//动态载入的类似原始记录编辑区域模板组件, 所有参数都必须？可选的，否则报错。#若要打印原始记录需求的？：可能需要单独组织类似报告printView专门打印的组件来组织编辑器汇总输出。
export interface OriginalViewProps {
    //提取编辑区需要的一部分source{data + snapshot};编辑保存后inp赋值给了data{}；
    // inp?: any;
    //编辑器各个区块的汇总回流数据用到的，只有ALL printAll才有用的。
    // ref?: any;
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
    // repId?: string;
    //本报告(主报告不包含独立流转分项的)的data + 主报告给出的snapshot合并对象。 snapshot是不信任前端编辑人员的后端给出字段快照对象=基础信息赋值。
    source: any;
    //printing?: boolean;
    //该参数没必要啊, 组件框架带?编辑器各个区块的汇总回流数据用到的，只有ALL printAll才有用的。
    // ref?: any;
    //主报告模板版本，或者当前分项报告模板版本、
    verId?: string;
    /**扩展数据获取，从路由器relay Query获得。独立流转分项+内嵌分项或主报告都可能需要提取额外的字段？。
     * 关联的检验信息 relay对象；
     * 人员权限或证书。 关联子报告情况。
     * */
    rep?: any;
    //可重复加的报告实例id，分项报告需要。嵌入式需要在正式报告显示上分项组件区分可重复的子报告。
    // redId?: string;
    //嵌入式和独立流转并存的，或独立流转的出现多个同种模板的。需要重新定位序号。默认=0
    // fxIdx?: number;
}

export interface ReportEntryProps {
    rep: any;
    //打印预览模式的：
    printMode?: boolean;
}
export interface ReportViewFxProps extends ReportViewProps{
    mapFxian: Map<string,PressureLayout>;
    subrid?: string;
    printMode?: boolean;
}
/**支持可独立流转分项报告
 * */
export interface RepVwProps{
    //主报告实例
    rep: any;
    //分项情况的：直接使用当前分项项目专属存储做法。分离开其它的同类可重复分项
    orc?: any;
    //假如orc不是主报告整体存储的情形下，提供主报告存储数据。
    parOrc?: any;
    title?: string;
    children?: React.ReactNode
    //分项报告id
    subrid?: string;
    //分项报告里面的可重复分项的编号。
    redId?: number;
    //可重复分项目的附加后缀序号的表达：和redId分离没关系，【定位】hash页面路由使用的，确保主报告中唯一性。
    apxid?: string;
    //避免pdf书签太多：
    useh2?: boolean;
    //打印预览
    printMode?: boolean;
    //不折叠
    unfold?: boolean;
}

export const OriginalDataMutation =gql`
    mutation useOriginalDataMutation( $id: ID! $data: String $client: String!, $version:Int ) {
        modifyOriginalRecordData(id: $id, data: $data, client: $client,version: $version) {
            id,version,type
            data
            snapshot
            modeltype,modelversion
            isp{id}
        }
    }
`;

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
export const RepLink= ( {rep, children, tag, ori, subrid,redId,hash}
                        : {rep:any, children:React.ReactNode, tag:string,ori?:boolean,subrid?:string,redId?:number,hash?:string}
) => {
    const apds=`${subrid ? '&subrid='+subrid : ''}`
    const apdr=`${redId!==undefined ? '&redId='+redId : ''}`
    if(ori)
        return <JumpTab  href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/${tag}?original=1${apds}${apdr}#${hash??tag}`}>
            {children}
        </JumpTab>;
    else if(tag)
        return <JumpTab tab="preview" href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/${tag}?${apds}${apdr}#${hash??tag}`}>
            {children}
        </JumpTab>;
    else if(hash) return <JumpTab tab="preview" href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/?${apds}${apdr}#${hash}`}>
            {children}
        </JumpTab>;
    else return <JumpTab tab="preview" href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/?${apds}${apdr}`}>
            {children}
        </JumpTab>;
};

/*修改打印的默认文件名
document.title 实际上nextjs 多层次的app路由会合并影响的
* */
export function RepTitleUpdate({code}: {code:string}) {
    const searchParams = useSearchParams()
    React.useEffect(() => {
        const original = "1" === searchParams!.get("original")
        document.title = `${code}-${original? '原始记录':'报告'}`
    }, [code, searchParams])
    return null
}

/**配置项 :动态加的 自主添加检验项：前缀模式， 多行,
 * */
export function customPrefI(
    nhead: string,  //存储名字开头部分的
    count: number,  //总共几个存储量
    storage: any,
    edit?: boolean,  //显示编辑器中的
): Array<[string, any[], any]> {
    let tmpAr: Array<[string, any[], any]> = [];
    for (let i = 0; i < count; i++) {
        const title = storage?.[`${nhead}${i + 1}`]?.T
        if (edit || !!title) {
            tmpAr.push(
                [`${nhead}${i + 1}`, [{}], <span className={cn(edit ? "text-base" : "text-sm")}>{title ?? '／'}</span>]
            );
        }
    }
    return tmpAr;
}
