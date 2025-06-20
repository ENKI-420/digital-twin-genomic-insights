import { Redis } from "@upstash/redis"
import { platformCore } from "./platform-core"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// User Engagement Interfaces
export interface UserProfile {
  userId: string
  tenantId: string
  role: 'clinician' | 'researcher' | 'admin' | 'patient' | 'analyst'
  experience: 'novice' | 'intermediate' | 'expert'
  preferences: {
    learningStyle: 'visual' | 'hands-on' | 'guided' | 'exploratory'
    contentDensity: 'minimal' | 'balanced' | 'comprehensive'
    interactionStyle: 'step-by-step' | 'contextual' | 'autonomous'
    notificationFrequency: 'minimal' | 'moderate' | 'frequent'
  }
  demographics: {
    specialty?: string
    yearsExperience?: number
    organizationSize?: 'small' | 'medium' | 'large' | 'enterprise'
    primaryUseCase?: string[]
  }
  engagementHistory: {
    featuresUsed: string[]
    timeSpentByFeature: Record<string, number>
    completedOnboarding: string[]
    abandonedFlows: string[]
    lastActiveDate: string
    totalSessionTime: number
    preferredTimeOfDay: string
  }
}

export interface EngagementAction {
  id: string
  type: 'tooltip' | 'tutorial' | 'recommendation' | 'notification' | 'guided_tour' | 'contextual_help'
  trigger: 'landing' | 'feature_access' | 'idle' | 'error' | 'completion' | 'time_based'
  content: {
    title: string
    description: string
    mediaType: 'text' | 'video' | 'interactive' | 'animation'
    mediaUrl?: string
    duration?: number
    complexity: 'beginner' | 'intermediate' | 'advanced'
  }
  targeting: {
    roles: string[]
    experience: string[]
    features: string[]
    conditions: any[]
  }
  priority: number
  frequency: 'once' | 'daily' | 'weekly' | 'session' | 'contextual'
}

export interface PersonalizedRecommendation {
  id: string
  userId: string
  type: 'feature_suggestion' | 'workflow_optimization' | 'learning_resource' | 'use_case' | 'integration'
  title: string
  description: string
  rationale: string
  confidence: number
  category: string
  estimatedValue: {
    timesSaved?: number
    accuracyImprovement?: number
    efficiencyGain?: number
  }
  actionRequired: {
    effort: 'low' | 'medium' | 'high'
    timeToComplete: number
    prerequisites: string[]
  }
  expiresAt?: string
}

export interface EngagementMetrics {
  userId: string
  sessionId: string
  metrics: {
    sessionDuration: number
    featuresExplored: number
    actionsCompleted: number
    helpRequestsCount: number
    errorEncountered: number
    satisfactionScore?: number
    taskCompletionRate: number
    returnVisitLikelihood: number
  }
  behaviorPatterns: {
    navigationStyle: 'linear' | 'exploratory' | 'goal_oriented'
    learningPreference: 'discovery' | 'guidance' | 'documentation'
    engagementLevel: 'high' | 'medium' | 'low'
    strugglingAreas: string[]
    masteredFeatures: string[]
  }
}

export interface InteractiveGuidance {
  id: string
  name: string
  description: string
  steps: GuidanceStep[]
  estimatedDuration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prerequisites: string[]
  outcomes: string[]
}

export interface GuidanceStep {
  id: string
  title: string
  description: string
  action: 'click' | 'input' | 'navigate' | 'observe' | 'wait'
  target?: string
  expectedResult: string
  tips?: string[]
  alternatives?: string[]
}

// AI-Powered Engagement Engine
export class EngagementEngine {
  private redis: Redis
  private version: string

  constructor() {
    this.redis = redis
    this.version = process.env.ENGAGEMENT_ENGINE_VERSION || 'v1.0.0'
  }

