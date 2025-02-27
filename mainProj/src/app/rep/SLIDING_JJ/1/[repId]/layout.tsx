export default function Layout({
                                   children,
                                   team,
                                   analytics,
                               }: {
    children: React.ReactNode
    analytics: React.ReactNode
    team: React.ReactNode
}) {

    // Conditional Routes  很多个的@并行路由可以备选的。

    return (
        <>
            {children}
            {/*{team}*/}
            {analytics}
        </>
    )
}
