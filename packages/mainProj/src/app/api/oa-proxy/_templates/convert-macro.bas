Attribute VB_Name = "ConvertModule"
' =====================================================================
' OA .doc 模板 -> .docx 预转换宏
'
' 作用：把每个 .doc 模板里的书签，原位替换成占位符文本 {书签名}，
'       然后另存为 .docx。运行时由 docxtemplater 做无损填充。
'
' 关键：用 Bookmark.Range.Text = "{名字}" 直接替换书签区间内容，
'       Word 会保留该位置原有的字符/段落格式，因此占位符继承原书签
'       位置的样式，最终填充后格式与原模板完全一致。
'
' 用法：
'   1. Word -> Alt+F11 -> 文件 > 导入文件，选择本 .bas
'   2. 修改下面的 srcFolder / dstFolder 路径
'   3. F5 运行 ConvertAllDocToDocx
' =====================================================================

Option Explicit

' ====== 按实际路径修改 ======
Const srcFolder As String = "C:\oa-templates\src\"   ' 原始 .doc 所在目录（末尾带反斜杠）
Const dstFolder As String = "C:\oa-templates\docx\"  ' 输出 .docx 目录（末尾带反斜杠）
' 占位符分隔符：默认单花括号 {名字}。若改用 {{名字}}，把下面两个常量改掉，
' 同时把 fill-docx.ts 的 delimiters 改成 {{ }}
Const TOKEN_OPEN As String = "{"
Const TOKEN_CLOSE As String = "}"
' ============================

Sub ConvertAllDocToDocx()
    Dim fileName As String
    Dim doc As Document
    Dim count As Integer
    count = 0

    ' 确保输出目录存在
    If Dir(dstFolder, vbDirectory) = "" Then
        MkDir dstFolder
    End If

    Application.ScreenUpdating = False
    Application.DisplayAlerts = wdAlertsNone

    fileName = Dir(srcFolder & "*.doc")
    Do While fileName <> ""
        ' 跳过已经是 .docx 的（Dir 的 *.doc 也会匹配 .docx）
        If LCase(Right(fileName, 5)) <> ".docx" Then
            Set doc = Documents.Open(srcFolder & fileName, ReadOnly:=False)

            ReplaceBookmarksWithTokens doc

            ' 另存为 .docx（同名，扩展名换成 .docx）
            Dim outName As String
            outName = dstFolder & Left(fileName, InStrRev(fileName, ".") - 1) & ".docx"
            doc.SaveAs2 fileName:=outName, FileFormat:=wdFormatXMLDocument
            doc.Close SaveChanges:=False

            count = count + 1
            Debug.Print "已转换: " & fileName & " -> " & outName
        End If
        fileName = Dir()
    Loop

    Application.DisplayAlerts = wdAlertsAll
    Application.ScreenUpdating = True

    MsgBox "完成，共转换 " & count & " 个模板。", vbInformation
End Sub

' 把文档里所有书签替换成占位符文本 {书签名}，并保留书签本身（重新标记）
Sub ReplaceBookmarksWithTokens(doc As Document)
    Dim i As Integer
    Dim bmName As String
    Dim bmRange As Range

    ' 注意：替换书签内容会使集合变动，先把名字收集起来再逐个处理
    Dim names() As String
    Dim n As Integer
    n = doc.Bookmarks.count
    If n = 0 Then Exit Sub
    ReDim names(1 To n)
    For i = 1 To n
        names(i) = doc.Bookmarks(i).Name
    Next i

    For i = 1 To n
        bmName = names(i)
        ' 跳过 Word 自动生成的隐藏书签（以下划线开头，如 _Toc / _GoBack）
        If Left(bmName, 1) <> "_" Then
            If doc.Bookmarks.Exists(bmName) Then
                Set bmRange = doc.Bookmarks(bmName).Range
                ' 直接写入占位符文本：保留该区间的字符格式
                bmRange.Text = TOKEN_OPEN & bmName & TOKEN_CLOSE
                ' 重新把书签标记到新内容上（可选，保留书签结构）
                doc.Bookmarks.Add Name:=bmName, Range:=bmRange
            End If
        End If
    Next i
End Sub
