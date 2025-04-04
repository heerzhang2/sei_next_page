//元素加注className="important-cell" 配合useMediaPrint和 PageSectionOrientation/PrintSettingsProvider来实现table..td内容打印时刻的复制功能。
// 添加解析尺寸字符串为像素值的函数
export function parseSizeToPixels(size: string): number {
  // 创建临时元素来测量
  const div = document.createElement("div")
  div.style.position = "absolute"
  div.style.visibility = "hidden"
  div.style.width = size
  document.body.appendChild(div)

  const pixels = div.offsetWidth
  document.body.removeChild(div)

  return pixels
}

// 修改 getCurrentPaperSettings 函数，使其更准确地获取当前纸张设置
export function getCurrentPaperSettings(): { size: string; margin?: string } {
  if (typeof document === "undefined") {
    return { size: "A4", margin: "1cm" }
  }

  // 尝试从CSS变量获取
  const size = document.documentElement.style.getPropertyValue("--paper-size") || "A4"
  const margin = document.documentElement.style.getPropertyValue("--paper-margin") || "1cm"

  // 如果是自定义尺寸，检查宽度和高度变量
  if (size === "custom") {
    const width = document.documentElement.style.getPropertyValue("--custom-paper-width") || "210mm"
    const height = document.documentElement.style.getPropertyValue("--custom-paper-height") || "297mm"
    return { size: `${width} ${height}`, margin }
  }

  return { size, margin }
}

// 修改 getPaperDimensions 函数，使其更准确地处理纸张尺寸
export function getPaperDimensions(
    paperSize = "A4",
    paperMargin = "1cm",
    orientation: "portrait" | "landscape" = "portrait",
) {
  // 解析纸张尺寸 - 始终以纵向（portrait）获取原始尺寸
  let portraitWidth: number, portraitHeight: number

  if (paperSize === "A4") {
    portraitWidth = parseSizeToPixels("210mm")
    portraitHeight = parseSizeToPixels("297mm")
  } else if (paperSize === "letter") {
    portraitWidth = parseSizeToPixels("8.5in")
    portraitHeight = parseSizeToPixels("11in")
  } else if (paperSize === "legal") {
    portraitWidth = parseSizeToPixels("8.5in")
    portraitHeight = parseSizeToPixels("14in")
  } else if (paperSize === "A3") {
    portraitWidth = parseSizeToPixels("297mm")
    portraitHeight = parseSizeToPixels("420mm")
  } else if (paperSize.includes(" ")) {
    // 处理自定义尺寸，如 "210mm 297mm"：宽 高；  【约束】中间必须有空格的
    const [widthStr, heightStr] = paperSize.split(/\s+/)
    portraitWidth = parseSizeToPixels(widthStr)
    portraitHeight = parseSizeToPixels(heightStr)
  } else {
    // 默认为A4
    portraitWidth = parseSizeToPixels("210mm")
    portraitHeight = parseSizeToPixels("297mm")
  }

  // 计算边距
  const marginLeft = parseSizeToPixels(paperMargin)
  const marginRight = marginLeft // 假设四边边距相同
  const marginTop = marginLeft
  const marginBottom = marginLeft

  // 计算纵向内容区域尺寸
  const portraitContentWidth = portraitWidth - marginLeft - marginRight
  const portraitContentHeight = portraitHeight - marginTop - marginBottom

  // 计算横向内容区域寸 - 交换宽度和高度
  const landscapeWidth = portraitHeight
  const landscapeHeight = portraitWidth
  const landscapeContentWidth = portraitContentHeight
  const landscapeContentHeight = portraitContentWidth

  return {
    portrait: {
      width: portraitWidth,
      height: portraitHeight,
      contentWidth: portraitContentWidth,
      contentHeight: portraitContentHeight,
    },
    landscape: {
      width: landscapeWidth,
      height: landscapeHeight,
      contentWidth: landscapeContentWidth,
      contentHeight: landscapeContentHeight,
    },
  }
}

