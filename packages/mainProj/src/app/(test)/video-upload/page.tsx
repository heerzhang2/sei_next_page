'use client'

import { useState } from 'react'
import VideoConverter from '@/components/VideoConverter'

export default function VideoUploadPage() {
  const [convertedFiles, setConvertedFiles] = useState<Array<{original: File, converted: File}>>([])

  const handleConversionComplete = (convertedFile: File, originalFile: File) => {
    console.log('转换完成:', originalFile.name, '->', convertedFile.name)
    setConvertedFiles(prev => [...prev, { original, converted: convertedFile }])
    
    // 创建下载链接
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
    alert(`转换失败: ${error.message}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          视频上传与转换
        </h1>
        
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
    </div>
  )
}