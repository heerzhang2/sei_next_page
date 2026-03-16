// useOssDeleteFileMutation.tsx - 修改版本
"use client"
import { gql, useMutation } from 'urql';
import {toast} from "sonner";

const mutation = gql`
  mutation useOssDeleteFileMutation($file: String!,$key: String,$value: String) {
    ossDeleteFile(file: $file,key: $key,value:$value)
  }
`;

// 支持动态回调的版本
export default function useOssDeleteFileMutation() {
    const [updateResult, ossDeleteFile] = useMutation(mutation)

    const onSubmit = (file: string, key?: string, value?: string, callback?: (resp: any, fileUrl: string) => void) => {
        //设定一个TAG/key,上传时刻也一样的关键key; key=“eid” value=关联实体的ID
        ossDeleteFile({
            file,
            key,
            value,
        }).then((result) => {
            console.log("useOssDeleteFileMutation=应答=", result)

            if (result.error) {
                // 检查是否为 502 错误或其他服务器错误
                const errorStr = result.error.toString()
                const isServerError = errorStr.includes("502") || 
                                     errorStr.includes("503") || 
                                     errorStr.includes("504") ||
                                     errorStr.includes("Bad Gateway") ||
                                     errorStr.includes("Service Unavailable") ||
                                     errorStr.includes("Gateway Timeout")
                
                const errorMessage = isServerError ? "OSS服务不可用" : errorStr
                
                toast.error("删除oss文件失败", {
                    description: errorMessage,
                })
                console.log("Oh no!", result.error)
                callback && callback(errorMessage, file)
            } else {
                const {ossDeleteFile: ack } = result?.data
                callback && callback(ack, file)
            }
        })
    }

    return {call: onSubmit};
}
