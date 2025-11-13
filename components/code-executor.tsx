"use client"

import { useState } from "react"
import { useSandbox, type ExecutionResult } from "@/hooks/use-sandbox"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Square, Shield, Clock, MemoryStick, AlertTriangle } from "lucide-react"

interface CodeExecutorProps {
  code: string
  language: string
}

export function CodeExecutor({ code, language }: CodeExecutorProps) {
  const { executeCode, isExecuting, config } = useSandbox()
  const [result, setResult] = useState<ExecutionResult | null>(null)
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([])

  const handleExecute = async () => {
    if (!code.trim()) return

    try {
      const executionResult = await executeCode(code, language)
      setResult(executionResult)
      setExecutionHistory((prev) => [...prev, executionResult].slice(-5)) // Keep last 5 executions
    } catch (error) {
      setResult({
        success: false,
        output: "",
        error: error instanceof Error ? error.message : "Execution failed",
        executionTime: 0,
        memoryUsed: 0,
        warnings: [],
      })
    }
  }

  const handleStop = () => {
    // In a real implementation, this would stop the execution
    console.log("Stop execution requested")
  }

  return (
    <div className="space-y-4">
      {/* Execution Controls */}
      <Card className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Code Execution</h3>
          <div className="flex items-center gap-2">
            <Badge variant={config.enabled ? "default" : "destructive"} className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              {config.enabled ? "Sandboxed" : "Unsafe"}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleExecute} disabled={isExecuting || !code.trim()} size="sm" className="flex-1">
            <Play className="h-4 w-4 mr-2" />
            {isExecuting ? "Executing..." : "Run Code"}
          </Button>
          <Button onClick={handleStop} disabled={!isExecuting} variant="outline" size="sm">
            <Square className="h-4 w-4" />
          </Button>
        </div>

        {/* Sandbox Info */}
        <div className="mt-3 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Max Memory:</span>
            <span>{config.maxMemory}MB</span>
          </div>
          <div className="flex justify-between">
            <span>Max Time:</span>
            <span>{config.maxExecutionTime}s</span>
          </div>
        </div>
      </Card>

      {/* Execution Result */}
      {result && (
        <Card className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Execution Result</h3>
            <Badge variant={result.success ? "default" : "destructive"} className="text-xs">
              {result.success ? "Success" : "Failed"}
            </Badge>
          </div>

          {/* Execution Stats */}
          <div className="flex gap-4 mb-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{result.executionTime.toFixed(2)}ms</span>
            </div>
            <div className="flex items-center gap-1">
              <MemoryStick className="h-3 w-3" />
              <span>{Math.round(result.memoryUsed / 1024)}KB</span>
            </div>
          </div>

          {/* Output */}
          {result.output && (
            <div className="mb-3">
              <h4 className="text-xs font-medium mb-1">Output:</h4>
              <div className="bg-muted p-2 rounded text-xs font-mono whitespace-pre-wrap">{result.output}</div>
            </div>
          )}

          {/* Error */}
          {result.error && (
            <div className="mb-3">
              <h4 className="text-xs font-medium mb-1 text-destructive">Error:</h4>
              <div className="bg-destructive/10 text-destructive p-2 rounded text-xs font-mono">{result.error}</div>
            </div>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div>
              <h4 className="text-xs font-medium mb-1 text-yellow-600">Warnings:</h4>
              <div className="space-y-1">
                {result.warnings.map((warning, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs text-yellow-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Execution History */}
      {executionHistory.length > 0 && (
        <Card className="p-3">
          <h3 className="text-sm font-medium mb-2">Recent Executions</h3>
          <ScrollArea className="max-h-32">
            <div className="space-y-1">
              {executionHistory.map((exec, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <Badge variant={exec.success ? "secondary" : "destructive"} className="text-xs">
                    {exec.success ? "✓" : "✗"}
                  </Badge>
                  <span>{exec.executionTime.toFixed(2)}ms</span>
                  <span>{Math.round(exec.memoryUsed / 1024)}KB</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  )
}
