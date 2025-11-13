"use client"

import { useState, useCallback, useEffect } from "react"

export interface FileItem {
  id: string
  name: string
  path: string
  content: string
  type: "file" | "folder"
  language?: string
  lastModified: number
  size?: number
  encoding?: string
  children?: FileItem[]
}

export interface ProjectSnapshot {
  id: string
  name: string
  timestamp: number
  files: FileItem[]
  description?: string
  tags?: string[]
}

export interface FileHistory {
  id: string
  fileId: string
  content: string
  timestamp: number
  description?: string
}

export interface FileSearchResult {
  file: FileItem
  matches: Array<{
    line: number
    content: string
    startIndex: number
    endIndex: number
  }>
}

export interface FileSystemStats {
  totalFiles: number
  totalSize: number
  lastBackup: number
  storageUsed: number
  storageQuota: number
}

const DB_NAME = "ZombieCoderDB"
const DB_VERSION = 2 // Incremented version for new object stores
const FILES_STORE = "files"
const SNAPSHOTS_STORE = "snapshots"
const PREFERENCES_STORE = "preferences"
const HISTORY_STORE = "history" // Added history store
const CACHE_STORE = "cache" // Added cache store

export function useFileSystem() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [currentFile, setCurrentFile] = useState<FileItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fileHistory, setFileHistory] = useState<FileHistory[]>([])
  const [stats, setStats] = useState<FileSystemStats | null>(null)

  const initDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create or upgrade existing stores
        if (!db.objectStoreNames.contains(FILES_STORE)) {
          const filesStore = db.createObjectStore(FILES_STORE, { keyPath: "id" })
          filesStore.createIndex("path", "path", { unique: false })
          filesStore.createIndex("lastModified", "lastModified", { unique: false })
          filesStore.createIndex("language", "language", { unique: false })
        }

        if (!db.objectStoreNames.contains(SNAPSHOTS_STORE)) {
          const snapshotsStore = db.createObjectStore(SNAPSHOTS_STORE, { keyPath: "id" })
          snapshotsStore.createIndex("timestamp", "timestamp", { unique: false })
        }

        if (!db.objectStoreNames.contains(PREFERENCES_STORE)) {
          db.createObjectStore(PREFERENCES_STORE, { keyPath: "key" })
        }

        // New stores for enhanced functionality
        if (!db.objectStoreNames.contains(HISTORY_STORE)) {
          const historyStore = db.createObjectStore(HISTORY_STORE, { keyPath: "id" })
          historyStore.createIndex("fileId", "fileId", { unique: false })
          historyStore.createIndex("timestamp", "timestamp", { unique: false })
        }

        if (!db.objectStoreNames.contains(CACHE_STORE)) {
          db.createObjectStore(CACHE_STORE, { keyPath: "key" })
        }
      }
    })
  }, [])

  const loadFiles = useCallback(async () => {
    try {
      setIsLoading(true)
      const db = await initDB()

      // Load files with transaction
      const transaction = db.transaction([FILES_STORE, HISTORY_STORE], "readonly")
      const filesStore = transaction.objectStore(FILES_STORE)
      const historyStore = transaction.objectStore(HISTORY_STORE)

      const [filesResult, historyResult] = await Promise.all([
        new Promise<FileItem[]>((resolve, reject) => {
          const request = filesStore.getAll()
          request.onsuccess = () => resolve(request.result || [])
          request.onerror = () => reject(request.error)
        }),
        new Promise<FileHistory[]>((resolve, reject) => {
          const request = historyStore.getAll()
          request.onsuccess = () => resolve(request.result || [])
          request.onerror = () => reject(request.error)
        }),
      ])

      // Calculate file sizes and update stats
      const filesWithSize = filesResult.map((file) => ({
        ...file,
        size: new Blob([file.content]).size,
        encoding: "utf-8",
      }))

      setFiles(filesWithSize)
      setFileHistory(historyResult)

      // Update storage stats
      await updateStorageStats(filesWithSize)
    } catch (error) {
      console.error("Failed to load files:", error)
      // Fallback to localStorage if IndexedDB fails
      const fallbackFiles = localStorage.getItem("zombiecoder_files")
      if (fallbackFiles) {
        setFiles(JSON.parse(fallbackFiles))
      }
    } finally {
      setIsLoading(false)
    }
  }, [initDB])

  const saveFile = useCallback(
    async (file: FileItem, createHistory = true) => {
      try {
        const db = await initDB()
        const transaction = db.transaction([FILES_STORE, HISTORY_STORE], "readwrite")
        const filesStore = transaction.objectStore(FILES_STORE)
        const historyStore = transaction.objectStore(HISTORY_STORE)

        const updatedFile = {
          ...file,
          lastModified: Date.now(),
          size: new Blob([file.content]).size,
          encoding: "utf-8",
        }

        // Save file
        await new Promise<void>((resolve, reject) => {
          const request = filesStore.put(updatedFile)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })

        // Create history entry if content changed
        if (createHistory) {
          const existingFile = files.find((f) => f.id === file.id)
          if (!existingFile || existingFile.content !== file.content) {
            const historyEntry: FileHistory = {
              id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              fileId: file.id,
              content: file.content,
              timestamp: Date.now(),
              description: `Auto-save at ${new Date().toLocaleTimeString()}`,
            }

            await new Promise<void>((resolve, reject) => {
              const request = historyStore.put(historyEntry)
              request.onsuccess = () => resolve()
              request.onerror = () => reject(request.error)
            })

            setFileHistory((prev) => [...prev, historyEntry].slice(-100)) // Keep last 100 entries
          }
        }

        setFiles((prev) => {
          const index = prev.findIndex((f) => f.id === file.id)
          if (index >= 0) {
            const newFiles = [...prev]
            newFiles[index] = updatedFile
            return newFiles
          }
          return [...prev, updatedFile]
        })

        // Update localStorage backup
        localStorage.setItem("zombiecoder_files", JSON.stringify(files))

        return updatedFile
      } catch (error) {
        console.error("Failed to save file:", error)
        throw error
      }
    },
    [initDB, files],
  )

  const createFile = useCallback(
    async (name: string, path: string, content = "") => {
      const extension = name.split(".").pop()?.toLowerCase()
      const languageMap: Record<string, string> = {
        js: "javascript",
        ts: "typescript",
        jsx: "javascript",
        tsx: "typescript",
        py: "python",
        html: "html",
        css: "css",
        scss: "scss",
        sass: "sass",
        json: "json",
        md: "markdown",
        php: "php",
        java: "java",
        cpp: "cpp",
        c: "c",
        go: "go",
        rs: "rust",
        rb: "ruby",
        vue: "vue",
        svelte: "svelte",
      }

      const newFile: FileItem = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        path,
        content,
        type: "file",
        language: languageMap[extension || ""] || "plaintext",
        lastModified: Date.now(),
        size: new Blob([content]).size,
        encoding: "utf-8",
      }

      return await saveFile(newFile, false) // Don't create history for new files
    },
    [saveFile],
  )

  const deleteFile = useCallback(
    async (fileId: string) => {
      try {
        const db = await initDB()
        const transaction = db.transaction([FILES_STORE, HISTORY_STORE], "readwrite")
        const filesStore = transaction.objectStore(FILES_STORE)
        const historyStore = transaction.objectStore(HISTORY_STORE)

        // Delete file
        await new Promise<void>((resolve, reject) => {
          const request = filesStore.delete(fileId)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })

        // Delete associated history
        const historyIndex = historyStore.index("fileId")
        const historyRequest = historyIndex.getAll(fileId)
        historyRequest.onsuccess = () => {
          const historyEntries = historyRequest.result
          historyEntries.forEach((entry) => {
            historyStore.delete(entry.id)
          })
        }

        setFiles((prev) => prev.filter((f) => f.id !== fileId))
        setFileHistory((prev) => prev.filter((h) => h.fileId !== fileId))

        if (currentFile?.id === fileId) {
          setCurrentFile(null)
        }
      } catch (error) {
        console.error("Failed to delete file:", error)
        throw error
      }
    },
    [initDB, currentFile],
  )

  const openFile = useCallback((file: FileItem) => {
    setCurrentFile(file)
  }, [])

  const updateFileContent = useCallback(
    async (fileId: string, content: string) => {
      const file = files.find((f) => f.id === fileId)
      if (!file) return

      const updatedFile = { ...file, content }
      await saveFile(updatedFile)

      if (currentFile?.id === fileId) {
        setCurrentFile(updatedFile)
      }
    },
    [files, currentFile, saveFile],
  )

  const createSnapshot = useCallback(
    async (name: string, description?: string, tags?: string[]) => {
      try {
        const db = await initDB()
        const transaction = db.transaction([SNAPSHOTS_STORE], "readwrite")
        const store = transaction.objectStore(SNAPSHOTS_STORE)

        const snapshot: ProjectSnapshot = {
          id: `snapshot_${Date.now()}`,
          name,
          timestamp: Date.now(),
          files: [...files],
          description,
          tags,
        }

        await new Promise<void>((resolve, reject) => {
          const request = store.put(snapshot)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })

        return snapshot
      } catch (error) {
        console.error("Failed to create snapshot:", error)
        throw error
      }
    },
    [initDB, files],
  )

  const searchFiles = useCallback(
    (query: string, options: { caseSensitive?: boolean; regex?: boolean } = {}): FileSearchResult[] => {
      const results: FileSearchResult[] = []
      const searchRegex = options.regex
        ? new RegExp(query, options.caseSensitive ? "g" : "gi")
        : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), options.caseSensitive ? "g" : "gi")

      files.forEach((file) => {
        const matches: FileSearchResult["matches"] = []
        const lines = file.content.split("\n")

        lines.forEach((line, lineIndex) => {
          let match
          while ((match = searchRegex.exec(line)) !== null) {
            matches.push({
              line: lineIndex + 1,
              content: line,
              startIndex: match.index,
              endIndex: match.index + match[0].length,
            })
          }
        })

        if (matches.length > 0) {
          results.push({ file, matches })
        }
      })

      return results
    },
    [files],
  )

  const updateStorageStats = useCallback(async (fileList: FileItem[]) => {
    try {
      const totalFiles = fileList.length
      const totalSize = fileList.reduce((sum, file) => sum + (file.size || 0), 0)

      // Get storage quota if available
      let storageQuota = 0
      let storageUsed = 0

      if ("storage" in navigator && "estimate" in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        storageQuota = estimate.quota || 0
        storageUsed = estimate.usage || 0
      }

      const lastBackup = localStorage.getItem("zombiecoder_last_backup")

      setStats({
        totalFiles,
        totalSize,
        lastBackup: lastBackup ? Number.parseInt(lastBackup) : 0,
        storageUsed,
        storageQuota,
      })
    } catch (error) {
      console.error("Failed to update storage stats:", error)
    }
  }, [])

  const createBackup = useCallback(async () => {
    try {
      const backup = {
        timestamp: Date.now(),
        files: files,
        history: fileHistory.slice(-50), // Last 50 history entries
        version: DB_VERSION,
      }

      localStorage.setItem("zombiecoder_backup", JSON.stringify(backup))
      localStorage.setItem("zombiecoder_last_backup", Date.now().toString())

      await updateStorageStats(files)

      return backup
    } catch (error) {
      console.error("Failed to create backup:", error)
      throw error
    }
  }, [files, fileHistory, updateStorageStats])

  const saveUserPreferences = useCallback(
    async (preferences: any) => {
      try {
        const db = await initDB()
        const transaction = db.transaction([PREFERENCES_STORE], "readwrite")
        const store = transaction.objectStore(PREFERENCES_STORE)

        await new Promise<void>((resolve, reject) => {
          const request = store.put({ key: "userPreferences", value: preferences })
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
      } catch (error) {
        console.error("Failed to save preferences:", error)
      }
    },
    [initDB],
  )

  const loadSessionData = useCallback(async () => {
    try {
      const db = await initDB()
      const transaction = db.transaction([PREFERENCES_STORE], "readonly")
      const store = transaction.objectStore(PREFERENCES_STORE)

      return new Promise((resolve) => {
        const request = store.get("sessionData")
        request.onsuccess = () => resolve(request.result?.value || null)
        request.onerror = () => resolve(null)
      })
    } catch (error) {
      console.error("Failed to load session data:", error)
      return null
    }
  }, [initDB])

  useEffect(() => {
    if (files.length > 0) {
      const backupInterval = setInterval(
        () => {
          createBackup()
        },
        5 * 60 * 1000,
      ) // Backup every 5 minutes

      return () => clearInterval(backupInterval)
    }
  }, [files, createBackup])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  return {
    files,
    currentFile,
    isLoading,
    fileHistory,
    stats,
    openFile,
    saveFile,
    createFile,
    deleteFile,
    updateFileContent,
    createSnapshot,
    saveUserPreferences,
    loadSessionData,
    searchFiles,
    createBackup,
  }
}
