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
                        <img
                            src={"https://images.unsplash.com/photo-1506744038136-46273834b3fb"}
                            alt="打印图片"
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.parentElement.innerHTML = '<div class="text-center text-gray-500"><p>图片加载失败</p><p>请检查图片URL是否正确</p></div>';
                            }}
                        />
                    </div>

                    <footer className="text-center text-xs text-gray-500 mt-4">
                        打印于 {new Date().toLocaleDateString()} | 打印布局优化工具
                    </footer>
                </div>
            </div>

            {/* 打印区域 - 只在打印时显示 */}


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
