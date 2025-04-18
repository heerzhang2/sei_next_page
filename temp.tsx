import {arraySetInp} from "./mainProj/src/common/tool";

<Text>磨损钢丝绳直径测量4个：</Text>
{['一', '二', '三', '四'].map((cap: any, c: number) => <Text key={c} css={{display: 'ruby'}}>{cap}处测=
        <Input value={inp?.磨损径?.[c] || ''} style={{display: 'inline-flex', width: '5rem'}}
               onChange={e => arraySetInp('磨损径', c, e.currentTarget.value, inp, setInp)}/>mm；
    </Text>
)}
<Text css={{display: 'ruby'}}>测量结果：{avsDiam}mm</Text>