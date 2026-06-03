"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useClient, gql } from "@urql/next";
import HeaderWrapper from "@/component/header-wrapper";
import { TaskFilterPanel, TaskInput } from "./components/TaskFilterPanel";
import { TaskList } from "./components/TaskList";
import { TaskListSkeleton } from "./components/TaskListSkeleton";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// GraphQL 查询：获取任务列表
const FindAllTaskFilterQuery = gql`
  query FindAllTaskFilter(
    $orderBy: String
    $asc: Boolean
    $where: TaskInput
    $first: Int
    $after: String
  ) {
    findAllTaskFilter(
      orderBy: $orderBy
      asc: $asc
      where: $where
      first: $first
      after: $after
    ) {
      edges {
        cursor
        node {
          id
          date
          status
          bsType
          entrust
          eqpcnt
          origd
          dep {
            id
            name
          }
          office {
            id
            name
          }
          liabler {
            id
            username
            person {
              id name
            }
          }
          servu {
            id
            name
          }
          crman {
            id
            username
          }
          agreement {
            id
            ptno
          }
          dets{
            id ident outerId extra sort vart isp{id no dev{id cod oid sort vart subv} report{id modeltype modelversion stm{id sta}}} 
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// 每页加载数量
const PAGE_SIZE = 10;

export default function IspTaskPage() {
  // 筛选条件状态
  const [filters, setFilters] = useState<TaskInput>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // 分页状态
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const client = useClient();

  // 构建查询变量（过滤掉 null 值，避免后端 Map.copyOf 报错）
  const queryVariables = {
    orderBy: "date",
    asc: false,
    first: PAGE_SIZE,
    ...(Object.keys(filters).length > 0 && { where: filters }),
  };

  // 初始查询
  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: FindAllTaskFilterQuery,
    variables: queryVariables,
  });

  // 处理初始/筛选数据加载
  useEffect(() => {
    if (data?.findAllTaskFilter) {
      const edges = data.findAllTaskFilter.edges || [];
      setAllTasks(edges.map((e: any) => e.node));
      setHasMore(data.findAllTaskFilter.pageInfo?.hasNextPage ?? false);
      setCurrentCursor(data.findAllTaskFilter.pageInfo?.endCursor ?? null);
    }
  }, [data]);

  // 加载更多数据（使用 client.query 直接请求，避免 reexecuteQuery 变量合并异常）
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !currentCursor) return;

    setIsLoadingMore(true);
    try {
      const result = await client
        .query(FindAllTaskFilterQuery, {
          ...queryVariables,
          after: currentCursor,
        }, {
          requestPolicy: 'cache-and-network',
        })
        .toPromise();
      if (result.data?.findAllTaskFilter) {
        const newEdges = result.data.findAllTaskFilter.edges || [];
        setAllTasks((prev) => [...prev, ...newEdges.map((e: any) => e.node)]);
        setHasMore(result.data.findAllTaskFilter.pageInfo?.hasNextPage ?? false);
        setCurrentCursor(result.data.findAllTaskFilter.pageInfo?.endCursor ?? null);
      }
    } catch (e: any) {
      console.error('[LoadMore] Failed:', e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, currentCursor, queryVariables, client]);

  // 应用筛选
  const handleApplyFilters = useCallback((newFilters: TaskInput) => {
    setFilters(newFilters);
    setAllTasks([]);
    setCurrentCursor(null);
    setHasMore(true);
    setIsFilterOpen(false);
    reexecuteQuery({ requestPolicy: "network-only" });
  }, [reexecuteQuery]);

  // 清除筛选
  const handleClearFilters = useCallback(() => {
    setFilters({});
    setAllTasks([]);
    setCurrentCursor(null);
    setHasMore(true);
    reexecuteQuery({ requestPolicy: "network-only" });
  }, [reexecuteQuery]);

  // 检查是否有活跃筛选
  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <HeaderWrapper />
      
      {/* 页面标题栏 */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              检验任务列表
            </h1>
            
            {/* 桌面端筛选按钮 */}
            <div className="hidden md:flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-gray-500"
                >
                  <X className="w-4 h-4 mr-1" />
                  清除筛选
                </Button>
              )}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    筛选
                    {hasActiveFilters && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                        已启用
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>筛选条件</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <TaskFilterPanel
                      filters={filters}
                      onApply={handleApplyFilters}
                      onClear={handleClearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* 移动端筛选按钮 */}
            <div className="flex md:hidden items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-1" />
                    筛选
                    {hasActiveFilters && (
                      <span className="ml-1.5 w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
                  <SheetHeader>
                    <SheetTitle>筛选条件</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 overflow-y-auto">
                    <TaskFilterPanel
                      filters={filters}
                      onApply={handleApplyFilters}
                      onClear={handleClearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 桌面端：左侧筛选面板 + 右侧列表 */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-6">
          {/* 左侧筛选面板 */}
          <div className="col-span-1">
            <div className="sticky top-20 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-gray-900 dark:text-white">筛选条件</h2>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-auto py-1 px-2 text-xs"
                  >
                    清除
                  </Button>
                )}
              </div>
              <TaskFilterPanel
                filters={filters}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
              />
            </div>
          </div>

          {/* 右侧任务列表 */}
          <div className="col-span-3">
            {fetching && allTasks.length === 0 ? (
              <TaskListSkeleton count={PAGE_SIZE} />
            ) : error ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                <p className="text-red-500 mb-4">加载失败，请稍后重试</p>
                <Button onClick={() => reexecuteQuery({ requestPolicy: "network-only" })}>
                  重新加载
                </Button>
              </div>
            ) : (
              <TaskList
                tasks={allTasks}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={loadMore}
              />
            )}
          </div>
        </div>

        {/* 移动端和平板：纯列表 */}
        <div className="lg:hidden">
          {fetching && allTasks.length === 0 ? (
            <TaskListSkeleton count={PAGE_SIZE} />
          ) : error ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-red-500 mb-4">加载失败，请稍后重试</p>
              <Button onClick={() => reexecuteQuery({ requestPolicy: "network-only" })}>
                重新加载
              </Button>
            </div>
          ) : (
            <TaskList
              tasks={allTasks}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={loadMore}
            />
          )}
        </div>
      </main>
    </div>
  );
}
