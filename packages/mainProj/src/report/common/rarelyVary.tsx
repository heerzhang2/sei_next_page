"use client";
import * as React from "react";
import {useState, useTransition} from "react"
import Link from "next/link"
import {Button} from "@/components/ui";
import {useParams, usePathname, useRouter, useSearchParams} from "next/navigation";
import {cn} from "@/lib/utils";
import {usePrintPdf} from "@/hooks/usePrintPdf";
import {toast} from "sonner";
import {InputDatalist} from "@/components/chub";
import {useCreateQueryString} from "@/hooks/useCreateQueryString";
import {startProcess} from "@/actions/camunda-actions";
import {ConfigRoot, FileTransform} from "page2pdf_server/src";


//【报告】复用相同的。
//很多内容相对重复，这里是报告较高层范围复用的组件；专门报告类型的可以安排在下一层次分开目录去做。

/**【特别！要！注意】打印情形： pagebreakBefore='always' 的必须小心，前面不要紧跟这是 <br/> 空白变成了空一整页了的可能性出现！！
 * */
export const 注意事项=<div>
    2. 本报告应当由计算机打印输出，或者用钢笔、签字笔填写，字迹应当工整，修改无效。<br/>
    <br/>
    3. 本报告无检验、编制、审核、批准人员签字和检验机构的核准证号、检验专用章或者公章无效。<br/>
    <br/>
    4. 本报告一式三份，由检验机构、使用单位、日常维护保养单位分别保存。<br/>
    <br/>
    5. 受检单位对本报告结论如有异议，请在收到报告书之日起15日内，向检验机构提出书面意见。<br/>
    <br/>
    6. 根据《中华人民共和国特种设备安全法》，使用单位应于下次检验日期届满前1个月向检验机构提出定期检验申请。<br/>
    <br/>
    7. 有关检测数据未经允许，施工、使用单位不得擅自向社会发布信息。
  </div>;

export const 落款单位地址 = () => (
    <React.Fragment>
        {/* 标题部分 */}
        <div className="text-center space-y-1">
            <h4 className="text-2xl font-bold">福建省特种设备检验研究院</h4>
            <h6 className="text-base">
                FUJIAN SPECIAL EQUIPMENT INSPECTION AND RESEARCH INSTITUTE
            </h6>
            <div className="border-t-2 border-gray-600 w-full mx-auto"></div>
            <p className="mt-1 text-left">地址（Add.）：福建省福州市仓山区卢滨路370号</p>
            <div className="flex flex-wrap gap-1 mt-1">
                <div className="flex-1 inline-flex flex-nowrap items-center">
                    <span className="block text-sm font-medium">电话（Tel.）：</span>
                    <span className="block">0591-968829</span>
                </div>
                <div className="flex-1 inline-flex flex-nowrap items-center">
                    <span className="block text-sm font-medium">传真（Fax）：</span>
                    <span className="block">0591-88700509</span>
                </div>
                <div className="flex-1 inline-flex flex-nowrap items-center">
                    <span className="block text-sm font-medium">邮政编码：</span>
                    <span className="block">350008</span>
                </div>
            </div>
            {/* 网站信息容器 */}
            <div className="flex flex-wrap gap-1 mt-1">
                <div className="flex-1 inline-flex flex-nowrap items-center">
                    <span className="block text-sm font-medium">网址（Website）：</span>
                    <a href="https://www.fjtj.com" className="block hover:underline">
                        www.fjtj.com
                    </a>
                </div>
                <div className="flex-1 inline-flex flex-nowrap items-center">
                    <span className="block text-sm font-medium">电子邮箱（Email）：</span>
                    <a href="mailto:fjtj@fjtj.org" className="block hover:underline">
                        fjtj@fjtj.org
                    </a>
                </div>
            </div>
        </div>
    </React.Fragment>
);

