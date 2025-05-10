"use client"
import * as React from "react";
import {
    InspectRecordLayout,
    InternalItemProps,
    SelectPair,
    SelectValDescPair,
    useItemInputControl
} from "../common/base";
import {assertNamesUnique, PlainArConfigs} from "../common/eHelper";
import {EditStorageContext} from "../StorageContext";
import {useState} from "react";
import {ItemOmniConfig} from "./omni";
import {splitNosByLastDot, splitNosByLastDotPan} from "./helper";
import useClipboard from "react-use-clipboard";

function groupAndMergeStrings(arr: string[], size: number): string[] {
    // 首先按照固定大小分组
    const grouped = [];
    for (let i = 0; i < arr.length; i += size) {
        const chunk = arr.slice(i, i + size);
        grouped.push(chunk);
    }
    // 然后将每个分组内的字符串合并为一个单独的字符串
    const mergedStrings = grouped.map(group => group.join('')); // 这里使用逗号作为分隔符，你可以根据需要更改
    return mergedStrings;
}
interface Props extends InternalItemProps {
    type: string;
    //允许自定义缺省的模型对象：避免多用户的测试干扰。
    frameMod?: any;
    defTitle?: string;
    defDesc?: string;
}

//测试默认值：【调试使用】 配置自定义的模型参数。【具体】配置看特定模型处理函数。
const defaultFrameM={
    'New2ColBase': `{ "bn":"1.2.1." ,
                "sn": 0, "mg":2,
                "sk":[[1,2],[1,2],[1,2]]
            }`,
    'New2ColBigSpl': `{ "mg":2,"dcl":"A","cl":"A",
         "sk":[{"no":"1.2.3.12","r":[1,4],"pr":"*"}, {"r":[1,4],"pr":"*"}, {"r":0,"pr":"*"}, {"r":[2],"pr":"*"} ]
    }`,
};

//三个正式报告的项目：
const defaultTitle=`使用资料
通道及照明
机房通道门及警示标志
`;
//分隔开两个子项目的文本： 一个空行！【特别小心】有没有空格的的看起来像空行!!!
const defaultDesc=
    `审查使用单位是否提供以下适用于受检电梯的资料：

(1)电气原理图、液压系统原理图、安装使用维护保养说明书、检验和检测报告；

(2)日常使用状况记录、维护保养记录、运行故障和事故记录。

检查其是否符合以下要求：

(1)通往机器空间的通道保持通畅，相关人员能够安全、方便、无阻碍地使用；如果通往机器空
间的通道高出楼梯所到平面不超过4.0m，可以采用固定的梯子作为通道；

(2)进入机器空间的门附近的通道设有永久性电气照明。

检查其是否符合以下要求：

(1)机房通道门不能向机房内开启，其高度不小于1.80m，宽度不小于0.60m；门上装有用钥匙
开启的锁，门开启后不用钥匙能够将其关闭和锁住，门锁住后不用钥匙能够从机房内将门打
开；

(2)机房通道门外侧设有包含“电梯机器——危险 未经允许禁止入内” 文字的警示标志。
`;

/**几种模型的能力简要叙述： 越后面适应性可能性更强大的。
 * */
const 生成模型选=[['New2ColBase',"两栏新常态-最简情况的"],
    ['New2ColBigSpl',"两栏新常态可适应性强的"],
    ['Rec3ClRep2Cl',"记录有三栏的正式报告却才两栏，x.y.z在记录以x.y加一栏"],
    ['CmnTowerCrane',"类似塔式起重机模板的，分4个栏目，报告显示小拆分项"],
    ['JavaMember',"Java class类的成员提取,准备进一步加工"],
] as SelectValDescPair[];

