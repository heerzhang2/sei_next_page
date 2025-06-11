import * as React from "react";
import {calcAverageArrObj, initialFormArr} from "../../../common/tool";
import type {UseFormReturn} from "react-hook-form";
import {FormControl, FormField, FormItem, FormLabel, FormMessage, Input} from "@/components/ui";
import {BlobInputList, SuffixInput,} from "@/components/chub";
import {z} from "zod";
import {CCell} from "@/components/flexible-table";

/*较通用的，同一个规范共享的
* */
export const cbK2_4 =(orc:any,parOrc:any)=> {
    return {
        edit: (form: UseFormReturn<any, any, any>) => {
            return [false, <div key='1'><h4>K2.4抽查的结构件为：</h4>
                <FormField key={"抽查构件"}
                           control={form.control}
                           name={"抽查构件"}
                           render={({ field }) => (
                               <FormItem>
                                   <FormLabel className="select-text">抽查</FormLabel>
                                   <FormControl>
                                       <Input  {...field}/>
                                   </FormControl>
                                   <FormMessage />
                               </FormItem>
                           )}
                />
            </div>]
        },
            names: ['抽查构件'],
    }
};
//父辈已经有约定了：className="grid grid-cols-1 @5xl:grid-cols-2 gap-4"> className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-4"
//子元素col-span-X这个X不可以超出父辈的约定最大数的。 className ${item.size === "large" ? "@5xl:col-span-3 @5xl:row-span-3" : ""}
export const cbK3_55 =(orc:any,parOrc:any)=> {
    let schemas={} as any;
    //模型schema字段定义用的
    schemas["磨损径"] = z.array(
            z.union([z.string(), z.number(), z.undefined()])
                .transform((val) => (val === "" || val === undefined ? "" : val)),
        ).length(4)
    let defaults={} as any;
    defaults['磨损径']= initialFormArr(orc?.['磨损径'], 4)
    return{
        edit: (form: UseFormReturn<any, any, any>) => {
            const watchedValues = form.watch('磨损径') as number[]
            const avsDiam = calcAverageArrObj(watchedValues, (row) => row, 1, 4);
            return [true, <div key='1' className="@7xl:col-span-2 @7xl:row-span-2 text-center">
                <h3 className="text-lg font-medium mb-0">磨损钢丝绳直径测量4个：</h3>
                <div className="flex flex-wrap items-center gap-4 justify-center">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span>{ ['一', '二', '三', '四'][index] }处测:</span>
                            <FormField control={form.control} name={`磨损径.${index}`}
                               render={({ field }) => (
                                   <FormItem className="mb-0">
                                   <FormControl>
                                       <SuffixInput unit={"mm"} type="number" step="0.001" min="0" placeholder="0.000" className="w-20"
                                                value={field.value === null || field.value === undefined ? "" : field.value}
                                                onChange={(e) => {
                                                    const value = e.target.value === "" ? "" : Number(e.target.value)
                                                    field.onChange(value)
                                                }}
                                       />
                                   </FormControl>
                                   <FormMessage />
                                   </FormItem>
                               )}
                            />
                        </div>
                    ))}
                </div>
                <span>测量结果：{avsDiam}mm</span>
            </div>]
        },
        schemas: schemas,
        defaults: defaults,
        view: () => {
            const avsDiam = calcAverageArrObj(orc?.磨损径, (row) => row, 1, 4);
            let node = ['一', '二', '三', '四'].map((cap: any, c: number) => (
                <div key={c}
                     className={c === 0 ? "border-t-0" : "border-t border-gray-900"}>
                    {orc?.磨损径?.[c]}
                </div>
            ));
            return [false, <>
                <CCell className="p-0">{node}</CCell>
                {<CCell>{avsDiam}</CCell>
                }
            </>]
        }
    }
};

