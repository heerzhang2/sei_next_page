"use client";
import {graphql, useLazyLoadQuery} from "react-relay";
import {MainContentUserQuery} from "@/app/(auth)/user/__generated__/MainContentUserQuery.graphql";
import {useRouter} from "next/navigation";
import {Suspense} from "react";

function generateStaticParams() {}

export default function Page() {
    const data = useLazyLoadQuery<MainContentUserQuery>(
        graphql`
            query MainContentUserQuery {
                authUser{
                    id,username, person{id,name}
                    dep{id name} office{id name}
                    unit{id name dvs{id name} }
                    ispUnits{id,unit{id,name}}
                }
                ...SlowContent
            }
        `,
        {}
    );
    const router = useRouter();
    // console.log("graphql->authUser", data);
    const {authUser} = data;
    //无需登录的URL
    const isPublic=false;//isPublicAccsess(history.location.pathname);
    if(!authUser)
    {
        if(!isPublic){
            // router.push('/login');
            // if (typeof window === "undefined") { } else { window.location.href = "/login"; }
            return null;
        }
    }

    return (
        <>
            <h1>Hello, Blog baogao报告内容。。。Post Page!</h1>
            <main className="text-xl text-green-500">baogao报告内容 {data.authUser?.username}</main>
            <main className="text-xl text-green-500">authUser# Main-GRAPHQL data: {authUser?.username}</main>

        </>
    );
}
