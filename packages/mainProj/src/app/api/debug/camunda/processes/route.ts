// 调试 Camunda 流程定义的 API 路由
import { listAllProcessDefinitions } from "@/lib/camunda";
import { requireRole } from "@/lib/role-auth";

export async function GET(request: Request) {
    try {
        // 可选的角色验证 - 注释掉以便调试
        // const { session, userRoles } = await requireRole(["JyUser"]);

        const definitions = await listAllProcessDefinitions();

        return Response.json({
            success: true,
            data: definitions,
        });
    } catch (error: any) {
        console.error("获取流程定义列表失败:", error);
        return Response.json({
            success: false,
            error: error.message,
            details: error.toString(),
        }, { status: 500 });
    }
}
