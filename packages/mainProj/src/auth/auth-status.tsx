"use client"

import { useSession } from 'next-auth/react'
import { Loader2, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

export function AuthStatus() {
    const { data: session, status } = useSession()

    if (status === 'loading') {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>加载中...</span>
            </div>
        )
    }

    if (status === 'authenticated' && session?.user) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" />
                    <span>{session.user.name || session.user.email}</span>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut()}
                    className="flex items-center gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    退出
                </Button>
            </div>
        )
    }

    return (
        <div className="text-sm text-gray-600">
            未登录
        </div>
    )
}
