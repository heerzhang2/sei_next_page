
import { fetchQuery, commitMutation, graphql } from "relay-runtime";
import yourMutation from './__generated__/performLoginMutation.graphql';
//不能使用这个import {useRelayEnvironment} from "react-relay";
import {createStaticRelayEnvironment} from "@/relay/environment/staticServer";
// import youfrMutation from 'D:/home/sei_next_page/mainProj/./__generated__/performLoginMutation.graphql.ts'

const mutation = graphql`
    mutation performLoginMutation($username: String!, $password: String!) {
        authenticate(username: $username, password: $password)
        { accessToken, user{id username} }
    }
`;

//运行在服务器端的：
export function performLoginMutation(variables: { username: string; password: string }): Promise<any> {
    const environment = createStaticRelayEnvironment();
    return new Promise((resolve, reject) => {
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
}

