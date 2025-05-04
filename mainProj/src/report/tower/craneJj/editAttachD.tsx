/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, Input, TextArea, InputLine, LineColumn, useTheme, Table, TableHead, TableRow, CCell, TableBody, Cell, Layer, Button, Select,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, SelectHookfork, useItemInputControl,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {useTableEditor} from "../../hook/useRepTableEditor";
import {Each_ZdSetting} from "@/report/hook/use-table-edit";

interface Props  extends InternalItemProps{
    nos?: string;
}
export const variant附设=['桥架型起重机、臂架型起重机、电动葫芦等起重设备','升降机等登机设备'];
export const config附设装置=[['序号','n',35],['设备种类','y',160,(obj,setObj)=>{
    return <Select inputSize="md" css={{minWidth:'140px',fontSize:'1.3rem',padding:'0 1rem'}}
                   value={obj?.y ||''} onChange={e => setObj({ ...obj, y: e.currentTarget.value||undefined}) }>
        <option></option>
        {variant附设.map((oTydec: any, i: React.Key) => {
            return <option key={i}>{oTydec}</option>
        })}</Select>
}],['设备名称','t',80],['设备型号','m',80],['额定起重量','Q',58],
    ['产品编号','p',78],['制造单位','u',142],['检验结果','r',42,(obj,setObj)=>{
        return <SelectHookfork value={ obj?.r ||''} onChange={e => setObj({ ...obj, r: e.currentTarget.value||undefined}) }/>
    }],['备注','Z',100]] as Each_ZdSetting[];
const 默认附设装置=[{n:'1',y:'桥架型起重机、臂架型起重机、电动葫芦等起重设备'},{n:'2',y:'桥架型起重机、臂架型起重机、电动葫芦等起重设备'},{n:'3',y:'升降机等登机设备'}];
export const itemA附设装=['附设表' ];

