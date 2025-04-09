"use client"

import Link from "next/link"
// import {signOut} from "@/app/auth";
import { useSession, signIn, signOut } from "next-auth/react"

export function UserNav() {
	const { data: session } = useSession();
    const handleSignOut = async () => {
        const data =await signOut({
            redirect: true,
            redirectTo: '/login'        // Redirect to home after sign out
        });
        //useRouter().push(data.url)
    }

console.log(session);
  return (
      <div>
          <button onClick={() => signOut()}>DO=Sign@##out</button>
          <button onClick={handleSignOut}>
              Log out 登 出 =注销吧
              <div>⇧⌘Q</div>
          </button>
      </div>
  )
}