//表格TableRow + 字体1rem 极限压缩每一行高度 19px;  rheight最大压缩Body行到32px;
// export const 型试落款地址= ({theme, } :{theme: any, }) => {
//     //没有表线的表格,避免显示过空的，极度压缩Table空间 ； [theme.mediaQueries.phone]: {}  但打印需要行高空大的。
//  return <React.Fragment>
//     <Table fixed={["60%", "%"]} css={{borderCollapse: 'collapse',
//         "@media not print": {
//             "& tr": {
//               height: '1.1rem',
//             },
//             "& tr>td": {
//               padding: 0,
//             },
//         }
//     }} tight miniw={800}>
//       <TableBody>
//         <TableRow>
//           <RCell css={{border: 'none'}}><Text>型式试验机构地址：</Text></RCell>
//           <Cell css={{border: 'none'}}><Text>福建省福州市仓山区卢滨路370号</Text></Cell>
//         </TableRow>
//         <TableRow>
//           <RCell css={{border: 'none'}}><Text>邮政编码：</Text></RCell>
//           <Cell css={{border: 'none'}}><Text>350008</Text></Cell>
//         </TableRow>
//         <TableRow>
//           <RCell css={{border: 'none'}}><Text>联系电话：</Text></RCell>
//           <Cell css={{border: 'none'}}><Text>0591-88700710</Text></Cell>
//         </TableRow>
//       </TableBody>
//     </Table>
//   </React.Fragment>;
// }

/**报告封面的头部区域：
 * */
// export const reportFirstPageHead= ( {theme , No } :{theme: any, No:string}
// ) => {
//   return <React.Fragment>
//       <div css={{
//         textAlign: "center",
//         "& > div": {
//           marginLeft: "auto",
//           marginRight: "auto"
//         },
//         "@media (min-width:690px),print and (min-width:538px)": {
//           display: "flex",
//           justifyContent: "space-between",
//           flexWrap: 'wrap',
//           "& > div": {
//             margin: theme.spaces.sm,
//           }
//         }
//       }}
//       >
//         <div>
//           <Embed css={{width: "190px",margin: "auto"}} width={95} height={45}>
//             <FadeImage src={Img_Ma}/>
//           </Embed>
//           <br/>
//           <Text variant="h5">181320110160</Text>
//         </div>
//         <div>
//           <Embed css={{width: "140px",margin: "auto"}} width={10} height={10}>
//             <FadeImage src={Img_ReportNoQR}/>
//           </Embed>
//         </div>
//         <div>
//           <Text variant="h5">FJB/TC-1001-1-0-2017</Text>
//           <br/><br/>
//           <Text variant="h5" css={{
//             "@media (min-width:690px),print and (min-width:538px)": {
//               marginRight: "1rem"
//             }
//           }}
//           >No：{No}
//           </Text>
//         </div>
//       </div>
//   </React.Fragment>;
// };


// export const reportFirstPageHeadAllNmbbm= ({theme , No } :{theme: any, No:string}
// ) => {
//   return <React.Fragment>
//     <div css={{
//       textAlign: "center",
//       "& > div": {
//         marginLeft: "auto",
//         marginRight: "auto"
//       },
//       "@media (min-width:690px),print and (min-width:538px)": {
//         display: "flex",
//         justifyContent: "space-between",
//         flexWrap: 'wrap',
//         "& > div": {
//           margin: theme.spaces.sm,
//         }
//       }
//     }}
//     >
//       <div>
//         <Embed css={{width: "190px",margin: "auto"}} width={95} height={45}>
//           <FadeImage src={Img_Ma}/>
//         </Embed>
//         <br/>
//         <Text variant="h5">181320110160</Text>
//       </div>
//       <div>
//         <Embed css={{width: "140px",margin: "auto"}} width={10} height={10}>
//           <FadeImage src={Img_ReportNoQR}/>
//         </Embed>
//       </div>
//       <div css={{
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'flex-end'
//       }}>
//         <br/><br/><br/><br/><br/>
//         <div  css={{
//           display: 'flex',
//           "@media (min-width:690px),print and (min-width:538px)": {
//             marginRight: "1rem"
//           }
//         }}
//         ><Text variant="h5" >报告编号：</Text>
//           <Text variant="h5" css={{textDecoration: 'underline'}}>{No}</Text>
//         </div>
//       </div>
//     </div>
//   </React.Fragment>;
// };

