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
        </>
    )
}


/*

动态设置的 [data-print="paged"] > .chapter {
                page: chapter;
            }
* */
