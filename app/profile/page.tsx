"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  User, Mail, Phone, MapPin, Calendar, Shield,
  Settings, Activity, Award, FileText, Camera,
  Save, Edit, Lock, Bell, Palette, Globe
} from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"

export default function ProfilePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)

  const [profileData, setProfileData] = useState({
    name: user?.name || "Dr. Sarah Johnson",
    email: user?.email || "sarah.johnson@hospital.org",
    phone: "+1 (555) 123-4567",
    department: "Oncology",
    institution: "Mayo Clinic",
    location: "Rochester, MN",
    bio: "Board-certified oncologist specializing in genomic medicine and precision cancer treatment. Leading research in AI-driven variant classification.",
    specialties: ["Oncology", "Genomics", "Precision Medicine"],
    certifications: ["ABIM Oncology", "ACMG Genetics", "ASCO Precision Medicine"],
    orcid: "0000-0002-1234-5678"
  })

  const recentActivity = [
    {
      type: "analysis",
      title: "Variant Analysis Completed",
      description: "BRCA1 analysis for patient PAT-001",
      timestamp: "2024-01-15 14:30",
      status: "completed"
    },
    {
      type: "research",
      title: "Research Project Updated",
      description: "Genomic Biomarkers study - 65% completion",
      timestamp: "2024-01-15 11:20",
      status: "active"
    },
    {
      type: "collaboration",
      title: "Collaboration Invite Sent",
      description: "Invited Dr. Chen to precision medicine study",
      timestamp: "2024-01-14 16:45",
      status: "pending"
    },
    {
      type: "publication",
      title: "Paper Published",
      description: "AI in Genomic Variant Classification - Nature Genetics",
      timestamp: "2024-01-14 09:00",
      status: "published"
    }
  ]

  const achievements = [
    {
      title: "AI Innovation Award",
      description: "Excellence in AI-driven genomic research",
      date: "2024-01-10",
      type: "award"
    },
    {
      title: "100 Variants Analyzed",
      description: "Milestone in variant classification",
      date: "2024-01-05",
      type: "milestone"
    },
    {
      title: "Research Collaboration",
      description: "Successful multi-institutional study",
      date: "2023-12-20",
      type: "collaboration"
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "analysis":
        return <Activity className="h-4 w-4 text-blue-500" />
      case "research":
        return <FileText className="h-4 w-4 text-green-500" />
      case "collaboration":
        return <User className="h-4 w-4 text-purple-500" />
      case "publication":
        return <Award className="h-4 w-4 text-orange-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const handleSave = () => {
    setIsEditing(false)
    // Save profile data
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <User className="h-8 w-8 mr-3 text-blue-600" />
              My Profile
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your personal information, preferences, and account settings
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
            {isEditing && (
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-blue-600" />
                  {isEditing && (
                    <Button size="sm" variant="outline" className="absolute translate-x-8 translate-y-8">
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <CardTitle className="text-xl">{profileData.name}</CardTitle>
                <p className="text-gray-600">{profileData.department}</p>
                <p className="text-sm text-gray-500">{profileData.institution}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    {profileData.email}
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    {profileData.phone}
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    {profileData.location}
                  </div>
                  <div className="flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-2 text-gray-500" />
                    ORCID: {profileData.orcid}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileData.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">{specialty}</Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Certifications</h4>
                  <div className="space-y-1">
                    {profileData.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <Award className="h-3 w-3 mr-2 text-yellow-500" />
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <p className="text-sm text-gray-600">Update your personal and professional information</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={profileData.department}
                      onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution</Label>
                    <Input
                      id="institution"
                      value={profileData.institution}
                      onChange={(e) => setProfileData({...profileData, institution: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orcid">ORCID ID</Label>
                    <Input
                      id="orcid"
                      value={profileData.orcid}
                      onChange={(e) => setProfileData({...profileData, orcid: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <p className="text-sm text-gray-600">Your recent actions and activities on the platform</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-500">{activity.timestamp}</span>
                        <Badge variant="outline" className="text-xs">
                          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Achievements & Recognition
              </CardTitle>
              <p className="text-sm text-gray-600">Your accomplishments and milestones</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <Card key={index} className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
                    <CardContent className="p-6 text-center">
                      <Award className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                      <h4 className="font-medium mb-2">{achievement.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      <div className="flex items-center justify-center space-x-2">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{achievement.date}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Preferences
              </CardTitle>
              <p className="text-sm text-gray-600">Customize your platform experience</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4 flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Critical Alerts</p>
                        <p className="text-sm text-gray-600">High-priority genomic findings and system alerts</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Research Updates</p>
                        <p className="text-sm text-gray-600">Project progress and collaboration invites</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Funding Opportunities</p>
                        <p className="text-sm text-gray-600">New grant opportunities and deadlines</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4 flex items-center">
                    <Palette className="h-4 w-4 mr-2" />
                    Appearance
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Theme</p>
                        <p className="text-sm text-gray-600">Choose your preferred interface theme</p>
                      </div>
                      <select className="rounded border-gray-300">
                        <option>Light</option>
                        <option>Dark</option>
                        <option>Auto</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Compact Mode</p>
                        <p className="text-sm text-gray-600">Use a more compact interface layout</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
              <p className="text-sm text-gray-600">Manage your account security and privacy</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Lock className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Active Sessions</p>
                      <p className="text-sm text-gray-600">Manage your active login sessions</p>
                    </div>
                  </div>
                  <Button variant="outline">View Sessions</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Data Export</p>
                      <p className="text-sm text-gray-600">Download a copy of your data</p>
                    </div>
                  </div>
                  <Button variant="outline">Request Export</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}