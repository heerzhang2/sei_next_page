"use client"

import { UserNav } from "./user-nav"
import {useSession} from "next-auth/react";

interface ClientHeaderProps {
    // userName?: string | null
}

export function ClientHeader({  }: ClientHeaderProps) {
    const { data: session } = useSession();
    return (
        <header className="flex justify-center border-b">
            <div className="flex items-center justify-between w-full h-16 px-4 mx-auto sm:px-6">
                用户: {session?.user?.name || "未登录"}
                <br />
                <div className="ml-auto flex items-center space-x-4">
                    <UserNav />
                </div>
            </div>
        </header>
    )
}
