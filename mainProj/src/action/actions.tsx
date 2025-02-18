"use client"
// 'use server';

import {graphql} from "relay-runtime";
import {cache} from "react";
import {loadQuery,} from "react-relay/hooks";


export const AppQuery = graphql`
    query actionsgetReportQuery($id: ID! ) {
        getReport(id: $id) {
            id
            data
            snapshot
            modeltype,modelversion
            isp{id, no}
            ...reportClientIsp
        }
    }
`;

// 缓存数据获取函数 Attempted to call getCachedPosts() from the server but getCachedPosts is on the client. It's not possible to invoke a client function from the server,


