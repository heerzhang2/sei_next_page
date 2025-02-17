/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    useTheme, Button,
    InputLine, Input, TextArea, SuffixInput, InputDatalist, TableBody, TableRow, CCell, Table, Text, LineColumn
} from "customize-easy-ui-component";
import {
  InspectRecordLayout,
  InternalItemProps,
  useItemInputControl
} from "../common/base";
export const 常见的备注=['本报告为复检报告，本次复检仅对上次不合格报告的不合格项进行复检，其余项目单项结论引用上次不合格报告中相对应项目的结论'];
export const 结果可选的=['符合要求','不符合要求'];

//公共的复用性好的组件；编辑、原始记录，在多数模板能通用的。不通用的要安排放在更加具体贴近的目录文件内。
//方便不同模板和不同版本的可重复引用。文件目录管理，组件按照抽象性程度和参数配置的关联度，分级分层次，标识容易区分开。

export const ItemRemarks=
  React.forwardRef((
    { children, show ,alone=true}:InternalItemProps,  ref
  ) => {
    const getInpFilter = React.useCallback((par: any) => {
      const {自检材料,校验材料,整改材料,资料及编号,memo} =par||{};
      return {自检材料,校验材料,整改材料,资料及编号,memo};
    }, []);
    const {inp, setInp} = useItemInputControl({ ref });
    return (
      <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                           alone={alone}  label={'见证材料或问题备注'} column={0}>
        六、见证材料{`{将来可能只需输入编号链接即可}`}
        <InputLine  label='1、维保自检材料' >
          <Input  value={inp?.自检材料 ||''}  placeholder="材料名称《电梯年度自行检查报告》,编号："
                  onChange={e => setInp({ ...inp, 自检材料: e.currentTarget.value||undefined}) } />
        </InputLine>
        <InputLine  label='2、限速器动作速度校验材料' >
          <Input  value={inp?.校验材料 ||'材料名称《限速器动作速度校验报告》，编号：'}
                  onChange={e => setInp({ ...inp, 校验材料: e.currentTarget.value||undefined}) } />
        </InputLine>
        <InputLine  label='3、使用单位整改反馈材料' >
          <Input  value={inp?.整改材料 ||''}
                  onChange={e => setInp({ ...inp, 整改材料: e.currentTarget.value||undefined}) } />
        </InputLine>
        <InputLine  label='4、其他资料及编号' >
          <Input  value={inp?.资料及编号 ||''}
                  onChange={e => setInp({ ...inp, 资料及编号: e.currentTarget.value||undefined}) } />
        </InputLine>
        七、备注<br/><br/>
        纸质正式报告备注可能只取前几行
        <TextArea  value={inp?.memo ||''} rows={10} placeholder="网页版本正式报告备注可随意多写"
                   onChange={e => setInp({ ...inp, memo: e.currentTarget.value||undefined}) } />
        <InputLine label={`备注:`}>
              <InputDatalist value={inp?.memo ||''} datalist={常见的备注}
                             onListChange={v => {
                                 setInp({ ...inp, memo: v || undefined})
                             } } />
        </InputLine>
      </InspectRecordLayout>
    );
  } );

/**数组表格倒置存储模式，方便了状态管理操作：读写删除更简单模式。
 * 【特别形式表格】检验条件是表头索引，各个属性拆解独立对象，只有表头是数组的。
 * 实际存储是json:data{ ,"检验条件": ["2023-09-05", "2023-12-28"], "温度": {"2023-09-05": "44", "2023-12-28": "4343"}, "电压值": {"2023-09-05": "778", "2023-12-28": "7777"},,}
 * */
