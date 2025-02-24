"use client"

import Link from 'next/link';
import React, { Suspense } from 'react';
import {useQuery, gql, UrqlProvider, useMutation} from '@urql/next';
//过时包吗 import { withUrqlClient } from 'next-urql';
import {getSsr, urqlClient} from "@/common/urql";
import {ReportView} from "@/report/recreation/slidingJj/Regular.R-1";
// import {useMutation} from "urql";


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


const UpdateTodo =gql`
    mutation useOriginalDataMutation(
        $id: ID!
        $operationType:Int!
        $data: String
        $deduction: String, $version:Int
    ) {
        modifyOriginalRecordData(id: $id, operationType: $operationType, data: $data, deduction: $deduction,version: $version) {
            id,version,type
            data
            snapshot
            modeltype,modelversion
            isp{id}
        }
    }
`;


// const Todo = ({ id, title }) => {
//     const [updateTodoResult, updateTodo] = useMutation(UpdateTodo);
//
//     const submit = newTitle => {
//         const variables = { id, title: newTitle || '' };
//         updateTodo(variables).then(result => {
//             if (result.error) {
//                 console.error('Oh no!', result.error);
//             }
//         });
//     };
// };

/*async/await is not yet supported in Client Components, only Server Components.
params: Promise<{ repId: string }>      ; await params;
* */
function CommonReportEditor({
                              repId       }: {  repId:  string}
) {
    const [result] = useQuery({ query: NewsfeedQuery, variables: { id: repId } });
    const [updateTodoResult, updateTodo] = useMutation(UpdateTodo);
    // const router = useRouter();
    // console.log("graphql->authUser", data);
    const {getReport: report} = result?.data;
    const onSubmitLink = event => {
        event.preventDefault();
        const { target } = event;
        updateTodo({id:repId,operationType:1,
            version: 1, //new FormData(target).get('link'),
            data:report?.data }).then(() =>
            target.reset()
        );
    };
    //【暂时】snapshot还未加入的
    // @ts-ignore
    return (
        <article>
            <h1>bianjiqi编辑器的 离线？</h1>
            {report?.data}

            <form onSubmit={onSubmitLink}>
                {updateTodoResult.fetching ? <p>Submitting...</p> : null}
                {updateTodoResult.error ? (
                    <p>Oh no... {updateTodoResult.error.message}</p>
                ) : null}

                <fieldset disabled={updateTodoResult.fetching}>
                    <label>
                        {'Link to Blog Post: '}
                        <input type="text" name="link" placeholder="https://..." />
                    </label>
                    <button type="submit">试验看等待</button>
                </fieldset>
            </form>
        </article>
    )
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

    return (
        <article>
                <Suspense>
                    <CommonReportEditor repId={repId as string} />
                </Suspense>
        </article>
    )
}
