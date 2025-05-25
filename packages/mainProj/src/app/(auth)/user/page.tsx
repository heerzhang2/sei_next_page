// "use client";

// import { getTranslations, setRequestLocale } from 'next-intl/server';
import SignInForm from "@/app/login/SignInForm";
import Link from "next/link";
// import {MainContentQuery} from "./__generated__/MainContentQuery.graphql";
// import {useRouter} from "next/navigation";
// import {useSession} from "next-auth/src/react";
// import { useSession, SessionProvider } from 'next-auth/react';
import {MainContent} from "./MainContent";
import { getSession } from 'next-auth/react';
import {auth} from "@/app/auth";
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'  // Alternative to default-no-store
// export const fetchCache = 'default-no-store'

// type ISignInPageProps = {
//   params: Promise<{ locale: string }>;
// };

//针对客户端浏览器的：use client无法useSession同步最新数据，还必须手动做刷新页面！
export default async function ClientComponent() {
    // const session = await getSession();
    // const headersList = await headers();
    //async/await is not yet supported in Client Components, only Server Components. This error is often caused by accidentally adding `'use client'` to a module that was originally written for the server.
    const session =await auth();
    if(!session?.user)   redirect('/login')
    //useLazyLoadQuery必须配套use client的；

    // const data = useLazyLoadQuery<MainContentQuery>(
    //     graphql`
    //         query pageUserQuery {
    //             authUser{
    //                 id,username, person{id,name}
    //                 dep{id name} office{id name}
    //                 unit{id name dvs{id name} }
    //                 ispUnits{id,unit{id,name}}
    //             }
    //             ...SlowContent
    //         }
    //     `,
    //     {}
    // );
    // console.log("UserPage", data);
    // const {authUser} =data;
    // const {authUser} = {authUser:{}} as any //data;
    //不是在这个才放入</SessionProvider>的！
    return (
        <>
            <main>use client#: {session?.user?.name} 这个名字</main>
            <MainContent/>

            <div className="mt-10">
                <Link href="/">⬅️ Go home</Link>
            </div>
        </>
    )
}
