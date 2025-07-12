import { gql } from "urql"

// 方案1：通过管道装置查询管道单元（保持原有结构）
export const GET_PIPING_UNITS_BY_PIPELINE = gql`
  query GetPipingUnitsByPipeline(
    $pipelineId: ID!
    $orderBy: String
    $asc: Boolean
    $where: DeviceCommonInput
    $first: Int = 20
    $after: String
  ) {
    node(id: $pipelineId) {
      ... on Pipeline {
        id
        cod
        oid
        useu {
          id
          name
        }
        cell_list(
          orderBy: $orderBy
          asc: $asc
          where: $where
          first: $first
          after: $after
        ) {
          edges {
            node {
              id
              code
              rno
              name
              ust
              reg
              nxtd1
              nxtd2
              start
              stop
              proj
              leng
              crDate
              pipe {
                id
                cod
                oid
                useu {
                  id
                  name
                }
              }
              svp
              pa
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
        numCell
      }
    }
  }
`

// 方案2：直接查询管道单元（建议后端新增）
export const GET_PIPING_UNITS_DIRECT = gql`
  query GetPipingUnitsDirect(
    $pipeId: ID
    $filter: PipingUnitFilter
    $first: Int = 20
    $after: String
    $orderBy: String
    $asc: Boolean
  ) {
    pipingUnits(
      pipeId: $pipeId
      filter: $filter
      first: $first
      after: $after
      orderBy: $orderBy
      asc: $asc
    ) {
      edges {
        node {
          id
          code
          rno
          name
          ust
          reg
          nxtd1
          nxtd2
          start
          stop
          proj
          leng
          crDate
          useu {
            id
            name
          }
          pipe {
            id
            cod
            oid
            useu {
              id
              name
            }
          }
          svp
          pa
          # 报告相关字段
          sgm {
            username
            name
          }
          mm
          pic
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`

// 搜索管道单元
export const SEARCH_PIPING_UNITS = gql`
  query SearchPipingUnits(
    $query: PipingUnitInput
    $after: String
    $first: Int = 10
        $orderBy: String
        $asc: Boolean
  ) {
    searchPipingUnitEs(
      where: $query
      after: $after
      first: $first
      orderBy: $orderBy
      asc: $asc
    ) {
      edges {
        node {
          id
          code
          rno
          name
          start
          stop
          pipe {
            id
            cod
            useu {
              id
              name
            }
          }
        }
      }
    }
  }
`

// 批量获取管道单元详情
export const GET_PIPING_UNITS_BY_IDS = gql`
  query GetPipingUnitsByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on PipingUnit {
        id
        code
        rno
        name
        ust
        reg
        nxtd1
        nxtd2
        start
        stop
        proj
        leng
        level
        lay
        safe
        thik
        dia
        crDate
        useu {
          id
          name
        }
        pipe {
          id
          cod
          oid
          useu {
            id
            name
          }
        }
        svp
        pa
        insd
        used
        desu {
          id
          name
        }
        insu {
          id
          name
        }
      }
    }
  }
`

export const LIST_ALL_PIPINGUNIT = gql`
  query GetPipingUnitsByPipeline(
    $detId: ID!
    $orderBy: String
    $asc: Boolean
  ) {
    listAllPipingUnit(detId: $detId,orderBy: $orderBy,asc: $asc) {
              id
              code
              rno
              name
              ust
              reg
              nxtd1
              nxtd2
              start
              stop
              proj
              leng
              crDate
              pipe {
                id
                cod
                oid
                useu {
                  id
                  name
                }
              }
              svp
              pa
    }
  }
`
