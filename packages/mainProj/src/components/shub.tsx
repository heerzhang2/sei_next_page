import  { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import {useStorage} from "@/report/StorageContext";
import {usePageSectionOrientation} from "@/components/page-section-orientation";
import * as React from "react";


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

interface ImageProps extends React.ComponentProps<"div">{
    src: string
    alt?: string
    //图片自身的： 外部注入基本都需要"print:max-h-full"；
    //`calc(100vh - 6rem - ${textHeight}rem)` tailwindcss 不能用多个-rem拼凑的！没有空格的；`calc(100vh-${textHeight}rem)`
    className?: string  // 新增 className 属性
    //更容易控制打印的具体高度用： 垂直方向的居中布局；
    //TailwindCss 没法用这样的"print:h-["+imageMaxHeight+"]", 但是可以用这样的"print:h-[calc(100vh-8rem)]", 不能用动态的字符串注入的样式？改用style={{}}
    divClass?: string
}
/**报告打印专用的： #不支持打印：宽度上 多于一个纸张宽的。 高度上 也不支持超出一个纸张高的。
 * css中的数值：默认针对设置是，打印纸张=A4竖着答应的版本；
 * 横着A4打印情况？
 * 单线图的打印因为需要和文本区域共享一张纸高度导致图片高度要自适应的，已不用这个组件来做了。
 * */
export const ImageComponent: React.FC<ImageProps> = ({
                                                         src,
                                                         alt = "图片",
                                                         style,
                                                         className,divClass  // 解构 className
                                                     }) => {
    const {parentOrientation} =usePageSectionOrientation();
    const landscape="landscape"===parentOrientation
    //landscape:外部上一级组件，应该自己知晓的。打印高度自己决定的。
  return (
        <div className={cn("flex justify-around items-center",
                            divClass
                        )}
             style={{ ...style } as any}
        >
              <img
                  src={src || "/placeholder.svg"}
                  alt={alt}
                  className={cn("object-contain max-h-[15cm] @md:5xl:max-h-[19cm]",
                      landscape? "print:max-w-[26.5cm]" : "print:max-w-[705px]",
                      className
                  )}
                  style={{
                      width: "auto",
                      height: "auto",
                      maxWidth: "100%",
                  }}
              />
        </div>
  )
}

/*原本的 className={cn("object-contain max-h-[15cm] @md:5xl:max-h-[19cm]",
         landscape? "print:max-h-[705px] print:max-w-[26.5cm]" : "print:max-h-[26.5cm] print:max-w-[705px]", className)}

         请求失败: http://192.168.171.3:9000/ywmast/202506/2012/37a9f6f6-36b0-45bd-add1-d59baa777b6e，状态码: net::ERR_BLOCKED_BY_ORB
* */


export interface CustomSwitchProps {
    checked: boolean;
    onChange: (value: boolean) => void;
    onBlur?: (e: React.FocusEvent) => void;
    disabled?: boolean;
    name?: string;
    className?: string;
}
export const CustomSwitch =({
                                           checked,
                                           onChange,
                                           onBlur,
                                           disabled = false,
                                           name,
                                           ...rest
                                       }: CustomSwitchProps) => {
    const handleClick = (e) => {
        if (disabled) return;
        const newValue = !checked;
        onChange(newValue);
    };

    return (
        <div className="relative inline-flex shrink-0 h-[25px] w-[42px]">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                data-state={checked ? "checked" : "unchecked"}
                className={`peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ${rest.className || ''}`}
                onClick={handleClick}
                onBlur={onBlur}
                disabled={disabled}
                name={name}
            >
                <span
                    data-state={checked ? "checked" : "unchecked"}
                    className="pointer-events-none block size-4 rounded-full transition-transform ${
                    checked ? 'translate-x-[17px]' : 'translate-x-0'
                  }"
                />
            </button>
        </div>
    );
}

