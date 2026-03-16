'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import VideoConverter from '@/components/VideoConverter'

export default function VideoExamplePage() {
  const [lastConvertedFile, setLastConvertedFile] = useState<File | null>(null)

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-center mb-6">
        视频转换示例
      </h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-gray-600 mb-4">
          这是一个简单的视频转换示例，展示了如何在现有页面中集成 VideoConverter 组件。
        </p>
        
        <VideoConverter
          onConversionComplete={(convertedFile, originalFile) => {
            setLastConvertedFile(convertedFile)
            toast.success('转换成功！', {
              description: `${originalFile.name} 已转换为 ${convertedFile.name}`
            })
          }}
          onConversionError={(error) => {
            toast.error('转换失败', {
              description: error.message
            })
          }}
          maxSizeMB={30}
          className="border-green-400 hover:border-green-500"
        />
      </div>

      {lastConvertedFile && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">
            最近转换的文件
          </h3>
          <p className="text-green-700">
            {lastConvertedFile.name} ({(lastConvertedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
          
          <button
            onClick={() => {
              const url = URL.createObjectURL(lastConvertedFile)
              const a = document.createElement('a')
              a.href = url
              a.download = lastConvertedFile.name
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
            }}
            className="mt-3 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
          >
            下载文件
          </button>
        </div>
      )}
    </div>
  )
}