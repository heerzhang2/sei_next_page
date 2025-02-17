/** @jsxImportSource @emotion/react */
import * as React from "react";
import {AttentionPoint} from "../common/rarelyVary";

export const 注意事项Mbcr= ( {comply, rep} :{comply: any, rep: any}
) => {
  //中间组件只带了第一行的内容 1．本报告{comply}。<br/>  参数telurl：是否显示报检方式；最后一行跟随的！
  return <AttentionPoint rep={rep} comply={comply} telurl >
    2．本报告应当由计算机打印输出，或者用钢笔、签字笔填写，字迹应当工整，修改无效。<br/>
    3．本报告无检验、编制、审核、批准人员签字和检验机构的核准证号、检验专用章或者公章无效。<br/>
    4．本报告一式二份，由检验机构和使用单位分别保存。<br/>
    5．本报告对检验时的设备状况负责。<br/>
    6．
  </AttentionPoint>;
};

