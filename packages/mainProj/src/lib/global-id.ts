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
 * 将64位BigInt转换为8字节数组 (大端序，与后端Java一致)
 * @param value 64位BigInt值
 * @returns 8字节的Uint8Array
 */
function bigIntToBytes(value: bigint): Uint8Array {
  const bytes = new Uint8Array(8)
  for (let i = 0; i < 8; i++) {
    bytes[i] = Number((value >> BigInt((7 - i) * 8)) & BigInt(0xff))
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
 * 生成GraphQL Global ID (Long ID 版本)
 * @param type 类型名称
 * @param id Long 类型的 ID
 * @returns Base64编码的Global ID
 */
export function toGlobalId(type: string, id: number | bigint): string {
  // 将type转换为UTF-8字节数组
  const typeBytes = stringToUtf8Bytes(type)

  // 将 Long ID 转换为 BigInt
  const idBigInt = typeof id === 'number' ? BigInt(id) : id

  // 创建结果字节数组：16字节 (Long ID在前8字节，后8字节补0) + type字节长度
  const resultBytes = new Uint8Array(16 + typeBytes.length)

  // 将Long ID转换为字节并填入前8字节 (大端序)
  const idBytes = bigIntToBytes(idBigInt)
  resultBytes.set(idBytes, 0)

  // 后8字节填充0 (因为只使用前64位存储Long ID)
  for (let i = 8; i < 16; i++) {
    resultBytes[i] = 0
  }

  // 将type字节数组复制到16字节之后
  if (typeBytes.length > 0) {
    resultBytes.set(typeBytes, 16)
  }

  // 使用Base64编码（移除尾部填充=，与Java getUrlEncoder().withoutPadding()一致）
  return btoa(String.fromCharCode(...resultBytes)).replace(/=+$/, '')
}

/**
 * 解析GraphQL Global ID (Long ID 版本)
 * @param globalId Base64编码的Global ID
 * @returns 包含type和id的对象
 */
export function fromGlobalId(globalId: string): { type: string; id: string } {
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

    // 从前8字节提取Long ID (大端序，与后端Java一致)
    let idBits = BigInt(0)
    for (let i = 0; i < 8; i++) {
      idBits |= BigInt(bytes[i]) << BigInt((7 - i) * 8)
    }

    // 提取type字符串
    const typeBytes = bytes.slice(16)
    const type = new TextDecoder().decode(typeBytes)

    // 返回类型和ID (ID转为字符串)
    return { type, id: idBits.toString() }
  } catch (error) {
    throw new Error(`Failed to parse Global ID: ${error}`)
  }
}

/**
 * 生成随机Long ID
 * @returns Long类型的ID
 */
export function generateUUID(): string {
  // 生成一个随机的正数ID
  return (Math.floor(Math.random() * 9000000000000000) + 1000000000000000).toString()
}