function removeLeadingChars(str: string, specialChar: string) {
    // 直接构造正则表达式，无需对specialChar进行转义（因为它在这个上下文中不是正则表达式的特殊字符）
    const regex = new RegExp(`^[\\d\\. ${specialChar} ]+`, 'g');
    return str.replace(regex, '');
}
//最多两位数字开头，并且紧接着的字符不是数字
function startsWithDigitsExact(str: string) {
    return /^\d$/.test(str) || /^\d\d(?!\d)/.test(str);
}
//可以认定为一个段落的起点吗？ 数字后面跟着, .
function strictCheckNumbersFollowed(str: string) {
    // const regex = /\d+(?:\s*[，、])/g;
    // const regex = /\d+(?:\s*[，,、.])/g;
    const regex = /\d+(?:\s*[，,、.)）])/g;
    //可能出现 错误判别的？？
    return str.match(regex) !== null && str.trim() !== '';
}
//记录叙述区域的从PDF文档拷贝过来的：预处理，段落分解。
function splitAndInsertEmptyLines(text: string) {
    const lines = text.split(/\r?\n/); // 匹配\n或\r\n
    // 遍历每行，根据条件处理
    const processedLines = lines.map((line, index) => {
        let insertEmptyLine = false;
        // 检查当前行是否是以(或（后跟数字开始，以决定下一行前是否需要插入空行  （）  （\(  ）) if (/^[\（\(]\d+/.test(line)) ;
        if (/^[（(]\d+/.test(line)) {
            insertEmptyLine = true;
        }
        else{               //***要求：  自拆分的纯文本一行的最后字符是 ： 的也算一段落结束！
            if(line.endsWith(':') || line.endsWith('：'))
                insertEmptyLine= true;
            else{
                insertEmptyLine= startsWithDigitsExact(line) &&  strictCheckNumbersFollowed(line);
            }
        }
        if(insertEmptyLine && index > 0)   return '\n' + line;
        else  return line;
    });
    return processedLines.join('\n');
}

/**有些代码太罗嗦：可 尝试生成启动框架模式的代码；
 * */
export const GenCode =
React.forwardRef((
    {show, alone = true,type:defaultType,frameMod,defTitle,defDesc}: Props, ref
) => {
    const defaultFrameDyn= frameMod?? defaultFrameM;   //允许动态：配置决定列表
    const cust模型选= 生成模型选.filter(([mtag,_d]:any) => defaultFrameDyn[mtag]!==undefined);      //缩小列表
    const theme = useTheme();
    const atPrint = useMedia('print');
    const toast = useToast();
    const [type, setType] =useState<string|undefined>(defaultType);
    const [frame, setFrame] =useState<string>(defaultFrameDyn[type as keyof typeof defaultFrameDyn]);
    const [title, setTitle] =useState<string>(defTitle??'');
    const [desc, setDesc] =useState<string>(defDesc??'');
    const [descSpld, setDescSpld] =useState<boolean>(false);
    const [result, setResult] =useState<string>('');
    const [errors, setErrors] =useState<string>('');
    const doGenCode = React.useCallback((frame: string) => {
        let obj=JSON.parse(frame??'[]');
        //标题的 每一行一个：
        const itemstitle= title?.split(/\r?\n/) || [];
        obj.items=itemstitle.map((title, m:number) =>title.trim()).filter((a:string) => a!=='');       //正式报告项目的标题[]；
        const itemsdesc= desc?.split(/\r?\n/) || [];
        //归并原始记录的多行的文本：
        let arrartxt: string []=[];
        let atPtr=0;
        const groupSize: number =obj.mg??1;        //把原来的几行归并成一行的文本的；
        let lastPos=0;
        itemsdesc.forEach((pure:string, l:number)=>{
            let trimPure = pure.trim();
            if(trimPure==='' || l===itemsdesc.length-1){
                let newItemlns= l===itemsdesc.length-1 ? itemsdesc.slice(lastPos) : itemsdesc.slice(lastPos, l);
                // 使用reduce来根据groupSize合并字符串
                const mergedStrings = groupAndMergeStrings(newItemlns, groupSize);
                console.log(mergedStrings); // 输出与上面相同
                arrartxt[atPtr]= mergedStrings.join("\n");
                atPtr++;
                lastPos=l+1;
            }
        });
        obj.descs=arrartxt;       //【归并】每一个小项目都会有的文本区域[可能有多行的]；规定每一行都必须尾随唯一一个的空行=分割标记；一个小项目一个坑：
        let codes='';
        //需根据 type= ？？ 来区分的：  关键的obj具体对象格式：生成函数自己负责。
        if('New2ColBase'===type)   codes=genNew2ColBase(obj);
        else if('New2ColBigSpl'===type)   codes=genNew2ColBigSpl(obj);
        else if('Rec3ClRep2Cl'===type)   codes=genRec3ClRep2Cl(obj);
        else if('CmnTowerCrane'===type)   codes=genCmnTowerCrane(obj);
        setResult(codes);
        toast({title: "完成！", subtitle: "可复制到工程中", intent: "success"});
    }, [type,title,setResult,desc, toast]);
    //每行标题 前面明显没用的字符剔除：
    const autoModifyTitle = React.useCallback((frame: string) => {
        let obj=JSON.parse(frame??'[]');
        const itemstitle= title?.split(/\r?\n/) || [];
        obj.items=itemstitle.map((title, m:number) =>title.trim()).filter((a:string) => a!=='');       //正式报告项目的标题[]；
        let tmpAr: string[]=[];
        let cntr=0;
        obj.items.forEach((otitl:string, l:number)=>{
            let trimPure =removeLeadingChars(otitl, obj.sk[cntr]?.pr??'')
            //报告一行只能对应一行的，【例外】两行的需人工预先修订！
            let trimrow = trimPure.trim();
            if(trimrow.length>0)
                tmpAr[cntr++]=trimPure;
        });
        const ntitles=tmpAr.join('\n');
        setTitle(ntitles);
    }, [title,setTitle]);
    //每段的记录叙述 明显应该分段的：最后统计段落个数。
    const autoSplitDesc = React.useCallback((frame: string) => {
        const nDescs=splitAndInsertEmptyLines(desc)
        setDesc(nDescs);
        setDescSpld(true);
    }, [desc,setDesc,setDescSpld]);
    const onVerifyJson = React.useCallback((frame: string) => {
        setDescSpld(false);
        try{
            let obj=JSON.parse(frame??'[]');
            setErrors('');
        } catch (err: any) {
            setErrors(err.message);
        }
    }, [setDescSpld]);
    const getInpFilter = React.useCallback((par: any) => par, []);
    const {inp, setInp} = useItemInputControl({ref});
    const [isCopied, setCopied] = useClipboard(result || '');    //其它申请单关联了本申请单地情况。
    if (atPrint) return null;
    else return (
        <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show} alone={alone}
                             label={'快组织代码的生成'}>
            首先{`选择模型，当前是(${type})`} 》
            <SelectPair value={type ?? ''} dlist={cust模型选}
                        css={{          //"div:has(&)": { width: '-webkit-fill-available' },  是所有的父辈？
                            "div:has(&).Select": { maxWidth: '40rem' },
                        }}
                        onChange={e => {
                    setType(e.currentTarget.value || undefined);
                    const newFrm = defaultFrameDyn[e.currentTarget.value as keyof typeof defaultFrameDyn];
                    setFrame(newFrm);
            }}/>
            <Text variant="h6">输入构想配置，根据底层代码和类型来组织配置模型：</Text>
            <TextArea value={frame || '{}'} rows={4} css={{fontSize: '1.15rem'}}
                      onChange={e => setFrame(e.currentTarget.value)}/>
            <div className="container" css={{position: 'relative'}}>
                <Button size='xs' intent='warning' css={{position: 'absolute',right:'0.5rem',bottom: 0}}
                        onPress={() => onVerifyJson(frame)}>校验</Button>
            </div>
            {errors && <>
                <Text variant="h3"> 输入错误：</Text><Text variant="h5">{errors}</Text>
            <br/></>}
            输入正式报告的标题：
            <Button intent='primary' onPress={() => autoModifyTitle(frame)}>修正标题首部</Button>
            <TextArea value={title || ''} rows={6} onChange={e => setTitle(e.currentTarget.value)}/>
            <Text variant="h6"
                  css={{display: 'contents'}}>输入原始记录的叙述，规定每一行都必须尾随唯一一个的空行(作分割标记)：</Text>
            <Button intent='primary' disabled={descSpld} onPress={() => autoSplitDesc(frame)}>分拆记录叙述</Button>
            <TextArea value={desc || ''} rows={30} onChange={e => setDesc(e.currentTarget.value)}/>
            <Button intent='success' onPress={() => doGenCode(frame)}>生成快速消费的代码</Button>
            生成的代码：
            <TextArea value={result || ''} readOnly={true} rows={18}/>
            <Button intent='primary' disabled={isCopied}  onPress={async (e) => setCopied()
            }>复制代码</Button>
        </InspectRecordLayout>
    );
});

/**生成源代码： 适用性= 机电项目表， 新常态， 原始记录只有两栏目的。
 * frame: 具体对象格式？ 生成函数自己负责。 frame输入的举例：sk部分[]：普通项目用0,0,来占位的,自拆分项目才是[1,3]等等的。
 *【约定】项目编号对于自拆分的一个大区块只能有一个，小行用(i++)来体现的，且只出现在nos的生成中，不在seco:标题中显示。
 * 具体用例： escalator/supervi ；
 * 配置用法 'New2ColBase': `{ "bn":"1.2.1." , "sn": 0, "mg":2, "sk":[[1,2],[1,2],[1,2]]  }`,
 * */
