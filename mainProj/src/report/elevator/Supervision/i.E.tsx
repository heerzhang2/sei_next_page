/** @jsxImportSource @emotion/react */
import * as React from "react";
import { OriginalView } from "./Superv.O-1";
import {ReportView} from "./Superv.R-1";

/** 参照旧系统模板的版本编号：见附加的文档；300010
 * */
export  const  reportTemplate={
  "1": <ReportView source={null} verId={'1'}/>,
};

export  const  originalTemplate={
  "1": <OriginalView inp={null} action='none' verId={'1'}/>,
};


/*
平衡系数图 临时用上传的，可改成自动在前端画图或第三方服务来画图的。
平衡系数 拟合曲线 elevator curve fitting Fit bezierCurves Bezier npm包polynomial-curve-fitting  @satachito/curve_fit  bezier-js bezier-easing
* */
