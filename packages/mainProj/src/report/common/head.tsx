import * as React from "react";
import Image from 'next/image'

/**没有MA  机电报告；  固定高度 8.5rem
 * */
export const ReportFirstPageHeadJd = ({ rep, mbbm }: { rep: any; mbbm: string }) => {
    return (
        <div className="flex justify-between items-center text-center h-[8.5rem] print:-mt-1">
            <div className="overflow-hidden">
                {/*<Embed className="w-[155px] mx-auto -mt-[0.65rem]" width={78} height={35} />*/}
                <span className="relative -mt-[1.1rem] text-[0.9rem]" />
            </div>
            <div>
                <Image src="/images/reportNoQR.png" width={140} height={140} alt="二维码" />
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
