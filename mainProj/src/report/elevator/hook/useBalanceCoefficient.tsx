/** @jsxImportSource @emotion/react */
import * as React from "react";
import Plot from 'react-plotly.js';
import {useMeasure} from "customize-easy-ui-component/esm/Hooks/use-measure";
import {RefObject} from "react";

/**电梯平衡系数 绘制
 * */
interface Props {
    type: string;      //Y坐标针对的测量参数 单位='A'电流的， 'V'=电压的， 其余=空的；
    yu?: number[];     //上行实测的 坐标 按照[30, 40, 45, 50, 60]排序数组,
    yd?: number[];     //下行实测的 坐标 按照[30, 40, 45, 50, 60]排序数组,
    xp?: number[];    //X坐标 额定载重量百分比 默认都该是= [30, 40, 45, 50, 60],
}
//格式化版原始记录（非原生版原始记录）的页面的通用的格式显示。 电梯的；x.y下标 较为统一的检验 对报告项目布局。
/**平衡系数制图
 * */
export const useBalanceCoefficient= ({type, yu, yd, xp=[30, 40, 45, 50, 60] }
         :Props
) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const rect = useMeasure(ref as RefObject<HTMLElement>);
    const recHeight= rect?.height || 0;           //把标尺拉高看清楚
    // console.log("useBalanceCoefficient触发！yu=[]",type,yu,"yd",yd);
    const renderMap =<div ref={ref}  css={{"@media print": {pageBreakInside: 'avoid'} }}>
        <Plot
            data={[
                {
                    type:'scatter',
                    x: xp,
                    y: yu,
                    name:'上行',
                    line: {
                        color: 'rgb(19, 64, 282)',
                        width: 3,
                        shape: 'spline'
                    },
                    mode: 'lines+markers',
                    marker: {color: 'black'},
                },
                {
                    type:'scatter',
                    x: xp,
                    y: yd,
                    mode: 'lines+markers',
                    name:'下行',
                    line: {
                        color: 'rgb(219, 64, 82)',
                        width: 3,
                        shape: 'spline'
                    },
                    marker: {color: 'black'},
                },
            ]}
            layout={{  title: '电梯平衡系数',
                yaxis: {
                     title: type==='A'? '电流（A）' : type==='V'? '电压（V）' : '数据不全啊'
                },
                xaxis: {
                    title: '额定载重量百分比',
                    ticks: 'inside',
                    nticks: 34,
                    ticklen: (recHeight>300? recHeight-130 : 400)
                },
                autosize: true,
            }}
            useResizeHandler={true}
            config={{
                responsive: false,
                autosizable: true
            }}
            style= {{
                display: 'flex',
                alignItems: 'center',
                width: "100%"
            }}
        />
    </div>;
    return { renderMap };
};

/**平衡系数实际[] 预处理
 * */
export const useBalanceCoefficientPrepare= ({table, config=[30, 40, 45, 50, 60] }
                                         :{table:any[], config:number[]}
) => {
    //制图所需数据的转换： n:[30, 40, 45, 50, 60]排序； A:{s x} V:{u d}
    let yu: number[]=[];
    let yd: number[]=[];
    let ytype='';
    //【前提条件】inp?.平衡表的存储DB后 顺序不能改掉的：必须[30,40,45,50,60]对应顺序的。
    table?.forEach((clObj:any, i:number)=> {
        if(clObj?.n!==undefined && clObj?.n!==config[i])    throw new Error("顺序30,40,45,50,60不能改");
        yu[i]=clObj?.s;
        yd[i]=clObj?.x;
    });
    let start=undefined;
    let end=undefined;
    let valCount=0;     //最少也要3组数据
    const maxSize=config.length;
    for(let i=0;i<maxSize;i++){
        if(yu[i]!==undefined && yd[i]!==undefined){
            valCount++;
            if(start===undefined)   start=i;
            else  end=i;
        }
    }
    //电流优先；只要>=3个全非空上下的就用。    （yu.some(a=> !a) || yd.some(a=> !a)）
    if(valCount<3)
    {
        start=undefined;
        end=undefined;
        valCount=0;
        table?.forEach((clObj:any, i:number)=> {
            if(clObj?.n!==undefined && clObj?.n!==config[i])    throw new Error("顺序30,40,45,50,60不能改");
            yu[i]=clObj?.u;
            yd[i]=clObj?.d;
        });
        for(let i=0;i<maxSize;i++){
            if(yu[i]!==undefined && yd[i]!==undefined){
                valCount++;
                if(start===undefined)   start=i;
                else  end=i;
            }
        }
        if(valCount>=3)  ytype='V';
    }
    else ytype='A';
    // console.log("useBalanceCoefficient触发！yu=[]",type,yu,"yd",yd);
    if(ytype==='')   return {ytype };
    const xpConfig=config.slice(start,end!+1);
    const yu2=yu.slice(start,end!+1);
    const yd2=yd.slice(start,end!+1);
    return {ytype, yu: yu2 ,yd: yd2, xpConfig};
};