export const cbK2_6 =(orc:any,parOrc:any)=> {
    return  {
      edit: (form: UseFormReturn<any, any, any>) => {
        return [false, <div key='1'><h4>磨损最大的重要轴（销轴）为：</h4>
            <FormField control={form.control} name={`销轴损最`}
                render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
          <h4>锈蚀最大的重要轴（销轴）为：</h4>
            <FormField control={form.control} name={`销轴锈最`}
                render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>]
      },
      names: ['销轴损最', '销轴锈最'],
    }
};
// min-w-48
export const cbK4_6 =(orc:any,parOrc:any)=> {
    return  {
  edit: (form: UseFormReturn<any, any, any>) => {
    return [false, <div key='1' className="flex flex-wrap items-center gap-1 justify-center">
        <span>连续工作的异步电机工作电流应当不大于电机的额定电流。</span>
        <FormField
            control={form.control}
            name={`工电机`}
            render={({ field }) => (
                <FormItem className="flex items-center gap-1 pt-1 break-inside-avoid">
                    <FormLabel className="select-text">电机</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
      <span>电机额定电流为：</span>
      <FormField control={form.control} name={"机额电流"}
                 render={({ field }) => (
                     <FormItem className="flex items-center gap-1 pt-1 break-inside-avoid">
                       <FormLabel className="select-text">电流</FormLabel>
                       <FormControl className=" ">
                         <SuffixInput  unit={'A'}  {...field}  />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                 )}
      />
    </div>]
  },
  names: ['工电机', '机额电流'],
}
};

export const cbK5_21 =(orc:any,parOrc:any)=> {
    return  {
  edit: (form: UseFormReturn<any, any, any>) => {
    return [false, <div key='1' className="flex flex-wrap items-center gap-1 justify-center content-center">
        <span>座席距地面最大高度：</span>
      <FormField control={form.control} name="座席高"
                 render={({ field }) => (
                     <FormItem className="flex items-center gap-1 pt-1 break-inside-avoid">
                       <FormLabel className="select-text">高度</FormLabel>
                       <FormControl className="w-full">
                         <SuffixInput  unit={'m'}  {...field}  />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                 )}
      />
    </div>]
  },
  names: ['座席高'],
}
};

export const genCBoOmit = (name: string,) => {
  return {
    view: (orc: any) => {
      return [false, <>
        <CCell>{orc?.[name]}</CCell>
      </>]
    },
  };
};

export const cbK2_12_3 =(orc:any,parOrc:any)=> {
    return  {
        edit: (form: UseFormReturn<any, any, any>) => {
            return [false, <div key='1'><h4>轨道型式为：</h4>
                <FormField control={form.control} name="道型式"
                           render={({ field }) => (
                               <FormItem className="flex-1">
                                   <FormControl>
                                       <BlobInputList rows={1} datalist={['型钢','钢管']} {...field}  />
                                   </FormControl>
                                   <FormMessage />
                               </FormItem>
                           )}
                />
            </div>]
        },
        names: ['道型式'],
    }
};
export const cbK2_12_4 =(orc:any,parOrc:any)=> {
    return  {
        edit: (form: UseFormReturn<any, any, any>) => {
            return [false, <div key='1'><h4>侧轮在轨道哪一侧：</h4>
                <FormField control={form.control} name="侧轮哪侧"
                           render={({ field }) => (
                               <FormItem className="flex-1">
                                   <FormControl>
                                       <BlobInputList rows={1} datalist={['内','外']} {...field}  />
                                   </FormControl>
                                   <FormMessage />
                               </FormItem>
                           )}
                />
                <h4>是不是木质轨道：</h4>
                <FormField control={form.control} name="木质轨"
                           render={({ field }) => (
                               <FormItem className="flex-1">
                                   <FormControl>
                                       <BlobInputList rows={1} datalist={['是','不是']} {...field}  />
                                   </FormControl>
                                   <FormMessage />
                               </FormItem>
                           )}
                />
            </div>]
        },
        names: ['侧轮哪侧', '木质轨'],
    }
};
