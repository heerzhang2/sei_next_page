/** @jsxImportSource @emotion/react */
import * as React from "react";
// import { Dispatch, SetStateAction } from "react";


interface Options {
  //非受控方式的初始值
  initialOpen?: boolean;
  //注入控制器的方式：实时取值 外部注入的 来取代内部的【controlledOpen， setControlledOpen】控制器；【open, onOpenChange】
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function useEditStorageContext({
                            initialOpen = false,
                            open: controlledOpen,
                            onOpenChange: setControlledOpen
                          }: Options = {}) {

  const [storage, setStorage] = React.useState<any>({});
  //允许内部提供了的 替换掉外部注入的 【controlledOpen， setControlledOpen】控制器；
  // const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);
  // const open = controlledOpen ?? uncontrolledOpen;
  // const setOpen = setControlledOpen ?? setUncontrolledOpen;
  //当前报告的数据是否已经被修改了？
  const [modified, setModified] = React.useState<boolean | undefined>();
    //印象化报告：已经不需要存储Context模式了！
    // const [impressionism, setImpressionism] = React.useState<any>(undefined);

  return React.useMemo(
      () => ({
        storage,
        setStorage,
        modified,
        setModified,
      }),
      [storage, setStorage, modified ]
  );
}



//<typeof useEditStorageContext> & {    【同时接受的意思】类型可以拥有Person和Employee的所有特性

// type EditStorageContextType =
//     | (ReturnType<typeof useEditStorageContext>)
//     | ({
//         impressionism: any;
//         setImpressionism: React.Dispatch<React.SetStateAction<any>>;
//       })
//     | null;

type EditStorageContextType =
    | (ReturnType<typeof useEditStorageContext>)
    | null;


export const EditStorageContext = React.createContext<EditStorageContextType>(null);



//当作，模板在线文档的编辑数据的，临时存储。 子组件需要监听变化的数据。
// interface EditStorageContextType {
//   storage: any,
//   setStorage: Dispatch<SetStateAction<any>>
// }

/**报告的编辑器修改数据用； EditStorageContext只在路由器直接下级引入的，实际在TwoHalfFrame框架组件的上面一级的；
 * 应该默认 null； 没有实际注入就可以报错
 * */
//这是实例！   不要重复定义实例，确保访问的是同样一个的东东。
// export const EditStorageContext = React.createContext<EditStorageContextType|null>(
//     null
// );

// export const EditStorageContext = React.createContext<EditStorageContextType>(
//     {
//         storage:  undefined,
//         setStorage: value => null,
//     }
// );
