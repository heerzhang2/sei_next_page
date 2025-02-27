import Link from "next/link";
import Header from "@/component/header";
import FootBar from "@/component/footbar";


//这个是规定的输出变量：静态化导出static site会报错！
// export const dynamic = "force-dynamic";
/*不是必须登录的就能访问内容：
* */
export default async function Home() {
  return (
      <div>
          <div className="mt-10">
              <Link href="/main">认证后的主页home</Link>
          </div>

          <main>
              <div className="mt-10">
                  <Link href="/lazy">Visit (potentially) cached page ➡️</Link>
              </div>
              <div className="mt-10">
                  <Link href="/rep/SLIDING_JJ/1/KQcbgDF9RO21DsI92H3tTVJlcG9ydA">查阅当前一1份报告试图的来</Link>
              </div>
              <div className="mt-10">
                  <Link href="/rep/SLIDING_JJ/1/wjSpD8qsRvGy-zmji0lUK1JlcG9ydA">查阅当前一2份报告试图的来</Link>
              </div>
              <div className="mt-10">
                  <Link href="/rep/SLIDING_JJ">⬅ u r q l home</Link>
              </div>
              <div className="mt-10">
                  <Link href="/test3">⬅️ 验证登录入口</Link>
              </div>
              <div className="mt-10">
                  <Link
                      href="/rep/SLIDING_JJ/1/KQcbgDF9RO21DsI92H3tTVJlcG9ydA/2.1?make=1#2.1">编制态当前一1份报告试图的来</Link>
              </div>
              <div className="mt-10">
                  <Link
                      href="/rep/SLIDING_JJ/1/wjSpD8qsRvGy-zmji0lUK1JlcG9ydA?make=1">编制态当前一2份报告试图的来</Link>
              </div>
              <div className="mt-10">
                  <Link href="/edit/KQcbgDF9RO21DsI92H3tTVJlcG9ydA?make=1">⬅️ 修改 验证离线1 入口</Link>
              </div>
              <div className="mt-10">
                  <Link href="/edit/wjSpD8qsRvGy-zmji0lUK1JlcG9ydA?make=1">⬅️ 修改 验证离线2 入口</Link>
              </div>
              <div className="mt-10">
                  <Link href="/print">打印试验的 入口</Link>
              </div>
          </main>

      </div>
  );
}
/*repid=29071b80-317d-44ed-b50e-c23dd87ded4d
* */