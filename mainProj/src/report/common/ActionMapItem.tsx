import * as React from "react";
import {useItemInputControl,} from "../common/base";
import {RecordOmniArea} from "../common/omni";
import {Column_Setting} from "./useFormatOmni";
import {BlobInputList, CollapsibleFormSection, InputDatalist, MemoDateInput, MemoDatesInput} from "@/components/chub";
import {FormField} from "@/components/shub";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useState} from "react";
import {CardFooter} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

//检验项目的标准化展示组件, 多了2列”工作见证，确认方式“
interface Props  extends React.HTMLAttributes<HTMLDivElement>{
    editAreasConf: RecordOmniArea[];
    /**单一个路由可编辑区域对应的 一部分项目列表的 配置*/
    index: number;
    show?: boolean;
    alone?: boolean;
    ref?: any;
    refWidth?: number;
    /**后面两个参数：定制 ，确认日期字段 有些项目需要拆分为两个日期输入的情况；
     * */
    // custST?: (area:RecordOmniArea,par:any,fields:any)=>any;

    //确认 字段的：确认日期 需要拆分为两个日期输入
    // sureCB?: ({inp,setInp,config,tago,addMemo,icname} :any)=>React.ReactNode;
    /** '资料确认描述或存在问题描述' 输入框的可选择的列表文本。
     * */
    sureList?: string[];
    //是否需确认日期录入， 默认自拆分项目只有一个日期的。
    sureD?: boolean;
    editIts: Column_Setting[];
    //报告ID
    repId?: string;
}
//假如分项报告情况：原来inp:,setInp：是针对局部的存储做修改的。
//普通输入：    //text
//支持 t类型：'',B,l,d,C,S;
// const innerRender=(inp: any,setInp: React.Dispatch<React.SetStateAction<any>>,zdCfg:Column_Setting,idx:number,
//                    namepr:string,label?:string,refWidth?:number)=>{
//     const {n, x, m, t, l, z}=zdCfg;
//     let input=null;
//     if(t==='d')
//         input= <Input
//             id="startDate"
//             type="date"
//             value={formData.[`${namepr}_`+n]}
//             onChange={(e) => handleChange(`${namepr}_`+n, e.target.value)}
//             aria-invalid={!!errors.startDate}
//         />;
//     else if(t==='B')
//         input=<BlobInputList value={(inp?.[`${namepr}_`+n]) ?? ''} rows={z??2}  datalist={l}
//                     onListChange={v => setInp({...inp, [`${namepr}_`+n]: v || undefined}) } />
//     else if(t==='l' && l)
//         input=<InputDatalist value={(inp?.[`${namepr}_`+n]) ?? ''}  datalist={l}
//                     onListChange={v => setInp({...inp, [`${namepr}_`+n]: v || undefined}) } />
//     else if(t==='C')
//         input=<MemoDateInput value={(inp?.[`${namepr}_`+n]) ?? ''}  rows={z??2}
//                              onChange={v => setInp({...inp, [`${namepr}_`+n]: v || undefined}) } />;
//     else if(t==='S')
//         input=<MemoDatesInput value={(inp?.[`${namepr}_`+n]) ?? ''}  rows={z??2}  refWidth={refWidth}
//                              onChange={v => setInp({...inp, [`${namepr}_`+n]: v || undefined}) } />;
//     else
//         input=<Input value={(inp?.[`${namepr}_`+n]) ?? ''}  size={z}
//                     onChange={e => setInp({ ...inp, [`${namepr}_`+n]: e.currentTarget.value || undefined})} />;
//
//     return <InputLine key={idx} label={label??x}>
//         {input}
//     </InputLine>;
// }

// 定义表单数据类型： 报告存储字段名字不限定的，类型也不确定。
export interface FormData {
    [key: string]: any
}