  // AI-Enhanced Landing Experience
  async generateLandingExperience(
    tenantId: string,
    userId: string,
    sessionContext: {
      isFirstVisit: boolean
      referralSource?: string
      userAgent: string
      timeOfDay: string
      previousSession?: any
    }
  ): Promise<{
    personalizedGreeting: string
    recommendedStartingPoint: string
    quickActions: any[]
    contextualTips: string[]
    estimatedJourneyTime: number
  }> {
    try {
      // Get or create user profile
      const userProfile = await this.getUserProfile(userId) || await this.createInitialProfile(userId, tenantId, sessionContext)

      // Generate AI-powered personalized greeting
      const personalizedGreeting = await this.generatePersonalizedGreeting(userProfile, sessionContext)

      // Determine optimal starting point based on user profile and context
      const recommendedStartingPoint = await this.determineStartingPoint(userProfile, sessionContext)

      // Generate contextual quick actions
      const quickActions = await this.generateQuickActions(userProfile, sessionContext)

      // Create contextual tips based on user's likely needs
      const contextualTips = await this.generateContextualTips(userProfile, sessionContext)

      // Estimate journey time based on user profile and goals
      const estimatedJourneyTime = await this.estimateJourneyTime(userProfile, recommendedStartingPoint)

      // Log engagement event
      await this.logEngagementEvent(userId, 'landing_experience_generated', {
        startingPoint: recommendedStartingPoint,
        quickActionsCount: quickActions.length,
        estimatedTime: estimatedJourneyTime
      })

      return {
        personalizedGreeting,
        recommendedStartingPoint,
        quickActions,
        contextualTips,
        estimatedJourneyTime
      }

    } catch (error) {
      console.error('Landing experience generation failed:', error)
      return this.getFallbackLandingExperience()
    }
  }

  // Proactive AI Assistant
  async getProactiveAssistance(
    userId: string,
    currentContext: {
      currentPage: string
      timeOnPage: number
      lastAction: string
      errorState?: any
      taskInProgress?: string
    }
  ): Promise<{
    shouldIntervene: boolean
    interventionType: 'help' | 'suggestion' | 'tutorial' | 'encouragement'
    message: string
    actionButtons: any[]
    priority: 'low' | 'medium' | 'high'
  }> {
    try {
      const userProfile = await this.getUserProfile(userId)
      if (!userProfile) throw new Error('User profile not found')

      // AI analysis of user behavior patterns
      const behaviorAnalysis = await this.analyzeBehaviorPatterns(userProfile, currentContext)

      // Determine if intervention is needed
      const interventionNeeded = await this.shouldIntervene(behaviorAnalysis, currentContext)

      if (!interventionNeeded.should) {
        return {
          shouldIntervene: false,
          interventionType: 'help',
          message: '',
          actionButtons: [],
          priority: 'low'
        }
      }

      // Generate contextual assistance
      const assistance = await this.generateContextualAssistance(
        userProfile,
        currentContext,
        interventionNeeded.reason
      )

      // Log proactive intervention
      await this.logEngagementEvent(userId, 'proactive_assistance_offered', {
        context: currentContext,
        interventionType: assistance.interventionType,
        reason: interventionNeeded.reason
      })

      return assistance

    } catch (error) {
      console.error('Proactive assistance failed:', error)
      return {
        shouldIntervene: false,
        interventionType: 'help',
        message: '',
        actionButtons: [],
        priority: 'low'
      }
    }
  }

