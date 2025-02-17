/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    useTheme, InputLine, SuffixInput, Button, Input,
    CCell, Cell, Table, TableBody, TableRow, RCell
} from "customize-easy-ui-component";

import { InspectRecordLayout, InternalItemProps, useItemInputControl } from "../common/base";
import { Link as RouterLink  } from "../../routing/Link";
import Img_Seal from '../../images/seal.png';

import queryString from "query-string";

//不同版本能够直接复用的组件； 内容相对重复；减少代码数量的重复和冗余。

//即使多版本间会有调整的，还可以添加注入的参数或者内部逻辑判定来适应。
export const ItemSurveyLinkMan=
  React.forwardRef((
    { children, show ,alone=true}:InternalItemProps,  ref
  ) => {
    const getInpFilter = React.useCallback((par: any) => {
      //devCod,检验日期：这些字段要提升到关系数据库表中，json半结构化数据的就不做保留。
      //安全人员,联系电话：放json，算是过度性质输入形态。报告正式批准/终结后，就该触发修改同步到库表中去。也可反馈给下一次定期检验，继承或修改。
      const {devCod,检验日期,安全人员,联系电话} =par||{};
      return {devCod,检验日期,安全人员,联系电话};
    }, []);
    const {inp, setInp} = useItemInputControl({ ref });
    console.log(`ItemSurveyLinkMan 编辑器报告的:inp`, inp);
    return (
      <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                           alone={alone}  label={'一、设备概况'} column={0}>
        允许直接修改部分
        <InputLine  label='设备号{将来是点击链接自动获得}' >
          <Input  value={inp?.devCod ||''}  placeholder="那一台电梯？暂时要求，将来是点击链接自动获得"
                  onChange={e => setInp({ ...inp, devCod: e.currentTarget.value||undefined}) } />
        </InputLine>
        <InputLine  label='检验日期{将来提升到创立原始记录的前置输入}' >
          <Input value={inp?.检验日期 ||''}  placeholder="基准日" type='date'
                 onChange={e => setInp({ ...inp, 检验日期: e.currentTarget.value}) } />
        </InputLine>
        <InputLine  label='安全管理人员' >
          <Input  value={inp?.安全人员 ||''}
                  onChange={e => setInp({ ...inp, 安全人员: e.currentTarget.value||undefined}) } />
        </InputLine>
        <InputLine  label='联系电话1' >
          <Input  value={inp?.联系电话 ||''}
                  onChange={e => setInp({ ...inp, 联系电话: e.currentTarget.value||undefined}) } />
        </InputLine>
        不可修改的明细：待续或点外部链接。
      </InspectRecordLayout>
    );
  } );

