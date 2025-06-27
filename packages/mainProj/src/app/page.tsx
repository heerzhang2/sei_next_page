import Image from "next/image";
import Link from "next/link";

/* 20px minmax(100px, 1fr) 20px
  grid-template-rows: 20px clamp(90px, 1fr, 600px) 20px;
  @xs:text-right        max-sm:size-max
  @apply custom-grid-rows      grid grid-rows-[20px_minmax(600px,1fr)_20px]
  grid-rows-[20px_1fr_20px]
  @container (width >= 20rem) { grid-template-rows: 20px 1fr 20px; }
*/
export default function Home() {
    return (
        <div className="grid @apply custom-grid-rows items-center justify-items-center min-h-screen p-8 pb-16 gap-12 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <a className="flex items-center gap-2 hover:underline hover:underline-offset-4" href="deptask">
                    <Image
                        aria-hidden
                        src="/globe.svg"
                        alt="Globe icon"
                        width={16}
                        height={16}
                    />
                    Go每日采集 →
                </a>
                <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                    <li className="mb-2">
                        <div className="mt-10">
                            <Link href="/main">认证后的主页home</Link>
                        </div>
                        {/*KQcbgDF9RO21DsI92H3tTVJlcG9ydA*/}
                            <div className="mt-10">
                                <Link href="/lazy">Visit (potentially) cached page ➡️</Link>
                            </div>
                            <div className="mt-10">
                                <Link
                                    href="/rep/KQcbgDF9RO21DsI92H3tTVJlcG9ydA==/POWER_AJ/1">查阅当前1份报告</Link>
                            </div>
                            <div className="mt-10">
                                <Link
                                    href="/rep/wjSpD8qsRvGy-zmji0lUK1JlcG9ydA/POWER_AJ/1">查阅当前一2份报告试图的来</Link>
                            </div>
                            <div className="mt-10">
                                <Link href="/login">⬅ 登录home</Link>
                            </div>
                            <div className="mt-10">
                                <Link href="/process-start">⬅️ 验证rr登录</Link>
                            </div>
                            <div className="mt-10">
                                <Link
                                    href="/rep/KQcbgDF9RO21DsI92H3tTVJlcG9ydA/SLIDING_JJ/1/T6-14?#T6-14">编制态当前一1份报告试图的来</Link>
                            </div>
                            <div className="mt-10">
                                <Link
                                    href="rep/wjSpD8qsRvGy-zmji0lUK1JlcG9ydA/SLIDING_JJ/1/T6-14?#T6-14">编制态当前一2份报告试图的来</Link>
                            </div>
                            <div className="mt-10">
                                <Link href="/process-start">例子的 入口</Link>
                            </div>
                    </li>
                    <li>Save and see your changes instantly.</li>
                </ol>

                <div className="flex gap-4 items-center flex-col sm:flex-row" >
                    <a
                        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                        href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            className="dark:invert"
                            src="/vercel.svg"
                            alt="Vercel logomark"
                            width={20}
                            height={20}
                            style={{width: "auto", height: "1rem" }}
                        />
                        Deploy now
                    </a>
                    <a
                        className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
                        href="/reptype"
                        rel="noopener noreferrer"
                    >
                    Read our docs
                    </a>
                </div>
            </main>
            <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
                <Image
                    className="dark:invert"
                    src="/next.svg"
                    alt="Next.js logo"
                    width={"1"}
                    height={"1"}
                    priority
                    style={{ width: "auto", height: "2.2rem", objectFit: "contain" }}
                />
            </footer>
        </div>
    );
}
