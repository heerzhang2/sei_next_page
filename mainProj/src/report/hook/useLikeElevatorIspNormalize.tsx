/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    CCell, Cell, TableRow,
} from "customize-easy-ui-component";
import {DirectLink} from "../../routing/Link";

//通用的格式显示。 电梯的；x.y下标 较为统一的检验 对报告项目布局。
/**@Deprecated
 * 电梯定检 可使用的； 正式报告的项目列表输出； Similar to elevator inspection
 * @param inspectionContent: 配置项目表；
 * @param itRes: 正式报告在最后面的两个列的数据 结果;
 * */
export const useLikeElevatorIspNormalize= ({itRes, inspectionContent, model,ver, repNo}
         :{itRes:any, inspectionContent:any[], model:string,ver:string, repNo:string}
) => {
    const renderIspContent =React.useMemo(() => {
        let seq = 0;
        let htmlTxts =[] as React.ReactNode[];
        inspectionContent.forEach((rowBigItem, x) => {
            //if(x>0)  return;测试：  每一个大项目 LOOP：
            let bigItemRowCnt=0;
            rowBigItem && rowBigItem.items.forEach((item:any, y:number) => {
                if(item){
                    //每一个 项目LOOP：允许iSplitLine:{'0': 3, '3': 3},来拆分成了几个准项目区域，避免某个项目太多子项目了导致不能拆分的打印空白太大了，但是若允许拆分的不做准项目处理的话原先的效果也不很好看啊。
                    seq += 1;
                    let itemXY = `${x + 1}.${y + 1}`;
                    let bigLineCnt=rowBigItem.splitLine[bigItemRowCnt];     //大项目上的拆分标记被命中了吗？
                    let maxAreaHeight=rowBigItem.splitHeight?.[bigItemRowCnt];
                    ///iSplitLine:[3],          【问题】若准项目被拆分的对应的某一行seq:必然要求大项目也需要在这一个seq做拆分！ 配置不一致性？
                    let quasiSeq=[0, ...(item.iSplitLine || [])];
                    let subCnt =item.subItems?.length || 1;     //最少也是一条的 分项目合计行数。
                    let hasSubCol=item.subItems?.length>=1;      //有分项目列的 ,有仅仅一行但是两列的特别情况可能的。
                    // let subIndex=0;         //分项目的索引序号
                    quasiSeq.forEach((quseq:any, u:number) => {
                        if(quseq>subCnt)    throw new Error("准项目拆分索引超出");
                        let  cntThisRows= subCnt-quseq;
                        if(quasiSeq[u+1])
                            cntThisRows= quasiSeq[u+1]-quseq;       //准项目区域计划几行的。
                        // let iRowSpan =subCnt? subCnt : 1;
                        //【细微差】导致无法点击链接的：下面这行<TableRow>不可嵌套外标签：<></>；<React.Fragment></React.Fragment>都会导致更上一级组件位置的<DirectLink href失效。
                        const rowHead =<TableRow>
                            <CCell rowSpan={cntThisRows}>{seq}</CCell>
                            <CCell rowSpan={cntThisRows}>{item.iClass}</CCell>
                            {
                                //大标题这一列特别：并不是绝对地跟随项目断开的。可能跨度上跨过几个项目区域地。【恼火啊】 bigLineCnt=大项目序数 被选中了跨越几行的;
                                bigLineCnt && <CCell  split  rowSpan={bigLineCnt}>
                                    <div css={{
                                        "@media print": {
                                            overflow: 'hidden',           //控制文本显示 只能多加一层的DIV;
                                            maxHeight: maxAreaHeight? `${maxAreaHeight}rem`: undefined,
                                        }
                                    }}>{x+1}<br/>{rowBigItem.bigLabel}</div>
                                </CCell>
                            }
                            <CCell rowSpan={cntThisRows}>{item.itemTag}{item.itemTag&&<br/>}{itemXY}</CCell>
                            { hasSubCol?  ( <React.Fragment>
                                    <CCell rowSpan={cntThisRows}>{item.label}</CCell>
                                    <Cell>{item.subItems[quseq]}</Cell>
                                </React.Fragment> )
                                :
                                <Cell colSpan={2}>{item.label}</Cell>
                            }
                            <CCell>{itRes[itemXY][quseq]}</CCell>
                            <CCell rowSpan={cntThisRows}>{itRes[itemXY].result}</CCell>
                        </TableRow>;

                        // htmlTxts.push(rowHead);  【区块项目 第一行】
                        bigItemRowCnt++;
                        let subNodes =[] as React.ReactNode[];
                        //项目区块：剩下的其它行(除了前面已经render的 首部一个分项目的);
                        for(let i=0; i<cntThisRows-1; i++){
                            let bigLineCnt=rowBigItem.splitLine[bigItemRowCnt];     //本大项目范围底下的基数起算的顺序序号对应的分拆指引：说出后面会紧跟着几行。
                            if(bigLineCnt)  throw new Error("不能从中间断开准项目块"); //原先支持的 可以支持不在 某项目开始位置：也就是分项目位置中间的非第一个分项也允许把大标题列进行断开处理的能力！现在不支持！
                            const rowSub =<TableRow key={`${itemXY}-${i+1+quseq}`}>
                                {/*              {     //原先支持的 可以支持不在 某项目开始位置：也就是分项目位置中间的非第一个分项也允许把大标题列进行断开处理的能力！现在不支持！
                                  bigLineCnt && <CCell rowSpan={bigLineCnt} css={{
                                  }}>{`${x+1}`}<br/>{`${rowBigItem.bigLabel}`}</CCell>
                                  }*/}
                                <Cell>{item.subItems[i+1+quseq]}</Cell>
                                <CCell>{itRes[itemXY][i+1+quseq]}</CCell>
                            </TableRow>;
                            //【区块项目 更多的子项目那些的 行】
                            subNodes.push(rowSub);
                            bigItemRowCnt++;         //某一行主项目 对标 label：
                        }
                        const rowsBigArea= <DirectLink key={`${seq}-${quseq}`}  href={`/report/${model}/ver/${ver}/${repNo}/${itemXY}`}>
                            {rowHead}
                            {subNodes}
                        </DirectLink>;
                        htmlTxts.push(rowsBigArea);    //原先在htmlTxts.push(rowHead);bigItemRowCnt++;前面就处理的
                    });
                }
            });
        });
        return  htmlTxts;
    }, [itRes,repNo,model,ver,inspectionContent]);
    return { renderIspContent };
};



/*const useValues = () => {
  const [values, setValues] = React.useState({  });
  const itBinds=useProjectListAs({count: 8});
  const updateData = React.useCallback(
    (nextData) => {    },    [values]);
  return [values, updateData, itBinds];
};
*/