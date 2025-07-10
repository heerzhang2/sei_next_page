// 更新类型定义，添加更多字段
export interface IdName {
    id: string
    name: string
}

export interface Pipe {
    id: string
    useu: IdName
    cod: string
    oid: string
}

export interface IPipingUnitEntity {
    id: string
    code: string
    rno: string
    name: string
    ust: string
    reg: string
    nxtd1: string
    nxtd2: string
    start: string
    stop: string
    proj: string
    leng: number
    level?: string
    lay?: string
    safe?: string
    thik?: number
    dia?: number
    useu: IdName
    pipe: Pipe
    crDate: string
    // 特性参数（JSON字符串）
    svp?: string
    pa?: string
    // 其他字段
    insd?: string
    used?: string
    desu?: IdName
    insu?: IdName
    // 报告相关字段
    sgm?: {
        username: string
        name: string
    }
    mm?: string
    pic?: number[]
}

export interface PipingUnitFilter {
    useu?: string
    pipe?: string
    detailTid?: {
        task: string
        detail: string
    }
    // 添加更多过滤条件
    ust?: string
    reg?: string
    code?: string
    name?: string
    proj?: string
}

export interface DeviceCommonInput {
    cod?: string
    name?: string
    useu?: string
    proj?: string
    ust?: string
    reg?: string
    // 其他过滤字段
}
