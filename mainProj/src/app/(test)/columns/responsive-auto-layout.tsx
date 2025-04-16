"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export default function ResponsiveAutoLayout() {
  const formItems = [
    { id: "name", label: "姓名1", type: "input", size: "smallx" },
    { id: "email", label: "邮箱2", type: "email", size: "small" },
    { id: "phone", label: "电话3", type: "input", size: "small" },
    { id: "address", label: "地址4", type: "input", size: "medium" },
    { id: "postcode", label: "邮编5", type: "input", size: "small" },
    { id: "description", label: "详细描述6", type: "textarea", size: "large" },
    { id: "notifications", label: "接收通知7", type: "switch", size: "small" },
    { id: "newsletter", label: "订阅邮件8", type: "switch", size: "small" },
    { id: "remember", label: "记住信息9", type: "switch", size: "small" },
  ]

  const renderFormItem = (item) => {
    switch (item.type) {
      case "input":
      case "email":
        return (
          <div
            key={item.id}
            className={`
            space-y-2 
            ${item.size === "small" ? "w-full" : ""} 
            ${item.size === "smallx" ? "@5xl:col-span-1 @5xl:row-span-3" : ""} 
            ${item.size === "medium" ? "@5xl:col-span-2 @5xl:row-span-1" : ""}
            ${item.size === "large" ? "@5xl:col-span-3 @5xl:row-span-3" : ""}
          `}
          >
            <Label htmlFor={item.id}>{item.label}</Label>
            <Input id={item.id} type={item.type === "email" ? "email" : "text"} placeholder={`请输入${item.label}`} />
          </div>
        )
      case "textarea":
        return (
          <div key={item.id} className="space-y-2 @5xl:col-span-3 @5xl:row-span-3">
            <Label htmlFor={item.id}>{item.label}</Label>
            <Textarea id={item.id} placeholder={`请输入${item.label}`} className="min-h-[100px]" />
          </div>
        )
      case "switch":
        return (
          <div key={item.id} className="flex items-center justify-between space-x-2">
            <Label htmlFor={item.id}>{item.label}</Label>
            <Switch id={item.id} />
          </div>
        )
      default:
        return null
    }
  }
    //【毛病】grid布局对于配置要求很高，不能混淆 一点毛病。否则可能不达到预期。
    //同一个容器选择因子@xl: 假如预期分配2列的 @xl:grid-cols-2 那么内部元素绝对不能写上分配3列的 @xl:col-span-3的，否则有毛病的！
  return (
    <div className="p-6 bg-white rounded-lg shadow @container">
      <h2 className="text-xl font-bold mb-4">自动布局表单</h2>

      <form className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-4">
        {formItems.map(renderFormItem)}

        <div className="@5xl:col-span-3 flex justify-end space-x-2 mt-4">
          <Button variant="outline">取消</Button>
          <Button>提交</Button>
        </div>
      </form>
    </div>
  )
}

