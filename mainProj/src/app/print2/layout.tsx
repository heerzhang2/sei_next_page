export default function Layout({
                                   children,
                               }: {
    children: React.ReactNode
}) {
    return (
        <>
            {children}
            <section className={"ww  lld"}>
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