// 完全重写 measureElementInPrintMedia 函数，以正确克隆整个表格层次结构
export function measureElementInPrintMedia(element: HTMLElement): {
  width: number
  height: number
  contentHeight: number
} {
  if (!element) return { width: 0, height: 0, contentHeight: 0 }

  // 获取当前纸张设置
  const paperSettings = getCurrentPaperSettings()

  // 找到元素所在的方向上下文
  const { orientation } = findParentSection(element)

  // 获取纸张尺寸信息
  const paperDimensions = getPaperDimensions(paperSettings.size, paperSettings.margin, orientation)

  // 创建一个模拟打印环境的容器
  const container = document.createElement("div")
  container.style.position = "absolute"
  container.style.visibility = "hidden"
  container.style.width = `${paperDimensions[orientation].contentWidth}px`
  container.style.left = "-9999px"
  container.style.overflow = "visible" // 确保内容不会被裁剪
  document.body.appendChild(container)

  try {
    // 保存原始媒体类型
    const originalMedia: string | undefined = document.documentElement.style.media

    // 切换到打印媒体类型
    document.documentElement.style.media = "print"

    // 查找元素所在的表格层次结构
    const tableHierarchy = findTableHierarchy(element)

    if (tableHierarchy.length === 0) {
      // 如果没有找到表格，直接克隆元素
      const clone = element.cloneNode(true) as HTMLElement
      container.appendChild(clone)

      // 强制重排以应用打印样式
      window.dispatchEvent(new Event("resize"))
      document.body.offsetHeight // 触发重排

      // 测量克隆元素的尺寸
      const width = clone.offsetWidth
      const height = clone.offsetHeight

      // 测量内部内容高度
      const contentHeight = measureInnerContentHeight(clone)

      return { width, height, contentHeight }
    }

    // 获取最外层表格
    const outerTable = tableHierarchy[0]

    // 克隆整个表格结构
    const tableClone = outerTable.cloneNode(true) as HTMLTableElement
    container.appendChild(tableClone)

    // 强制重排以应用打印样式
    window.dispatchEvent(new Event("resize"))
    document.body.offsetHeight // 触发重排

    // 在克隆的表格中找到对应的元素
    let elementClone: HTMLElement | null = null

    if (tableHierarchy.length === 1) {
      // 如果只有一层表格，直接在克隆的表格中查找元素
      const cellId = element.dataset.cellId
      if (cellId) {
        elementClone = tableClone.querySelector(`[data-cell-id="${cellId}"]`) as HTMLElement
      } else {
        // 尝试通过位置查找
        const originalCells = Array.from(outerTable.querySelectorAll("td, th"))
        const index = originalCells.indexOf(element as HTMLTableCellElement)
        if (index >= 0) {
          const clonedCells = Array.from(tableClone.querySelectorAll("td, th"))
          elementClone = clonedCells[index] as HTMLElement
        }
      }
    } else {
      // 如果有多层表格，需要逐层查找
      let currentClone = tableClone

      for (let i = 1; i < tableHierarchy.length; i++) {
        const originalTable = tableHierarchy[i]
        const originalParent = originalTable.parentElement

        if (!originalParent) continue

        // 找到原始表格在其父元素中的位置
        const children = Array.from(originalParent.children)
        const index = children.indexOf(originalTable)

        // 在克隆的结构中找到对应的表格
        const cloneParent =
            currentClone.querySelector(`[data-cell-id="${originalParent.dataset.cellId}"]`) || currentClone
        const clonedTables = Array.from(cloneParent.querySelectorAll("table"))

        if (index >= 0 && index < clonedTables.length) {
          currentClone = clonedTables[index] as HTMLTableElement
        } else {
          break
        }
      }

      // 最后在最内层的表格中查找元素
      const cellId = element.dataset.cellId
      if (cellId) {
        elementClone = currentClone.querySelector(`[data-cell-id="${cellId}"]`) as HTMLElement
      }
    }

    // 如果找到了克隆的元素，测量它
    if (elementClone) {
      const width = elementClone.offsetWidth
      const height = elementClone.offsetHeight

      // 测量内部内容高度
      const contentHeight = measureInnerContentHeight(elementClone)

      return { width, height, contentHeight }
    }

    // 如果没有找到克隆的元素，回退到直接测量原始元素
    return {
      width: element.offsetWidth,
      height: element.offsetHeight,
      contentHeight: measureInnerContentHeight(element),
    }
  } finally {
    // 清理
    document.body.removeChild(container)

    // 恢复原始媒体类型
    if (originalMedia) {
      document.documentElement.style.media = originalMedia
    } else {
      document.documentElement.style.media = ""
    }

    // 再次强制重排以恢复原始样式
    window.dispatchEvent(new Event("resize"))
    document.body.offsetHeight // 触发重排
  }
}

// 测量元素td的内部内容片段的高度： 底下的.width = `${element.offsetWidth}px`可能存在小数点/整数会有的误差的。
function measureInnerContentHeight(element: HTMLElement): number {
  // 创建一个临时容器来存放内容
  const tempContainer = document.createElement("div")
  tempContainer.style.position = "absolute"
  tempContainer.style.visibility = "hidden"
  tempContainer.style.left = "-9999px"
  tempContainer.style.width = `${element.offsetWidth}px` // 使用与元素相同的宽度
  document.body.appendChild(tempContainer)

  try {
    // 克隆所有子元素到临时容器
    Array.from(element.childNodes).forEach((node) => {
      // 排除嵌套表格和隐藏容器
      if (
          !(node instanceof HTMLElement) ||
          (!node.classList.contains("original-content-container"))
      ) {
        tempContainer.appendChild(node.cloneNode(true))
      }
    })

    // 测量临时容器的高度
    return tempContainer.offsetHeight
  } finally {
    // 清理
    document.body.removeChild(tempContainer)
  }
}

