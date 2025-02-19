'use server'

import {gql} from "@urql/core";
import {urqlClient} from "@/common/urql";


const LOGIN_MUTATION = gql`
    mutation performLoginMutation($username: String!, $password: String!) {
        authenticate(username: $username, password: $password)
        { accessToken, user{id username} }
    }
`;


/*无需采用"@urql/exchange-auth"包的。utilities.appendHeaders(operation, { Authorization: `Bearer ${token}`, })
运行在服务器端的：登录实际用服务端做代理的。 给服务端用的必须加async；  It is not allowed to define inline "use server" annotated Server Actions in Client Components.
* */
export async function performLoginMutation(variables: { username: string; password: string }): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const result = await urqlClient.mutation(LOGIN_MUTATION, {...variables});
        console.log("LOGIN_MUTATION返回=", result, variables);
        if (!result) {
            reject(result);
        } else {
            resolve(result.data?.authenticate);
        }
    });
}
