/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, Input, InputLine, SuffixInput, Text,} from "customize-easy-ui-component";
import {arraySetInp, calcAverageArrObj} from "../../../common/tool";

/*较通用的，同一个规范共享的
* */
export const cbK2_4 = {
  edit: (inp: any, setInp: (a: any) => void) => {
    return [false, <div><Text>K2.4抽查的结构件为：</Text>
      <InputLine label='抽查'>
        <Input value={inp?.抽查构件 || ''}
               onChange={e => setInp({...inp, 抽查构件: e.currentTarget.value || undefined})}/>
      </InputLine>
    </div>]
  },
  names: ['抽查构件'],
};
export const cbK3_55 = {
  edit: (inp: any, setInp: (a: any) => void) => {
    const avsDiam = calcAverageArrObj(inp?.磨损径, (row) => row, 1, 4);
    return [true, <div css={{textAlign: 'center'}}><Text>磨损钢丝绳直径测量4个：</Text>
      {['一', '二', '三', '四'].map((cap: any, c: number) => <Text key={c} css={{display: 'ruby'}}>{cap}处测=
            <Input value={inp?.磨损径?.[c] || ''} style={{display: 'inline-flex', width: '5rem'}}
                   onChange={e => arraySetInp('磨损径', c, e.currentTarget.value, inp, setInp)}/>mm；
          </Text>
      )}
      <Text css={{display: 'ruby'}}>测量结果：{avsDiam}mm</Text>
    </div>]
  },
  names: ['磨损径'],
  view: (orc: any,) => {
    const avsDiam = calcAverageArrObj(orc?.磨损径, (row) => row, 1, 4);
    let node = ['一', '二', '三', '四'].map((cap: any, c: number) => <div key={c}
                                                                          css={{borderTop: c === 0 ? 'unset' : '1px solid'}}>{orc?.磨损径?.[c]}</div>);
    return [false, <>
      <CCell css={{padding: 0}}>{node}</CCell>
      {<CCell>{avsDiam}</CCell>
      }
    </>]
  },
};
export const cbK2_6 = {
  edit: (inp: any, setInp: (a: any) => void) => {
    return [false, <div><Text>磨损最大的重要轴（销轴）为：</Text>
      <InputLine label='轴'>
        <Input value={inp?.销轴损最 || ''}
               onChange={e => setInp({...inp, 销轴损最: e.currentTarget.value || undefined})}/>
      </InputLine>
      <Text>锈蚀最大的重要轴（销轴）为：</Text>
      <InputLine label='轴'>
        <Input value={inp?.销轴锈最 || ''}
               onChange={e => setInp({...inp, 销轴锈最: e.currentTarget.value || undefined})}/>
      </InputLine>
    </div>]
  },
  names: ['销轴损最', '销轴锈最'],
};
export const cbK4_6 = {
  edit: (inp: any, setInp: (a: any) => void) => {
    return [false, <div><Text>连续工作的异步电机工作电流应当不大于电机的额定电流。</Text>
      <InputLine label='电机'>
        <Input value={inp?.工电机 || ''}
               onChange={e => setInp({...inp, 工电机: e.currentTarget.value || undefined})}/>
      </InputLine>
      <Text>电机额定电流为：</Text>
      <InputLine label='电流'>
        <SuffixInput value={inp?.机额电流 || ''}
                     onSave={txt => setInp({...inp, 机额电流: txt || undefined})}>A</SuffixInput>
      </InputLine>
    </div>]
  },
  names: ['工电机', '机额电流'],
};
export const cbK5_21 = {
  edit: (inp: any, setInp: (a: any) => void) => {
    return [false, <div><Text>座席距地面最大高度：</Text>
      <InputLine label='高度'>
        <SuffixInput value={inp?.座席高 || ''}
                     onSave={txt => setInp({...inp, 座席高: txt || undefined})}>m</SuffixInput>
      </InputLine>
    </div>]
  },
  names: ['座席高'],
};

export const genCBoOmit = (name: string,) => {
  return {
    view: (orc: any) => {
      return [false, <>
        <CCell>{orc?.[name]}</CCell>
      </>]
    },
  };
};
