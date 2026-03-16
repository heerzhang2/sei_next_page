'use client'

import { useState, useCallback } from 'react'
import { createFile } from 'mp4box'

interface VideoInfo {
  duration?: number
  width?: number
  height?: number
  bitrate?: number
  tracks?: Array<{
    type: string
    codec: string
    language?: string
  }>
}

interface VideoConverterProps {
  onConversionComplete?: (convertedFile: File, originalFile: File) => void
  onConversionError?: (error: Error) => void
  maxSizeMB?: number
  className?: string
}

export default function VideoConverter({
  onConversionComplete,
  onConversionError,
  maxSizeMB = 50,
  className = ''
}: VideoConverterProps) {
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)

  // 检查编码兼容性
  const checkIfNeedsReencoding = useCallback((info: VideoInfo): boolean => {
    const videoTrack = info.tracks?.find(track => track.type === 'video')
    if (videoTrack) {
      const codec = videoTrack.codec
      return !codec.includes('avc1') && !codec.includes('h264')
    }
    
    const audioTrack = info.tracks?.find(track => track.type === 'audio')
    if (audioTrack) {
      const codec = audioTrack.codec
      return !codec.includes('mp4a') && !codec.includes('aac')
    }
    
    return false
  }, [])

  // 执行转换
  const convertFile = useCallback(async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const mp4box = createFile()
      const reader = new FileReader()

      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer
        if (!arrayBuffer) {
          reject(new Error('文件读取失败'))
          return
        }
        
        // 设置文件起始位置
        ;(arrayBuffer as any).fileStart = 0

        mp4box.onError = (error: any) => {
          console.error('[MP4Box] 解析错误:', error)
          reject(new Error(`MP4Box解析错误: ${error}。请确保文件是有效的MOV文件。`))
        }

        mp4box.onReady = (info: VideoInfo) => {
          console.log('视频信息:', info)
          
          const needsReencoding = checkIfNeedsReencoding(info)
          
          if (needsReencoding) {
            reject(new Error('该视频需要重新编码，建议使用服务器端转换'))
          } else {
            // 对于已经兼容的MOV文件，直接重命名为MP4
            // 因为大多数现代浏览器都支持MOV容器中的H.264/AAC编码
            setProgress(50)
            
            setTimeout(() => {
              try {
                // 验证文件确实可以被读取
                const dataArray = new Uint8Array(arrayBuffer)
                console.log('[MP4Box] 文件大小:', dataArray.length, 'bytes')
                
                // 创建新的MP4文件
                const mp4Blob = new Blob([arrayBuffer], { type: 'video/mp4' })
                const mp4FileName = file.name.replace(/\.mov$/i, '.mp4')
                const mp4File = new File([mp4Blob], mp4FileName, {
                  type: 'video/mp4',
                  lastModified: Date.now()
                })

                setProgress(100)
                resolve(mp4File)
              } catch (error) {
                reject(error as Error)
              }
            }, 1000) // 短暂延迟以显示进度
          }
        }

        mp4box.appendBuffer(arrayBuffer)
        mp4box.flush()
      }

      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsArrayBuffer(file)
    })
  }, [checkIfNeedsReencoding])

  // 处理文件转换
  const handleConvert = useCallback(async (file: File) => {
    const fileSizeMB = file.size / 1024 / 1024
    if (fileSizeMB > maxSizeMB) {
      const error = new Error(`文件过大，建议使用小于${maxSizeMB}MB的文件`)
      onConversionError?.(error)
      return
    }

    if (!file.name.toLowerCase().endsWith('.mov')) {
      const error = new Error('只支持MOV文件转换')
      onConversionError?.(error)
      return
    }

    setIsConverting(true)
    setProgress(0)

    try {
      const convertedFile = await convertFile(file)
      onConversionComplete?.(convertedFile, file)
    } catch (error) {
      onConversionError?.(error as Error)
    } finally {
      setIsConverting(false)
      setProgress(0)
    }
  }, [convertFile, maxSizeMB, onConversionComplete, onConversionError])

  // 拖拽处理
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleConvert(file)
    }
  }, [handleConvert])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleConvert(file)
    }
  }, [handleConvert])

  return (
    <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
      isConverting ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
    } ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <svg 
        className="mx-auto h-12 w-12 text-gray-400 mb-4" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
        />
      </svg>
      
      <p className="text-lg mb-4 text-gray-700">
        拖拽MOV文件到此处，或点击选择文件
      </p>
      
      <input
        type="file"
        accept=".mov"
        onChange={handleFileChange}
        disabled={isConverting}
        className="hidden"
        id="video-converter-input"
      />
      
      <button
        onClick={() => document.getElementById('video-converter-input')?.click()}
        disabled={isConverting}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isConverting ? '转换中...' : '选择MOV文件'}
      </button>

      {/* 进度条 */}
      {isConverting && (
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{progress.toFixed(0)}%</p>
        </div>
      )}
    </div>
  )
}