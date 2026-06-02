/**
 * 国密 SM4 / SM2 加解密测试脚本
 * ── SM4 ──
 *   encryptPasswordSM4(password)     → SmUtil.sm4(ByteUtils.fromHexString(KEY)).encryptHex(password)
 *   decryptPasswordSM4(hexStr)       → SmUtil.sm4(ByteUtils.fromHexString(KEY)).decryptStr(hexStr)
 *   JS: sm4.encrypt / sm4.decrypt（默认 ECB/PKCS7）
 *
 * ── SM2 ──
 *   decryptPasswordSM2(hex)          → SmUtil.sm2(PRIVATE_KEY,PUBLIC_KEY).setMode(C1C2C3).decrypt(hex)
 *   decryptPasswordSM2ByGmCrypto(hex) → "04" + hex → 同上
 *   JS: sm2.doDecrypt(cipherHex, privateKey, cipherMode)
 *       cipherMode: 0=C1C3C2  1=C1C2C3
 *
 * 密钥配置（.env 文件）:
 *   SM4_KEY=
 *   SM2_PRIVATE_KEY=
 *   SM2_PUBLIC_KEY=
 *
 * ── SM3 密码验证 ──
 *   SM3PasswordEncoder: 16字节随机盐 + SM3(盐字节 || 密码UTF8字节) → Base64
 *   JS: sm3([...saltBytes, ...passwordUtf8Bytes])     ← 不是 HMAC！
 *
 * ── 用法 ──────────────────────────────────────────────────
 *   1) 无参数（自测）:
 *      yarn test:sm4-decrypt
 *
 *   2) SM4 加密:
 *      yarn test:sm4-decrypt --enc <明文>
 *
 *   3) SM4 解密:
 *      yarn test:sm4-decrypt <密文hex>
 *      yarn test:sm4-decrypt --dec <密文hex>
 *
 *   4) SM2 解密:
 *      yarn test:sm4-decrypt --sm2 <密文hex>
 *      yarn test:sm4-decrypt --sm2-by-gmcrypto <密文hex>
 *
 *   5) SM2 加密:
 *      yarn test:sm4-decrypt --sm2-enc <明文>
 *
 *   6) 从 .env 读取 THIRD_PARTY_PASSWORD 自动 SM2 解密:
 *      yarn test:sm4-decrypt --sm2-env
 *
 *   7) SM3 密码验证（旧系统 SM3PasswordEncoder）:
 *      yarn test:sm4-decrypt --verify-pwd <明文密码> <base64密文>
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

// ── 导入 sm-crypto ─────────────────────────────────────
let sm4: any;
let sm2: any;
let sm3: any;
try {
  const smc = require('sm-crypto');
  sm4 = smc.sm4;
  sm2 = smc.sm2;
  sm3 = smc.sm3;
} catch (e) {
  console.error('❌ sm-crypto 库未安装，请执行: npm install sm-crypto');
  process.exit(1);
}

// ── 密钥配置 ────────────────────────────────────────────
// SM4 固定 KEY（
const SM4_KEY = process.env.SM4_KEY || '';
// SM2 密钥
const SM2_PRIVATE_KEY = process.env.SM2_PRIVATE_KEY;
const SM2_PUBLIC_KEY  = process.env.SM2_PUBLIC_KEY;
const KNOWN_UUID      = process.env.THIRD_PARTY_USER_UUID || '';
const ENV_PASSWORD_HEX = process.env.THIRD_PARTY_PASSWORD || '';

// ── 工具函数 ──────────────────────────────────────────

function isHex(str: string): boolean {
  return /^[0-9a-fA-F]+$/.test(str);
}

function normalizeToHex(input: string): string {
  const cleaned = input.replace(/^0x/i, '');
  if (isHex(cleaned)) return cleaned;
  try {
    const buf = Buffer.from(cleaned, 'base64');
    const hex = buf.toString('hex');
    if (isHex(hex) && hex.length > 0) {
      console.log('  ↪ 检测为 Base64 编码，已自动转换为 Hex');
      return hex;
    }
  } catch (_) { /* ignore */ }
  throw new Error(`无法识别的加密数据格式: 不是有效的 Hex 也不是 Base64`);
}

