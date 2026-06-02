
import { gql } from "@urql/next";

// 单独导出 Fragment
export const UserWithPersonFragment = gql`
  fragment UserWithPerson on User {
     __typename
    id
    username
    person {
      __typename
      id
      name
    }
  }
`;

