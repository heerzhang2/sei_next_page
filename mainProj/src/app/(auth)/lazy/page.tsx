import { SlowContentLoader } from "@/app/(auth)/lazy/SlowContentLoader";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function LazyPage() {
  return (
    <div>
      <SlowContentLoader />

      <div className="mt-10">
        <Link href="/">⬅️ Go back home</Link>
      </div>
    </div>
  );
}

/*【next.js才会的报错】
className="light" 和 style={{color-scheme:"light"}} 这两个属性在服务器渲染的HTML中存在，但在客户端渲染时被省略或更改了。
* */