// 批量测量所有重要单元格的函数 ：首先测量，最后复制片段到表格td;打印完成需恢复。  ?noImptCopy=1
export function batchMeasureImportantCells(): Record<string, { height: number; contentHeight: number }> {
  console.log("开始批量测量所有重要单元格")

  // 检查 URL 参数是否禁用 important-cell 功能
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search)
    const noImptCopy = urlParams.get("noImptCopy") === "1"

    if (noImptCopy) {
      console.log("检测到 noImptCopy=1 参数，禁用 important-cell 单元格的测量功能")
      return {}
    }
  }

  // 获取当前纸张设置
  const paperSettings = getCurrentPaperSettings()

  // 创建结果对象
  const cellMeasurements: Record<string, { height: number; contentHeight: number }> = {}

  // 查找所有带有 important-cell 类的单元格
  const importantCells = document.querySelectorAll(".important-cell")

  if (importantCells.length === 0) {
    console.log("未找到重要单元格")
    return cellMeasurements
  }

  console.log(`找到 ${importantCells.length} 个重要单元格`)

  // 按打印区域分组单元格，以便一次性处理同一打印区域中的所有单元格
  const sectionGroups = new Map<HTMLElement, HTMLElement[]>()

  // 为每个单元格分配ID并按打印区域分组
  importantCells.forEach((cell, index) => {
    const htmlCell = cell as HTMLElement

    // 确保单元格有ID
    if (!htmlCell.dataset.cellId) {
      htmlCell.dataset.cellId = `cell-${index}`
    }

    // 找到包含此单元格的打印区域
    const { element: printSection } = findParentSection(htmlCell)

    if (!printSection) {
      console.warn(`单元格 ${htmlCell.dataset.cellId} 不在打印区域内`)
      return
    }

    // 获取打印区域下的第一个子元素作为克隆的根元素
    let rootElement = printSection

    // 如果打印区域有子元素，使用第一个子元素
    if (printSection.children.length > 0) {
      // 查找第一个包含表格的子元素
      let foundTableContainer = false
      for (let i = 0; i < printSection.children.length; i++) {
        const child = printSection.children[i] as HTMLElement
        if (child.querySelector("table")) {
          rootElement = child
          foundTableContainer = true
          break
        }
      }

      // 如果没有找到包含表格的子元素，使用第一个子元素
      if (!foundTableContainer && printSection.firstElementChild) {
        rootElement = printSection.firstElementChild as HTMLElement
      }
    }

    // 将单元格添加到对应打印区域的组中
    if (!sectionGroups.has(rootElement)) {
      sectionGroups.set(rootElement, [])
    }
    sectionGroups.get(rootElement)!.push(htmlCell)
  })

  // 保存原始媒体类型
  let originalMedia: string | undefined

  try {
    originalMedia = document.documentElement.style.media

    // 切换到打印媒体类型
    document.documentElement.style.media = "print"

    // 处理每个打印区域组
    sectionGroups.forEach((cells, rootElement) => {
      console.log(`处理打印区域中的 ${cells.length} 个单元格`)

      // 找到打印区域所在的方向上下文
      const { orientation } = findParentSection(rootElement)

      // 获取纸张尺寸信息
      const paperDimensions = getPaperDimensions(paperSettings.size, paperSettings.margin, orientation)

      // 创建一个模拟打印环境的容器
      const container = document.createElement("div")
      container.style.position = "absolute"
      container.style.visibility = "hidden"
      container.style.width = `${paperDimensions[orientation].contentWidth}px`
      container.style.left = "-9999px"
      container.style.overflow = "visible"
      document.body.appendChild(container)

      // 修改：直接克隆整个文档结构，而不仅仅是根元素
      // 这样可以确保所有的单元格都被正确克隆，包括它们的 data-cell-id 属性
      const documentClone = document.documentElement.cloneNode(true) as HTMLElement
      container.appendChild(documentClone)

      // 强制重排以应用打印样式
      window.dispatchEvent(new Event("resize"))
      document.body.offsetHeight

      // 在克隆的结构中找到并测量每个单元格
      cells.forEach((cell) => {
        const cellId = cell.dataset.cellId!

        // 修改：在整个克隆的文档中查找对应的单元格，而不仅仅是在根元素中
        const cellClone = documentClone.querySelector(`[data-cell-id="${cellId}"]`) as HTMLElement

        if (cellClone) {
          // 测量克隆的单元格
          const height = cellClone.offsetHeight

          // 测量内部内容高度
          const contentHeight = measureInnerContentHeight(cellClone)

          // 检查是否有shouldHeight属性
          const shouldHeight = cell.dataset.shouldHeight ? Number.parseInt(cell.dataset.shouldHeight, 10) : null

          // 如果有shouldHeight，取测量高度和shouldHeight的最大值   【预留】shouldHeight属性设置取值办法。
          let finalHeight = height
          if (shouldHeight !== null) {
            finalHeight = Math.max(height, shouldHeight)
            console.log(
                `单元格 ${cellId} 高度: 测量值=${height}px, shouldHeight=${shouldHeight}px, 最终使用=${finalHeight}px`,
            )
          }

          // 保存测量结果
          cellMeasurements[cellId] = {
            height: finalHeight,
            contentHeight: contentHeight,
          }
          console.log(`单元格 ${cellId}: 高度 = ${finalHeight}px, 内容高度 = ${contentHeight}px (批量测量)`)
        } else {
          console.warn(`在克隆的结构中未找到单元格 ${cellId}，使用直接测量方法`)

          // 修改：如果在克隆结构中找不到单元格，直接测量原始单元格
          const { height, contentHeight } = measureCellHeightWithPrintMedia(cell)

          // 保存测量结果
          cellMeasurements[cellId] = {
            height,
            contentHeight,
          }
          console.log(`单元格 ${cellId}: 高度 = ${height}px, 内容高度 = ${contentHeight}px (直接测量)`)
        }
      })

      // 清理容器
      document.body.removeChild(container)
    })

    console.log("完成批量测量所有单元格高度")
    return cellMeasurements
  } finally {
    // 恢复原始媒体类型
    if (originalMedia) {
      document.documentElement.style.media = originalMedia
    }

    // 再次强制重排以恢复原始样式
    window.dispatchEvent(new Event("resize"))
    document.body.offsetHeight
  }
}

