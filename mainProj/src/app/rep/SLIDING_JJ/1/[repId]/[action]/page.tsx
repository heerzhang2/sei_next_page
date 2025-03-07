"use client"

import { useParams } from 'next/navigation'
import { useState, useEffect, useRef } from "react"

export default function Page() {
    const params = useParams()
    const [action, setAction] = useState<string | null>(null)
    const [code, setCode] = useState(`function greeting() {
  return "Hello, world!";
}
console.log(greeting());`)

    useEffect(() => {
        if (params && params.action) {
            setAction(params.action as string)
        }
    }, [params])

    return (<>
              <textarea
                  className="w-full resize-none bg-transparent outline-none"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
              />
        <p  className="h-2">mouyige Action==编辑区的----滚动果</p>
      </>)
}
