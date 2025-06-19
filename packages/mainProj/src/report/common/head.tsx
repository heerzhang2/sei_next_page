import * as React from "react";
import Image from 'next/image'

/**没有MA  机电报告；  固定高度 8.5rem
 * */
export const ReportFirstPageHeadJd = ({ rep, mbbm }: { rep: any; mbbm: string }) => {
    return (
        <div className="flex justify-between items-center text-center h-[8.5rem] print:-mt-1">
            <div className="overflow-hidden">
                <span className="relative -mt-[1.1rem] text-[0.9rem]" />
            </div>
            <div>
                <Image src="/images/reportNoQR.png" width={1} height={1} alt="二维码"
                    style={{height: "8rem",width: "auto"}}
                />
            </div>
            <div className="overflow-hidden flex flex-col justify-evenly">
          <span  className="text-[0.8rem]">
            {mbbm}
          </span>
                <div className="flex items-center md:mr-4 print:mr-4">
                    <span className="text-sm">报告编号：</span>
                    <span className="underline">
              {rep?.isp?.no}
            </span>
                </div>
            </div>
        </div>
    )
}

/**没有 mbbm
 * */
export const ReportFirstPageHeadCyCert = ({ rep }: { rep: any }) => {
    return (
        <div className="h-[2.5rem] w-full"> {/* 添加w-full确保父容器宽度 */}
            <div className="relative h-full"> {/* 保持相对定位容器 */}
                <div className="absolute -top-[10px] right-0"> {/* 改为right-0定位 */}
                    <Image
                        src="/images/FBPI.png"
                        width={1}
                        height={1}
                        alt="二维码"
                        className="w-auto h-auto"
                        style={{ height: "3rem" }}
                    />
                </div>
            </div>
        </div>
    );
};
