"use client"

import {  signOut, useSession } from "next-auth/react"
// import { signOut } from "@/app/auth"
// import { SignOut } from "./auth-components"
// import { Button } from "./ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuShortcut,
//   DropdownMenuTrigger,
// } from "./ui/dropdown-menu"
import Link from "next/link"


export function UserNav() {
	const { data: session } = useSession();
    const handleSignOut = async () => {
        const data =await signOut({
            redirect: true,
            redirectTo: '/'        // Redirect to home after sign out
        });
        //useRouter().push(data.url)
    }

console.log(session);
  return (
    <div>
        <button onClick={handleSignOut}>
          Log out
          <div>⇧⌘Q</div>
        </button>
    </div>
  )
}