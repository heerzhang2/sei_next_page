'use client';

import {graphql} from "relay-runtime";
import React, {cache} from "react";
import {loadQuery, usePreloadedQuery, useRelayEnvironment} from "react-relay/hooks";
import {useFragment} from "react-relay";
import {ReportView} from "@/report/recreation/slidingJj/Regular.R-1";
import {reportClientIsp$key} from "./__generated__/reportClientIsp.graphql";
import {AppQuery} from "@/action/actions";


export function NameDisplay({ queryRef }) {
    const data = usePreloadedQuery(AppQuery, queryRef);
    const {getReport: rep}=data as any

    return  <div>
          {rep?.id} <br/>

    </div>
}


interface Props {
    queryRef: reportClientIsp$key;
}

function SlowContent(props: Props) {
    const data = useFragment(
        graphql`
            fragment reportClientIsp on Report
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
        `,
        props.queryRef
    );
    const {id} = data as any;

    return <div>
        <h1>Hell_ </h1>
            {data?.isp?.bsType}
         <ReportView source={{}} verId={'1'} rep={data}/>
    </div>;
}
