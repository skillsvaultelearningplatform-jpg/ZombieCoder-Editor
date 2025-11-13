"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  Cpu,
  HardDrive,
  Zap,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Database,
  Wifi,
  Clock,
} from "lucide-react"
import { usePerformanceMonitor } from "@/hooks/use-performance-monitor"

export function PerformancePanel() {
  const { metrics, alerts, isOptimized, optimizePerformance, clearAlerts } = usePerformanceMonitor()
  const [selectedTab, setSelectedTab] = useState<"overview" | "alerts" | "optimization">("overview")

  const getMetricColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return "text-green-500"
    if (value <= thresholds.warning) return "text-yellow-500"
    return "text-red-500"
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-500/20 text-blue-400"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400"
      case "high":
        return "bg-orange-500/20 text-orange-400"
      case "critical":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const unresolvedAlerts = alerts.filter((alert) => !alert.resolved)

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full">
      {/* Performance Panel Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4" />
          <span className="font-medium">Performance Monitor</span>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1">
          {[
            { id: "overview", label: "Overview" },
            { id: "alerts", label: "Alerts", count: unresolvedAlerts.length },
            { id: "optimization", label: "Optimize" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedTab(tab.id as any)}
              className="text-xs"
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                  {tab.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {selectedTab === "overview" && (
            <>
              {/* System Metrics */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    System Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Memory Usage</span>
                      <span className={getMetricColor(metrics.memoryUsage, { good: 50, warning: 75 })}>
                        {metrics.memoryUsage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={metrics.memoryUsage} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>CPU Usage</span>
                      <span className={getMetricColor(metrics.cpuUsage, { good: 30, warning: 60 })}>
                        {metrics.cpuUsage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={metrics.cpuUsage} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">Render Time</span>
                    </div>
                    <span className={`text-xs ${getMetricColor(metrics.renderTime, { good: 30, warning: 60 })}`}>
                      {metrics.renderTime.toFixed(1)}ms
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-3 w-3" />
                      <span className="text-xs">Bundle Size</span>
                    </div>
                    <span className="text-xs text-foreground">{metrics.bundleSize.toFixed(1)}MB</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Database className="h-3 w-3" />
                      <span className="text-xs">Cache Hit Rate</span>
                    </div>
                    <span className="text-xs text-green-500">{metrics.cacheHitRate.toFixed(1)}%</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-3 w-3" />
                      <span className="text-xs">Active Connections</span>
                    </div>
                    <span className="text-xs text-foreground">{metrics.activeConnections}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {selectedTab === "alerts" && (
            <div className="space-y-3">
              {unresolvedAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No performance issues detected</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Alerts</span>
                    <Button variant="outline" size="sm" onClick={clearAlerts}>
                      Clear All
                    </Button>
                  </div>

                  {unresolvedAlerts.map((alert) => (
                    <Card key={alert.id}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {alert.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm">{alert.message}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}

          {selectedTab === "optimization" && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Performance Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Optimize your editor performance with automatic memory cleanup, cache optimization, and resource
                    management.
                  </p>

                  <Button onClick={optimizePerformance} disabled={isOptimized} className="w-full" size="sm">
                    {isOptimized ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Optimized!
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Optimize Now
                      </>
                    )}
                  </Button>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-xs font-medium">Optimization Features:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Memory garbage collection</li>
                      <li>• Cache optimization</li>
                      <li>• Resource cleanup</li>
                      <li>• Bundle size reduction</li>
                      <li>• Render performance boost</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
