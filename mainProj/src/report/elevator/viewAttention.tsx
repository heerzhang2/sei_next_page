/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Cell, Table, TableBody, TableRow, Text, TableHead, useTheme, RCell,
} from "customize-easy-ui-component";
import {eqpTypeAllMap} from "../../dict/eqpComm";
import {AttentionPoint} from "../common/rarelyVary";

export const 注意事项Elevjj= ( {comply, rep} :{comply: any, rep: any}
) => {
  //中间组件只带了第一行的内容 1．本报告{comply}。<br/>  参数telurl：是否显示报检方式
  return <AttentionPoint rep={rep} comply={comply} telurl >
    2. 本报告应当由计算机打印输出，或者用钢笔、签字笔填写，字迹应当工整， 修改无效。<br/>
    3. 本报告无检验、编制、审核、批准人员签字和检验机构的核准证号、检验专 用章或者公章无效。<br/>
    4. 本报告一式三份，由检验机构、施工单位和使用单位分别保存。<br/>
    5. 受检单位对本报告结论如有异议，请在收到报告书之日起15日内，向检验机 构提出书面意见。<br/>
    6. 根据《中华人民共和国特种设备安全法》，使用单位应于下次检验日期届满 前1个月向检验机构提出定期检验申请。<br/>
    7. 有关检测数据未经允许，施工、使用单位不得擅自向社会发布信息。
  </AttentionPoint>;
};

