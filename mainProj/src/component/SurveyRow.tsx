import React from 'react';
import {FlexibleTable, TableBody, TableCell, TableRow} from "@/components/flexible-table";

interface ConstructionUnitRowProps {
    label: string;
    value: string | undefined;
}

// const SurveyRow: React.FC<ConstructionUnitRowProps> = ({ label, value }) => {
//     return (
//         <TableRow variant={"borderless"}>
//             <TableCell className="p-1 border-0 text-sm text-right">{label}：</TableCell>
//             <TableCell className="border-0 border-b border-dashed border-gray-400 text-center text-sm">
//                 {value ?? "／"}
//             </TableCell>
//         </TableRow>
//     );
// };
// Custom SurveyRow component that works with the FlexibleTable

//默认样式： SSR没法/不用client端的context做的 自由调节各列的宽度 【注意】columnWidths是配合给了上一级Table组件的传递要求。
export function SurveyRow({
                              label,
                              value,
                              columnWidths,
                              ...props
                          }: {
    label: string
    value?: string
    columnWidths?: string[]
    [key: string]: any
}) {
    return (
        <TableRow columnWidths={columnWidths} variant="borderless" {...props}>
             <TableCell className="p-1 border-0 text-sm text-right">{label}：</TableCell>
             <TableCell className="border-0 border-b border-dashed border-gray-400 text-center text-sm">
                 {value ?? "／"}
             </TableCell>
        </TableRow>
    )
}


export default SurveyRow;