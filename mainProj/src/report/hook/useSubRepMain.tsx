/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Button,
} from "customize-easy-ui-component";
import loadable from "@loadable/component";
import {ModelTypeArr} from "../modelConfigs";

/**【代码复用】 loadable.lib完全动态找代码的，render props模式的类比高阶组件。
 @param relativePath : src/report/目录底下的限度路径文件。   省略尾随的 /i.E.tsx
 ？？  /Remark 独立控制连接？的；
 @param nestMd : 这种分项报告的模板类编码； 嵌入分项或者独立流转的分项都一样的；
 @param mod : 主报告的模板类编码；
同一个分项模板类型的：嵌入模式 和独立流转模式的 版本号可能不同，前者版本是主报告版本已特定的组件内部预定义的该分项组件版本。
$ 嵌入模式: 依赖  relativePath  NestMbVer;
$ 独立流转模式: 依赖 nestMd  relativePath (组件的路径已经限定了), 不同于独立的主报告,主报告的组件路径直接依照nestMd编码来映射而来的;$缺少一个灵活性.
[注意] 独立流转时，也是依据主报告的报告模板当中配置的路径注入分项报告组件，而不是路由读取文件搜索组件模式的。
 * */

export function useSubRepMain(relativePath: string,{ orc,  repId, rep,NestMbVer,nestMd }
    : { orc: any,repId: string, rep: any, NestMbVer:number,nestMd: string}
) {
    const modelTypeName=ModelTypeArr[nestMd as keyof typeof ModelTypeArr]?.name;
    const Entry = loadable.lib(() => import(`../${relativePath}/i.E.tsx`));
    //有default组件的可以用const Dynamic =loadable(p => import("../Layout.tsx"), {})动态加； {nestMd && <Dynamic />}
    //loadable(p => import(`./${nestMd}`), {       "cm/thickmVs/i.E.tsx",
    // const THICKM_VS_Cmp= 测厚报告模板[`${NestMbVer}` as keyof typeof 测厚报告模板];
    const render=(
        <Entry>{(x: { reportTemplate: any; } ) => {
            const THICKM_VS_Cmp=  (x.reportTemplate)?.[`${NestMbVer}`];
            let thisIdxsum=orc?.[`_${nestMd}`]?.length;
            return  <>
                {/*<div css={{"@media print":{display: 'none'}}}>{relativePath}在容器主报告嵌入开始id={repId}</div>*/}
                {  THICKM_VS_Cmp && React.cloneElement(THICKM_VS_Cmp as React.ReactElement<any>, {
                    source: orc,  //orc['_THICKM_VS_'+surpId],
                    repId,
                    rep,
                    // redId: surpId,
                    //分项目显示个数：若打印预览吗=全部展示的。
                })   }

                {
                    rep?.isp?.reps?.edges?.filter(({node: {modeltype}}:any) => modeltype===nestMd)?.map(({node: subrep}:any, i:number)=> {
                        const AloneSub_Cmp=(x.reportTemplate)?.[`${subrep?.modelversion}`];
                        const  dat =JSON.parse(subrep?.data||{});
                        const fxIdx=thisIdxsum;
                        thisIdxsum+= dat?.[`_${nestMd}`]?.length;
                        //独立流转分项报告id={subrep?.id}, 其主报告id={repId}
                        return <React.Fragment key={i}>
                                <div css={{
                                    marginTop: '1rem',
                                    "@media print": {display: 'none'},
                                }}>
                                    紧接着是：{modelTypeName}独立流转的分项报告，流转状态={subrep?.stm?.sta}。
                                    <Button intent="primary"
                                            onPress={async () => {
                                            }}>功能待续
                                    </Button>
                                </div>
                                {  AloneSub_Cmp && React.cloneElement(AloneSub_Cmp as React.ReactElement<any>, {
                                    source: {...dat,},
                                    repId: subrep?.id,
                                    rep,
                                    fxIdx,
                                })   }
                        </React.Fragment>;
                    })
                }
                {/*<div css={{"@media print":{display: 'none'}}}>{relativePath}分项报告在容器主报告End位repId={repId}</div>*/}
            </>;
        }
        }</Entry>
    );
  return [ render ];
}


/*
    <DirectLink  href={`/report/${mod}/ver/${verId}/${repId}/${nestMd}/Remark`}>
        <div css={{"@media print":{display: 'none'}}}>{relativePath}在容器主报告嵌入开始id={repId}</div>
        {  THICKM_VS_Cmp && React.cloneElement(THICKM_VS_Cmp as React.ReactElement<any>, {
            source: orc,  //orc['_THICKM_VS_'+surpId],
            repId,
            rep,
            // redId: surpId,
            //分项目显示个数：若打印预览吗=全部展示的。
        })   }
    </DirectLink>
                <DirectLink  href={`/report/${nestMd}/ver/${subrep?.modelversion}/${subrep?.id}/Remark`}>
                    <div>{relativePath}在独立流转情况开始位置_id={repId} </div>
                    {  AloneSub_Cmp && React.cloneElement(AloneSub_Cmp as React.ReactElement<any>, {
                        source: {...dat,},
                        repId: subrep?.id,
                        rep,
                        fxIdx,
                    })   }
                </DirectLink>
* */