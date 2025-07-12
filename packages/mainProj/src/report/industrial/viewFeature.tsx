/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell,
  Cell,
  Table,
  TableBody,
  TableRow,
  Text,
  TableHead,
  useTheme,
  RCell,
  LineColumn,
  InputLine,
  CheckSwitch,
  Select,
  BlobInputList,
} from "customize-easy-ui-component";
import {DirectLink, } from "../../routing/Link";
import {useFoldForList, useFoldGenerate, useSplitSubCapacity, } from "../hook/useMainRepUrlOr";

//#不能使用@  {管道特性表({theme, orc, rep})}
// export const 管道特性表= ({theme, orc, rep} :{theme: any, orc:any, rep:any}
//   ) => {       const pages: any[][]=[];
//   }; 这个模式: 不支持hook React.useMemo( () => {加上就会报错的。
//最后改成了 <PipelineCharacteristics orc={orc} rep={rep}/> 这样的；useMemo才会不报错！

//实际表5列 和才2列的：宽度可自己调节
const CLnPercents=[["%","55%"], ["%","37%","37%"],
                 ["%","25%","25%","25%"], ["%","20%","20%","20%","20%"]];
const LaySettings=[['name','管道名称'],['code','管道编号'],['规格','管道规格（mm）',1],['leng','管道长度（m）'],['level','管道级别'],
  ['工介','输送介质',2],['材料','管道材料',1],['设压','设计压力（MPa）',1],['工压','操作压力（MPa）',2],['试压','试验压力（MPa）',2],['设温','设计温度（℃）',1],
  ['工温','操作温度（℃）',2],['start','管道起点'],['stop','管道止点'],['腐蚀','腐蚀裕量（mm）',1],['焊数','对接焊口数量',1],['lay','敷设方式'],
  ['防腐材','防腐层材料',2],['绝材','绝热层材料',2],['绝厚','绝热层厚度(mm)',2],['保数','安全保护装置数量',2],['safe','安全状况等级'],['rno','管道单元登记编码']
];
/**自带分项模式： 这不是内嵌式的有模板代码的公共模板的分项报告模式。
 * 正规jsx组件的用法需改成英文的。
 * 报错：Imported JSX component Moni监控管理系统 must be in PascalCase or SCREAMING_SNAKE_CASE ；<tag></tag>带儿子的组件名字不能用中文的。
 * */
export const PipelineCharacteristics= ({ orc, rep, children } : { orc: any,rep: any,children?: React.ReactNode;}
) => {
  //重组成二维 orc?.单元表?.=> 四个一页的组合。pages[ [1{单元},2,3,undefined ] , ]
  const pages= React.useMemo( () => {
    let pages: any[]=[];
    for(let f=0; f<orc?.单元表?.length; f+=4){
        pages.push( orc?.单元表?.slice(f,f+4) );
    }
    return pages;
  }, [orc?.单元表]);

  const lsBlockMax=useSplitSubCapacity(pages.length,4);
  //切分好大的折叠区
  const {sumArea, areaContent, btnBindUses}=useFoldForList(pages, lsBlockMax,false);
  const frCallback = (dlPage: any, arak:number, pid:number) => {
    const pn=arak * lsBlockMax;     //（折叠区）特性表第几张的 基数，当前折叠区第一张的序号数
    // console.log("特性表大度的分组=",dlPage,"每个大折叠区的特性表第1张的页数pn=",pn,"现是大折叠区arak=",arak,"pid",pid,"lsBlockMax=",lsBlockMax);
    //注意dlPage：对特性表特别的：实际是1-4个的单元拼凑的对象形式集合[][]。
    const xsize=dlPage.length;
    let 检验员s: any[]=[];
    for (const pp of dlPage) {
      if(pp?.sgm){
        const men =检验员s.find((m: any) => m.name === pp?.sgm.name);
        if(!men)  检验员s.push(pp?.sgm);
      }
    }
    //不能约束跟随断开页pageBreakAfter，可能造成空白页<Table fixed={["62%", "%"]} css={{"@media print": {pageBreakAfter: orc?.最后特性? undefined:'always'} }} tight miniw={800}>
    return <React.Fragment key={pid}>
          <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Solidify#Solidify`}>
            <Text  variant="h2" css={{textAlign: 'center', marginTop: '1rem',
              "@media print": {
                pageBreakBefore: 'always', marginTop: 'unset',
              },
            }}
            >管道特性表</Text>
          </DirectLink>
          <div css={{display: 'flex', justifyContent: 'flex-end',}}>
            <Text>报告编号：{rep.isp.no}</Text>
          </div>
          <Table fixed={ CLnPercents[xsize-1]  } css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
            <TableHead>
              <TableRow>
                <CCell><Text css={{fontSize:'0.8rem'}}>项目 \ 序号</Text></CCell>
                { dlPage.map((p: any, c:number) =>
                    <CCell key={c}><Text  id={`Characteristics${(pn+pid)*4 + c}`}>{ (pn+pid)*4 + c+1 }</Text></CCell>
                ) }
              </TableRow>
            </TableHead>
            <TableBody>
              {LaySettings.map(([field,title,where],fn:number) => {
                return <TableRow key={fn}><CCell>{title}</CCell>
                  { dlPage.map((p: any, c:number) =>
                      <DirectLink key={c} href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Solidify?ppcode=`+p?.code+'#Solidify'}>
                        <CCell key={c}>{
                          where===1? p?.svp?.[field] :
                              where===2? p?.pa?.[field] :
                                  p?.[field]}</CCell>
                      </DirectLink>
                  ) }
                </TableRow>
              } ) }
            </TableBody>
          </Table>
          <Table fixed={["62%", "%"]}  tight miniw={800}>
            <TableBody>
              <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/LineDiagram#LineDiagram`}>
                <TableRow>
                  <Cell colSpan={2}>
                    备注：&nbsp;
                    { dlPage.map((p: any, c:number) => p?.mm && <React.Fragment key={c}>
                      &nbsp;{p?.mm}。
                    </React.Fragment> )
                    }
                  </Cell>
                </TableRow>
                <TableRow>
                  <CCell>
                    <div css={{
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignContent: 'space-between',alignItems: 'flex-start'}}>
                      <div><Text>检验：</Text>
                        { 检验员s.map((m: any,k:number) => <React.Fragment key={k}>
                          &nbsp;{m.name}
                        </React.Fragment> )
                        }
                      </div>
                      <div css={{textAlign: 'end'}}><Text >日期</Text>2022-12-31</div>
                    </div></CCell>
                  <CCell><div css={{height: '100%',display: 'flex',justifyContent: 'space-between',alignContent: 'space-between',alignItems: 'flex-start'}}>
                    <div><Text >审核：</Text>  </div>
                    <div css={{textAlign: 'end'}}><Text >日期</Text>2021-01-31</div>
                  </div></CCell>
                </TableRow>
              </DirectLink>
            </TableBody>
          </Table>
    </React.Fragment>
  };
  const [renderAll]=useFoldGenerate({sumArea,btnBindUses,areaContent, callback:frCallback,mark:'特性表折叠'});
  return <>
    { pages.length<=0 && <RouterLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Solidify#Solidify`}>
            <Text id='Solidify' variant="h2" css={{textAlign: 'center', marginTop: '1rem',
                 "@media print": {display: 'none',},
            }}>管道特性表的单元选择</Text>
          </RouterLink>
    }
    <div id="Characteristics"></div>
    { renderAll }
    { children }
  </>;
};