// 修改 measureCellHeightWithPrintMedia 函数，使用新的准确测量方法
export function measureCellHeightWithPrintMedia(cell: HTMLElement): { height: number; contentHeight: number } {
  if (!cell) return { height: 0, contentHeight: 0 }

  // 检查 URL 参数是否禁用 important-cell 功能
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search)
    const noImptCopy = urlParams.get("noImptCopy") === "1"

    if (noImptCopy) {
      console.log("检测到 noImptCopy=1 参数，禁用 important-cell 单元格的测量功能")
      return { height: 0, contentHeight: 0 }
    }
  }

  try {
    // 检查是否有shouldHeight属性
    const shouldHeight = cell.dataset.shouldHeight ? Number.parseInt(cell.dataset.shouldHeight, 10) : null

    // 清除所有可能的嵌套表格，避免高度累加
    // const nestedTables = Array.from(cell.querySelectorAll(".nested-table"))
    // const nestedTablesBackup = nestedTables.map((table) => ({
    //   element: table,
    //   parent: table.parentNode,
    //   nextSibling: table.nextSibling,
    // }))

    // 临时移除嵌套表格
    // nestedTables.forEach((table) => {
    //   if (table.parentNode) {
    //     table.parentNode.removeChild(table)
    //   }
    // })

    // 找到包含此单元格的表格
    const table = cell.closest("table") as HTMLTableElement
    if (!table) {
      console.warn("单元格不在表格内")
      return { height: 0, contentHeight: 0 }
    }

    // 使用新的准确测量方法
    const { height: measuredHeight, contentHeight } = measureElementInPrintMedia(cell)

    // 恢复嵌套表格
    // nestedTablesBackup.forEach(({ element, parent, nextSibling }) => {
    //   if (parent) {
    //     parent.insertBefore(element, nextSibling)
    //   }
    // })

    // 如果测量失败（返回0），但有shouldHeight，则直接使用shouldHeight
    if (measuredHeight <= 0 && shouldHeight !== null) {
      console.log(`测量高度为0，使用指定的shouldHeight: ${shouldHeight}px`)
      return { height: shouldHeight, contentHeight }
    }

    // 如果有shouldHeight参数，取测量高度和shouldHeight的最大值
    let finalHeight = measuredHeight
    if (shouldHeight !== null) {
      finalHeight = Math.max(measuredHeight, shouldHeight)
      console.log(`单元格高度: 测量值=${measuredHeight}px, shouldHeight=${shouldHeight}px, 最终使用=${finalHeight}px`)
    }

    // 如果最终高度仍为0，使用一个合理的默认值
    if (finalHeight <= 0) {
      // 使用单元格的当前高度作为备用
      finalHeight = cell.offsetHeight || 300 // 默认至少300px
      console.log(`无法测量高度，使用备用高度: ${finalHeight}px`)
    }

    // 如果测量成功且高度大于0
    if (finalHeight > 0 && cell.dataset.cellId) {
      // 获取打印准备实例并更新高度
      const printPrep = getPrintPreparation()
      printPrep.cellHeights[cell.dataset.cellId] = finalHeight
      printPrep.contentHeights[cell.dataset.cellId] = contentHeight
      console.log(
          `更新单元格 ${cell.dataset.cellId} 高度: ${finalHeight}px, 内容高度: ${contentHeight}px (使用准确测量方法)`,
      )
    }

    return { height: finalHeight, contentHeight }
  } catch (error) {
    console.error("使用准确测量方法测量单元格高度时出错:", error)
    // 如果有shouldHeight，在出错时返回shouldHeight
    const shouldHeight = cell.dataset.shouldHeight ? Number.parseInt(cell.dataset.shouldHeight, 10) : null
    const contentHeight = measureInnerContentHeight(cell)
    return {
      height: shouldHeight || cell.offsetHeight || 300, // 使用备用高度
      contentHeight,
    }
  }
}

/** 内部用的：
 * 使用媒体类型切换方法测量所有.important-cell 重要单元格：高度+内容高度
 * 这个函数可以替代PrintPreparation类中的findAndMeasureImportantCells方法
 */
export function measureAllCellsWithPrintMedia() {
  console.log("开始使用媒体类型切换法测量所有重要单元格")

  // 检查 URL 参数是否禁用 important-cell 功能
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search)
    const noImptCopy = urlParams.get("noImptCopy") === "1"

    if (noImptCopy) {
      console.log("检测到 noImptCopy=1 参数，禁用 important-cell 单元格的测量功能")
      return false
    }
  }

  try {
    // 获取打印准备实例
    const printPrep = getPrintPreparation()

    // 使用批量测量函数
    const cellMeasurements = batchMeasureImportantCells()

    // 更新打印准备实例中的高度数据
    Object.entries(cellMeasurements).forEach(([cellId, { height, contentHeight }]) => {
      printPrep.cellHeights[cellId] = height
      printPrep.contentHeights[cellId] = contentHeight
    })

    printPrep.measurementCompleted = true
    console.log("完成测量所有单元格高度 (使用批量测量方法)")

    return true
  } catch (error) {
    console.error("测量单元格高度时发生错误:", error)
    return false
  }
}

