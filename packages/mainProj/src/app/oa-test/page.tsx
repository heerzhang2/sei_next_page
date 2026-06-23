'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Upload, FileText, Send, Loader2, List, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useRef } from 'react';
import { withBasePath } from '@/lib/tool';

interface TodoItem {
  BDUNID: string;
  UNID: string;
  DTITLE: string;
  MODULE_NAME: string;
  RECEIVED_TIME: string;
  FLOW_SORT: string;
  USER_NAME?: string;
  CREATE_TIME?: string;
  URL_PATH?: string;
}

interface TodoListData {
  total: number;
  allPage: number;
  nowPage: number;
  items: TodoItem[];
}

// 与 /report/third-party-login 同源，Chrome 会混用密码（按 origin+用户名去重）。
// 追加后缀让浏览器视作不同账户分开保存，提交前去掉后缀。
const LEGACY_USERNAME_SUFFIX = '@旧OA';
function stripLegacySuffix(value: string): string {
  return value.endsWith(LEGACY_USERNAME_SUFFIX)
    ? value.slice(0, -LEGACY_USERNAME_SUFFIX.length)
    : value;
}

export default function OaTestPage() {
  const [jsessionId, setJsessionId] = useState('');
  const [unid, setUnid] = useState('20260605150416XX7B277DACDDD14B89');
  const [appUnid, setAppUnid] = useState('8729EB30D7607C84CCE4207C07CA4D91');
  const [fileCreator, setFileCreator] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [base64, setBase64] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [step, setStep] = useState('all');
  const [lordSent, setLordSent] = useState('');
  const [copySent, setCopySent] = useState('');
  const [knownCreateTime, setKnownCreateTime] = useState('2026-06-05 15:04:16');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  // 登录
  const [loginUser, setLoginUser] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [siteUnid, setSiteUnid] = useState('20170821141336XX8BB3466351E64742');
  const [logging, setLogging] = useState(false);
  const [fullCookie, setFullCookie] = useState('');
  const [showJsessionId, setShowJsessionId] = useState(false);

  // 待办列表
  const [todoList, setTodoList] = useState<TodoListData | null>(null);
  const [todoPage, setTodoPage] = useState(1);
  const [loadingTodo, setLoadingTodo] = useState(false);

  // 所选文书详情
  const [selectedDoc, setSelectedDoc] = useState<{
    unid: string;
    title: string;
    actionName: string;
    actionType: string;
    editType: string;
    viewOaUrl?: string;
    agencyUnid?: string;
    itemUnid?: string;
    doctypeValue?: string;
    isDraft?: string;
    fileUnids?: string;
    appUnid?: string;
    fileCreator?: string;
    createTime?: string;
  } | null>(null);
  const [loadingDocInfo, setLoadingDocInfo] = useState(false);

  // 起草正文流程
  const [draftState, setDraftState] = useState<'idle' | 'checking' | 'templates' | 'starting' | 'downloading'>('idle');
  const [draftInfo, setDraftInfo] = useState<{ isOpen: boolean; fileUnid: string } | null>(null);
  const [templates, setTemplates] = useState<{ fileUnid: string; name: string }[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // 文档操作模式：addNew=起草新建, updateNew=批阅修改
  const [docFnMode, setDocFnMode] = useState<'addNew' | 'updateNew'>('updateNew');
  // 起草正文时选择的模板 fileUnid（上传时需要传递给 save-doc 做 OCX 初始化）
  const [templateFileUnid, setTemplateFileUnid] = useState('');
  // 批阅正文时是否重新替换书签
  const [replaceBookmarks, setReplaceBookmarks] = useState(false);

  /** 通过 Web Credential API 通知 Chrome 保存凭据（带后缀，与主登录区分） */
  const saveCredentialToChrome = useCallback(async (username: string, password: string) => {
    try {
      if (typeof PasswordCredential !== 'undefined') {
        const cred = new PasswordCredential({
          id: username,
          password,
        });
        await navigator.credentials.store(cred);
      }
    } catch { /* Chrome 可能不支持，忽略 */ }
  }, []);

  const handleLogin = useCallback(async () => {
    setLogging(true);
    try {
      const suffixedUser = stripLegacySuffix(loginUser) + LEGACY_USERNAME_SUFFIX;
      const res = await fetch(withBasePath('/api/oa-proxy/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: suffixedUser,
          password: loginPwd,
          siteUnid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setJsessionId(data.data.jsessionId);
        setFullCookie(data.data.fullCookie || `JSESSIONID=${data.data.jsessionId}`);
        // 登录成功后通知 Chrome 保存带后缀的凭据
        await saveCredentialToChrome(suffixedUser, loginPwd);
        toast.success('登录成功');
      } else {
        toast.error(data.error || '登录失败');
      }
    } catch (e: any) {
      toast.error('登录请求异常: ' + e.message);
    } finally {
      setLogging(false);
    }
  }, [loginUser, loginPwd, siteUnid, saveCredentialToChrome]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setTitle(f.name.replace(/\.[^.]+$/, ''));
    const buffer = await f.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    setBase64(btoa(binary));
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file || !base64) { toast.error('请先选择文件'); return; }
    if (!jsessionId) { toast.error('请先登录'); return; }
    setUploading(true);
    setResult('');
    try {
      const res = await fetch(withBasePath('/api/oa-proxy/save-doc'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsessionId, fullCookie, unid, app_unid: appUnid,
          file_name: file.name, file_type: 'doc_fw', file_creator: fileCreator,
          fileBuffer: base64, title, lord_sent: lordSent, copy_sent: copySent,
          known_create_time: knownCreateTime, step,
          fn: docFnMode,
          fileUnid: templateFileUnid,
        }),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
      if (data.success) {
        toast.success('上传成功，请重新选择文件（文件已自动清空）');
        // 上传成功后清空文件选择，防止下一次使用旧内容
        setFile(null);
        setBase64('');
        setTitle('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        toast.error(data.error || '上传失败');
      }
    } catch (e: any) {
      toast.error('上传异常: ' + e.message);
      setResult(e.message);
    } finally {
      setUploading(false);
    }
  }, [file, base64, jsessionId, fullCookie, unid, appUnid, fileCreator, title, lordSent, copySent, knownCreateTime, step, docFnMode, templateFileUnid]);

  // ========== 待办文件列表 ==========
  const fetchTodoList = useCallback(async (page: number) => {
    if (!jsessionId) { toast.error('请先登录'); return; }
    setLoadingTodo(true);
    try {
      const res = await fetch(
        withBasePath(`/api/oa-proxy/todo-list?page=${page}&perPage=5&jsessionId=${jsessionId}`),
        { headers: { 'Content-Type': 'application/json' } },
      );
      const data = await res.json();
      if (data.success) {
        setTodoList(data.data);
        setTodoPage(page);
      } else {
        toast.error(data.error || '获取待办列表失败');
      }
    } catch (e: any) {
      toast.error('请求异常: ' + e.message);
    } finally {
      setLoadingTodo(false);
    }
  }, [fullCookie]);

  // ========== 获取文书详情 ==========
  const handleSelectDoc = useCallback(async (item: TodoItem) => {
    if (!jsessionId) { toast.error('请先登录'); return; }
    setLoadingDocInfo(true);
    setSelectedDoc(null);
    try {
      const res = await fetch(
        withBasePath(`/api/oa-proxy/doc-info?unid=${item.UNID}&jsessionId=${jsessionId}`),
        { headers: { 'Content-Type': 'application/json' } },
      );
      const data = await res.json();
      if (data.success) {
        setSelectedDoc({
          unid: item.UNID,
          title: item.DTITLE,
          actionName: data.data.actionName,
          actionType: data.data.actionType || 'view_oa',
          editType: data.data.editType,
          viewOaUrl: data.data.viewOaUrl || '',
          agencyUnid: data.data.agencyUnid || '',
          itemUnid: data.data.itemUnid || '',
          doctypeValue: data.data.doctypeValue || '2',
          isDraft: data.data.isDraft || '',
          fileUnids: data.data.fileUnids || '',
          appUnid: data.data.appUnid || '',
          fileCreator: data.data.fileCreator || '',
          createTime: data.data.createTime || '',
        });
        // 自动填入上传区
        setUnid(item.UNID);
        setTitle(item.DTITLE);
        // 自动填入 doc-info 返回的字段
        if (data.data.appUnid) setAppUnid(data.data.appUnid);
        if (data.data.fileCreator) setFileCreator(data.data.fileCreator);
        if (data.data.createTime) setKnownCreateTime(data.data.createTime);
        if (data.data.lordSent) setLordSent(data.data.lordSent);
        if (data.data.copySent) setCopySent(data.data.copySent);
        toast.info(`已选择: ${item.DTITLE}（${data.data.actionName}）`);
      } else {
        toast.error(data.error || '获取文书信息失败');
      }
    } catch (e: any) {
      toast.error('请求异常: ' + e.message);
    } finally {
      setLoadingDocInfo(false);
    }
  }, [jsessionId]);

  // ========== 批阅正文 / 起草正文 ==========
  const handleDraft = useCallback(async () => {
    if (!selectedDoc || !jsessionId) return;

    // ---- 批阅正文：直接下载已有文件 ----
      if (selectedDoc.actionName === '批阅正文') {
      setDraftState('downloading');
      try {
        const res = await fetch(withBasePath('/api/oa-proxy/piyue'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            unid: selectedDoc.unid,
            jsessionId,
            fullCookie,
            file_type: 'doc_fw',
            replaceBookmarks,
          }),
        });
        const data = await res.json();
        if (data.success) {
          const { fileBase64, fileSize, fileName, createTime, lordSent, copySent, title, appUnid, fileCreator, bookmarkValues, fillResult, originalFileBase64 } = data.data;
          setDocFnMode('updateNew');
          // 填入上传区
          setBase64(fileBase64);
          setTitle(title || selectedDoc.title);
          if (createTime) setKnownCreateTime(createTime);
          if (lordSent) setLordSent(lordSent);
          if (copySent) setCopySent(copySent);
          if (appUnid) setAppUnid(appUnid);
          if (fileCreator) setFileCreator(fileCreator);
          // 触发下载（已填充书签的版本）
          const format: 'doc' | 'docx' = fileName.endsWith('.docx') ? 'docx' : 'doc';
          downloadBase64AsDoc(fileBase64, fileName.replace(/\.[^.]+$/, ''), format);
          // 如果有备份文件，也提供下载
          if (originalFileBase64) {
            downloadBase64AsDoc(originalFileBase64, (fileName.replace(/\.[^.]+$/, '') + '-原文件备份'), format);
          }
          let msg = `已下载批阅文件 (${(fileSize / 1024).toFixed(1)} KB)`;
          if (fillResult) {
            if (fillResult.ok) {
              const missing = fillResult.missing || [];
              if (missing.length > 0) {
                msg += `，书签已替换，未找到: ${missing.join('、')}`;
              } else {
                msg += `，书签已替换`;
              }
              if (originalFileBase64) {
                msg += `（原文件已备份为 xxx-原文件备份）`;
              }
            } else {
              msg += `，书签替换失败: ${fillResult.error}`;
            }
          }
          toast.success(msg);
        } else {
          toast.error(data.error || '批阅正文下载失败');
        }
      } catch (e: any) {
        toast.error('批阅异常: ' + e.message);
      } finally {
        setDraftState('idle');
      }
      return;
    }

    // ---- 起草正文：选择模板 → 填充书签 → 下载 ----
    setDraftState('checking');
    setTemplates([]);
    setSelectedTemplate('');

    try {
      // Step 1: 检查模板
      const checkRes = await fetch(withBasePath('/api/oa-proxy/draft'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'check', unid: selectedDoc.unid, jsessionId,
          agency_unid: selectedDoc.agencyUnid || '',
          doctype_value: selectedDoc.doctypeValue || '2',
          itemUnid: selectedDoc.itemUnid || '',
        }),
      });
      const checkData = await checkRes.json();
      if (!checkData.success) {
        toast.error('检查模板失败'); setDraftState('idle'); return;
      }

      setDraftInfo({ isOpen: checkData.data.isOpen, fileUnid: checkData.data.fileUnid });

      // 如果需要选择模板，获取模板列表
      if (checkData.data.needTemplate) {
        const tmplRes = await fetch(withBasePath('/api/oa-proxy/draft'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: 'templates', unid: selectedDoc.unid, jsessionId,
            agency_unid: selectedDoc.agencyUnid || '',
            docFileType: 'doc_fw',
          }),
        });
        const tmplData = await tmplRes.json();
        if (tmplData.success && tmplData.data.templates.length > 0) {
          setTemplates(tmplData.data.templates);
          setDraftState('templates');
          return;
        }
      }

      // 不需要模板或模板列表为空 → 直接启动
      await startDraft(selectedDoc.unid, checkData.data.fileUnid);
    } catch (e: any) {
      toast.error('起草异常: ' + e.message);
      setDraftState('idle');
    }
  }, [selectedDoc, jsessionId, fullCookie, replaceBookmarks]);

  /** 将 base64 转为 Word 文件并触发浏览器下载（支持 .docx / .doc） */
  const downloadBase64AsDoc = useCallback((base64: string, filename: string, format: 'docx' | 'doc' = 'docx') => {
    try {
      const byteStr = atob(base64);
      const bytes = new Uint8Array(byteStr.length);
      for (let i = 0; i < byteStr.length; i++) bytes[i] = byteStr.charCodeAt(i);
      const mime = format === 'docx'
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/msword';
      const blob = new Blob([bytes], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = `.${format}`;
      a.download = filename.endsWith(ext) ? filename : `${filename}${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) {
      console.error('下载文件失败', e);
    }
  }, []);

  const startDraft = useCallback(async (unid: string, fileUnid: string) => {
    setDraftState('starting');
    try {
      const res = await fetch(withBasePath('/api/oa-proxy/draft'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'start', unid, jsessionId, fileUnid: fileUnid || '' }),
      });
      const data = await res.json();
      if (data.success && data.data.templateBase64) {
        setDocFnMode('addNew');
        setTemplateFileUnid(fileUnid);
        setBase64(data.data.templateBase64);
        const format: 'docx' | 'doc' = data.data.outputFormat === 'doc' ? 'doc' : 'docx';
        const fileName = `${selectedDoc?.title || unid}`;
        downloadBase64AsDoc(data.data.templateBase64, fileName, format);
        const missing: string[] = data.data.templateMissing || [];
        if (missing.length > 0) {
          toast.warning(`已下载文件，但有未填充的占位符: ${missing.join('、')}`);
        } else {
          toast.success(`已下载模板文件 (${data.data.templateSize} 字节)，请用 Word 编辑后上传`);
        }
      } else {
        toast.error(data.error || '起草失败，未生成文件');
      }
    } catch (e: any) {
      toast.error('启动起草异常: ' + e.message);
    } finally {
      setDraftState('idle');
      setDraftState('idle');
    }
  }, [downloadBase64AsDoc, jsessionId, selectedDoc]);

  // 确认选择模板
  const handleConfirmTemplate = useCallback(async () => {
    if (!selectedTemplate || !selectedDoc) return;
    await startDraft(selectedDoc.unid, selectedTemplate);
    setDraftState('idle');
  }, [selectedTemplate, selectedDoc, startDraft, downloadBase64AsDoc]);

  // 登录后自动加载待办列表
  useEffect(() => {
    if (fullCookie) fetchTodoList(1);
  }, [fullCookie, fetchTodoList]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <FileText className="w-6 h-6" />
        旧 OA 代理
        <a href="http://27.151.117.66:8866/foa/" target="_blank" rel="noopener noreferrer"
          className="text-sm font-normal text-blue-600 hover:text-blue-800 underline ml-auto">
          跳转 OA 旧平台 ↗
        </a>
      </h1>

      {/* 登录区 */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">登录</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>用户名</Label>
              <Input ref={usernameRef}
                id="oa-username" name="oa-username"
                autoComplete="username"
                defaultValue=""
                onChange={(e) => {
                  const raw = stripLegacySuffix(e.target.value);
                  if (raw !== e.target.value && usernameRef.current) {
                    usernameRef.current.value = raw;
                  }
                  setLoginUser(raw);
                }}
                placeholder="请输入用户名" />
            </div>
            <div><Label>密码</Label><Input type="password" value={loginPwd} onChange={e => setLoginPwd(e.target.value)} /></div>
            <div>
              <Label>所属单位</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={siteUnid} onChange={e => setSiteUnid(e.target.value)}>
                <option value="20170821141336XX8BB3466351E64742">福建省特种设备检验研究院</option>
                <option value="20170906093253XX7656559E5D8A41AB">福建省特种设备检验研究院宁德分院</option>
                <option value="20170906093405XX98D16B0894504748">福建省特种设备检验研究院漳州分院</option>
                <option value="20170906093454XX789EC6F41133417B">福建省特种设备检验研究院泉州分院</option>
                <option value="20170906093535XXC11C07C83C2D42AD">福建省特种设备检验研究院三明分院</option>
                <option value="20170906093617XX99FB81D9A5DD41D8">福建省特种设备检验研究院龙岩分院</option>
                <option value="20170906093659XXCE7E7FB27710483C">福建省特种设备检验研究院莆田分院</option>
                <option value="20170906093736XXB93635FECCAE40E8">福建省特种设备检验研究院南平分院</option>
                <option value="20180118115337XXB8D151C7F06A4B6D">福建省特种设备检验研究院鑫奥特纳科技公司</option>
                <option value="20180122145231XX2AF40542544B44DF">福建省特安安全技术服务中心有限公司</option>
                <option value="20180123205044XX98C05A5A1C384EC8">福建省劳安设备技术开发有限公司</option>
                <option value="20180326150555XX78ACCFA6E47E4438">全国特种作业机器人标准化工作组</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleLogin} disabled={logging}>
              {logging ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              登录
            </Button>
            {jsessionId && (
              <>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-6 px-2"
                  onClick={() => setShowJsessionId(!showJsessionId)}>
                  {showJsessionId ? '隐藏' : '显示'} JSESSIONID
                </Button>
                {showJsessionId && (
                  <span className="text-xs text-green-600 font-mono">{jsessionId}</span>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* 待办文件列表 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2"><List className="w-4 h-4" />待办文件列表</span>
            <Button variant="outline" size="sm" onClick={() => fetchTodoList(1)} disabled={loadingTodo || !fullCookie}>
              <Loader2 className={`w-3 h-3 mr-1 ${loadingTodo ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!fullCookie ? (
            <p className="text-sm text-muted-foreground">请先登录</p>
          ) : loadingTodo && !todoList ? (
            <p className="text-sm text-muted-foreground">加载中...</p>
          ) : todoList && todoList.items.length > 0 ? (
            <>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 w-10">#</th>
                      <th className="text-left p-2">文件标题</th>
                      <th className="text-left p-2 w-24">所属模块</th>
                      <th className="text-left p-2 w-20">流程类别</th>
                      <th className="text-left p-2 w-28">接收日期</th>
                      <th className="text-left p-2 w-10">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todoList.items.map((item, idx) => (
                      <tr key={item.BDUNID} className="border-t hover:bg-muted/30">
                        <td className="p-2 text-muted-foreground">{(todoPage - 1) * 5 + idx + 1}</td>
                        <td className="p-2 font-medium">{item.DTITLE}</td>
                        <td className="p-2">{item.MODULE_NAME}</td>
                        <td className="p-2">{item.FLOW_SORT}</td>
                        <td className="p-2">{item.RECEIVED_TIME}</td>
                        <td className="p-2">
                          <Button variant="ghost" size="sm" disabled={loadingDocInfo}
                            onClick={() => handleSelectDoc(item)}>
                            {loadingDocInfo ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="text-muted-foreground">
                  共 {todoList.total} 条记录，第 {todoPage}/{todoList.allPage} 页
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm"
                    disabled={todoPage <= 1}
                    onClick={() => fetchTodoList(todoPage - 1)}>
                    <ChevronLeft className="w-3 h-3" /> 上一页
                  </Button>
                  <Button variant="outline" size="sm"
                    disabled={todoPage >= todoList.allPage}
                    onClick={() => fetchTodoList(todoPage + 1)}>
                    下一页 <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">没有待办文件</p>
          )}
        </CardContent>
      </Card>

      {/* 当前文书操作 */}
      {selectedDoc && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2"><FileText className="w-4 h-4" />当前文书</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">{selectedDoc.title}</p>
              </div>
              <div className="flex items-center gap-3">
                {selectedDoc.actionType === 'view_oa' && selectedDoc.viewOaUrl && (
                  <div className="flex items-center gap-3">
                    <a href={selectedDoc.viewOaUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-md shadow-md">
                      <FileText className="w-5 h-5" />
                      查看↗
                    </a>
                    <span className="text-xs text-muted-foreground">必须先到OA平台登录才能正常查看</span>
                  </div>
                )}
                {(selectedDoc.actionType === 'piyue' || selectedDoc.actionType === 'qicao') && (
                  <>
                    {selectedDoc.actionName === '批阅正文' && (
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                        <input type="checkbox" checked={replaceBookmarks}
                          onChange={e => setReplaceBookmarks(e.target.checked)}
                          className="w-4 h-4" />
                        替换书签取值
                      </label>
                    )}
                    <Button size="lg" className="gap-2"
                      onClick={handleDraft}
                      disabled={draftState !== 'idle'}>
                      {draftState === 'checking' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                       draftState === 'starting' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                       draftState === 'downloading' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                       <FileText className="w-4 h-4" />}
                      {draftState === 'checking' ? '检查中...' :
                       draftState === 'starting' ? '准备中...' :
                       draftState === 'downloading' ? '下载中...' :
                       selectedDoc.actionName || '处理'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 模板选择对话框 */}
      {draftState === 'templates' && templates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">选择正文模板</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {templates.map((t, i) => (
                <label key={t.fileUnid}
                  className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedTemplate === t.fileUnid ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}>
                  <input type="radio" name="template"
                    value={t.fileUnid}
                    checked={selectedTemplate === t.fileUnid}
                    onChange={() => setSelectedTemplate(t.fileUnid)}
                    className="w-4 h-4" />
                  <span className="text-sm">{t.name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConfirmTemplate} disabled={!selectedTemplate}>
                确认选择
              </Button>
              <Button variant="outline" onClick={() => setDraftState('idle')}>
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* 说明提示 */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-sm text-yellow-800">
        <p className="font-medium mb-1">提示：</p>
        <p>若想新起草正文的，请首先回到 OA 旧平台的发文管理页面 &gt; 点发文拟稿按钮，初始化关键元数据，然后保存之后回到这里</p>
      </div>

      {/* 上传区 */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">上传文书</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>文件标题</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div><Label>主办部门</Label><Input value={lordSent} onChange={e => setLordSent(e.target.value)} /></div>
            <div><Label>抄送部门</Label><Input value={copySent} onChange={e => setCopySent(e.target.value)} /></div>
          </div>

          <div className="border-2 border-orange-300 rounded-lg p-4 bg-orange-50/50">
            <Label className="text-base font-bold text-orange-700">选择 .doc / .docx 文件</Label>
            <div className="flex items-center gap-3 mt-2">
              <input ref={fileInputRef} type="file" accept=".doc,.docx" className="hidden" onChange={handleFileChange} />
              <Button variant="outline" className="border-orange-400 text-orange-700 hover:bg-orange-100" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />选择文件
              </Button>
              {file && <span className="text-sm text-muted-foreground">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>}
            </div>
          </div>

          <div>
            <Label>执行步骤</Label>
            <div className="flex gap-2 mt-1">
              {[
                { value: 'all', label: '全部三步' },
                { value: 'upload', label: '仅上传文件' },
                { value: 'meta', label: '仅更新元数据' },
                { value: 'pdf', label: '仅转PDF+上传' },
              ].map(opt => (
                <Button key={opt.value} variant={step === opt.value ? 'default' : 'outline'} size="sm"
                  onClick={() => setStep(opt.value)}>
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={handleUpload} disabled={uploading || !file || !jsessionId}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3 px-8">
            {uploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
            {uploading ? '上传中...' : '上传到旧OA平台'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
