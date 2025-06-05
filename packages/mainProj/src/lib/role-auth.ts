import { auth } from "@/app/auth"
import { RoleCache } from "@/lib/redis"
import { redirect } from "next/navigation"

//有任意一个角色的 都通过的：
export async function requireRole(requiredRoles: string[]) {
  const session = await auth()
  if (!session?.user?.id || !session?.user?.accessToken) {
    redirect("/login")
  }
  const userRoles = await RoleCache.getUserRoles(session.user.id, session?.user?.accessToken) ?? []

  // 关键修改：将 every() 改为 some() 实现任意角色匹配
  const userRoleNames = new Set<string>(userRoles.map(role => role?.name));
  const hasRequiredRole = requiredRoles.some(roleName => userRoleNames.has(roleName));
  if(!hasRequiredRole)
      throw new Error(`需要至少一个角色权限: ${requiredRoles.join(", ")}`)
  return { session, userRoles }
}

//全部角色都满足的才授权：
export async function requireAllRole(requiredRoles: string[]) {
  const session = await auth()
  if (!session?.user?.id || !session?.user?.accessToken) {
    redirect("/login")
  }
  const userRoles = await RoleCache.getUserRoles(session.user.id, session?.user?.accessToken) ??[]
  // 方法2：使用 Set 优化性能
  const userRoleNames = new Set<string>(userRoles.map(role => role?.name));
  const hasRequiredRole = requiredRoles.every(roleName => userRoleNames.has(roleName));
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

  const userRoles = await RoleCache.getUserRoles(session.user.id, )

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