// 查找父级 PageSectionOrientation 组件并确定方向
export function findParentSection(element: HTMLElement): {
  element: HTMLElement | null
  orientation: "portrait" | "landscape"
  paperSize?: string
} {
  // 默认为纵向
  let orientation: "portrait" | "landscape" = "portrait"
  let sectionElement: HTMLElement | null = null
  let paperSize: string | undefined = undefined

  // 查找最近的 print-section 元素
  let current = element

  while (current) {
    if (current.classList.contains("print-section")) {
      sectionElement = current
      // 检查ID是否包含方向信息
      const id = current.id || ""
      if (id.includes("landscape")) {
        orientation = "landscape"
      } else if (id.includes("portrait")) {
        orientation = "portrait"
      }

      // 从数据属性获取纸张尺寸
      paperSize = current.getAttribute("data-paper-size") || undefined

      break
    }

    // 向上查找
    const parent = current.parentElement
    if (!parent) break
    current = parent
  }

  return { element: sectionElement, orientation, paperSize }
}

// 查找单元格所在的所有表格（从外到内）
export function findTableHierarchy(cell: HTMLElement): HTMLTableElement[] {
  const tables: HTMLTableElement[] = []
  let current: HTMLElement | null = cell

  while (current) {
    const table = current.closest("table")
    if (!table) break

    tables.unshift(table as HTMLTableElement) // 添加到数组开头

    // 移动到表格之外继续查找
    current = table.parentElement

    // 如果到达 PageSectionOrientation，停止  【约束】print-section开始位置就必须100%纸张的宽度的。
    if (current && current.classList.contains("print-section")) {
      break
    }
  }

  return tables
}


class PrintPreparation {
  public cellHeights: { [key: string]: number } = {}
  public contentHeights: { [key: string]: number } = {} // 新增：存储内容高度
  public headerHeights: { [key: string]: number } = {} // 新增：存储祖先表格 thead 高度总和
  public measurementCompleted = false
  public isPreparing = false
  private printStyleAdded = false
  // private urlParamsChecked = false
  // private domReadyChecked = false
  // private autoInitialized = false
  public shouldReloadAfterPrint = false

  /**
   * 查找并测量所有重要单元格
   */
  public findAndMeasureImportantCells() {
    // 使用媒体类型切换方法测量所有单元格
    const success = measureAllCellsWithPrintMedia()

    // 计算所有单元格的祖先表格 thead 高度
    if (success) {
      const headerHeights = batchCalculateHeaderHeights()
      Object.entries(headerHeights).forEach(([cellId, height]) => {
        this.headerHeights[cellId] = height
      })
    }

    return success
  }

  // 修改 PrintPreparation 类中的 prepareForPrint 方法，实现新的内容复制机制
  public async prepareForPrint() {
    // 检查 URL 参数是否禁用 important-cell 功能
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const noImptCopy = urlParams.get("noImptCopy") === "1"

      if (noImptCopy) {
        console.log("检测到 noImptCopy=1 参数，禁用 important-cell 单元格的测量和复制功能")
        this.isPreparing = false
        return
      }
    }

    // 如果正在准备中，但已经超过5秒，重置状态（防止死锁）
    if (this.isPreparing) {
      console.warn("检测到可能的状态死锁，重置准备状态")
      this.isPreparing = false
    }

    this.isPreparing = true
    console.log("准备打印，处理重要单元格...")

