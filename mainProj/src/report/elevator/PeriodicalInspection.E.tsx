/** @jsxImportSource @emotion/react */
import { ReportView } from "./PeriodicalInspection.R-1";
import { OriginalView } from "./PeriodicalInspection.O-1";
//到这里　才真正接入最终的模板tsx文件。
//模板的动态加载入口文件。再一次做个 订制的路由。
//版本号verId  "1" "2" "顺序数字"
/**有些显示内容是根据配置或数据库相关字段来定做的，有些内容修改后不一定就必须变更升级版本号的；
 * 新版本号启动必要性？ 实际ReportView可以照verId逻辑区分来做。可以选择新定义新名字组件，都能支持。
 * verId不是动态从URL注入的：？而是模板配置文件自己获得的。前面的"2":才是路由器的URL注入版本号, 可一一对上。
 * REP_MODULE_COD : "3B002C1038"
 */
export  const  reportTemplate={
  "1": <ReportView source={null} verId={'1'}/>,
  "2": <ReportView source={null} verId={'2'}/>,
};

/** "REP_TYPE":"300011", "LOG_MODULE_COD":"3B001C1053",
 * */
//2大类用途的模板定义实例；这2个输出名字不能改。
//这里算模板的关键注入点：<OriginalView 实际相当于DOM实例的。每个报告类型＋版本号,实际引入的组件都不同；
export  const  originalTemplate={
  "1": <OriginalView inp={null} action='none' verId={'1'}/>,
  "2":  null,
};


//REP_TYPE":"300011" LOG_MODULE_COD "30001C1002" REP_MODULE_COD "30002C1001"
