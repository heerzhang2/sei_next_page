"use client"
import * as React from "react";
import {useRef} from "react";

//"throttle-asynchronous": "^1.1.1",
//防抖功能，参考看了 "@rooks/use-throttle":"^3.6.0",
//防止频繁去按 按钮！3000毫秒。　　fn　参数书写时不要加()的。
export function useThrottle(fn: Function, timeout: number = 3000) {
  //要把按钮使能开关ready一起做上。
  const [ready, setReady] = React.useState(true);
  const timerRef = React.useRef(null as any);
  //参数args ...还需类型
  const doFunc = React.useCallback(
       (...args: any)  => {
      if(ready) {
        setReady(false);
        fn(...args);
      }
    },
    [ready, fn]
  );

  React.useEffect(() => {
    if (!ready) {
      timerRef.current = setTimeout(() => {
        setReady(true);
      }, timeout);
      //重要的，否则经常报错Can't perform a React state update on an unmounted。卸载了必须清理回调任务。
      return () => clearTimeout(timerRef.current);
    }
  }, [ready, timeout]);
  if (!fn || typeof fn !== "function")
          return {doFunc: void 0, ready};
  ///return [ready, throttledFn]; 数组的版本编译器容易报错！改成返回对象的搞。
  return {doFunc, ready};
}
/**返回上一次取值, 本次的render是否发生了变更了？ query是依赖项。
 * 【注意】不能轻易使用！ 副作用震荡，反而引起来回2次触发。  不要用副租用代替正常按钮触发函数。
 * */
export function useChangeValue(query: unknown) {
  const queryRef =useRef(null);
  let  lastValue= queryRef.current;
  React.useEffect(() => {
      queryRef.current = query as any;
  }, [query]);

  return [lastValue, lastValue!==query];
}

