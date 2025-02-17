import * as React from "react";


/**正常的编辑器和保存功能按钮都能放在同一个组件内部实现是最简单的办法。
 * 但经常会有这个需求：编辑器需要和触发保存功能的按钮分离到不同组件，编辑器是独立子组件，保存按钮却是挪到了父辈一级的组件中。
 各个编辑器子组件暴露给父组件的接口数据，保存按钮需要调用doConfirm收集变更数据。
 该模式实际相当于“子组件利用useImperativeHandle配套forwardRef机制把数据回传给父组件”的哪一种模式，差不多的，只是我这个是自己定义的ref参数名editorRef。
 我感觉自己定义一个editorRef做法更容易用啊，就是不同于forwardRef的一点是forwardRef组件的ref可以根本就没有，也就是对应的editorRef传入参数完全可以是null没有的，
 所以这两个模式做法：对整个组件的语意上的定义完全不同。
 */
export interface InternalEditorResult {
    //上级组件保存按钮触发时调用; 相当于收集已被修改的各字段数据。
    doConfirm: ()=>{};
}


