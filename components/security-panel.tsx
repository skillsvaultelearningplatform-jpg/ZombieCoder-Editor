"use client"

import { useState } from "react"
import { useSandbox } from "@/hooks/use-sandbox"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, ShieldCheck, ShieldAlert, Lock, Eye, EyeOff, Trash2, Settings } from "lucide-react"

export function SecurityPanel() {
  const config = {
    blockExternalRequests: false,
    enableSandbox: false,
    privacyMode: false,
    telemetryDisabled: false,
    proxyEnabled: false,
    allowedDomains: ["localhost", "127.0.0.1"],
    blockedDomains: ["analytics.google.com", "facebook.com", "doubleclick.net"],
  }
  const threats: any[] = []
  const saveConfig = () => {}
  const privacyMode = () => {}
  const clearTelemetryData = () => {}
  const disableAnalytics = () => {}

  const { config: sandboxConfig, updateConfig: updateSandboxConfig } = useSandbox()
  const [showThreats, setShowThreats] = useState(false)

  const handleSecurityToggle = (key: keyof typeof config, value: boolean) => {
    console.log(`Security toggle ${key}: ${value} (disabled for preview compatibility)`)
  }

  const handleSandboxToggle = (key: keyof typeof sandboxConfig, value: boolean | number) => {
    updateSandboxConfig({ [key]: value })
  }

  const getThreatIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <ShieldAlert className="h-4 w-4 text-red-500" />
      case "high":
        return <ShieldAlert className="h-4 w-4 text-orange-500" />
      case "medium":
        return <ShieldAlert className="h-4 w-4 text-yellow-500" />
      default:
        return <Shield className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Security Center</h2>
          <Badge variant="secondary" className="ml-auto text-xs">
            Disabled
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Security features disabled for compatibility</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="security" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
            <TabsTrigger value="security" className="text-xs">
              Security
            </TabsTrigger>
            <TabsTrigger value="sandbox" className="text-xs">
              Sandbox
            </TabsTrigger>
            <TabsTrigger value="threats" className="text-xs">
              Threats
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="security" className="h-full m-0 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <Card className="p-3 bg-blue-500/10 border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-600">Security System Disabled</span>
                    </div>
                    <p className="text-xs text-blue-600/80">
                      All security features have been disabled to ensure blob URL compatibility in the preview
                      environment. Please refresh the page if you continue to experience issues.
                    </p>
                  </Card>

                  {/* Privacy Mode */}
                  <Card className="p-3 opacity-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span className="text-sm font-medium">Privacy Mode</span>
                      </div>
                      <Switch checked={false} onCheckedChange={() => {}} disabled />
                    </div>
                    <p className="text-xs text-muted-foreground">Enable maximum privacy protection (disabled)</p>
                  </Card>

                  {/* Block External Requests */}
                  <Card className="p-3 opacity-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-sm font-medium">Block External Requests</span>
                      </div>
                      <Switch checked={false} onCheckedChange={() => {}} disabled />
                    </div>
                    <p className="text-xs text-muted-foreground">Prevent external network access (disabled)</p>
                  </Card>

                  {/* Disable Telemetry */}
                  <Card className="p-3 opacity-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-medium">Disable Telemetry</span>
                      </div>
                      <Switch checked={false} onCheckedChange={() => {}} disabled />
                    </div>
                    <p className="text-xs text-muted-foreground">Block analytics and tracking (disabled)</p>
                  </Card>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button size="sm" className="w-full" disabled>
                      <Lock className="h-4 w-4 mr-2" />
                      Enable Full Privacy Mode (Disabled)
                    </Button>
                    <Button variant="outline" size="sm" className="w-full bg-transparent" disabled>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Telemetry Data (Disabled)
                    </Button>
                    <Button variant="outline" size="sm" className="w-full bg-transparent" disabled>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Disable Analytics (Disabled)
                    </Button>
                  </div>

                  {/* Security Status */}
                  <Card className="p-3">
                    <h3 className="text-sm font-medium mb-2">Security Status</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>External Requests:</span>
                        <Badge variant="secondary">Allowed</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Telemetry:</span>
                        <Badge variant="secondary">Enabled</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Sandbox:</span>
                        <Badge variant={sandboxConfig.enabled ? "default" : "secondary"}>
                          {sandboxConfig.enabled ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sandbox" className="h-full m-0 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {/* Sandbox Enable */}
                  <Card className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span className="text-sm font-medium">Enable Sandbox</span>
                      </div>
                      <Switch
                        checked={sandboxConfig.enabled}
                        onCheckedChange={(value) => handleSandboxToggle("enabled", value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Isolate code execution</p>
                  </Card>

                  {/* Resource Limits */}
                  <Card className="p-3">
                    <h3 className="text-sm font-medium mb-3">Resource Limits</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Max Memory</span>
                          <span>{sandboxConfig.maxMemory}MB</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(100, (sandboxConfig.maxMemory / 512) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Max Execution Time</span>
                          <span>{sandboxConfig.maxExecutionTime}s</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(100, (sandboxConfig.maxExecutionTime / 10) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Allowed APIs */}
                  <Card className="p-3">
                    <h3 className="text-sm font-medium mb-2">Allowed APIs</h3>
                    <div className="flex flex-wrap gap-1">
                      {sandboxConfig.allowedAPIs.map((api) => (
                        <Badge key={api} variant="secondary" className="text-xs">
                          {api}
                        </Badge>
                      ))}
                    </div>
                  </Card>

                  {/* Blocked APIs */}
                  <Card className="p-3">
                    <h3 className="text-sm font-medium mb-2">Blocked APIs</h3>
                    <div className="flex flex-wrap gap-1">
                      {sandboxConfig.blockedAPIs.map((api) => (
                        <Badge key={api} variant="destructive" className="text-xs">
                          {api}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="threats" className="h-full m-0 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Security Threats</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowThreats(!showThreats)}
                      className="h-6 text-xs"
                    >
                      {showThreats ? "Hide" : "Show"} Details
                    </Button>
                  </div>

                  <div className="text-center py-8 text-muted-foreground text-xs">
                    <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    No threats detected (Security system disabled)
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