/*
基于MATLAB的电梯平衡系数的绘制 https://www.docin.com/p-2705295549.html  Excel趋势线，选择多项式 用多项式来拟合曲线；高次方程根据点子拟合 polyfit 多项式曲线拟合https://ww2.mathworks.cn/help/matlab/ref/polyfit.html?action=changecountry&s_tid=gn_loc_drop
https://wt911122.github.io/JChart/demo/dist/index.html  //https://github.com/wt911122/JChart VUE?
平衡系数图 临时用上传的，可改成自动在前端画图或第三方服务来画图的。
平衡系数 拟合曲线 elevator curve fitting Fit bezierCurves Bezier npm包polynomial-curve-fitting  @satachito/curve_fit  bezier-js bezier-easing
Curve fitting  canvas  电梯平衡系数 电压法没法用因为V变动太小;
cubic-beziers-through-points  点[]
react-draw-polygons 只能闭合线段
p5bezier 》hair-main例子 'matter-js；；  https://www.npmjs.com/package/p5bezier?activeTab=readme
pikaso-react-hook 画图api  https://github.com/pikasojs/pikaso 画图Pikaso-： 没有拟合的。
https://github.com/alexscheitlin/polynomial-curve-fitting  多项式曲线 @material-ui/core报错的；d3 canvas;
https://github.com/mljs/levenberg-marquardt   https://mljs.github.io/spectra-fitting/     https://people.duke.edu/~hpgavin/ExperimentalSystems/lm.pdf
ml-spectra-fitting 有三种拟合曲线？可只有x y 偏差  ml-gsd；；
Matlab拟合高斯曲线 plot绘制 plt.plot(x, y, 'b+:', label='data')  https://www.yxzhi.cn/post/4640.html
分离：https://github.com/davidctj/react-plotlyjs-ts   react-plotlyjs-ts 点线画图；     "react-plotlyjs-ts": "^2.2.2",
plotly.js-dist 中文介绍https://blog.csdn.net/weixin_43281875/article/details/121042734 折线图     https://plotly.com/javascript/
https://devpress.csdn.net/bigdata/62f4bd28c6770329307f9efa.html
react-plotly.js plotly.js  版本react-plotly.js？https://github.com/plotly/react-plotly.js#readme 太久远  http://react-plotly.js-demo.getforge.io/  加simple-statistics
基本 https://www.moonapi.com/news/93.html
Plotly (基于 D3) D3（Data Driven Documents）图形绘制库
感觉靠谱的 https://www.npmjs.com/package/react-plotly.js   没用了"plotly.js-dist": "^2.27.1",
配置 if `shape` is set to "spline" Sets the amount of smoothing. " 折线图规定trace的type属性为‘scatter’。 "spline"(平滑曲线)
+配合了 高斯拟合 https://blog.csdn.net/weixin_30284125/article/details/113330314   Scatter：坐标分布图，包括散点图和线形图
自适应 https://www.soinside.com/question/C6fpA97JuqXMfh4v9S8kF5
*/
