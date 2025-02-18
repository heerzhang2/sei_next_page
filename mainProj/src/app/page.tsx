import Link from "next/link";
import Header from "@/component/header";
import FootBar from "@/component/footbar";
import { cacheExchange, createClient, fetchExchange, gql } from '@urql/core';
import { registerUrql } from '@urql/next/rsc';

const makeClient = () => {
    return createClient({
        url: 'https://graphql-pokeapi.graphcdn.app/',
        exchanges: [cacheExchange, fetchExchange],
    });
};

const { getClient } = registerUrql(makeClient);

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



//这个是规定的输出变量：静态化导出static site会报错！
// export const dynamic = "force-dynamic";
/*不是必须登录的就能访问内容：
* */
export default async function Home() {
    const result = await getClient().query(PokemonsQuery, {});

  return (
      <div>
          <div className="mt-10">
              <Link href="/main">认证后的主页home</Link>
          </div>

          <main>
              <h1>This is rendered as part of an RSC</h1>
              <ul>
                  {result.data
                      ? result.data.pokemons.results.map((x: any) => (
                          <li key={x.id}>{x.name}</li>
                      ))
                      : JSON.stringify(result.error)}
              </ul>
              <Link href="/rep/SLIDING_JJ/non-rsc">Non RSC</Link>
          </main>

          <div className="mt-10">
              <Link href="/lazy">Visit (potentially) cached page ➡️</Link>
          </div>
          <div className="mt-10">
              <Link href="/rep/SLIDING_JJ/1/KQcbgDF9RO21DsI92H3tTVJlcG9ydA">kankan当前一1份报告试图的来</Link>
          </div>
          <div className="mt-10">
              <Link href="/rep/SLIDING_JJ/1/wjSpD8qsRvGy-zmji0lUK1JlcG9ydA">kankan当前一2份报告试图的来</Link>
          </div>
          <div className="mt-10">
              <Link href="/rep/SLIDING_JJ">⬅  u r q l  home</Link>
          </div>
          <div className="mt-10">
              <Link href="/login">⬅️ Go 的等让路 home</Link>
          </div>
      </div>
  );
}
