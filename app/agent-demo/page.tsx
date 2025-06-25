"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { TrialMatchWidget } from '@/components/ai/trial-match-widget'
import { ReportShare } from '@/components/ai/report-share'
import { DeployEpicButton } from '@/components/ai/deploy-epic-button'
import {
  Send,
  Brain,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Shield,
  Play,
  Share2,
  Download,
  ExternalLink,
  Copy,
  Users,
  Stethoscope,
  FlaskConical,
  TrendingUp,
  Globe,
  Rocket,
  Eye,
  ArrowRight,
  Star,
  Activity,
  Smartphone,
  Code,
  BarChart3,
  Heart,
  Dna
} from 'lucide-react'
import Link from 'next/link'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  responseTime?: number
  sources?: string[]
  confidence?: number
}

export default function AgentDemoPage() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '👋 Welcome to AGILE Agent! I\'m your AI-powered clinical decision support assistant. Ask me anything about genomics, clinical trials, or patient care in plain English.\n\n**Try asking:** "Find CAR-T trials for my B-cell lymphoma patient" or "What does this BRCA1 mutation mean?"',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const [shareUrl, setShareUrl] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [visitors, setVisitors] = useState(1247)
  const [demos, setDemos] = useState(156)

  // Simulate AI response
  const simulateAIResponse = async (userMessage: string) => {
    setIsTyping(true)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))

    let response = ''
    let sources: string[] = []
    let confidence = 0

    // Mock responses based on user input
    if (userMessage.toLowerCase().includes('trial') || userMessage.toLowerCase().includes('car-t')) {
      response = `🎯 **Found 3 high-confidence CAR-T trial matches**

**Top Recommendation: Johns Hopkins Phase III Study**
• **94% match confidence** for CD19+ B-cell lymphoma
• Location: Baltimore, MD (12 miles)
• Contact: Dr. Sarah Chen, (410) 555-0123
• Status: Actively enrolling

**Key Eligibility Factors:**
✅ CD19 expression confirmed
✅ Adequate organ function
✅ No active CNS involvement
⚠️ Verify insurance coverage for cell therapy

**Next Steps:**
• Generate referral letter automatically
• Schedule patient consultation
• Pre-populate enrollment forms

Would you like me to create a shareable trial summary for this patient?`
      sources = ['ClinicalTrials.gov', 'NCCN Guidelines v3.2024', 'FDA CAR-T Database']
      confidence = 94
    } else if (userMessage.toLowerCase().includes('cyp') || userMessage.toLowerCase().includes('drug')) {
      response = `💊 **Pharmacogenomic Analysis Complete**

**CYP2D6 Poor Metabolizer Detected**

**Critical Drug Interactions:**
🚨 **Avoid:** Codeine, tramadol (no analgesic effect)
⚠️ **Reduce by 50%:** Metoprolol, propranolol
✅ **Safe alternatives:** Morphine, oxycodone

**Dosing Recommendations:**
• Start with 25% of standard dose for CYP2D6 substrates
• Monitor closely for efficacy and side effects
• Consider therapeutic drug monitoring

**CDS Alert Generated:** This will appear in Epic when prescribing affected medications.

Need me to update the patient's medication profile?`
      sources = ['CPIC Guidelines', 'PharmGKB Database', 'FDA Drug Interactions']
      confidence = 96
    } else if (userMessage.toLowerCase().includes('biomarker') || userMessage.toLowerCase().includes('brca') || userMessage.toLowerCase().includes('mutation')) {
      response = `🧬 **Biomarker Analysis Complete**

**BRCA1 c.5266dupC - Pathogenic Variant**

**Clinical Implications:**
🎯 **High Priority:** PARP inhibitor therapy strongly indicated
📈 **Survival Benefit:** 40% improvement in progression-free survival
👨‍👩‍👧 **Family Impact:** 50% risk for first-degree relatives

**Treatment Recommendations:**
• **First-line:** Olaparib + chemotherapy combination
• **Monitoring:** CA-125, radiographic assessment q8 weeks
• **Duration:** Continue until progression or toxicity

**Care Coordination:**
• Genetic counseling referral (scheduled)
• Fertility preservation discussion if applicable
• Family screening recommendations

Would you like me to generate a patient education summary?`
      sources = ['OncoKB', 'ClinVar Database', 'NCCN Genetic Testing Guidelines']
      confidence = 91
    } else if (userMessage.toLowerCase().includes('share') || userMessage.toLowerCase().includes('report')) {
      response = `📤 **Report Sharing Made Easy**

I can help you create secure, HIPAA-compliant shareable links for:

**📋 Patient Summaries**
• Genomic analysis reports
• Trial eligibility summaries
• Treatment recommendations
• Progress notes

**🔐 Security Features**
• Automatic expiration (1 hour to 30 days)
• View/download tracking
• Password protection optional
• Audit trail for compliance

**📊 Analytics Included**
• Real-time access monitoring
• Geographic viewer data
• Device/browser tracking
• Download statistics

Click the "Reports & Sharing" tab above to try creating a shareable link!`
      sources = ['HIPAA Compliance Guide', 'Epic Integration Standards']
      confidence = 100
    } else {
      response = `🤖 **I'm here to help with clinical decision support!**

**Popular Queries:**
💊 "Check drug interactions for CYP2D6 poor metabolizer"
🧬 "Interpret this BRCA1/2 test result"
🎯 "Find immunotherapy trials for lung cancer"
📊 "What's the prognosis for this genetic variant?"
🔍 "Search for targeted therapy options"

**Try a natural language question like:**
"My patient has a TP53 mutation - what treatment options do we have?"

**Or explore the tabs above:**
• **Trial Matching** - AI-powered clinical trial discovery
• **CDS Alerts** - Real-time decision support simulation
• **Reports & Sharing** - HIPAA-compliant collaboration tools

What would you like to know about your patient's case?`
      sources = ['AGILE Knowledge Base', 'Clinical Practice Guidelines']
      confidence = 100
    }

    const responseTime = Math.round(2100 + Math.random() * 400) // 2.1-2.5 seconds

    setChatMessages(prev => [...prev, {
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      responseTime,
      sources,
      confidence
    }])

    setIsTyping(false)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setInputMessage('')

    await simulateAIResponse(inputMessage)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const generateShareUrl = () => {
    const url = `${window.location.origin}/agent-demo?share=${Date.now()}`
    setShareUrl(url)
    setShowShareModal(true)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setVisitors(prev => prev + Math.floor(Math.random() * 3))
      setDemos(prev => prev + (Math.random() > 0.7 ? 1 : 0))
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Demo Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-iris-500 to-iris-800 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                A
              </div>
              <div>
                <h1 className="text-xl font-bold text-iris-600">AGILE Agent Demo</h1>
                <p className="text-sm text-gray-600">ChatGPT for Clinical Trials - No Login Required</p>
              </div>
              <Badge className="bg-green-100 text-green-700 animate-pulse">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Live Demo
              </Badge>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{visitors.toLocaleString()} visitors</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  <span>{demos} demos active</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={generateShareUrl}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <DeployEpicButton size="sm" showFeatures={false} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-iris-500 to-iris-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-2">
            ChatGPT for Clinical Trials + Biomarker Insights
          </h2>
          <p className="text-lg opacity-90 mb-4">
            Get Clinical Decision Support in 30 seconds. Try it now - no login required.
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>2.1s avg response</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>94% accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>HIPAA compliant</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="trials" className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Trial Matching
            </TabsTrigger>
            <TabsTrigger value="cds" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              CDS Alerts
            </TabsTrigger>
            <TabsTrigger value="share" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Reports & Sharing
            </TabsTrigger>
          </TabsList>

          {/* AI Chat Interface */}
          <TabsContent value="chat" className="space-y-4">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-iris-500" />
                  Clinical AI Assistant
                  <Badge variant="outline" className="ml-auto">
                    Demo Patient: DEMO-0001
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600">Ask natural language questions about genomics, trials, and patient care</p>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {chatMessages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${
                        message.role === 'user'
                          ? 'bg-iris-500 text-white rounded-l-lg rounded-tr-lg'
                          : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg'
                      } p-4`}>
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>

                        {message.role === 'assistant' && (
                          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600 space-y-1">
                            {message.responseTime && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span>Response time: {message.responseTime}ms</span>
                                {message.confidence && (
                                  <>
                                    <span>•</span>
                                    <span>Confidence: {message.confidence}%</span>
                                  </>
                                )}
                              </div>
                            )}
                            {message.sources && message.sources.length > 0 && (
                              <div className="flex items-start gap-2">
                                <Shield className="h-3 w-3 mt-0.5" />
                                <span>Sources: {message.sources.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="text-xs opacity-70 mt-2">
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-r-lg rounded-tl-lg p-4 max-w-[80%]">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-sm text-gray-600">AGILE Agent is analyzing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage("Find CAR-T trials for B-cell lymphoma patient")}
                    disabled={isTyping}
                  >
                    🎯 Find CAR-T Trials
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage("What does BRCA1 mutation mean for treatment?")}
                    disabled={isTyping}
                  >
                    🧬 Interpret BRCA1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage("Check CYP2D6 drug interactions")}
                    disabled={isTyping}
                  >
                    💊 Drug Interactions
                  </Button>
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about genomics, clinical trials, drug interactions..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-iris-500 hover:bg-iris-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trial Matching Widget */}
          <TabsContent value="trials" className="space-y-4">
            <TrialMatchWidget
              patientId="DEMO-0001"
              maxResults={5}
              showFilters={true}
            />

            {/* Widget Embed Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-purple-600" />
                  Embed This Widget
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Add trial matching to any EHR or website with this simple iframe
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto">
{`<iframe
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/components/trial-match-widget?patientId=DEMO-0001"
  width="100%"
  height="600"
  frameborder="0">