function genNew2ColBase(mdl: any) :string {
    let sumBigr=0, sumBigo=0;
    mdl.sk?.forEach((varv:any, c:number)=>{
        if(varv === 0){
            sumBigr++;
            sumBigo++;
        }
        else {
            const [a ,b]=varv;     //@须确保输入[,]是数字的！
            if(b===undefined){
                sumBigr++;
                sumBigo+= a;
            }else if(a<=b){          //确保a===1? 前面的那些行都当作文字行。没有用作编辑，正式报告可定没有的； 1+1的情况？只能按照第一行是纯粹文字来做。
                if(a !== 1)    throw new Error("头文字行>1");
                sumBigr++;
                sumBigo+= b+a;
            }
            else{
                if(b !== 1)    throw new Error("尾文字行>1");
                sumBigr++;
                sumBigo+= a+b;
            }
        }
    });
    const lastNo=mdl.sn+ mdl.sk?.length-1;      //编号
    let rows: string[]=[];
    let dscPos=0;         //记录的提取位置
    mdl.sk?.forEach((varv:any, i:number)=>{
        let daimal='';
        const title=mdl.items?.[i];
        const [a ,b]= varv===0? [0,0] : varv;
        if(varv === 0){         //普通项目的
            daimal=(i===0? `crtOmni('${title}',{bspan:${sumBigr},seco:'A${mdl.bn}${mdl.sn+i}', },{bspan:${sumBigo}, },`
                    : `crtOmni('${title}',{seco:'A${mdl.bn}${mdl.sn+i}',},undefined,`
            )
            +`
            <Text>${mdl.descs?.[dscPos]}
            </Text>, {nos:'${mdl.bn}${mdl.sn+i}',},false,'${title}'),
            `;
            rows.push(daimal);
            dscPos++;
        }else if(b===undefined){
            if(a <= 1)    throw new Error("自拆分<=1");
          //没有纯文本行的；
            for(let x=0; x<a-1; x++){
                const headOut=(i===0? `crtOmni('',{bspan:${sumBigr},seco:'A${mdl.bn}${mdl.sn+i}',span:1},{bspan:${sumBigo},span:${a} },`
                        : `crtOmni('',{seco:'A${mdl.bn}${mdl.sn+i}',span:1},{span:${a} },`
                );
                //除了第一行 有点特别的；
                daimal=(x===0? headOut
                            : `crtOmni('',{},undefined,`
                    )
                    +`
                <Text>${mdl.descs?.[dscPos]}
                </Text>, {nos:'${mdl.bn}${mdl.sn+i}(${x+1})',},true,),
                `;
                rows.push(daimal);
                dscPos++;
            }
            //最后一行：
            daimal=`crtOmni('',{ },undefined,
            <Text>${mdl.descs?.[dscPos]}
            </Text>, {nos:'${mdl.bn}${mdl.sn+i}(${a})',mergNos:'${mdl.bn}${mdl.sn+i}',mergName:'${mdl.items?.[i]}'},false,'${mdl.items?.[i]}'),
            `;
            rows.push(daimal);
            dscPos++;
        }
        else if(a<=b){       //最前面一行，纯文本行的
            daimal=(i===0? `crtOmni(undefined,{bspan:${sumBigr},seco:'A${mdl.bn}${mdl.sn+i}',span:1},{bspan:${sumBigo},span:${a+b} },`
                   : `crtOmni(undefined,{seco:'A${mdl.bn}${mdl.sn+i}',span:1},{span:${a+b} },`
                )
                +`
                <Text>${mdl.descs?.[dscPos]}
                </Text>, { },true,),
                `;
            rows.push(daimal);
            dscPos++;               //descs[]消费 推进
            for(let x=0; x<b; x++){         //更多的自拆分的小项目：除非是最后哪一行的。 x==b-1;
                if(x===b-1){
                    daimal=` crtOmni('',{},undefined,
                    <Text>${mdl.descs?.[dscPos]}
                    </Text>, {nos:'${mdl.bn}${mdl.sn+i}(${x+1})',mergNos:'${mdl.bn}${mdl.sn+i}',mergName:'${mdl.items?.[i]}'},false,'${mdl.items?.[i]}'),
                    `;
                    rows.push(daimal);
                }else{
                    daimal=` crtOmni('',{},undefined,
                    <Text>${mdl.descs?.[dscPos]}
                    </Text>, {nos:'${mdl.bn}${mdl.sn+i}(${x+1})',},true,),
                    `;
                    rows.push(daimal);
                }
                dscPos++;
            }
        }else{
            //【假如例外】1+2+1的模式，1行的纯文本+2条行的正常子项目+1行纯文本；解决思路直接按照：1+3来配置，生成后稍微人工去改动代码即可了。
            //多个 行的； 尾巴是纯文本行； 但不是[1+1行]
            for(let x=0; x<a; x++){
                const headOut=(i===0? `crtOmni('',{bspan:${sumBigr},seco:'A${mdl.bn}${mdl.sn+i}',span:1},{bspan:${sumBigo},span:${a+b} },`
                        : `crtOmni('',{seco:'A${mdl.bn}${mdl.sn+i}',span:1},{span:${a+b} },`
                );
                //除了第一行 有点特别的；
                daimal=(x===0? headOut
                        : `crtOmni('',{},undefined,`
                )
                +`
                <Text>${mdl.descs?.[dscPos]}
                </Text>, {nos:'${mdl.bn}${mdl.sn+i}(${x+1})',},true,),
                `;
                rows.push(daimal);
                dscPos++;
            }
            //尾巴纯文本行的
            daimal=`crtOmni(undefined,{ },undefined,
            <Text>${mdl.descs?.[dscPos]}
            </Text>, {mergNos:'${mdl.bn}${mdl.sn+i}',mergName:'${mdl.items?.[i]}'},false,'${mdl.items?.[i]}'),
            `;
            rows.push(daimal);
            dscPos++;
        }
     });
    console.log("配置对象:", mdl);
    return `pushOmni(ari,'${mdl.bn}${mdl.sn}',[
    
    ${rows.join('')}
    ],'${mdl.bn}${mdl.sn}${mdl.items?.[0]}-${mdl.bn}${lastNo}${mdl.items?.[mdl.sk?.length-1]}');`;
}
/**生成源代码：新常态， 原始记录只有两栏目的。 对若【不是新常态的模板】实际也能借用，生成的代码人工稍作修改也能出点效果的。
 * 具体对象格式看缺省例子sk:{ no项目编号  r:[自拆分分解行], big 大标题,pr:'*'},cl:'',dcl:'A', 普通项目没改动no big得也可以直接用0替代。
 * 而且seco:自动补全pre的前缀符号。
 * 新常态风格的报告和原始记录(拆分项报告不显示小项，小项目编号1,2,3)。 自拆分项目的crtOmni(''生成以后请确保最少一行已经设置name存储，否则显示错！
 * 具体用例： amusement/observDj ；
 * */
