/**
 * 部门数据定义
 * 用于部门数据迁移任务
 * 数据来源：原始系统中的部门列表
 */

// 默认归属单位ID
export const DEFAULT_UNIT_ID = '2738188573441261569';

// 部门数据类型
export interface DivisionData {
  id: string;
  name: string;
  status: number;
  createTime: string;
  deptPrinc: string | null;
  deptLevel: string;
}

// 部门数据列表 - 来自老系统的 localStorage.getItem("dept-tree") 直接导出的数据：
export const DIVISION_DATA: DivisionData[] = [
  { id: '1', name: '机电设备检验中心', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '许竞', deptLevel: '3' },
  { id: '2', name: '福州检验二部', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '刘毅', deptLevel: '3' },
  { id: '3', name: '福州检验三部', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '陈洁', deptLevel: '3' },
  { id: '4', name: '电站锅炉检验中心', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '吴林军', deptLevel: '3' },
  { id: '5', name: '福州检验一部', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '尤俊', deptLevel: '3' },
  { id: '8', name: '厂车检测中心', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '傅顶和', deptLevel: '3' },
  { id: '9', name: '节能中心', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '陈世旺', deptLevel: '3' },
  { id: '10', name: '宁德分院', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '王祖生', deptLevel: '3' },
  { id: '11', name: '南平分院', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '陈崇钰', deptLevel: '3' },
  { id: '12', name: '三明分院', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '廖安', deptLevel: '3' },
  { id: '13', name: '龙岩分院', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '吴蔚峰', deptLevel: '3' },
  { id: '14', name: '漳州分院', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '简添福', deptLevel: '3' },
  { id: '15', name: '泉州分院', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '蔡荣秋', deptLevel: '3' },
  { id: '16', name: '莆田分院', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '刘季能', deptLevel: '3' },
  { id: '18', name: '纪律检查室', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '刘爱国', deptLevel: '3' },
  { id: '20', name: '党办', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '左云成', deptLevel: '3' },
  { id: '21', name: '考试评审部', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '张秀彬', deptLevel: '3' },
  { id: '22', name: '技术质量管理部', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '邓志华', deptLevel: '3' },
  { id: '40', name: '办公室', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '罗立辉', deptLevel: '3' },
  { id: '41', name: '人力资源部', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '吴芳', deptLevel: '3' },
  { id: '42', name: '财务部', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '张征', deptLevel: '3' },
  { id: '52', name: '业务管理与发展部', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '朱延巍', deptLevel: '3' },
  { id: '55', name: '高新技术研究所', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '王芳', deptLevel: '3' },
  { id: '62', name: '容器管道检验中心', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '梁航', deptLevel: '3' },
  { id: '63', name: '石化设备检验中心', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '谢丽婉', deptLevel: '3' },
  { id: '64', name: '国家阀门中心', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: null, deptLevel: '3' },
  { id: '65', name: '数智中心', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '张莉君', deptLevel: '3' },
  { id: '67', name: '科研管理部', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '何祖恩', deptLevel: '3' },
  { id: '122', name: '院领导', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: null, deptLevel: '3' },
  { id: '165', name: '技术检查中心', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '何锦坤', deptLevel: '3' },
  { id: '262', name: '国家工锅中心', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: null, deptLevel: '3' },
  { id: '264', name: '国家机器人中心', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '曾远跃', deptLevel: '3' },
  { id: '709', name: '新技术开发中心', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '曾远跃', deptLevel: '3' },
  { id: '1006', name: '古雷检验中心', status: 1, createTime: '2023-04-21 11:56:12', deptPrinc: '黄理', deptLevel: '3' },
  { id: '3824', name: '市场部', status: 1, createTime: '2024-12-28 07:40:20', deptPrinc: '朱延巍', deptLevel: '3' },
  { id: '3801', name: '机电检验科', status: 0, createTime: '2023-04-21 11:56:12', deptPrinc: null, deptLevel: '4' },
];
