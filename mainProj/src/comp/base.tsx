/** @jsxImportSource @emotion/react */
//import { jsx, } from "@emotion/react";
//import * as React from "react";
import {
    Input, Text, useTheme, InputRefBaseProps,
    StackContext, StackContextType, BlobInputList, InputGroupContext,
} from "customize-easy-ui-component";
import * as React from "react";
//注意这是一个实例！StackContext = React.createContext<StackContextType>();
import {animated, SpringValue} from "@react-spring/web";
// import {StackContext, StackContextType,} from "../../UiDebugSave/sample/Stack";


//透视隐形的输入框框; Input组件底下不能挂接chidren了。
interface TransparentInputProps extends InputRefBaseProps {}
export const TransparentInput = (props: TransparentInputProps) => {
  const theme = useTheme();
  return (
    <Input
      css={{
        background: "none",
        border: "none",
        boxShadow: "none",
        ":focus": {
          outline: "none",
          boxShadow: "none",
          background: theme.colors.palette.gray.lightest,
            "@media print": {
                boxShadow: 'unset',       //极大地影响打印性能
            },
        },
      }}
      {...props}
    />
  );
};

//带并排标题的　单行的嵌套输入子控件空间
// export const ContainLine =({ display, children, ...props } : any)  => {
//   const theme = useTheme();
//   return (
//     <div
//       css={{
//         marginTop: "-0.25rem",
//         marginLeft: "-0.75rem",
//         marginRight: "-0.75rem",
//         width: '100%',
//         margin: 'auto',
//         maxWidth: '600px'
//       }}
//       {...props}
//     >
//
//       <div
//         css={{
//           backgroundColor: "transparent",
//           display: "flex",
//           [theme.mediaQueries.md]: {
//             maxWidth: "600px"
//           }
//         }}
//       >
//         <Text
//           css={{
//             display: "block",
//             width: "100%",
//             padding: "0.5rem 0.75rem"   //无法和输入组建的大小联动。
//           }}
//         >
//           {display}
//           </Text>
//
//         {children}
//
//       </div>
//
//     </div>
//   );
// };

/**分解成两列的展示： 可对齐的，children可以任意组件。
 * display是项目标题。 perc是左边一列的宽度比例1-99;
* */
export const ContainLine =({ display, children, perc=45, ...props } : any)  => {
    const theme = useTheme();
    return (
            <div css={{
                    display: "flex",
                    wordBreak: 'break-all',
                    alignItems: 'center',
                    margin: 'auto',
                    [theme.mediaQueries.md]: {
                        maxWidth: "800px"
                    }
                }}
                {...props}
            >
                <Text css={{
                        display: "inline-flex",
                        width: `${perc}%`,
                        padding: "0.25rem 0.25rem"
                    }}
                >
                  {display}
                </Text>

                <div css={{
                        display: "inline-flex",
                        width: `${100-perc}%`,
                        padding: "0.25rem 0.25rem"
                    }}
                >
                  {children}
                </div>
            </div>
    );
};


//最早来自https://github.com/bmcmahen/julienne/blob/master/src/FollowingList.tsx
//别人封装好的组件也可定制和替换：SearchTitle用于代替基本构件库的已有标准样式StackTitle部分，相当于定制修改原生就有的组件。
export function SearchTitle({ children }: { children: React.ReactNode }) {
  const {
    active,
    opacity,
    transform
  } = React.useContext(StackContext  as React.Context<StackContextType>);

  // @ts-ignore
    return (
        <div
            className="StackTitle"
            aria-hidden={!active}
            style={{
                pointerEvents: active ? "auto" : "none",
                zIndex: 10,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0
            }}
        >
            <animated.div  {...({ } as any)}
                          className="StackTitle__heading"
                          style={{
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              opacity,
                              transform: transform?.to(x => `translateX(${x * 0.85}%)`)
                          } as any}
            >
                {children}
            </animated.div>
        </div>
    );
}

export interface WrapByLineColumnProps {
    children: React.ReactNode;
    //是否开启宽度紧凑模式的局部布局，意味着无法满足最小宽度要求了。fitable不是参数，由上级<LineColumn>组件添加。
    fitable?: boolean;
}
/** @Deprecated
 * 去掉fitable，避免报错 react-dom.development.js:86 Warning: Received `true` for a non-boolean attribute `fitable`.
 * If you want to write it to the DOM, pass a string instead: fitable="true" or fitable={value.toString()}
 */
export const WrapByLineColumn: React.FunctionComponent<WrapByLineColumnProps> =(
    {
        children,
        fitable,
        ...other
    }
) => {
    //React.cloneElement(   ref ? ...other; 都丢了
    return <>
        {children}
    </>;
};


interface MemoDateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value?: string;
    //输入e 实际是最终取值，非Event的；
    onChange: (e: any)=> void;
    width?: string;
    rows?: number;
}
/**复合型日期 通用组件:支持照字符串修改; 兼容打印
 */
export const MemoDateInput: React.FunctionComponent<MemoDateInputProps> =
    ({id,  style,  onChange, value,width='10.7rem',rows=1, ...other}) =>
{
    const { uid } = React.useContext(InputGroupContext);
    return <div className="MemoDate"  id={uid}
                css={{
                    display: "flex",      //若加上这"flex",导致textAlign会失去作用了。
                    flexWrap: 'wrap',
                    ...style
                }}
                {...other}
    >
        <BlobInputList value={value}  rows={rows}
                       style={{display: 'inline-flex', width: width}}
                       onListChange={v => {
                           onChange(v || undefined);
                       }}/>
        <Input value={value} type='date'
               style={{display: 'inline-flex', width: '2.5rem'}}
               onChange={e => {
                   onChange(e.currentTarget.value || undefined);
               }}/>
    </div>;
};

interface MemoDatesInputProps extends MemoDateInputProps {
    //更好地 自适应:上一级主页面的实际容器允许宽度：页面拆分只有一半半边宽度。
    refWidth?: number;
}
/**复合型日期 通用组件: 消除文本日期的报错！。
 * 支持追加模式，字符串尾部添加日期。 但弹出选择框就不显示旧的输入！
 */
export const MemoDatesInput: React.FunctionComponent<MemoDatesInputProps> =
    ({id,  style,  onChange, value,width='10rem',rows=1,refWidth, ...other}) =>
{
    const { uid } = React.useContext(InputGroupContext);
    return <div className="MemoDate"  id={uid}
                css={{
                    display: "flex",      //若加上这"flex",导致textAlign会失去作用了。
                    flexWrap: refWidth!>500? undefined: 'wrap',
                    ...style
                }}
                {...other}
    >
        <BlobInputList value={value}  rows={rows}
                       style={{display: 'inline-flex', minWidth: width}}
                       onListChange={v => {
                           onChange(v || undefined);
                       }}/>
        <Input  type='date'
               style={{display: 'inline-flex', width: '2.5rem'}}
               onChange={e => {
                   let nvalue= (value??'') + (e.currentTarget.value || undefined);
                   onChange(nvalue);
               }}/>
    </div>;
};

