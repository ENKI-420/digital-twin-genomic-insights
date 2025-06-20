"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import InteractiveOnboarding from './interactive-onboarding'
import ContextualHelp from './contextual-help'
import {
  TrendingUp,
  Users,
  Target,
  Zap,
  Trophy,
  Clock,
  Brain,
  Heart,
  Star,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Lightbulb,
  MessageSquare,
  BookOpen,
  Play,
  Award,
  Activity,
  User,
  Settings,
  HelpCircle
} from 'lucide-react'

interface EngagementMetrics {
  totalUsers: number
  activeUsers: number
  onboardingCompletion: number
  featureAdoption: Record<string, number>
  userSatisfaction: number
  helpRequestsResolved: number
  averageSessionTime: number
  proactiveInterventions: number
}

interface UserEngagementData {
  userId: string
  name: string
  role: string
  onboardingProgress: number
  engagementScore: number
  featuresExplored: number
  totalFeatures: number
  timeSpent: number
  lastActive: string
  achievements: string[]
  strugglingWith: string[]
  nextRecommendations: string[]
}

interface EngagementDashboardProps {
  tenantId: string
  currentUser: {
    id: string
    role: string
    name: string
  }
}

export default function EngagementDashboard({ tenantId, currentUser }: EngagementDashboardProps) {
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null)
  const [users, setUsers] = useState<UserEngagementData[]>([])
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserEngagementData | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEngagementData()
  }, [tenantId])

  const loadEngagementData = async () => {
    try {
      setLoading(true)

      // Simulate API call - in real implementation, this would fetch from your engagement analytics
      await new Promise(resolve => setTimeout(resolve, 1000))

      setMetrics({
        totalUsers: 247,
        activeUsers: 189,
        onboardingCompletion: 87,
        featureAdoption: {
          'clinical-decision-support': 94,
          'patient-app-generator': 76,
          'mutation-analysis': 68,
          'fhir-integration': 91,
          'research-tools': 52
        },
        userSatisfaction: 4.7,
        helpRequestsResolved: 156,
        averageSessionTime: 24,
        proactiveInterventions: 89
      })

      setUsers([
        {
          userId: 'user_1',
          name: 'Dr. Sarah Chen',
          role: 'Clinician',
          onboardingProgress: 100,
          engagementScore: 92,
          featuresExplored: 8,
          totalFeatures: 12,
          timeSpent: 145,
          lastActive: '2 hours ago',
          achievements: ['Platform Expert', 'AI Pioneer', 'Patient Advocate'],
          strugglingWith: [],
          nextRecommendations: ['Advanced Analytics', 'Research Collaboration']
        },
        {
          userId: 'user_2',
          name: 'Dr. Michael Rodriguez',
          role: 'Researcher',
          onboardingProgress: 60,
          engagementScore: 74,
          featuresExplored: 5,
          totalFeatures: 12,
          timeSpent: 89,
          lastActive: '1 day ago',
          achievements: ['Data Explorer'],
          strugglingWith: ['FHIR Integration', 'Advanced Queries'],
          nextRecommendations: ['Complete Onboarding', 'FHIR Tutorial', 'Research Tools']
        },
        {
          userId: 'user_3',
          name: 'Dr. Emily Johnson',
          role: 'Clinician',
          onboardingProgress: 25,
          engagementScore: 45,
          featuresExplored: 2,
          totalFeatures: 12,
          timeSpent: 23,
          lastActive: '3 days ago',
          achievements: [],
          strugglingWith: ['Basic Navigation', 'Clinical Decision Support'],
          nextRecommendations: ['Resume Onboarding', 'Guided Tour', 'Basic Tutorial']
        }
      ])

    } catch (error) {
      console.error('Failed to load engagement data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading engagement analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Engagement Dashboard</h1>
          <p className="text-gray-600">AI-driven insights to enhance user adoption and success</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowOnboarding(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Preview Onboarding
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                of {metrics.totalUsers} total users
              </p>
              <Progress
                value={(metrics.activeUsers / metrics.totalUsers) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Onboarding Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.onboardingCompletion}%</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
              <Progress value={metrics.onboardingCompletion} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                {metrics.userSatisfaction}
                <Star className="h-4 w-4 text-yellow-500 ml-1 fill-current" />
              </div>
              <p className="text-xs text-muted-foreground">
                Based on 127 reviews
              </p>
              <Progress value={metrics.userSatisfaction * 20} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(metrics.averageSessionTime)}</div>
              <p className="text-xs text-muted-foreground">
                +18% from baseline
              </p>
              <Progress value={65} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Insights</TabsTrigger>
          <TabsTrigger value="features">Feature Adoption</TabsTrigger>
          <TabsTrigger value="interventions">AI Interventions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Engagement Trends</span>
                </CardTitle>
                <CardDescription>
                  AI-powered insights into user behavior patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Clinical Decision Support</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={94} className="w-20" />
                      <span className="text-sm font-medium">94%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Patient App Generator</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={76} className="w-20" />
                      <span className="text-sm font-medium">76%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">FHIR Integration</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={91} className="w-20" />
                      <span className="text-sm font-medium">91%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mutation Analysis</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={68} className="w-20" />
                      <span className="text-sm font-medium">68%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Interventions Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>AI Assistance Impact</span>
                </CardTitle>
                <CardDescription>
                  How proactive help improves user success
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Interventions Successful</div>
                        <div className="text-sm text-gray-600">89 of 112 interventions</div>
                      </div>
                    </div>
                    <Badge className="bg-green-600">79%</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Lightbulb className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Help Requests Reduced</div>
                        <div className="text-sm text-gray-600">34% decrease this month</div>
                      </div>
                    </div>
                    <Badge variant="secondary">-34%</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Trophy className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Task Completion Up</div>
                        <div className="text-sm text-gray-600">42% improvement</div>
                      </div>
                    </div>
                    <Badge className="bg-purple-600">+42%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Engagement Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { user: 'Dr. Sarah Chen', action: 'Completed advanced genomics tutorial', time: '2 minutes ago', type: 'success' },
                  { user: 'Dr. Michael Rodriguez', action: 'Requested help with FHIR integration', time: '15 minutes ago', type: 'help' },
                  { user: 'Dr. Emily Johnson', action: 'Started onboarding process', time: '1 hour ago', type: 'onboarding' },
                  { user: 'Dr. David Kim', action: 'Achieved "Clinical Expert" badge', time: '2 hours ago', type: 'achievement' },
                  { user: 'Dr. Lisa Wang', action: 'Provided positive feedback on AI suggestions', time: '3 hours ago', type: 'feedback' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'help' ? 'bg-blue-500' :
                      activity.type === 'onboarding' ? 'bg-purple-500' :
                      activity.type === 'achievement' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{activity.user}</div>
                      <div className="text-sm text-gray-600">{activity.action}</div>
                    </div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Card key={user.userId} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <CardDescription>{user.role}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getEngagementColor(user.engagementScore)}>
                      {user.engagementScore}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Onboarding Progress</span>
                      <span>{user.onboardingProgress}%</span>
                    </div>
                    <Progress value={user.onboardingProgress} />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Features Explored</span>
                      <span>{user.featuresExplored}/{user.totalFeatures}</span>
                    </div>
                    <Progress value={(user.featuresExplored / user.totalFeatures) * 100} />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>Time Spent</span>
                    <span className="font-medium">{formatTime(user.timeSpent)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>Last Active</span>
                    <span className="text-gray-600">{user.lastActive}</span>
                  </div>

                  {user.achievements.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Achievements</div>
                      <div className="flex flex-wrap gap-1">
                        {user.achievements.map((achievement, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.strugglingWith.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-red-600">Needs Help With</div>
                      <div className="space-y-1">
                        {user.strugglingWith.map((item, index) => (
                          <div key={index} className="text-xs text-red-600 flex items-center">
                            <HelpCircle className="h-3 w-3 mr-1" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-medium mb-2">Recommended Next Steps</div>
                    <div className="space-y-1">
                      {user.nextRecommendations.slice(0, 2).map((rec, index) => (
                        <div key={index} className="text-xs text-blue-600 flex items-center">
                          <ArrowRight className="h-3 w-3 mr-1" />
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Feature Adoption Analytics</span>
              </CardTitle>
              <CardDescription>
                Detailed insights into how users interact with platform features
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics && (
                <div className="space-y-6">
                  {Object.entries(metrics.featureAdoption).map(([feature, adoption]) => (
                    <div key={feature} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium capitalize">
                            {feature.replace(/-/g, ' ')}
                          </div>
                          <div className="text-sm text-gray-600">
                            {adoption >= 80 ? 'High adoption - users find this very valuable' :
                             adoption >= 60 ? 'Good adoption - some users may need guidance' :
                             'Low adoption - may need better onboarding or UX improvements'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{adoption}%</div>
                          <div className="text-sm text-gray-500">of active users</div>
                        </div>
                      </div>
                      <Progress value={adoption} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interventions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>AI Intervention Analytics</span>
              </CardTitle>
              <CardDescription>
                How proactive assistance improves user experience and success rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Intervention Types</h3>
                  {[
                    { type: 'Contextual Help', count: 34, success: 88 },
                    { type: 'Feature Suggestions', count: 28, success: 75 },
                    { type: 'Onboarding Guidance', count: 22, success: 95 },
                    { type: 'Error Prevention', count: 18, success: 82 },
                    { type: 'Workflow Optimization', count: 12, success: 67 }
                  ].map((intervention, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{intervention.type}</div>
                        <div className="text-sm text-gray-600">{intervention.count} interventions</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">{intervention.success}%</div>
                        <div className="text-xs text-gray-500">success rate</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Impact Metrics</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">34%</div>
                      <div className="text-sm">Reduction in support tickets</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">42%</div>
                      <div className="text-sm">Increase in task completion</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">28%</div>
                      <div className="text-sm">Faster feature adoption</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">56%</div>
                      <div className="text-sm">Improvement in user satisfaction</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Interactive Onboarding Modal */}
      {showOnboarding && (
        <InteractiveOnboarding
          userId={currentUser.id}
          onComplete={(data) => {
            console.log('Onboarding completed:', data)
            setShowOnboarding(false)
          }}
          onSkip={() => setShowOnboarding(false)}
        />
      )}

      {/* Contextual Help System */}
      <ContextualHelp
        userId={currentUser.id}
        currentPage="engagement-dashboard"
        userContext={{
          role: currentUser.role,
          experience: 'intermediate',
          timeOnPage: Date.now(),
          lastAction: 'viewing_dashboard'
        }}
      />
    </div>
  )
}