//提供給6.3 6.9 6.12項目公用的部分。
//'附录A 层门间隙、啮合长度' 这7个测量数据，单独放一个编辑组件。而原本'6.3','6.9','6.12'只读和跳转连接。
//【测量数据部分】，这个组件对应内容原本是在电梯原始记录的附录的”测量数据“才会显示的，直接整合到了检验项目的附件内容组件内点击跳转路由进本组件。
//【存储字段】这里的编辑字段完全自定义，没有走统一的配置模式的，其它地方仅引用的，这里是编辑器变量创建和定义的原始出处。
//数据库report.data存储source={"层站": ["2", "-1"], "门套隙": {"-1": "909", "2": "5"}, "门扇隙": {"-1": "652", "2": "12"},}；避免混淆同名啊，还不能和设备台账参数名字段同名。
export const ItemGapMeasure=
  React.forwardRef((
    { children, show ,alone=true, repId}:InternalItemProps,  ref
  ) => {
    const getInpFilter = React.useCallback((par: any) => {
      //可随意定义存储字段：同名就歇菜了！！ 确保【同一个模板】的唯一性名字 字段。后面5个变量实际是统一配置的检验项目所涉及的参数，这里没用。
      const {层站,门扇隙,门套隙,地坎隙,施力隙,层锁啮深,刀坎距,轮坎距,门扇间隙,最不利隙,层门锁,轿门锁,刀轮地隙} =par||{};
      return {层站,门扇隙,门套隙,地坎隙,施力隙,层锁啮深,刀坎距,轮坎距,门扇间隙,最不利隙,层门锁,轿门锁,刀轮地隙};
    }, []);
    const {inp, setInp} = useItemInputControl({ ref });
    const theme = useTheme();
    const [floor, setFloor] = React.useState<string>('');
    const qs= queryString.parse(window.location.search);
    //console.log("参数第三层路由mathched qs=",qs);
    return (
      <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                           alone={alone}  label={'附录A 层门间隙、啮合长度'} column={0}>
        <div>
          <RouterLink  href={`/report/EL-DJ/ver/1/${repId}/${qs.from?qs.from:'6.3'}`}>
            (点击回检验项)已检记录,每层七个尺寸:
          </RouterLink>
          {inp?.层站?.map((a:string,i:number)=>{
            return <React.Fragment key={i}>
              <br/>{
              `[${a}]层: ${inp?.门扇隙?.[a]||''} , ${inp?.门套隙?.[a]||''} , ${inp?.地坎隙?.[a]||''} , ${inp?.施力隙?.[a]||''} , ${inp?.层锁啮深?.[a]||''} , ${inp?.刀坎距?.[a]||''} , ${inp?.轮坎距?.[a]||''};`
            }
            </React.Fragment>;
          }) }
        </div>
        新增检查=＞
        <InputLine  label='首先设置当前层站号'>
          <SuffixInput value={floor||''}
              onSave={txt=> setFloor(txt)}
          >
            <Button onPress={() =>floor&&(inp?.层站?.includes(floor)? null:
                setInp( (inp?.层站&&{...inp,层站:[...inp?.层站,floor] } )
                  || {...inp,层站:[floor] } )
            )}
            >新增</Button>
          </SuffixInput>
        </InputLine>
        <div css={{ textAlign: 'center' }}>
          <Button css={{ marginTop: theme.spaces.sm }} size="sm"
                  onPress={() => floor&&inp?.层站?.includes(floor) &&(
                    setInp({...inp,层站:[...inp.层站.filter((a:any) => a!==floor )],
                      门扇隙:{...inp?.门扇隙,[floor]:undefined}, 门套隙:{...inp?.门套隙,[floor]:undefined}, 地坎隙:{...inp?.地坎隙,[floor]:undefined}
                      , 施力隙:{...inp?.施力隙,[floor]:undefined}, 层锁啮深:{...inp?.层锁啮深,[floor]:undefined},
                        刀坎距:{...inp?.刀坎距,[floor]:undefined}
                      , 轮坎距:{...inp?.轮坎距,[floor]:undefined}
                    })
                  )}
          >刪除该层</Button>
        </div>
        <InputLine label={`层门门扇间间隙(层号 ${floor}):`}>
          <SuffixInput  placeholder="请输入测量数" value={ (inp?.门扇隙?.[floor] ) || ''}
            onSave={txt => floor&&setInp({ ...inp, 门扇隙:{...inp?.门扇隙,[floor]: txt||undefined} }) }
          >mm</SuffixInput>
        </InputLine>
        <InputLine label={`层门门扇与门套间隙(层号 ${floor}):`}>
          <SuffixInput  placeholder="请输入测量数"  value={ (inp?.门套隙?.[floor] ) || ''}
            onSave={txt => floor&&setInp({ ...inp, 门套隙:{...inp?.门套隙,[floor]: txt||undefined} }) }
          >mm</SuffixInput>
        </InputLine>
        <InputLine label={`层门扇与地坎间隙(层号 ${floor}):`}>
          <SuffixInput  placeholder="请输入测量数" value={ (inp?.地坎隙?.[floor] ) || ''}
            onSave={txt => floor&&setInp({ ...inp, 地坎隙:{...inp?.地坎隙,[floor]: txt||undefined} }) }
          >mm</SuffixInput>
        </InputLine>
        <InputLine label={`层门扇间施力间隙(层号 ${floor}):`}>
          <SuffixInput placeholder="请输入测量数" value={ (inp?.施力隙?.[floor] ) || ''}
            onSave={txt => floor&&setInp({ ...inp, 施力隙:{...inp?.施力隙,[floor]: txt||undefined} }) }
          >mm</SuffixInput>
        </InputLine>
        <InputLine label={`层门锁啮合深度(层号 ${floor}):`}>
          <SuffixInput placeholder="请输入测量数" value={ (inp?.层锁啮深?.[floor] ) || ''}
            onSave={txt => floor&&setInp({ ...inp, 层锁啮深:{...inp?.层锁啮深,[floor]: txt||undefined} }) }
          >mm</SuffixInput>
        </InputLine>
        <InputLine label={`轿门门刀与层门地坎间距(层号 ${floor}):`}>
          <SuffixInput placeholder="请输入测量数" value={ (inp?.刀坎距?.[floor] ) || ''}
            onSave={txt => floor&&setInp({ ...inp, 刀坎距:{...inp?.刀坎距,[floor]: txt||undefined} }) }
          >mm</SuffixInput>
        </InputLine>
        <InputLine label={`门锁滚轮与轿门地坎间距(层号 ${floor}):`}>
          <SuffixInput placeholder="请输入测量数" value={ (inp?.轮坎距?.[floor] ) || ''}
            onSave={txt => floor&&setInp({ ...inp, 轮坎距:{...inp?.轮坎距,[floor]: txt||undefined} }) }
          >mm</SuffixInput>
        </InputLine>
      </InspectRecordLayout>
    );
  } );

