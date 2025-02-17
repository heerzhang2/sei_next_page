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
              本系统程序是为特种设备检验检测机构特检部门的相关领域应运而生的，当前用途主要提供些相关的工具或助手之类的系统，目前还只针对内部用户开放的，所以
              登录前先验证注册帐户! 😋
          </div>
          <div className="mt-10">
              <Link href="/lazy">Visit (potentially) cached page ➡️</Link>
          </div>
          <div className="mt-10">
              <Link href="/rep/SLIDING_JJ/1/dfdf">kankan当前一份报告试图的来</Link>
          </div>
          <div className="mt-10">
              <Link href="/login">⬅️ Go 的等让路 home</Link>
          </div>
      </div>
  );
}
