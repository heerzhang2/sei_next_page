
/**新一代测量 展示; #支持node坐标题;
 * @param only : 只有一个测量字段的情形，否则是俩个字段。 【注意】only=false的情况在上面不要嵌套<LineColumn；
 * @param unit 单位支持平方米的2在右上角的小写排版，所以扩充为 ReactNode ？{可兼容的}。
 * @param resDeft: 结果字段由外部规则注入的，测量结果的转换规则：同时也就不需要做存储的。 但也可能允许修改的。
 * @param resEdit: 结果字段允许修改的。 自动转换的 可能无法修改的。
 * @param allowableV 附加字段栏目 允许取值。
 * @param seqLineName  同一个序号底下的第一行的存储。
 * @param labelOmit  因为结果字段允许取值两个栏目的多行做归并的情形，提示标题。
 * @param columns  布局调整
 * @param item  项目简短地名字 ，item允许没有
 * @return {lcNode,outNode}   预备DOM的两个组件的组合。 差别：lcNode是嵌套在<LineColumn底下的。outNode是在外部的和<LineColumn是并行的关系。
 * */
type MeasurementCProps = {
    children?: React.ReactNode
    item: string
    tCopy: any[]
    nameH: string
    unit: string | React.ReactNode;
    inp: any
    setInp: React.Dispatch<React.SetStateAction<any>>;
    allowableV: boolean
    resEdit: boolean
    only?: boolean;
    calculate?: any;
    seqLineName?: string,
    labelOmit?: string,
    columns?: number
}
/**原来measurementCrenderN返回的lcNode部分 : 旧的用纯函数const measurementCrenderN=(item:string,tCopy: any[],nameH:string来直接return{lcNode:做法：没法做副作用的更新能力。
 *@param children 文本其他行的。
 * 旧版是const measurementCrenderN=(item:string,tCopy: any[],nameH:string,unit:string | React.ReactNode,inp:any,setInp:React.Dispatch<React.SetStateAction<any>>,
 *                                  allowableV:boolean,resEdit:boolean,only?:boolean, calculate?:any,seqLineName?:string,labelOmit?:string,columns?:number
 * ):{ outNode: JSX.Element|undefined; lcNode: JSX.Element; } => {  return{lcNode: <div >
 * */
export const MeasurementCline = ({item,tCopy,nameH,unit,
                                     allowableV,resEdit, calculate,seqLineName,labelOmit,columns }: MeasurementCProps
) =>{
    const oName=nameH+'o';
    const vName=(seqLineName??nameH)+'v';      //若resDeft提供的，和可能没有该存储的；
    const aName=nameH+'a';      //允许取值存储在
    let descNodes=[];
    for(let l=0;l<tCopy.length;l++){
        descNodes.push(<Text key={l+1} css={{marginLeft: '1rem'}}>{tCopy[l]}</Text>);
    }
    if(!!item){
        descNodes.push(<Text key={0} css={{marginLeft: '1rem',fontWeight:800}}>{item}</Text>);
    }
    React.useEffect(() => {
        if(resEdit){             //没必要保存给后端情形？
            const vName=(seqLineName??nameH)+'v';       //小行的项目名字优先
            setInp({...inp,[vName]: calculate});
        }
    }, [calculate, seqLineName,nameH, setInp]);    //不加上inp

    if(labelOmit){
        //合并了多个行的情况： 一个标题实际对应连续几个项目小行的。文本申明对应的层次隶属关系提升到上层一级别 =》outNode。
        return <LineColumn column={columns??6}  >
            <InputLine  label='观测数据' >
                <SuffixInput  value={inp?.[oName] ||''} onSave={txt=> setInp({...inp,[oName]: txt || undefined })}>{unit}</SuffixInput>
            </InputLine>
            { resEdit? <InputLine  label={(labelOmit??'')+'测量结果'}>
                    <SuffixInput  value={inp?.[vName] || calculate || ''} onSave={txt=> setInp({...inp,[vName]: txt || undefined })}>{unit}</SuffixInput>
                </InputLine>
                :
                <Text>{labelOmit}测量结果= { inp?.[vName]??calculate } </Text>
            }
            { allowableV && <InputLine  label={(labelOmit??'')+'允许值'} >
                <SuffixInput  value={inp?.[aName] ||''} onSave={txt=> setInp({...inp,[aName]: txt || undefined })}>{unit}</SuffixInput>
            </InputLine>
            }
        </LineColumn>
    }
    else{
        //最多情况是：  带有结果取值的栏目，是跑到这里：#是嵌套了俩层次的<LineColumn组件的。
        return <div >
            <div css={{marginLeft: '1rem'}}>{descNodes}{'>>'}</div>
            <LineColumn column={columns ?? 7}
                        css={{         //底层是display: grid布局的
                            alignItems: 'center',
                            justifyItems: 'center',
                        }}>
                <InputLine label='观测数据'>
                    <SuffixInput value={inp?.[oName] || ''}
                                 onSave={txt => setInp({...inp, [oName]: txt || undefined})}>{unit}</SuffixInput>
                </InputLine>
                {resEdit ? <InputLine label={'测量结果'}>
                        <SuffixInput value={inp?.[vName] || calculate || ''}
                                     onSave={txt => setInp({...inp, [vName]: txt || undefined})}>{unit}</SuffixInput>
                    </InputLine>
                    :
                    <Text>测量结果= {inp?.[vName] ?? calculate} </Text>
                }
                {allowableV && <InputLine label={'允许值'}>
                    <SuffixInput value={inp?.[aName] || ''}
                                 onSave={txt => setInp({...inp, [aName]: txt || undefined})}>{unit}</SuffixInput>
                </InputLine>
                }
            </LineColumn>
        </div>
    }
};

<div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-4">
    {itemsRender}

</div>