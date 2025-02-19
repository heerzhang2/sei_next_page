'use server'

import { fetchQuery, commitMutation, graphql } from "relay-runtime";
import yourMutation from './__generated__/performLoginMutation.graphql';
//不能使用这个import {useRelayEnvironment} from "react-relay";
import {createStaticRelayEnvironment} from "@/relay/environment/staticServer";
import {staticRelayEnvironment} from "@/relay/ServerRelay";
import {gql} from "@urql/core";
import {getClient} from "@/app/urqlClient";
// import youfrMutation from 'D:/home/sei_next_page/mainProj/./__generated__/performLoginMutation.graphql.ts'


const LOGIN_MUTATION = gql`
    mutation performLoginMutation($username: String!, $password: String!) {
        authenticate(username: $username, password: $password)
        { accessToken, user{id username} }
    }
`;

// export async function Home() {
//   const result = await getClient().query(PokemonsQuery, {});
//   return (
//         {result.data
//           ?
//           : JSON.stringify(result.error)}
//   );
// }


/*无需采用"@urql/exchange-auth"包的。utilities.appendHeaders(operation, { Authorization: `Bearer ${token}`, })
运行在服务器端的：登录实际用服务端做代理的。 给服务端用的必须加async；  It is not allowed to define inline "use server" annotated Server Actions in Client Components.
* */
export async function performLoginMutation(variables: { username: string; password: string }): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const result = await getClient().mutation(LOGIN_MUTATION, {...variables});
        console.log("LOGIN_MUTATION返回=", result, variables);
        if (!result) {
            reject(result);
        } else {
            resolve(result.data?.authenticate);
        }
    });
}


/*
    const environment =staticRelayEnvironment;      //createStaticRelayEnvironment();
    return new Promise((resolve, reject) => {
        const result = await getClient().mutate(LOGIN_MUTATION, {
            refreshToken,
        });


        commitMutation(
            environment,
            {
                mutation: yourMutation,
                variables,
                onCompleted: (response:any, errors) => {
                    if (errors) {
                        reject(errors);
                    } else {
                        resolve(response.authenticate);
                    }
                },
                onError: (error) => {
                    console.error('performLoginMutation Error:', error);
                    reject(error);
                },
            },
        );
    });
* */