import {ConfigRoot, FileTransform} from "page2pdf_server/src";

// 生成函数
export const createPdfJob = (
    rep: any,
    original: boolean = false,
    frNo: number = 3,
    cRange: string = "1-2"
): ConfigRoot<FileTransform> => {
    const urlPrn = `/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/?print=1` + (original ? "&original=1" : "")
    //组装正式报告：可能有多个子报告和目录及封面的，拼装一份pdf;       【全部展开显示的报告】?print=1
    const url = `${process.env.NEXT_PUBLIC_APP_WEB}` + urlPrn
    //报告，原始记录，其它的证书形式；
    return(
    {
    name: `${original ? "记录" : "报告"}${rep?.isp?.no || ''}`,
    lay: {
        head:  `<div class="parent">
  <div class="child">报告No: ${rep?.isp?.no || ''}</div>
</div>
<style>
  .parent {
    position: relative;
    width: 100%;
    border-bottom: 1px solid #eeeeee;
    margin: 8px 15px 0;
    font-size: 12px;
  }
  .child {
    position: absolute;
    width: 100%;
    text-align: left;
    bottom: 0;
    left: 30px;
  }
</style>`,
    },
    files: [
        {
            url,
            out: `tmp-${rep?.isp?.no || ''}${original ? "-o" : ""}`,
            frNo,
            cRange,
        },
    ]
  } as ConfigRoot<FileTransform>)
};