interface PDFControlsProps {
    template: string
    verId: string
    repId: string
    rep: any
    pdf_job: ConfigRoot<FileTransform>
    onLocalCvtFin?: () => void
}
export function RepFootLink({ template,
                                verId,
                                repId,
                                rep,
                                pdf_job, onLocalCvtFin }: PDFControlsProps) {
    const searchParams = useSearchParams()
    const print = "1" === searchParams!.get("print")
    const createQueryString = useCreateQueryString()
    const router = useRouter()
    const pathname = usePathname()
    const { action } = useParams()
    const original = "1" === searchParams!.get("original")
    const fixBtn = !action
    const [isMutating, handleSubmit] = usePrintPdf(pdf_job)
    const [isPending, startTransition] = useTransition()
    //浏览器端实际是会发一个请求到nexjs的服务器，服务器执行requireRole最后返回一个应答数据包（函数执行结果）应答浏览器端的模式。const {session, userRoles} = await requireRole([""])
    const handlePDFGeneration = () => {
        startTransition(async () => {
            try {
                if(!handleSubmit)   throw new Error("空pdf_job")
                else{
                    const result =await handleSubmit()
                    onLocalCvtFin?.()  //有结果了去通知
                }
            } catch (error) {
                toast.error("操作失败", {
                    description: "请稍后重试"+error,
                })
            }
        })
    }
    // 保留期限选项
    const retentionOptions = [
        { value: "30", label: "1个月", days: 30 },
        { value: "365", label: "1年", days: 365 },
        { value: "1825", label: "5年", days: 1825 },
        { value: "3650", label: "10年", days: 3650 },
        { value: "10950", label: "30年", days: 10950 },
    ]
    // 创建标签到天数的映射
    const labelToDaysMap = retentionOptions.reduce(
        (acc, option) => {
            acc[option.label] = option.days
            return acc
        },
        {} as Record<string, number>,
    )

    // 创建天数到标签的映射
    const daysToLabelMap = retentionOptions.reduce(
        (acc, option) => {
            acc[option.days] = option.label
            return acc
        },
        {} as Record<number, string>,
    )

    // 新增状态管理
    const [retentionPeriod, setRetentionPeriod] = useState(30) // 存储实际天数
    const [displayValue, setDisplayValue] = useState("1个月") // 存储显示值
    const [pdfStatus, setPdfStatus] = useState<"idle" | "loading" | "success" | "redo">("idle")
    const pdfUri = original ? rep?.link?.ori : rep?.link?.rep
    const [isProcessing, setIsProcessing] = useState(false)

    // 处理期限选择变化
    const handlePeriodChange = (selectedLabel: string) => {
        const days = labelToDaysMap[selectedLabel]
        if (days) {
            setRetentionPeriod(days)
            setDisplayValue(selectedLabel)
        } else {
            // 如果用户输入的是数字，直接使用
            const numericValue = Number.parseInt(selectedLabel)
            if (!isNaN(numericValue) && numericValue > 0) {
                setRetentionPeriod(numericValue)
                setDisplayValue(`${numericValue}天`)
            }
        }
    }

    const getExpirationDate = (days: number) => {
        const expiration = new Date()
        expiration.setDate(expiration.getDate() + days)
        expiration.setUTCHours(0, 0, 0, 0)
        return expiration.toISOString()
    }

    const handlePdfFlow = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isProcessing) return
        setIsProcessing(true)
        setPdfStatus("loading")
        const isoDate = getExpirationDate(retentionPeriod)
        const selectedLabel = daysToLabelMap[retentionPeriod] || `${retentionPeriod}天`

        try {
            const { success, error, processInstanceKey } = (await startProcess({
                processId: "genRepPdf",
                variables: {
                    pdfJob: pdf_job,
                    pdfType: original ? "ori" : "rep",
                    repId,
                    expiration: isoDate,
                },
            })) as any

            if (success && processInstanceKey) {
                setPdfStatus("success")
                toast.success(`申请PDF转换成功！保留期限：${selectedLabel}`, {
                    description: (
                        <>
                            在后端排队，等它完成后，再刷新才能看到下载链接
                            <br />
                            请不要重复提交转换Pdf的申请单，后端也需消耗时间处理。
                        </>
                    ),
                })
            } else {
                setPdfStatus("redo")
                toast.error("PDF转换失败", { description: error })
            }
        } catch (err) {
            setPdfStatus("redo")
            toast.error("PDF转换失败", { description: "错误" + err })
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div id="EndOfRep" className="print:hidden text-center mb-4 md:mb-0">
            <Link href="/" passHref className="text-blue-600 hover:text-blue-800 block text-sm mb-4 md:mb-0 md:inline-block">
                -报告完毕,返回-
            </Link>
            <div
                className={cn(
                    "text-center space-y-3 md:space-y-0 md:space-x-4 md:flex md:justify-around md:flex-wrap",
                    fixBtn ? "mb-12" : "",
                )}
            >
                <div className="mx-auto">
                    <Link
                        href={`http://192.168.171.3:3765/rep/KQcbgDF9RO21DsI92H3tTVJlcG9ydA/SLIDING_JJ/1/ALL`}
                        className="text-blue-600 hover:text-blue-800 text-sm block px-4 py-2 rounded-lg hover:bg-gray-50"
                    >
                        流转(流程)
                    </Link>
                </div>
                <div className="mx-auto">
                    {print ? (
                        <Link
                            href="/"
                            className="text-blue-600 hover:text-blue-800 text-sm block px-4 py-2 rounded-lg hover:bg-gray-50"
                        >
                            回首页
                        </Link>
                    ) : (
                        <Link
                            href={`/rep/${repId}/${template}/${verId}/?print=1${original ? "&original=1" : ""}`}
                            className="text-blue-600 hover:text-blue-800 text-sm block px-4 py-2 rounded-lg hover:bg-gray-50"
                        >
                            预览打印
                        </Link>
                    )}
                </div>
                <div className="mx-auto">
                    <Link
                        href={`/rep/${repId}/${template}/${verId}/ALL`}
                        className="text-blue-600 hover:text-blue-800 text-sm block px-4 py-2 rounded-lg hover:bg-gray-50"
                    >
                        原始记录列表
                    </Link>
                </div>
            </div>
            <div
                className={cn("m-2 flex justify-around items-center gap-2 print:hidden", fixBtn ? "fixed bottom-0 w-full" : "")}
            >
                <Button
                    variant="outline"
                    onClick={() => router.push(pathname + "?" + createQueryString("original", original ? "" : "1"))}
                >
                    {original ? "正式报告" : "原始记录"}
                </Button>
                {action ? (
                    <div />
                ) : (
                    <>
                        <Button
                            variant="outline"
                            onClick={() => router.push(pathname + "?" + createQueryString("print", print ? "" : "1"))}
                        >
                            {print ? "浏览模式" : "打印模式"}
                        </Button>
                        {print && (
                            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => window.print()}>
                                        预览
                                    </Button>
                                    <Button variant="outline" onClick={handlePDFGeneration}  disabled={isPending || isMutating}>
                                      {isPending ? "生成中..." : "本机转pdf"}
                                    </Button>
                                </div>

                                {/* PDF转换区域 */}
                                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                                    {pdfStatus === "idle" && pdfUri ? (
                                        // 显示PDF链接
                                        <div className="flex flex-col sm:flex-row items-center gap-2">
                                            <Link
                                                href={`${process.env.NEXT_PUBLIC_OSS_ENDP}${pdfUri}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                                            >
                                                有pdf版
                                            </Link>
                                            <Button variant="ghost" size="sm"
                                                    onClick={() => setPdfStatus("redo")}
                                            >
                                                后端再转
                                            </Button>
                                        </div>
                                    ) : (
                                        // 显示转换控件
                                        <div className="flex flex-col sm:flex-row items-center gap-2">
                                            <InputDatalist
                                                placeholder="天数"
                                                datalist={retentionOptions.map((a) => a.label)}
                                                value={displayValue}
                                                onListChange={handlePeriodChange}
                                                className="w-[140px]"
                                            />
                                            <Button variant="outline" onClick={handlePdfFlow} disabled={isProcessing}>
                                                {isProcessing ? "发起申请中..." : "后端转pdf"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}


/**因为击链接出现hook报错只好假如2个参数了：ALL printAll需要去掉，要求跳转迂回才能避免编辑器列表的动态增加的ref.独立流转报告切换主报告时刻的编辑器的个数变化引起的useXXX报错。
 * 还是有detected a change in the order of Hooks called by ReportView. 报错的？
 * @param nestIn   嵌入显示于主报告视图上的情况;
 * @param flowNest  需要防止Hook报错的; 组件切换之间实际的可能并没有被卸载掉。
 * */
// export const 分项末尾链接= ( {template, verId, repId,urlMainRep,flowNest,nestIn}
//        : {template: string, verId:string, repId:string,urlMainRep:string,flowNest?:boolean,nestIn?:boolean}
// ) => {
//   const theme = useTheme();
//   // const {history } = useContext(RoutingContext);
//   return  <div css={{
//     "@media print": {
//       display:'none'
//     },
//     textAlign:'center',
//     marginBottom: '0.8rem'
//   }}
//   >
//     { !nestIn &&
//         <RouterLink href={urlMainRep}>-分项报告完毕,返回主报告-</RouterLink>
//     }
//     <div css={{
//       textAlign: "center",
//       "& > div": {
//         marginLeft: "auto",
//         marginRight: "auto",
//         marginTop: '0.5rem',
//         marginBottom: '0.5rem'
//       },
//       [theme.mediaQueries.md]: {
//         display: "flex",
//         justifyContent: "space-evenly",
//         flexWrap: 'wrap'
//       }
//     }}
//     >
//       {flowNest? <div>
//           <RouterLink href={`/report/${template}/ver/${verId}/${repId}/`}>
//             看独立流转的报告记录
//           </RouterLink>
//         </div>
//         :
//         <>
//           <div>
//             <RouterLink href={`/report/${template}/ver/${verId}/${repId}/printAll`}>
//               看完整原始记录
//             </RouterLink>
//           </div>
//           <div>
//             <RouterLink href={`/report/${template}/ver/${verId}/${repId}/ALL`}>
//               编辑原始记录
//             </RouterLink>
//           </div>
//         </>
//       }
//     </div>
//   </div>;
// };


//全部显示报告内容的按钮和控制：hook复用模式的。 点击按钮：全部显示(打印的，做全文搜索需要的)，再点击按钮恢复到默认初始化取值。
//const {viewAll, viewAllBtnLine}=useViewReportALL();  整体显示 还是隐藏部分？
// export const useViewReportALL = () => {
//   const [viewAll, setViewAll] = React.useState(false);      //完全显示所有内容的！；
//   const viewAllBtnLine =<div css={{
//     "@media print": {
//       display:'none'
//     },
//     textAlign: 'center',
//   }}>
//       <IconButton  icon={viewAll?  <IconMinimize2 />: <IconMaximize2 />}
//                    variant="ghost"  label="全部显示"  size="md"
//                    onPress={e => {
//                      setViewAll(!viewAll)
//                    } }
//       />
//   </div>;
//
//   return { viewAll, viewAllBtnLine };
// };

type AttentionPointProps = {
    rep: any
    children: React.ReactNode
    comply?: any
    telurl?: boolean
    btClass?: string;
}

export const AttentionPoint = ({ rep, children, comply, telurl,btClass}: AttentionPointProps) => {
    return (
        <div className="print:mb-12 print:mt-auto print:flex print:items-center print:justify-center print:px-8 print:flex-col print:h-[calc(100vh-3rem)]">
            <h2 className={cn("text-center text-xl font-semibold print:text-2xl print:mb-16",btClass)}>
                注意事项
            </h2>
            <div className="mx-auto flex w-full max-w-3xl flex-col items-center print:max-w-none print:items-start">
                <div className="w-full space-y-3 leading-4 print:space-y-4 print:leading-[2]">
                    {comply && (
                        <span>1．本报告{comply}。</span>
                    )}
                    <div className="space-y-3 print:space-y-4">
                        {children}
                        {telurl && (
                            <span className="print:text-base">
                                报检电话：{rep?.isp?.ispu?.agency?.bjtel}，网址：{rep?.isp?.ispu?.agency?.bjurl}。
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