/* <Table嵌套注意 宽度px 计算；
* */
export const 检验编制核准= ( { orc } : { orc: any }
) => {
  return <React.Fragment>
    <TableRow>
      <CCell component="th" scope="row">检验人员</CCell>
      <Cell colSpan={4}>{orc.检验人IDs}</Cell>
    </TableRow>
    <TableRow>
      <CCell component="th" scope="row">编制</CCell>
      <CCell>{orc.编制人}</CCell>
      <CCell>日期</CCell>
      <CCell>{orc.编制日期}</CCell>
      <CCell rowSpan={3}>
        <div css={{
          height:'8rem',
          '::before': {
              filter: 'opacity(30%)',
              width: '100%',
              height: '100%',
              backgroundImage: `url(${Img_Seal})`,
              content: '" "',
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
           }
        }}>
          <Table  fixed={ ["40%","%"]  }
                  printColWidth={ ["105","156"] }
                  css={ {borderCollapse: 'collapse',height:'fill-available'} }
          >
            <TableBody>
              <TableRow>
                <CCell css={{border:'none'}}>机构核准证号：</CCell>
                <CCell css={{border:'none'}}>TS7110236-2018</CCell>
              </TableRow>
              <TableRow>
                <CCell css={{border:'none'}} colSpan={2}>（机构公章或检验专用章）</CCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CCell>
    </TableRow>
  </React.Fragment>;
};

//注意<RouterLink to={`/report/`}>不能直接套在函数上面，其底下必须见到<>。
export const 检验设备情况= ( { orc } : { orc: any }
) => {
  return <React.Fragment>
    <TableBody>
      <TableRow>
        <CCell component="th" scope="row">设备品种</CCell>
        <CCell>{orc.设备品种}</CCell>
        <CCell>使用登记证编号</CCell>
        <CCell>{orc.使用证号}</CCell>
      </TableRow>
      <TableRow>
        <CCell>设备注册代码</CCell>
        <CCell colSpan={3}>{orc.注册代码}</CCell>
      </TableRow>
      <TableRow>
        <CCell component="th" scope="row">使用单位名称</CCell>
        <CCell colSpan={3}>{orc.使用单位}</CCell>
      </TableRow>
      <TableRow >
        <CCell component="th" scope="row">使用单位地址</CCell>
        <CCell colSpan={3}>{orc.使用单位地址}</CCell>
      </TableRow>
      <TableRow >
        <CCell component="th" scope="row">楼盘名称</CCell>
        <CCell colSpan={3}>{orc.楼盘}</CCell>
      </TableRow>
      <TableRow >
        <CCell component="th" scope="row">楼盘地址</CCell>
        <CCell colSpan={3}>{orc.楼盘地址}</CCell>
      </TableRow>
      <TableRow >
        <CCell component="th" scope="row">分支机构名称</CCell>
        <CCell colSpan={3}>{orc.分支机构 || '／'}</CCell>
      </TableRow>
      <TableRow >
        <CCell component="th" scope="row">分支机构地址</CCell>
        <CCell colSpan={3}>{orc.分支机构地址 || '／'}</CCell>
      </TableRow>
      <TableRow>
        <CCell component="th" scope="row">设备使用地点</CCell>
        <CCell colSpan={3}>{orc.设备使用地点}</CCell>
      </TableRow>
      <TableRow>
        <CCell component="th" scope="row">使用单位代码</CCell>
        <CCell colSpan={3}>350122197109084531</CCell>
      </TableRow>
      <TableRow>
        <CCell component="th" scope="row">安全管理人员</CCell>
        <CCell>{orc.安全人员}</CCell>
        <CCell>单位内编号</CCell>
        <CCell>{orc.单位内部编号}</CCell>
      </TableRow>
      <TableRow>
        <CCell component="th" scope="row">制造日期</CCell>
        <CCell>{orc.制造日期 || '／'}</CCell>
        <CCell>改造日期</CCell>
        <CCell>{orc.改造日期 || '／'}</CCell>
      </TableRow>
      <TableRow>
        <CCell component="th" scope="row">制造单位名称</CCell>
        <CCell colSpan={3}>{orc.制造单位 || '／'}</CCell>
      </TableRow>
      <TableRow>
        <CCell component="th" scope="row">改造单位名称</CCell>
        <CCell colSpan={3}>{orc.改造单位 || '／'}</CCell>
      </TableRow>
      <TableRow>
        <CCell component="th" scope="row">产品编号</CCell>
        <CCell>ZT1600005085</CCell>
        <CCell>型号</CCell>
        <CCell>{orc.型号}</CCell>
      </TableRow>
      <TableRow>
        <CCell component="th" scope="row">维护保养单位名称</CCell>
        <CCell colSpan={3}>{orc.维保单位}</CCell>
      </TableRow>
    </TableBody>
  </React.Fragment>;
};