  // Dynamic Content Personalization
  async personalizeContent(
    userId: string,
    contentType: 'dashboard' | 'feature_list' | 'tutorials' | 'recommendations',
    baseContent: any[]
  ): Promise<{
    personalizedContent: any[]
    reasoning: string[]
    adaptationsMade: string[]
  }> {
    try {
      const userProfile = await this.getUserProfile(userId)
      if (!userProfile) return { personalizedContent: baseContent, reasoning: [], adaptationsMade: [] }

      let personalizedContent = [...baseContent]
      const reasoning: string[] = []
      const adaptationsMade: string[] = []

      // Role-based filtering
      personalizedContent = await this.applyRoleBasedFiltering(personalizedContent, userProfile)
      adaptationsMade.push('role_based_filtering')
      reasoning.push(`Filtered content for ${userProfile.role} role`)

      // Experience level adaptation
      personalizedContent = await this.adaptForExperienceLevel(personalizedContent, userProfile)
      adaptationsMade.push('experience_adaptation')
      reasoning.push(`Adapted for ${userProfile.experience} experience level`)

      // Usage pattern optimization
      const usagePatterns = await this.analyzeUsagePatterns(userProfile)
      personalizedContent = await this.optimizeForUsagePatterns(personalizedContent, usagePatterns)
      adaptationsMade.push('usage_optimization')
      reasoning.push('Optimized based on historical usage patterns')

      // Preference-based ordering
      personalizedContent = await this.reorderByPreferences(personalizedContent, userProfile)
      adaptationsMade.push('preference_ordering')
      reasoning.push('Reordered based on user preferences')

      // Add personalized recommendations
      const recommendations = await this.generatePersonalizedRecommendations(userId)
      if (recommendations.length > 0) {
        personalizedContent = await this.integrateRecommendations(personalizedContent, recommendations)
        adaptationsMade.push('recommendation_integration')
        reasoning.push(`Added ${recommendations.length} personalized recommendations`)
      }

      return {
        personalizedContent,
        reasoning,
        adaptationsMade
      }

    } catch (error) {
      console.error('Content personalization failed:', error)
      return { personalizedContent: baseContent, reasoning: [], adaptationsMade: [] }
    }
  }

  // Interactive Tutorial System
  async generateInteractiveTutorial(
    userId: string,
    featureId: string,
    userContext?: any
  ): Promise<InteractiveGuidance> {
    try {
      const userProfile = await this.getUserProfile(userId)
      const feature = await this.getFeatureDefinition(featureId)

      if (!userProfile || !feature) {
        throw new Error('Required data not found')
      }

      // Generate adaptive tutorial based on user profile
      const tutorial = await this.createAdaptiveTutorial(userProfile, feature, userContext)

      // Log tutorial generation
      await this.logEngagementEvent(userId, 'tutorial_generated', {
        featureId,
        difficulty: tutorial.difficulty,
        stepCount: tutorial.steps.length,
        estimatedDuration: tutorial.estimatedDuration
      })

      return tutorial

    } catch (error) {
      console.error('Tutorial generation failed:', error)
      return this.getFallbackTutorial(featureId)
    }
  }

  // Progressive Feature Disclosure
  async getProgressiveDisclosure(
    userId: string,
    currentFeatureSet: string[]
  ): Promise<{
    readyForAdvanced: string[]
    suggestedNext: string[]
    prerequisites: Record<string, string[]>
    learningPath: string[]
  }> {
    try {
      const userProfile = await this.getUserProfile(userId)
      if (!userProfile) throw new Error('User profile required')

      // Analyze user's mastery of current features
      const masteryAnalysis = await this.analyzeFeatMastery(userProfile, currentFeatureSet)

      // Determine which advanced features user is ready for
      const readyForAdvanced = await this.identifyReadyAdvancedFeatures(masteryAnalysis)

      // Generate suggested next steps
      const suggestedNext = await this.generateNextStepSuggestions(userProfile, masteryAnalysis)

      // Map prerequisites for advanced features
      const prerequisites = await this.mapPrerequisites(readyForAdvanced)

      // Create optimal learning path
      const learningPath = await this.generateLearningPath(userProfile, suggestedNext)

      return {
        readyForAdvanced,
        suggestedNext,
        prerequisites,
        learningPath
      }

    } catch (error) {
      console.error('Progressive disclosure failed:', error)
      return {
        readyForAdvanced: [],
        suggestedNext: [],
        prerequisites: {},
        learningPath: []
      }
    }
  }