//上render 不变的函数
const defaultValCb= (par: { 附设表?: any; })=>{
        const { 附设表,}=par;
        if(!附设表)   par.附设表=默认附设装置;          //【特别注意】不能用附设装需改名附设表，同名字导致错误不好解决不易发现，
        return  par;
}
export const AttachmentDevice =
    React.forwardRef((
        {children, show, alone = true, repId,redId, nestMd, label,nos}: Props, ref
    ) => {
        const theme = useTheme();
        const [getInpFilter]=useMeasureInpFilter(null,itemA附设装, defaultValCb);
        //【不能这么做】 const [getInpFilter]=useMeasureInpFilter(null,itemA附设装,(par)=>{
        //     const { 附设表,}=par;
        //     if(!附设表)   par.附设表=默认附设装置;          //【特别注意】不能用附设装需改名附设表，同名字导致错误不好解决不易发现，
        //     return  par;
        // });
        const {inp, setInp} = useItemInputControl({ ref });
        const headvw2=<Text variant="h5">
            {label}：
        </Text>;
        const breaks2=[280,620];
        const editAs=(obj:any, setObj:React.Dispatch<React.SetStateAction<any>>, seq:number | null)=>{
            const table='附设表';
            return <Layer elevation={"sm"} css={{display: 'flex',justifyContent: 'center',flexDirection: 'column',width: '-webkit-fill-available',
                [theme.mediaQueries.md]: {flexDirection: 'row',padding:'0.25rem'}
            }}>
                {seq===null? '新' : seq!+1}
                <div className="editLinc" css={{width: '-webkit-fill-available'}}>
                    <LineColumn className="editItems" column={3} >
                        {(config附设装置).map(([title,tag, _, callback]:any,i:number) => {
                            if(tag==='Z')  return  <React.Fragment key={i}></React.Fragment>;
                            else return (
                                <InputLine key={i} label={title+'：'}
                                           css={{ "& .InputLine__Head": {alignItems: 'center'} }}
                                >
                                    { callback ? callback(obj,setObj)
                                        :
                                        <Input value={obj?.[tag] ||''}
                                               onChange={e => {
                                                   setObj({...obj, [tag]: (e.currentTarget.value||undefined)});
                                               } } />
                                    }
                                </InputLine>
                            );
                        } )  }
                    </LineColumn>
                    备注：
                    <TextArea  value={obj?.Z ||''} rows={3}
                               onChange={e => setObj({ ...obj, Z: e.currentTarget.value||undefined}) } />
                    <Button onPress={() => {
                        if(seq !== null) {
                            inp?.[table]?.splice(seq, 1, obj);    //替换掉的
                            setInp({ ...inp, [table]: [...inp?.[table]] });
                        }
                        else if(inp?.[table]?.length>0){
                            inp?.[table]?.splice(inp?.[table]?.length, 0, obj);    //尾巴加
                            setInp({ ...inp, [table]: [...inp?.[table]] });
                        }
                        else  setInp({ ...inp, [table]: [obj] });
                    } }
                    >{(inp?.[table]?.length>0 && seq!==null)? `改一组就确认`: `新增一组`}</Button>
                </div>
            </Layer>;
        };
        const [render附设装置]=useTableEditor({breaks:breaks2,inp,setInp,
            headview:headvw2, config: config附设装置, table:'附设表', column:2,  defaultV:默认附设装置, editAs,maxRf:1});

        return <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show} redId={redId}
                                    nestMd={nestMd} alone={alone} label={label!}>
            <Text variant="h5">{label}：</Text>
            附表{nos}-1 桥架型起重机、臂架型起重机、电动葫芦等起重设备:
            <Table fixed={ ["13%","%"] } css={{borderCollapse: 'collapse'}} tight  miniw={800}>
                <TableHead>
                    <TableRow><CCell>序号</CCell><CCell>检验内容</CCell></TableRow>
                </TableHead>
                <TableBody>
                    <TableRow><CCell>1</CCell><Cell>金属结构无明显可见的损伤、缺陷。</Cell></TableRow>
                    <TableRow><CCell>2</CCell><Cell>各主要零部件和电气设备无明显可见的损伤、缺陷。</Cell></TableRow>
                    <TableRow><CCell>3</CCell><Cell>空载试验，操纵系统动作可靠、准确，各机构运行正常，无异常噪声等现象；起升高度限位、运行行程限位、幅度限位等安全保护装置动作可靠、准确。急停开关功能正常。</Cell></TableRow>
                </TableBody>
            </Table>
            附表{nos}-3 升降机等登机设备:
            <Table fixed={ ["13%","%"] } css={{borderCollapse: 'collapse'}} tight  miniw={800}>
                <TableHead>
                    <TableRow><CCell>序号</CCell><CCell>检验内容</CCell></TableRow>
                </TableHead>
                <TableBody>
                    <TableRow><CCell>1</CCell><Cell>金属结构无明显可见的损伤、缺陷。</Cell></TableRow>
                    <TableRow><CCell>2</CCell><Cell>吊笼门应当能够完全遮蔽开口，并且配备机械锁在运行状态下门不能被打开；所有吊笼门都处于关闭位置时，吊笼才能启动和保持运行。</Cell></TableRow>
                    <TableRow><CCell>3</CCell><Cell>层门应与吊笼电气或机械联锁，只有在吊笼底板在登机平台时，该平台的层门方可打开。所有层门处于关闭和锁紧位置时，吊笼才能启动和保持运行。</Cell></TableRow>
                    <TableRow><CCell>4</CCell><Cell>空载试验，操纵系统动作可靠、准确，各机构运行正常，无异常噪声等现象；限位开关、极限开关等安全保护装置动作可靠、准确。急停开关功能正常。</Cell></TableRow>
                </TableBody>
            </Table>
            {render附设装置}
            { children }
            <Text css={{fontSize: '0.8rem'}}>
               注：对于附表{nos}三个表，无需检验的，仅填检验结果栏。可另附表单。
            </Text>
        </InspectRecordLayout>;
    });
