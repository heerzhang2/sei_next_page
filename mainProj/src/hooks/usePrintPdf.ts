import * as React from "react";
// import {useRef} from "react";
// import {useToast} from "customize-easy-ui-component";
// import useMutation from "use-mutation";
//直接把本地打印转换服务器的包提取数据类型：
import {ConfigRoot, FileTransform} from "page2pdf_server/src/types/request/config";
/**对接的打印转换器 客户机上的本地 node js server 服务
* */

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};
async function createPrintJob({ job }: {
  job: ConfigRoot<FileTransform>;
}) {
  //统一用一个api入口端点：
  const res = await fetch('http://localhost:9389/api/pdf', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(job),
  });
  if (!res.ok) throw new Error(res.statusText);
  return await res.json();
}


/**对接文书打印转换器，web打印构建起最终答应的pdf
 * */
export function usePrintPdf(processFn: Function) {
  // const toast = useToast();
  // const [mutate, { status }] = useMutation(createPrintJob, {
  //   onMutate({ input }) {
  //     return () => {};
  //   },
  //   onSuccess({ data, input }) {
  //     toast({
  //       title: "打印转换器应答",
  //       subtitle: ''+data?.data?.result,
  //       intent: "info"
  //     });
  //   },
  //   onFailure({ error, rollback, input }) {
  //     toast({
  //       title: "打印转换器应答",
  //       subtitle: ''+error,
  //       intent: "error"
  //     });
  //     //rollback();
  //   },
  // });

  const handleSubmit = React.useCallback(
      function handleSubmit() {
        const job=processFn();
        // mutate({ job });
      },
      [
          // mutate
      ]
  );

  if (!processFn || typeof processFn !== "function")
    return [ void 0  ];             //{doFunc: void 0 };
  ///return [ready, throttledFn]; 数组的版本编译器容易报错！改成返回对象的搞。
  return [ handleSubmit ];
}

