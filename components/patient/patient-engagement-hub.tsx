"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Bell,
  Calendar,
  MessageSquare,
  BookOpen,
  Pill,
  Heart,
  Activity,
  Send,
  Check,
  Clock,
  Phone,
  Video,
  Download
} from "lucide-react"

interface PatientEngagementHubProps {
  patientId: string
  patientName: string
}

interface Reminder {
  id: string
  type: "medication" | "appointment" | "test" | "activity"
  title: string
  description: string
  dueTime: string
  completed: boolean
  priority: "high" | "medium" | "low"
}

interface Message {
  id: string
  from: string
  to: string
  subject: string
  content: string
  timestamp: string
  read: boolean
  type: "secure_message" | "lab_result" | "appointment_reminder"
}

interface EducationalContent {
  id: string
  title: string
  category: "genetics" | "medication" | "lifestyle" | "condition"
  description: string
  readTime: string
  url: string
  viewed: boolean
}

export function PatientEngagementHub({ patientId, patientName }: PatientEngagementHubProps) {
  const [activeTab, setActiveTab] = useState("reminders")
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [educationalContent, setEducationalContent] = useState<EducationalContent[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedProvider, setSelectedProvider] = useState("")

  useEffect(() => {
    loadPatientData()
  }, [patientId])

  const loadPatientData = async () => {
    // Mock data - in real implementation, fetch from APIs
    setReminders([
      {
        id: "r1",
        type: "medication",
        title: "Take Evening Medications",
        description: "Metformin 500mg, Lisinopril 10mg",
        dueTime: "8:00 PM",
        completed: false,
        priority: "high"
      },
      {
        id: "r2",
        type: "appointment",
        title: "Genetic Counseling Appointment",
        description: "Follow-up on BRCA1 results with Dr. Chen",
        dueTime: "Tomorrow at 2:00 PM",
        completed: false,
        priority: "high"
      },
      {
        id: "r3",
        type: "test",
        title: "Lipid Panel Lab Work",
        description: "Fasting blood work - remember to fast 12 hours",
        dueTime: "Friday at 9:00 AM",
        completed: false,
        priority: "medium"
      }
    ])

    setMessages([
      {
        id: "m1",
        from: "Dr. Emily Chen",
        to: patientName,
        subject: "Your Genetic Test Results",
        content: "Your recent genetic panel results are available. We've identified some important findings that we should discuss. Please schedule a follow-up appointment.",
        timestamp: "2 hours ago",
        read: false,
        type: "lab_result"
      },
      {
        id: "m2",
        from: "Care Team",
        to: patientName,
        subject: "Appointment Reminder",
        content: "This is a reminder about your genetic counseling appointment tomorrow at 2:00 PM with Dr. Chen.",
        timestamp: "1 day ago",
        read: true,
        type: "appointment_reminder"
      }
    ])

    setEducationalContent([
      {
        id: "e1",
        title: "Understanding Your BRCA1 Results",
        category: "genetics",
        description: "Learn about BRCA1 gene variants and their implications for cancer risk and family planning.",
        readTime: "8 min read",
        url: "/education/brca1-guide",
        viewed: false
      },
      {
        id: "e2",
        title: "Pharmacogenomics: How Your Genes Affect Medications",
        category: "medication",
        description: "Discover how genetic variations can influence how your body processes medications.",
        readTime: "6 min read",
        url: "/education/pharmacogenomics",
        viewed: true
      },
      {
        id: "e3",
        title: "Cancer Risk Reduction Strategies",
        category: "lifestyle",
        description: "Evidence-based lifestyle modifications to reduce cancer risk for high-risk individuals.",
        readTime: "10 min read",
        url: "/education/cancer-prevention",
        viewed: false
      }
    ])
  }

  const markReminderComplete = (reminderId: string) => {
    setReminders(prev =>
      prev.map(reminder =>
        reminder.id === reminderId
          ? { ...reminder, completed: true }
          : reminder
      )
    )
  }

  const markMessageRead = (messageId: string) => {
    setMessages(prev =>
      prev.map(message =>
        message.id === messageId
          ? { ...message, read: true }
          : message
      )
    )
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedProvider) return

    const message: Message = {
      id: `m${Date.now()}`,
      from: patientName,
      to: selectedProvider,
      subject: "Patient Message",
      content: newMessage,
      timestamp: "Just now",
      read: false,
      type: "secure_message"
    }

    setMessages(prev => [message, ...prev])
    setNewMessage("")
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "medication": return <Pill className="h-4 w-4" />
      case "appointment": return <Calendar className="h-4 w-4" />
      case "test": return <Activity className="h-4 w-4" />
      case "activity": return <Heart className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient Engagement Hub</h1>
        <p className="text-gray-600">Stay connected with your care team and manage your health</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="reminders" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Reminders
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="vitals" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Health Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Today's Reminders ({reminders.filter(r => !r.completed).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      reminder.completed ? "bg-gray-50 opacity-60" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${reminder.completed ? "bg-green-100" : "bg-blue-100"}`}>
                        {reminder.completed ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          getTypeIcon(reminder.type)
                        )}
                      </div>
                      <div>
                        <h4 className={`font-medium ${reminder.completed ? "line-through" : ""}`}>
                          {reminder.title}
                        </h4>
                        <p className="text-sm text-gray-600">{reminder.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{reminder.dueTime}</span>
                          <Badge className={getPriorityColor(reminder.priority)}>
                            {reminder.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {!reminder.completed && (
                      <Button
                        size="sm"
                        onClick={() => markReminderComplete(reminder.id)}
                        className="ml-4"
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Secure Messages ({messages.filter(m => !m.read).length} unread)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        !message.read ? "bg-blue-50 border-blue-200" : "bg-white"
                      }`}
                      onClick={() => markMessageRead(message.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{message.from}</span>
                        <span className="text-xs text-gray-500">{message.timestamp}</span>
                      </div>
                      <h4 className={`text-sm ${!message.read ? "font-semibold" : ""}`}>
                        {message.subject}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {message.content}
                      </p>
                      {!message.read && (
                        <Badge className="mt-2 bg-blue-100 text-blue-800">New</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Send Secure Message</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">To:</label>
                    <select
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      <option value="">Select provider...</option>
                      <option value="Dr. Emily Chen">Dr. Emily Chen - Genetics</option>
                      <option value="Dr. Sarah Johnson">Dr. Sarah Johnson - Primary Care</option>
                      <option value="Care Team">Care Coordination Team</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message:</label>
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || !selectedProvider}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Secure Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Personalized Educational Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {educationalContent.map((content) => (
                  <div
                    key={content.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{content.category}</Badge>
                      {content.viewed && <Check className="h-4 w-4 text-green-600" />}
                    </div>
                    <h4 className="font-medium text-sm mb-2">{content.title}</h4>
                    <p className="text-xs text-gray-600 mb-3">{content.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{content.readTime}</span>
                      <Button size="sm" variant="outline">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Read
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Genetic Counseling</h4>
                      <Badge className="bg-blue-100 text-blue-800">Tomorrow</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Dr. Emily Chen</p>
                    <p className="text-sm text-gray-600">2:00 PM - 3:00 PM</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        <Video className="h-3 w-3 mr-1" />
                        Join Video Call
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-3 w-3 mr-1" />
                        Call Provider
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule New Appointment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Department:</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>Genetics</option>
                      <option>Primary Care</option>
                      <option>Cardiology</option>
                      <option>Oncology</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Preferred Date:</label>
                    <Input type="date" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reason for Visit:</label>
                    <Textarea
                      placeholder="Brief description of your concern..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <Button className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Request Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Health Tracking Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Heart className="h-4 w-4" />
                <AlertDescription>
                  Connect wearable devices to automatically track your health metrics and share with your care team.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 text-center">
                  <h4 className="font-medium mb-2">Blood Pressure</h4>
                  <div className="text-2xl font-bold text-blue-600">120/80</div>
                  <p className="text-sm text-gray-500">Last recorded: Today</p>
                </div>

                <div className="border rounded-lg p-4 text-center">
                  <h4 className="font-medium mb-2">Weight</h4>
                  <div className="text-2xl font-bold text-green-600">165 lbs</div>
                  <p className="text-sm text-gray-500">Goal: 160 lbs</p>
                </div>

                <div className="border rounded-lg p-4 text-center">
                  <h4 className="font-medium mb-2">Steps Today</h4>
                  <div className="text-2xl font-bold text-purple-600">8,642</div>
                  <p className="text-sm text-gray-500">Goal: 10,000</p>
                </div>
              </div>

              <div className="mt-6">
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Health Data Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}