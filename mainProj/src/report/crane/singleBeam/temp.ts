/**[暂时保留测试入口] 仅给测试使用的代码
 */
const mostReptype={
    0: {1: "300011", 2: "109800"},
    1: {1: "700003", 2: "33710"},
};
function* entries(obj :any) {
    for (let key of Object.keys(obj)) {
        yield [key, obj[key]];
    }
}
export const alltpyeofRep=[] as any;
for (let [key, value] of entries(mostReptype)) {
    let matched=0;      //配对等级 程度好的
    const type= value?.[1];
    alltpyeofRep.push(type as string);
    console.log("被最多用的报告模板 key",key,"type",type);
}
