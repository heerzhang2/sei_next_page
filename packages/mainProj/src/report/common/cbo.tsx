import type {UseFormReturn} from "react-hook-form";
import {FormControl, FormField, FormItem, FormLabel, FormMessage, Input} from "@/components/ui";
import {SuffixInput} from "@/components/chub";
import {CCell} from "@/components/flexible-table";
import * as React from "react";
import {calcAverageArrObj} from "@/common/tool";

export const genCBoAvAl = (nmar: string[], resvDg: number, unit: string, title?: any) => {
    return (orc: any, parOrc: any) => {
        return {
            edit: (form: UseFormReturn<any, any, any>) => {
                let valuAr = nmar.map((name: any, c: number) => {
                    const ovalue = form.watch(name + 'o')
                    return ovalue
                });
                const avHs = calcAverageArrObj(valuAr, (row) => row, resvDg);
                return [true, <div key='1'>
                    <span className="font-semibold">{title}：</span>
                    <div>
                        <FormField
                            control={form.control}
                            name={nmar[0] + 'o'}
                            render={({field}) => (
                                <FormItem className="flex items-center gap-1 pt-1 break-inside-avoid">
                                    <FormLabel className="select-text">观测数据</FormLabel>
                                    <FormControl>
                                        <SuffixInput unit={unit}  {...field}  />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField control={form.control} name={nmar[0] + 'a'}
                                   render={({field}) => (
                                       <FormItem className="gap-1 pt-1 break-inside-avoid">
                                           <FormLabel className="select-text">设计值</FormLabel>
                                           <FormControl className="text-center">
                                               <Input  {...field}/>
                                           </FormControl>
                                           <FormMessage/>
                                       </FormItem>
                                   )}
                        />
                    </div>
                    <h4>计算的测量结果： {avHs} {unit}</h4>
                </div>]
            },
            view: () => {
                let valuAr = nmar.map((name: any, c: number) => orc?.[name + 'o']);
                const avHs = calcAverageArrObj(valuAr, (row) => row, resvDg);
                return [false, <>
                    <CCell className="text-sm">{orc?.[nmar[0] + 'o']}</CCell>
                    <CCell split rowSpan={nmar.length} className="text-sm">{avHs}</CCell>
                    <CCell split rowSpan={nmar.length} className="text-sm">{orc?.[nmar[0] + 'a']}</CCell>
                </>]
            },
        };
    }
};
//搞成2层的 高阶函数：
export const genCBoOmitAl = (name: string, unit: string, title?: any) => {
    return (orc: any, parOrc: any) => {
        return {
            edit: (form: UseFormReturn<any, any, any>) => {
                return [true, <div key='1' className="flex flex-wrap items-center gap-1 justify-center">
                    <span className="font-semibold">{title}：</span>
                    <FormField
                        control={form.control}
                        name={name + 'o'}
                        render={({field}) => (
                            <FormItem className="flex items-center gap-1 pt-1 break-inside-avoid">
                                <FormLabel className="select-text">观测数据</FormLabel>
                                <FormControl>
                                    <SuffixInput unit={unit}  {...field}  />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>]
            },
            view: () => {
                return [false, <>
                    <CCell className="text-sm">{orc?.[name + 'o']}</CCell>
                </>]
            },
        }
    }
};
