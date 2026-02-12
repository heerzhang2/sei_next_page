import ProcessInstanceView from '@/components/camunda/ProcessInstanceView'

export default async function ProcessInstancePage({
    params,
}: {
    params: Promise<{ processInstanceKey: string }>
}) {
    const { processInstanceKey } = await params
    return <ProcessInstanceView processInstanceKey={processInstanceKey} />
}
