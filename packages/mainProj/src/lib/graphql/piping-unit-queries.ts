import { gql } from "urql"

export const GET_PIPING_UNITS = gql`
  query GetPipingUnits(
    $pipeId: ID
    $filter: PipingUnitFilter
    $first: Int = 20
    $after: String
  ) {
    pipingUnits(
      pipeId: $pipeId
      filter: $filter
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

export const SEARCH_PIPING_UNITS = gql`
  query SearchPipingUnits(
    $query: String!
    $pipeId: ID
    $first: Int = 10
  ) {
    searchPipingUnits(
      query: $query
      pipeId: $pipeId
      first: $first
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
