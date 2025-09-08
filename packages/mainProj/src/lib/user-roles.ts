import "next-auth/jwt"
import { urqlClient } from "@/auth/urql"
import { gql } from "@urql/core"

//用户全部的信息
export const GetUserinfoQuery = gql`
  query getUserQuery($id: ID!) {
    getUser(id: $id) {
      id,username, person{id,name}
      dep{id name} office{id name} 
      unit{id name dvs{id name} }
      ispUnits{id,unit{id,name}}
      authorities{id,name}
    }
  }
`

/**应该是在nextjs-RSC-node服务器环境中的，才能执行的，获取用户信息：【不能】切记不要在浏览器执行本函数。
 * @param accessToken  调用函数人的身份
 * @param userId 不一定就是调用者自己的id
 * */
export async function getUserInfo(userId: string, accessToken?: string) {
  const result = await urqlClient(accessToken || null)
      .query(GetUserinfoQuery, {
        id: userId,
      })
      .toPromise()
  if (result.error) {
    throw result.error
  }
  return result.data.getUser
}

export const AuthCompQuery = gql`
      query AuthCompQuery {
          authUser{
              id,username, person{id,name}
              dep{id name} office{id name} 
              unit{id name dvs{id name} }
              ispUnits{id,unit{id,name}}
           }
      }
`

//报错？
// export async function getAuthUser(accessToken?: string) {
//     const result = await urqlClient(accessToken || null)
//         .query(AuthCompQuery, {})
//         .toPromise()
//     if (result.error) {
//         throw result.error
//     }
//     return result.data.authUser
// }
/**不走urql库的，原生做法的：
 * @param accessToken  调用函数人的身份
 * */
export async function getAuthUser(accessToken?: string) {
    const endpoint = process.env.NEXT_PUBLIC_BACK_END || ""
    const url = `${endpoint}/graphql`

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({
            query: `
        query AuthCompQuery {
          authUser {
            id, username, 
            person { id, name }
            dep { id, name } 
            office { id, name } 
            unit { id, name, dvs { id, name } }
            ispUnits { id, unit { id, name } }
          }
        }
      `,
            operationName: 'AuthCompQuery'
        }),
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.errors) {
        throw new Error(result.errors[0].message)
    }

    return result.data.authUser
}