  // Behavioral Analytics and Adaptation
  async recordUserBehavior(
    userId: string,
    sessionId: string,
    behaviorData: {
      action: string
      context: any
      timestamp: string
      outcome: 'success' | 'error' | 'abandoned'
      duration?: number
    }
  ): Promise<void> {
    try {
      // Store behavior data
      await this.redis.lpush(
        `user_behavior:${userId}`,
        JSON.stringify({
          sessionId,
          ...behaviorData,
          recordedAt: new Date().toISOString()
        })
      )

      // Keep only last 1000 behaviors per user
      await this.redis.ltrim(`user_behavior:${userId}`, 0, 999)

      // Update user profile based on behavior
      await this.updateProfileFromBehavior(userId, behaviorData)

      // Check for adaptation triggers
      await this.checkAdaptationTriggers(userId, behaviorData)

    } catch (error) {
      console.error('Behavior recording failed:', error)
    }
  }

  // Gamification and Achievement System
  async getGamificationElements(
    userId: string
  ): Promise<{
    currentLevel: number
    xpPoints: number
    nextLevelXP: number
    achievements: any[]
    availableChallenges: any[]
    leaderboardPosition?: number
    streaks: any[]
  }> {
    try {
      const userProfile = await this.getUserProfile(userId)
      const gamificationData = await this.getGamificationData(userId)

      return {
        currentLevel: gamificationData.level || 1,
        xpPoints: gamificationData.xp || 0,
        nextLevelXP: this.calculateNextLevelXP(gamificationData.level || 1),
        achievements: await this.getUserAchievements(userId),
        availableChallenges: await this.getAvailableChallenges(userId, userProfile),
        leaderboardPosition: await this.getLeaderboardPosition(userId),
        streaks: await this.getUserStreaks(userId)
      }

    } catch (error) {
      console.error('Gamification elements failed:', error)
      return {
        currentLevel: 1,
        xpPoints: 0,
        nextLevelXP: 100,
        achievements: [],
        availableChallenges: [],
        streaks: []
      }
    }
  }

  // Private helper methods
  private async getUserProfile(userId: string): Promise<UserProfile | null> {
    const cached = await this.redis.get(`user_profile:${userId}`)
    return cached ? JSON.parse(cached as string) : null
  }

  private async createInitialProfile(
    userId: string,
    tenantId: string,
    sessionContext: any
  ): Promise<UserProfile> {
    const profile: UserProfile = {
      userId,
      tenantId,
      role: 'clinician', // Default, will be updated
      experience: 'novice',
      preferences: {
        learningStyle: 'guided',
        contentDensity: 'balanced',
        interactionStyle: 'step-by-step',
        notificationFrequency: 'moderate'
      },
      demographics: {},
      engagementHistory: {
        featuresUsed: [],
        timeSpentByFeature: {},
        completedOnboarding: [],
        abandonedFlows: [],
        lastActiveDate: new Date().toISOString(),
        totalSessionTime: 0,
        preferredTimeOfDay: sessionContext.timeOfDay
      }
    }

    await this.redis.setex(`user_profile:${userId}`, 86400 * 30, JSON.stringify(profile))
    return profile
  }

