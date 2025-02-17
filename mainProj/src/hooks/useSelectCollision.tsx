/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Alert, IconButton, IconUserCheck, InputDatalist, InputLine, Text
} from "customize-easy-ui-component";

interface SelectCollisionProps {
    //编辑列表框的标题
    label: string;
    //表集合[]，全部对象。
    table: Array<any>;
    //提取关键字作为列表框的输入匹配：映射出key作为 列表编辑框，底层只能支持这样
    keyMap:  (row: any) => string;
    //回调，每一个对象指南阅读： 展示冲突的。对象明细展示。
    renderRow: (row: any, no:number)=>React.ReactNode;
    //初始化选择 某一个值的：
    init: string;
    //冲突说明
    desc?: string;
}
/**二次选择机会：
 * 目的：解决datalist[] 不能支持可重复的文本叙述，文本叙述作为关键字提供给列表框选择，有些情况这个文本叙述不是唯一的。
 * 能支持可重复的列表标题做选项。 冲突就需要二次选定。
 * InputDatalist的列表选择冲突解决思路，会遇到重复选择项的情况，纠正选择的情况；自带了<InputLine做父组件。
 *  */
export function useSelectCollision({label, table, keyMap, renderRow,init,desc='发现存在相同列表项的，要进一步确认：'
}: SelectCollisionProps) {
    const [meet, setMeet] = React.useState<number[]>();
    const [scoSel, setScoSel] = React.useState<any>(init);
    //比如单元的选择，需要牟定到关键字，当前的inp?.单元表[tableIdx]所指代的某一行，可能和ChoosePipingUnits弹出页面上看见的不是相等的列表。
    const [tableIdx, setTableIdx] = React.useState<number|undefined>();
    //比如单元的选择，需要牟定到关键字，当前的inp?.单元表[tableIdx]所指代的某一行，可能和ChoosePipingUnits弹出页面上看见的不是相等的列表。
    React.useEffect(() => {
        const initialState = computeInitialState();
        setTableIdx(initialState);
        // 注意：由于我们传递了一个空数组作为依赖项，这个effect只会在组件挂载时运行一次
    }, [table]);
    function computeInitialState() {
        if(init){
            const existIdx= table?.findIndex((a:any, i:number)=> keyMap(a)===init );
            return  existIdx>=0? existIdx : undefined;
        }
        else return undefined;
    }
    React.useEffect(() => {
        if(init){
            const existIdx= table?.findIndex((a:any, i:number)=> keyMap(a)===init );
            setTableIdx(existIdx>=0? existIdx : undefined);
        }
    }, [init]);
    const [collision, setCollision] = React.useState<boolean>(false);
    const selectCollision=(
        <>
         <InputLine label={label}>
             <InputDatalist value={scoSel || ''}
                            datalist={table?.map((a:any)=>keyMap(a))}
                            onListChange={v => {
                                setScoSel( v || undefined);
                                let more = [] as number[];
                                table?.forEach((row:any, i:number)=>{
                                    if(keyMap(row) === v)   more.push(i);
                                });
                                if(more.length===1){
                                    setTableIdx(more[0])
                                }
                                else if(more.length>1) {
                                    setMeet(more);
                                    setCollision(true);
                                }
                                else
                                    setTableIdx(undefined);
                            } } />
         </InputLine>
         { collision && <div>
             <Alert intent={"error"} title={desc}/>
             { meet?.map((idx:number)=> {
                 const row = table?.[idx];
                 return <div key={idx}>
                     { renderRow(row, idx) }
                     <div css={{
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'space-evenly',
                     }}>
                         <Text>第{idx+1 || ''}条</Text>
                         <IconButton variant="ghost" label="确定" icon={<IconUserCheck/>}
                                 onClick={async () => {
                                     await setTableIdx(idx);
                                     setCollision(false);
                                 }}
                         />
                     </div>
                 </div>;
             })
             }
          </div>
         }
        </>
    );
    //页面复用的Hook ： 数组table还没准备好的。
    if(table)
        return {
            selectCollision,
            setTableIdx,
            tableIdx,
            setScoSel,
        };
    else  return {
        selectCollision : undefined,
        setTableIdx,
        tableIdx : undefined,
        setScoSel,
    };
}

/*不能把上面的两个React.useEffect做减法; 不能直接上一个这样的：
    React.useEffect(() => {
        if(init){
            const existIdx= table?.findIndex((a:any, i:number)=> keyMap(a)===init );
            setTableIdx(existIdx>=0? existIdx : undefined);
        }
    }, [init,table,keyMap,setTableIdx]);
* */