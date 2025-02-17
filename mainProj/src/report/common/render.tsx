/** @jsxImportSource @emotion/react */
import * as React from "react";
import {eqpTypeAllMap} from "../../dict/eqpComm";
import {businessCatspMap} from "../../agreement/AgreementList";
import {Input, InputLine, Text} from "customize-easy-ui-component";
import {MemoDatesInput} from "../../comp/base";

//常用 特殊的转换：

export const render设备品种 = {
    view: (orc: any) => <>{eqpTypeAllMap.get(orc?.设备品种)}</>,
};
export const render设备类别 = {
    view: (orc: any) => <>{eqpTypeAllMap.get(orc?.设备类别)}</>,
};
export const render子设备型 = {
    view: (orc: any) => <>{eqpTypeAllMap.get(orc?.子设备品种)}</>,
};

//在报告录入的3个单位；
export const render施工单位 = {
    view: (orc: any) =>{
        const 施工单位= '重大修理'===orc.检验类别? orc.大修单 :
                '改造监检'===orc.检验类别? orc.改造单 :
                    orc.安装单;
        return <>{施工单位}</>
    },
};

export const render施工类别={
  view:(orc:any, _p:any, rep:any)=>{
    return <>{businessCatspMap.get(rep?.isp?.bsType!)}</>
  },
};

export const render容类别 = {
    view: (orc: any) => {
        return <>{eqpTypeAllMap.get(orc.设备品种)}</>
    },
};
//后端给的是Boolean类型，转换给 报告显示：
export const renderBool有=(name: string)=>{
    return{
        view: (orc: any) => {
            return <>{orc?.[name] ? '有':'无' }</>
        }
    }
};
//高阶函数
export const input日期=(name:string,desc:string)=>{
    return {
        edit:(inp:any,setInp:(a:any)=>void,orc:any)=>{
            return <InputLine  label={desc}>
                        <MemoDatesInput value={inp?.[name] ||''}  rows={inp?.[name]?.length>22? 2:1}
                                    onChange={v => setInp({...inp, [name]: v || undefined}) } />
                </InputLine>;
        },
    };
};
export const render检验时间 = {
    view: (orc: any) =>{
        return <>{orc?.检验日期1} 至 {orc?.检验日期}</>
    },
};
export const render层站门数={
  view:(orc:any)=><>{orc.电梯层数}  层   {orc.电梯站数}  站  {orc.电梯门数} 门</>,
};