function genNew2ColBigSpl(mdl: any) :string {
    let rows: string[]=[];
    let dscPos=0;         //记录的提取位置
    //【强制约定】项目编号对于自拆分的一个大区块只能有一个，小行用(i++)来体现的，且只出现在nos的生成中，不在seco:标题中显示。
    let  nosOffs=0;      //项目编码的偏移++
    const iClass=mdl.cl ?? '';        //项目类别符号。是针对一整个输出大块的。
    let  addiC= !(mdl.cl===mdl.dcl);      //需要添加iClass的配置吗。
    let  nosBn: string='',    noTail :number=0;
    let iclasCod=addiC? `,iclas:'${iClass}'` : '';     //小片段代码
    let firstNo: string='';            //给 tag 的编号
    //首先往前面查看sk[]： 确认big的分解，计算当前的bspan;  ?并不是每一次i：都要计算吧。
    let sumBigr=0,  sumBigo=0;
    mdl.sk?.forEach((setb:any, i:number)=>{
        const {no, r:varv, big, pr:noPr} = setb===0? {no:undefined, r:0, big:undefined,pr:undefined}: setb;
        if(!firstNo)   firstNo=no;    //最开始nos
        const bSpanSet=(i===0 || big!==undefined);     //此刻必须设置bSpan;
        if(bSpanSet){
            let sumBsr=0,  sumBso=0;
            for(let c=i; c<mdl.sk?.length; c++) {
                const setb = mdl.sk?.[c];
                const {no, r: srows, big} = setb === 0 ? {no: undefined, r: 0, big: undefined} : setb;
                //只要设置big 就导致重新计算大标题
                if(big !== undefined &&  i !== c)
                    break;
                if(srows === 0){
                    sumBsr++;
                    sumBso++;
                }
                else {
                    const [a ,b]=srows;     //@须确保输入[,]是数字的！
                    if(b===undefined){
                        sumBsr++;
                        sumBso+= a;
                    }else if(a<=b){          //确保a===1? 前面的那些行都当作文字行。没有用作编辑，正式报告可定没有的； 1+1的情况？只能按照第一行是纯粹文字来做。
                        if(a !== 1)    throw new Error("头文字行>1");
                        sumBsr++;
                        sumBso+= b+a;
                    }
                    else{
                        if(b !== 1)    throw new Error("尾文字行>1");
                        sumBsr++;
                        sumBso+= a+b;
                    }
                }

            }
            sumBigr= sumBsr;
            sumBigo= sumBso;
        }
        //上面预处理span完成，下面：
        if(no){
            const [nosBn2, noTail2] = splitNosByLastDot(no);
            nosOffs=0;
            nosBn= nosBn2 as string;
            noTail= Number(noTail2);
        }
        let daimal='';
        let  preCod=noPr? `,pre:'${noPr}'` : '';      //小片段代码
        const title=mdl.items?.[i];
        const [a ,b]= varv===0? [0,0] : varv;
        if(varv === 0){         //普通项目的 直接配置sk[ ,0, ],无需要多嵌套一个{r:[]}。
            daimal=( bSpanSet? `crtOmni('${title}',{bspan:${sumBigr},seco:'${noPr??''}${iClass}${nosBn}.${noTail+nosOffs}', },{bspan:${sumBigo}, },`
                        : `crtOmni('${title}',{seco:'${noPr??''}${iClass}${nosBn}.${noTail+nosOffs}',},undefined,`
                )
                +`
            <Text>${mdl.descs?.[dscPos]}
            </Text>, {nos:'${nosBn}.${noTail+nosOffs}'${iclasCod}${preCod},},false,'${title}'),
            `;
            rows.push(daimal);
            dscPos++;
        }else if(b===undefined){
            if(a <= 1)    throw new Error("自拆分<=1");
            //没有纯文本行的自拆分；
            for(let x=0; x<a-1; x++){
                const headOut=(bSpanSet? `crtOmni('',{bspan:${sumBigr},seco:'${noPr??''}${iClass}${nosBn}.${noTail+nosOffs}',span:1},{bspan:${sumBigo},span:${a} },`
                        : `crtOmni('',{seco:'${noPr??''}${iClass}${nosBn}.${noTail+nosOffs}',span:1},{span:${a} },`
                );
                //除了第一行 有点特别的；
                daimal=(x===0? headOut
                            : `crtOmni('',{},undefined,`
                    )
                    +`
                <Text>${mdl.descs?.[dscPos]}
                </Text>, {nos:'${nosBn}.${noTail+nosOffs}(${x+1})'${iclasCod}${preCod},},true,),
                `;
                rows.push(daimal);
                dscPos++;
            }
            //最后一行：
            daimal=`crtOmni('',{ },undefined,
            <Text>${mdl.descs?.[dscPos]}
            </Text>, {nos:'${nosBn}.${noTail+nosOffs}(${a})'${iclasCod}${preCod},mergNos:'${nosBn}.${noTail+nosOffs}',mergName:'${mdl.items?.[i]}'},false,'${mdl.items?.[i]}'),
            `;
            rows.push(daimal);
            dscPos++;
        }
        else if(a<=b){       //最前一行是纯文本行  【不能解决！！】多个小区块组合的自拆分大区块的特例！[ 嵌套的[121,12,1] ]  只能手动或生成多个后再做拼凑;
            daimal=(bSpanSet? `crtOmni(undefined,{bspan:${sumBigr},seco:'${noPr??''}${iClass}${nosBn}.${noTail+nosOffs}',span:1},{bspan:${sumBigo},span:${a+b} },`
                        : `crtOmni(undefined,{seco:'${noPr??''}${iClass}${nosBn}.${noTail+nosOffs}',span:1},{span:${a+b} },`
                )
                +`
                <Text>${mdl.descs?.[dscPos]}
                </Text>, { },true,),
                `;
            rows.push(daimal);
            //扣掉第一行纯文本行，自拆分的剩下行：
            dscPos++;               //descs[]消费 推进
            for(let x=0; x<b; x++){         //更多的自拆分的小项目：除非是最后哪一行的。 x==b-1;
                if(x===b-1){
                    daimal=` crtOmni('',{},undefined,
                    <Text>${mdl.descs?.[dscPos]}
                    </Text>, {nos:'${nosBn}.${noTail+nosOffs}(${x+1})'${iclasCod}${preCod},mergNos:'${nosBn}.${noTail+nosOffs}',mergName:'${mdl.items?.[i]}'},false,'${mdl.items?.[i]}'),
                    `;
                    rows.push(daimal);
                }else{              //正常不是最后的哪一行的
                    daimal=` crtOmni('',{},undefined,
                    <Text>${mdl.descs?.[dscPos]}
                    </Text>, {nos:'${nosBn}.${noTail+nosOffs}(${x+1})'${iclasCod}${preCod},},true,),
                    `;
                    rows.push(daimal);
                }
                dscPos++;
            }
        }else{
            //自拆分的 多个行的； 尾巴是纯文本行； 但不是[1+1行]
            for(let x=0; x<a; x++){
                const headOut=(bSpanSet? `crtOmni('',{bspan:${sumBigr},seco:'${noPr??''}${iClass}${nosBn}.${noTail+nosOffs}',span:1},{bspan:${sumBigo},span:${a+b} },`
                        : `crtOmni('',{seco:'${noPr??''}${iClass}${nosBn}.${noTail+nosOffs}',span:1},{span:${a+b} },`
                );
                //除了第一行(需加上span和标题)；
                daimal=(x===0? headOut
                            : `crtOmni('',{},undefined,`
                    )
                    +`
                <Text>${mdl.descs?.[dscPos]}
                </Text>, {nos:'${nosBn}.${noTail+nosOffs}(${x+1})'${iclasCod}${preCod},},true,),
                `;
                rows.push(daimal);
                dscPos++;
            }
            //尾巴1行=纯文本行
            daimal=`crtOmni(undefined,{ },undefined,
            <Text>${mdl.descs?.[dscPos]}
            </Text>, {mergNos:'${nosBn}.${noTail+nosOffs}'${iclasCod}${preCod},mergName:'${mdl.items?.[i]}'},false,'${mdl.items?.[i]}'),
            `;
            rows.push(daimal);
            dscPos++;
        }
        nosOffs++;       //项目编号对于自拆分的一个大区块只能有一个，小行用(i++)
    });
    console.log("配置对象:", mdl);
    //【假定规则】一个items[]只能配置一整个自拆分大块的。自拆分大块在报告只能显示一个行的，正式报告是不能敞开显示自拆分细分项目的。
    return `pushOmni(ari,'${firstNo}',[
    
    ${rows.join('')}
    ],'${firstNo}${mdl.items?.[0]}-${nosBn}.${noTail+nosOffs-1}${mdl.items?.[mdl.sk?.length-1]}');`;
}
/**记录需要的xyz的编号把xy单独作为seco标题，需要分配span,报告不变同genNew2ColBigSpl；
 * 用 ses 申明原始记录插入的栏目跨越几行。 而big需手动加的。
 *【配置差异】参数"r":3不能用数组{自拆分>1}, 针对自拆分项加"s":1,=1前面文字行 =2后面 =3前后都有一行 =undefined没有纯文字行的。
 * 对于报告没有第二栏记录却有的情况：增加参数"ses":6 记录第二栏跨6行的{ses同时需配置no配合的}； 有 pr,no，big参数；
 * 报告自拆分项不展开的。 类似游乐设施报告。
 * 参考用例： amusement /waterDj ；       适应性也不算好：ses多数不需要加上的：正式报告省略第二栏目，原始记录最多3栏编号。
 * no会自动截取：如10.2，自拆分用参数"r"，普通项目0,0; 而ses是因为正式报告少了一个栏目如10.2但是原始记录需要10.2显示在本该出现的栏目位置，10.2的span行数就是ses；
 * 电梯新常态：记录是大标题+项目编码+主标题3栏目的，报告只有后面2栏目。
 * */
