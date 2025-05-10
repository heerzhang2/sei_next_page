import * as React from "react";
import {CCell, FlexibleTable, TableBody, TableCell, TableHeader, TableRow} from "@/components/flexible-table";
import { Dispatch, SetStateAction } from "react";
import { MutableRefObject } from "react";
import {EditStorageContext, useStorage} from "../StorageContext";
import {DirectLink} from "../../routing/Link";
import {useQuery, gql, UrqlProvider, useMutation} from '@urql/next';
import { toast } from "sonner" // 导入 sonner 的 toast 函数

//公共的复用性好的组件。
//各个检验单项子组件暴露给父组件的接口数据。
export interface InternalItemHandResult {
    inp: any;
    doConfirm: ()=>{};
}
//各个检验单项
export interface InternalItemProps  extends React.HTMLAttributes<HTMLDivElement>{
    show?: boolean;
    alone?: boolean;
    ref?: any;
    /**还是需要报告对象传递下来; 只有repId还不够的。 主报告的
     * */
    rep?: any;
    //报告ID号；以及verId： 正常需直接用rep?.; 可独立流转分项报告的模板例外
    repId?: string;
    verId?: string;
    //可重复加的报告实例id
    redId?: string;
    //嵌入分项报告的模板号,
    nestMd?: string;
    refWidth?: number;
    label?: string;
}
export interface OmnPrefixItemProps extends InternalItemProps {
    part: number;
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
export interface ReportViewSubProps {
    parentOrc: any;
    /**扩展数据获取
     * */
    rep?: any;
    //rep?.id 可能不等于repId
    repId?: string;
    //主报告模板版本，或者当前分项报告模板版本、
    verId: string;
    //分项顺序标号 存储的序号
    surpId: string;
    //独立流转偏移的基数：嵌入式和独立流转两个模式可能是并存的，或独立流转的出现多个同种模板的。需要重新定位序号。默认=0
    fxIdx?: number;     //独立流转模式的 分项序号的基数； 若是嵌入式的分项该参数=undefined! rep?.id!==repId
    //分项的排序 打印的 最终号
    dispIdx: number;
}
//可重复的分项：简易模式
export interface ReproducibleViewProps {
    orc: any;
    /**扩展数据获取
     * */
    rep?: any;
    table: string;
    aIdx: number;
}
export interface InspectRecordHeadColumnProps {
  level: string;
  bigLabel: string;
  label: string;
  tinyLabel?: string;
  children: React.ReactNode;
}
//检验项目的开头几个列的布局
export const InspectRecordHeadColumn: React.FunctionComponent<InspectRecordHeadColumnProps> = ({
                                                                       label,
                                                                       children,
                                                                       level,
                                                                       bigLabel,
                                                                        tinyLabel,
                                                                       ...other
                                                                     }) => {

  return (
    <React.Fragment>
      <div css={{ display: 'flex', justifyContent: 'space-between'}}>
          <Text  variant="h6"> 检验类别 {level}  </Text>
          <Text  variant="h6"> 检验项目与内容及其要求 </Text>
      </div>

      <Text  variant="h6"　css={{ textAlign: 'center' }}>
          <Text  variant="subtitle"　>
            {bigLabel}
          </Text>
          <Text  variant="body"　>
            {label}
          </Text>
       </Text>

        <Text className="Collapse__text" variant="subtitle">
          {
            tinyLabel?  tinyLabel : null
          }
          <hr/>

          {children}

        </Text>

        <Text  variant="h4"　>
          查验结果
        </Text>
    </React.Fragment>
  );
};

//报错children: PropTypes.node
/**
 * @deprecated
 */
// InspectRecordHeadColumn.propTypes = {
//   level: PropTypes.string.isRequired,
//   bigLabel: PropTypes.string.isRequired,
//   label: PropTypes.string.isRequired,
//   tinyLabel: PropTypes.string,
//   children: PropTypes.element
// };


export interface InspectZoneHeadColumnProps {
  label: string;
  projects: string[];
  children?: React.ReactNode;
}
//@deprecated
//几个检验项目的聚合模式，1个下拉的分区装入多个项目。
export const InspectZoneHeadColumn: React.FunctionComponent<InspectZoneHeadColumnProps> = ({
      label,
      projects,
      children,
      ...other
   }) => {

  return (
    <React.Fragment>
      <div css={{ display: 'flex', justifyContent: 'space-around'}}>
        <Text  variant="h6">项目: {projects.join(',')}</Text>
        <Text  variant="h6">{label}</Text>
      </div>
      {children}
    </React.Fragment>
  );
};


export interface InspectItemHeadColumnProps {
  level: string;
  label: string;
  children: React.ReactNode;
}
// @Deprecated
//下拉的分区装入多个项目, 之后单一个检验项目的开头
export const InspectItemHeadColumn: React.FunctionComponent<InspectItemHeadColumnProps> = ({
      level,
      label,
      children,
      ...other
      }) => {

  return (
    <React.Fragment>
      <div css={{ display: 'flex',justifyContent: 'space-around',marginTop:'1rem'}}>
        <Text  variant="h6">{label}</Text>
        <Text  variant="h6">检验类别 {level}  </Text>
      </div>
        <hr/>
        {children}
      <Text  variant="h4"　>
        查验结果
      </Text>
    </React.Fragment>
  );
};

//React.useMemo(() =><RenderLoad/>, []); 用它加速显示组件是针对已经在当前界面显示或display：none的才管用;

export interface InspectRecordTitleProps {
  //control参数实际是 useCollapse(show,true) 返回值。
  //底下的?号是必不可少的。
  control:  {　show?:boolean,
              setShow?: React.Dispatch<React.SetStateAction<boolean>>,
              buttonProps?: any ,
              collapseProps?:{id:string,　show:boolean} 　
            };　
  label: string;
  children: React.ReactNode;
  collapseNoLazy?: boolean;
  onPullUp?: () => void;
}
// @Deprecated
//原始记录的列表项，很像菜单列表标题；　　包装成一个组件，以便　修改和复用。
export const InspectRecordTitle: React.FunctionComponent<InspectRecordTitleProps> = ({
         control,
         label,
         onPullUp,
         collapseNoLazy=false,
         children,
         ...other
      }) => {
  const theme = useTheme();
  //点击最底下的按钮，可以触发编辑器的确认临时存储的功能。
  return (
    <Layer elevation={"sm"}     css={{ padding: '0.25rem' }}>
      <div>
          <Button
            variant="ghost"
            intent="primary"
            iconAfter={control.show  ? <IconChevronUp /> : <IconChevronDown />}
            {...control.buttonProps}
          >
            {<Text variant="h5" css={{color: control.show ? theme.colors.palette.red.base:undefined}}>{label}</Text>}
          </Button>

          <Collapse {...control.collapseProps!}  noAnimated>
              {children}
             <div css={{textAlign: 'right',padding:'0.2rem'}}>
              <Button
                variant="ghost"
                intent="primary"
                iconAfter={control.show  ? <IconChevronUp /> : <IconChevronDown />}
                {...control.buttonProps}
                onPress={() =>{
                    onPullUp&&onPullUp();
                    control.setShow!(!control.show);
                } }
              >
                {control.show ? "确认修改并收起" : "更多"}
              </Button>
             </div>
          </Collapse>
      </div>
    </Layer>
  );
};


/*InspectRecordTitle.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
  control: PropTypes.shape({
      show: PropTypes.bool.isRequired,
      setShow: PropTypes.func,
      buttonProps: PropTypes.any.isRequired,
      collapseProps: PropTypes.any.isRequired,
  }).isRequired,　
};*/


export interface InspectRecordCollapseProps {
  label: string;
  show?: boolean;
  children: React.ReactNode;
  inp:  any;
  setInp:  React.Dispatch<React.SetStateAction<any>>;
  getInpFilter:  ( par: any ) => any;
    //可重复加的报告实例id
    redId?: string;
    //嵌入分项报告的模板号,
    nestMd?: string;
    /**自适应 最大放下编辑框 列数： >=2 and <=5 */
    column?: number;
    /**自适应 适应内容宽度来拆分几个排的列 */
    breaks?: number[];
}
//EditStorageContext导致上级组件对底下子组件无感觉，上层并不知道底下使用了context操作，很大地破坏封装性。
export const InspectRecordCollapse: React.FunctionComponent<InspectRecordCollapseProps> = ({
    label,
    show=true,
    inp,
    setInp,
    getInpFilter,redId,nestMd,
    children,
    breaks=[310,650],
    column=0,
    ...other
 }) => {
  const theme = useTheme();
  const context =React.useContext(EditStorageContext);
  if(!context)  throw new Error("需context下");
    const {storage, setStorage, modified,setModified,} =context;
  const eos =useCollapse(show);
    const rskey= (nestMd? ('_'+nestMd+'_'+redId) : undefined ) as string;
    //const rskey= nestMd? ('_'+nestMd+'_'+redId) : (redId? redId:undefined) as string;
  //初始化区块组件的inp对象，只包含局部小范围的字段数。
  React.useEffect(() => {
      const {[rskey] : subStorage}= storage;
    eos.show&& storage&& setInp(getInpFilter(rskey? (subStorage||{}) : storage));
  }, [eos.show, storage, setInp, getInpFilter,rskey] );
  //若依靠“全部项目一起确认”按钮，会导致onPullUp没被执行的，父辈组件点击保存时刻storage是旧的，每个区块修改的都仅仅在各区块组件局部inp对象中。
  const onPullUp = React.useCallback(() => {
    eos.show && setStorage({ ...storage, ...(rskey? {[rskey]: {...storage[rskey], ...inp}} : inp) });
  }, [eos.show, inp,storage,setStorage,rskey]);
  //点击最底下的按钮，可以触发编辑器的确认临时存储的功能。
  //不可以把<Button> 再用eos.show外加逻辑 &&隐藏，报错！。
  return (
    <Layer elevation={"sm"}   css={{ padding: '0.25rem',width: '-webkit-fill-available'}}>
        <Button
          variant="ghost"
          intent="primary"
          iconAfter={eos.show  ? <IconChevronUp /> : <IconChevronDown />}
          {...eos.buttonProps}
          css={{whiteSpace:'unset'}}
        >
          {<Text variant="h5" css={{color: eos.show ? theme.colors.palette.red.base:undefined}}>{label}</Text>}
        </Button>
      <Collapse {...eos.collapseProps}  noAnimated>
          { 0===column?   children
              :
              <LineColumn breaks={breaks} column={column}>
                  {children}
              </LineColumn>
          }
          <div css={{textAlign: 'right',padding:'0.2rem'}}>
            <Button
              variant="ghost"
              intent="primary"
              iconAfter={eos.show  ? <IconChevronUp /> : <IconChevronDown />}
              {...eos.buttonProps}
              onPress={() =>{
                  onPullUp&&onPullUp();
                  eos.setShow(!eos.show);
                  !modified && setModified(true);
              } }
            >
              修改确认收起
            </Button>
          </div>
      </Collapse>
    </Layer>
  );
};

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

export interface InspectRecordDialogProps {
  children: React.ReactNode;
  //局部化变量存储
  inp:  any;
  //局部化存储状态； 感觉相当于是回调函数，把inp数据传递到了上一级组件中去。
  setInp:  React.Dispatch<React.SetStateAction<any>>;
  //回调局部化变量字段设置
  getInpFilter:  ( par: any ) => any;
  //可重复加的报告实例id
  redId?: string;
  //嵌入分项报告的模板号,
  nestMd?: string;
    /**自适应 最大放下编辑框 列数： >=2 and <=5 */
    column?: number;
    /**自适应 适应内容宽度来拆分几个排的列 */
    breaks?: number[];
    repId?: string;
}
//独立编辑形式的。单独一个区块独立确认的可以支持不用立刻保存。
export const InspectRecordDialog: React.FunctionComponent<InspectRecordDialogProps> = ({
     inp,
     setInp,
     getInpFilter,
     children,redId,nestMd,
     breaks=[310,650],
     column=0,
     repId,
     ...other
 }) => {
  const {storage, setStorage, modified,setModified,} =useStorage();
    const [updateResult, updateOriginal] = useMutation(OriginalDataMutation);
    const rskey= (nestMd? ('_'+nestMd+'_'+redId) : undefined ) as string;
  //外部汇集层次storage修改后，也得同步修正我这里低层次分部的，不然，它处已经改动的数据对我这里来说全然不知晓。
  //上一个区块编辑器已经确认的会立刻从storage反馈更新给当前组件内了。
  React.useEffect(() => {
      const {[rskey] : subStorage}= storage;
      storage&& setInp(getInpFilter(rskey? (subStorage||{}) : storage));
  }, [storage, setInp, getInpFilter,rskey] );

    const onConfirmation = React.useCallback(async() => {
        await  setStorage({ ...storage, ...(rskey? {[rskey]: {...storage[rskey], ...inp}} : inp) });
    }, [inp,storage,setStorage,rskey]);
    const onSubmitOrginal = (event: any) => {
        event.preventDefault();
        const { target } = event;
        //能够遗留变更，新的变更内容没有发送，但是没有登录token? 但是很早前失败的变更请求也会从重新发出的！不管URL强制刷新/累积/只要没成功的。
        const {_version, ...RepData}= storage;
        // const { _version, ...RepData }= (storage || source);
        updateOriginal({id:repId,operationType:1,
            version: _version,   //new FormData(target).get('link'),
            data:JSON.stringify(RepData) }).then(() =>
            { }  // target.reset()
        );
        // !modified && setModified(true);
    };
  //点击最底下的按钮，可以触发编辑器的确认临时存储的功能。
  return (
    <Layer elevation={"sm"}  css={{ padding: '0.25rem',width: '-webkit-fill-available'}}>
        { 0===column?   children
            :
            <LineColumn breaks={breaks} column={column}>
                {children}
            </LineColumn>
        }
        <div css={{textAlign: 'right',padding:'0.2rem'}}>
            <Button size="lg" intent={'primary'} disabled={updateResult.fetching}
                    onPress={ onSubmitOrginal }>
                保存到服务器
            </Button>
          <Button size="lg" intent={'primary'}
             onPress={ async () =>  {
                 await onConfirmation();
               //修改确认 点击后快速地点击后退，可能导致Button unmounted 报错。堆栈usePressable onScroll dispatchAction
               //看来还得加上terminateOnScroll={false}，光光await setxxx还是不够，依然有机会在组件卸载后触发某些回调函数。得全部堵死。
                 !modified && setModified(true);
             }}>
            修改确认
          </Button>
        </div>
        {updateResult.fetching ? <p>提交给服务器...</p> : null}
        {updateResult.error ? (
            <p>Oh no... {updateResult.error.message}</p>
        ) : null}
    </Layer>
  );
};

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
export　function useRepSureButton({ ref, nestMd, redId, inp} : RepSureButtonProps
) {
    React.useImperativeHandle( ref,() => ({ inp }), [inp] );
    const {storage, setStorage, modified,setModified,} =React.useContext(EditStorageContext) as any;
    const rskey= (nestMd? ('_'+nestMd+'_'+redId) : undefined ) as string;
    const onSure = React.useCallback(async(newinp: any) => {
        await  setStorage({ ...storage, ...(rskey? {[rskey]: {...storage[rskey], ...newinp}} : newinp) });
    }, [storage,setStorage,rskey]);

    return (<div css={{textAlign: 'right',padding:'0.2rem'}}>
            <Button size="lg" intent={'primary'}
                    onPress={ async () =>  {
                        await onSure(inp);
                        !modified && setModified(true);
                    }}>
                修改确认
            </Button>
        </div>);
}

export interface SelectHookforkProps extends SelectProps {
  //topDivStyle?: SerializedStyles;
}
//太多重复了，自定义成一个新组件。
export const SelectHookfork: React.FunctionComponent<SelectHookforkProps> = ({
                                                                 value,
                                                                 onChange,
                                                                // topDivStyle,
                                                               ...other
                                                             }) => {
  return (
    <Select inputSize="md" css={{minWidth:'140px',fontSize:'1.3rem',padding:'0 1rem'}} divStyle={css`max-width:240px;`}
            value={value}  onChange={onChange}
            {...other}
    >
      <option value={''}>空</option>
      <option value={'√'}>合格</option>
      <option value={'▽'}>见证确认</option>
      <option value={'／'}>无此项</option>
      <option value={'×'}>不合格</option>
      <option value={'△'}>无法检测</option>
    </Select>
  );
};

export type SelectValDescPair = [string, string];    //一对的，转义说明和存储用字。
export interface SelectPairProps extends SelectProps {
    dlist?: SelectValDescPair[];
}
const Logic3StatusOpt=[ ['是',"是"],['否',"否"] ];
//太多重复了，自定义成一个新组件。 dlist默认是逻辑三态。
/**列表选择（字面和存储内容标签一对的组合，版本），存储的是标签，显示的是字面文本，需要转换翻译的。
 * @param list 只能是字符串的数组的。
 * */
export const SelectPair: React.FunctionComponent<SelectPairProps> = ({
         value,
         onChange,
         dlist=Logic3StatusOpt,
         ...other
     }) => {
    return (
        <Select inputSize="md" css={{minWidth:'140px',fontSize:'1.3rem',padding:'0 1rem'}} divStyle={css`max-width:240px;`}
                value={value}  onChange={onChange}
                {...other}
        >
            <option value={''}></option>
            { dlist.map(( [val, desc],  i:number) => {
                return <option key={i} value={val}>{desc}</option>;
            }) }
        </Select>
    );
};

export interface SelectInputProps extends SelectProps {
    list: string[];
    nMinW?: boolean;
    divStyle?: SerializedStyles;
}
/**列表选择， 存储的===显示的，不需要翻译。
 * @param list 只能是字符串的数组的。
 * */
export const SelectInput: React.FunctionComponent<SelectInputProps> = ({
   value,onChange,list,nMinW,divStyle, ...other
}) => {
    return (
        <Select inputSize="md" css={{minWidth:nMinW? undefined : '140px',
                fontSize:'1.3rem',
                padding:'0 1rem',
                //width: '-webkit-fill-available', 不是这个<select >
                //"div:has(&)": { width: '-webkit-fill-available' },  是所有的父辈？
                "div:has(&).Select": { width: '-webkit-fill-available' },
            }}
            divStyle={divStyle? divStyle : css`max-width:240px;`}
            value={value}  onChange={onChange}
            {...other}
        >
            <option value={''}></option>
            { list.map((item, i:number)=> {
                return <option key={i} value={item}>{item}</option>;
            })}
        </Select>
    );
};

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
export const AntCheck: React.FunctionComponent<AntCheckProps> = ({
              label,
              id,
              //topDivStyle,
              defaultChecked=false,
              inp,
              setInp,
              sup,
              item,
              ...other
}) => {

  //inp属性inp['witnessConfirm']=false可直接改，但做 inp['tool']['vernierCaliper'] = !(inp['tool']['vernierCaliper'])就不生效？!!
  //     defaultChecked={ defaultChecked  } err but not both). Decide between using a controlled or uncontrolled input element

  return (
      <Check label={label}
             checked={ (sup?  inp?.[sup]?.[item]  :  inp?.[item] ) || defaultChecked }
             onChange={e => {
                   setInp( (sup&& inp&&{ ...inp,  [sup]: { ...inp[sup],  [item]  :   !( inp[sup]  &&  inp[sup][item] )   }    } )
                           ||  (sup&& { [sup]: { [item] :  !defaultChecked }  } )
                           ||  (inp&&{ ...inp,   [item]  :  ! inp[item] } )
                           ||  { [item]  :  !defaultChecked }   )
                 }  }
      />
  );
};

interface IndentationLayTextProps  {
  title?: string | React.ReactNode;
  id?: string;
  children?: React.ReactNode;
  component?: React.ElementType<any>;
}
//子元素缩进排版: 文本段落，缩进的。 css: text-indent: 2em; textIndent: '2rem',
export const IndentationLayText: React.FunctionComponent<IndentationLayTextProps> = ({
                 children,
                 title,
                 id,
                 component :Component= "div",
                 ...other
               }) => {
  const theme = useTheme();
  return (
    <Component
      className="Indentation"
      css={{
      }}
      {...other}
    >
      <Text
        className="Indentation__title"
        id={id}
        css={{ margin: 0 }}
        variant="h6"
      >
        {title}
      </Text>
      <div css={{ paddingLeft: '1rem',
            [theme.mediaQueries.sm]: {
              paddingLeft: '0.5rem'
            },
            [theme.mediaQueries.lg]: {
              paddingLeft: '2rem'
            }
           }}>
        {children}
      </div>
    </Component>
  );
};


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
/**类比 useItemInputControl；但这个是能直接提供确认的钩子版本。高能版本；
 * onSure 回调函数：直接把最新inp传进来确认,保存到storage。触发onSure执行的就没必要要求用户点“确认修改”！
 *【考虑】但是直接onSure 会直接对storage 牵涉到大范围的render影响。对比的用 setInp只有局部范围的render影响局部化的。就是要求用户多一个“确认修改”按钮的点击！
 * */
export　function useInputControlSure({ ref, nestMd, redId
                                    } : ItemInputControlProps
) {
    const [inp, setInp] = React.useState<any>(null);
    React.useImperativeHandle( ref,() => ({ inp }), [inp] );
    const {storage, setStorage} =useStorage();
    const rskey= (nestMd? ('_'+nestMd+'_'+redId) : undefined ) as string;
    //外部汇集层次storage修改后，也得同步修正我这里低层次分部的，不然，它处已经改动的数据对我这里来说全然不知晓。
    //上一个区块编辑器已经确认的会立刻从storage反馈更新给当前组件内了。
    // React.useEffect(() => {
    //     const {[rskey] : subStorage}= storage;
    //     storage&& setInp(getInpFilter(rskey? (subStorage||{}) : storage));
    // }, [storage, setInp, getInpFilter,rskey] );
    //【同步】不能直接用上面的inp状态变量作为底下这个回调函数的输入；遇到setinp(newinp)；onSure(void 0)同时一次点击触发的情况实际上onSure只能看见旧的inp而不是最新的newinp;发生摇摆问题！
    const onSure = React.useCallback(async(newinp: any) => {
        await  setStorage({ ...storage, ...(rskey? {[rskey]: {...storage[rskey], ...newinp}} : newinp) });
    }, [storage,setStorage,rskey]);
    //    await onConfirmation()
    return {inp, setInp, onSure};
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
export　function useInputReproducible({table,index, inp, setInp} : InputReproducibleProps
) {
    const setInpr = React.useCallback(async(newinpr: any) => {
        //也不能@处理删除这一行!
        if(!(inp[table]))   inp[table]=[];
        inp[table][index]=newinpr;
        await setInp({...inp});
    }, [table,index,inp,setInp]);
    return {inpr:inp?.[table]?.[index],  setInpr};
}

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



export interface InspectRecordLayoutProps {
  alone: boolean;
  label: string;
  show?: boolean;
  children: React.ReactNode;
    /**给单一个编辑器使用的部分属性字段对象*/
  inp:  any;
  setInp:  React.Dispatch<React.SetStateAction<any>>;
    /**原始记录报告数据的过滤器，提取orc的小部分字段*/
  getInpFilter: ( par: any ) => any;
    //可重复加的报告实例id
    redId?: string;
    //嵌入分项报告的模板号,
    nestMd?: string;
    /**自适应 最大放下编辑框 列数： >=2 and <=5 */
    column?: number;
    /**自适应 适应内容宽度来拆分几个排的列 */
    breaks?: number[];
    repId?: string;
}
//继续复用，组合来节省冗余代码量。
/**【原始记录编辑器】原理：
 * 保证从EditStorageContext获取最新报告数据能够自动提取给每一个独立编辑器页面的inp；而且只需要getInpFilter过滤部分。
 * 保存如何汇集新数据？：setStorage({...storage, ...outCome});
 * ALL也就是全部原始记录堆叠同一个页面的场景需要outCome=mergeEditorItemRefs( ...clRefs.current! ) as any;
 * 单独一个编辑器的保存操作只需仅仅使用EditStorageContext就可以保存和汇集数据，抛弃mergeEditorItemRefs无需配套useImperativeHandle。
 * 第一次版本的做法模式:两次useImperativeHandle三层级组件暴露接力传递啊，返回给爷辈组件。
 *     mergeEditorItemRefs[动态多个编辑组件队列/多个子组件的输入字段合并], useProjectListAs({count} :{count:number})数组Hooks.ref创建；第一次版的不用多余确认按钮？
 * 改造后第二次版本改为useContext(EditStorageContext)来代替了儿孙组件暴露useImperativeHandle接力方式，可省略和避免forwardRef传递ref需要。
 *     useContext({ storage, setStorage })模式：在子组件需要提供确认按钮,setStorage不能频繁调用吧,众多setXxx字段编辑需汇合给storage，Context还必须在路由器顶级注入。
 *【状态管理】 inp部分属性字段就够了 ,setInp 修改 ，getInpFilter过滤器提取orc的小部分字段。
 * 不想套上<LineColumn 可设置column={0}可自己控制了。
 * 若参数不提供inp={null} setInp={()=>0}  getInpFilter={()=>0}行不通的，没有提取旧的数据。
 * */
const InspectRecordLayout0: React.FunctionComponent<InspectRecordLayoutProps> = ({
    alone,
    label,
    show=true,
    inp,
    setInp,
    getInpFilter,
    children,redId,nestMd,
   breaks=[310,650],
   column=0,
   repId,
    ...other
 }) => {
    const {storage, setStorage, modified,setModified,} =useStorage();
    const [updateOriginalResult, updateOriginal] = useMutation(OriginalDataMutation);
    const rskey= (nestMd? ('_'+nestMd+'_'+redId) : undefined ) as string;
    //外部汇集层次storage修改后，也得同步修正我这里低层次分部的，不然，它处已经改动的数据对我这里来说全然不知晓。
    //上一个区块编辑器已经确认的会立刻从storage反馈更新给当前组件内了。
    React.useEffect(() => {
        const {[rskey] : subStorage}= storage;
        storage&& setInp(getInpFilter(rskey? (subStorage||{}) : storage));
    }, [storage, setInp, getInpFilter,rskey] );

    const onConfirmation = React.useCallback(async() => {
        await  setStorage({ ...storage, ...(rskey? {[rskey]: {...storage[rskey], ...inp}} : inp) });
    }, [inp,storage,setStorage,rskey]);
    const onSubmitOrginal = (event: any) => {
        event.preventDefault();
        const { target } = event;
        const {_version, ...RepData}= storage;
        // const { _version, ...RepData }= (storage || source);
        updateOriginal({id:repId,operationType:1,
            version: _version,   //new FormData(target).get('link'),
            data:JSON.stringify(RepData) }).then((result ) =>
            {
                console.log("updateOriginalResult8=应答=", result );
                if(result.error)  console.log('Oh no!', result.error);
            }  // target.reset()
        );
        // !modified && setModified(true);
    };
    //点击最底下的按钮，可以触发编辑器的确认临时存储的功能。
    return (
        <Layer elevation={"sm"}  css={{ padding: '0.25rem',width: '-webkit-fill-available'}}>
            { 0===column?   children
                :
                <LineColumn breaks={breaks} column={column}>
                    {children}
                </LineColumn>
            }
            <div css={{textAlign: 'right',padding:'0.2rem'}}>
                {updateOriginalResult?.error?.toString()}
                <Button size="lg" intent={'primary'}
                        onPress={ onSubmitOrginal }>
                    保存到服务器
                </Button>
                <Button size="lg" intent={'primary'}
                        onPress={ async () =>  {
                            await onConfirmation();
                            //修改确认 点击后快速地点击后退，可能导致Button unmounted 报错。堆栈usePressable onScroll dispatchAction
                            //看来还得加上terminateOnScroll={false}，光光await setxxx还是不够，依然有机会在组件卸载后触发某些回调函数。得全部堵死。
                            !modified && setModified(true);
                        }}>
                    修改确认
                </Button>
            </div>
        </Layer>
    );
};

//原来两阶段保存的：需要确认ref->inp:，准备改为直接操作setStorage，避免需要确认按钮。
export const InspectRecordLayout: React.FunctionComponent<InspectRecordLayoutProps> = ({
                                                                                           alone,
                                                                                           label,
                                                                                           show = true,
                                                                                           inp,
                                                                                           setInp,
                                                                                           getInpFilter,
                                                                                           children,
                                                                                           redId,
                                                                                           nestMd,
                                                                                           breaks = [310, 650],
                                                                                           column = 0,
                                                                                           repId,
                                                                                           ...other
                                                                                       }) => {
    const { storage, setStorage, modified, setModified } = useStorage()
    const [updateOriginalResult, updateOriginal] = useMutation(OriginalDataMutation)

    const rskey = (nestMd ? "_" + nestMd + "_" + redId : undefined) as string

    React.useEffect(() => {
        const { [rskey]: subStorage } = storage
        storage && setInp(getInpFilter(rskey ? subStorage || {} : storage))
    }, [storage, setInp, getInpFilter, rskey])

    const onConfirmation = React.useCallback(async () => {
        await setStorage({ ...storage, ...(rskey ? { [rskey]: { ...storage[rskey], ...inp } } : inp) })
    }, [inp, storage, setStorage, rskey])

    const onSubmitOrginal = (event: any) => {
        event.preventDefault()
        const { _version, ...RepData } = storage

        updateOriginal({
            id: repId,
            operationType: 1,
            version: _version,
            data: JSON.stringify(RepData),
        }).then((result) => {
            console.log("updateOriginalResult8=应答=", result)

            if (result.error) {
                // 使用 sonner 的 toast.error 显示错误
                toast.error("保存失败", {
                    description: result.error.toString(),
                })
                console.log("Oh no!", result.error)
            } else {
                // 使用 sonner 的 toast.success 显示成功消息
                toast.success("保存成功", {
                    description: "数据已成功保存到服务器",
                })
            }
        })
    }

    return (
        <Layer elevation={"sm"} css={{ padding: "0.25rem", width: "-webkit-fill-available" }}>
            {0 === column ? (
                children
            ) : (
                <LineColumn breaks={breaks} column={column}>
                    {children}
                </LineColumn>
            )}
            <div css={{ textAlign: "right", padding: "0.2rem" }}>
                <Button size="lg" intent={"primary"} onPress={onSubmitOrginal}>
                    保存到服务器
                </Button>
                <Button
                    size="lg"
                    intent={"primary"}
                    onPress={async () => {
                        try {
                            await onConfirmation()
                            !modified && setModified(true)

                            // 使用 sonner 的 toast.success 显示成功消息
                            toast.success("修改确认", {
                                description: "修改已成功确认",
                            })
                        } catch (error) {
                            // 使用 sonner 的 toast.error 显示错误
                            toast.error("确认失败", {
                                description: error instanceof Error ? error.message : "未知错误",
                            })
                        }
                    }}
                >
                    修改确认
                </Button>
            </div>
        </Layer>
    )
}



export const 现场结果选=["符合要求","不符合要求"];
export const 现场条件选=[['√',"符合"],['×',"不符合"]] as SelectValDescPair[];
export function twoForkSelect(res: string) {
    return '√'===res? "符合要求" : '×'===res? "不符合要求" : res;
}
export function twoForkSelectS(res: string) {
    return '√'===res? "符合" : '×'===res? "不符合" : res;
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
 */
export const RepLink= ( {rep, children, tag, ori} : {rep:any, children:React.ReactNode, tag:string,ori?:boolean}
) => {
    if(ori)
        return <DirectLink  href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/${tag}?original=1#${tag}`}>
            {children}
        </DirectLink>;
    else
        return <DirectLink  href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/${tag}#${tag}`}>
            {children}
        </DirectLink>;
};
