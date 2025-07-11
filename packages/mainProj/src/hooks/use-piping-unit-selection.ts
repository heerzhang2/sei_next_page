"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import type { IPipingUnitEntity } from "@/types/piping-unit"

interface UsePipingUnitSelectionProps {
    initialSelection?: IPipingUnitEntity[]
    storageKey?: string
}

export function usePipingUnitSelection({
                                           initialSelection = [],
                                           storageKey = "piping-unit-selection",
                                       }: UsePipingUnitSelectionProps = {}) {
    const [selectedUnits, setSelectedUnits] = useState<IPipingUnitEntity[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const initialized = useRef(false)

    // 问题1：改用 localStorage 而不是 sessionStorage
    useEffect(() => {
        if (typeof window !== "undefined" && !initialized.current) {
            const stored = localStorage.getItem(storageKey)
            if (stored) {
                try {
                    const parsed = JSON.parse(stored)
                    setSelectedUnits(parsed)
                } catch (error) {
                    console.error("Failed to parse stored selection:", error)
                    setSelectedUnits(initialSelection)
                }
            } else {
                setSelectedUnits(initialSelection)
            }
            initialized.current = true
        }
    }, [])

    // 保存到 localStorage
    const saveToStorage = useCallback(
        (units: IPipingUnitEntity[]) => {
            if (typeof window !== "undefined") {
                localStorage.setItem(storageKey, JSON.stringify(units))
            }
        },
        [storageKey],
    )

    // 添加单元
    const addUnit = useCallback(
        (unit: IPipingUnitEntity) => {
            setSelectedUnits((prev) => {
                const exists = prev.some((u) => u.id === unit.id)
                if (exists) return prev

                const newUnits = [...prev, unit]
                saveToStorage(newUnits)
                return newUnits
            })
        },
        [saveToStorage],
    )

    // 移除单元
    const removeUnit = useCallback(
        (unitId: string) => {
            setSelectedUnits((prev) => {
                const newUnits = prev.filter((u) => u.id !== unitId)
                saveToStorage(newUnits)
                return newUnits
            })
        },
        [saveToStorage],
    )

    // 批量设置
    const setUnits = useCallback(
        (units: IPipingUnitEntity[]) => {
            setSelectedUnits(units)
            saveToStorage(units)
        },
        [saveToStorage],
    )

    // 清空选择
    const clearSelection = useCallback(() => {
        setSelectedUnits([])
        saveToStorage([])
    }, [saveToStorage])

    // 检查是否已选择
    const isSelected = useCallback(
        (unitId: string) => {
            return selectedUnits.some((u) => u.id === unitId)
        },
        [selectedUnits],
    )

    // 切换选择状态
    const toggleUnit = useCallback(
        (unit: IPipingUnitEntity) => {
            setSelectedUnits((prev) => {
                const isCurrentlySelected = prev.some((u) => u.id === unit.id)
                let newUnits: IPipingUnitEntity[]

                if (isCurrentlySelected) {
                    newUnits = prev.filter((u) => u.id !== unit.id)
                } else {
                    newUnits = [...prev, unit]
                }

                saveToStorage(newUnits)
                return newUnits
            })
        },
        [saveToStorage],
    )

    return {
        selectedUnits,
        setUnits,
        addUnit,
        removeUnit,
        clearSelection,
        isSelected,
        toggleUnit,
        isLoading,
        setIsLoading,
        count: selectedUnits.length,
    }
}
