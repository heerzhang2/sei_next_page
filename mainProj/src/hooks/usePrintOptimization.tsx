// usePrintOptimization.tsx
import { useEffect, useRef } from 'react';

interface PrintOptimizationOptions {
    importantCellClass?: string;
    continuationPrefix?: string;
    paperFormat?: 'a4' | 'letter' | 'legal' | 'a3';
    orientation?: 'portrait' | 'landscape';
    margins?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
    };
}

/**支持用.important-cell来标注特殊处理的单元格: 【目的是】跨页打印，适当考虑重复打印的某些列因为，跨越行数太多的或者因为其它的td列大内容高度，导致的空空荡荡的情形。
 * A custom React Hook that optimizes table printing by ensuring important cells
 * have content on each page when a row spans multiple pages.
 * 【注意】配套的打印时刻浏览器宽度=纸张宽度，否则会不正常。
 */
export function usePrintOptimization({
                                         importantCellClass = 'important-cell',
                                         continuationPrefix = '(续) ',
                                         paperFormat = 'a4',
                                         orientation = 'portrait',
                                         margins = { top: 15, right: 15, bottom: 15, left: 15 }
                                     }: PrintOptimizationOptions = {}) {
    // Store original content for cells
    const originalContentsRef = useRef(new Map<string, string>());

    useEffect(() => {
        // Add print-specific CSS
        const style = document.createElement('style');
        style.textContent = `
      @media print {
        .page-break {
          page-break-before: always;
        }

        .${importantCellClass} {
          page-break-inside: auto;
        }
      }
    `;
        document.head.appendChild(style);

        // Add data-table-id attributes to tables for more reliable identification
        document.querySelectorAll('table').forEach((table, index) => {
            if (!table.hasAttribute('data-table-id')) {
                table.setAttribute('data-table-id', `table-${index}`);
            }
        });

        // Function to prepare tables for printing
        const prepareTableForPrinting = () => {
            // Calculate print page dimensions based on paper format and orientation
            const printPageDimensions = getPrintPageDimensions(paperFormat, orientation, margins);

            // Get all tables that contain special rows
            const tables = document.querySelectorAll('table');

            // Process each table
            tables.forEach((table, tableIndex) => {
                    // Get all important cells in this row
                    const importantCells = table.querySelectorAll(`.${importantCellClass}`);
                        // Process each important cell in the row
                        importantCells.forEach(cell => {
                            // Measure the td Cell height
                            const cellHeight = cell.offsetHeight;
                            // Generate a truly unique key for this cell
                            const cellKey = generateUniqueCellKey(cell, tableIndex);

                            // Save the original content if we haven't already
                            if (!originalContentsRef.current.has(cellKey)) {
                                originalContentsRef.current.set(cellKey, cell.innerHTML);
                            }

                            const cellContent = originalContentsRef.current.get(cellKey) || '';

                            // Measure the height of the original content
                            const contentHeight = getTextHeight(cellContent, cell);

                            //看下td起点位置：
                            const tdContentStart=cell.offsetTop/ printPageDimensions.contentHeight;
                            const tdContentEnd=(cell.offsetTop +contentHeight)/ printPageDimensions.contentHeight;
                            const tdBottom=(cell.offsetTop +cellHeight)/ printPageDimensions.contentHeight;

                            // Calculate how many pages this row will span
                            // const pagesSpanned = Math.ceil(cellHeight / printPageDimensions.contentHeight);
                            const startpage=Math.ceil(tdContentStart);
                            const endpage=Math.ceil(tdContentEnd);
                            //这里面测量太不精确了，而且浏览器宽度必须限定为打印规定纸张的宽度
                            const bottompage=Math.ceil(tdBottom);
                            const deta=tdBottom-tdContentStart;
                            const myoccupy=tdContentEnd-tdContentStart;
                            // Only proceed if the td Cell spans multiple pages, deta最少半张纸张高度的。
                            //针对打印时小于一个纸张高度的单元格，还必须【假定前提必须满足】这个单元打印高度必须小于打印纸张高度方向的一半。
                            if (deta>=1 || (myoccupy<=0.5 && startpage !==bottompage) ) {
                                // If content doesn't fill all pages
                                if (bottompage-startpage>0) {
                                    // Calculate how to distribute content across pages
                                    const contentPerPage = distributeContent(
                                        cellContent,
                                        bottompage-startpage,
                                        printPageDimensions.contentHeight,
                                        continuationPrefix
                                    );

                                    // Set the new content that will fill each page appropriately
                                    cell.innerHTML = contentPerPage.join('<div class="page-break"></div>');
                                }
                            }
                        });

            });
        };

        // Function to restore tables after printing
        const restoreTableAfterPrinting = () => {
            // Get all tables
            const tables = document.querySelectorAll('table');

            // Process each table
            tables.forEach((table, tableIndex) => {
                // Get all important cells in this table
                const importantCells = table.querySelectorAll(`.${importantCellClass}`);

                // Restore each cell's original content
                importantCells.forEach(cell => {
                    const cellKey = generateUniqueCellKey(cell, tableIndex);
                    if (originalContentsRef.current.has(cellKey)) {
                        cell.innerHTML = originalContentsRef.current.get(cellKey) || '';
                    }
                });
            });
        };

        // Add event listeners for before and after printing
        window.addEventListener('beforeprint', prepareTableForPrinting);
        window.addEventListener('afterprint', restoreTableAfterPrinting);

        // Clean up event listeners when component unmounts
        return () => {
            window.removeEventListener('beforeprint', prepareTableForPrinting);
            window.removeEventListener('afterprint', restoreTableAfterPrinting);
            document.head.removeChild(style);
        };
    }, [importantCellClass, continuationPrefix, paperFormat, orientation, margins]);

    // Helper function to get print page dimensions based on paper format and orientation
    function getPrintPageDimensions(
        format: 'a4' | 'letter' | 'legal' | 'a3',
        orient: 'portrait' | 'landscape',
        pageMargins: { top?: number; right?: number; bottom?: number; left?: number }
    ) {
        // Paper dimensions in mm (width, height)
        const paperSizes = {
            a4: { width: 210, height: 297 },
            letter: { width: 215.9, height: 279.4 },
            legal: { width: 215.9, height: 355.6 },
            a3: { width: 297, height: 420 }
        };

        // Get the base dimensions for the selected paper format
        let { width, height } = paperSizes[format];

        // Swap dimensions for landscape orientation
        if (orient === 'landscape') {
            [width, height] = [height, width];
        }

        // Convert mm to pixels (assuming 96 DPI)
        const mmToPixels = 3.7795275591;
        const widthPx = width * mmToPixels;
        const heightPx = height * mmToPixels;

        // Calculate content area dimensions after applying margins
        const marginTop = (pageMargins.top || 0) * mmToPixels;
        const marginRight = (pageMargins.right || 0) * mmToPixels;
        const marginBottom = (pageMargins.bottom || 0) * mmToPixels;
        const marginLeft = (pageMargins.left || 0) * mmToPixels;

        const contentWidth = widthPx - marginLeft - marginRight;
        const contentHeight = heightPx - marginTop - marginBottom;

        return {
            width: widthPx,
            height: heightPx,
            contentWidth,
            contentHeight,
            margins: {
                top: marginTop,
                right: marginRight,
                bottom: marginBottom,
                left: marginLeft
            }
        };
    }

    // Helper function to generate a unique key for each cell (same as before)
    function generateUniqueCellKey(cell: Element, tableIndex: number): string {
        // Create a path from the cell to its table to handle nesting
        let path: string[] = [];
        let currentTable = cell.closest('table');
        let currentElement: Element | null = cell;

        // Build the path from cell to its immediate table
        while (currentElement !== currentTable && currentElement !== null) {
            if (currentElement.tagName === 'TD' || currentElement.tagName === 'TH') {
                // For cells, get their column index within their row
                const row = currentElement.parentNode as Element;
                const cellIndex = Array.from(row.children).indexOf(currentElement);
                path.push(`c${cellIndex}`);
            } else if (currentElement.tagName === 'TR') {
                // For rows, get their row index within their section or table
                const section = currentElement.parentNode as Element;
                const rowIndex = Array.from(section.children).indexOf(currentElement);
                path.push(`r${rowIndex}`);
            } else if (currentElement.tagName === 'TBODY' || currentElement.tagName === 'THEAD' || currentElement.tagName === 'TFOOT') {
                // For table sections, note which section it is
                path.push(currentElement.tagName.toLowerCase());
            }

            currentElement = currentElement.parentNode as Element;
        }

        // Add a unique identifier for the table itself
        const tableId = currentTable?.dataset.tableId || `table-${tableIndex}`;
        path.push(tableId);

        // Reverse the path to go from table to cell and join with dashes
        return path.reverse().join('-');
    }

    // Helper function to measure text height (same as before)
    function getTextHeight(text: string, element: Element): number {
        const testDiv = document.createElement('div');
        testDiv.style.visibility = 'hidden';
        testDiv.style.position = 'absolute';
        testDiv.style.width = window.getComputedStyle(element).width;
        testDiv.style.font = window.getComputedStyle(element).font;
        testDiv.innerHTML = text;

        document.body.appendChild(testDiv);
        const height = testDiv.offsetHeight;
        document.body.removeChild(testDiv);

        return height;
    }

    // Helper function to distribute content across pages (same as before)
    function distributeContent(content: string, pages: number, pageHeight: number, prefix: string): string[] {
        const result: string[] = [];
        //控制太不精确了，导致可能太多了，从而导致超出目标区域做打印呢。 不能 改成 i <= pages；还是：宁可最后一页可能是空白的！
        for (let i = 0; i < pages; i++) {
            if (i === 0) {
                result.push(content);
            } else {
                result.push(`${prefix}${content}`);
            }
        }

        return result;
    }
}