function hexToAsciiDots(hex: string): string {
  let result = '';
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.substring(i, i + 2), 16);
    if (byte >= 0x20 && byte <= 0x7e) {
      result += String.fromCharCode(byte);
    } else {
      result += '.';
    }
  }
  return result;
}

// ═══════════════════════════════════════════════════════
//  SM4 功能
// ═══════════════════════════════════════════════════════

function runSm4Decrypt(rawInput: string) {
  if (!SM4_KEY) {
    console.error('❌ 未设置 SM4_KEY 环境变量，请在 .env 中配置');
    process.exit(1);
  }
  console.log('='.repeat(60));
  console.log('  SM4 国密解密');
  console.log('='.repeat(60));
  console.log(`  原始输入 : ${rawInput.length > 48 ? rawInput.substring(0, 48) + '...' : rawInput}`);
  console.log(`  使用的KEY: ${SM4_KEY}`);
  console.log('='.repeat(60));

  try {
    const hexInput = normalizeToHex(rawInput);
    const startTime = Date.now();
    const decrypted = sm4.decrypt(hexInput, SM4_KEY);
    const elapsed = Date.now() - startTime;
    console.log(`\n  ✅ 解密成功 (${elapsed}ms)`);
    console.log(`  原始密码 : ${decrypted}`);
  } catch (error: any) {
    console.error(`\n  ❌ 解密失败: ${error.message}`);
    process.exit(1);
  }
}

function runSm4Encrypt(plainText: string) {
  if (!SM4_KEY) {
    console.error('❌ 未设置 SM4_KEY 环境变量，请在 .env 中配置');
    process.exit(1);
  }
  console.log('='.repeat(60));
  console.log('  SM4 国密加密（正向验证）');
  console.log('='.repeat(60));
  console.log(`  明文密码 : ${plainText}`);
  console.log(`  使用的KEY: ${SM4_KEY}`);
  console.log('='.repeat(60));

  try {
    const startTime = Date.now();
    const encrypted = sm4.encrypt(plainText, SM4_KEY);
    const elapsed = Date.now() - startTime;

    console.log(`\n  ✅ 加密成功 (${elapsed}ms)`);
    console.log(`  密文(hex): ${encrypted}`);
    console.log(`  密文长度 : ${encrypted.length} 个 hex 字符 = ${encrypted.length / 2} 字节`);

    console.log('\n  ── 反向验证 ──');
    const decrypted = sm4.decrypt(encrypted, SM4_KEY);
    const ok = decrypted === plainText;
    console.log(`  解密结果 : ${decrypted}`);
    console.log(`  双向验证 : ${ok ? '✅ 通过' : '❌ 失败'}`);
    if (!ok) process.exit(1);
  } catch (error: any) {
    console.error(`\n  ❌ 加密失败: ${error.message}`);
    process.exit(1);
  }
}

