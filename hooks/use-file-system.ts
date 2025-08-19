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
  children?: FileItem[]
}

export interface ProjectSnapshot {
  id: string
  name: string
  timestamp: number
  files: FileItem[]
}

const DB_NAME = "ZombieCoderDB"
const DB_VERSION = 1
const FILES_STORE = "files"
const SNAPSHOTS_STORE = "snapshots"
const PREFERENCES_STORE = "preferences"

export function useFileSystem() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [currentFile, setCurrentFile] = useState<FileItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize IndexedDB
  const initDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(FILES_STORE)) {
          db.createObjectStore(FILES_STORE, { keyPath: "id" })
        }

        if (!db.objectStoreNames.contains(SNAPSHOTS_STORE)) {
          db.createObjectStore(SNAPSHOTS_STORE, { keyPath: "id" })
        }

        if (!db.objectStoreNames.contains(PREFERENCES_STORE)) {
          db.createObjectStore(PREFERENCES_STORE, { keyPath: "key" })
        }
      }
    })
  }, [])

  // Load files from IndexedDB
  const loadFiles = useCallback(async () => {
    try {
      const db = await initDB()
      const transaction = db.transaction([FILES_STORE], "readonly")
      const store = transaction.objectStore(FILES_STORE)
      const request = store.getAll()

      request.onsuccess = () => {
        const loadedFiles = request.result || []
        setFiles(loadedFiles)
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Failed to load files:", error)
      setIsLoading(false)
    }
  }, [initDB])

  // Save file to IndexedDB
  const saveFile = useCallback(
    async (file: FileItem) => {
      try {
        const db = await initDB()
        const transaction = db.transaction([FILES_STORE], "readwrite")
        const store = transaction.objectStore(FILES_STORE)

        const updatedFile = {
          ...file,
          lastModified: Date.now(),
        }

        await store.put(updatedFile)

        setFiles((prev) => {
          const index = prev.findIndex((f) => f.id === file.id)
          if (index >= 0) {
            const newFiles = [...prev]
            newFiles[index] = updatedFile
            return newFiles
          }
          return [...prev, updatedFile]
        })

        return updatedFile
      } catch (error) {
        console.error("Failed to save file:", error)
        throw error
      }
    },
    [initDB],
  )

  // Create new file
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
        json: "json",
        md: "markdown",
        php: "php",
      }

      const newFile: FileItem = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        path,
        content,
        type: "file",
        language: languageMap[extension || ""] || "plaintext",
        lastModified: Date.now(),
      }

      return await saveFile(newFile)
    },
    [saveFile],
  )

  // Delete file
  const deleteFile = useCallback(
    async (fileId: string) => {
      try {
        const db = await initDB()
        const transaction = db.transaction([FILES_STORE], "readwrite")
        const store = transaction.objectStore(FILES_STORE)

        await store.delete(fileId)

        setFiles((prev) => prev.filter((f) => f.id !== fileId))

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

  // Open file
  const openFile = useCallback((file: FileItem) => {
    setCurrentFile(file)
  }, [])

  // Update file content
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

  // Create project snapshot
  const createSnapshot = useCallback(
    async (name: string) => {
      try {
        const db = await initDB()
        const transaction = db.transaction([SNAPSHOTS_STORE], "readwrite")
        const store = transaction.objectStore(SNAPSHOTS_STORE)

        const snapshot: ProjectSnapshot = {
          id: `snapshot_${Date.now()}`,
          name,
          timestamp: Date.now(),
          files: [...files],
        }

        await store.put(snapshot)
        return snapshot
      } catch (error) {
        console.error("Failed to create snapshot:", error)
        throw error
      }
    },
    [initDB, files],
  )

  // Save user preferences
  const saveUserPreferences = useCallback(
    async (preferences: any) => {
      try {
        const db = await initDB()
        const transaction = db.transaction([PREFERENCES_STORE], "readwrite")
        const store = transaction.objectStore(PREFERENCES_STORE)

        await store.put({ key: "userPreferences", value: preferences })
      } catch (error) {
        console.error("Failed to save preferences:", error)
      }
    },
    [initDB],
  )

  // Load session data
  const loadSessionData = useCallback(async () => {
    try {
      const db = await initDB()
      const transaction = db.transaction([PREFERENCES_STORE], "readonly")
      const store = transaction.objectStore(PREFERENCES_STORE)
      const request = store.get("sessionData")

      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result?.value || null)
        request.onerror = () => resolve(null)
      })
    } catch (error) {
      console.error("Failed to load session data:", error)
      return null
    }
  }, [initDB])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  return {
    files,
    currentFile,
    isLoading,
    openFile,
    saveFile,
    createFile,
    deleteFile,
    updateFileContent,
    createSnapshot,
    saveUserPreferences,
    loadSessionData,
  }
}