    try {
      // 查找所有带有 important-cell 类的单元格  【约束】className预定义的。
      const importantCells = document.querySelectorAll(".important-cell")

      if (importantCells.length === 0) {
        console.log("未找到重要单元格")
        this.isPreparing = false
        return
      }

      // 为每个单元格分配一个唯一ID
      for (let i = 0; i < importantCells.length; i++) {
        const htmlCell = importantCells[i] as HTMLElement
        if (!htmlCell.dataset.cellId) {
          htmlCell.dataset.cellId = `cell-${i}`
        }
      }

      // 修改：即使已经测量过单元格高度，也需要测量表头高度
      // 如果还没有测量单元格高度，先测量
      if (!this.measurementCompleted) {
        this.findAndMeasureImportantCells()
      } else {
        // 即使已经测量过单元格高度，也需要测量表头高度
        // 因为在打印预览时，this.measurementCompleted 可能已经是 true
        const headerHeights = batchCalculateHeaderHeights()
        Object.entries(headerHeights).forEach(([cellId, height]) => {
          this.headerHeights[cellId] = height
        })
      }

      // 处理每个重要单元格
      for (let i = 0; i < importantCells.length; i++) {
        const htmlCell = importantCells[i] as HTMLElement
        const cellId = htmlCell.dataset.cellId || ""

        // 获取单元格高度和内容高度
        const cellHeight = this.cellHeights[cellId] || 0
        const contentHeight = this.contentHeights[cellId] || 0

        // 如果仍然没有高度，使用单元格的当前高度作为备用
        if (cellHeight <= 0) {
          this.cellHeights[cellId] = htmlCell.offsetHeight || 300 // 默认至少300px
          console.log(`无法测量高度，使用备用高度: ${this.cellHeights[cellId]}px 作为单元格 ${cellId} 的高度`)
        }

        console.log(`处理单元格 ${cellId}，高度: ${this.cellHeights[cellId]}px, 内容高度: ${contentHeight}px`)

        // 获取当前纸张方向下的净高度
        const { orientation } = findParentSection(htmlCell)
        const paperSettings = getCurrentPaperSettings()
        const paperDimensions = getPaperDimensions(paperSettings.size, paperSettings.margin, orientation)
        const paperNetHeight = paperDimensions[orientation].contentHeight

        // 获取祖先表格的 thead 高度总和
        const headerHeight = this.headerHeights[cellId] || 0
        console.log(`单元格 ${cellId} 的祖先表格 thead 高度总和: ${headerHeight}px`)

        // 获取 data-interval-height 属性，默认为纸张净高度减去祖先表格的 thead 高度总和  【预留机制】配置决定的片段间隔距离;shouldHeight?
        const intervalHeight = htmlCell.dataset.intervalHeight
            ? Number.parseInt(htmlCell.dataset.intervalHeight, 10)
            : Math.max(paperNetHeight - headerHeight, 0)

        // 确保 intervalHeight 大于 contentHeight + 30px
        const minIntervalHeight = contentHeight + 30
        const finalIntervalHeight = Math.max(intervalHeight, minIntervalHeight)

        // 确保 intervalHeight 是一个有效的数字
        if (isNaN(finalIntervalHeight) || finalIntervalHeight <= 0) {
          console.warn(
              `单元格 ${cellId} 的 data-interval-height 属性无效，使用默认值 ${paperNetHeight - headerHeight}px`,
          )
        }

        // 清除之前添加的内容片段
        const existingFragments = htmlCell.querySelectorAll(".content-fragment")
        existingFragments.forEach((frag) => frag.remove())

        // 保存原始内容的副本
        const originalContent: Node[] = []
        Array.from(htmlCell.childNodes).forEach((node) => {
          if (
              !(node instanceof HTMLElement) ||
              (!node.classList.contains("content-fragment") && !node.classList.contains("original-content-container"))
          ) {
            originalContent.push(node.cloneNode(true))
          }
        })

        // 创建一个容器来存放原始内容
        const originalContainer = document.createElement("div")
        originalContainer.className = "original-content-container"
        originalContainer.style.display = "none"
        originalContainer.style.position = "absolute"
        originalContainer.style.visibility = "hidden"
        originalContainer.style.overflow = "hidden"
        originalContainer.style.height = "0"
        originalContainer.style.width = "0"

        // 将原始内容移动到隐藏容器
        Array.from(htmlCell.childNodes).forEach((node) => {
          if (
              !(node instanceof HTMLElement) ||
              (!node.classList.contains("content-fragment") && !node.classList.contains("original-content-container"))
          ) {
            originalContainer.appendChild(node)
          }
        })

        // 添加隐藏容器到单元格
        htmlCell.appendChild(originalContainer)

        // 计算需要复制的次数
        const totalHeight = this.cellHeights[cellId]
        const orgCopies = Math.ceil(totalHeight / finalIntervalHeight)
        const copies =
            totalHeight > paperNetHeight - headerHeight && contentHeight < 0.5 * paperNetHeight
                ? orgCopies + 1
                : (totalHeight/(contentHeight+32)>4.8 && orgCopies===1)? 2
                : orgCopies

        const contentContainer = document.createElement("div")
        contentContainer.className = "content-fragments-container"
        contentContainer.style.position = "relative"
        contentContainer.style.width = "100%"
        contentContainer.style.height = "100%"
        contentContainer.style.maxHeight = `${cellHeight}px`
        contentContainer.dataset.copies = copies.toString()

        // 计算每个片段的高度和间距
        const totalAvailableHeight = cellHeight
        const fragmentBaseHeight = contentHeight
        const orgMargin = Math.floor((totalAvailableHeight - fragmentBaseHeight * copies) / copies)
        const fragmentMargin = orgMargin<32 ? 32 : orgMargin

        // 创建内容片段
        for (let j = 0; j < copies; j++) {
          // 创建一个内容片段容器
          const fragmentContainer = document.createElement("div")
          fragmentContainer.className = "content-fragment"
          fragmentContainer.style.position = "relative"
          fragmentContainer.style.width = "100%"
          if(j > 0){
            fragmentContainer.style.paddingBottom = `${fragmentMargin}px`
            fragmentContainer.style.breakInside = "avoid"
          }
          else
            fragmentContainer.style.marginBottom = `${fragmentMargin}px`

          // 直接将内容添加到片段容器
          originalContent.forEach((node) => {
            const clonedNode = node.cloneNode(true)
            fragmentContainer.appendChild(clonedNode)
          })

          // 如果不是第一个片段，添加"(续)"标记
          if (j > 0) {
            const continuationMark = document.createElement("span")
            continuationMark.textContent = "(续) "
            continuationMark.className = "continuation-mark text-gray-500 font-medium"

            // 添加到内容的开头
            if (fragmentContainer.firstChild) {
              fragmentContainer.insertBefore(continuationMark, fragmentContainer.firstChild)
            } else {
              fragmentContainer.appendChild(continuationMark)
            }
          }

          // 将片段容器添加到内容容器
          contentContainer.appendChild(fragmentContainer)
        }

        // 将内容容器添加到单元格
        htmlCell.appendChild(contentContainer)

        // 标记单元格已处理
        htmlCell.dataset.hasPrintContent = "true"
      }

      // 添加打印样式
      this.addPrintStyles()

      // 添加打印后恢复原始内容的处理
      this.setupAfterPrintHandler()

      console.log("打印准备完成")
    } catch (error) {
      console.error("准备打印时发生错误:", error)
    } finally {
      // 确保在所有情况下都重置准备状态
      this.isPreparing = false
    }
  }

  //打印动态 修改 addPrintStyles 方法，确保打印时 flex 布局正确显示
  private addPrintStyles() {
    if (this.printStyleAdded) return

    let printStyle = document.getElementById("print-style")

    if (!printStyle) {
      printStyle = document.createElement("style")
      printStyle.id = "print-style"
      document.head.appendChild(printStyle)
    }

    // 修改 addPrintStyles 方法中的CSS样式
    const styleContent = `
@media print {
/* 确保表头在每页都显示 */
thead {
  display: table-header-group !important;
}

/* 隐藏原始内容容器 */
.original-content-container {
  display: none !important;
  height: 0 !important;
  width: 0 !important;
  overflow: hidden !important;
  position: absolute !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  clip: rect(0, 0, 0, 0) !important;
}

/* 显示内容片段容器 */
.content-fragments-container {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  visibility: visible !important;
  background: transparent !important;
  position: relative !important;
}

/* 显示内容片段 */
.content-fragment {
  // display: block !important;
  visibility: visible !important;
  position: relative !important;
  width: 100% !important;
}

/* 最后一个内容片段不需要底部间距 */
.content-fragment:last-child {
  margin-bottom: 0 !important;
}

/* 确保内容片段中的所有内容都可见 */
.content-fragment * {
  visibility: visible !important;
}

/* 防止标题和表格之间分页 */
h1, h2, h3, h4, h5, h6 {
  page-break-after: avoid !important;
  break-after: avoid !important;
}

/* 确保标题和表格在一起 */
h1 + *, h2 + *, h3 + *, h4 + *, h5 + *, h6 + * {
  page-break-before: avoid !important;
  break-before: avoid !important;
}

/* 特别处理 FlexibleTable */
h1 + div, h2 + div, h3 + div, h4 + div, h5 + div, h6 + div {
  page-break-before: avoid !important;
  break-before: avoid !important;
}

/* 确保 .keep-together 类的元素不被分页 */
.keep-together, .no-break {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}

/* 允许 important-cell 中的内容片段显示 */
.important-cell {
  position: relative !important;
  height: 100% !important;
}

.important-cell > .content-fragments-container {
  display: block !important;
  visibility: visible !important;
}

/* 确保表格和单元格的边框样式被保留 */
table {
  border-collapse: collapse !important;
}

}
`

    printStyle.textContent = styleContent
    this.printStyleAdded = true
    console.log("打印样式已更新")
  }

  // 添加打印后恢复原始内容的处理
  private setupAfterPrintHandler() {
    if (typeof window === "undefined") return

    // 移除旧的事件监听器，避免重复添加
    window.removeEventListener("afterprint", this.handleAfterPrint)

    // 添加新的事件监听器
    window.addEventListener("afterprint", this.handleAfterPrint)
  }

  // 打印后处理函数
  private handleAfterPrint = () => {
    console.log("打印完成，恢复原始内容")

    // 查找所有带有 important-cell 类的单元格
    const importantCells = document.querySelectorAll(".important-cell")

    // 处理每个重要单元格
    importantCells.forEach((cell) => {
      const htmlCell = cell as HTMLElement

      // 查找原始内容容器
      const originalContainer = htmlCell.querySelector(".original-content-container")
      if (!originalContainer) return

      // 清除所有内容片段容器
      const fragmentsContainer = htmlCell.querySelector(".content-fragments-container")
      if (fragmentsContainer) {
        htmlCell.removeChild(fragmentsContainer)
      }

      // 恢复原始内容
      while (originalContainer.firstChild) {
        htmlCell.insertBefore(originalContainer.firstChild, originalContainer)
      }

      // 移除原始内容容器
      htmlCell.removeChild(originalContainer)

      // 移除标记
      delete htmlCell.dataset.hasPrintContent
    })

    console.log("已恢复原始内容")

    // 如果需要重新加载页面
    if (this.shouldReloadAfterPrint) {
      console.log("准备重新加载页面...")
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
  }

}