/**打印规矩： A4竖版的  718px 不可以超过。 printColWidth今后统一合计=718
 * */
export const 首页设备概况= ( {theme, orc } :{theme: any, orc:any}
) => {
    return <React.Fragment>
        <Table fixed={ ["20%","%"] }   printColWidth={ ["157","561"] }   css={ {borderCollapse: 'collapse'} }  >
            <TableBody>
                <TableRow>
                    <RCell css={{border:'none'}}>使用单位</RCell>
                    <CCell css={{border:'none',borderBottom:`1px dashed ${theme.colors.intent.primary.light}`}}>{orc.使用单位}</CCell>
                </TableRow>
                <TableRow>
                    <RCell css={{border:'none'}}>分支机构</RCell>
                    <CCell css={{border:'none',borderBottom:`1px dashed ${theme.colors.intent.primary.light}`}}>{orc.分支机构 || '／'}</CCell>
                </TableRow>
                <TableRow>
                    <RCell css={{border:'none'}}>楼盘名称</RCell>
                    <CCell css={{border:'none',borderBottom:`1px dashed ${theme.colors.intent.primary.light}`}}>{orc.楼盘 || '／'}</CCell>
                </TableRow>
                <TableRow>
                    <RCell css={{border:'none'}}>设备类别</RCell>
                    <CCell css={{border:'none',borderBottom:`1px dashed ${theme.colors.intent.primary.light}`}}>{orc.设备类别}</CCell>
                </TableRow>
                <TableRow>
                    <RCell css={{border:'none'}}>设备品种</RCell>
                    <CCell css={{border:'none',borderBottom:`1px dashed ${theme.colors.intent.primary.light}`}}>{orc.设备品种}</CCell>
                </TableRow>
                <TableRow>
                    <RCell css={{border:'none'}}>检验日期</RCell>
                    <CCell css={{border:'none',borderBottom:`1px dashed ${theme.colors.intent.primary.light}`}}>{orc.检验日期}</CCell>
                </TableRow>
                <TableRow>
                    <RCell css={{border:'none'}}>监察识别码</RCell>
                    <CCell css={{border:'none',borderBottom:`1px dashed ${theme.colors.intent.primary.light}`}}>{orc.监察识别码}</CCell>
                </TableRow>
                <TableRow>
                    <RCell css={{border:'none'}}>设备号</RCell>
                    <CCell css={{border:'none',borderBottom:`1px dashed ${theme.colors.intent.primary.light}`}}>{orc.eqpcod}</CCell>
                </TableRow>
                <TableRow>
                    <RCell css={{border:'none'}}>设备代码</RCell>
                    <CCell css={{border:'none',borderBottom:`1px dashed ${theme.colors.intent.primary.light}`}}>{orc.设备代码}</CCell>
                </TableRow>
            </TableBody>
        </Table>
    </React.Fragment>;
};


