"use client"

import { useState, useCallback } from "react"

export interface SandboxConfig {
  enabled: boolean
  maxMemory: number // MB
  maxExecutionTime: number // seconds
  allowedAPIs: string[]
  blockedAPIs: string[]
  resourceLimits: {
    cpu: number
    memory: number
    storage: number
  }
}

export interface ExecutionResult {
  success: boolean
  output: string
  error?: string
  executionTime: number
  memoryUsed: number
  warnings: string[]
}

const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  enabled: true,
  maxMemory: 128, // 128MB
  maxExecutionTime: 5, // 5 seconds
  allowedAPIs: ["console", "Math", "Date", "JSON", "Array", "Object", "String", "Number"],
  blockedAPIs: ["fetch", "XMLHttpRequest", "WebSocket", "eval", "Function", "import", "require"],
  resourceLimits: {
    cpu: 50, // 50% CPU
    memory: 128, // 128MB
    storage: 10, // 10MB
  },
}

export function useSandbox() {
  const [config, setConfig] = useState<SandboxConfig>(DEFAULT_SANDBOX_CONFIG)
  const [isExecuting, setIsExecuting] = useState(false)

  // Execute code in sandbox
  const executeCode = useCallback(
    async (code: string, language: string): Promise<ExecutionResult> => {
      if (!config.enabled) {
        return {
          success: false,
          output: "",
          error: "Sandbox is disabled",
          executionTime: 0,
          memoryUsed: 0,
          warnings: [],
        }
      }

      setIsExecuting(true)
      const startTime = performance.now()
      const warnings: string[] = []

      try {
        // Validate code for security threats
        const securityCheck = validateCodeSecurity(code)
        if (!securityCheck.safe) {
          return {
            success: false,
            output: "",
            error: `Security violation: ${securityCheck.reason}`,
            executionTime: 0,
            memoryUsed: 0,
            warnings: securityCheck.warnings,
          }
        }

        // Create isolated execution context
        const result = await executeInSandbox(code, language, config)
        const executionTime = performance.now() - startTime

        return {
          ...result,
          executionTime,
          warnings: [...warnings, ...result.warnings],
        }
      } catch (error) {
        return {
          success: false,
          output: "",
          error: error instanceof Error ? error.message : "Unknown execution error",
          executionTime: performance.now() - startTime,
          memoryUsed: 0,
          warnings,
        }
      } finally {
        setIsExecuting(false)
      }
    },
    [config],
  )

  // Validate code for security threats
  const validateCodeSecurity = useCallback(
    (code: string) => {
      const warnings: string[] = []
      let safe = true
      let reason = ""

      // Check for blocked APIs
      config.blockedAPIs.forEach((api) => {
        if (code.includes(api)) {
          safe = false
          reason = `Blocked API usage: ${api}`
          warnings.push(`Detected usage of blocked API: ${api}`)
        }
      })

      // Check for suspicious patterns
      const suspiciousPatterns = [
        /eval\s*\(/,
        /Function\s*\(/,
        /document\.write/,
        /innerHTML\s*=/,
        /outerHTML\s*=/,
        /location\s*=/,
        /window\s*\./,
        /global\s*\./,
        /process\s*\./,
        /__proto__/,
        /constructor\s*\./,
      ]

      suspiciousPatterns.forEach((pattern, index) => {
        if (pattern.test(code)) {
          warnings.push(`Suspicious pattern detected: ${pattern.source}`)
          if (index < 5) {
            // First 5 patterns are critical
            safe = false
            reason = `Dangerous code pattern: ${pattern.source}`
          }
        }
      })

      // Check for external URLs
      const urlPattern = /https?:\/\/(?!localhost|127\.0\.0\.1)/g
      const urls = code.match(urlPattern)
      if (urls) {
        warnings.push(`External URLs detected: ${urls.join(", ")}`)
        safe = false
        reason = "External network access not allowed"
      }

      return { safe, reason, warnings }
    },
    [config.blockedAPIs],
  )

  // Execute code in isolated sandbox
  const executeInSandbox = useCallback(
    async (code: string, language: string, sandboxConfig: SandboxConfig): Promise<ExecutionResult> => {
      return new Promise((resolve) => {
        const startMemory = (performance as any).memory?.usedJSHeapSize || 0
        let output = ""
        let error = ""
        const warnings: string[] = []

        // Create execution timeout
        const timeout = setTimeout(() => {
          resolve({
            success: false,
            output,
            error: `Execution timeout (${sandboxConfig.maxExecutionTime}s)`,
            executionTime: sandboxConfig.maxExecutionTime * 1000,
            memoryUsed: 0,
            warnings: [...warnings, "Execution timed out"],
          })
        }, sandboxConfig.maxExecutionTime * 1000)

        try {
          // Create isolated context
          const sandbox = {
            console: {
              log: (...args: any[]) => {
                output += args.join(" ") + "\n"
              },
              error: (...args: any[]) => {
                error += args.join(" ") + "\n"
              },
              warn: (...args: any[]) => {
                warnings.push(args.join(" "))
              },
            },
            Math,
            Date,
            JSON,
            Array,
            Object,
            String,
            Number,
            Boolean,
            RegExp,
            setTimeout: (fn: Function, delay: number) => {
              if (delay > 1000) {
                warnings.push("Long timeout detected")
              }
              return setTimeout(fn, Math.min(delay, 1000))
            },
            setInterval: () => {
              warnings.push("setInterval blocked in sandbox")
              return 0
            },
          }

          // Execute JavaScript code
          if (language === "javascript" || language === "typescript") {
            const func = new Function(...Object.keys(sandbox), code)
            func(...Object.values(sandbox))
          } else {
            // For other languages, simulate execution
            output = `Simulated execution of ${language} code:\n${code.substring(0, 100)}...`
          }

          clearTimeout(timeout)

          const endMemory = (performance as any).memory?.usedJSHeapSize || 0
          const memoryUsed = Math.max(0, endMemory - startMemory)

          // Check memory usage
          if (memoryUsed > sandboxConfig.maxMemory * 1024 * 1024) {
            warnings.push(`High memory usage: ${Math.round(memoryUsed / 1024 / 1024)}MB`)
          }

          resolve({
            success: !error,
            output: output || "Code executed successfully",
            error: error || undefined,
            executionTime: 0, // Will be calculated by caller
            memoryUsed,
            warnings,
          })
        } catch (err) {
          clearTimeout(timeout)
          resolve({
            success: false,
            output,
            error: err instanceof Error ? err.message : "Execution error",
            executionTime: 0,
            memoryUsed: 0,
            warnings,
          })
        }
      })
    },
    [],
  )

  // Update sandbox configuration
  const updateConfig = useCallback((newConfig: Partial<SandboxConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }))
  }, [])

  return {
    config,
    isExecuting,
    executeCode,
    validateCodeSecurity,
    updateConfig,
  }
}