// 全局单例
let printPreparation: PrintPreparation | null = null

// 获取全局打印准备实例
export function getPrintPreparation(): PrintPreparation {
  if (typeof window === "undefined") {
    // 服务器端渲染时返回一个空对象
    return {
      findAndMeasureImportantCells: () => {},
      prepareForPrint: () => {},
      shouldReloadAfterPrint: false,
      cellHeights: {},
      contentHeights: {},
      headerHeights: {}, // 添加祖先表格 thead 高度
      measurementCompleted: false,
      isPreparing: false,
    } as unknown as PrintPreparation
  }

  if (!printPreparation) {
    printPreparation = new PrintPreparation()
    console.log("创建新的打印准备实例")
  }

  return printPreparation
}


// 计算表格的 thead 高度
function calculateTableHeaderHeight(table: HTMLTableElement): number {
  const thead = table.querySelector("thead")
  if (!thead) return 0
  return thead.offsetHeight
}

// 计算所有祖先表格的 thead 高度总和
export function calculateAncestorTableHeadersHeight(cell: HTMLElement): number {
  // 查找单元格所在的所有表格（从外到内）
  const tableHierarchy = findTableHierarchy(cell)

  // 计算所有表格的 thead 高度总和
  let totalHeaderHeight = 0
  tableHierarchy.forEach((table) => {
    totalHeaderHeight += calculateTableHeaderHeight(table)
  })

  return totalHeaderHeight
}

