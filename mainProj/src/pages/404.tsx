import Link from "next/link"

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-xl">页面未找到</p>
      <div className="mt-8">
        <Link href="/" className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
          返回首页
        </Link>
      </div>
    </div>
  )
}
