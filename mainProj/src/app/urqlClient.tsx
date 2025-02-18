import Link from 'next/link';
import { cacheExchange, createClient, fetchExchange, gql } from '@urql/core';
import { registerUrql } from '@urql/next/rsc';

const makeClient = () => {
  return createClient({
    url: 'https://graphql-pokeapi.graphcdn.app/',
    exchanges: [cacheExchange, fetchExchange],
  });
};

// const { getClient } = registerUrql(makeClient);
const clientSetup = registerUrql(makeClient);
export const getClient = clientSetup.getClient;



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

// export default async function Home() {
//   const result = await getClient().query(PokemonsQuery, {});
//   return (
//     <main>
//       <h1>This is rendered as part of an RSC</h1>
//       <ul>
//         {result.data
//           ? result.data.pokemons.results.map((x: any) => (
//               <li key={x.id}>{x.name}</li>
//             ))
//           : JSON.stringify(result.error)}
//       </ul>
//       <Link href="/rep/SLIDING_JJ/non-rsc">Non RSC</Link>
//     </main>
//   );
// }
