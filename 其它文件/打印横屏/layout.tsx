'use client'

import {useEffect} from 'react'
import type {Metadata} from 'next'

import {ReactNode,} from "react";


export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    useEffect(() => {
        const printArea = document.querySelector("#print-area");
        const printButton = document.querySelector("#print");
        const printOption = document.querySelector("#printStyle");

        if (printArea && printButton && printOption) {
            const handlePrintOptionChange = (event: Event) => {
                const target = event.target as HTMLSelectElement;
                if (target.value === "single") {
                    (printArea as HTMLElement).dataset.print = "paged";
                } else if (target.value === "grouped") {
                    (printArea as HTMLElement).dataset.print = "grouped";
                } else {
                    (printArea as HTMLElement).dataset.print = "single";
                }
            };

            const handlePrintClick = () => {
                window.print();
            };

            printOption.addEventListener("change", handlePrintOptionChange);
            printButton.addEventListener("click", handlePrintClick);

            // Cleanup event listeners
            return () => {
                printOption.removeEventListener("change", handlePrintOptionChange);
                printButton.removeEventListener("click", handlePrintClick);
            };
        }
    }, []); // Empty dependency array means this runs once after initial render

    return (
        <html lang="en">
        <head>
            <style>
                {`
        body {
            padding: 0;
            margin: 0;
        }

        svg:not(:root) {
            display: block;
        }

        .playable-code {
            background-color: #f4f7f8;
            border: none;
            border-left: 6px solid #558abb;
            border-width: medium medium medium 6px;
            color: #4d4e53;
            height: 100px;
            width: 90%;
            padding: 10px 10px 0;
        }

        .playable-canvas {
            border: 1px solid #4d4e53;
            border-radius: 2px;
        }

        .playable-buttons {
            text-align: right;
            width: 90%;
            padding: 5px 10px 5px 26px;
        }
        
          fieldset {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            gap: 1rem;
            width: fit-content;
        }

        @page toc {
            size: a4 portrait;
            @top-middle {
                content: "Table of contents";
            }
        }

        @page foreword {
            size: a4 portrait;
            @top-middle {
                content: "Foreword";
            }
        }

        @page introduction {
            size: a4 portrait;
            @top-middle {
                content: "Introduction";
            }
        }

        @page conclusion {
            size: a4 portrait;
            @top-middle {
                content: "Conclusion";
            }
        }

        @page chapter {
            size: a4 landscape;
            @top-middle {
                content: "Chapter";
            }
        }
        @page chapterEF {
            size: a4 landscape;
        }

        @media print {
            fieldset {
                display: none;
            }
            section {
                font-size: 2rem;
                font-family: Roboto;
            }
            .chapter {
                border: tomato 2px solid;
            }
            [data-print="grouped"] > #toc,
            [data-print="paged"] > #toc {
                page: toc;
                font-family: Courier;
            }
            [data-print="grouped"] > #foreword,
            [data-print="paged"] > #foreword {
                page: foreword;
                font-family: Courier;
            }
            [data-print="grouped"] > #introduction,
            [data-print="paged"] > #introduction {
                page: introduction;
                font-family: Courier;
            }
            [data-print="grouped"] > #conclusion,
            [data-print="paged"] > #conclusion {
                page: conclusion;
                font-family: Courier;
            }
            [data-print="grouped"] > .chapter,
            .chapter {
                page: chapterEF;
            }
            [data-print="paged"] > .chapter {
                border: none;
            }
            .chapter > ul {
                columns: 2;
            }
        }
              `}
            </style>
        </head>
        <body>
        <fieldset id="printStyle">
            <legend>How would you like to print</legend>
            <label htmlFor="single"
            ><input type="radio" id="single" name="type" value="single" checked/>No
                Pages</label
            >
            <label htmlFor="grouped"
            ><input type="radio" id="grouped" name="type" value="grouped"/>Pages with
                Grouped Chapters</label
            >
            <label htmlFor="paged"
            ><input type="radio" id="paged" name="type" value="paged"/>Chapters
                Paged</label
            >
            <button id="print">Print</button>
        </fieldset>
        <article id="print-area" data-print="paged">
            <section id="toc">
                <h2>Table of contents</h2>
                <ul>
                    <li>Foreword</li>
                    <li>Introduction</li>
                    <li>Chapter One - named pages</li>
                    <li>Chapter Two - page orientation</li>
                    <li>Chapter Three - page margins</li>
                    <li>Conclusion</li>
                </ul>
            </section>
            <section id="foreword">
                <h2>Foreword</h2>
                <p>
                    This book is all about how the CSS <code>@page</code> at-rule can help
                    with printing HTML books.
                </p>
            </section>
            <section id="introduction">
                <h2>Introduction</h2>
                <p>
                    This book is a concept to show how an <em>HTML</em> document can easily be
                    printed out in pages.
                </p>
            </section>
            <section id="chapter1" className="chapter">
                <h2>Named pages</h2>
                <p>Lorem ipsum</p>
            </section>
            <section id="chapter2" className="chapter">
                <h2>Page Orientation</h2>
                <p>Lorem ipsum</p>
            </section>
            <section id="chapter3" className="chapter">
                <h2>Page Margins</h2>
                <p>There are 16 page margins that can be set:</p>
                <ul>
                    <li>@top-left-corner</li>
                    <li>@top-left</li>
                    <li>@top-middle</li>
                    <li>@top-right</li>
                    <li>@top-right-corner</li>
                    <li>@left-top</li>
                    <li>@left-middle</li>
                    <li>@left-bottom</li>
                    <li>@right-top</li>
                    <li>@right-middle</li>
                    <li>@right-bottom</li>
                    <li>@bottom-left-corner</li>
                    <li>@bottom-left</li>
                    <li>@bottom-middle</li>
                    <li>@bottom-right</li>
                    <li>@bottom-right-corner</li>
                </ul>
                <p>They can be used to show what appears in these parts of the margin</p>
            </section>
            <section id="conclusion">
                <h2>Conclusion</h2>
                <p>Now go ahead and write books.</p>
            </section>
        </article>


        {children}
        </body>
        </html>
    );
}

/*
打印：（1）已经实现的： 硬编码： 最大10张打印纸的；A4 边距 尺寸-竖版固定数值的；可以实现最少给某些标记td预留最小的孤立空间高度，避免在分页尾巴仅仅打印出很少高度的td内容。
参考 D:\temp\newUI\print-table-control\advanced-print-control.tsx
D:\temp\newUI\print-table-TR-contain
* */