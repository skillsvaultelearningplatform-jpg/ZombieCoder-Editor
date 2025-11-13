"use client"

import { useState } from "react"
import { useSecurity } from "@/hooks/use-security"
import { useSandbox } from "@/hooks/use-sandbox"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, ShieldCheck, ShieldAlert, Lock, Eye, EyeOff, Trash2, Settings } from "lucide-react"

export function SecurityPanel() {
  const { config, threats, saveConfig, privacyMode, clearTelemetryData, disableAnalytics } = useSecurity()
  const { config: sandboxConfig, updateConfig: updateSandboxConfig } = useSandbox()
  const [showThreats, setShowThreats] = useState(false)

  const handleSecurityToggle = (key: keyof typeof config, value: boolean) => {
    saveConfig({ [key]: value })
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
          <Badge variant={config.privacyMode ? "default" : "secondary"} className="ml-auto text-xs">
            {config.privacyMode ? "Secure" : "Standard"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">অফলাইন নিরাপত্তা ব্যবস্থা</p>
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
                  {/* Privacy Mode */}
                  <Card className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span className="text-sm font-medium">Privacy Mode</span>
                      </div>
                      <Switch
                        checked={config.privacyMode}
                        onCheckedChange={(value) => handleSecurityToggle("privacyMode", value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Enable maximum privacy protection</p>
                  </Card>

                  {/* Block External Requests */}
                  <Card className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-sm font-medium">Block External Requests</span>
                      </div>
                      <Switch
                        checked={config.blockExternalRequests}
                        onCheckedChange={(value) => handleSecurityToggle("blockExternalRequests", value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Prevent external network access</p>
                  </Card>

                  {/* Disable Telemetry */}
                  <Card className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-medium">Disable Telemetry</span>
                      </div>
                      <Switch
                        checked={config.telemetryDisabled}
                        onCheckedChange={(value) => handleSecurityToggle("telemetryDisabled", value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Block analytics and tracking</p>
                  </Card>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button onClick={privacyMode} size="sm" className="w-full">
                      <Lock className="h-4 w-4 mr-2" />
                      Enable Full Privacy Mode
                    </Button>
                    <Button onClick={clearTelemetryData} variant="outline" size="sm" className="w-full bg-transparent">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Telemetry Data
                    </Button>
                    <Button onClick={disableAnalytics} variant="outline" size="sm" className="w-full bg-transparent">
                      <EyeOff className="h-4 w-4 mr-2" />
                      Disable Analytics
                    </Button>
                  </div>

                  {/* Security Status */}
                  <Card className="p-3">
                    <h3 className="text-sm font-medium mb-2">Security Status</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>External Requests:</span>
                        <Badge variant={config.blockExternalRequests ? "default" : "destructive"}>
                          {config.blockExternalRequests ? "Blocked" : "Allowed"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Telemetry:</span>
                        <Badge variant={config.telemetryDisabled ? "default" : "destructive"}>
                          {config.telemetryDisabled ? "Disabled" : "Enabled"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Sandbox:</span>
                        <Badge variant={sandboxConfig.enabled ? "default" : "destructive"}>
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

                  {threats.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      No threats detected
                    </div>
                  ) : (
                    threats.slice(-10).map((threat) => (
                      <Card key={threat.id} className="p-3">
                        <div className="flex items-start gap-2">
                          {getThreatIcon(threat.severity)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium capitalize">{threat.type.replace("_", " ")}</span>
                              <Badge variant={threat.blocked ? "default" : "destructive"} className="text-xs">
                                {threat.blocked ? "Blocked" : "Allowed"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{threat.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {threat.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
