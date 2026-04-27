/**
 * SM2 国密算法加密 - 用于第三方系统登录
 * 
 * 安装依赖: npm install sm-crypto
 * 
 * 注意：SM2 是复杂的椭圆曲线加密算法，建议使用成熟的 sm-crypto 库
 * 这里提供两种实现方式：
 * 1. 使用 sm-crypto 库（推荐）
 * 2. 模拟实现（用于测试，不建议生产环境使用）
 */

// ============================================
// 方式 1: 使用 sm-crypto 库（推荐）
// ============================================

let smCrypto: any = null;

// 动态导入 sm-crypto
try {
  smCrypto = require('sm-crypto');
} catch (e) {
  console.warn('[SM2] sm-crypto not installed, using fallback implementation');
}


/**
 * 使用 sm-crypto 库进行 SM2 加密
 */
export function sm2EncryptWithLib(
  plaintext: string,
  publicKey: string,
  options: {
    mode?: number;  // 0: C1C3C2, 1: C1C2C3
    pc?: boolean;   // 是否包含04前缀
  } = {}
): string {
  if (!smCrypto || !smCrypto.sm2) {
    throw new Error('sm-crypto library not available. Please install: npm install sm-crypto');
  }

  const { mode = 0, pc = true } = options;
  
  // sm-crypto 的加密函数
  // 参数: (msg, publicKey, cipherMode)
  // cipherMode: 0 = C1C2C3, 1 = C1C3C2
  const cipherMode = mode ;
  
  // 清理公钥格式
  let cleanPubKey =publicKey;     // publicKey.replace(/^04/, '');
  
  // 加密
  const encrypted = smCrypto.sm2.doEncrypt(plaintext, cleanPubKey, cipherMode);
  
  // 添加 04 前缀 return pc ? '04' + encrypted : encrypted;
  return  encrypted;
}


// ============================================
// 方式 2: 模拟实现（仅用于测试）
// ============================================

/**
 * 模拟 SM2 加密（仅用于测试，不保证安全性）
 * 实际生产环境请使用 sm-crypto 库
 */
export function sm2EncryptMock(
  plaintext: string,
  publicKey: string,
  options: {
    mode?: number;
    inputEncoding?: string;
    outputEncoding?: string;
    pc?: boolean;
  } = {}
): string {
  const { mode = 0, pc = true } = options;
  
  // 这是一个模拟实现，仅用于接口调试
  // 实际加密需要使用完整的 SM2 算法
  
  const timestamp = Date.now().toString(16);
  const random = Math.random().toString(16).slice(2, 10);
  const data = Buffer.from(plaintext).toString('hex');
  
  // 模拟 C1 || C3 || C2 或 C1 || C2 || C3 格式
  // C1: 65字节 (04 + x + y)
  // C3: 32字节 (SM3哈希)
  // C2: 变长 (密文)
  
  const C1 = publicKey.slice(0, 130); // 模拟 C1
  const C2 = data; // 模拟 C2 (明文十六进制，实际应该是加密的)
  const C3 = timestamp + random; // 模拟 C3 (32字节哈希)
  
  let result: string;
  if (mode === 0) {
    // C1 || C3 || C2
    result = C1 + C3.padEnd(64, '0') + C2;
  } else {
    // C1 || C2 || C3
    result = C1 + C2 + C3.padEnd(64, '0');
  }
  
  return pc ? '04' + result : result;
}

// ============================================
// 统一接口
// ============================================

/**
 * SM2 加密函数 - 兼容原有接口
 * 
 * @param plaintext 明文密码
 * @param publicKey 公钥（十六进制，带或不带04前缀）
 * @param options 配置选项
 * @returns 加密后的密文（十六进制）
 * 
 * @example
 * const encrypted = encrypt('123456', '04a4369be75ad6e433515fddd9e38f8288b5a29b22c12a37f767c08474dff6e4ea4f5e48ab235ed81466e760e5cecfb62140ef7006b82d05a4124b0b1103f57a54', {
 *   mode: 0,
 *   inputEncoding: 'utf8',
 *   outputEncoding: 'hex'
 * });
 */
export function encrypt(
  plaintext: string,
  publicKey: string,
  options: {
    mode?: number;
    inputEncoding?: string;
    outputEncoding?: string;
    pc?: boolean;
  } = {}
): string {
  // 优先使用 sm-crypto 库
  if (smCrypto && smCrypto.sm2) {
    try {
      return sm2EncryptWithLib(plaintext, publicKey, {
        mode: options.mode ?? 0,
        pc: options.pc ?? true
      });
    } catch (e) {
      console.warn('[SM2] Library encryption failed, falling back to mock:', e);
    }
  }
  
  // 回退到模拟实现（仅用于测试）
  return  ""  // sm2EncryptMock(plaintext, publicKey, options);
}

/**
 * SM2 加密（显式使用库实现）
 */
export function sm2Encrypt(
  plaintext: string,
  publicKey: string,
  options: {
    mode?: number;
    pc?: boolean;
  } = {}
): string {
  return sm2EncryptWithLib(plaintext, publicKey, options);
}

export default {
  encrypt,
  sm2Encrypt,
  sm2EncryptWithLib,
  sm2EncryptMock
};
