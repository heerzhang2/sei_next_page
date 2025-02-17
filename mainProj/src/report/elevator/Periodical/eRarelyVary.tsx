/** @jsxImportSource @emotion/react */
//import { jsx,  } from "@emotion/react";
import * as React from "react";
import {
  Text,
  Layer,
  InputLine,
  Input,
  Button,
  MenuList,
  MenuItem,
  IconChevronDown, ButtonRefComp, IconX,Popover, PopoverClose, PopoverDescription, PopoverContent, PopoverRefer
} from "customize-easy-ui-component";

import {
  InspectRecordLayout,
  InternalItemProps,
  SelectHookfork,
  useItemInputControl
} from "../../common/base";

//很多内容相对重复，这里是报告较高层范围复用的组件；专门报告类型的可以安排在下一层次分开目录去做。
//电梯 机电的 仪器配置表。
//这个倒是很符合承压报告的许多数据学列的录入风格的。
export const ItemInstrumentTable=
  React.forwardRef((
    { children, show ,alone=true}:InternalItemProps,  ref
  ) => {
    const getInpFilter = React.useCallback((par: any) => {
      const {仪器表} =par||{};
      return {仪器表};
    }, []);
    const {inp, setInp} = useItemInputControl({ ref });
    const [seq, setSeq] = React.useState<number | null>(null);   //表對象的當前一條。
    //复合型的状态管理做法。 多个字段聚合的；
    const [obj, setObj] = React.useState({no:'',name:'',type:'',powerOn:'',shutDown:''});
    React.useEffect(() => {
      let size =inp?.仪器表?.length;
      setSeq(size>0?  size-1:null);
    }, [inp]);
    function onModifySeq(idx:number,it:any){
      setObj(it);
      setSeq(idx);
    };
    function onDeleteSeq(idx:number,it:any){
      inp?.仪器表?.splice(idx,1);
      setInp({...inp,仪器表: [...inp?.仪器表] });
      setSeq(null);
    };
    function onInsertSeq(idx:number,it:any){
      inp?.仪器表?.splice(idx,0, obj);
      setInp({...inp,仪器表:[...inp?.仪器表] });
      setSeq(idx);
    };
    function onAddSeq(idx:number){
      let size =inp?.仪器表?.push(obj);
      setInp( (inp?.仪器表&&{...inp,仪器表:[...inp?.仪器表] } )  || {...inp,仪器表:[obj] } );
      setSeq((inp?.仪器表&&(size-1))  || 0 );
    };

    const editor=<Layer elevation={"sm"} css={{ padding: '0.25rem' }}>
      <div>
        <InputLine label={`测量设备名称`}>
          <Input   value={obj.name ||''}   onChange={e =>setObj({...obj, name: e.currentTarget.value} ) } />
        </InputLine>
        <InputLine label={`规格型号`}>
          <Input   value={obj.type ||''}   onChange={e =>setObj({...obj, type: e.currentTarget.value} ) } />
        </InputLine>
        <InputLine label={`测量设备编号`}>
          <Input   value={obj.no ||''}   onChange={e =>setObj({...obj, no: e.currentTarget.value} ) } />
        </InputLine>
        <InputLine  label='性能状态-开机后'>
          <SelectHookfork value={obj.powerOn ||''}  onChange={e =>setObj({...obj, powerOn: e.currentTarget.value} ) } />
        </InputLine>
        <InputLine  label='性能状态-关机前'>
          <SelectHookfork value={obj.shutDown ||''}  onChange={e =>setObj({...obj, shutDown: e.currentTarget.value} ) } />
        </InputLine>
        <Button onPress={() => {
          if(seq !== null) {
            inp?.仪器表?.splice(seq, 1, obj);
            setInp({ ...inp, 仪器表: [...inp?.仪器表] });
          }
          else setInp({ ...inp, 仪器表: [obj] });
        } }
        >{inp?.仪器表?.length>0? `改一条就确认`: `新增一条`}</Button>
      </div>
    </Layer>;

    const instrumentTable=<div>
      {inp?.仪器表?.map((a:any,i:number)=>{
        return <React.Fragment  key={i}>
          <div>{`${i+1}`}
            <Popover>
              <PopoverRefer>
                <ButtonRefComp  size="md" iconAfter={<IconChevronDown />} variant="ghost" css={{whiteSpace:'unset'}}>
                  {`[${a.no}] ${a.name||''} 型号${a.type||''} 开机${a.powerOn||''} 关机${a.shutDown||''}`}
                </ButtonRefComp>
              </PopoverRefer>
              <PopoverContent>
                <PopoverDescription>
                  <MenuList>
                    <MenuItem onPress={()=>onModifySeq(i,a)}>修改</MenuItem>
                    <MenuItem onPress={()=>onDeleteSeq(i,a)}>刪除这条</MenuItem>
                    <MenuItem onPress={()=>onInsertSeq(i,a)}>插入一条</MenuItem>
                    <MenuItem onPress={()=>onAddSeq(i)}>末尾新增一条</MenuItem>
                  </MenuList>
                </PopoverDescription>
                <PopoverClose>
                  <IconX/>
                </PopoverClose>
              </PopoverContent>
            </Popover>
          </div>
          {i===seq && editor}
        </React.Fragment>;
      }) }
    </div>;

    return (
      <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                           alone={alone}  label={'主要检验仪器设备'} column={0}>
        <Text  variant="h5">
          二、主要测量设备性能检查
        </Text>

        使用的仪器设备表:
        <hr/>
        {instrumentTable}
        {seq===null && editor}

        注：1、性能状态一栏中用“√”表示正常，用“×”表示不正常。
        2、若测量设备性能状态不正常，应更换为性能状态正常的测量设备，并填写在预留栏中。
        3、新增使用的仪器设备应填写在预留栏中。
        4、未使用的测量设备可不填写。
      </InspectRecordLayout>
    );
  } );


