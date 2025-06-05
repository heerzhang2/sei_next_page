import { auth } from "@/app/auth"
import { RoleCache } from "@/lib/redis"
import { redirect } from "next/navigation"

export async function requireRole(requiredRoles: string[]) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const userRoles = await RoleCache.getUserRoles(session.user.id)
  const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role))

  if (!hasRequiredRole) {
    throw new Error(`无法授权必须有角色: ${requiredRoles.join(", ")}`)
  }

  return { session, userRoles }
}

export async function getUserPermissionSummary() {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  const userRoles = await RoleCache.getUserRoles(session.user.id)

  return {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    canStartProcess: userRoles.some((role) => ["PROCESS_STARTER", "ADMIN"].includes(role)),
    canCancelProcess: userRoles.includes("ADMIN"),
    canViewReports: userRoles.some((role) => ["REPORTER", "ADMIN"].includes(role)),
    isAdmin: userRoles.includes("ADMIN"),
    roleCount: userRoles.length,
  }
}
