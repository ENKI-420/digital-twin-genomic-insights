"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell, AlertTriangle, Info, CheckCircle, Clock,
  MessageSquare, FileText, Users, Dna, Brain,
  Settings, MarkAsUnreadIcon, Trash2, Filter
} from "lucide-react"

interface Notification {
  id: string
  type: "alert" | "info" | "message" | "system" | "research"
  title: string
  description: string
  timestamp: string
  read: boolean
  priority: "high" | "medium" | "low"
  source: string
  actionUrl?: string
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "alert",
      title: "Critical Variant Detected",
      description: "BRCA1 pathogenic variant identified in patient PAT-001 requires immediate review",
      timestamp: "2024-01-15 09:30",
      read: false,
      priority: "high",
      source: "AI Assistant",
      actionUrl: "/genomics/variants/1"
    },
    {
      id: "2",
      type: "message",
      title: "New Research Collaboration Request",
      description: "Dr. Sarah Johnson has invited you to collaborate on genomic biomarkers study",
      timestamp: "2024-01-15 08:45",
      read: false,
      priority: "medium",
      source: "Research Platform",
      actionUrl: "/research/collaboration"
    },
    {
      id: "3",
      type: "info",
      title: "System Maintenance Scheduled",
      description: "Platform will be unavailable for maintenance on January 20th from 2-4 AM EST",
      timestamp: "2024-01-14 16:00",
      read: true,
      priority: "low",
      source: "System Admin"
    },
    {
      id: "4",
      type: "research",
      title: "New Funding Opportunity Match",
      description: "NIH Precision Medicine Initiative (94% match) - deadline approaching in 30 days",
      timestamp: "2024-01-14 14:20",
      read: false,
      priority: "medium",
      source: "Funding Alerts",
      actionUrl: "/research/opportunities"
    },
    {
      id: "5",
      type: "alert",
      title: "Patient Trial Match Found",
      description: "3 active clinical trials match criteria for patient PAT-002",
      timestamp: "2024-01-14 11:15",
      read: true,
      priority: "medium",
      source: "Trial Matching",
      actionUrl: "/trial-matching"
    }
  ])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "message":
        return <MessageSquare className="h-5 w-5 text-green-500" />
      case "system":
        return <Settings className="h-5 w-5 text-gray-500" />
      case "research":
        return <FileText className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50"
      case "medium":
        return "border-yellow-200 bg-yellow-50"
      case "low":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id))
  }

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notif.read
    return notif.type === activeTab
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Bell className="h-8 w-8 mr-3 text-blue-600" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-3 bg-red-100 text-red-800">
                  {unreadCount} unread
                </Badge>
              )}
            </h1>
            <p className="text-gray-600 mt-2">
              Stay updated with alerts, messages, and platform updates
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
                <p className="text-sm text-gray-500">All notifications</p>
              </div>
              <Bell className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
                <p className="text-sm text-red-600">Require attention</p>
              </div>
              <MarkAsUnreadIcon className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">
                  {notifications.filter(n => n.priority === "high").length}
                </p>
                <p className="text-sm text-orange-600">Critical alerts</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-blue-600">
                  {notifications.filter(n => n.timestamp.startsWith("2024-01-15")).length}
                </p>
                <p className="text-sm text-blue-600">Recent alerts</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="alert">
            Alerts ({notifications.filter(n => n.type === "alert").length})
          </TabsTrigger>
          <TabsTrigger value="message">
            Messages ({notifications.filter(n => n.type === "message").length})
          </TabsTrigger>
          <TabsTrigger value="research">
            Research ({notifications.filter(n => n.type === "research").length})
          </TabsTrigger>
          <TabsTrigger value="info">
            System ({notifications.filter(n => n.type === "info").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">You're all caught up!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`${!notification.read ? "border-l-4 border-l-blue-500" : ""} ${
                    notification.priority === "high" ? getPriorityColor("high") :
                    notification.priority === "medium" ? getPriorityColor("medium") :
                    getPriorityColor("low")
                  } hover:shadow-md transition-shadow`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        {getTypeIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className={`font-semibold ${!notification.read ? "text-gray-900" : "text-gray-600"}`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                notification.priority === "high" ? "border-red-300 text-red-700" :
                                notification.priority === "medium" ? "border-yellow-300 text-yellow-700" :
                                "border-blue-300 text-blue-700"
                              }`}
                            >
                              {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{notification.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {notification.timestamp}
                            </span>
                            <span>From: {notification.source}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {!notification.read && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Read
                          </Button>
                        )}
                        {notification.actionUrl && (
                          <Button size="sm">
                            View Details
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}