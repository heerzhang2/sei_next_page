import Image from "next/image";
import Link from "next/link";

export default function DepTask() {
    return (
        <div className="grid @apply custom-grid-rows items-center justify-items-center min-h-screen p-8 pb-16 gap-12 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start  ">
                <ol className="columns-2 list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                    <li className="mb-2">政策-信息化安全领域的。
                        <ol className="p-4 list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                            <li className="mb-2">
                                <Link href="https://www.cac.gov.cn/wxzw/A0937index_1.htm">网信发布</Link>
                            </li>
                        </ol>
                    </li>

                    <li className="mb-2">特种设备 采购招标综合网。
                        <ol className="p-4 list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                            <li className="mb-2">
                                <Link href="https://www.chinabidding.cc/search/index.html?page=1&keyword=%E7%89%B9%E7%A7%8D%E8%AE%BE%E5%A4%87&h_lx=9&h_province=0&vague=0&date=90&search_field=1">
                                    采购招标网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://search.ccgp.gov.cn/bxsearch?searchtype=1&page_index=1&bidSort=0&buyerName=&projectId=&pinMu=0&bidType=0&dbselect=bidx&kw=%E7%89%B9%E7%A7%8D%E8%AE%BE%E5%A4%87&start_time=2025%3A02%3A07&end_time=2025%3A03%3A10&timeType=3&displayZone=&zoneId=&pppStatus=0&agentName=">
                                    中国政府采购</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://www.arrbid.com/bidquery/key_%E7%89%B9%E7%A7%8D%E8%AE%BE%E5%A4%87?timetype=3&keywordtype=1&showtype=1">立达标讯(+金额)</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://deal.ggzy.gov.cn/ds/deal/dealList.jsp?HEADER_DEAL_TYPE=02">全国公共资源交易平台</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://zb.yfb.qianlima.com/yfbsemsite/mesinfo/zbpglist">乙 方 宝</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://www.zbytb.com/zb/search.php?kw=%E7%89%B9%E7%A7%8D%E8%AE%BE%E5%A4%87">标与采 招标与采购网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://search.vip.qianlima.com/index.html#?keywords=%E7%89%B9%E7%A7%8D%E8%AE%BE%E5%A4%87%2B%E7%B3%BB%E7%BB%9F%2B%E5%B9%B3%E5%8F%B0&timeType=2&filtermode=2&relatedWord=%E7%B3%BB%E7%BB%9F%2C%E5%B9%B3%E5%8F%B0&sortType=1&keywordsFrom=0&isSearchWord=1&tab_index=0">
                                    千里马（+系统 +平台）</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://search.bidcenter.com.cn/search?keywords=%E7%89%B9%E7%A7%8D%E8%AE%BE%E5%A4%87&tag=1&mod=0">采招网（/招标公告）+标题搜索</Link>
                            </li>
                        </ol>
                    </li>
                    <li className="mb-2 break-inside-avoid-column">特种设备 各省招标网。
                        <ol className="p-4 list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                            <li className="mb-2">
                                <Link href="https://hljcg.hlj.gov.cn/maincms-web/fullSearchingHlj?searchKey=%E7%89%B9%E7%A7%8D%E8%AE%BE%E5%A4%87">黑龙江政府采购</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="http://ggzy.hebei.gov.cn/hbggfwpt/search/fullsearch.html?wd=%E7%89%B9%E7%A7%8D%E8%AE%BE%E5%A4%87%E6%A3%80%E9%AA%8C">河北省公共资源交易平台</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="http://www.ccgp-liaoning.gov.cn/portalindex?currentKey=pubAnnounce&tabKey=0">辽宁政府采购网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="http://www.lnggzy.gov.cn/lnggzycs2/showinfo/jyxxsearch.aspx">公共资源交易平台（辽宁省）</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="http://www.ccgp-jiangsu.gov.cn/jiangsu/cggg_search.html?lmid=cggg&qh=notic_c2">江苏政府采购网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://jxsggzy.cn/jyxx/002006/002006001/trade.html">江西省公共资源交易网+近1月</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://ggzyjy.shandong.gov.cn/queryContent-jyxxgg.jspx">山东省公共资源交易网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://gdgpo.czt.gd.gov.cn/cms-gd/site/guangdong/cggg/index.html">广东省政府采购网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://ggzyjy.sc.gov.cn/jyxx/transactionInfo.html">四川省公共资源交易平台</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://www.ccgp-shaanxi.gov.cn/cms-sx/site/shanxi/xxgg/index.html?xxggType=123&noticeType=00101">陕西省政府采购网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="http://ggzy.shaanxi.gov.cn/jydt/001001/001001004/001001004001/subPage_xq.html">陕西省公共资源交易平台</Link>
                            </li>
                            <li className="mb-2">
                              <Link href="https://ggzyjy.fzggw.nx.gov.cn/dzjy/001001/001001002/trade_infomation.html">宁夏公共资源交易网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://www.ccgp-chongqing.gov.cn/search/%E7%89%B9%E7%A7%8D%E8%AE%BE%E5%A4%87">重庆市政府采购网</Link>
                            </li>
                        </ol>
                    </li>

                </ol>
            </main>
            <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
                <Link className="flex items-center gap-2 hover:underline hover:underline-offset-4" href="/">
                    <Image
                        aria-hidden
                        src="/globe.svg"
                        alt="Globe icon"
                        width={16}
                        height={16}
                    />
                    Go Home →
                </Link>
            </footer>
        </div>
    );
}
