import fs from 'fs';
import path from 'path';
import { ModelTypeArr, ModelConfig } from '@/report/modelConfigs';

/** 设备类型映射配置
 * 根据 matchRules 中的设备种类代码（EQP_SORT）映射到设备类型
 */
const EQUIPMENT_TYPE_MAP: Record<string, { code: string; name: string; tabValue: string }> = {
    '1': { code: '1', name: '锅炉', tabValue: 'boiler' },
    '2': { code: '2', name: '压力容器', tabValue: 'vessel' },
    '3': { code: '3', name: '电梯', tabValue: 'elevator' },
    '4': { code: '4', name: '起重', tabValue: 'crane' },
    '5': { code: '5', name: '场(厂)车', tabValue: 'vehicle' },
    '6': { code: '6', name: '游乐设施', tabValue: 'amusement' },
    '7': { code: '7', name: '管道元件', tabValue: 'component' },
    '8': { code: '8', name: '压力管道', tabValue: 'piping' },
    '9': { code: '9', name: '客运索道', tabValue: 'ropeway' },
    'R': { code: 'R', name: '常压容器', tabValue: 'atmospheric' },
    'F': { code: 'F', name: '安全阀', tabValue: 'valve' },
    'Z': { code: 'Z', name: '水质', tabValue: 'water' },
    '0': { code: '', name: '其它的', tabValue: 'other' },
};

/** 从设备种类代码获取设备类型信息 */
function getEquipmentTypeBySort(sort: string): { code: string; name: string; tabValue: string } | null {
    // 处理两位数的设备种类代码（如 '31' 取第一个字符 '3'）
    const firstChar = sort.charAt(0);
    if (EQUIPMENT_TYPE_MAP[firstChar]) {
        return EQUIPMENT_TYPE_MAP[firstChar];
    }
    // 处理特殊代码如 'R3'（常压容器）
    if (sort.startsWith('R')) {
        return EQUIPMENT_TYPE_MAP['R'];
    }
    return null;
}

/** 扫描模板目录获取已存在的模板编码 */
export function getExistingTemplates(): string[] {
    const repIdPath = path.join(process.cwd(), 'src', 'app', 'rep', '[repId]');
    
    if (!fs.existsSync(repIdPath)) {
        return [];
    }

    const entries = fs.readdirSync(repIdPath, { withFileTypes: true });
    return entries
        .filter(entry => entry.isDirectory() && !entry.name.startsWith('(') && !entry.name.startsWith('.'))
        .map(entry => entry.name);
}

/** 模板信息接口 */
export interface TemplateInfo {
    code: string;
    name: string;
    config?: ModelConfig;
    equipmentType: {
        code: string;
        name: string;
        tabValue: string;
    };
}

/** 从所有 matchRules 中推断设备类型
 * - 如果所有规则都匹配同一设备类型，则返回该类型
 * - 如果有空字符串 sortCode 或匹配多个不同类型，则返回"其它的"
 */
function inferTypeFromRules(matchRules: import('@/report/modelConfigs').MatchRule[]): { code: string; name: string; tabValue: string } {
    const detectedTypes = new Set<string>();

    for (const rule of matchRules) {
        const sortCode = rule[0]; // 设备种类 EQP_SORT

        // 空字符串归类为"其它的"
        if (!sortCode || sortCode === '') {
            return EQUIPMENT_TYPE_MAP['0']; // "其它的"
        }

        const detected = getEquipmentTypeBySort(sortCode);
        if (detected) {
            detectedTypes.add(detected.tabValue);
        }
    }

    // 如果所有规则都匹配同一设备类型，返回该类型
    if (detectedTypes.size === 1) {
        const typeValue = Array.from(detectedTypes)[0];
        // 找到对应的设备类型配置
        const typeEntry = Object.values(EQUIPMENT_TYPE_MAP).find(t => t.tabValue === typeValue);
        if (typeEntry) {
            return typeEntry;
        }
    }

    // 匹配多个不同类型或无法确定，归类为"其它的"
    return EQUIPMENT_TYPE_MAP['0']; // "其它的"
}

/** 获取所有模板信息（包括配置和分类） */
export function getAllTemplatesInfo(): TemplateInfo[] {
    const existingTemplates = getExistingTemplates();

    return existingTemplates.map(templateCode => {
        const config = ModelTypeArr[templateCode];

        // 从 matchRules 推断设备类型
        let equipmentType: { code: string; name: string; tabValue: string };

        if (config?.matchRules && config.matchRules.length > 0) {
            // 检查所有规则来确定设备类型
            equipmentType = inferTypeFromRules(config.matchRules);
        } else {
            // 没有配置或没有 matchRules，归类为"其它的"
            equipmentType = EQUIPMENT_TYPE_MAP['0'];
        }

        return {
            code: templateCode,
            name: config?.name || templateCode,
            config,
            equipmentType,
        };
    });
}

/** 按设备类型分组模板 */
export function groupTemplatesByType(templates: TemplateInfo[]): Record<string, TemplateInfo[]> {
    const groups: Record<string, TemplateInfo[]> = {};
    
    // 初始化所有设备类型（保持顺序）
    const orderedTypes = ['boiler', 'vessel', 'elevator', 'crane', 'vehicle', 'amusement', 'ropeway', 'piping', 'atmospheric', 'valve', 'water', 'component', 'other'];
    orderedTypes.forEach(type => {
        groups[type] = [];
    });
    
    templates.forEach(template => {
        const type = template.equipmentType.tabValue;
        if (!groups[type]) {
            groups[type] = [];
        }
        groups[type].push(template);
    });
    
    return groups;
}

/** 获取设备类型显示名称 */
export function getEquipmentTypeLabel(tabValue: string): string {
    const labels: Record<string, string> = {
        boiler: '1锅炉',
        vessel: '2压力容器',
        elevator: '3电梯',
        crane: '4起重',
        vehicle: '5场(厂)车',
        amusement: '6游乐设施',
        ropeway: '9客运索道',
        piping: '8压力管道',
        atmospheric: 'R常压容器',
        valve: 'F安全阀',
        water: 'Z水质',
        component: '7管道元件',
        other: '其它',
    };
    return labels[tabValue] || tabValue;
}

/** 获取默认选中的标签 */
export function getDefaultTab(groupedTemplates: Record<string, TemplateInfo[]>): string {
    const orderedTypes = ['elevator', 'vessel', 'boiler', 'crane', 'vehicle', 'amusement', 'piping', 'ropeway', 'atmospheric', 'valve', 'water', 'component', 'other'];
    for (const type of orderedTypes) {
        if (groupedTemplates[type]?.length > 0) {
            return type;
        }
    }
    return 'other';
}
