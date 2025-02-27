import Link from 'next/link'

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <nav>
                <Link href="/rep/SLIDING_JJ/1/KQcbgDF9RO21DsI92H3tTVJlcG9ydA/page-views">Page Views</Link>
                <Link href="/rep/SLIDING_JJ/1/KQcbgDF9RO21DsI92H3tTVJlcG9ydA/visitors">Visitors</Link>
            </nav>
            <div>{children}</div>
        </>
    )
}