import Link from "next/link";
import { MainContent } from "./MainContent";
import Header from "@/component/header";
import FootBar from "@/component/footbar";

//这个是规定的输出变量：静态化导出static site会报错！
export const dynamic = "force-dynamic";

export default function Home() {
  return (
      <div>
          <Header />
          <MainContent/>

          <div className="mt-10">
              <Link href="/lazy">Visit (potentially) cached page ➡️</Link>
          </div>
          <div className="mt-10">
              <Link href="/login">⬅️ Go 的等让路 home</Link>
          </div>


      </div>
  );
}
