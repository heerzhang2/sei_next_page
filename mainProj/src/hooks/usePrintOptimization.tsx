// usePrintOptimization.tsx
import { useEffect, useRef } from 'react';

interface PrintOptimizationOptions {
    specialRowClass?: string;
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

/**
 * A custom React Hook that optimizes table printing by ensuring important cells
 * have content on each page when a row spans multiple pages.
 */
export function usePrintOptimization({
                                         specialRowClass = 'special-row',
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

        .${specialRowClass} {
          page-break-inside: auto;
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
                // Get all special rows in this table
                const rows = table.querySelectorAll(`.${specialRowClass}`);

                // Process each row
                rows.forEach(row => {
                    // Get all important cells in this row
                    const importantCells = row.querySelectorAll(`.${importantCellClass}`);

                    // Measure the row height
                    const rowHeight = row.offsetHeight;

                    // Calculate how many pages this row will span
                    const pagesSpanned = Math.ceil(rowHeight / printPageDimensions.contentHeight);

                    // Only proceed if the row spans multiple pages
                    if (pagesSpanned > 1) {
                        // Process each important cell in the row
                        importantCells.forEach(cell => {
                            // Generate a truly unique key for this cell
                            const cellKey = generateUniqueCellKey(cell, tableIndex);

                            // Save the original content if we haven't already
                            if (!originalContentsRef.current.has(cellKey)) {
                                originalContentsRef.current.set(cellKey, cell.innerHTML);
                            }

                            const cellContent = originalContentsRef.current.get(cellKey) || '';

                            // Measure the height of the original content
                            const contentHeight = getTextHeight(cellContent, cell);

                            // If content doesn't fill all pages
                            if (contentHeight < rowHeight) {
                                // Calculate how to distribute content across pages
                                const contentPerPage = distributeContent(
                                    cellContent,
                                    pagesSpanned,
                                    printPageDimensions.contentHeight,
                                    continuationPrefix
                                );

                                // Set the new content that will fill each page appropriately
                                cell.innerHTML = contentPerPage.join('<div class="page-break"></div>');
                            }
                        });
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
    }, [specialRowClass, importantCellClass, continuationPrefix, paperFormat, orientation, margins]);

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

/*
        style.textContent = `
      @media print {
        .page-break {
          page-break-before: always;
        }

        .${specialRowClass} {
          page-break-inside: auto;
        }

        .${importantCellClass} {
          page-break-inside: auto;
        }
      }
    `;
        document.head.appendChild(style);
* */