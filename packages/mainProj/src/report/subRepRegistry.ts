/**
 * 根据模板编码和版本号，动态导入对应 config.ts 获取 SUBREP_TAG_LIST
 * 路径规则：src/app/rep/[repId]/{modeltype}/{version}/config.ts -> SUBREP_TAG_LIST
 */
export async function getSubRepTagList(
  modeltype: string,
  version: string
): Promise<Array<{tag: string; name: string}>> {
  try {
    const config = await import(`../app/rep/[repId]/${modeltype}/${version}/config`);
    return config.SUBREP_TAG_LIST || [];
  } catch {
    return [];
  }
}
