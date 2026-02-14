"use client"

import { useSession, signOut, signIn } from "next-auth/react"
import { withBasePath } from "@/lib/tool"

export function UserNav() {
	const { data: session } = useSession();
    const handleSignOut = async () => {
        await signOut({
            redirect: true,
            redirectTo: withBasePath('/login')        // Redirect to home after sign out
        });
        //useRouter().push(data.url)
    }
    console.log(session);
  return (
      <div>
          <button onClick={() => signIn()}>登录</button>
          <button onClick={handleSignOut}>
            注销
          </button>
      </div>
  )
}