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
    useu: IdName
    pipe: Pipe
    crDate: string
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
}
