import ProcessInstanceView from '@/components/camunda/ProcessInstanceView'

export default function ProcessInstancePage({
    params,
}: {
    params: { processInstanceKey: string }
}) {
    return <ProcessInstanceView processInstanceKey={params.processInstanceKey} />
}
