"use server";
//将 Node.js server端的代码严格限制在服务端（API 路由、服务端组件）
import { auth } from "@/app/auth";
import { UserInfoCache } from "@/lib/redis";
import { redirect } from "next/navigation";
import { withBasePath } from "@/lib/tool";

/**角色验证结果类型 */
export type RoleCheckResult = 
  | { success: true; session: any; userRoles: any[] }
  | { success: false; error: string; code: string };

/**任意一个角色有的就能通过的： requireRole是服务器环境运行的。
 * 里面的const userinfo = await getUserInfo(userId,accessToken) ；redis.get(cacheKey) 似乎在浏览器环境是不能复用的，浏览器需要另外发起后端的api做查询。
 * 
 * 修改：不再抛出异常，而是返回结果对象，让调用方决定如何处理
 * */
export async function requireRole(requiredRoles: string[]): Promise<RoleCheckResult> {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.accessToken) {
    console.log("[role-auth] 用户未登录", session);
    return {
      success: false,
      error: "用户未登录或登录已过期，请重新登录",
      code: "UNAUTHORIZED",
    };
  }
  
  let userRoles: any[];
  try {
    userRoles =
      (await UserInfoCache.getUserRoles(
        session.user.id,
        session?.user?.accessToken
      )) ?? [];
  } catch (error: any) {
    // 处理 401 未授权错误
    if (error.message?.includes("UNAUTHORIZED")) {
      console.log(`[role-auth] 获取用户角色失败 | 用户: ${session.user.name} | 原因: 登录已过期`);
      return {
        success: false,
        error: "登录已过期，请重新登录",
        code: "UNAUTHORIZED",
      };
    }
    // 其他错误继续抛出
    throw error;
  }

  // 关键修改：将 every() 改为 some() 实现任意角色匹配
  const userRoleNames = new Set<string>(userRoles.map((role) => role?.name));
  const hasRequiredRole = requiredRoles.some((roleName) =>
    userRoleNames.has(roleName)
  );
  
  if (!hasRequiredRole) {
    const userRoleStr = Array.from(userRoleNames).join(", ") || "无角色";
    console.log(`[role-auth] 权限不足 | 用户: ${session.user.name} | 需要角色: ${requiredRoles.join(", ")} | 当前角色: ${userRoleStr}`);
    return {
      success: false,
      error: `权限不足：需要 ${requiredRoles.join(" 或 ")} 角色才能执行此操作`,
      code: "FORBIDDEN",
    };
  }
  
  return { success: true, session, userRoles };
}

//全部角色必须都满足的才能允许使用：
export async function requireAllRole(requiredRoles: string[]): Promise<RoleCheckResult> {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.accessToken) {
    console.log("[role-auth] 用户未登录", session);
    return {
      success: false,
      error: "用户未登录或登录已过期，请重新登录",
      code: "UNAUTHORIZED",
    };
  }
  
  let userRoles: any[];
  try {
    userRoles =
      (await UserInfoCache.getUserRoles(
        session.user.id,
        session?.user?.accessToken
      )) ?? [];
  } catch (error: any) {
    // 处理 401 未授权错误
    if (error.message?.includes("UNAUTHORIZED")) {
      console.log(`[role-auth] 获取用户角色失败 | 用户: ${session.user.name} | 原因: 登录已过期`);
      return {
        success: false,
        error: "登录已过期，请重新登录",
        code: "UNAUTHORIZED",
      };
    }
    // 其他错误继续抛出
    throw error;
  }
  
  // 方法2：使用 Set 优化性能
  const userRoleNames = new Set<string>(userRoles.map((role) => role?.name));
  const hasRequiredRole = requiredRoles.every((roleName) =>
    userRoleNames.has(roleName)
  );
  
  if (!hasRequiredRole) {
    const userRoleStr = Array.from(userRoleNames).join(", ") || "无角色";
    console.log(`[role-auth] 权限不足 | 用户: ${session.user.name} | 需要全部角色: ${requiredRoles.join(", ")} | 当前角色: ${userRoleStr}`);
    return {
      success: false,
      error: `权限不足：需要同时拥有 ${requiredRoles.join("、")} 角色才能执行此操作`,
      code: "FORBIDDEN",
    };
  }
  
  return { success: true, session, userRoles };
}
