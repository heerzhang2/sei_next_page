/**
 * 发送给前端的graphQL Global ID：自定义GlobalId 通用编码规则：要求前端可见唯一性。
 * node()直接获取type模型名称。
 * 编码前: 前面16字节UUID,紧跟后面才是Type模型；发给前端Relay,graphQL要求的全局唯一性ID,
 * 随后URI定位，前端不解析字节送回后端。
 * Base64； type byte[]， uuid就是long|long byte[]合并： 两个64位整数的；
 * 22个字符的uuid，用Base64转码的字符串, 不是直接bye to char: HEX展示的一般 ---- 36个字符串;
 */

/**
 * 将UUID字符串转换为两个64位整数
 * @param uuidString UUID字符串 (格式: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
 * @returns 包含mostSignificantBits和leastSignificantBits的对象
 */
function parseUUID(uuidString: string): { mostSignificantBits: bigint; leastSignificantBits: bigint } {
  // 移除UUID中的连字符
  const hex = uuidString.replace(/-/g, "")

  if (hex.length !== 32) {
    throw new Error("Invalid UUID format")
  }

  // 前16个十六进制字符 (64位)
  const mostSignificantBits = BigInt("0x" + hex.substring(0, 16))
  // 后16个十六进制字符 (64位)
  const leastSignificantBits = BigInt("0x" + hex.substring(16, 32))

  return { mostSignificantBits, leastSignificantBits }
}

/**
 * 将64位BigInt转换为8字节数组 (大端序)
 * @param value 64位BigInt值
 * @returns 8字节的Uint8Array
 */
function bigIntToBytes(value: bigint): Uint8Array {
  const bytes = new Uint8Array(8)
  for (let i = 7; i >= 0; i--) {
    bytes[7 - i] = Number((value >> BigInt(i * 8)) & BigInt(0xff))
  }
  return bytes
}

/**
 * 将字符串转换为UTF-8字节数组
 * @param str 输入字符串
 * @returns UTF-8编码的字节数组
 */
function stringToUtf8Bytes(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

/**
 * 生成GraphQL Global ID
 * @param type 类型名称
 * @param uuidString UUID字符串
 * @returns Base64编码的Global ID
 */
export function toGlobalId(type: string, uuidString: string): string {
  // 将type转换为UTF-8字节数组
  const typeBytes = stringToUtf8Bytes(type)

  // 解析UUID获取两个64位整数
  const { mostSignificantBits, leastSignificantBits } = parseUUID(uuidString)

  // 创建结果字节数组：16字节UUID + type字节长度
  const resultBytes = new Uint8Array(16 + typeBytes.length)

  // 将mostSignificantBits转换为字节并填入前8字节
  const mostSignificantBytes = bigIntToBytes(mostSignificantBits)
  resultBytes.set(mostSignificantBytes, 0)

  // 将leastSignificantBits转换为字节并填入8-15字节
  const leastSignificantBytes = bigIntToBytes(leastSignificantBits)
  resultBytes.set(leastSignificantBytes, 8)

  // 将type字节数组复制到16字节之后
  if (typeBytes.length > 0) {
    resultBytes.set(typeBytes, 16)
  }

  // 使用Base64编码
  return btoa(String.fromCharCode(...resultBytes))
}

/**
 * 解析GraphQL Global ID
 * @param globalId Base64编码的Global ID
 * @returns 包含type和uuid的对象
 */
export function fromGlobalId(globalId: string): { type: string; uuid: string } {
  try {
    // Base64解码
    const binaryString = atob(globalId)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    if (bytes.length < 16) {
      throw new Error("Invalid Global ID: too short")
    }

    // 提取前16字节作为UUID
    const uuidBytes = bytes.slice(0, 16)

    // 重构两个64位整数
    let mostSignificantBits = BigInt(0)
    let leastSignificantBits = BigInt(0)

    for (let i = 0; i < 8; i++) {
      mostSignificantBits = (mostSignificantBits << BigInt(8)) | BigInt(uuidBytes[i])
      leastSignificantBits = (leastSignificantBits << BigInt(8)) | BigInt(uuidBytes[i + 8])
    }

    // 转换为UUID字符串格式
    const mostHex = mostSignificantBits.toString(16).padStart(16, "0")
    const leastHex = leastSignificantBits.toString(16).padStart(16, "0")
    const uuidString = `${mostHex.substring(0, 8)}-${mostHex.substring(8, 12)}-${mostHex.substring(12, 16)}-${leastHex.substring(0, 4)}-${leastHex.substring(4, 16)}`

    // 提取type字符串
    const typeBytes = bytes.slice(16)
    const type = new TextDecoder().decode(typeBytes)

    return { type, uuid: uuidString }
  } catch (error) {
    throw new Error(`Failed to parse Global ID: ${error}`)
  }
}

/**
 * 生成随机UUID字符串
 * @returns UUID字符串
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
