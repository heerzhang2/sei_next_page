import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

//测试例子: excel 转换成 json:
export  function excelToJsonConverter() {
    try {
        // 读取Excel文件（支持.xlsx和.xls格式）
        const workbook = XLSX.readFile(path.join(__dirname, 'input.xls'));

        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 转换为JSON数组，保持原始行顺序
        const jsonArray = XLSX.utils.sheet_to_json(worksheet, {
            header: ['site', 'squm',  't', 'men'], // 指定列顺序
            raw: false, // 保持数值类型
            defval: null // 空单元格处理
        });

        // 过滤空行（可选）
        const filteredData = jsonArray.filter((row: any) =>
            row.squm!=='建筑面积(m²)'
        );

        // 写入JSON文件
        fs.writeFileSync('output.json', JSON.stringify(filteredData, null, 2), 'utf8');
        console.log('转换成功！JSON文件已生成：output.json');

    } catch (error) {
        // @ts-ignore
        console.error('转换过程中发生错误:', error.message);
        // @ts-ignore
        if(error.code === 'ENOENT') {
            console.error('请检查输入文件路径是否正确！');
        }
    }
}
