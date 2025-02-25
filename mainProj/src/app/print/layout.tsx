export default function Layout({
                                   children,
                                   team,
                                   analytics,
                               }: {
    children: React.ReactNode
    analytics: React.ReactNode
    team: React.ReactNode
}) {
    return (
        <>
            {team}
            {children}
            {analytics}

            <section className={"ww UsualChapter lld"}>
                尾巴为哪部分的
            </section>
        </>
    )
}


/*
前面的！ <nextjs-portal />打印需设置  display: none;
动态设置的 [data-print="paged"] > .chapter {
                page: chapter;
            }
* */
