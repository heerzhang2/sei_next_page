//作为共享常量模块，eqp-base-sync.ts 和 task-sync-service.ts 都从它导入 DEFAULT_UNIT_ID，避免了循环依赖。
/** 默认检验机构的单位ID = 福建省特种设备检验研究院 */
export const DEFAULT_UNIT_ID = '2738188573441261569';

/**
 * 旧平台业务类型ID -> 新平台 bsType 映射（参考 BusinessCat_Enum.ofOldPT）
 * 旧平台数字ID -> 新平台 BusinessCat_Enum 的 ordinal 值
 */
export function mapBusinessType(oldTypeId: number): number {
  if (oldTypeId > 600) oldTypeId = oldTypeId - 600;
  if ((oldTypeId >= 22 && oldTypeId <= 25) || oldTypeId === 20) return 10;  // TEST
  if (oldTypeId === 21 || oldTypeId === 26) return 16;                       // FIRST
  if (oldTypeId === 40 || oldTypeId === 41 || oldTypeId === 43) return 3;   // REGUL
  if (oldTypeId === 42 || oldTypeId === 44) return 8;                        // ANNUAL
  if (oldTypeId === 80) return 11;                                           // TEST
  if (oldTypeId === 200) return 13;                                          // OTHER
  if (oldTypeId === 202) return 19;                                          // THERMAL
  if (oldTypeId >= 1 && oldTypeId <= 19) return oldTypeId;                   // 直接映射
  return 0;
}
