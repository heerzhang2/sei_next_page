// "use client";
import {useFragment, useLazyLoadQuery} from "react-relay";
import { graphql } from 'relay-runtime';
// import {useRouter} from "next/navigation";
import {Suspense} from "react";
import React from "react";
import {ReportView} from "@/report/recreation/slidingJj/Regular.R-1";
import {gql, useQuery} from "@urql/next";

//片段不能像Relay那样的能做独立形式的定义了！必须每个请求都定义； "Validation error (UndefinedFragment@[getReport]) : Undefined fragment 'pageReportIsp'"
// const RepIspQuery=gql` `;
const NewsfeedQuery = gql`
  query pagegetReportQuery($id: ID! ) {
    getReport(id: $id) {
      id
      data
      snapshot
      modeltype,modelversion
      isp{id, no}
      ...pageReportIsp
    }
  }
  fragment pageReportIsp on Report
  {
    id, modeltype, modelversion, tzFields,
    isp {
      id, no, report{id},
      dev{id cod},bsType,
      reps {
        edges {
          node {
            id, modeltype, modelversion,data,
            stm{id,sta,
              authr{ id, username, person {id, name} },
              reviewer{ id, username, person {id, name} }
            }
          }
        },
      },
      ispMen { id, username, person {id, name} },
      checkMen { id, username, person {id, name} }
      ispu{id agency{id,apno,bjtel,bjurl},name},
      bus{id,
        pipus{id crDate code rno name start stop nxtd1 nxtd2 leng level lay safe svp pa}
      }
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
export default  function CommonReportView({
    repId       }: {  repId:  string}
) {
  // KQcbgDF9RO21DsI92H3tTVJlcG9ydA
  // const { repId } = React.use(params);  // await params
  // const post = await getPost(repId)
  // const data ={};
  const [result] = useQuery({ query: NewsfeedQuery, variables: { id: repId } });

  // const router = useRouter();
  // console.log("graphql->authUser", data);
  const {getReport: report} = result?.data;

  //【暂时】snapshot还未加入的
  return (
      <article>
        <h1>Hello, Blog baogao报告内容。。。Post Page!__ </h1>
        {report?.data}
        <ReportView source={report?.data} verId={'1'} rep={report}/>
      </article>
  )
}
