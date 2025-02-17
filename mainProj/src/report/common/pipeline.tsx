/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, TableRow} from "customize-easy-ui-component";
import {DirectLink} from "../../routing/Link";

//pref!=null 拆分2栏目的情况；
/**@param where: 若=3表示是{id,name}对象形式的:安装单位、设计单位。；  若=1是svp的字段, 若=2是pa的字段, 若=0是台账直接字段。
 * */
export const CharacteristRow = (title: any, dlPage: any, field: string, rep: any, where?: number, pref?: any, span?: number
) => {
    return <TableRow>
        {pref ? <><CCell rowSpan={span}>{pref}</CCell><CCell>{title}</CCell></>
            : pref === null ? <CCell>{title}</CCell>
                : <CCell colSpan={2}>{title}</CCell>
        }
        {dlPage.map((p: any, c: number) => {
            const text = where === 1 ? p?.svp?.[field] :
                where === 2 ? p?.pa?.[field] :
                    where === 3 ? p?.[field]?.name :
                        p?.[field];
            return <DirectLink key={c}
                               href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Solidify?ppcode=` + p?.code + '#Solidify'}>
                <CCell key={c}>{text || '／'}</CCell>
            </DirectLink>
        })}
    </TableRow>;
};
