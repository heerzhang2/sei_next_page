// import 'server-only'

import { ssrFetchFn } from "@/relay/environment/ssrFetchFn";
import { buildQueryId, isRelayObservable } from "@/relay/environment/helpers";
import {
  GraphQLResponse,
  Observer,
  FetchFunction,
  Environment,
  Network,
  Store,
  RecordSource,
} from "relay-runtime";
import { useSession } from "next-auth/react"
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const session = await getSession(context);


export type QueryResponsePayload = {
  queryId: string;
  response: GraphQLResponse;
};

/**
 * Creates a Relay envirionment, while also re-publishing all the responses
 * received from the network layer to the provided observer.
 *
 * @param observer An observer that receives the incremental GraphQL responses.
 * @returns The server-side Relay environment.
 */
export function createServerSideRelayEnvironment(
  observer: Observer<QueryResponsePayload>
) {
  //Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. You can only call Hooks at the top level of your React function. For more information, see https://react.dev/link/rules-of-hooks
  //报错！！ const { data: session } = useSession();
  console.log("create server-side environmentsession=S");
  //函数参数类型固定的： 返回ObservableFromValue<GraphQLResponse>
  const curriedFetchFn: FetchFunction = (request, variables, ...rest) => {
    const observable = ssrFetchFn(request, variables, ...rest);

    if (isRelayObservable(observable)) {
      const queryId = buildQueryId(request, variables);

      // Re-emit the observable responses to the provided observer,
      // while still returning them to Relay itself.
      return observable.do({
        next(response) {
          observer.next?.({
            queryId,
            response,
          });
        },
      });
    }

    return observable;
  };

  return new Environment({
    network: Network.create(curriedFetchFn),
    store: new Store(new RecordSource()),
    isServer: true,
  });
}
