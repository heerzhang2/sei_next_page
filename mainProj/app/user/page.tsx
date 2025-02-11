"use client";

// import { getTranslations, setRequestLocale } from 'next-intl/server';
import SignInForm from "@/component/SignInForm";
import Link from "next/link";
import {useLazyLoadQuery} from "react-relay";
import {MainContentQuery} from "../__generated__/MainContentQuery.graphql";
// import {useRouter} from "next/navigation";
import { graphql } from "relay-runtime";

type ISignInPageProps = {
  params: Promise<{ locale: string }>;
};


export default  function UserPage(props: ISignInPageProps) {
    const data = useLazyLoadQuery<MainContentQuery>(
        graphql`
            query MainContentQuery {
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
    // const router = useRouter();
    console.log("UserPage", data);
    const {authUser} = data;

    return (
        <>
            <main className="text-xl text-green-500">Main data: {authUser?.username}</main>
            <div className="mt-10">
                <Link href="/">⬅️ Go  home</Link>
            </div>
        </>
    );
};
