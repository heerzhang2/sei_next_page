import Link from "next/link";
// import { MainContent } from "./MainContent";
import Header from "@/component/header";
import FootBar from "@/component/footbar";
import {MainContent} from "@/app/(auth)/user/MainContent";

//这个是规定的输出变量：静态化导出static site会报错！
// export const dynamic = "force-dynamic";
/*不是必须登录的就能访问内容：
* */
export default function Home() {
  return (
      <div>
          <div className="mt-10">
              <Link href="/lazy">Team页下层的settings 页 </Link>
          </div>
      </div>
  );
}