// 定义验证错误类型
export interface FormErrors {
    [key: string]: string
}
/**编辑区：【单一个index=？编辑区域的】 全部项目。  当前editAreasConf[index]是可以动态的。
 * @param editIts   支持是可变的情况: 可能外部需要注入动态的输入列表情况：
    const witnessNos =React.useMemo(() => {
        return storage.见证表?.map((a:any, i:number) => a && a.no);
    }, [storage.见证表]);
    *  _M`];      //备注; _Z`];      //工作见证; _S`];      //确认日期
* 若想orc?._Oitems用户输入的文本有格式化换行效果等，只能在记录编辑的2个解析器这里特殊对待来做。？特殊标记，特定标签的tag '_其它'+i。<br/>替换\n;
 * refWidth：抛弃不用了？ 没必要用LineColumn布局，直接多列的做。
* */
export const ActionMapItem=
React.forwardRef((
    { children, show=true, alone=true,editAreasConf,index,refWidth,sureList,editIts,sureD,repId}:Props, ref
) => {
    const config=editAreasConf[index];
    const {inp, setInp} = useItemInputControl({ ref });
    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        玻璃: "ff",
        安全带: "",
        department: "",
        email: "",
        agreeToTerms: false,
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<FormErrors>({})
    // 处理输入变化
    const handleChange = (field: keyof FormData, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))

        // 当字段被修改时清除该字段的错误
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }
    // 验证表单
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}
        // 必填字段验证
        if (!formData.安全带.trim()) {
            newErrors.安全带 = "安全带结果-是必填项"
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }
    // 处理表单提交
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (validateForm()) {
            setIsSubmitting(true)

            // 模拟API调用
            setTimeout(() => {
                // 这里是您需要的JSON数据
                const jsonData = JSON.stringify(formData, null, 2)
                // setJsonResult(jsonData)
                setIsSubmitting(false)

                // 在实际应用中，您可以在这里调用您的API
                console.log("提交的数据-调用您的API:", jsonData)
            }, 1000)
        } else {
            // 滚动到第一个错误
            const firstErrorField = document.querySelector('[aria-invalid="true"]')
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" })
            }
        }
    }
    //假如分项报告情况：原来inp:,setInp：是针对局部的存储做修改的。
    //普通输入：    //text
    //支持 t类型：'',B,l,d,C,S;
    const innerRender=(idx:number, namepr:string,label?:string)=>{
        const {n, x, m, t, l, z}=editIts[idx];
        let input=null;
        if(t==='d')
            input= <Input
                id={`${namepr}_`+n}
                type="date"
                value={formData[`${namepr}_`+n]}
                onChange={(e) => handleChange(`${namepr}_`+n, e.target.value)}
                aria-invalid={!!errors[`${namepr}_`+n]}
            />
        else if(t==='B')
            input= <BlobInputList
                id={`${namepr}_`+n}
                value={formData[`${namepr}_`+n]}
                onListChange={(value) => handleChange(`${namepr}_`+n, value)}
                datalist={l}
                rows={z??2}
                aria-invalid={!!errors[`${namepr}_`+n]}
            />
        else if(t==='l' && l)
            input= <InputDatalist
                id={`${namepr}_`+n}
                value={formData[`${namepr}_`+n]}
                onListChange={(value) => handleChange(`${namepr}_`+n, value)}
                datalist={l}
                aria-invalid={!!errors[`${namepr}_`+n]}
            />
        else if(t==='C')
            input= <MemoDateInput
                id={`${namepr}_`+n}
                value={formData[`${namepr}_`+n]}
                onChange={(value) => handleChange(`${namepr}_`+n, value)}
                width="14rem"  rows={z??2}
                aria-invalid={!!errors[`${namepr}_`+n]}
            />
        else if(t==='S')
            input= <MemoDatesInput
                id={`${namepr}_`+n}
                value={formData[`${namepr}_`+n]}
                onChange={(value) => handleChange(`${namepr}_`+n, value)}
                rows={z??2}
                aria-invalid={!!errors[`${namepr}_`+n]}
            />
        else
            input= <Input
                id={`${namepr}_`+n}
                value={formData[`${namepr}_`+n]}
                onChange={(e) => handleChange(`${namepr}_`+n, e.target.value)}
                size={z}
                aria-invalid={!!errors[`${namepr}_`+n]}
            />;
        return <FormField id={`${namepr}_`+n} key={idx} label={label??x} error={errors[`${namepr}_`+n]}>
            {input}
        </FormField>;
    }

    //【注意】React.useMemo必须将 <LineColumnFlex> 所依赖的变量refWidth作为依赖项之一，否则否则丢失跟踪的目标，否则无法立刻自适应宽度变化。
    const render =React.useMemo(() => {
        let htmlTxts =[] as any[];
        //允许本编辑区的配置继承来自前面的编辑区。反方向去搜索配置。【前提】最低一级或者第四级别必然做配置的。 x y z可能省略配置。editAreasConf[0]第一个必然会配置全套的。
        //【不同点】允许相等检验项目栏目编码串的，直接融合正在编辑的项目区域显示。
        for(let wf=0; wf<config.items?.length; ){
            const tago=config.items[wf];
            //连续跟随的几个项目是否 ？多个具有相同的项目编码串 alikeSize=相同的个数 项目栏目编码串判定一摸一样横跨剩下几个行的；
            if(tago) {
                let mergLastEt=tago;    //归并区的最后一行
                if(tago.offset){
                    mergLastEt= config.items[wf + tago.offset];
                }
                if(!mergLastEt)  throw new Error(`或没最后一行配置`);
                const icname= mergLastEt.mergName??mergLastEt.name;
                if(!tago.nconcl && !icname)  throw new Error(`或没最后一行配置名`);
                // let mergeName=mergLastEt.mergName;      //itemMergReverseSearch(config, wf); 相反反向的 搜寻存储字段
                let labelStr='' as string;
                if(tago.name){       //优先采用的recap  tips  nos
                    if(tago.nconcl && tago.recap && typeof tago.recap==='string'){
                        if(tago.tips && tago.tips.length<tago.recap.length)
                            labelStr=tago.tips;         //太多了文字！
                        else
                            labelStr=tago.recap as string;
                    }
                    else{
                        //正式默认都只会显示一个合并项目，没有显示拆分项目的： 自拆分的合并，也不好直接用recap。
                        // if(!tago.nconcl && !tago.tips && tago.recap && typeof tago.recap==='string')
                        //     labelStr=tago.recap;
                        // else
                        labelStr=tago.tips? tago.tips: tago.nos? tago.nos+'-结果' : '检验结果';
                    }
                }
                const addMemo= (tago.name && !tago.nconcl) || (tago.mergName && !tago.nconcl);
                //注意 ?? 只能对null undefined有反应，对于 '' 以及 0 都是不会测试成功的。 所以 '' 不能用来替代undefined的位置。
                // const mergLabel=mergLastEt.mergLabel??mergLastEt.mergNos??tago.tips??(typeof tago.recap==='string'? tago.recap:null)??tago.nos;
                //前半部分的 必须使用这个方式添加nodes;否则<LineColumn >无法穿透。
                const headNoLabel=tago.nos? `${tago.pre||''}${tago.iclas||''}${tago.nos}` : `${mergLastEt.pre||''}${mergLastEt.iclas||''}${mergLastEt.mergNos??mergLastEt.nos}`;
                const rowHead =<div key={wf} className="mt-4 @container">
                    { (tago===mergLastEt && mergLastEt.name===undefined)? null
                        :
                        <div className="flex justify-around">
                            <h6>{headNoLabel}</h6>
                            <h6>{tago.rec?.big}&nbsp;&nbsp;{tago.rec?.seco}</h6>
                            <h6>{tago.rec?.third}&nbsp;&nbsp;{tago.rec?.four}</h6>
                        </div>
                    }
                    <div className="flex justify-around">
                                { typeof tago.desc === "string"?
                                    <h5>{tago.desc}</h5>
                                    :
                                    tago.desc
                                }
                    </div><hr/>
                    <div  className="columns-1 @lg:columns-2 @4xl:columns-3 @7xl:columns-4">
                        {
                            tago.name && editIts.map(({n, x, m, t, l, z}: Column_Setting, i: number) => {
                                if(n===null) return null;
                                else if(n===''){
                                    if(l) {
                                        return <FormField id={tago.name!} key={i} label={labelStr} required error={errors[tago.name!]}>
                                            <Select value={formData[tago.name!]} onValueChange={(value) => handleChange(tago.name!, value)}>
                                                <SelectTrigger id={tago.name!} aria-invalid={!!errors[tago.name!]}>
                                                    <SelectValue placeholder="选择其中一项" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    { l.map((item, i:number)=> {
                                                        return <SelectItem  key={i} value={item}>{item}</SelectItem>
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </FormField>;
                                    }
                                    return <FormField id={tago.name!} key={i} label={labelStr} required error={errors[tago.name!]}>
                                        <Select value={formData[tago.name!]} onValueChange={(value) => handleChange(tago.name!, value)}
                                                aria-invalid={!!errors[tago.name!]}
                                        >
                                            <SelectTrigger id={tago.name!} aria-invalid={!!errors[tago.name!]}>
                                                <SelectValue placeholder="选单项的结论" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={'√'}>合格</SelectItem>
                                                <SelectItem value={'▽'}>见证确认</SelectItem>
                                                <SelectItem value={'／'}>无此项</SelectItem>
                                                <SelectItem value={'×'}>不合格</SelectItem>
                                                <SelectItem value={'△'}>无法检测</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormField>;
                                }
                                else if(!m){
                                    return innerRender(i, tago.name!,undefined);
                                }
                                return null;
                            })
                        }
                        {
                            addMemo && editIts.map(({n, x, m, t, l, z}: Column_Setting, i: number) => {
                                if(n===null) return null;
                                else if(m){
                                    const label=`${tago.mergNos??tago.nos??''}`+x;
                                    return innerRender(i, icname!,label);
                                }
                                return null;
                            })
                        }
                    </div>
                </div>;

                htmlTxts.push(rowHead);
            }
            wf+= 1;
        }

        return  htmlTxts;
    }, [config,inp,setInp, errors, editIts]);


    return  <CollapsibleFormSection title={`${config.name??config.tag}`} defaultOpen={show}>
        <form onSubmit={handleSubmit}>
            {render}
            <CardFooter className="flex justify-end space-x-4 border-t p-6">
                <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                    重置
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "提交中..." : "提交表单"}
                </Button>
            </CardFooter>
        </form>
    </CollapsibleFormSection>;

    // <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
    //                              alone={alone} label={`${config.name??config.tag}`} repId={repId}>
    //     {render}
    // </InspectRecordLayout>;
} );

