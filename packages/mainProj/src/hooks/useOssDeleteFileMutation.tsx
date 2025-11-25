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
                toast.error("删除oss文件失败", {
                    description: result.error.toString(),
                })
                console.log("Oh no!", result.error)
                callback && callback(result.error.toString(), file)
            } else {
                const {ossDeleteFile: ack } = result?.data
                callback && callback(ack, file)
            }
        })
    }

    return {call: onSubmit};
}
