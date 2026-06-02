/**
 * 极简入口：透传参数给 test-sync-equipment.ts
 * 避免 yarn scripts 中参数传递的转义问题
 */
require('ts-node/register');
require('./src/test-sync-equipment.ts');
