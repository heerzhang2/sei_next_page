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