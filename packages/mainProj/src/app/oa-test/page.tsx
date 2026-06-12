'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

export default function OaTestPage() {
  const [jsessionId, setJsessionId] = useState('');
  const [unid, setUnid] = useState('20260605150416XX7B277DACDDD14B89');
  const [appUnid, setAppUnid] = useState('8729EB30D7607C84CCE4207C07CA4D91');
  const [fileCreator, setFileCreator] = useState('20170831092535XX2210CACB6A7946EE');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [base64, setBase64] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [step, setStep] = useState('all');
  const [lordSent, setLordSent] = useState('也副行长部门');
  const [copySent, setCopySent] = useState('');
  const [knownCreateTime, setKnownCreateTime] = useState('2026-06-05 15:04:16');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 登录
  const [loginUser, setLoginUser] = useState('何尔章');
  const [loginPwd, setLoginPwd] = useState('768768');
  const [siteUnid, setSiteUnid] = useState('20170821141336XX8BB3466351E64742');
  const [logging, setLogging] = useState(false);
  const [fullCookie, setFullCookie] = useState('');

  // 待办列表
  const [todoList, setTodoList] = useState<TodoListData | null>(null);
  const [todoPage, setTodoPage] = useState(1);
  const [loadingTodo, setLoadingTodo] = useState(false);

  // 所选文书详情
  const [selectedDoc, setSelectedDoc] = useState<{
    unid: string;
    title: string;
    actionName: string;
    editType: string;
    agencyUnid?: string;
    itemUnid?: string;
    doctypeValue?: string;
  } | null>(null);
  const [loadingDocInfo, setLoadingDocInfo] = useState(false);

  // 起草正文流程
  const [draftState, setDraftState] = useState<'idle' | 'checking' | 'templates' | 'starting'>('idle');
  const [draftInfo, setDraftInfo] = useState<{ isOpen: boolean; fileUnid: string } | null>(null);
  const [templates, setTemplates] = useState<{ fileUnid: string; name: string }[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleLogin = useCallback(async () => {
    setLogging(true);
    try {
      const res = await fetch(withBasePath('/api/oa-proxy/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: loginUser, password: loginPwd, siteUnid }),
      });
      const data = await res.json();
      if (data.success) {
        setJsessionId(data.data.jsessionId);
        setFullCookie(data.data.fullCookie || `JSESSIONID=${data.data.jsessionId}`);
        toast.success('登录成功');
      } else {
        toast.error(data.error || '登录失败');
      }
    } catch (e: any) {
      toast.error('登录请求异常: ' + e.message);
    } finally {
      setLogging(false);
    }
  }, [loginUser, loginPwd, siteUnid]);

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
        }),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
      if (data.success) toast.success('上传成功');
      else toast.error(data.error || '上传失败');
    } catch (e: any) {
      toast.error('上传异常: ' + e.message);
      setResult(e.message);
    } finally {
      setUploading(false);
    }
  }, [file, base64, jsessionId, fullCookie, unid, appUnid, fileCreator, title, lordSent, copySent, knownCreateTime, step]);

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
          editType: data.data.editType,
          agencyUnid: data.data.agencyUnid || '',
          itemUnid: data.data.itemUnid || '',
          doctypeValue: data.data.doctypeValue || '2',
        });
        // 自动填入上传区
        setUnid(item.UNID);
        setTitle(item.DTITLE);
        toast.info(`已选择: ${item.DTITLE}`);
      } else {
        toast.error(data.error || '获取文书信息失败');
      }
    } catch (e: any) {
      toast.error('请求异常: ' + e.message);
    } finally {
      setLoadingDocInfo(false);
    }
  }, [jsessionId]);

  // ========== 起草正文 ==========
  const handleDraft = useCallback(async () => {
    if (!selectedDoc || !jsessionId) return;

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
  }, [selectedDoc, jsessionId]);

  /** 将 base64 转为 .doc 文件并触发浏览器下载 */
  const downloadBase64AsDoc = useCallback((base64: string, filename: string) => {
    try {
      const byteStr = atob(base64);
      const bytes = new Uint8Array(byteStr.length);
      for (let i = 0; i < byteStr.length; i++) bytes[i] = byteStr.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
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
        setBase64(data.data.templateBase64);
        const fileName = `${selectedDoc?.title || unid}.doc`;
        downloadBase64AsDoc(data.data.templateBase64, fileName);
        toast.success(`已下载模板文件 (${data.data.templateSize} 字节)，请用 Word 编辑后上传`);
      } else {
        toast.success('已准备起草，请上传文件');
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
      </h1>

      {/* 登录区 */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">登录</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div><Label>用户名</Label><Input value={loginUser} onChange={e => setLoginUser(e.target.value)} /></div>
            <div><Label>密码</Label><Input type="password" value={loginPwd} onChange={e => setLoginPwd(e.target.value)} /></div>
            <div><Label>siteUnid</Label><Input value={siteUnid} onChange={e => setSiteUnid(e.target.value)} /></div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleLogin} disabled={logging}>
              {logging ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              登录
            </Button>
            {jsessionId && (
              <span className="text-xs text-green-600 font-mono">JSESSIONID: {jsessionId}</span>
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
                <p className="text-sm text-muted-foreground">
                  unid: {selectedDoc.unid} | 类型: {selectedDoc.editType}
                </p>
              </div>
              <Button size="lg" className="gap-2"
                onClick={handleDraft}
                disabled={draftState !== 'idle'}>
                {draftState === 'checking' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                 draftState === 'starting' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                 <FileText className="w-4 h-4" />}
                {draftState === 'checking' ? '检查中...' :
                 draftState === 'starting' ? '准备中...' :
                 selectedDoc.actionName || '处理'}
              </Button>
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

      {/* 上传区 */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">上传文书</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>unid</Label><Input value={unid} onChange={e => setUnid(e.target.value)} /></div>
            <div><Label>app_unid</Label><Input value={appUnid} onChange={e => setAppUnid(e.target.value)} /></div>
            <div><Label>file_creator</Label><Input value={fileCreator} onChange={e => setFileCreator(e.target.value)} /></div>
            <div><Label>文件标题</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div><Label>主办部门</Label><Input value={lordSent} onChange={e => setLordSent(e.target.value)} /></div>
            <div><Label>抄送部门</Label><Input value={copySent} onChange={e => setCopySent(e.target.value)} /></div>
            <div><Label>原始 create_time</Label><Input value={knownCreateTime} onChange={e => setKnownCreateTime(e.target.value)} /></div>
          </div>

          <div>
            <Label>选择 .doc / .docx 文件</Label>
            <div className="flex items-center gap-3 mt-1">
              <input ref={fileInputRef} type="file" accept=".doc,.docx" className="hidden" onChange={handleFileChange} />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />选择文件
              </Button>
              {file && <span className="text-sm text-muted-foreground">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>}
            </div>
          </div>

          {base64 && <div><Label>Base64 长度</Label><p className="text-xs text-muted-foreground font-mono">{base64.length} 字符</p></div>}

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

          <Button onClick={handleUpload} disabled={uploading || !file || !jsessionId}>
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            {uploading ? '上传中...' : '上传到旧 OA'}
          </Button>

          {result && (
            <div>
              <Label>响应结果</Label>
              <Textarea value={result} readOnly className="font-mono text-xs h-40 mt-1" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
