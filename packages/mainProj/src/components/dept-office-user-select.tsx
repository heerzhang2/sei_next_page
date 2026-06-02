"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { gql, useQuery, useClient } from "@urql/next";

// 固定的归属单位 福建省特检院 的Global ID;
export const DEFAULT_UNIT_GID = "JgAAAAAAAAEAAAAAAAAAAFVuaXQ";

// 用户类型
interface User {
  id: string;
  username: string;
  authName: string | null;
  personName: string | null;
  personId: string;
}

// 科室类型
interface Office {
  id: string;
  name: string;
  users: User[];
}

// 部门类型
interface Division {
  id: string;
  name: string;
  offices: Office[];
  staff: User[];
}

// 组件输出值类型
export interface DeptOfficeUserValue {
  depId: string;
  officeId: string;
  userId: string;
  /** 用户的可读姓名（personName 或 username） */
  name?: string;
}

// 组件属性
interface DeptOfficeUserSelectProps {
  value?: DeptOfficeUserValue;
  onChange: (value: DeptOfficeUserValue) => void;
  className?: string;
}

// 获取当前用户基本信息的 GraphQL 查询
const CurrentUserQuery = gql`
  query CurrentUserQuery {
    authUser {
      id
      username
      authName
      person {
        id
        name
      }
      dep {
        id
        name
      }
      office {
        id
        name
      }
    }
  }
`;

// 通过固定单位ID获取部门列表的 GraphQL 查询
const GetUnitQuery = gql`
  query GetUnitQuery($esid: ID!) {
    getUnit(esid: $esid, company: true) {
      id
      name
      dvs {
        id
        name
      }
      staff {
        id
        username
        authName
        person {
          id
          name
        }
      }
    }
  }
`;

const DivisionOfficesQuery = gql`
  query DivisionOffices($divisionId: ID!) {
    division(id: $divisionId) {
      id
      name
      offices {
        id
        name
      }
      staff {
        id
        username
        authName
        person {
          id
          name
        }
      }
    }
  }
`;

const OfficeStaffQuery = gql`
  query OfficeStaff($officeId: ID!) {
    office(id: $officeId) {
      id
      name
      staff {
        id
        username
        authName
        person {
          id
          name
        }
      }
    }
  }
`;

