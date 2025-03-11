import Image from "next/image";
import Link from "next/link";

export default function DepTask() {
    return (
        <div className="grid @apply custom-grid-rows items-center justify-items-center min-h-screen p-8 pb-16 gap-12 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                    <li className="mb-2">政策-信息化安全领域的。
                        <ol className="p-4 list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                            <li className="mb-2">
                                <Link href="https://www.cac.gov.cn/wxzw/A0937index_1.htm">网信发布</Link>
                            </li>
                        </ol>
                    </li>

                    <li className="mb-2">采购招标综合网。
                        <ol className="p-4 list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                            <li className="mb-2">
                                <Link href="https://search.ccgp.gov.cn/bxsearch?searchtype=1&page_index=1&bidSort=0&buyerName=&projectId=&pinMu=0&bidType=0&dbselect=bidx&kw=%E7%89%B9%E7%A7%8D%E8%AE%BE%E5%A4%87%E6%A3%80%E9%AA%8C%E7%AE%A1%E7%90%86&start_time=2025%3A02%3A07&end_time=2025%3A03%3A10&timeType=3&displayZone=&zoneId=&pppStatus=0&agentName=">
                                    中国政府采购</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://search.bidcenter.com.cn/search?keywords=%E7%89%B9%E7%A7%8D%E8%AE%BE%E5%A4%87&tag=1&mod=0">采 招 网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://www.zbytb.com/zb/search.php?kw=%E7%89%B9%E7%A7%8D%E8%AE%BE%E5%A4%87">中国招标与采购网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://zfcg.czt.fujian.gov.cn/freecms/site/fujian/qwjsy/index.html?searchContent=%E7%89%B9%E7%A7%8D%E8%AE%BE%E5%A4%87">福建政府采购网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://console.jrzb.cn/search?type=0&menuActive=2&searchType=1">今日招标</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://deal.ggzy.gov.cn/ds/deal/dealList.jsp?HEADER_DEAL_TYPE=02">全国公共资源交易平台</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://search.vip.qianlima.com/index.html#?keywords=%E7%89%B9%E7%A7%8D%E8%AE%BE%E5%A4%87&timeType=3&filtermode=2&currentPage=7&keywordsFrom=0&isSearchWord=1&tab_index=0">
                                    千里马 招标网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://vip.bidizhaobiao.com/admin#/informationQuery/bid">比地招标网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://zb.yfb.qianlima.com/yfbsemsite/mesinfo/zbpglist">乙 方 宝</Link>
                            </li>
                        </ol>
                    </li>
                    <li className="mb-2">各省市的招标网。
                        <ol className="p-4 list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                            <li className="mb-2">
                                <Link href="https://hljcg.hlj.gov.cn/maincms-web/fullSearchingHlj?searchKey=%E7%89%B9%E7%A7%8D%E8%AE%BE%E5%A4%87">黑龙江政府采购</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="http://ggzy.hebei.gov.cn/hbggfwpt/search/fullsearch.html?wd=%E7%89%B9%E7%A7%8D%E8%AE%BE%E5%A4%87%E6%A3%80%E9%AA%8C">河北省公共资源交易平台</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://ggzy.guizhou.gov.cn/xxfw/search.html?searchWord=%E7%89%B9%E7%A7%8D%E8%AE%BE%E5%A4%87">贵州省公共资源交易云</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="http://www.hebeieb.com/tender/xxgk/list.do?selectype=zbgg">河北省数据和政务服务局</Link>
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
                                <Link href="http://www.ccgp-jiangsu.gov.cn/jiangsu/cggg_search.html?lmid=cggg&qh=notic_c2">安徽省政府采购网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://jxsggzy.cn/jyxx/002006/002006001/trade.html">江西省公共资源交易网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://www.chinabidding.cc/search/index.html?page=1&keyword=%E7%89%B9%E7%A7%8D%E8%AE%BE%E5%A4%87&h_lx=9&h_province=0&vague=0&date=90&search_field=1">
                                    安徽采购招标网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://ggzyjy.shandong.gov.cn/queryContent-jyxxgg.jspx">山东省公共资源交易网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://www.hnsggzy.com/#/jygk">湖南省公共资源交易服务平台</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://gdgpo.czt.gd.gov.cn/cms-gd/site/guangdong/cggg/index.html">广东省政府采购网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://www.ccgp-sichuan.gov.cn/maincms-web/noticeInformation?typeId=ggxx">四川政府采购网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://ggzyjy.sc.gov.cn/jyxx/transactionInfo.html">全国公共资源交易平台（四川省）</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://www.ccgp-shaanxi.gov.cn/cms-sx/site/shanxi/xxgg/index.html?xxggType=123&noticeType=00101">陕西省政府采购网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="http://ggzy.shaanxi.gov.cn/jydt/001001/001001004/001001004001/subPage_xq.html">全国公共资源交易平台（陕西省）</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://sjfz.ggzyjy.gansu.gov.cn:19002/#/list-search?pop=true&params=H4sIAAAAAAAAA6tWKilKTEkNqSxIVbJSMlTSUcrJzMsGMgOC%252FL1cnUOAAgU5iSVp%252BUW5zvkpIDVKtQBF0blcNAAAAA%253D%253D">
                                    甘肃省公共资源交易网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://www.ccgp-neimenggu.gov.cn/category/cgggg?type_name=1">内蒙古自治区政府采购网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://ggzyjy.nmg.gov.cn/jyxx/jyxxss/">内蒙古公共资源交易网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://zfcg.gxzf.gov.cn/site/category?parentId=66485&childrenCode=ZcyAnnouncement">广西政府采购网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://ggzy.xizang.gov.cn/search/queryContents.jhtml">西藏自治区公共资源交易网</Link>
                            </li>
                            <li className="mb-2">
                              <Link href="https://ggzyjy.fzggw.nx.gov.cn/dzjy/001001/trade_infomation.html">宁夏公共资源交易网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="http://www.ccgp-xinjiang.gov.cn/site/category?isProvince=true&districtCode=659900&parentId=3661&childrenCode=ZcyAnnouncement2&utm=site.site-PC-42055.1069-pc-wsg-ArticlePurchaseNoticeList-front.1.59759300fe4911ef92753b56277d9df2">
                                    新疆政府采购网</Link>
                            </li>
                            <li className="mb-2">
                                <Link href="https://www.ccgp-chongqing.gov.cn/search/%E7%89%B9%E7%A7%8D%E8%AE%BE%E5%A4%87">重庆市政府采购网</Link>
                            </li>
                        </ol>
                    </li>

                    <li className="mb-2">特种设备检验检测机构。
                        <ol className="p-4 list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                            <li className="mb-2">
                                <Link href="http://www.hljsei.org.cn/">黑龙江特种设备检验研究院的官方网站</Link>
                            </li>
                        </ol>
                    </li>

                    <li className="mb-2">无效或避免骚扰的站点：
                        <ol className="p-4 list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                            <li className="mb-2">
                                <Link href="https://zhengcai.wxniusis.cn/index/formguide/index.html?id=1&bd_vid=10385197680151130050">政 采</Link>
                            </li>
                        </ol>
                    </li>
                </ol>
            </main>
            <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
                <a className="flex items-center gap-2 hover:underline hover:underline-offset-4" href="/">
                    <Image
                        aria-hidden
                        src="/globe.svg"
                        alt="Globe icon"
                        width={16}
                        height={16}
                    />
                    Go Home →
                </a>
            </footer>
        </div>
    );
}