function genRec3ClRep2Cl(mdl: any) :string {
    let rows: string[]=[];
    let dscPos=0;         //记录的提取位置
    //【强制约定】项目编号对于自拆分的一个大区块只能有一个，小行用(i++)来体现的，且只出现在nos的生成中，不在seco:标题中显示。
    let  nosOffs=0;      //项目编码的偏移++
    const iClass=mdl.cl ?? '';        //项目类别符号。是针对一整个输出大块的。
    let  addiC= !(mdl.cl===mdl.dcl);      //需要添加iClass的配置吗。
    let  nosBn: string='',    noTail :number=0;
    let iclasCod=addiC? `,iclas:'${iClass}'` : '';     //小片段代码
    let firstNo: string='';            //给 tag 的编号
    //首先往前面查看sk[]： 确认big的分解，计算当前的bspan;  ?并不是每一次i：都要计算吧。
    let sumBigr=0,  sumBigo=0;
    let sesmapno='';
    mdl.sk?.forEach((setb:any, i:number)=>{
        const {no, r:drows,s:spltt, big, pr:noPr,ses} = setb===0? {no:undefined, r:0, big:undefined,pr:undefined,ses:undefined,s:undefined}: setb;
        if(!firstNo)   firstNo=no;    //最开始nos
        const bSpanSet=(i===0 || big!==undefined);     //此刻必须设置bSpan;
        if(bSpanSet){
            let sumBsr=0,  sumBso=0;
            for(let c=i; c<mdl.sk?.length; c++) {
                const setb = mdl.sk?.[c];
                const {no, r: srows,s:sptyp, big} = setb === 0 ? {no: undefined, r: 0, big: undefined,s:undefined} : setb;
                //只要设置big 就导致重新计算大标题
                if(big !== undefined &&  i !== c)
                    break;          //结束这个大标题管辖区域
                if(srows === 0){
                    sumBsr++;
                    sumBso++;
                }
                else {    //自拆分项 r>0
                    //大标题的bspan计算
                    sumBsr++;       //正式报告：自拆分项没有展开显示的
                    sumBso+= srows;
                    if(sptyp!==undefined && sptyp!==1 && sptyp!==2 && sptyp!==3){
                        throw new Error("自拆分项s>");
                    }
                }
                if(srows=== 1 || (sptyp===3 && srows<3) )     throw new Error("自拆分项错s");
                if(srows===0 && sptyp!== undefined)     throw new Error("非自拆分");
            }
            sumBigr= sumBsr;
            sumBigo= sumBso;
        }
        //上面预处理bspan完成，下面：
        if(no){
            const [nosBn2, noTail2] = splitNosByLastDot(no);
            nosOffs=0;
            nosBn= nosBn2 as string;
            noTail= Number(noTail2);
            if(ses!=undefined){          //ses +no配合的
                sesmapno=nosBn;      //三栏目的 nos前缀
            }else{
                if(nosBn!==sesmapno)
                    sesmapno='';        //清理掉，span不可接续
            }
        }
        let daimal='';
        let  preCod=noPr? `,pre:'${noPr}'` : '';      //小片段代码
        const title=mdl.items?.[i];
        const seclCod=`'${noPr??''}${iClass}${nosBn}.${noTail+nosOffs}'`;
        const s2T3=(no && ses)? `seco:'${sesmapno}',span:${ses},` : undefined;
        //普通项目就一条的，自拆分最少2行的{需要内嵌套展开生成的子过程}。【拆解】拼凑。
        const bsCodr=  bSpanSet? `bspan:${sumBigr},` : '';
        const bsCodo=  bSpanSet? `bspan:${sumBigo},` : undefined;

        if(drows === 0){         //0=普通项目的 直接配置sk[ ,0, ],无需要多嵌套一个{r:[]}。
            const orgsecR1=s2T3? `${s2T3??''} third:${seclCod},`
                                : sesmapno ? `seco:'', third:${seclCod},`
                                  :  ``;
            const orgCod= (s2T3===undefined && bsCodo===undefined && sesmapno==='')? 'undefined' : `{${bsCodo??''} ${orgsecR1}}`;
            daimal=`crtOmni('${title}',{${bsCodr??''}seco:${seclCod},},${orgCod},`
                +`
            <Text>${mdl.descs?.[dscPos]}
            </Text>, {nos:'${nosBn}.${noTail+nosOffs}'${iclasCod}${preCod},},false,'${title}'),
            `;
            rows.push(daimal);
            dscPos++;
        }else if(drows>=2){        //自拆分最少2行的； ##内嵌套展开生成的子过程
                for(let x=0; x<drows; x++){
                    const nameCod=((x===0 && (spltt===1 || spltt===3)) || (x===drows-1 && (spltt===2 || spltt===3)) )? 'undefined' : `''`;
                    const twolabl=`'${noPr??''}${iClass}${nosBn}.${noTail+nosOffs}'`;
                    //除了第一行 有点特别的；    undefined,{ seco:'※5.13.4',span:1},{seco:'', span:0,third:'※5.13.4vv', tspan:3,},
                    const orgsecR1=s2T3? `${s2T3??''} third:${twolabl},tspan:${drows},`
                                   : sesmapno ? `seco:'',span:0, third:${seclCod}, tspan:${drows},`
                                    :  `span:${drows},`;
                    //第一行的
                    const headOut=`crtOmni(${nameCod},{${bsCodr??''}seco:${twolabl},span:1},{${bsCodo??''} ${orgsecR1} },`;

                    const sidxnow=(spltt===1 || spltt===3)?  x : x+1;
                    const nosCod=((x===0 && (spltt===1 || spltt===3)) || (x===drows-1 && (spltt===2 || spltt===3)) )? ''
                                : `nos:'${nosBn}.${noTail+nosOffs}(${sidxnow})'${iclasCod}${preCod},`;
                    const logicSp=x===drows-1? 'false,' : 'true,';
                    //尾巴哪一行的
                    const tailMgc=x===drows-1? `mergNos:'${nosBn}.${noTail+nosOffs}'${iclasCod}${nosCod? '' : preCod},mergName:'${mdl.items?.[i]}',` : '';
                    const recapC=x===drows-1? `'${mdl.items?.[i]}',` : '';
                    //除了第一行 有点特别的；
                    daimal=(x===0? headOut
                                   : `crtOmni(${nameCod},{},undefined,`
                        )
                        +`
                    <Text>${mdl.descs?.[dscPos]}
                    </Text>, {${nosCod} ${tailMgc}},${logicSp} ${recapC}), 
                    `;

                    rows.push(daimal);
                    dscPos++;
                }
        }
        nosOffs++;       //项目编号对于自拆分的一个大区块只能有一个，小行用(i++)
    });
    console.log("配置对象:", mdl);
    //【假定规则】一个items[]只能配置一整个自拆分大块的。自拆分大块在报告只能显示一个行的，正式报告是不能敞开显示自拆分细分项目的。
    return `pushOmni(ari,'${firstNo}',[
    
    ${rows.join('')}
    ],'${firstNo}${mdl.items?.[0]}-${nosBn}.${noTail+nosOffs-1}${mdl.items?.[mdl.sk?.length-1]}');`;
}
function extractLeadingNumbers(str: string) {
    // 使用正则表达式匹配一个或两个开头的数字
    var match = str.match(/^\d{1,2}/);
    if (match && match[0]) {
        // 匹配成功，将匹配的字符串转换为数字
        return parseInt(match[0], 10); // 使用基数10确保解析为十进制数字
    } else {
        // 如果没有匹配到数字，返回NaN或者你想要的其他默认值
        return NaN; // 或者返回0，取决于你的需求
    }
}
//提取小项目的序号码
function extractLittleSeq(text: string): number|undefined {
    let texta = (text??'').trim();
    //（\(   1, 1. 1
    if(texta[0]==='（' || texta[0]==='('){
        texta=texta.slice(1).trim();
    }
    const seq=extractLeadingNumbers(texta);
    if(seq>0 && seq<100)     return seq;
    else return undefined;
}
/**更为普遍的； #需要数清楚span 正式报告和记录各自的跨越行数，每个栏目都要。
 * 【注意】项目区栏目数有变动的那一行必须注明即使只有单一行span的<td>，比如｛"ss":[1]}, ｛,"ts":[1]},非转折行的可以省略。
 * 参考用例  ..\tower\craneDj\orcIspConfig.tsx  生成测试集合：；     /bridge/erecting/Regular.O-1
 * no通常是普通项目++的； 而自拆分项目是提取的(n);
 * 但这里：没用到 big ses参数; 一个生成编辑区有项目区栏目数变动的还需要手动处置。
 * @报告自拆分项若需要显示小项目的需配"vx":1。否则拆分项在正式报告不显示； "vx":1 影响正式报告标题录入框的提取行数；若"vx":1生成代码name=''的，【注意】须先全部设置才能让正式报告布局正常。
 * { "mg":2, "dcl":"","cl":"",
 *          "sk":[ {"no":"3.7.3", "r":0,"bs":[5],"ss":[2]  },     0,
 *            { "no":"3.8.1","ss":[3],"ts":[0,3], "r":3, "s":9 }
 *          ]
 *     }
 * 参数 "r" ：普通项目=0; 自拆分项表示r个小项目行。
 * 配置{ "no":"3.11.1","ss":[2], "r":0 }实际第三栏目3.11.1和3.11.2两个格子。
 * 参数 "s" ：1 2 3 9 undefined；表示自拆分项的组合形式。1=开头文字行，2=尾巴文字行。3=两个都有的情况。=undefined=0是没有纯文字行的情形。9=变种#原本应该自拆分，改造成了普通项目，共用一个nos，用(1)(2)分解成多个小项目，每个小项目都有独立结论栏目。
 * 若【"s":9】情况的特例{ "no":"3.8.1","ss":[3],"ts":[0,3], "r":3, "s":9 }，正常项目都有最后单行的单一个格子。只有自拆分情形例外。3.8.1也例外变种的。
 * 非连续编号的{"no":"4.9.9","ts":[1],}必须再次设定no,span参数；最后一个格子span归属栏目也要表明:ts:[1]。
 * 4个span参数：在同一编辑域内，遇到栏目扩增的第一个行就需要配置全面即使末尾是[1]的取值的，例子如：{ ,"ss":[1] }, 0, {,"ss":[3],"ts":[1] }；
 * 【自拆分被改成了普通小项目】的做法：参看这个例子： principal/src/report/mobilecr/intialWt/orcIspConfig.tsx:236 的 3.11.3项目。
 * 参数：cts:1，标识【特例】普通项改自拆分项(开始行/有{}明细的继续行)：参数：Mno:'4.9.8'最后合并项目的项目编码同时这是代表自拆分的结束行=普通项改自拆分项(新方案);
 * */
