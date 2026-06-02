"use client";

import { useMemo } from "react";
import { gql, useQuery } from "@urql/next";
import { toGlobalId, fromGlobalId } from "@/lib/global-id";
import { DeptOfficeUserSelect, DeptOfficeUserValue } from "@/components/dept-office-user-select";

// 根据用户ID查询部门、科室信息的 GraphQL 查询
const UserDeptOfficeQuery = gql`
  query UserDeptOfficeQuery($id: ID!) {
    getUser(id: $id) {
      id username
      dep {
        id
        name
      }
      office {
        id
        name
      }
      person {
        id
        name
      }
      unit {
        id
        name
      }
    }
  }
`;

// 组件属性
interface UserDeptOfficeSelectProps {
  /** 用户ID，是 GlobalID（Base64字符串） */
  userId?: string;
  /** 外部传入的 value，优先级高于通过 userId 自动解析的值 */
  value?: DeptOfficeUserValue;
  onChange: (value: DeptOfficeUserValue) => void;
  className?: string;
}

/**
 * 用户部门/科室/人员选择组件
 *
 * 功能：
 * 1. 接受 userId（支持 GlobalID）
 * 2. 通过 URQL 客户端查询用户所属部门ID和科室ID
 * 3. 自动预填 DeptOfficeUserSelect 的 depId / officeId / userId
 * 4. 仍然通过 onChange 返回 depId / officeId / userId
 *
 * 与旧的 DeptOfficeUserSelect 共存，新组件包装旧组件
 */
export function UserDeptOfficeSelect({
  userId,
  value,
  onChange,
  className,
}: UserDeptOfficeSelectProps) {

  // 客户端查询用户所属部门和科室
  const [result] = useQuery({
    query: UserDeptOfficeQuery,
    variables: { id: userId },
    pause: !userId,
    requestPolicy: "cache-first",
  });

  const userData = result.data?.getUser;

  // 构建赋给子组件的 value
  // 优先级：外部传入 value（若缺部门/科室信息则等待查询结果补充）> 从 userId 查询解析的值
  const resolvedValue = useMemo<DeptOfficeUserValue | undefined>(() => {
    if (value) {
      // 外部 value 有 userId 但缺部门信息时：
      // 等待 GraphQL 查询完成拿到真实部门/科室数据，避免子组件被中间空态误导
      if (value.userId && !value.depId) {
        if (!userData) return undefined; // 查询未完成 → 等待
        return {
          depId: userData.dep?.id || "",
          officeId: userData.office?.id || "",
          userId: value.userId,
          name: value.name || userData.person?.name || userData.username || "",
        };
      }
      return value;
    }
    if (userData) {
      return {
        depId: userData.dep?.id || "",
        officeId: userData.office?.id || "",
        userId: userId || "",
        name: userData.person?.name || userData.username || "",
      };
    }
    // 如果只有 userId 但没有查询结果，至少传递 userId
    if (userId) {
      return {
        depId: "",
        officeId: "",
        userId: userId,
      };
    }
    return undefined;
  }, [value, userData, userId]);

  return (
    <DeptOfficeUserSelect
      value={resolvedValue}
      onChange={onChange}
      className={className}
    />
  );
}
