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
          <p>Pages are UI that are unique to a route...</p>
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

        <ContentSection id="nesting-layouts" title="Nesting layouts">
          <p>
            By default, layouts in the folder hierarchy are also nested, which means they wrap child layouts via their
            children prop...
          </p>
        </ContentSection>

        <ContentSection id="linking-between-pages" title="Linking between pages">
          <p>The Link component enables client-side navigation between pages in the application...</p>
        </ContentSection>

        <ContentSection id="api-reference" title="API Reference">
          <p>Reference documentation for layout and page related APIs...</p>
        </ContentSection>
          <ContentSection id="nesting-layouts" title="Nesting layouts">
              <p>
                  By default, layouts in the folder hierarchy are also nested, which means they wrap child layouts via their
                  children prop...
              </p>
          </ContentSection>

          <ContentSection id="linking-between-pages" title="Linking between pages">
              <p>The Link component enables client-side navigation between pages in the application...</p>
          </ContentSection>

          <ContentSection id="api-reference" title="API Reference">
              <p>Reference documentation for layout and page related APIs...</p>
          </ContentSection>
          <ContentSection id="nesting-layouts" title="Nesting layouts">
              <p>
                  By default, layouts in the folder hierarchy are also nested, which means they wrap child layouts via their
                  children prop...
              </p>
          </ContentSection>

          <ContentSection id="linking-between-pages" title="Linking between pages">
              <p>The Link component enables client-side navigation between pages in the application...</p>
          </ContentSection>

          <ContentSection id="api-reference" title="API Reference">
              <p>Reference documentation for layout and page related APIs...</p>
          </ContentSection>
          <ContentSection id="nesting-layouts" title="Nesting layouts">
              <p>
                  By default, layouts in the folder hierarchy are also nested, which means they wrap child layouts via their
                  children prop...
              </p>
          </ContentSection>

          <ContentSection id="linking-between-pages" title="Linking between pages">
              <p>The Link component enables client-side navigation between pages in the application...</p>
          </ContentSection>

          <ContentSection id="api-reference" title="API Reference">
              <p>Reference documentation for layout and page related APIs...</p>
          </ContentSection>
          <ContentSection id="nesting-layouts" title="Nesting layouts">
              <p>
                  By default, layouts in the folder hierarchy are also nested, which means they wrap child layouts via their
                  children prop...
              </p>
          </ContentSection>

          <ContentSection id="linking-between-pages" title="Linking between pages">
              <p>The Link component enables client-side navigation between pages in the application...</p>
          </ContentSection>

          <ContentSection id="api-reference" title="API Reference">
              <p>Reference documentation for layout and page related APIs...</p>
          </ContentSection>
          <ContentSection id="nesting-layouts" title="Nesting layouts">
              <p>
                  By default, layouts in the folder hierarchy are also nested, which means they wrap child layouts via their
                  children prop...
              </p>
          </ContentSection>

          <ContentSection id="linking-between-pages" title="Linking between pages">
              <p>The Link component enables client-side navigation between pages in the application...</p>
          </ContentSection>

          <ContentSection id="api-reference" title="API Reference">
              <p>Reference documentation for layout and page related APIs...</p>
          </ContentSection>
          <ContentSection id="nesting-layouts" title="Nesting layouts">
              <p>
                  By default, layouts in the folder hierarchy are also nested, which means they wrap child layouts via their
                  children prop...
              </p>
          </ContentSection>

          <ContentSection id="linking-between-pages" title="Linking between pages">
              <p>The Link component enables client-side navigation between pages in the application...</p>
          </ContentSection>

          <ContentSection id="api-reference" title="API Reference">
              <p>Reference documentation for layout and page related APIs...</p>
          </ContentSection>
          <ContentSection id="nesting-layouts" title="Nesting layouts">
              <p>
                  By default, layouts in the folder hierarchy are also nested, which means they wrap child layouts via their
                  children prop...
              </p>
          </ContentSection>

          <ContentSection id="linking-between-pages" title="Linking between pages">
              <p>The Link component enables client-side navigation between pages in the application...</p>
          </ContentSection>

          <ContentSection id="api-reference" title="API Reference">
              <p>Reference documentation for layout and page related APIs...</p>
          </ContentSection>
          <ContentSection id="nesting-layouts" title="Nesting layouts">
              <p>
                  By default, layouts in the folder hierarchy are also nested, which means they wrap child layouts via their
                  children prop...
              </p>
          </ContentSection>

          <ContentSection id="linking-between-pages" title="Linking between pages">
              <p>The Link component enables client-side navigation between pages in the application...</p>
          </ContentSection>

          <ContentSection id="api-reference" title="API Reference">
              <p>Reference documentation for layout and page related APIs...</p>
          </ContentSection>
          <ContentSection id="nesting-layouts" title="Nesting layouts">
              <p>
                  By default, layouts in the folder hierarchy are also nested, which means they wrap child layouts via their
                  children prop...
              </p>
          </ContentSection>

          <ContentSection id="linking-between-pages" title="Linking between pages">
              <p>The Link component enables client-side navigation between pages in the application...</p>
          </ContentSection>

          <ContentSection id="api-reference" title="API Reference">
              <p>Reference documentation for layout and page related APIs...</p>
          </ContentSection>
      </section>
  )
}

