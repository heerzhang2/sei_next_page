'use client';

import { useState } from 'react';

export default function PrintLayout() {
    const [textContent, setTextContent] = useState(
        '自然保护是当今世界面临的最重要挑战之一。随着全球人口的增长和工业化进程的加速，人类对自然资源的需求达到了前所未有的水平。森林被大面积砍伐，野生动物栖息地遭到破坏，空气和水污染问题日益严重。\n\n保护自然不仅仅是保存美丽的风景或珍稀物种，它关系到人类的生存基础。森林是地球的肺，吸收二氧化碳并释放氧气；湿地是自然的水过滤系统；海洋调节着全球气候。当这些生态系统遭到破坏时，最终受害的是人类自己。'
    );
    const [imageUrl, setImageUrl] = useState(
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb'
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* 头部 */}
                <header className="text-center py-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                        打印布局优化工具
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        确保文字和图片在单张纸上完美显示，图片在剩余空间居中且保持比例
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 控制面板 */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">内容编辑</h2>

                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2 font-medium">文字内容</label>
                            <textarea
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                                className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="请输入要打印的文字内容..."
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2 font-medium">图片URL</label>
                            <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                                </svg>
                                打印页面
                            </button>

                            <button
                                onClick={() => alert("请按 Ctrl+P 打开打印预览")}
                                className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                                预览打印效果
                            </button>
                        </div>

                        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                            <h3 className="font-medium text-yellow-800 mb-1">打印提示</h3>
                            <p className="text-yellow-700 text-sm">
                                在实际打印前，请使用浏览器的打印预览功能 (Ctrl+P) 确认布局是否符合预期。确保在打印设置中选择了"A4"纸张和"纵向"方向。
                            </p>
                        </div>
                    </div>

                    {/* 预览面板 */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">布局预览</h2>
                        <div className="flex flex-col items-center">
                            <div className="w-full max-w-md h-[28rem] border-2 border-dashed border-blue-300 rounded-xl overflow-hidden flex flex-col bg-gray-50 shadow-inner">
                                <div className="bg-blue-50 p-4 flex-shrink-0">
                                    <h3 className="font-semibold text-blue-800">文档内容</h3>
                                    <p className="text-gray-700 text-sm mt-2 line-clamp-3">
                                        {textContent.substring(0, 150) || '这里是文字预览区域...'}
                                    </p>
                                </div>
                                <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 p-4">
                                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center text-gray-500">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt="预览"
                                                className="max-w-full max-h-full object-contain"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.parentElement.innerHTML = '<span class="text-xs text-center px-2">图片加载失败</span>';
                                                }}
                                            />
                                        ) : (
                                            <span className="text-xs text-center px-2">图片区域</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 mt-4 text-sm">A4纸张比例预览 (210mm × 297mm)</p>
                        </div>

                        <div className="mt-8">
                            <h3 className="font-medium text-gray-800 mb-3">实现原理</h3>
                            <ul className="space-y-2 text-gray-700 text-sm">
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>使用 Flexbox 布局分配文字和图片区域空间</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>图片区域使用 object-contain 保持原始比例</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>通过媒体查询应用打印专用样式</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* 打印区域 - 只在打印时显示 */}
            <div className="hidden print:block print:absolute print:inset-0 print:bg-white">
                <div className="w-[210mm] h-[297mm] mx-auto p-[15mm] flex flex-col">
                    <div className="flex-shrink-0 mb-4">
                        <h2 className="text-2xl font-bold mb-3">关于自然保护的思考</h2>
                        <div className="space-y-3">
                            {textContent.split('\n\n').map((paragraph, index) => (
                                <p key={index} className="text-base leading-relaxed">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>

                    <div className="flex-grow flex items-center justify-center border border-gray-200 bg-gray-50 p-4">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt="打印图片"
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.parentElement.innerHTML = '<div class="text-center text-gray-500"><p>图片加载失败</p><p>请检查图片URL是否正确</p></div>';
                                }}
                            />
                        ) : (
                            <div className="text-center text-gray-500">
                                <p>未提供图片URL</p>
                                <p>请在左侧输入框中添加图片地址</p>
                            </div>
                        )}
                    </div>

                    <footer className="text-center text-xs text-gray-500 mt-4">
                        打印于 {new Date().toLocaleDateString()} | 打印布局优化工具
                    </footer>
                </div>
            </div>

            {/* 打印样式 */}
            <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }
          
          @page {
            size: A4 portrait;
            margin: 0;
          }
          
          .print\:hidden {
            display: none !important;
          }
          
          .print\:block {
            display: block !important;
          }
          
          .print\:absolute {
            position: absolute !important;
          }
          
          .print\:inset-0 {
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
          }
        }
      `}</style>
        </div>
    );
}