function runSm4SelfTest() {
  if (!SM4_KEY) {
    console.error('❌ 未设置 SM4_KEY 环境变量，请在 .env 中配置');
    process.exit(1);
  }
  console.log('='.repeat(60));
  console.log('  SM4 国密自测（双向验证）');
  console.log('='.repeat(60));
  console.log(`  使用的KEY: ${SM4_KEY}`);
  console.log('='.repeat(60));

  const testCases = [
    { plain: '123456', desc: '纯数字密码' },
    { plain: 'abc123', desc: '字母数字混合' },
    { plain: 'Hello@2024', desc: '特殊字符密码' },
    { plain: '测试中文', desc: '中文密码' },
    { plain: '', desc: '空字符串' },
  ];

  let allPass = true;
  for (const tc of testCases) {
    console.log(`\n  ── 测试: ${tc.desc} ──`);
    console.log(`  明文: "${tc.plain}"`);
    try {
      const encHex = sm4.encrypt(tc.plain, SM4_KEY);
      console.log(`  密文: ${encHex || '(空)'}`);
      const dec = sm4.decrypt(encHex, SM4_KEY);
      const ok = dec === tc.plain;
      console.log(`  解密: "${dec}" ${ok ? '✅' : '❌'}`);
      if (!ok) allPass = false;
    } catch (e: any) {
      console.log(`  ❌ 异常: ${e.message}`);
      allPass = false;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`  总体结果: ${allPass ? '✅ 全部通过' : '❌ 存在失败'}`);
  if (allPass) {
    console.log('\n  ✅ sm-crypto SM4 加解密功能正常。');
  }
  if (!allPass) process.exit(1);
}

// ═══════════════════════════════════════════════════════
//  SM2 功能
// ═══════════════════════════════════════════════════════

/**
 * sm-crypto 的 doDecrypt 可能返回 hex 或 UTF-8 文本。
 * 统一转为 UTF-8 字符串，并判断数据类型。
 * 返回 { text: string, isBinary: boolean }
 */
function normalizeDecrypted(raw: string): { text: string; isBinary: boolean } {
  // 如果返回值本身就是可读文本（包含不属 hex 的字符），直接返回
  if (!isHex(raw)) {
    return { text: raw, isBinary: false };
  }

  // 返回值是纯 hex → 解码看是否能转为 UTF-8 可读文本
  const utf8 = Buffer.from(raw, 'hex').toString('utf8');
  // 如果解码后的文本全由可打印 ASCII 组成且无控制字符，则是纯文本
  if (utf8.length > 0 && /^[\x20-\x7E]+$/.test(utf8)) {
    return { text: utf8, isBinary: false };
  }
  // 否则视为二进制数据
  return { text: raw, isBinary: true };
}

/**
 * 尝试用多种 mode 解密 SM2
 */
function trySm2Decrypt(hexInput: string): { mode: number; raw: string } | null {
  for (const cipherMode of [0, 1]) {
    try {
      const result = sm2.doDecrypt(hexInput, SM2_PRIVATE_KEY, cipherMode);
      if (result && result.length > 0) {
        return { mode: cipherMode, raw: result };
      }
    } catch (_) { /* 跳过 */ }
  }
  return null;
}

function analyzeSm2Result(raw: string, cipherMode: number) {
  const modeLabel = cipherMode === 0 ? 'C1C3C2' : 'C1C2C3';
  const { text: plain, isBinary } = normalizeDecrypted(raw);

  console.log(`  解密模式 : ${modeLabel}`);

  if (isBinary) {
    // 二进制模式 — raw 是 hex 字符串
    const byteLen = raw.length / 2;
    console.log(`  数据类型: 二进制`);
    console.log(`  解密长度: ${raw.length} hex chars = ${byteLen} 字节`);
    console.log(`  ASCII视图: ${hexToAsciiDots(raw).substring(0, 64)}...`);

    // 查找已知 UUID
    if (KNOWN_UUID && raw.includes(KNOWN_UUID)) {
      const idx = raw.indexOf(KNOWN_UUID);
      const header = raw.substring(0, idx);
      const afterUuid = raw.substring(idx + KNOWN_UUID.length);
      console.log(`  ★ 发现已知 UUID "${KNOWN_UUID}" 位于字节偏移 ${idx / 2}`);
      console.log(`  头部(hex): ${header} (${header.length / 2} bytes)`);
      console.log(`  头部(ASCII): ${hexToAsciiDots(header)}`);

      // Java substring(46) 逻辑
      const totalBeforeHex = idx + KNOWN_UUID.length;
      if (totalBeforeHex >= 46) {
        const javaSubstr = raw.substring(46);
        console.log(`  ★ Java substring(46) 后数据:`);
        console.log(`  长度: ${javaSubstr.length} hex chars = ${javaSubstr.length / 2} 字节`);
        console.log(`  hex: ${javaSubstr.substring(0, 80)}...`);
        console.log(`  ASCII: ${hexToAsciiDots(javaSubstr).substring(0, 80)}...`);
      }

      if (afterUuid.length > 0) {
        const asPlain = Buffer.from(afterUuid, 'hex').toString('utf8');
        if (asPlain && asPlain.length > 0 && asPlain.length < 200 && /^[\x20-\x7E]+$/.test(asPlain)) {
          console.log(`  UUID后UTF8: "${asPlain}"`);
        }
      }
    }
  } else {
    // 纯文本模式
    console.log(`  数据类型: 文本`);
    console.log(`  明文: "${plain}"`);
  }
}

function runSm2Decrypt(rawInput: string, method: 'direct' | 'byGmCrypto') {
  console.log('='.repeat(60));
  console.log(`  SM2 国密解密`);
  console.log(`  方法: ${method === 'direct' ? 'decryptPasswordSM2' : 'decryptPasswordSM2ByGmCrypto (补04前缀)'}`);
  console.log('='.repeat(60));

  const hexInput = normalizeToHex(rawInput);
  console.log(`  密文长度: ${hexInput.length} hex chars = ${hexInput.length / 2} bytes`);

  // 构建输入
  const inputs: { label: string; hex: string }[] = [];
  if (method === 'direct') {
    inputs.push({ label: '直接解密', hex: hexInput });
  } else {
    inputs.push({ label: '补04前缀', hex: '04' + hexInput });
  }

  for (const inp of inputs) {
    console.log(`\n── ${inp.label} ──`);
    const result = trySm2Decrypt(inp.hex);
    if (result) {
      console.log(`  ✅ 解密成功`);
      analyzeSm2Result(result.raw, result.mode);
    } else {
      console.log(`  ❌ 两种 mode 均解密失败`);
    }
  }
}

function runSm2Encrypt(plainText: string) {
  console.log('='.repeat(60));
  console.log('  SM2 国密加密（使用公钥）');
  console.log('='.repeat(60));
  console.log(`  明文: ${plainText}`);
  console.log('='.repeat(60));

  const modes = [
    { mode: 0, label: 'C1C3C2' },
    { mode: 1, label: 'C1C2C3' },
  ];

  for (const m of modes) {
    try {
      const encrypted = sm2.doEncrypt(plainText, SM2_PUBLIC_KEY, m.mode);
      console.log(`\n  ✅ ${m.label} 加密成功`);
      console.log(`  密文(hex): ${encrypted}`);
      console.log(`  长度: ${encrypted.length} chars = ${encrypted.length / 2} 字节`);

      // 解密回来验证
      const decrypted = sm2.doDecrypt(encrypted, SM2_PRIVATE_KEY, m.mode);
      if (decrypted) {
        const { text: plainBack } = normalizeDecrypted(decrypted);
        const ok = plainBack === plainText;
        console.log(`  反向解密: "${plainBack}" ${ok ? '✅' : '❌'}`);
      }
    } catch (e: any) {
      console.log(`\n  ❌ ${m.label} 加密失败: ${e.message}`);
    }
  }
}

function runSm2EnvDecrypt() {
  console.log('='.repeat(60));
  console.log('  SM2 解密 THIRD_PARTY_PASSWORD（.env）');
  console.log('='.repeat(60));

  if (!ENV_PASSWORD_HEX) {
    console.error('❌ .env 中未设置 THIRD_PARTY_PASSWORD');
    process.exit(1);
  }
  if (!isHex(ENV_PASSWORD_HEX)) {
    console.error('❌ THIRD_PARTY_PASSWORD 不是有效的 hex 字符串');
    process.exit(1);
  }

  console.log(`  密文: ${ENV_PASSWORD_HEX.substring(0, 48)}... (${ENV_PASSWORD_HEX.length} chars)`);
  console.log(`  已知UUID: ${KNOWN_UUID || '(未配置)'}`);
  console.log('');

  // 尝试直接解密
  const result = trySm2Decrypt(ENV_PASSWORD_HEX);
  if (result) {
    console.log('\n── Method-A (直接解密) ──');
    analyzeSm2Result(result.raw, result.mode);
  } else {
    console.log('\n── Method-A (直接解密) ──');
    console.log('  ❌ 两种 mode 均解密失败');
  }

  // 尝试补04前缀
  const result2 = trySm2Decrypt('04' + ENV_PASSWORD_HEX);
  if (result2) {
    console.log('\n── Method-B (补04前缀) ──');
    analyzeSm2Result(result2.raw, result2.mode);
  } else {
    console.log('\n── Method-B (补04前缀) ──');
    console.log('  ❌ 两种 mode 均解密失败');
  }
}

// ═══════════════════════════════════════════════════════
//  SM3 密码验证（SM3PasswordEncoder）
// ═══════════════════════════════════════════════════════

function runSm3VerifyPwd(plainPwd: string, storedB64: string) {
  console.log('='.repeat(60));
  console.log('  SM3 密码验证（SM3PasswordEncoder）');
  console.log('='.repeat(60));
  console.log('  注意: Hutool new SM3(salt).digest(pwd) = SM3(salt || pwd)');
  console.log('       不是标准 HMAC，密码直接拼接在盐之后做纯 SM3 哈希。');
  console.log('');

  if (!storedB64) {
    console.error('  ❌ 缺少参数: 必须提供 Base64 密文');
    console.error('  用法: ... --verify-pwd <明文> <base64密文>');
    process.exit(1);
  }

  console.log(`  明文密码: ${plainPwd}`);
  console.log(`  存储密文: ${storedB64}`);

  const raw = Buffer.from(storedB64, 'base64');
  if (raw.length !== 48) {
    console.error(`  ❌ 解码错误: 期望 48 字节, 实际 ${raw.length} 字节`);
    process.exit(1);
  }

  const salt = raw.subarray(0, 16);
  const expectedDigest = raw.subarray(16).toString('hex');
  console.log(`  盐(hex): ${salt.toString('hex')}`);
  console.log(`  期望摘要: ${expectedDigest}`);

  // SM3(salt字节 || 密码UTF8字节)
  const computed = sm3([...salt, ...Buffer.from(plainPwd, 'utf8')]);
  console.log(`  计算摘要: ${computed}`);

  const ok = computed === expectedDigest;
  console.log('');
  console.log(`  结果: ${ok ? '✅ 密码正确' : '❌ 密码错误'}`);
  if (!ok) process.exit(1);
}

// ═══════════════════════════════════════════════════════
//  模拟旧平台登录密码加密
//  参考 seip-ui/src/views/login.vue handleLogin()
//  Step 1: encryptPassword(rawPwd) = SM2.doEncrypt(rawPwd, PUBLIC_KEY, 1)
//  Step 2: pwdSecondaryEncrypt(step1, uuid) =
//           SM2.doEncrypt(timestamp + uuid + step1, PUBLIC_KEY, 1)
//  其中 uuid = "8f23640475444e9fa81ead5b6374c402"（固定）
//        时间戳 = yyyyMMddHHmmss（如 20260525143000）
// ═══════════════════════════════════════════════════════
function pad2(n: number): string { return n < 10 ? '0' + n : String(n); }

function formatTimestamp(d: Date): string {
  return '' + d.getFullYear()
    + pad2(d.getMonth() + 1)
    + pad2(d.getDate())
    + pad2(d.getHours())
    + pad2(d.getMinutes())
    + pad2(d.getSeconds());
}

function runLoginPwdSimulation(rawPwd: string) {
  const LOGIN_UUID = KNOWN_UUID || (console.warn('⚠️ THIRD_PARTY_USER_UUID 未设置'), '');
  const LOGIN_PUB_KEY = SM2_PUBLIC_KEY || (console.error('❌ SM2_PUBLIC_KEY 未设置'), '');

  if (!LOGIN_UUID || !LOGIN_PUB_KEY) { process.exit(1); }

  console.log('='.repeat(60));
  console.log('  模拟旧平台登录密码加密');
  console.log('='.repeat(60));
  console.log(`  原始口令: ${rawPwd}`);
  console.log(`  公钥:     ${LOGIN_PUB_KEY.substring(0, 32)}...`);
  console.log(`  UUID:     ${LOGIN_UUID}`);

  // Step 1: SM2 加密原始口令（C1C3C2 模式）
  console.log('\n── Step 1: SM2 加密原始口令 ──');
  const step1 = sm2.doEncrypt(rawPwd, LOGIN_PUB_KEY, 0);
  console.log(`  Step1 密文(hex): ${step1}`);
  console.log(`  长度: ${step1.length} chars = ${step1.length / 2} 字节`);

  // 验证 Step1 可解密
  try {
    const dec1 = sm2.doDecrypt(step1, SM2_PRIVATE_KEY, 0);
    const { text: plain1 } = normalizeDecrypted(dec1);
    console.log(`  Step1 反向验证: "${plain1}" ${plain1 === rawPwd ? '✅' : '❌'}`);
  } catch (_) {}

  // Step 2: 拼接时间戳 + UUID + Step1 结果，再次 SM2 加密（C1C3C2 模式）
  const timestamp = formatTimestamp(new Date());
  const combined = timestamp + LOGIN_UUID + step1;
  console.log(`\n── Step 2: 拼接后二次 SM2 加密 ──`);
  console.log(`  时间戳: ${timestamp}`);
  console.log(`  拼接串: ${combined.substring(0, 48)}......${combined.substring(combined.length - 16)}`);
  console.log(`  拼接总长度: ${combined.length} chars`);

  const step2 = sm2.doEncrypt(combined, LOGIN_PUB_KEY, 0);
  console.log(`\n  ✅ 最终加密密码(hex):`);
  console.log(`  ${step2}`);
  console.log(`  长度: ${step2.length} chars = ${step2.length / 2} 字节`);

  // 验证 Step2
  try {
    const dec2 = sm2.doDecrypt(step2, SM2_PRIVATE_KEY, 0);
    const raw2 = normalizeDecrypted(dec2).text;
    const ts = raw2.substring(0, 14);
    const uuid = raw2.substring(14, 14 + 32);
    const inner = raw2.substring(14 + 32);
    // 内部密文不加 04 前缀（与外部一致）
    const decInner = sm2.doDecrypt(inner, SM2_PRIVATE_KEY, 0);
    const { text: plain2 } = normalizeDecrypted(decInner);
    console.log(`\n  Step2 反向验证:`);
    console.log(`    提取时间戳: ${ts}`);
    console.log(`    提取UUID:   ${uuid}`);
    console.log(`    还原明文:   "${plain2}" ${plain2 === rawPwd ? '✅' : '❌'}`);
  } catch (_) {
    console.log('\n  ⚠️ 无法反向验证（缺少私钥或解密失败）');
  }
}

// ═══════════════════════════════════════════════════════
//  诊断：解密已知可用的登录密码
//  验证 sm-crypto 与后端 Hutool 是否兼容
// ═══════════════════════════════════════════════════════
function debugLoginPassword(knownHex: string) {
  const LOGIN_UUID = KNOWN_UUID || '';
  const hexInput = knownHex.startsWith('04') ? knownHex : '04' + knownHex;

  console.log('='.repeat(60));
  console.log('  诊断已知可用密码');
  console.log('='.repeat(60));
  console.log(`  密码长度: ${knownHex.length} hex chars`);
  console.log(`  后端处理: "04" + 密码 = ${hexInput.length} chars`);
  console.log('');

  // 尝试两种 mode + 两种前缀组合解密
  for (const prefix of ['不加04', '加04']) {
    const input = prefix === '加04' ? '04' + knownHex : knownHex;
    for (const cipherMode of [0, 1]) {
      const modeLabel = cipherMode === 0 ? 'C1C3C2' : 'C1C2C3';
      try {
        const dec = sm2.doDecrypt(input, SM2_PRIVATE_KEY, cipherMode);
        if (dec && dec.length > 0) {
          const { text: plain, isBinary } = normalizeDecrypted(dec);
          console.log(`\n✅ ${prefix} | ${modeLabel} | 解密成功`);
          console.log(`  明文长度: ${plain.length} chars`);

          if (plain.length >= 46) {
            const ts = plain.substring(0, 14);
            const uuid = plain.substring(14, 46);
            const inner = plain.substring(46);
            console.log(`  时间戳:   ${ts}`);
            console.log(`  UUID:     ${uuid}`);
            console.log(`  UUID匹配: ${uuid === LOGIN_UUID ? '✅' : '❌'} (期望=${LOGIN_UUID})`);
            console.log(`  内部密文: ${inner.substring(0, 32)}...(${inner.length} chars)`);

            // 尝试解密内部密文（不加04 和 加04 都试）
            for (const innerPrefix of ['不加04', '加04']) {
              const innerInput = innerPrefix === '加04' ? '04' + inner : inner;
              try {
                const innerDec = sm2.doDecrypt(innerInput, SM2_PRIVATE_KEY, cipherMode);
                if (innerDec) {
                  const { text: finalPwd } = normalizeDecrypted(innerDec);
                  console.log(`  内部${innerPrefix}: 原始口令="${finalPwd}"`);
                  break;
                }
              } catch (_) { /* 跳过 */ }
            }
          }
        }
      } catch (_) { /* 跳过 */ }
    }
  }
}

// ═══════════════════════════════════════════════════════
//  入口
// Hutool 的 SM3哈希算法，不可逆——无法像 SM4/SM2 那样"解密"， 不是标准 HMAC 仅仅是盐字节拼在密码前面再做一次 SM3 哈希—即使拿到数据库也无法反推出密码。
// 测试密码的一致性
// C:\home\sei_next_page>npx ts-node -P packages/camunda-worker/tsconfig.json packages/camunda-worker/src/test-sm4-decrypt.ts --verify-pwd h62 NkDxf9jIbtyIkchsohBvHdmfe
// ═══════════════════════════════════════════════════════

const rawInput = process.argv[2];

if (!rawInput) {
  // 无参数 → SM4 自测
  runSm4SelfTest();
} else if (rawInput === '--enc') {
  // SM4 加密
  const plainText = process.argv[3];
  if (!plainText) { console.error('用法: yarn test:sm4-decrypt --enc <明文>'); process.exit(1); }
  runSm4Encrypt(plainText);
} else if (rawInput === '--dec') {
  // SM4 解密
  const cipherText = process.argv[3];
  if (!cipherText) { console.error('用法: yarn test:sm4-decrypt --dec <密文>'); process.exit(1); }
  runSm4Decrypt(cipherText);
} else if (rawInput === '--sm2') {
  // SM2 解密（直接模式）
  const cipherText = process.argv[3];
  if (!cipherText) { console.error('用法: yarn test:sm4-decrypt --sm2 <密文hex>'); process.exit(1); }
  runSm2Decrypt(cipherText, 'direct');
} else if (rawInput === '--sm2-by-gmcrypto') {
  // SM2 解密（补04前缀模式）
  const cipherText = process.argv[3];
  if (!cipherText) { console.error('用法: yarn test:sm4-decrypt --sm2-by-gmcrypto <密文hex>'); process.exit(1); }
  runSm2Decrypt(cipherText, 'byGmCrypto');
} else if (rawInput === '--login-pwd') {
  // 模拟旧平台登录密码加密（两步 SM2）
  const plainPwd = process.argv[3];
  if (!plainPwd) { console.error('用法: yarn test:sm4-decrypt --login-pwd <原始口令>'); process.exit(1); }
  runLoginPwdSimulation(plainPwd);
} else if (rawInput === '--login-debug') {
  // 诊断：解密已知可用密码，分析内部结构
  const knownPwd = process.argv[3];
  if (!knownPwd) { console.error('用法: yarn test:sm4-decrypt --login-debug <已知可用密码hex>'); process.exit(1); }
  debugLoginPassword(knownPwd);
} else if (rawInput === '--sm2-enc') {
  // SM2 加密
  const plainText = process.argv[3];
  if (!plainText) { console.error('用法: yarn test:sm4-decrypt --sm2-enc <明文>'); process.exit(1); }
  runSm2Encrypt(plainText);
} else if (rawInput === '--sm2-env') {
  console.log('读取 THIRD_PARTY_PASSWORD 并 SM2 解密');  
  // 从 .env 读取并 SM2 解密
  runSm2EnvDecrypt();
} else if (rawInput === '--verify-pwd') {
  // SM3 密码验证
  const plainPwd = process.argv[3];
  const storedB64 = process.argv[4];
  if (!plainPwd || !storedB64) { console.error('用法: yarn test:sm4-decrypt --verify-pwd <明文密码> <base64密文>'); process.exit(1); }
  runSm3VerifyPwd(plainPwd, storedB64);
} else {
  // 直接传密文 → SM4 解密（向后兼容）
  runSm4Decrypt(rawInput);
}
