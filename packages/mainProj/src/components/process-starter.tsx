"use client"

import type React from "react"

import { useState } from "react"
import { startProcess } from "@/actions/camunda-actions"
import {ConfigRoot, FileTransform} from "page2pdf_server/src";
/*@deprecated
* */
export default function ProcessStarter() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const original=false
  const repNo="" //rep?.isp?.no;
  const urlPrn=""// `/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/?print=1`+(original? "&original=1" : "");
  const url = `${process.env.NEXT_PUBLIC_APP_WEB}` + urlPrn;

  const pdf_job = {
    name: (original ? "记录" : "报告") + repNo,
    singleTab: true,
    lay: {
      head: [
        '<div style=\\"position: relative; width:100%; text-align:center; border-bottom: 1pt solid #eeeeee; margin: 3.5mm 0px 10px; font-size: 10pt\\">',
        `<div style=\\"position: absolute; width:100%; text-align:left; bottom: 5px; left: 50px;\\">报告No: ${repNo}</div></div>`
      ],
      foot: [
        '<div style=\\"position: relative; width: 100%; text-align: left; border-top: 1pt solid #eeeeee; margin:  10px 0px 1.5mm; font-size: 8pt;\\">',
        '<div style=\\"position: absolute; width: 100%; text-align: center; top: 5px;\\">共<span>~pageNumber~</span>页 / 第<span>~totalPages~</span>页</div></div>'
      ],
    },
    files: [
      {
        url,
        out: `tmp-${repNo}` + (original ? "-O" : ""),
        headFrom: 3,
        frNo: 3,
      },
    ],
  } as ConfigRoot<FileTransform>;

  // 表单数据
  const [formData, setFormData] = useState({
    customerId: "12345",
    documentType: pdf_job,
    original: false,
  })
  //表单就没必要了，直接启动流程！
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await startProcess({
        processId: "genRepPdf",
        variables: formData,
      })

      setResult(response)
    } catch (err: any) {
      setError(err.message || "启动流程时出错")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-semibold mb-2">启动PDF生成流程</h2>
        <p className="text-gray-600">填写以下信息并点击按钮启动Camunda 8流程实例</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-1">
              客户ID
            </label>
            <input
              type="text"
              id="customerId"
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
              报告ID
            </label>
            <input
                type="text"
                id="documentType"
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
          </div>

          <div>
            <label htmlFor="original" className="block text-sm font-medium text-gray-700 mb-1">
             原始记录吗
            </label>
            <select
              id="original"
              name="original"
              value={formData.original as any}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">低</option>
              <option value="normal">中</option>
              <option value="high">高</option>
            </select>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "处理中..." : "启动流程实例"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
          <p className="font-medium">错误</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="font-medium text-green-800 mb-2">流程实例已成功启动!</p>
          <div className="bg-white p-3 rounded border border-gray-200 overflow-auto max-h-40">
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
