import type React from "react"
import {ContentSection} from "@/component/content-section";
import Link from "next/link";
interface ContentSectionProps {
  id: string
  title?: string
  children?: React.ReactNode
}

export default function ReportOrRecord({ id, title  }: ContentSectionProps) {
  let photos = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
      <section >
        <h1 className="text-3xl font-bold mb-6">报告记录可打印Nesting layouts</h1>

        <ContentSection id="creating-a-page" title="Creating a page">
          <p>Pages are每个报告模板不一样的 UI that are unique to a route...</p>
        </ContentSection>

        <ContentSection id="creating-a-layout" title="Creating a layout">
          <p>Layouts are UI that is shared between multiple pages...</p>
        </ContentSection>
          <ContentSection id="creating-a-page" title="Creating a page">
              <p>Pages are UI that are unique to a route...</p>
          </ContentSection>

          <ContentSection id="creating-a-layout" title="Creating a layout">
              <p>Layouts are UI that is shared between multiple pages...</p>
          </ContentSection>
          <ContentSection id="creating-a-page" title="Creating a page">
              <p>Pages are UI that are unique to a route...</p>
          </ContentSection>

          <ContentSection id="creating-a-layout" title="Creating a layout">
              <p>Layouts are UI that is shared between multiple pages...</p>
          </ContentSection>
          <ContentSection id="ar3311" title="Creating a page">
              <p>Pages are UI that are unique to a route...</p>
              <Link scroll={false}  passHref legacyBehavior
                  href="/rep/wjSpD8qsRvGy-zmji0lUK1JlcG9ydA/SLIDING_JJ/1/ar3311#ar3311">编辑某一区域001</Link>
          </ContentSection>

          <ContentSection id="creating-a-layout" title="Creating a layout">
              <p>Layouts are UI that is shared between multiple pages...</p>
          </ContentSection>
        <ContentSection id="creating-a-nested-route" title="Creating a nested route">
          <Link  href={`/rep/SLIDING_JJ/1/KQcbgDF9RO21DsI92H3tTVJlcG9ydA/photos/3`}
                 passHref>
            {555}
          </Link>
          <p>You can create nested routes by nesting folders inside each other...</p>
        </ContentSection>

          <ContentSection id="area23" title="Linking between pages">
              <p>The Link component enables client-side navigation between pages in the application...</p>
          </ContentSection>
          <div className="mt-10">
              <Link scroll={false}  passHref legacyBehavior
                  href="/rep/wjSpD8qsRvGy-zmji0lUK1JlcG9ydA/SLIDING_JJ/1/area23#area23">iqi编辑某一区域002</Link>
          </div>
          <ContentSection id="api-reference" title="API Reference">
              <p>Reference documentation for layout and page related APIs...</p>
          </ContentSection>

          <ContentSection id="api-reference" title="API Reference">
              <p>Reference documentation for layout and page related APIs...</p>
          </ContentSection>

          <ContentSection id="api-reference" title="API Reference">
              <p>Reference documentation for layout and page related APIs...</p>
              <Link
                  href="/rep/wjSpD8qsRvGy-zmji0lUK1JlcG9ydA/SLIDING_JJ/1/">返回</Link>
          </ContentSection>

          <ContentSection id="api-reference" title="API Reference">
              <p>Reference documentation for layout and page related APIs...</p>
          </ContentSection>

          <ContentSection id="api-reference" title="API Reference">
              <p>Reference documentation for layout and page related APIs...</p>
          </ContentSection>
      </section>
  )
}

