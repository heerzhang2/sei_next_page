"use client"

import Link from 'next/link';
import React, { Suspense } from 'react';
// import {  gql } from '@urql/next';
import {useQuery, gql, UrqlProvider} from '@urql/next';
import {getSsr, urqlClient} from "@/common/urql";
// import CommonReportView from "@/app/(pub)/rep/SLIDING_JJ/1/[repId]/CommonReportView";
import CommonReportView from "./CommonReportView";

// export default function Page() {
//   return (
//     <Suspense>
//       <Pokemons />
//     </Suspense>
//   );
// }

const PokemonsQuery = gql`
  query {
    pokemons(limit: 10) {
      results {
        id
        name
      }
    }
  }
`;
//本来'use client';再加了async会导致无限循环获取；React.use
function Pokemons() {
    // const result = await getClient().query(PokemonsQuery, {});
    const [result] = useQuery({ query: PokemonsQuery });
    return (
        <main>
            <h1>This is rendered as part of SSR</h1>
            <ul>
                {result.data
                    ? result.data.pokemons.results.map((x: any) => (
                        <li key={x.id}>{x.name}</li>
                    ))
                    : JSON.stringify(result.error)}
            </ul>
            <Suspense>
                <Pokemon name="bulbasaur"/>
            </Suspense>
            <Link href="/">RSC</Link>
        </main>
    );
}

const PokemonQuery = gql`
  query ($name: String!) {
    pokemon(name: $name) {
      id
      name
    }
  }
`;

function Pokemon(props: any) {
    // const result = await getClient().query(PokemonQuery, {name: props.name});
    const [result] = useQuery({query: PokemonQuery, variables: { name: props.name }});
    return (
        <div>
            <h1>{result.data && result.data.pokemon.name}</h1>
        </div>
    );
}

/*async/await is not yet supported in Client Components, only Server Components.
params: Promise<{ repId: string }>      ; await params;
* */
export default function Page({
                                  params,
                              }: {
    params: Promise<{ repId: string }>
}) {
    const { repId } = React.use(params);  // await params
    // @ts-ignore
    return (
        <article>
            <UrqlProvider client={urqlClient()} ssr={getSsr()}>
                <Suspense>
                    <CommonReportView repId={repId} />
                </Suspense>
                {/*<PostList repId={repId}/>*/}
            </UrqlProvider>
        </article>
    )
}
