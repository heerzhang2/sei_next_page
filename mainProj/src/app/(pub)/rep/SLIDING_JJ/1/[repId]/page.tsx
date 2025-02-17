"use client";
import { useLazyLoadQuery} from "react-relay";
import { graphql } from 'relay-runtime';
import {pagegetReportQuery} from "./__generated__/pagegetReportQuery.graphql";
// import {useRouter} from "next/navigation";
import {Suspense} from "react";
import React from "react";

// export const dynamic = "force-dynamic";

// export const dynamic = 'force-static':
// export const dynamicParams = false
//export async function generateStaticParams()


const NewsfeedQuery = graphql`
    query pagegetReportQuery($id: ID! ) {
        getReport(id: $id) {
            id
            data
            snapshot
            modeltype,modelversion
            isp{id, no}
        }
    }
`;

// async function getPost(id: string) {
//     const res = await fetch(`https://api.vercel.app/blog/${id}`, {
//         cache: 'force-cache',
//     })
//     const post: Post = await res.json()
//     if (!post) notFound()
//     return post
// }

/*async/await is not yet supported in Client Components, only Server Components.
params: Promise<{ repId: string }>      ; await params;
* */
export default  function Page({
                                       params,
                                   }: {
    params: Promise<{ repId: string }>
}) {
    // KQcbgDF9RO21DsI92H3tTVJlcG9ydA
    const { repId } = React.use(params);  // await params
    // const post = await getPost(repId)
    // const data ={};
    const data = useLazyLoadQuery<pagegetReportQuery>(
        NewsfeedQuery,
        {id: repId}
    );
    // const router = useRouter();
    // console.log("graphql->authUser", data);
    const {getReport: items} = data;

    return (
        <article>
            <h1>Hello, Blog baogao报告内容。。。Post Page!__ </h1>
            {items?.data}
        </article>
    )
}

