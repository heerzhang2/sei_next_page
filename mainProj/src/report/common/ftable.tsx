/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    useTheme, InputDatalist, InputLine, Input, CheckSwitch, BlobInputList, TextArea, SuffixInput, InputGroupContext
} from "customize-easy-ui-component";
import {tableSetInp} from "../../common/tool";
import {css} from "@emotion/react";


export type NameFiledAs = {
    /**表格的存储字段
     * 【注意】 json存储的， 这个名字最好简单 字符数少的。避免多余浪费空间。
     * */
    n: string;
    //类型: 决定编辑器的组件选择
    t: string;
    //编辑器字符的宽度: 各个Input的 size; 【例外的】可是若t=== 'n' ? "number"情况不能控制宽度?:改max min?
    w: number;
    //列表形式的 可选择文本；
    l: string[];
    //为Input后加单位的node :可以是string 或 Node;
    u: any;
};
//interface extends React.InputHTMLAttributes<HTMLInputElement> {
export interface FixedTableEditorProps {
    /**表格的模型： 每行的字段配置
    * */
    model: any[][];
    /**给单一个编辑器使用的部分属性字段对象*/
    inp:  any;
    setInp:  React.Dispatch<React.SetStateAction<any>>;
    //表格的哪一行：
    index: number;
    //表格存储 名
    table: string;
    children?: React.ReactNode;
    //title?: string | React.ReactNode;
    // component?: React.ElementType<any>;
    //component :Component= "div",
}

/**固定行数的表格， 报告上面可能像特性表那样地行列做倒置。 表格不能增加删除的，各行排序不能变的。表的字段数多，表的行数少而固定的。
 * 为什么出现了 datalist={list}只能显示前面哪一个编辑器的列表？ datalist id="listundefined" 是底层ID相等的导致。
 * */
export const FixedTableEditor: React.FunctionComponent<FixedTableEditorProps> = ({
    table,model,inp,setInp,index,children, ...other
}) => {
    const theme = useTheme();
    const uid = React.useId();          //【特别】<InputDatalist datalist={list} 必须提供uid的Context注入的，否则id一样，无法区分不同字段的各自的列表。
    // {typeof children === 'string' ? <Text>{children}</Text>   :   <>{children}</> }
    return  <div css={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly'}}>
        {model.map(([orgDesc, nameObj, cb]: any, i: number) => {
            const desc = typeof orgDesc === 'string' ? orgDesc : orgDesc?.text;       //第一列的遇见的：标题也做了定制和回调啊。
            const {t: type, n: name, w: width, u: unit, l: list} = nameObj as NameFiledAs;
            // console.log("FixedTableEditor当前ORc-type=",type ,"list=",list,"desc=",desc);
            if (cb?.edit) {
                return <div key={i} css={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                    {desc}
                    <div style={{display: 'inline-flex', width: 'unset'}}>
                        {cb.edit(inp, setInp, table, index,name,width)}
                    </div>
                </div>;
            } else if (type === 'l') return <div key={i} css={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                {desc}
                <InputGroupContext.Provider value={{uid: uid + i}}>
                    <InputDatalist value={inp?.[table]?.[index]?.[name] || ''} size={width} datalist={list}
                                   style={{display: 'inline-flex', width: 'unset'}}
                                   onListChange={v => tableSetInp(table, index, inp, setInp, name, v || undefined)}/>
                </InputGroupContext.Provider>
            </div>;
            else if (type === 'd') return <div key={i} css={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                    {desc}
                  <Input value={inp?.[table]?.[index]?.[name] || ''}  type='date'  size={width}
                       style={{display: 'inline-flex', width: 'unset'}}
                       onChange={e => tableSetInp(table, index, inp, setInp, name, e.currentTarget.value || undefined)}/>
             </div>;
            else if (type === 'b') return <div key={i} css={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                 {desc}
                    <CheckSwitch checked={inp?.[table]?.[index]?.[name] || false}
                             onChange={e =>{
                                 tableSetInp(table, index, inp, setInp, name, inp?.[table]?.[index]?.[name]? undefined : true)
                             } }/>
                </div>;
            else if (type === 'B') return <div key={i} css={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                  {desc}
                  <BlobInputList value={inp?.[table]?.[index]?.[name] || ''}  rows={width} datalist={list}
                               style={{display: 'inline-flex', width: '100%'}}
                               onListChange={v => tableSetInp(table, index, inp, setInp, name, v  || undefined)}/>
                </div>;
            else if (type === 'm') return <div key={i} css={{width: '100%'}}>
                 {desc}：
                 <TextArea value={inp?.[table]?.[index]?.[name] || ''} rows={width}
                          style={{display: 'inline-flex', width: '100%'}}
                          onChange={e => tableSetInp(table, index, inp, setInp, name, e.currentTarget.value  || undefined)}/>
              </div>;
            else if (unit) return <div key={i} css={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                 {desc}
                 <SuffixInput value={inp?.[table]?.[index]?.[name] || ''} size={width}
                             style={{display: 'inline-flex', width: 'unset'}}  textStyle={css`align-items:center;`}
                             onSave={txt => tableSetInp(table, index, inp, setInp, name, txt || undefined)}
                             type={type === 'n' ? "number" : undefined}>{unit}</SuffixInput>
              </div>;
            else return <div key={i} css={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                    {desc}
                    <Input value={inp?.[table]?.[index]?.[name] || ''} size={width}
                           type={type === 'n' ? "number" : undefined}
                           style={{display: 'inline-flex', width: 'unset'}}
                           onChange={e => tableSetInp(table, index, inp, setInp, name, e.currentTarget.value || undefined)}/>
                </div>;
        }) }
     {children}
    </div>;
};

