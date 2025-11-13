"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { GitBranch, GitCommit, Plus, Minus, FileText, Clock, User } from "lucide-react"
import { useGit } from "@/hooks/use-git"

export function GitPanel() {
  const { gitStatus, commits, executeGitCommand } = useGit()
  const [commitMessage, setCommitMessage] = useState("")

  const handleStageFile = (file: string) => {
    executeGitCommand(`git add ${file}`)
  }

  const handleCommit = () => {
    if (commitMessage.trim()) {
      executeGitCommand(`git commit -m "${commitMessage}"`)
      setCommitMessage("")
    }
  }

  const handlePush = () => {
    executeGitCommand("git push")
  }

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full">
      {/* Git Panel Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <GitBranch className="h-4 w-4" />
          <span className="font-medium">Git Control</span>
        </div>

        {/* Branch Info */}
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            <GitBranch className="h-3 w-3 mr-1" />
            {gitStatus.branch}
          </Badge>
          {gitStatus.ahead > 0 && (
            <Badge variant="secondary" className="text-xs">
              ↑{gitStatus.ahead}
            </Badge>
          )}
          {gitStatus.behind > 0 && (
            <Badge variant="secondary" className="text-xs">
              ↓{gitStatus.behind}
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handlePush}>
            Push
          </Button>
          <Button size="sm" variant="outline" onClick={() => executeGitCommand("git pull")}>
            Pull
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Staged Changes */}
          {gitStatus.staged.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Plus className="h-3 w-3 text-green-500" />
                Staged Changes ({gitStatus.staged.length})
              </h3>
              <div className="space-y-1">
                {gitStatus.staged.map((file) => (
                  <div key={file} className="flex items-center gap-2 text-sm p-2 rounded bg-green-500/10">
                    <FileText className="h-3 w-3 text-green-500" />
                    <span className="flex-1 truncate">{file}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modified Files */}
          {gitStatus.modified.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Minus className="h-3 w-3 text-orange-500" />
                Modified ({gitStatus.modified.length})
              </h3>
              <div className="space-y-1">
                {gitStatus.modified.map((file) => (
                  <div key={file} className="flex items-center gap-2 text-sm p-2 rounded bg-orange-500/10">
                    <FileText className="h-3 w-3 text-orange-500" />
                    <span className="flex-1 truncate">{file}</span>
                    <Button size="sm" variant="ghost" onClick={() => handleStageFile(file)} className="h-6 px-2">
                      +
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Untracked Files */}
          {gitStatus.untracked.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="h-3 w-3 text-blue-500" />
                Untracked ({gitStatus.untracked.length})
              </h3>
              <div className="space-y-1">
                {gitStatus.untracked.map((file) => (
                  <div key={file} className="flex items-center gap-2 text-sm p-2 rounded bg-blue-500/10">
                    <FileText className="h-3 w-3 text-blue-500" />
                    <span className="flex-1 truncate">{file}</span>
                    <Button size="sm" variant="ghost" onClick={() => handleStageFile(file)} className="h-6 px-2">
                      +
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commit Section */}
          {gitStatus.staged.length > 0 && (
            <div>
              <Separator className="my-4" />
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <GitCommit className="h-3 w-3" />
                Commit Changes
              </h3>
              <div className="space-y-2">
                <Input
                  placeholder="Commit message..."
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCommit()}
                />
                <Button onClick={handleCommit} disabled={!commitMessage.trim()} className="w-full" size="sm">
                  Commit
                </Button>
              </div>
            </div>
          )}

          {/* Recent Commits */}
          <div>
            <Separator className="my-4" />
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Recent Commits
            </h3>
            <div className="space-y-2">
              {commits.slice(0, 5).map((commit) => (
                <div key={commit.hash} className="p-2 rounded bg-muted/50 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="bg-muted px-1 rounded">{commit.hash}</code>
                    <span className="text-muted-foreground">{commit.date.toLocaleDateString()}</span>
                  </div>
                  <p className="text-foreground">{commit.message}</p>
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{commit.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
