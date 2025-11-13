"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Search, Download, Trash2, Star, Users, Package, RefreshCw } from "lucide-react"
import { usePluginSystem, type Extension } from "@/hooks/use-plugin-system"

export function ExtensionManager() {
  const {
    extensions,
    installedExtensions,
    isLoading,
    error,
    loadExtensions,
    installExtension,
    uninstallExtension,
    toggleExtension,
  } = usePluginSystem()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredExtensions = extensions.filter((ext) => {
    const matchesSearch =
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || ext.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [
    { id: "all", label: "All", count: extensions.length },
    { id: "theme", label: "Themes", count: extensions.filter((e) => e.category === "theme").length },
    { id: "language", label: "Languages", count: extensions.filter((e) => e.category === "language").length },
    { id: "tool", label: "Tools", count: extensions.filter((e) => e.category === "tool").length },
    { id: "ai", label: "AI", count: extensions.filter((e) => e.category === "ai").length },
    { id: "snippet", label: "Snippets", count: extensions.filter((e) => e.category === "snippet").length },
  ]

  const ExtensionCard = ({ extension }: { extension: Extension }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{extension.icon || "📦"}</div>
            <div>
              <CardTitle className="text-base">{extension.name}</CardTitle>
              <CardDescription className="text-sm">
                by {extension.author} • v{extension.version}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="capitalize">
            {extension.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">{extension.description}</p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {extension.rating}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {extension.downloads.toLocaleString()}
          </div>
          <div className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            {extension.size}
          </div>
        </div>

        <div className="flex items-center justify-between">
          {extension.isInstalled ? (
            <div className="flex items-center gap-2">
              <Switch checked={extension.isEnabled} onCheckedChange={() => toggleExtension(extension.id)} />
              <span className="text-sm">{extension.isEnabled ? "Enabled" : "Disabled"}</span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            {extension.isInstalled ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => uninstallExtension(extension.id)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Uninstall
              </Button>
            ) : (
              <Button variant="default" size="sm" onClick={() => installExtension(extension.id)} disabled={isLoading}>
                <Download className="h-4 w-4 mr-1" />
                Install
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Extensions</h2>
          <Button variant="outline" size="sm" onClick={loadExtensions} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search extensions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label} ({category.count})
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="marketplace" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="installed">Installed ({installedExtensions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="flex-1 mt-4">
          <ScrollArea className="h-full px-4">
            {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">{error}</div>}

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Loading extensions...
              </div>
            ) : (
              <div>
                {filteredExtensions.map((extension) => (
                  <ExtensionCard key={extension.id} extension={extension} />
                ))}
                {filteredExtensions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No extensions found matching your criteria.
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="installed" className="flex-1 mt-4">
          <ScrollArea className="h-full px-4">
            {installedExtensions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No extensions installed yet.</p>
                <p className="text-sm">Browse the marketplace to find extensions.</p>
              </div>
            ) : (
              <div>
                {installedExtensions.map((extension) => (
                  <ExtensionCard key={extension.id} extension={extension} />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
