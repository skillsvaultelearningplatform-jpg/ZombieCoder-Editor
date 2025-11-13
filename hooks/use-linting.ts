"use client"

import { useState, useCallback } from "react"

export interface LintIssue {
  id: string
  line: number
  column: number
  severity: "error" | "warning" | "info"
  message: string
  rule: string
  fixable: boolean
  suggestedFix?: string
}

export function useLinting() {
  const [issues, setIssues] = useState<LintIssue[]>([])
  const [isLinting, setIsLinting] = useState(false)

  // Lint code (offline simulation)
  const lintCode = useCallback((code: string, language: string) => {
    setIsLinting(true)
    const foundIssues: LintIssue[] = []

    const lines = code.split("\n")

    lines.forEach((line, index) => {
      const lineNumber = index + 1

      // Check for common issues
      if (line.includes("var ")) {
        foundIssues.push({
          id: `lint_${Date.now()}_${index}_1`,
          line: lineNumber,
          column: line.indexOf("var ") + 1,
          severity: "warning",
          message: "Use 'const' or 'let' instead of 'var'",
          rule: "no-var",
          fixable: true,
          suggestedFix: line.replace("var ", "const "),
        })
      }

      if (line.includes("==") && !line.includes("===")) {
        foundIssues.push({
          id: `lint_${Date.now()}_${index}_2`,
          line: lineNumber,
          column: line.indexOf("==") + 1,
          severity: "warning",
          message: "Use '===' instead of '=='",
          rule: "eqeqeq",
          fixable: true,
          suggestedFix: line.replace("==", "==="),
        })
      }

      if (line.trim().endsWith(";") === false && line.includes("=") && !line.includes("{") && !line.includes("}")) {
        foundIssues.push({
          id: `lint_${Date.now()}_${index}_3`,
          line: lineNumber,
          column: line.length,
          severity: "error",
          message: "Missing semicolon",
          rule: "semi",
          fixable: true,
          suggestedFix: line + ";",
        })
      }

      if (line.includes("console.log")) {
        foundIssues.push({
          id: `lint_${Date.now()}_${index}_4`,
          line: lineNumber,
          column: line.indexOf("console.log") + 1,
          severity: "info",
          message: "Remove console.log before production",
          rule: "no-console",
          fixable: true,
          suggestedFix: "",
        })
      }

      // Check for unused variables (simple pattern)
      const varMatch = line.match(/(?:const|let|var)\s+(\w+)/)
      if (varMatch && !code.includes(varMatch[1] + ".") && !code.includes(varMatch[1] + "(")) {
        const varName = varMatch[1]
        const usageCount = (code.match(new RegExp(`\\b${varName}\\b`, "g")) || []).length
        if (usageCount === 1) {
          foundIssues.push({
            id: `lint_${Date.now()}_${index}_5`,
            line: lineNumber,
            column: line.indexOf(varName) + 1,
            severity: "warning",
            message: `'${varName}' is defined but never used`,
            rule: "no-unused-vars",
            fixable: false,
          })
        }
      }
    })

    setIssues(foundIssues)
    setIsLinting(false)
    return foundIssues
  }, [])

  // Suggest fixes
  const suggestFixes = useCallback(() => {
    return issues.filter((issue) => issue.fixable).map((issue) => issue.suggestedFix || "")
  }, [issues])

  // Check syntax (basic validation)
  const checkSyntax = useCallback((code: string, language: string) => {
    try {
      if (language === "javascript" || language === "typescript") {
        // Basic bracket matching
        const openBrackets = (code.match(/[{[(]/g) || []).length
        const closeBrackets = (code.match(/[}\])]/g) || []).length

        if (openBrackets !== closeBrackets) {
          return {
            valid: false,
            error: "Mismatched brackets",
            line: -1,
          }
        }
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: "Syntax error detected",
        line: -1,
      }
    }
  }, [])

  // Format code (basic formatting)
  const formatCode = useCallback((code: string, language: string) => {
    if (language === "javascript" || language === "typescript") {
      return code
        .split("\n")
        .map((line) => {
          const formatted = line.trim()
          // Add basic indentation
          const depth = (line.match(/[{]/g) || []).length - (line.match(/[}]/g) || []).length
          return "  ".repeat(Math.max(0, depth)) + formatted
        })
        .join("\n")
    }
    return code
  }, [])

  return {
    issues,
    isLinting,
    lintCode,
    suggestFixes,
    checkSyntax,
    formatCode,
  }
}
