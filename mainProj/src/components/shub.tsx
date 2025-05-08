import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"


/*v0.dev自动帮忙写代码，替代旧的UI库代码。
CSS的container-type: inline-size;是容器查询（Container Queries）的核心特性之一：避免副作用的多一次刷新页面，不需要辅助的js代码。@container (width >= 32rem) {columns: 2;}
* */

interface FormFieldProps {
    id: string
    label: string
    required?: boolean
    error?: string
    className?: string
    children: ReactNode
}

export function FormField({ id, label, required = false, error, className, children }: FormFieldProps) {
    return (
        <div className={cn("flex flex-col space-y-2 w-full break-inside-avoid", className)}>
            <Label htmlFor={id} className="flex items-center text-sm font-medium">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            <div className={cn("w-full", error && "ring-1 ring-red-500 rounded-md")}>{children}</div>

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    )
}

/*打印A4竖着情况：
<div css={{display: 'flex',justifyContent: 'space-around',alignItems: 'center', margin: '1px 0' }}>
{ orc?._FILE_测点?.url &&
    <img src={process.env.NEXT_PUBLIC_OSS_ENDP+orc?._FILE_测点?.url} alt={orc?._FILE_测点?.url}
         css={{
             maxHeight: '14cm',   //在这个元素的上一级元素可以自己加一个固定高度值，就像一张纸打印的应该多高的取值。这个用固定高度会导致图片自动的横竖比例不均衡压缩=会变形啊！24cm是纸张大约最多高度=报告最大图片高。
             maxWidth: '-webkit-fill-available',
             [theme.mediaQueries.lg]: {maxHeight: '18cm', maxWidth: undefined},           //普通图片+大屏幕限制高度才是关键的。
             //【想法】大约一整页height: '96vh' +底下一个行的。
             "@media print": { maxWidth: '100%'},        //对A4纸张竖版的高度26cm基本都是图片整张纸，这里没考虑多个图片在宽度方向上的并排布局：可用软件合并。
         }}
    />
}
</div>
* */
interface ImageProps {
    src: string
    alt?: string
    className?: string  // 新增 className 属性
}
/**报告打印专用的：
 * */
export const ImageComponent: React.FC<ImageProps> = ({
                                                         src,
                                                         alt = "图片",
                                                         className  // 解构 className
                                                     }) => {
    return (
        <div className={`flex justify-around items-center ${className || ''}`}>
            <div>
                <img
                    src={src || "/placeholder.svg"}
                    alt={alt}
                    className={`object-contain max-h-[14cm] print:max-h-[26cm] print:max-w-[705px] lg:max-h-[18cm] ${className || ''}`}
                    style={{
                        width: "auto",
                        height: "auto",
                        maxWidth: "100%",
                    }}
                />
            </div>
        </div>
    )
}

