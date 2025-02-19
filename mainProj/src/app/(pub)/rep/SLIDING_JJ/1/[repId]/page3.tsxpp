'use client';

import Link from 'next/link';
import React, { Suspense } from 'react';
import { useQuery, gql } from '@urql/next';

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

function Pokemons() {
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
        <Pokemon name="bulbasaur" />
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
  const [result] = useQuery({
    query: PokemonQuery,
    variables: { name: props.name },
  });
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
            <Suspense>
                <Pokemons />
            </Suspense>
            {/*<PostList repId={repId}/>*/}
        </article>
    )
}
