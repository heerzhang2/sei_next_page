import React from 'react';
import {FlexibleTable, TableBody, TableCell, TableRow} from "@/components/flexible-table";

interface ConstructionUnitRowProps {
    label: string;
    value: string | undefined;
}
//默认样式：
const SurveyRow: React.FC<ConstructionUnitRowProps> = ({ label, value }) => {
    return (
        <TableRow variant={"borderless"}>
            <TableCell className="p-1 border-0 text-sm text-right">{label}：</TableCell>
            <TableCell className="border-0 border-b border-dashed text-center text-sm">
                {value ?? '／'}
            </TableCell>
        </TableRow>
    );
};

export default SurveyRow;