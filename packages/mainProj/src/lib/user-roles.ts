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

export async function getAuthUser(accessToken?: string) {
    const result = await urqlClient(accessToken || null)
        .query(AuthCompQuery, {})
        .toPromise()
    if (result.error) {
        throw result.error
    }
    return result.data.authUser
}