</iframe>`}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => copyToClipboard(`<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/components/trial-match-widget?patientId=DEMO-0001" width="100%" height="600" frameborder="0"></iframe>`)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Preview Widget
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CDS Hooks Simulation */}
          <TabsContent value="cds" className="space-y-4">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                    CDS Hooks Demo
                    <Badge variant="outline" className="ml-auto">
                      Epic Integration
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Real-time clinical decision support alerts as they appear in Epic EHR
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Drug-Gene Interaction Alert */}
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-semibold text-orange-800">⚠️ Drug-Gene Interaction Warning</p>
                        <p className="text-sm">
                          Patient DEMO-0001 is a <strong>CYP2D6 poor metabolizer</strong>. Consider reducing tramadol dose by 50% or switching to morphine.
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="text-orange-700 border-orange-300">
                            View Alternatives
                          </Button>
                          <Button size="sm" variant="outline" className="text-orange-700 border-orange-300">
                            Adjust Dose
                          </Button>
                          <Button size="sm" variant="outline" className="text-orange-700 border-orange-300">
                            Override Alert
                          </Button>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {/* Trial Eligibility Alert */}
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-semibold text-green-800">🎯 Clinical Trial Opportunity</p>
                        <p className="text-sm">
                          Patient matches criteria for <strong>3 open CAR-T studies</strong>. Highest match: 94% for Johns Hopkins Phase III trial.
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="text-green-700 border-green-300">
                            View Trials
                          </Button>
                          <Button size="sm" variant="outline" className="text-green-700 border-green-300">
                            Generate Referral
                          </Button>
                          <Button size="sm" variant="outline" className="text-green-700 border-green-300">
                            Contact PI
                          </Button>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {/* Biomarker Alert */}
                  <Alert className="border-blue-200 bg-blue-50">
                    <Dna className="h-4 w-4 text-blue-600" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-semibold text-blue-800">🧬 New Biomarker Result</p>
                        <p className="text-sm">
                          <strong>BRCA1 pathogenic variant</strong> detected. Consider PARP inhibitor therapy and genetic counseling referral.
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                            View Report
                          </Button>
                          <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                            Order PARP Inhibitor
                          </Button>
                          <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                            Refer Genetics
                          </Button>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {/* Mobile Notification Simulation */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-purple-600" />
                        Mobile Push Notifications
                      </h4>
                      <div className="space-y-2">
                        <div className="bg-white border rounded-lg p-3 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-iris-500 rounded-lg flex items-center justify-center">
                              <Heart className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">AGILE Agent</p>
                              <p className="text-sm text-gray-600">Critical finding for Patient DEMO-0001</p>
                              <p className="text-xs text-gray-500">2 minutes ago</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Real-time notifications sent via Firebase Cloud Messaging
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports & Sharing */}
          <TabsContent value="share" className="space-y-4">
            <ReportShare
              reportId="RPT-2024-001"
              patientId="DEMO-0001"
              reportTitle="Comprehensive Genomic Analysis Report"
              reportSummary="BRCA1 pathogenic variant with treatment recommendations and clinical trial eligibility analysis."
            />
          </TabsContent>
        </Tabs>

        {/* Deploy to Epic CTA */}
        <Card className="mt-8 bg-gradient-to-r from-iris-500 to-iris-800 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Deploy to Your Epic Environment?</h2>
            <p className="text-lg opacity-90 mb-6">
              5-minute setup • Zero IT overhead • 30-day free trial
            </p>
            <div className="flex justify-center gap-4">
              <DeployEpicButton size="xl" showFeatures={false} />
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-iris-600">
                <Users className="mr-2 h-5 w-5" />
                Request Demo Call
              </Button>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-white/20">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-80" />
                <h3 className="font-semibold">5-Min Setup</h3>
                <p className="text-sm opacity-80">Automated deployment</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-80" />
                <h3 className="font-semibold">Enterprise Security</h3>
                <p className="text-sm opacity-80">SOC 2, HIPAA compliant</p>
              </div>
              <div className="text-center">
                <Star className="h-8 w-8 mx-auto mb-2 opacity-80" />
                <h3 className="font-semibold">Epic Certified</h3>
                <p className="text-sm opacity-80">App Orchard partner</p>
              </div>
              <div className="text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-80" />
                <h3 className="font-semibold">94% Accuracy</h3>
                <p className="text-sm opacity-80">AI-powered matching</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Viral Sharing Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Love this demo? Share it with your colleagues and help advance precision medicine.
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={generateShareUrl}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Demo
            </Button>
            <Button variant="outline" onClick={() => copyToClipboard(window.location.href)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Link href="/">
              <Button variant="outline">
                <Globe className="h-4 w-4 mr-2" />
                Visit Main Site
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Share AGILE Agent Demo</CardTitle>
              <p className="text-sm text-gray-600">Share this interactive demo with colleagues</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button size="sm" onClick={() => copyToClipboard(shareUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowShareModal(false)}>
                  Close
                </Button>
                <Button onClick={() => copyToClipboard(shareUrl)}>
                  Copy Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}