/**
 * 通用型 {制作 报告的} 可适应 大屏 手机小屏幕的 二维表格数据编辑录入。
 * 注意固定长布局 l3: 参数设置：最大设置为手机的竖屏的极限宽度360px，超过了不正常。"D:/file/dsfsdfxqe4qwe说的很对cvxcv3xcvsdf.docx"就超过了；
 * 【局限与选择】固定长布局不适合小屏幕竖屏的+超长的字段内容需显示的场景，要切换弹性布局来显示。
 * 若配置刚刚加上了 input_render_cb 字段，效果可能需要重启前端才能正常？展示。
 *@param  n1 参数是标题名；
 * f2 参数是=存储字段；
 * l3： 安排的px宽度 允许超过手机宽度如=430。
 * input_render_cb 当前单独一个字段的编辑器重新自己定义。
 * */
export type Each_ZdSetting = [
    n1: string,      //字段标题名
    f2: string,      //数据库标签
    l3: number,      //定长布局的像素宽度
    extend?: any,       //扩充配置解析对象： 编辑器的: { t:编辑框类别, u:单位, l：预定的列表数组, s输入框行大小 }}
    //input_render_cb?: InputRenderCallback | undefined,       //旧版本的:编辑回调: 编辑器特殊性要求，高阶函数。 useform版本用对象配置解析替代; editAs整体替代？？
    //只能支持1层的嵌套对象： 对于Row.{m. sgm {name,username}}无法支持的。
    park?: string,       //对于比如svp{},pa{}的嵌套字段的编辑直接支持，直接保存为嵌套的对象字段；
];