export function DeptOfficeUserSelect({
  value,
  onChange,
  className,
}: DeptOfficeUserSelectProps) {
  // 内部状态（直接从 value prop 初始化）
  const [selectedDep, setSelectedDep] = useState<string>(value?.depId || "");
  const [selectedOffice, setSelectedOffice] = useState<string>(value?.officeId || "");
  const [selectedUser, setSelectedUser] = useState<string>(value?.userId || "");

  // 同步 value prop 到内部 state（仅传递有实质内容的字段，不覆盖推断/用户选择）
  useEffect(() => {
    if (!value) return;
    // 仅同步非空的有意义信息，避免用空字符串覆盖推断结果（如"all"、"none"）
    if (value.depId && value.depId !== selectedDep) {
      setSelectedDep(value.depId);
    }
    if (value.officeId && value.officeId !== selectedOffice) {
      setSelectedOffice(value.officeId);
    }
    if (value.userId && value.userId !== selectedUser) {
      setSelectedUser(value.userId);
    }
  }, [value]);

  // 科室和人员列表
  const [offices, setOffices] = useState<Office[]>([]);
  const [noOfficeUsers, setNoOfficeUsers] = useState<User[]>([]);
  const [officeUsers, setOfficeUsers] = useState<User[]>([]);
  const [loadingOffices, setLoadingOffices] = useState(false);
  const [, setLoadingOfficeUsers] = useState(false);

  // 获取当前用户基本信息
  const [userResult] = useQuery({
    query: CurrentUserQuery,
  });

  const currentUser = userResult.data?.authUser;

  // 通过固定单位ID获取部门列表
  const [unitResult] = useQuery({
    query: GetUnitQuery,
    variables: { esid: DEFAULT_UNIT_GID },
  });

  const client = useClient();

  // 构建部门列表（从固定单位获取）
  const divisions = useMemo<Division[]>(() => {
    const unitDvs = unitResult.data?.getUnit?.dvs;
    if (!unitDvs) return [];
    return unitDvs.map((dv: any) => ({
      id: dv.id,
      name: dv.name,
      offices: [],
      staff: [],
    }));
  }, [unitResult.data]);

  // 初始化默认值
  useEffect(() => {
    if (divisions.length === 0) return;
    if (selectedDep) return; // 已设置则不覆盖

    // 优先使用当前用户的部门作为默认值（仅当没有外部传入 value 时）
    const userDepId = (!value) ? currentUser?.dep?.id : undefined;
    if (userDepId) {
      const divisionExists = divisions.find((d) => d.id === userDepId);
      if (divisionExists) {
        setSelectedDep(userDepId);
      }
    }
  }, [currentUser, divisions, selectedDep, value]);

  // 初始化推断：处理部分 value 的场景（只有 userId 或 userId+depId）
  useEffect(() => {
    if (!value?.userId || !divisions.length) return;

    // 场景：有 userId 但没有 depId → 默认选"全部部门"
    if (!value.depId && !selectedDep) {
      setSelectedDep("all");
    }

    // 场景：有 userId 但没有 officeId → 默认选"无所属科室"
    if (!value.officeId && !selectedOffice && selectedDep) {
      setSelectedOffice("none");
    }
  }, [value, divisions, selectedDep, selectedOffice]);

  // 当部门改变时，查询科室列表
  useEffect(() => {
    if (!selectedDep) {
      setOffices([]);
      setNoOfficeUsers([]);
      setSelectedOffice("");
      // 有外部传入 userId 时不清除 selectedUser
      if (!value?.userId) {
        setSelectedUser("");
      }
      return;
    }

    if (selectedDep === "all") {
      setOffices([]);
      // 使用 Unit.staff（没有挂在部门底下的人员）填充 noOfficeUsers
      const unitStaff = unitResult.data?.getUnit?.staff;
      if (unitStaff) {
        setNoOfficeUsers(
          unitStaff.map((u: any) => ({
            id: u.id,
            username: u.username,
            authName: u.authName,
            personName: u.person?.name,
            personId: u.person?.id,
          }))
        );
      } else {
        setNoOfficeUsers([]);
      }
      // "全部部门"模式：自动选"无所属科室"，保留已选用户
      setSelectedOffice("none");
      return;
    }

    const fetchDivisionData = async () => {
      setLoadingOffices(true);
      try {
        const result = await client
          .query(DivisionOfficesQuery, { divisionId: selectedDep })
          .toPromise();
        if (result.error) {
          console.error("GraphQL errors:", result.error);
          return;
        }
        if (result.data?.division) {
          const division = result.data.division;
          setOffices(
            (division.offices || []).map((o: any) => ({
              id: o.id,
              name: o.name,
              users: [],
            }))
          );
          setNoOfficeUsers(
            (division.staff || []).map((u: any) => ({
              id: u.id,
              username: u.username,
              authName: u.authName,
              personName: u.person?.name,
              personId: u.person?.id,
            }))
          );

          // 如果是当前用户的部门，且没有外部传入 value，尝试设置默认科室
          if (!value && currentUser?.dep?.id === selectedDep && currentUser?.office?.id) {
            const userOffice = division.offices?.find(
              (o: any) => o.id === currentUser.office.id
            );
            if (userOffice) {
              setSelectedOffice(currentUser.office.id);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch division offices:", error);
      } finally {
        setLoadingOffices(false);
      }
    };

    fetchDivisionData();
  }, [selectedDep, currentUser, unitResult]);

  // 当科室改变时，查询科室人员
  useEffect(() => {
    if (!selectedOffice) {
      setOfficeUsers([]);
      // 有外部传入 userId 时不清除 selectedUser
      if (!value?.userId) {
        setSelectedUser("");
      }
      return;
    }

    if (selectedOffice === "none") {
      // "无所属科室"模式：保留已选用户（用户可能在 noOfficeUsers 中）
      setOfficeUsers([]);
      return;
    }

    const fetchOfficeStaff = async () => {
      setLoadingOfficeUsers(true);
      try {
        const result = await client
          .query(OfficeStaffQuery, { officeId: selectedOffice })
          .toPromise();
        if (result.error) {
          console.error("GraphQL errors:", result.error);
          return;
        }
        if (result.data?.office) {
          const users = (result.data.office.staff || []).map((u: any) => ({
            id: u.id,
            username: u.username,
            authName: u.authName,
            personName: u.person?.name,
            personId: u.person?.id,
          }));
          setOfficeUsers(users);

          // 如果是当前用户的科室，且没有外部传入 value，尝试设置默认人员为当前用户
          if (!value && currentUser?.office?.id === selectedOffice) {
            const currentUserInList = users.find(
              (u: User) =>
                u.id === currentUser.id || u.authName === currentUser.authName
            );
            if (currentUserInList) {
              setSelectedUser(currentUserInList.id);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch office staff:", error);
      } finally {
        setLoadingOfficeUsers(false);
      }
    };

    fetchOfficeStaff();
  }, [selectedOffice, currentUser]);

  // 使用 ref 保存 onChange 回调，避免依赖变化导致的无限循环
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // 当选择变化时，触发 onChange（只要选择了部门就返回）
  useEffect(() => {
    if (selectedDep) {
      // 查找当前选中用户的名称
      const allUsers = getDisplayUsers();
      const selectedUserObj = allUsers.find((u) => u.id === selectedUser);
      const name = selectedUserObj
        ? selectedUserObj.personName || selectedUserObj.username
        : undefined;

      onChangeRef.current({
        depId: selectedDep === "all" ? "" : selectedDep,
        officeId: selectedOffice === "none" ? "" : selectedOffice,
        userId: selectedUser,
        name,
      });
    }
  }, [selectedDep, selectedOffice, selectedUser]);

  // 获取当前科室的所有人员（含 fallback：selectedUser 不在列表中时也显示）
  const getDisplayUsers = (): User[] => {
    let currentUsers: User[];
    if (selectedOffice === "none") {
      currentUsers = noOfficeUsers;
    } else {
      currentUsers = officeUsers;
    }

    // fallback：如果 selectedUser 存在但不在当前列表中（如只传了 userId 的场景），补充显示
    if (selectedUser && !currentUsers.find((u) => u.id === selectedUser)) {
      return [
        ...currentUsers,
        {
          id: selectedUser,
          username: "",
          authName: null,
          personName: value?.name || "",
          personId: "",
        },
      ];
    }
    return currentUsers;
  };

  // 处理部门选择
  const handleDepChange = useCallback((value: string) => {
    setSelectedDep(value);
    setSelectedOffice("");
    setSelectedUser("");
  }, []);

  // 处理科室选择
  const handleOfficeChange = useCallback((value: string) => {
    setSelectedOffice(value);
    setSelectedUser("");
  }, []);

  // 处理人员选择
  const handleUserChange = useCallback((value: string) => {
    setSelectedUser(value);
  }, []);

  return (
    <div className={`grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 ${className || ""}`}>
      {/* 部门选择 */}
      <div className="space-y-2">
        <Label>选择部门</Label>
        <Select
          value={selectedDep}
          onValueChange={handleDepChange}
          modal={false}
        >
          <SelectTrigger>
            <SelectValue placeholder="请选择部门" />
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-80">
            <SelectItem value="all">全部部门</SelectItem>
            {divisions.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 科室选择 */}
      <div className="space-y-2">
        <Label>选择科室</Label>
        <Select
          value={selectedOffice}
          onValueChange={handleOfficeChange}
          disabled={!selectedDep || loadingOffices}
          modal={false}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={loadingOffices ? "加载中..." : "请选择科室"}
            />
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-80">
            {offices.map((office) => (
              <SelectItem key={office.id} value={office.id}>
                {office.name}
              </SelectItem>
            ))}
            {(offices.length > 0 || noOfficeUsers.length > 0 || selectedDep === "all") && (
              <SelectItem value="none">无所属科室</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* 人员选择 */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label>选择人员</Label>
          {selectedUser && (
            <button
              type="button"
              className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full text-[10px] text-muted-foreground hover:bg-destructive hover:text-destructive-foreground leading-none"
              onClick={() => setSelectedUser("")}
              title="清除人员选择"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <div className="flex-1">
            <Select
              value={selectedUser}
              onValueChange={handleUserChange}
              disabled={!selectedOffice && noOfficeUsers.length === 0 && !selectedUser}
              modal={false}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择人员" />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom">
                {getDisplayUsers().map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.personName || user.username}
                    {user.authName && (
                      <span className="text-muted-foreground ml-1">
                        ({user.authName})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
