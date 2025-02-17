/** @jsxImportSource @emotion/react */
import * as React from "react";
// import {useMeasure} from "customize-easy-ui-component/esm/Hooks/use-measure";
import useResizeObserver from '@react-hook/resize-observer';
import {CellRefComp} from "customize-easy-ui-component";

/**3:表头 最上角的反斜杠：
 * 毛病：打印纸张的若跨页后却无法重复显示的？ 打印分页可行的？
 * 【打印遇到问题】 必须滚动到页面的起始位置后点击打印预览。 不是初始位置的打印可能打印每一页偏移丢失一小部分。但是本组件屏蔽也会出现该问题。
 * */
const TableHeaderSlash = () => {
  const canvasRef = React.useRef(null);
  const boundary = React.useRef<HTMLDivElement>(null);
  useResizeObserver(boundary, (entry) => {
    const canvas = canvasRef.current! as any;
    const {width, height} = entry.contentRect;
    canvas.width = width ;
    //避免循环地不断长高？ height *0.80;？  .contentRect{}会被下面的drawSlash()负反馈到。
    //【有毛病】高度从大切换小的会重绘很多次的慢慢减少的; @react-spring ?
    canvas.height = height *0.80;
    drawSlash(canvas);
  });

  const drawSlash = (canvas: { getContext: (arg0: string) => any; width: number; height: number; }) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除之前的绘制
    ctx.fillStyle = 'white'; // 设置背景色
    ctx.fillRect(0, 0, canvas.width, canvas.height); // 绘制背景

    // 绘制反斜杠
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2; // 你可以根据需要调整线宽
    ctx.stroke();

    // 绘制文本（可选）
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';
    ctx.fillText('', canvas.width / 2, canvas.height / 2);
  };
 //【因为】CCell不支持ref传递; 暂且手动改； 没法直接用<CCell><TableHeaderSlash/></CCell>
  return (
      <CellRefComp ref={boundary! as any}>
        <div style={{width: '100%', height: '100%', position: 'relative', overflow: 'hidden',}}>
          <canvas ref={canvasRef} style={{overflow: 'hidden'}}/>
        </div>
      </CellRefComp>
    );
};

export default TableHeaderSlash;

/*1:用 linear-gradient 创建一个非45度对角线： 但是只能用于屏幕，打印的就不行了！
<td  css={{S height: 'inherit', overflow: 'hidden', position: 'relative', border: "1px solid", }}>
        <div css={{
                position: 'relative',
                width: '100%',
                height: '100%',
                backgroundColor: '#f0f0f0',
                backgroundImage: 'linear-gradient(to right top, transparent 46%, black 18%, black 50%, transparent 21%)',
            }}>
    </div>
</td>
* */

/*2:用 SVG 创建非45度对角线; 无法预判td适当的高度
      <td  css={{
        height: 'inherit',  #但，导致打印分页问题！！
        overflow: 'hidden',
        position: 'relative',
        border: "1px solid",
      }}>
        <svg width="100%" height="100%">
          <line x1="0" y1="0" x2="100%" y2="100%" stroke="black" stroke-width="2"/>
        </svg>
      </td>
* */
