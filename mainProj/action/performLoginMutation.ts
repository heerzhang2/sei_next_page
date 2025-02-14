
import { fetchQuery, commitMutation, graphql } from "relay-runtime";
import yourMutation from './__generated__/performLoginMutation.graphql';
//不能使用这个import {useRelayEnvironment} from "react-relay";
import {createStaticRelayEnvironment} from "@/relay/environment/staticServer";


const mutation = graphql`
    mutation performLoginMutation($username: String!, $password: String!) {
        authenticate(username: $username, password: $password)
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
                onCompleted: (response, errors) => {
                    if (errors) {
                        console.error('performLoginMutation Errors:', errors);
                        reject(errors);
                    } else {
                        console.log('performLoginMutation Success:', response);
                        // 假设你需要从 response 中提取用户数据
                        // 注意：你需要根据你的 GraphQL API 的实际响应来调整这里的代码
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

