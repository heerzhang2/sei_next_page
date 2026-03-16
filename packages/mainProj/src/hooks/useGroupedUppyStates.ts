// hooks/useGroupedUppyStates.ts
import { useEffect, useState } from 'react'
import { fileOperationsQueue } from '@/lib/file-operations-queue'

export type GroupedUppyState = {
    repId: string
    subrid?: string
    count: number
    originalPageUrl?: string
}

export function useGroupedUppyStates() {
    const [groups, setGroups] = useState<GroupedUppyState[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fileOperationsQueue.getGroupedUppyStates()
                setGroups(data)
            } catch (error) {
                console.error('Failed to load grouped uppy states:', error)
                setGroups([])
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    return { groups, loading }
}