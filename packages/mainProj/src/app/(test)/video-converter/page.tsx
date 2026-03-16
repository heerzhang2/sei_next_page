'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import VideoConverter from '@/components/VideoConverter'

export default function VideoConverterPage() {
  const [convertedFiles, setConvertedFiles] = useState<Array<{original: File, converted: File}>>([])

  const handleConversionComplete = (convertedFile: File, originalFile: File) => {
    console.log('转换完成:', originalFile.name, '->', convertedFile.name)
    setConvertedFiles(prev => [...prev, { original, converted: convertedFile }])
    
    toast.success('转换完成', {
      description: `${originalFile.name} 已成功转换为 ${convertedFile.name}`
    })
    
    // 自动下载转换后的文件
    const url = URL.createObjectURL(convertedFile)
    const a = document.createElement('a')
    a.href = url
    a.download = convertedFile.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleConversionError = (error: Error) => {
    console.error('转换失败:', error)
    toast.error('转换失败', {
      description: error.message
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
        MP4Box.js 视频转换
      </h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-3">使用说明</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>支持格式：MOV容器，H.264视频编码，AAC音频编码</li>
          <li>转换类型：容器格式转换（无损，快速）</li>
          <li>文件大小限制：建议小于50MB</li>
          <li>适用场景：苹果设备录制的MOV文件转换</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">上传MOV文件进行转换</h2>
        
        <VideoConverter
          onConversionComplete={handleConversionComplete}
          onConversionError={handleConversionError}
          maxSizeMB={50}
        />
      </div>

      {/* 转换历史 */}
      {convertedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">转换历史</h2>
          <div className="space-y-3">
            {convertedFiles.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="text-sm text-gray-600">
                    原文件: {item.original.name} ({(item.original.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    转换后: {item.converted.name} ({(item.converted.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                </div>
                <button
                  onClick={() => {
                    const url = URL.createObjectURL(item.converted)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = item.converted.name
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  重新下载
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}