  private async generatePersonalizedGreeting(
    userProfile: UserProfile,
    sessionContext: any
  ): Promise<string> {
    const timeOfDay = this.getTimeOfDayGreeting(sessionContext.timeOfDay)
    const roleSpecific = this.getRoleSpecificGreeting(userProfile.role)

    if (sessionContext.isFirstVisit) {
      return `${timeOfDay}! Welcome to the AI-driven personalized medicine platform. ${roleSpecific}`
    } else {
      const lastVisit = new Date(userProfile.engagementHistory.lastActiveDate)
      const daysSinceLastVisit = Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceLastVisit === 0) {
        return `Welcome back! Ready to continue where you left off?`
      } else if (daysSinceLastVisit === 1) {
        return `${timeOfDay}! Great to see you back. Let's dive into your healthcare AI toolkit.`
      } else {
        return `${timeOfDay}! It's been ${daysSinceLastVisit} days since your last visit. Here's what's new...`
      }
    }
  }

  private async determineStartingPoint(
    userProfile: UserProfile,
    sessionContext: any
  ): Promise<string> {
    // AI logic to determine optimal starting point
    if (sessionContext.isFirstVisit) {
      switch (userProfile.role) {
        case 'clinician':
          return 'clinical-decision-support'
        case 'researcher':
          return 'mutation-analysis'
        case 'admin':
          return 'platform-dashboard'
        case 'analyst':
          return 'analytics-overview'
        default:
          return 'platform-overview'
      }
    }

    // Return to last used feature or most relevant feature
    const mostUsedFeature = Object.entries(userProfile.engagementHistory.timeSpentByFeature)
      .sort(([,a], [,b]) => b - a)[0]?.[0]

    return mostUsedFeature || 'dashboard'
  }

  private async generateQuickActions(
    userProfile: UserProfile,
    sessionContext: any
  ): Promise<any[]> {
    const actions = []

    // Role-based quick actions
    switch (userProfile.role) {
      case 'clinician':
        actions.push(
          { id: 'quick-diagnosis', label: 'Quick Clinical Assessment', icon: 'stethoscope' },
          { id: 'patient-lookup', label: 'Patient Lookup', icon: 'search' },
          { id: 'drug-interaction', label: 'Check Drug Interactions', icon: 'pill' }
        )
        break
      case 'researcher':
        actions.push(
          { id: 'mutation-analysis', label: 'Analyze Mutations', icon: 'dna' },
          { id: 'trial-matching', label: 'Find Clinical Trials', icon: 'flask' },
          { id: 'population-study', label: 'Population Analytics', icon: 'chart' }
        )
        break
      case 'admin':
        actions.push(
          { id: 'tenant-overview', label: 'Tenant Status', icon: 'building' },
          { id: 'usage-analytics', label: 'Usage Analytics', icon: 'bar-chart' },
          { id: 'compliance-check', label: 'Compliance Status', icon: 'shield' }
        )
        break
    }

    // Add contextual actions based on time and usage patterns
    if (sessionContext.timeOfDay === 'morning') {
      actions.push({ id: 'daily-summary', label: 'Daily Summary', icon: 'sunrise' })
    }

    return actions.slice(0, 4) // Limit to 4 quick actions
  }

  private async generateContextualTips(
    userProfile: UserProfile,
    sessionContext: any
  ): Promise<string[]> {
    const tips = []

    // Experience-based tips
    if (userProfile.experience === 'novice') {
      tips.push(
        "💡 Start with the guided tour to familiarize yourself with core features",
        "🎯 Use the quick actions above for common tasks",
        "❓ Click the help icon (?) next to any feature for instant guidance"
      )
    } else if (userProfile.experience === 'intermediate') {
      tips.push(
        "⚡ Try keyboard shortcuts to speed up your workflow",
        "🔄 Enable auto-sync with your EHR for real-time data updates",
        "📊 Check out advanced analytics for deeper insights"
      )
    } else {
      tips.push(
        "🚀 Explore API integrations for custom workflows",
        "🧪 Try experimental features in the labs section",
        "👥 Share your insights with the community"
      )
    }

    // Role-specific tips
    if (userProfile.role === 'clinician') {
      tips.push("🏥 Your clinical decision support accuracy improves with each use")
    }

    return tips.slice(0, 3)
  }

  private async estimateJourneyTime(
    userProfile: UserProfile,
    startingPoint: string
  ): Promise<number> {
    // AI-based time estimation based on user profile and starting point
    const baseTime = {
      'clinical-decision-support': 5,
      'mutation-analysis': 10,
      'platform-dashboard': 3,
      'analytics-overview': 7,
      'platform-overview': 2
    }

    const experienceMultiplier = {
      'novice': 1.5,
      'intermediate': 1.0,
      'expert': 0.7
    }

    return Math.round(
      (baseTime[startingPoint as keyof typeof baseTime] || 5) *
      experienceMultiplier[userProfile.experience]
    )
  }

  private getFallbackLandingExperience(): any {
    return {
      personalizedGreeting: "Welcome to the AI-driven personalized medicine platform!",
      recommendedStartingPoint: 'platform-overview',
      quickActions: [
        { id: 'overview', label: 'Platform Overview', icon: 'home' },
        { id: 'help', label: 'Get Help', icon: 'help-circle' }
      ],
      contextualTips: ["Explore the platform at your own pace"],
      estimatedJourneyTime: 5
    }
  }

  private getTimeOfDayGreeting(timeOfDay: string): string {
    const hour = parseInt(timeOfDay.split(':')[0])
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  private getRoleSpecificGreeting(role: string): string {
    const greetings = {
      clinician: "Ready to enhance your clinical decision-making with AI?",
      researcher: "Let's explore the latest genomic insights together.",
      admin: "Your platform analytics and management tools await.",
      patient: "Your personalized health journey starts here.",
      analyst: "Dive into comprehensive healthcare analytics and insights."
    }
    return greetings[role as keyof typeof greetings] || "Let's get started!"
  }

  private async logEngagementEvent(userId: string, event: string, data: any): Promise<void> {
    await this.redis.lpush(
      `engagement_events:${userId}`,
      JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString()
      })
    )
    await this.redis.expire(`engagement_events:${userId}`, 86400 * 30) // 30 days
  }

  private async shouldIntervene(behaviorAnalysis: any, currentContext: any): Promise<{ should: boolean; reason?: string }> {
    // Time on page without action
    if (currentContext.timeOnPage > 30000 && currentContext.lastAction === 'none') {
      return { should: true, reason: 'idle_too_long' }
    }

    // Error state detected
    if (currentContext.errorState) {
      return { should: true, reason: 'error_encountered' }
    }

    // Complex feature accessed by novice user
    if (behaviorAnalysis.userExperience === 'novice' && this.isComplexFeature(currentContext.currentPage)) {
      return { should: true, reason: 'complex_feature_novice' }
    }

    return { should: false }
  }

  private isComplexFeature(page: string): boolean {
    const complexFeatures = [
      'mutation-analysis',
      'advanced-analytics',
      'api-configuration',
      'tenant-management'
    ]
    return complexFeatures.includes(page)
  }

  private async generateContextualAssistance(
    userProfile: UserProfile,
    currentContext: any,
    reason: string
  ): Promise<any> {
    const assistanceMap = {
      idle_too_long: {
        interventionType: 'suggestion' as const,
        message: "It looks like you might be looking for something specific. Would you like me to help you find it?",
        actionButtons: [
          { label: "Show me around", action: "start_tour" },
          { label: "I'm fine, thanks", action: "dismiss" }
        ],
        priority: 'medium' as const
      },
      error_encountered: {
        interventionType: 'help' as const,
        message: "I noticed you encountered an issue. Let me help you resolve it.",
        actionButtons: [
          { label: "Get help", action: "show_help" },
          { label: "Try alternative", action: "suggest_alternative" }
        ],
        priority: 'high' as const
      },
      complex_feature_novice: {
        interventionType: 'tutorial' as const,
        message: "This is a powerful feature! Would you like a quick walkthrough to get you started?",
        actionButtons: [
          { label: "Yes, show me", action: "start_tutorial" },
          { label: "I'll explore on my own", action: "dismiss" }
        ],
        priority: 'medium' as const
      }
    }

    return assistanceMap[reason as keyof typeof assistanceMap] || {
      interventionType: 'help' as const,
      message: "Need any assistance?",
      actionButtons: [{ label: "Get help", action: "show_help" }],
      priority: 'low' as const
    }
  }
}

// Export singleton
export const engagementEngine = new EngagementEngine()