"use client"

import { useEffect, useState } from "react"
import { ZxcvbnFactory } from "@zxcvbn-ts/core"
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common"
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en"
import * as zxcvbnZhPackage from "@zxcvbn-ts/language-zh"
import { cn } from "@/lib/utils"

// 初始化 zxcvbn 实例（只执行一次）
let _zxcvbnFactory: ZxcvbnFactory | null = null

const getZxcvbnFactory = () => {
  if (!_zxcvbnFactory) {
    _zxcvbnFactory = new ZxcvbnFactory({
      translations: zxcvbnZhPackage.translations,
      dictionary: {
        ...zxcvbnCommonPackage.dictionary,
        ...zxcvbnZhPackage.dictionary,
        ...zxcvbnEnPackage.dictionary,
      },
      graphs: zxcvbnCommonPackage.adjacencyGraphs,
    })
  }
  return _zxcvbnFactory
}

// 密码强度等级配置
const strengthConfig = {
  0: { label: "非常弱", color: "bg-red-600", textColor: "text-red-600", width: "20%" },
  1: { label: "弱", color: "bg-red-500", textColor: "text-red-500", width: "40%" },
  2: { label: "一般", color: "bg-yellow-500", textColor: "text-yellow-600", width: "60%" },
  3: { label: "强", color: "bg-green-500", textColor: "text-green-600", width: "80%" },
  4: { label: "非常强", color: "bg-green-600", textColor: "text-green-700", width: "100%" },
}

export interface PasswordStrengthResult {
  score: number
  feedback: {
    warning: string
    suggestions: string[]
  }
  crackTimesDisplay: {
    onlineThrottling100PerHour: string
    onlineNoThrottling10PerSecond: string
    offlineSlowHashing1e4PerSecond: string
    offlineFastHashing1e10PerSecond: string
  }
  isStrong: boolean
}

interface PasswordStrengthProps {
  password: string
  className?: string
  showLabel?: boolean
  showProgress?: boolean
  showFeedback?: boolean
  minStrength?: number
  onStrengthChange?: (result: PasswordStrengthResult) => void
}

export function PasswordStrength({
  password,
  className,
  showLabel = true,
  showProgress = true,
  showFeedback = true,
  minStrength = 2,
  onStrengthChange,
}: PasswordStrengthProps) {
  const [result, setResult] = useState<PasswordStrengthResult>({
    score: 0,
    feedback: { warning: "", suggestions: [] },
    crackTimesDisplay: {
      onlineThrottling100PerHour: "",
      onlineNoThrottling10PerSecond: "",
      offlineSlowHashing1e4PerSecond: "",
      offlineFastHashing1e10PerSecond: "",
    },
    isStrong: false,
  })

  useEffect(() => {
    if (!password) {
      const emptyResult = {
        score: 0,
        feedback: { warning: "", suggestions: [] },
        crackTimesDisplay: {
          onlineThrottling100PerHour: "",
          onlineNoThrottling10PerSecond: "",
          offlineSlowHashing1e4PerSecond: "",
          offlineFastHashing1e10PerSecond: "",
        },
        isStrong: false,
      }
      setResult(emptyResult)
      onStrengthChange?.(emptyResult)
      return
    }

    const zxcvbnResult = getZxcvbnFactory().check(password)
    const strengthResult: PasswordStrengthResult = {
      score: zxcvbnResult.score,
      feedback: {
        warning: zxcvbnResult.feedback.warning || "",
        suggestions: zxcvbnResult.feedback.suggestions || [],
      },
      crackTimesDisplay: {
        onlineThrottling100PerHour: zxcvbnResult.crackTimes.onlineThrottlingXPerHour.display,
        onlineNoThrottling10PerSecond: zxcvbnResult.crackTimes.onlineNoThrottlingXPerSecond.display,
        offlineSlowHashing1e4PerSecond: zxcvbnResult.crackTimes.offlineSlowHashingXPerSecond.display,
        offlineFastHashing1e10PerSecond: zxcvbnResult.crackTimes.offlineFastHashingXPerSecond.display,
      },
      isStrong: zxcvbnResult.score >= minStrength,
    }

    setResult(strengthResult)
    onStrengthChange?.(strengthResult)
  }, [password, minStrength, onStrengthChange])

  const config = strengthConfig[result.score as keyof typeof strengthConfig]

  if (!password) {
    return null
  }

  return (
    <div className={cn("space-y-2", className)}>
      {showProgress && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            {showLabel && (
              <span className={cn("text-sm font-medium", config.textColor)}>
                密码强度：{config.label}
              </span>
            )}
            <span className="text-xs text-gray-500">
              {result.crackTimesDisplay.offlineFastHashing1e10PerSecond}可被破解
            </span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-300", config.color)}
              style={{ width: config.width }}
            />
          </div>
        </div>
      )}

      {showFeedback && (result.feedback.warning || result.feedback.suggestions.length > 0) && (
        <div className="text-sm space-y-1">
          {result.feedback.warning && (
            <p className="text-amber-600">{result.feedback.warning}</p>
          )}
          {result.feedback.suggestions.length > 0 && (
            <ul className="text-gray-600 list-disc list-inside">
              {result.feedback.suggestions.map((suggestion, index) => (
                <li key={`suggestion-${index}`}>{suggestion}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!result.isStrong && result.score > 0 && (
        <p className="text-xs text-amber-600">
          建议密码强度至少达到"{strengthConfig[minStrength as keyof typeof strengthConfig]?.label || "一般"}"
        </p>
      )}
    </div>
  )
}

// 导出验证函数，用于表单验证
export function validatePasswordStrength(
  password: string,
  minStrength: number = 2
): { valid: boolean; message?: string } {
  if (!password || password.length < 6) {
    return { valid: false, message: "密码至少需要6个字符" }
  }

  const result = getZxcvbnFactory().check(password)

  if (result.score < minStrength) {
    const config = strengthConfig[result.score as keyof typeof strengthConfig]
    const minConfig = strengthConfig[minStrength as keyof typeof strengthConfig]
    return {
      valid: false,
      message: `密码强度${config.label}，建议至少达到${minConfig.label}`,
    }
  }

  return { valid: true }
}

export default PasswordStrength
