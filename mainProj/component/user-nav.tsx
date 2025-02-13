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
console.log(session);
  return (
    <div>
        <button onClick={() => signOut()}>
          Log out
          <div>⇧⌘Q</div>
        </button>
    </div>
  )
}