// 批量计算所有单元格的祖先表格 thead 高度， 会影响到片段复制的个数
export function batchCalculateHeaderHeights(): Record<string, number> {
  console.log("开始批量计算所有单元格的祖先表格 thead 高度")

  // 查找所有带有 important-cell 类的单元格
  const importantCells = document.querySelectorAll(".important-cell")

  if (importantCells.length === 0) {
    console.log("未找到重要单元格")
    return {}
  }

  // 创建结果对象
  const headerHeights: Record<string, number> = {}

  // 按打印区域分组单元格，以便一次性处理同一打印区域中的所有单元格
  const sectionGroups = new Map<HTMLElement, HTMLElement[]>()

  // 为每个单元格分配ID并按打印区域分组
  importantCells.forEach((cell, index) => {
    const htmlCell = cell as HTMLElement

    // 确保单元格有ID
    if (!htmlCell.dataset.cellId) {
      htmlCell.dataset.cellId = `cell-${index}`
    }

    // 找到包含此单元格的打印区域
    const { element: printSection } = findParentSection(htmlCell)

    if (!printSection) {
      console.warn(`单元格 ${htmlCell.dataset.cellId} 不在打印区域内`)
      return
    }

    // 将单元格添加到对应打印区域的组中
    if (!sectionGroups.has(printSection)) {
      sectionGroups.set(printSection, [])
    }
    sectionGroups.get(printSection)!.push(htmlCell)
  })

  // 保存原始媒体类型
  let originalMedia: string | undefined
  try {
    originalMedia = document.documentElement.style.media

    // 切换到打印媒体类型
    document.documentElement.style.media = "print"

    // 处理每个打印区域组
    sectionGroups.forEach((cells, printSection) => {
      console.log(`处理打印区域中的 ${cells.length} 个单元格的祖先表格 thead 高度`)

      // 获取当前纸张设置
      const paperSettings = getCurrentPaperSettings()

      // 找到打印区域所在的方向上下文
      const { orientation } = findParentSection(printSection)

      // 获取纸张尺寸信息
      const paperDimensions = getPaperDimensions(paperSettings.size, paperSettings.margin, orientation)

      // 创建一个模拟打印环境的容器
      const container = document.createElement("div")
      container.style.position = "absolute"
      container.style.visibility = "hidden"
      // 修改：设置容器宽度为打印纸张当前方向下的净宽度
      container.style.width = `${paperDimensions[orientation].contentWidth}px`
      container.style.left = "-9999px"
      container.style.overflow = "visible"
      document.body.appendChild(container)

      // 修改：直接克隆整个文档结构，而不仅仅是打印区域
      const documentClone = document.documentElement.cloneNode(true) as HTMLElement
      container.appendChild(documentClone)

      // 强制重排以应用打印样式
      window.dispatchEvent(new Event("resize"))
      document.body.offsetHeight

      // 在克隆的结构中找到并计算每个单元格的祖先表格 thead 高度
      cells.forEach((cell) => {
        const cellId = cell.dataset.cellId!

        // 修改：在整个克隆的文档中查找对应的单元格
        const cellClone = documentClone.querySelector(`[data-cell-id="${cellId}"]`) as HTMLElement

        if (cellClone) {
          // 查找单元格所在的所有表格（从外到内）
          const tableHierarchy = findTableHierarchy(cellClone)

          // 计算所有表格的 thead 高度总和
          let totalHeaderHeight = 0
          tableHierarchy.forEach((table) => {
            const thead = table.querySelector("thead")
            if (thead) {
              totalHeaderHeight += thead.offsetHeight
            }
          })

          // 保存计算结果
          headerHeights[cellId] = totalHeaderHeight
          console.log(`单元格 ${cellId} 的祖先表格 thead 高度总和: ${totalHeaderHeight}px`)
        } else {
          console.warn(`在克隆的结构中未找到单元格 ${cellId}，使用原始单元格计算`)
          // 如果找不到克隆的单元格，使用原始单元格计算
          headerHeights[cellId] = calculateAncestorTableHeadersHeight(cell)
        }
      })

      // 清理容器
      document.body.removeChild(container)
    })

    console.log("完成批量计算所有单元格的祖先表格 thead 高度")
    return headerHeights
  } finally {
    // 恢复原始媒体类型
    if (originalMedia) {
      document.documentElement.style.media = originalMedia
    }

    // 再次强制重排以恢复原始样式
    window.dispatchEvent(new Event("resize"))
    document.body.offsetHeight
  }
}
//可选参数 data-interval-height="400" data-should-height="1900"