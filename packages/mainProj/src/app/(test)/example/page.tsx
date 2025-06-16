"use client"
import DirectoryEditor from "@/components/directory-editor"

export default function Home() {
  return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">目录列表编辑器</h1>
          <DirectoryEditor
              onSave={(projects) => {
                console.log("保存的项目列表:", projects)
                // 这里可以调用API保存数据
              }}
          />
        </div>
      </main>
  )
}
