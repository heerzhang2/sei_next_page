let insertIdx=0;
let htmlNodes=[];          //考虑？肢解开：  key取值 报错
//往前探查方向，是否存在外部溢出元素？把上面的preNodeObj转换进入lcNodesNow
let lcNodesNow=[];
for(; insertIdx<preNodeObj.length; insertIdx++){
    for(; insertIdx<preNodeObj.length; insertIdx++){
        const {lcNode,}=preNodeObj[insertIdx];
        let modifyNode={...lcNode};
        Object.assign(modifyNode,{ key: 'L'+insertIdx });
        lcNodesNow.push(modifyNode);
    }
    //拆分段落模式：【假定】outNode必然在前面的，而lcNode只能位于底下顺序接着的。
    if(lcNodesNow.length>=1){
        const lcHtml=<React.Fragment key={i+'_'+insertIdx}>
            <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-4">
                { lcNodesNow }
            </div>
        </React.Fragment>;
        htmlNodes.push(lcHtml);     //分块分区显示
        lcNodesNow=[];         //局部
    }
    if(insertIdx<preNodeObj.length){
        if(preNodeObj[insertIdx]?.lcNode){
            let modifyNode={...(preNodeObj[insertIdx]?.lcNode)};
            Object.assign(modifyNode,{ key: 'Y'+insertIdx });
            lcNodesNow.push(modifyNode);               //给下一个区域去：被插入outNode了情形。
        }
    }
}
//残留的一部分：
if(lcNodesNow.length>=1){
    const lcHtml=<React.Fragment key={i+'T'}>
        <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-4">
            { lcNodesNow }
        </div>
    </React.Fragment>;
    htmlNodes.push(lcHtml);
}
//单一个序号的多个小行结束：一个序号对应多个内部小行的，多行就是多个 x: item多个的,可序号都是同一个的。htmlNodes对应同一序号全部几行
//隐藏的判定结论行是可能对应多个序号区域的。
return <div key={i} >
    {htmlNodes}
</div>;