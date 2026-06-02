/**
 * 任务提取相关类型定义
 */

// 提取的任务数据
export interface ExtractedTask {
  taskId: string;
  taskDate?: string;
  eqpCod: string;
  oidno?: string;
  opeType: string;
  repType?: string;
  busiType?: string;
  taskSta?: string;
  taskAlloSta?: string;
  projUserId?: string;
  jyMen?: string;
  applyCod?: string;
  reportCod?: string;
  ispId?: string;
  eqpType: string;
  eqpSort?: string;
  eqpVart?: string;
  subEqpVart?: string;
  useUntId?: string;
  taskDatabase?: string;
  eqpInnerCod?: string;
  factoryCod?: string;
}
// 提取的旧平台格式的 设备数据；
export interface ExtractedEquipment {
  eqpCod?: string;
  eqpName?: string;
  eqpSno?: string;
  model?: string;
  useAddr?: string;
  /** 使用单位ID（旧平台单位ID，需通过 syncUnitFromOldPlatform 转换为本地单位实体ID） */
  useUntId?: string;
  useUnitName?: string;
  /** 制造单位ID（旧平台单位ID，需通过 syncUnitFromOldPlatform 转换为本地单位实体ID） */
  makeUntId?: string;
  makeUnitName?: string;
  /** 安装单位ID（旧平台单位ID，需通过 syncUnitFromOldPlatform 转换为本地单位实体ID） */
  instUntId?: string;
  instUnitName?: string;
  /** 改造单位ID（旧平台单位ID，需通过 syncUnitFromOldPlatform 转换为本地单位实体ID） */
  altUntId?: string;
  /** 维修单位ID（旧平台单位ID，需通过 syncUnitFromOldPlatform 转换为本地单位实体ID） */
  ovhUntId?: string;
  svUnitId?: string;
  svUnitName?: string;
  /** 注册单位ID（旧平台单位ID，需通过 syncUnitFromOldPlatform 转换为本地单位实体ID） */
  regUntId?: string;
  /** 维保单位ID（旧平台单位ID，需通过 syncUnitFromOldPlatform 转换为本地单位实体ID） */
  mantUntId?: string;
  nextIspDate?: string;
  useState?: number;
  regState?: number;
  latitude?: number;
  longitude?: number;
  
  // 技术参数
  techParam?: {
    designPress?: number;
    workPress?: number;
    designTemp?: number;
    workTemp?: number;
    medium?: string;
    vol?: number;
    dia?: number;
    high?: number;
    leng?: number;
    thick?: number;
    span?: number;
    liftHeight?: number;
    ratedLiftWeight?: number;
    speed?: number;
    floor?: number;
    [key: string]: any;
  };
  
  // 其他动态字段
  [key: string]: any;
}

// 任务组
export interface TaskGroup {
  groupId: string;
  taskIds: string[];
}

// 提取进度
export interface ExtractionProgress {
  groupId: string;
  total: number;
  processed: number;
  success: number;
  failed: number;
  currentTask?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  errors: string[];
}
