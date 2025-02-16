import Link from "next/link";
import Header from "@/component/header";
import FootBar from "@/component/footbar";

//这个是规定的输出变量：静态化导出static site会报错！
// export const dynamic = "force-dynamic";
/*不是必须登录的就能访问内容：
* */
export default function Home() {
  return (
      <div>
          <div className="mt-10">
              <Link href="/main">认证后的主页home</Link>
          </div>
          <div className="mt-10">
              <Link href="/lazy">Visit (potentially) cached page ➡️</Link>
          </div>
          <div className="mt-10">
              <Link href="/login">⬅️ Go 的等让路 home</Link>
          </div>
      </div>
  );
}
