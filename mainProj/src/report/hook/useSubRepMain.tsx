"use client"
import React,{ useCallback, useState } from "react"
import dynamic from "next/dynamic"
import { useStorage } from "@/report/StorageContext"

/**
 * 用于动态加载子报告组件的自定义 Hook
 *
 * @param relativePath 组件的相对路径，不包含文件扩展名
 * @returns 包含动态加载组件和加载状态的对象
 */
export function useSubRepMainNoProps(relativePath: string) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const { storage } = useStorage()

    // 创建一个带有显示名称的组件函数
    const DynamicComponent = useCallback(() => {
        // 使用 Next.js 的 dynamic 函数动态导入组件
        const Component = dynamic(
            () => {
                setLoading(true)
                // 构建完整的导入路径
                const importPath = `@/report/${relativePath}`

                // 动态导入组件
                return import(importPath)
                    .then((module) => {
                        setLoading(false)
                        // 返回默认导出的组件
                        return module.default || module
                    })
                    .catch((err) => {
                        console.error(`Failed to load component from ${importPath}:`, err)
                        setError(err)
                        setLoading(false)
                        // 返回一个错误占位组件
                        //@ts-ignore
                        return () => (
                            <div className="p-4 border border-red-500 rounded bg-red-50 text-red-700">
                                <h3 className="font-bold">加载组件失败</h3>
                                <p>路径: {relativePath}</p>
                                <p>错误: {err.message}</p>
                            </div> as any
                        )
                    })
            },
            {
                loading: () => (
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2">加载组件中...</span>
                    </div>
                ),
                ssr: false, // 禁用服务器端渲染，因为路径是动态的
            },
        )

        // 设置显示名称
        const WrappedComponent = (props: any) => <Component storage={storage} {...props} />
        WrappedComponent.displayName = `DynamicComponent(${relativePath})`
        return WrappedComponent
    }, [relativePath, storage])

    return {
        Component: DynamicComponent,
        loading,
        error,
    }
}

/**
 * 用于动态加载子报告组件的自定义 Hook（带参数版本）
 *
 * @param relativePath 组件的相对路径，不包含文件扩展名
 * @param props 要传递给组件的属性
 * @returns 包含动态加载组件和加载状态的对象
 */
export function useSubRepMain<T>(relativePath: string, props: T) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const { storage } = useStorage()

    // 创建一个带有显示名称的组件函数
    const DynamicComponent = useCallback(() => {
        // 使用 Next.js 的 dynamic 函数动态导入组件
        const Component = dynamic(
            () => {
                setLoading(true)
                // 构建完整的导入路径
                const importPath = `@/report/${relativePath}`

                // 动态导入组件
                return import(importPath)
                    .then((module) => {
                        setLoading(false)
                        // 返回默认导出的组件
                        return module.default || module
                    })
                    .catch((err) => {
                        console.error(`Failed to load component from ${importPath}:`, err)
                        setError(err)
                        setLoading(false)
                        // 返回一个错误占位组件
                        //@ts-ignore
                        return () => (
                            <div className="p-4 border border-red-500 rounded bg-red-50 text-red-700">
                                <h3 className="font-bold">加载组件失败</h3>
                                <p>路径: {relativePath}</p>
                                <p>错误: {err.message}</p>
                            </div>  as any
                        )
                    })
            },
            {
                loading: () => (
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2">加载组件中...</span>
                    </div>
                ),
                ssr: false, // 禁用服务器端渲染，因为路径是动态的
            },
        )

        // 合并 storage 和传入的 props
        const combinedProps = { ...props, storage }

        // 设置显示名称
        const WrappedComponent = (props2: any) => <Component {...combinedProps} {...props2} />
        WrappedComponent.displayName = `DynamicComponentWithProps(${relativePath})`
        return WrappedComponent
    }, [relativePath, props, storage])

    return {
        Component: DynamicComponent,
        loading,
        error,
    }
}

/*
const { Component: SubReportWithProps } = useSubRepMainWithProps('path/to/component', {
  id: 123,
  title: '子报告标题'
});
* */