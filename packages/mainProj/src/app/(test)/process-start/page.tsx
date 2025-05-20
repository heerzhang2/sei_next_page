import ProcessStarter from "@/components/process-starter"

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="max-w-5xl w-full">
                <h1 className="text-4xl font-bold mb-8 text-center">Camunda 8 流程启动器</h1>

                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <ProcessStarter />
                </div>
            </div>
        </main>
    )
}
