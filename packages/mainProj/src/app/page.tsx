"use client";
import Image from "next/image";
import Link from "next/link";
import HeaderWrapper from "@/component/header-wrapper";
import { withBasePath } from '@/lib/tool'

export default function Home() {
    // 定义设置离线报告的函数
    const setOfflineReports = () => {
        const reports = [
            "HAAAAAAAAAQAAAAAAAAAAFJlcG9ydA", "fAAAAAAAdTUAAAAAAAAAAFJlcG9ydA",
            "HAAAAAAAAAYAAAAAAAAAAFJlcG9ydA", "HAAAAAAAAAMAAAAAAAAAAFJlcG9ydA"
        ];
        // 将数组转换为 JSON 字符串并存入 localStorage
        localStorage.setItem("offline-reports", JSON.stringify(reports));
        // 可选：给用户一个反馈
        alert("离线报告列表已设置！");
    };

    return (
        <div className="grid @apply custom-grid-rows items-center justify-items-center min-h-screen p-8 pb-16 gap-12 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <HeaderWrapper />
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-4xl">
                <div className="w-full">
                    <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                        <li className="mb-4">
                                <Link href="/login">用户登录</Link>
                        </li>
                        <li className="mb-2">
                            检验报告的几个例子
                            <div className="mt-2">
                               <Link className="flex items-center gap-2 hover:underline hover:underline-offset-4" href="/rep/HAAAAAAAAAQAAAAAAAAAAFJlcG9ydA/SLIDING_JJ/1">
                                    <Image aria-hidden src={withBasePath("/globe.svg")} alt="Globe icon" width={16} height={16} />
                                    滑行车类大型游乐设施监督检验-滑行车类-例子 →
                               </Link>
                            </div>
                            <div className="mt-10">
                                <Link href="/rep/HAAAAAAAAAMAAAAAAAAAAFJlcG9ydA/POWER_AJ/1">电站锅炉的监督检验-例子</Link>
                            </div>
                            <div className="mt-10">
                                <Link href="/rep/HAAAAAAAAAYAAAAAAAAAAFJlcG9ydA/INDPL_DJ/1">工业管道定期检验报告-例子1</Link>
                            </div>
                            <div className="mt-10">
                                <Link href="/rep/fAAAAAAAdTUAAAAAAAAAAFJlcG9ydA/INDPL_DJ/1">工业管道定期检验报告-例子2</Link>
                            </div>
                            <div className="mt-10">
                                <Link href="/rep/HAAAAAAAAAYAAAAAAAAAAFJlcG9ydA/INDPL_DJ/1/MangInstrument?original=1&subrid=HAAAAAAAAAEAAAAAAAAAAFJlcG9ydA&redId=2#MangInstrument">
                                    磁粉检测报告1-分项报告的例子
                                </Link>
                            </div>
                            <div className="mt-10">
                                <Link href="/rep/HAAAAAAAAAYAAAAAAAAAAFJlcG9ydA/INDPL_DJ/1/MangInstrument?original=1&subrid=LAAAAAAA6mMAAAAAAAAAAFJlcG9ydA&redId=1#MangInstrument">
                                    磁粉检测报告2-分项报告的例子
                                </Link>
                            </div>
                        </li>
                        <li className="pt-2">测试时期的功能</li>
                    </ol>
                </div>
                <div className="flex gap-4 items-center flex-col sm:flex-row">
                    <Link
                        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                        href="/reptype"
                    >
                        <Image
                            className="dark:invert"
                            src={withBasePath("/vercel.svg")}
                            alt="Vercel logomark"
                            width={20}
                            height={20}
                            style={{ width: "auto", height: "1rem" }}
                        />
                       报告模板列表
                    </Link>
                    <Link
                        className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
                        href="/tracked-processes"
                    >
                        <Image aria-hidden src={withBasePath("/globe.svg")} alt="Globe icon" width={16} height={16} />
                        跟踪的流程
                    </Link>
                    <Link
                        className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
                        href="/task-extraction"
                    >
                        <Image aria-hidden src={withBasePath("/globe.svg")} alt="Globe icon" width={16} height={16} />
                        任务提取
                    </Link>
                </div>

                {/* 新增的按钮 */}
                <button
                    onClick={setOfflineReports}
                    className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44 mt-4 text-blue-600 dark:text-blue-400 font-bold"
                >
                 离线编制的测试（请务必）初始化
                </button>

            </main>
            <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
                <Image
                    src={withBasePath("/fjsei-logo.png")}
                    alt="福建省特种设备检验研究院"
                    width={200}
                    height={60}
                    priority
                    style={{ width: "auto", height: "3rem", objectFit: "contain" }}
                />
            </footer>
        </div>
    );
}