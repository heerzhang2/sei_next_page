import * as React from "react";
import Image from 'next/image'
import { withBasePath } from '@/lib/tool'
/**没有MA  机电报告；  固定高度 8.5rem
 * */
export const ReportFirstPageHeadJd = ({ rep, mbbm }: { rep: any; mbbm: string }) => {
    return (
        <div className="flex justify-between items-center text-center h-[8.5rem] print:-mt-1">
            <div className="overflow-hidden">
                <span className="relative -mt-[1.1rem] text-[0.9rem]" />
            </div>
            <div>
                <Image src={`${withBasePath('/images/reportNoQR.png')}`} 
                    width={1} height={1} alt="二维码"
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

/**报告封面的头部区域：
 * 紧凑型
 * 其中MA  mbbm都没有
 * */
export const ReportFirstPageHeadNmaNmbm = ({ rep }: { rep: any }) => {
    return (
        <div className="flex justify-between items-center text-center h-[8.5rem] print:-mt-1">
            <div className="overflow-hidden">
                <span className="relative -mt-[1.1rem] text-[0.9rem]" />
            </div>
            <div>
                <Image
                    src={`${withBasePath('/images/reportNoQR.png')}`}
                    width={1}
                    height={1}
                    alt="二维码"
                    style={{ height: "8rem", width: "auto" }}
                />
            </div>
            <div className="h-full flex flex-col items-end justify-start">
                {/* FBPI图片 - 右上角 */}
                <div className="mb-2">
                    <Image
                        src={withBasePath("/images/FBPI.png")}
                        width={1}
                        height={1}
                        alt="FBPI标识"
                        className="w-auto h-auto"
                        style={{ height: "3rem" }}
                    />
                </div>

                {/* 报告编号 - 在图片下方，右对齐 */}
                <div className="flex items-center">
                    <span className="text-sm">报告编号：</span>
                    <span className="underline">{rep?.isp?.no}</span>
                </div>
            </div>
        </div>
    )
}

export const ReportFirstPageHeadNmaNmbm4= ({theme , rep, mbbm,nofbp,op } :{theme: any, rep:any, mbbm?:string,nofbp?:boolean,op?:boolean}
) => {
    return <React.Fragment>
        <div css={{
            display: 'flex',
            justifyContent: 'space-between',
            textAlign: 'center',
            height: '11rem',
        }}>
            <div/>
            <div>
                <Embed css={{width: "140px", margin: "auto"}} width={10} height={10}>
                    <FadeImage src={Img_ReportNoQR}/>
                </Embed>
            </div>
            <div css={{overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
                {nofbp? <div css={{height: "6rem"}}/>
                    :
                    <Embed css={{width: "120px", margin: "auto", top: '-0.65rem'}} width={78} height={35}>
                        <FadeImage src={Img_Fbpi}/>
                    </Embed>
                }
                <div css={{
                    display: 'flex',
                    "@media (min-width:690px),print and (min-width:538px)": {
                        marginRight: "1rem"
                    }
                }}
                ><Text variant="h5">{op?'记录':'报告'}编号：</Text>
                    <Text variant="h5" css={{textDecoration: 'underline'}}>{rep?.isp?.no}</Text>
                </div>
            </div>
        </div>
    </React.Fragment>;
};


/**没有 mbbm
 * 打印dom不能超出，在纸张margin区域做输出的。
 * */
export const ReportFirstPageHeadCyCert = ({ rep }: { rep: any }) => {
    return (
        <div className="h-[2.5rem] w-full"> {/* 添加w-full确保父容器宽度 */}
            <div className="relative h-full"> {/* 保持相对定位容器 */}
                <div className="absolute  right-0"> {/* 改为right-0定位 -top-[10px] */}
                    <Image
                        src={withBasePath("/images/FBPI.png")}
                        width={1}
                        height={1}
                        alt="FBPI"
                        className="w-auto h-auto"
                        style={{ height: "3rem" }}
                    />
                </div>
            </div>
        </div>
    );
};
