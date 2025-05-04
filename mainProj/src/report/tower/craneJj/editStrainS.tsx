/** @jsxImportSource @emotion/react */
import * as React from "react";
import {css} from "@emotion/react";
import {
    Text, BlobInputList, Input, TextArea, InputLine, LineColumn, SuffixInput, useTheme,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps,  useInputControlSure,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {useTableEditor} from "../../hook/useRepTableEditor";
import {EditStorageContext} from "../../StorageContext";
import {useUppyUpload} from "../../hook/useUppyUpload";
import {Each_ZdSetting} from "@/report/hook/use-table-editor";


export const config测点表=[['应变值','μ',150,(obj,setObj)=>{
    return <SuffixInput  value={obj?.μ ||''} onSave={txt=> setObj({...obj,μ: txt || undefined })}>με</SuffixInput>
}],['应力值','M',150,(obj,setObj)=>{
    return <SuffixInput  value={obj?.M ||''} onSave={txt=> setObj({...obj,M: txt || undefined })}>MPa</SuffixInput>
}]] as Each_ZdSetting[];
export const itemA应变应力=['应仪器型','应变片型','应天气','应风速','应温度1','应温度2','应试工况','测点表','_FILE_测点','测点示意','危应第','危工况','安全系数','危结论','应变备注'];

export const StrainStress =
    React.forwardRef((
        {children, show, alone = true, repId,redId, nestMd, label,}: InternalItemProps, ref
    ) => {
        const theme = useTheme();
        const [getInpFilter]=useMeasureInpFilter(null,itemA应变应力,);
        //对比同常的const {inp, setInp} = useItemInputControl({ ref });这里增加onSure可立刻修改storage的。就差发送保存给后端操作。尽量避免丢失刚刚上传的文件：类似数据库事务ACID回滚和确保完整。
        const {inp, setInp,onSure} = useInputControlSure({ ref,redId,nestMd });
        const breaks=[140,420,620];
        const headview=<Text variant="h5">
            测试点:按照一行2字段录入： 应变值（με）, 应力值（MPa）;
        </Text>;
        const [render测点表]=useTableEditor({breaks, inp, setInp,  headview,
            config: config测点表, table:'测点表', column:3, });
        const {modified,setModified,} =React.useContext(EditStorageContext) as any;
        const onFinish = React.useCallback(async(upfile: any, del:boolean) => {
            onSure({...inp, '_FILE_测点': upfile});
            !modified && setModified(true);
        }, [inp, modified,onSure,setModified]);
        const [uploadDom]=useUppyUpload({ repId:repId!,
            maxFile:1, onFinish, storeObj: inp?._FILE_测点 ,liveDays:10
        });

        return <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show} redId={redId}
                                    nestMd={nestMd} alone={alone} label={label!}>
            <Text variant="h5">{label}：</Text>
            <div css={{display: 'flex',flexWrap: 'wrap',justifyContent:'space-around',alignItems:'center'}}>
                { [['仪器型号','应仪器型',undefined,30],['应变片型式','应变片型',undefined,25],['天气情况','应天气',undefined,35],['风速','应风速','m/s'],['温度','应温度1','℃'],['温度','应温度2']
                ].map(([title,field,unit,size]:any, i:number) => {
                    return <div key={i} css={{ display: 'flex',alignItems:'center',
                        [theme.mediaQueries.md]: {marginLeft: '1rem'}
                    }}>
                        <Text css={{whiteSpace: 'nowrap',marginRight: '0.2rem'}}>{title}</Text>
                        <Input  value={inp?.[field] ||''}  size={size!}
                                onChange={e => setInp({ ...inp, [field]: e.currentTarget.value||undefined }) }/>
                        <Text css={{whiteSpace: 'nowrap',marginLeft: '0.1rem'}}>{unit}</Text>
                    </div>;
                }) }
            </div>
            测试工况：
            <TextArea  value={inp?.应试工况 ||''} rows={2}
                       onChange={e => setInp({ ...inp, 应试工况: e.currentTarget.value||undefined}) } />
            {render测点表}
            <InputLine  label='测点示意图-说明：'  lineStyle={css`max-width:unset;`}>
                <BlobInputList value={inp?.测点示意 ||''} rows={1}  datalist={[ ]}
                               onListChange={v => setInp({ ...inp, 测点示意: v || undefined}) } />
            </InputLine>
            测点示意图：
            {uploadDom}
            测试结果：
            <LineColumn column={4} >
                <InputLine  label='最危险应力点为第 ：' >
                    <SuffixInput  value={inp?.危应第 ||''} onSave={txt=> setInp({...inp,危应第: txt || undefined })}>点</SuffixInput>
                </InputLine>
                <InputLine  label='危险点-工况：' >
                    <BlobInputList value={inp?.危工况 ||''} rows={1}  datalist={[ ]}
                                   onListChange={v => setInp({ ...inp, 危工况: v || undefined}) } />
                </InputLine>
                <InputLine  label='安全系数n=' >
                    <Input  value={inp?.安全系数 ||''}
                            onChange={e => setInp({ ...inp, 安全系数: e.currentTarget.value||undefined }) }/>
                </InputLine>
                <InputLine  label='测试结论：' >
                    <BlobInputList value={inp?.危结论 ||''} rows={1}  datalist={['合格', ]}
                                   onListChange={v => setInp({ ...inp, 危结论: v || undefined}) } />
                </InputLine>
            </LineColumn>
            备注：
            <TextArea  value={inp?.应变备注 ||''} rows={3}
                       onChange={e => setInp({ ...inp, 应变备注: e.currentTarget.value||undefined}) } />
            <Text css={{fontSize: '0.8rem'}}>
                注：可另附记表单。无需检验的，仅填测试结论栏。
            </Text>
        </InspectRecordLayout>;
    });
