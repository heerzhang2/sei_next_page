
// import { auth } from '@/app/auth';
import { UserNav } from './user-nav';
// import { SessionProvider } from 'next-auth/react';
// import { useSession, signIn, signOut } from "next-auth/react"
import {auth} from "@/app/auth";
export const dynamic = "force-dynamic";

export default async function Header() {
    const session =await auth();
 return (
    <header className="sticky flex justify-center border-b">
      <div className="flex items-center justify-between w-full h-16 px-4 mx-auto sm:px-6">
          Signed in AAS 用户邮件{session?.user?.email} 会话的； <br />
        <div className="ml-auto flex items-center space-x-4">

                  <UserNav />

        </div>
      </div>
    </header>
  );
}
