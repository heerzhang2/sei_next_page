/** @jsxImportSource @emotion/react */
import * as React from "react";
import {css} from "@emotion/react";
import {
    Button, CommitInput,
    Dialog, DialogClose, DialogContent, DialogDescription, DialogHeading,
    Input,
    InputLine,
    Select,
    useTheme
} from "customize-easy-ui-component";
import {DeviceClassSelect} from "../../device/DeviceClassSelect";
import {reportStatusObj} from "../AgreementListItem";
// import {Dialog,DialogClose, DialogContent, DialogDescription, DialogHeading} from "@/comp/Dialog";

/**【代码复用】准备为某一个任务的关联设备或检验报告的过滤参数； 代码抽取复用和拼装方式之一：Hook形式的。
 * 没用其他辅助状态管理的模式,接收设备选择参数；浏览器后退也会导致unmount:会丢失过滤参数
 * [缺点]Hook里面组织页面tsx的代码，在正常组织页面里面没存在感容易忽视掉。
 * */
export function useDeviceFilter( callback: (filterBy: any) => void
) {
    const theme = useTheme();
    //const filt= JSON.parse(sessionStorage['协议过滤']??'{}');
    const [open, setOpen] = React.useState(false);
    const [eqpf, setEqpf] = React.useState<any>(null);

    const [eqptp, setEqptp] = React.useState<any>(null);
    const [used, setUsed] = React.useState<any>();
    const [plno, setPlno] = React.useState<string>();
    const [fno, setFno] = React.useState<string>();
    const [plat, setPlat] = React.useState<string>();
    const [cert, setCert] = React.useState<string>();
    const [oid, setOid] = React.useState<string>();
    const [cod, setCod] = React.useState<string>();
    const [lpho, setLpho] = React.useState<string>();
    const [ident, setIdent] = React.useState<string>();
    const [feeOk, setFeeOk] = React.useState<boolean>();      //三状态逻辑处理； <CheckSwitch组件不能正确处理过滤设置显示的一致性。
    const [stmsta, setStmsta] = React.useState<string|undefined>();

    const resetFilter = () => {
        setEqpf(null); setEqptp({}); setFno(undefined); setUsed(undefined); setPlno(undefined);
        setPlat(undefined); setCert(undefined); setOid(undefined); setCod(undefined); setLpho(undefined);
        setIdent(undefined);  setFeeOk(undefined); setStmsta(undefined);
    };

    //【注意】特殊性： 编辑器对话框的组件可能直接集成到触发按钮甚至菜单项DdMenuItem?里面了。
  const menu=(
     <>
       <Button size="sm" onPress={ () => { setOpen(true) } } >
          {eqpf? '已过滤' : '过滤'}
       </Button>
         <Dialog open={open} onOpenChange={setOpen}>
             <DialogContent >
                 <DialogHeading>
                     过滤器参数选择
                 </DialogHeading>
                 <DialogDescription>
        <React.Suspense fallback="数据准备...">
          {
            <div css={{ padding: theme.spaces.md }}>
              <form  method="get"  action="/"  css={{margin: 0, position: "relative" }}>
                <div>
                    <InputLine label={`监察识别码:`}>
                        <CommitInput type="search" placeholder="严格匹配查询"
                                     value={oid || ''}   onSave={txt => setOid(txt||undefined) }
                        />
                    </InputLine>
                    <InputLine label={`设备代码:`}>
                        <CommitInput type="search"  value={ cod || ''}  onSave={txt => setCod(txt||undefined) } placeholder="严格匹配"/>
                    </InputLine>
                    <InputLine label={`出厂编号:`} >
                        <CommitInput type="search" value={ fno || ''}  onSave={txt => setFno(txt||undefined) } placeholder="严格匹配"/>
                    </InputLine>
                    <InputLine label={`单位内部编号:`} >
                        <CommitInput type="search"  value={ plno || ''}  onSave={txt => setPlno(txt||undefined) } placeholder="严格匹配"/>
                    </InputLine>
                    <InputLine label={`牌照号:`}>
                        <CommitInput type="search"  value={ plat || ''}  onSave={txt => setPlat(txt||undefined) } placeholder="严格匹配"/>
                    </InputLine>
                    <InputLine label={`使用证号:`}>
                        <CommitInput type="search" placeholder="严格匹配"
                                     value={cert || ''}  onSave={txt => setCert(txt||undefined) }
                        />
                    </InputLine>
                    <InputLine label={`设备联系人手机:`} >
                        <CommitInput type="search" value={ lpho || ''}  onSave={txt => setLpho( txt||undefined ) } placeholder="严格匹配"/>
                    </InputLine>
                  <InputLine label={`投用日期:`} >
                    <Input type='date'  value={ used  || ''}
                           onChange={e => setUsed( e.currentTarget.value||undefined ) } />
                  </InputLine>
                  <DeviceClassSelect  eqp={eqptp} setSelectClass={setEqptp} />
                   <InputLine label={`主报告流程状态:`}>
                        <Select inputSize="md"  value={ stmsta || ''}
                                onChange={e => setStmsta( e.currentTarget.value||undefined ) } >
                            <option value={''}>(不限)</option>
                            { Object.entries(reportStatusObj).map(([enumv,title],i) => (<option key={i+1} value={enumv}>{title}</option> )) }
                        </Select>
                   </InputLine>
                    <InputLine label={`(无台账)报告附加标识:`}>
                        <CommitInput type="search" value={ ident || ''}  onSave={txt => setIdent(txt||undefined) } placeholder="严格匹配"/>
                    </InputLine>
                    <InputLine label={`是否收费已经确认:`}>
                        <Select inputSize="md" css={{minWidth:'140px',fontSize:'1rem',padding:'0 1rem'}} divStyle={css`max-width:240px;`}
                                value={feeOk===true? '1' : feeOk===false? '0' : '3'}
                                onChange={e => {
                                    const choose= e.currentTarget.value;
                                    setFeeOk(choose==='1'? true: choose==='0'? false: undefined);
                                } }
                        >
                            <option value={'3'}>(不知道)</option>
                            <option value={'1'}>是的</option>
                            <option value={'0'}>不是</option>
                        </Select>
                    </InputLine>

                  <div
                      css={{
                        display: "flex",
                        marginTop: theme.spaces.lg,
                        justifyContent: "flex-end"
                      }}
                  >
                  <Button intent="primary"
                          onPress={e => {
                              setOpen(false);
                              resetFilter();
                              setEqpf(null);
                              callback(null);
                          } }
                  >
                   重置查询
                  </Button>
                    <Input  type='reset'  value={'清空过滤'}
                            style={{margin: 'auto', width: undefined }}  css={{backgroundColor: 'wheat' }}
                            onClick={async () => { resetFilter() } }
                    />
                    <Button intent="primary"
                            onPress={e => {
                              setOpen(false);
                              let filter={...eqptp, used,plno,fno,plat,cert,oid,cod,lpho, ident, feeOk, stmsta};
                              setEqpf(JSON.stringify(filter)==='{}'? null : filter);
                              callback(filter);       //运行过滤命令。
                            } }
                    >
                      过滤改完重查
                    </Button>
                  </div>

                </div>
              </form>
            </div>
          }
        </React.Suspense>
                 </DialogDescription>
                 <DialogClose>关闭</DialogClose>
             </DialogContent>
      </Dialog>
     </>
  );

  //页面复用的Hook
  return {
    menu,
    eqpf
  };
}

