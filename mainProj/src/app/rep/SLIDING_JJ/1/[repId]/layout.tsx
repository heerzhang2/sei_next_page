import {TableOfContents} from "@/component/table-of-contents";

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
    const tableOfContentsItems = [
        { title: "Creating a page", url: "#creating-a-page" },
        { title: "Creating a layout", url: "#creating-a-layout" },
        { title: "Creating a nested route", url: "#creating-a-nested-route" },
        { title: "Nesting layouts", url: "#nesting-layouts" },
        { title: "Linking between pages", url: "#linking-between-pages" },
        { title: "API Reference", url: "#api-reference" },
    ]

    // Conditional Routes  很多个的@并行路由可以备选的。

    return (
        <>
            <div className="flex min-h-screen">
                {/* Left sidebar navigation */}
                <div className="hidden lg:block w-64 shrink-0 border-r p-4"> Left sidebar content </div>

                {/* Main content */}
                <div className="flex-1 overflow-auto">
                    <div className="mx-auto max-w-4xl px-6 py-8">
                        {children}
                    </div>
                </div>

                {/* Right sidebar with table of contents */}
                <div className="hidden xl:block w-64 shrink-0 border-l p-4">
                    <div className="sticky top-16">
                        <TableOfContents items={tableOfContentsItems} />
                    </div>
                </div>
            </div>
            {analytics}

            <div id="modal-root" />
        </>
    )
}
