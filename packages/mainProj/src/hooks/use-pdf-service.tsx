"use client"

import { useState } from "react"
import { toast } from "sonner"

// 创建一个自定义hook来处理PDF转换
export function usePdfService() {
  const [isProcessing, setIsProcessing] = useState(false)

  // 使用Web Worker处理PDF转换请求
  const convertToPdf = async (pdfJob: any) => {
    setIsProcessing(true)

    try {
      // 创建一个新的Web Worker
      const worker = new Worker(
        URL.createObjectURL(
          new Blob(
            [
              `
              self.onmessage = async function(e) {
                try {
                  const response = await fetch("http://localhost:9389/api/pdf", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(e.data)
                  });
                  
                  const result = await response.json();
                  self.postMessage({ success: true, data: result });
                } catch (error) {
                  self.postMessage({ 
                    success: false, 
                    error: error.message || "PDF转换失败"
                  });
                }
              };
              `,
            ],
            { type: "application/javascript" },
          ),
        ),
      )

      return new Promise((resolve, reject) => {
        // 设置消息处理器
        worker.onmessage = (e) => {
          worker.terminate() // 完成后终止Worker
          setIsProcessing(false)

          if (e.data.success) {
            resolve(e.data.data)
          } else {
            reject(new Error(e.data.error))
          }
        }

        // 设置错误处理器
        worker.onerror = (error) => {
          worker.terminate() // 出错后终止Worker
          setIsProcessing(false)
          reject(new Error("Worker错误: " + error.message))
        }

        // 发送数据到Worker
        worker.postMessage(pdfJob)
      })
    } catch (error) {
      setIsProcessing(false)
      throw error
    }
  }

  // 包装函数，处理错误和成功状态
  const handlePdfConversion = async (pdfJob: any, onSuccess?: () => void) => {
    try {
      await convertToPdf(pdfJob)
      toast.success("PDF转换成功")
      if (onSuccess) onSuccess()
      return true
    } catch (error) {
      console.error("PDF转换错误:", error)

      toast.error("PDF转换失败", {
        description: (
          <div className="space-y-2">
            <p>{error instanceof Error ? error.message : "未知错误"}</p>
            <p className="text-xs">由于浏览器安全限制，可能无法访问本地PDF服务。请尝试以下解决方法：</p>
            <ol className="text-xs list-decimal pl-4">
              <li>
                在Chrome地址栏输入: chrome://flags/#block-insecure-private-network-requests
                <br />
                然后将该选项设置为'Disabled'并重启浏览器
              </li>
              <li>或者使用其他方式转换PDF</li>
            </ol>
          </div>
        ),
        duration: 10000,
      })
      return false
    }
  }

  return {
    handlePdfConversion,
    isProcessing,
  }
}
