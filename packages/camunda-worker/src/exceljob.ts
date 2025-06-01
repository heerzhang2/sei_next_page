import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

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
        // @ts-ignore
        const filteredData = jsonArray.filter(row =>
            row.squm!=='建筑面积(m²)'
        );

        // 写入JSON文件
        fs.writeFileSync('output.json', JSON.stringify(filteredData, null, 2), 'utf8');
        console.log('转换成功！JSON文件已生成：output.json');

    } catch (error) {
        console.error('转换过程中发生错误:', error.message);
        if(error.code === 'ENOENT') {
            console.error('请检查输入文件路径是否正确！');
        }
    }
}


%JAVACMD% %JAVA_OPTS% -XX:+ExitOnOutOfMemoryError -Dfile.encoding=UTF-8 -Xshare:auto -classpath %CLASSPATH% -Dapp.name="broker" -Dapp.repo="%REPO%" -Dapp.home="%BASEDIR%" -Dbasedir="%BASEDIR%" io.camunda.application.StandaloneBroker %CMD_LINE_ARGS%
if %ERRORLEVEL% NEQ 0 goto error


%JAVACMD% %JAVA_OPTS% -XX:+ExitOnOutOfMemoryError -Dfile.encoding=UTF-8 -Xshare:auto -classpath %CLASSPATH% -Dapp.name="camunda" -Dapp.repo="%REPO%" -Dapp.home="%BASEDIR%" -Dbasedir="%BASEDIR%" io.camunda.application.StandaloneCamunda %CMD_LINE_ARGS%
if %ERRORLEVEL% NEQ 0 goto error
goto end