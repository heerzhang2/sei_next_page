"use client";

// import {useFragment, useLazyLoadQuery} from "react-relay";
// import { graphql } from 'relay-runtime';
// import {pagegetReportQuery} from "./__generated__/pagegetReportQuery.graphql";
// import {useRouter} from "next/navigation";
import React, {cache, lazy, Suspense} from "react";
import {staticRelayEnvironment} from "@/relay/ServerRelay";
import {NameDisplay} from "@/action/reportClient";
import {AppQuery, } from "@/action/actions";

// import {ReportView} from "@/report/recreation/slidingJj/Regular.R-1";
// import {pageReportIsp$key} from "@/app/(pub)/rep/SLIDING_JJ/1/[repId]/__generated__/pageReportIsp.graphql";
// import {SlowContent$key} from "@/app/(auth)/lazy/__generated__/SlowContent.graphql";
import {loadQuery, usePreloadedQuery, useRelayEnvironment} from "react-relay/hooks";
// import { cache } from 'react'


const getCachedPosts = cache(async (environment,id: string) => {
    // const queryReference =null;
    const queryReference =loadQuery(
        environment,
        AppQuery,
        {id: id},
        {fetchPolicy: 'store-or-network'},
    );
    return queryReference;
})

//async/await is not yet supported in Client Components, only Server Components.
// 用于显示帖子的服务器组件
export  function PostList(repId) {
    const environment = useRelayEnvironment();
    const dataref =  getCachedPosts(environment, repId)
    const data = React.use(dataref);
    return (<div>
            {dataref != null
                ? <NameDisplay queryRef={data}/>
                : null
            }
        </div>
    )
}

// const SlowContentLazy = lazy(() => <PostList/>);

/*async/await is not yet supported in Client Components, only Server Components.
params: Promise<{ repId: string }>      ; await params;
* */
export default  function Page({
                                       params,
                                   }: {
    params: Promise<{ repId: string }>
}) {
    const { repId } = React.use(params);  // await params
    // @ts-ignore
    return (
        <article>
                <PostList repId={repId}/>
        </article>
    )
}