export const ItemAppendixB=
  React.forwardRef((
    { children, show ,alone=true}:InternalItemProps,  ref
  ) => {
    const getInpFilter = React.useCallback((par: any) => {
      const {检验条件,温度,电压值,环境,现场,封闭} =par||{};
      return {检验条件,温度,电压值,环境,现场,封闭};
    }, []);
    const {inp, setInp} = useItemInputControl({ ref });
    const theme = useTheme();
    const [floor, setFloor] = React.useState<string|null>(null);
    return (
      <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                           alone={alone}  label={'附录B：现场检验条件'} column={0}>
          <>
              <Text  variant="h5">
                  附录B：现场检验条件确认
              </Text>
              1、机房或者机器设备间的空气温度保持在5℃～40℃之间；<br/>
              2、电源输入电压波动在额定电压值±7％的范围内；<br/>
              3、环境空气中没有腐蚀性和易燃性气体及导电尘埃； <br/>
              4、检验现场（主要指机房或者机器设备间、井道、轿顶、底坑）清洁，没有与电梯工作无关的物品和设备，基站、相关层站等检验现场放置表明正在进行检验的警示牌；<br/>
              5、对井道进行了必要的封闭。 <br/>
              <hr/>
          </>
        <div>
          确认过的记录:
         <Table css={{borderCollapse:'collapse'}}>
            <TableBody>
                <TableRow >
                    <CCell>确认日期</CCell>
                    <CCell>1温度</CCell>
                    <CCell>2电压值</CCell>
                    <CCell>3环境空气</CCell>
                    <CCell>4检验现场</CCell>
                    <CCell>5井道封闭</CCell>
                </TableRow>
                {inp?.检验条件?.map((a:string,i:number)=>{
                    return <TableRow key={i}>
                        <CCell>{a}</CCell>
                        <CCell>{inp?.温度?.[a]||''}</CCell>
                        <CCell>{inp?.电压值?.[a]||''}</CCell>
                        <CCell>{inp?.环境?.[a]||''}</CCell>
                        <CCell>{inp?.现场?.[a]||''}</CCell>
                        <CCell>{inp?.封闭?.[a]||''}</CCell>
                    </TableRow>
                }) }
            </TableBody>
         </Table>
        </div>
          <>新增检查=＞</>
        <LineColumn column={2}>
            <InputLine  label='首先设置当前检验日期'>
                <SuffixInput  type='date'  value={floor||''}
                              onSave={txt=> setFloor(txt||null)}
                >
                    <Button onPress={() =>floor&&(inp?.检验条件?.includes(floor)? null:
                            setInp( (inp?.检验条件&&{...inp,检验条件:[...inp?.检验条件,floor] } )
                                || {...inp,检验条件:[floor] } )
                    )}
                    >新增</Button>
                    <Button css={{ marginTop: theme.spaces.sm }} size="sm"
                            onPress={() => floor&&inp?.检验条件?.includes(floor) &&(
                                setInp({...inp,检验条件:[...inp.检验条件.filter((a:string) => a!==floor )],
                                    温度:{...inp?.温度,[floor]:undefined}, 电压值:{...inp?.电压值,[floor]:undefined}
                                })
                            )}
                    >刪除</Button>
                </SuffixInput>
            </InputLine>

            <InputLine label={`1机房空气温度(${floor}):`}>
                <SuffixInput placeholder="请输入测量数" value={ (inp?.温度?.[floor!] ) || ''}
                             onSave={txt=> floor&&setInp({ ...inp, 温度:{...inp?.温度,[floor]: txt || undefined} }) }
                >℃</SuffixInput>
            </InputLine>
            <InputLine label={`2电源输入电压(${floor}):`}>
                <SuffixInput placeholder="请输入测量数" value={ (inp?.电压值?.[floor!] ) || ''}
                             onSave={txt=> floor&&setInp({ ...inp, 电压值:{...inp?.电压值,[floor]: txt || undefined} }) }
                >V</SuffixInput>
            </InputLine>
            <InputLine label={`3环境空气(${floor}):`}>
                <InputDatalist value={ (inp?.环境?.[floor!] ) || ''} datalist={结果可选的}
                               onListChange={v => floor&&setInp({ ...inp, 环境:{...inp?.环境,[floor]: v || undefined} }) } />
            </InputLine>
            <InputLine label={`4检验现场(${floor}):`}>
                <InputDatalist value={ (inp?.现场?.[floor!] ) || ''} datalist={结果可选的}
                               onListChange={v => floor&&setInp({ ...inp, 现场:{...inp?.现场,[floor]: v || undefined} }) } />
            </InputLine>
            <InputLine label={`5井道封闭(${floor}):`}>
                <InputDatalist value={ (inp?.封闭?.[floor!] ) || ''} datalist={结果可选的}
                               onListChange={v => floor&&setInp({ ...inp, 封闭:{...inp?.封闭,[floor]: v || undefined} }) } />
            </InputLine>
        </LineColumn>
      </InspectRecordLayout>
    );
  } );


