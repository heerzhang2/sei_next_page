//直接运行单元测试  c:\home\sei_next_page>npx tsx packages\mainProj\src\lib\test.ts 

import { toGlobalId, fromGlobalId } from "./global-id";

// 测试 1: 已知 ID 生成 GlobalID
const id = "864691128455195352";
const gid = toGlobalId("User", BigInt(id));
console.log("toGlobalId('User', 864691128455195352) =", gid);

// 测试 2: 解析刚刚生成的 GlobalID
const decoded = fromGlobalId(gid);
console.log("fromGlobalId('" + gid + "') =", decoded);

// 测试 3: 直接用 Java 返回的 GlobalID 解析
const javaGid = "DAAAAAAA6tgAAAAAAAAAAFVzZXI";
const decoded2 = fromGlobalId(javaGid);
console.log("fromGlobalId('" + javaGid + "') =", decoded2);

// 测试 4: 验证 64位长整数 → GlobalID → 解码回来是否一致
console.log("\n--- 双向验证 ---");
console.log("原始 ID  :", id);
console.log("解码后 ID:", decoded.id);
console.log("类型      :", decoded.type);
console.log("匹配?     :", decoded.id === id && decoded.type === "User");
