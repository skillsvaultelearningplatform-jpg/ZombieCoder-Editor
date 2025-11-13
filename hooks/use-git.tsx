"use client"

import { useState, useCallback } from "react"

export interface GitStatus {
  branch: string
  staged: string[]
  modified: string[]
  untracked: string[]
  ahead: number
  behind: number
  isRepo: boolean
}

export interface GitCommit {
  hash: string
  message: string
  author: string
  date: Date
}

export function useGit() {
  const [gitStatus, setGitStatus] = useState<GitStatus>({
    branch: "main",
    staged: [],
    modified: ["app/page.tsx", "components/monaco-editor.tsx"],
    untracked: ["new-feature.tsx"],
    ahead: 2,
    behind: 0,
    isRepo: true,
  })

  const [commits, setCommits] = useState<GitCommit[]>([
    {
      hash: "a1b2c3d",
      message: "Added AI Command Box integration",
      author: "ZombieCoder",
      date: new Date(),
    },
    {
      hash: "e4f5g6h",
      message: "Implemented voice input system",
      author: "ZombieCoder",
      date: new Date(Date.now() - 3600000),
    },
  ])

  const executeGitCommand = useCallback(
    (command: string): string => {
      const parts = command.split(" ")
      const gitCmd = parts[1]

      switch (gitCmd) {
        case "status":
          return `On branch ${gitStatus.branch}
Your branch is ahead of 'origin/${gitStatus.branch}' by ${gitStatus.ahead} commits.

Changes to be committed:
${gitStatus.staged.map((file) => `  modified:   ${file}`).join("\n")}

Changes not staged for commit:
${gitStatus.modified.map((file) => `  modified:   ${file}`).join("\n")}

Untracked files:
${gitStatus.untracked.map((file) => `  ${file}`).join("\n")}`

        case "add":
          if (parts[2] === ".") {
            setGitStatus((prev) => ({
              ...prev,
              staged: [...prev.staged, ...prev.modified, ...prev.untracked],
              modified: [],
              untracked: [],
            }))
            return "All changes staged for commit"
          } else if (parts[2]) {
            const file = parts[2]
            setGitStatus((prev) => ({
              ...prev,
              staged: [...prev.staged, file],
              modified: prev.modified.filter((f) => f !== file),
              untracked: prev.untracked.filter((f) => f !== file),
            }))
            return `Staged ${file} for commit`
          }
          return "Nothing specified, nothing added."

        case "commit":
          if (parts.includes("-m")) {
            const messageIndex = parts.indexOf("-m") + 1
            const message = parts.slice(messageIndex).join(" ").replace(/"/g, "")
            const newCommit: GitCommit = {
              hash: Math.random().toString(36).substring(2, 9),
              message,
              author: "ZombieCoder",
              date: new Date(),
            }
            setCommits((prev) => [newCommit, ...prev])
            setGitStatus((prev) => ({ ...prev, staged: [] }))
            return `[${gitStatus.branch} ${newCommit.hash}] ${message}`
          }
          return "Please provide a commit message with -m"

        case "log":
          return commits
            .slice(0, 5)
            .map(
              (commit) =>
                `commit ${commit.hash}\nAuthor: ${commit.author}\nDate: ${commit.date.toLocaleString()}\n\n    ${commit.message}\n`,
            )
            .join("\n")

        case "branch":
          return `* ${gitStatus.branch}`

        case "diff":
          return `diff --git a/app/page.tsx b/app/page.tsx
index 1234567..abcdefg 100644
--- a/app/page.tsx
+++ b/app/page.tsx
@@ -10,6 +10,7 @@ export default function Home() {
   return (
     <div className="h-screen flex">
+      {/* Added AI Command Box */}
       <Sidebar />
       <MainEditor />
     </div>`

        case "push":
          setGitStatus((prev) => ({ ...prev, ahead: 0 }))
          return `Pushing to origin/${gitStatus.branch}...
Everything up-to-date`

        case "pull":
          return `Already up to date.`

        case "init":
          setGitStatus((prev) => ({ ...prev, isRepo: true }))
          return "Initialized empty Git repository in /workspace/zombiecoder-editor/.git/"

        default:
          return `git: '${gitCmd}' is not a git command. See 'git --help'.`
      }
    },
    [gitStatus, commits],
  )

  return {
    gitStatus,
    commits,
    executeGitCommand,
  }
}
