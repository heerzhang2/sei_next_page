import type { NextPageContext } from "next"
import Link from "next/link"

const CustomErrorPage = ({ statusCode }: { statusCode: number }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-6xl font-bold">{statusCode || "错误"}</h1>
      <p className="mt-4 text-xl">{statusCode ? `发生了一个 ${statusCode} 错误` : "发生了一个客户端错误"}</p>
      <div className="mt-8">
        <Link href="/" className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
          返回首页
        </Link>
      </div>
    </div>
  )
}

CustomErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default CustomErrorPage
