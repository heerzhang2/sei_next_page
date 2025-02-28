export default function Layout({
                                   children,
                                   team,
                                   analytics,
                                   modal,
                               }: {
    children: React.ReactNode
    analytics: React.ReactNode
    team: React.ReactNode
    modal: React.ReactNode;
}) {

    // Conditional Routes  很多个的@并行路由可以备选的。

    return (
        <>
            {children}
            {/*{team}*/}
            {analytics}

            <div id="modal-root" />
        </>
    )
}
