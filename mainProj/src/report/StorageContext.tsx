/** @jsxImportSource @emotion/react */
import * as React from "react";
// import { Dispatch, SetStateAction } from "react";


interface Options {
}

export function useEditStorageContext({
         }: Options = {}) {

  const [storage, setStorage] = React.useState<any>({});
  const [modified, setModified] = React.useState<boolean | undefined>();

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
