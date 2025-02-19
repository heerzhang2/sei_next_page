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
                  <Link href="/rep/SLIDING_JJ/1/KQcbgDF9RO21DsI92H3tTVJlcG9ydA">kankan当前一1份报告试图的来</Link>
              </div>
              <div className="mt-10">
                  <Link href="/rep/SLIDING_JJ/1/wjSpD8qsRvGy-zmji0lUK1JlcG9ydA">kankan当前一2份报告试图的来</Link>
              </div>
              <div className="mt-10">
                  <Link href="/rep/SLIDING_JJ">⬅ u r q l home</Link>
              </div>
              <div className="mt-10">
                  <Link href="/login">⬅️ Go 的等让路 home; 下面的是可编编制的报告入口</Link>
              </div>
              <div className="mt-10">
                  <Link href="/report/SLIDING_JJ/1/KQcbgDF9RO21DsI92H3tTVJlcG9ydA">k当前一1份报告试图的来</Link>
              </div>
              <div className="mt-10">
                  <Link href="/report/SLIDING_JJ/1/wjSpD8qsRvGy-zmji0lUK1JlcG9ydA">k当前一2份报告试图的来</Link>
              </div>
          </main>

      </div>
  );
}
