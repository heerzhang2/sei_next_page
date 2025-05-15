import * as React from "react";
import {useStorage} from "../StorageContext";

/**【代码复用】分项报告 当前的分项删除，或在这个后面增加一个新的分项,
 * */
export function useDeleteAddSub(nestMd: string, redId: string,verId: string,repId: string
) {
    const {storage, setStorage} =useStorage();
    function onInsertSeq(no:number){
        const maxIdNum =Math.max(...(storage?.['_'+nestMd] || [-1]) );
        const idx=storage?.['_'+nestMd]?.findIndex((it:any) => it === no);
        storage?.['_'+nestMd]?.splice(idx+1, 0, maxIdNum+1);
        setStorage({...storage, ['_'+nestMd] : [...(storage?.['_'+nestMd]||[0]) ] });
    };
    function onDeleteSeq(no:number){
        const idx=storage?.['_'+nestMd]?.findIndex((it:any) => it === no);
        // if(idx> storage?.['_'+nestMd]?.length)  return;
        storage?.['_'+nestMd]?.splice(idx,1);
        setStorage({...storage, ['_'+nestMd] : [...(storage?.['_'+nestMd]||[0]) ] });
    };

    const line=(
         <div css={{
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'space-evenly',
         }}>
             {/*<Button key={1} onClick={async () => {*/}
             {/*    onDeleteSeq(Number(redId) );*/}
             {/*    history.push('/report/'+nestMd+'/ver/'+verId+'/'+repId+'/ALL', {time: Date()} );      //清理掉被删除内容*/}
             {/*}}*/}
             {/*>删除当前分项*/}
             {/*</Button>*/}
             {/*<Button key={2}  onClick={async () => {*/}
             {/*        onInsertSeq(Number(redId) );*/}
             {/*        }}*/}
             {/*>后面增加分项*/}
             {/*</Button>*/}
         </div>
  );
    //数据还没有保存到服务器
  return { line };
}