function genCmnTowerCrane(mdl: any) :string {
    let rows: string[]=[];
    let dscPos=0;         //记录的提取位置
    let  nosOffs=0;      //项目编码的偏移++
    const iClass=mdl.cl ?? '';        //项目类别符号。是针对一整个输出大块的。
    let  addiC= !(mdl.cl===mdl.dcl);      //需要添加iClass的配置吗。
    let  nosBn: string='',    noTail :number=0;
    let iclasCod=addiC? `,iclas:'${iClass}'` : '';     //小片段代码
    let firstNo: string='';            //给 tag 的编号
    let titlIx=0;
    let legacy='';        //上一步 遗留的span牵绊栏目是哪一个。bs,ss,ts三个之一 legacy='s';
    let isPanth=false;       //【非常规的】项目编码：1.1(1)这样的。
    let inCts=false;
    mdl.sk?.forEach((setb:any, i:number)=>{
        const {no,r:drows,s:spltt,pr:noPr,bs,ss,ts,fs,vx:rpdispsx,cts,Mno} = setb===0?
            {no:undefined,r:0,pr:undefined,s:undefined,bs:undefined,ss:undefined,ts:undefined,fs:undefined,vx:undefined,cts:undefined,Mno:undefined}
            : setb;
        if(!firstNo)   firstNo=no;    //最开始nos
        if(!inCts && 1===cts)   inCts=true;
        if(undefined!==Mno)    inCts=false;     //最后一行项目来指示合并的自拆分项目的mergeNos，同时关闭cts继承性指引。
        let hasRecSeco=true;
        //上面预处理bspan完成，下面：
        if(no){
            const [nosBn2, noTail2,panth] = splitNosByLastDotPan(no);
            nosOffs=0;
            nosBn= nosBn2 as string;
            noTail= Number(noTail2);
            //非常规nos编码，后面跟随的1.2(1)   (??)编码串
            isPanth=panth as boolean;
        }
        let daimal='';
        let  preCod=noPr? `,pre:'${noPr}'` : '';      //小片段代码
        const lastnsCod=`'${noPr??''}${iClass}${nosBn}.${noTail+nosOffs}'`;
        let [brpo,brec]=bs??[];
        let [srpo,srec]=ss??[];
        let [trpo,trec]=ts??[];
        let [frpo,frec]=fs??[];
        const recnset=brec===undefined && srec===undefined && trec===undefined && frec===undefined;
        brec= brec===undefined? brpo: brec;
        srec= srec===undefined? srpo: srec;
        trec= trec===undefined? trpo: trec;
        frec= frec===undefined? frpo: frec;

        const bsCodr=  brpo? `bspan:${brpo},` : '';
        const ssCodr=  srpo? `span:${srpo},` : '';
        const tsCodr=  trpo? `tspan:${trpo},` : '';
        const fsCodr=  frpo? `fspan:${frpo},` : '';
        //记录的3组合片段
        const bsCodo=  brec? `bspan:${brec},` : undefined;
        const ssCodo=  srec? `span:${srec},` : undefined;
        const tsCodo=  trec>1? `tspan:${trec},` : undefined;
        const fsCodo=  frec>1? `fspan:${frec},` : undefined;
        let thirdEt='';
        if(srpo && !trpo){
            if(trpo===0 && trec)    thirdEt=`third:${lastnsCod},`;
        }
        if(trec || frec)   hasRecSeco=false;        //原始记录部分：第三或第四栏目有的，第二seco:就不用生成了。
        if(brec && !srec)   hasRecSeco=false;       //C5.0情形的；
        //原始记录的 span组合部分：big seco third, 但不考虑four fspan的可能性。
        const recCodI=hasRecSeco? `${bsCodo??''}seco:${lastnsCod},${ssCodo??''}${thirdEt??''}${tsCodo??''}${fsCodo??''}`
                        :  `${bsCodo??''}${ssCodo??''}${thirdEt??''}${tsCodo??''}${fsCodo??''}`;
        const orgCod= (recnset)? 'undefined' : `{${recCodI??''} }`;
        // let secoCd='';
        // let thirdCd='';
        // let fourCd='';
        //配置优先按照最多栏目的记录来做，随后人工修正。
        if(frec){
            legacy='f';
        }
        else if(trec){
            legacy='t';
        }
        else if(srec){
            // thirdCd=`third:${lastnsCod},`;
            // if(trpo===0 && trec)    thirdCd='';
            legacy='s';
        }else if(srec){
            legacy='b';
        }
        // const onlyt= trpo===undefined && srpo===undefined && brpo===undefined;
        if(drows === 0 || (spltt===9 && drows>=2)){
            //#不再考虑3.8.1的异常用法，需人工修正了！  (spltt===9 && drows>=2)类似这种特例；
            const rpmgs=legacy==='f'? `${bsCodr??''}${ssCodr??''}four:${lastnsCod},${tsCodr??''}`
                : legacy==='t'? `${bsCodr??''}${ssCodr??''}third:${lastnsCod},${tsCodr??''}`
                : legacy==='s'? `${bsCodr??''}${ssCodr??''}seco:${lastnsCod},${tsCodr??''}`
                : `${bsCodr??''}${ssCodr??''}big:${lastnsCod},${tsCodr??''}`;

            let xmseq=extractLittleSeq(mdl.descs?.[dscPos]) ?? 1;
            let nosTxx=(spltt===9 && drows>1)? `${noTail+nosOffs}(${xmseq})` : `${noTail+nosOffs}`;
            const title=mdl.items?.[titlIx++];
            //支持1.1(1)的项目编码情形： 但是只能针对非 自拆分的项目有效的。
            let nosPancp= isPanth? `${nosBn}(${nosTxx})` : `${nosBn}.${nosTxx}`;
            const mergNonm=(undefined!==Mno)? `mergNos:'${Mno}',mergName:'${title}',` : '';
            const nconcl=inCts? 'true':'false';         //普通项目模式可能改成cts自拆分项目
            daimal=`crtOmni('${title}',{${rpmgs}},${orgCod},`
                +`
            <Text>${mdl.descs?.[dscPos]}
            </Text>, {nos:'${nosPancp}'${iclasCod}${preCod},${mergNonm}},${nconcl},'${title}'),
            `;

            rows.push(daimal);
            dscPos++;
            if(drows>1){    //普通项目也特殊##内嵌套展开生成的子过程最后span对应的是多行的； 像自拆分转变过来，nos没有编码递增的。
                for(let x=1; x<drows; x++){
                    let xmseq=extractLittleSeq(mdl.descs?.[dscPos]) ?? (x+1);
                    const title=mdl.items?.[titlIx++];
                    daimal=`crtOmni('${title}',{},undefined,`
                        +`
                    <Text>${mdl.descs?.[dscPos]}
                    </Text>, {nos:'${nosBn}.${noTail+nosOffs}(${xmseq})'${iclasCod}${preCod},},false,'${title}'),
                    `;
                    rows.push(daimal);
                    dscPos++;
                }
            }
        }else if(drows>=2){        //自拆分最少2行的； ##内嵌套展开生成的子过程
            if(spltt===3 && drows<3)   throw new Error("需行>2");
            const rpmgs=legacy==='f'? `${bsCodr??''}${ssCodr??''}four:${lastnsCod},${tsCodr??''}`
                : legacy==='t'? `${bsCodr??''}${ssCodr??''}third:${lastnsCod},${tsCodr??''}`
                    : legacy==='s'? `${bsCodr??''}${ssCodr??''}seco:${lastnsCod},${tsCodr??''}`
                        : `${bsCodr??''}${ssCodr??''}big:${lastnsCod},${tsCodr??''}`;
            // const rpmgs=(srpo && !trpo) ? `${bsCodr??''}${ssCodr??''}seco:${lastnsCod},${tsCodr??''}`
            //     : (onlyt && legacy==='s')? `${bsCodr??''}${ssCodr??''}third:${lastnsCod},${tsCodr??''}`
            //     : `${bsCodr??''}seco:${lastnsCod},${ssCodr??''}${thirdCd??''}${tsCodr??''}`;
            for(let x=0; x<drows; x++){
                const nameCod=((x===0 && (spltt===1 || spltt===3)) || (x===drows-1 && (spltt===2 || spltt===3)) )? 'undefined' : `''`;
                const twolabl=`'${noPr??''}${iClass}${nosBn}.${noTail+nosOffs}'`;
                //除了第一行 有点特别的；  undefined,{ seco:'※5.13.4',span:1},{seco:'', span:0,third:'※5.13.4vv', tspan:3,},
                //第一行的
                const headOut=`crtOmni(${nameCod},{${rpmgs}},${orgCod},`;
                const sidxnow=(spltt===1 || spltt===3)?  x : x+1;
                const nosCod=((x===0 && (spltt===1 || spltt===3)) || (x===drows-1 && (spltt===2 || spltt===3)) )? ''
                    : `nos:'${nosBn}.${noTail+nosOffs}(${sidxnow})'${iclasCod}${preCod},`;
                const logicSp=x===drows-1? 'false,' : 'true,';
                //尾巴哪一行的
                let tailMgc='';
                let recapC='';      //正式报告标题
                if(rpdispsx){
                    //自拆分要展开显示的情况：mergName=挪用可显示最后的一个报告标题内容
                    const mergNCod=(x===drows-1 && (spltt===2 || spltt===3) )? `${mdl.items?.[titlIx-1]}`
                        : (x===drows-1 && (spltt!==2 && spltt!==3 && spltt!==9) )? `${mdl.items?.[titlIx]}`
                        : `''`;
                    //正式报告的标题
                    if(x===0 && (spltt===1 || spltt===3))   recapC='';
                    else if(x===drows-1 && (spltt===2 || spltt===3))   recapC='';
                    else{
                        const readTc=mdl.items?.[titlIx++];
                        recapC= `'${readTc}',`;
                    }
                    tailMgc=x===drows-1? `mergNos:'${nosBn}.${noTail+nosOffs}'${iclasCod}${nosCod? '' : preCod},mergName:'${mergNCod}',` : '';
                }
                else{     //不显示出自拆分的小项目
                    const readTc=mdl.items?.[titlIx++];
                    recapC= x===drows-1? `'${readTc}',` : '';
                    tailMgc=x===drows-1? `mergNos:'${nosBn}.${noTail+nosOffs}'${iclasCod}${nosCod? '' : preCod},mergName:'${readTc}',` : '';
                }
                //除了第一行 有点特别的；
                daimal=(x===0? headOut
                            : `crtOmni(${nameCod},{},undefined,`
                    )
                    +`
                    <Text>${mdl.descs?.[dscPos]}
                    </Text>, {${nosCod} ${tailMgc}},${logicSp} ${recapC}), 
                    `;

                rows.push(daimal);
                dscPos++;
            }
        }
        nosOffs++;       //项目编号对于自拆分的一个大区块只能有一个，小行用(i++)
    });
    console.log("配置对象:", mdl);
    //【假定规则】一个items[]只能配置一整个自拆分大块的。自拆分大块在报告只能显示一个行的，正式报告是不能敞开显示自拆分细分项目的。
    return `pushOmni(ari,'${firstNo}',[
    
    ${rows.join('')}
    ],'${firstNo}${mdl.items?.[0]}-${nosBn}.${noTail+nosOffs-1}${mdl.items?.[mdl.items?.length-1]}');`;
}
