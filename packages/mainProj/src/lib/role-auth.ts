"use server";
//将 Node.js server端的代码严格限制在服务端（API 路由、服务端组件）
import { auth } from "@/app/auth";
import { UserInfoCache } from "@/lib/redis";
import { redirect } from "next/navigation";
import { withBasePath } from "@/lib/tool";

/**任意一个角色有的就能通过的： requireRole是服务器环境运行的。
 * 里面的const userinfo = await getUserInfo(userId,accessToken) ；redis.get(cacheKey) 似乎在浏览器环境是不能复用的，浏览器需要另外发起后端的api做查询。
 * */
export async function requireRole(requiredRoles: string[]) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.accessToken) {
    console.log("requireRole跳转login", session);
    redirect(withBasePath("/login"));
    //这里后面的代码实际上再浏览器调用的路数下会继续运行的？单纯服务器环境不会！ redirect也会同时做的。 应该加 return;
  }
  const userRoles =
    (await UserInfoCache.getUserRoles(
      session.user.id,
      session?.user?.accessToken
    )) ?? [];

  // 关键修改：将 every() 改为 some() 实现任意角色匹配
  const userRoleNames = new Set<string>(userRoles.map((role) => role?.name));
  const hasRequiredRole = requiredRoles.some((roleName) =>
    userRoleNames.has(roleName)
  );
  if (!hasRequiredRole)
    throw new Error(`需要至少一个角色权限: ${requiredRoles.join(", ")}`);
  return { session, userRoles };
}

//全部角色必须都满足的才能允许使用：
export async function requireAllRole(requiredRoles: string[]) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.accessToken) {
    console.log("requireAllRole跳转login", session);
    redirect(withBasePath("/login"));
  }
  const userRoles =
    (await UserInfoCache.getUserRoles(
      session.user.id,
      session?.user?.accessToken
    )) ?? [];
  // 方法2：使用 Set 优化性能
  const userRoleNames = new Set<string>(userRoles.map((role) => role?.name));
  const hasRequiredRole = requiredRoles.every((roleName) =>
    userRoleNames.has(roleName)
  );
  if (!hasRequiredRole) {
    throw new Error(`无法授权必须有角色: ${requiredRoles.join(", ")}`);
  }
  return { session, userRoles };
}
