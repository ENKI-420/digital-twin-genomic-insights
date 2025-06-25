"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Rocket,
  CheckCircle,
  ArrowRight,
  Shield,
  Zap,
  Clock,
  Users,
  Settings,
  ExternalLink,
  Download,
  Copy,
  Mail,
  Building,
  Database,
  Cloud,
  Lock,
  Smartphone,
  Monitor,
  Activity,
  Star,
  Globe
} from 'lucide-react'

interface EpicDeploymentStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'active' | 'completed' | 'error'
  estimatedTime: string
  details?: string
}

interface OrganizationInfo {
  name: string
  epicVersion: string
  environment: 'sandbox' | 'production' | 'test'
  userCount: number
  specialties: string[]
}

interface DeployEpicButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showFeatures?: boolean
  onDeploymentStart?: () => void
  onDeploymentComplete?: (config: any) => void
  className?: string
}

export function DeployEpicButton({
  variant = 'primary',
  size = 'lg',
  showFeatures = true,
  onDeploymentStart,
  onDeploymentComplete,
  className
}: DeployEpicButtonProps) {
  const [deploymentStage, setDeploymentStage] = useState<'initial' | 'auth' | 'config' | 'deploying' | 'complete'>('initial')
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [orgInfo, setOrgInfo] = useState<OrganizationInfo | null>(null)
  const [showModal, setShowModal] = useState(false)

  const deploymentSteps: EpicDeploymentStep[] = [
    {
      id: 'auth',
      title: 'Epic Authentication',
      description: 'Authenticate with Epic MyChart credentials',
      icon: <Shield className="h-5 w-5" />,
      status: 'pending',
      estimatedTime: '30 seconds',
      details: 'Secure OAuth2 authentication with Epic\'s FHIR endpoints'
    },
    {
      id: 'config',
      title: 'Organization Setup',
      description: 'Configure AGILE Agent for your organization',
      icon: <Settings className="h-5 w-5" />,
      status: 'pending',
      estimatedTime: '2 minutes',
      details: 'Customize CDS hooks, user roles, and integration preferences'
    },
    {
      id: 'integration',
      title: 'FHIR Integration',
      description: 'Connect to Epic FHIR R4 endpoints',
      icon: <Database className="h-5 w-5" />,
      status: 'pending',
      estimatedTime: '1 minute',
      details: 'Establish secure SMART-on-FHIR connections and test data flow'
    },
    {
      id: 'cds_hooks',
      title: 'CDS Hooks Deployment',
      description: 'Deploy clinical decision support hooks',
      icon: <Zap className="h-5 w-5" />,
      status: 'pending',
      estimatedTime: '90 seconds',
      details: 'Install medication-prescribe, patient-view, and custom genomic hooks'
    },
    {
      id: 'testing',
      title: 'Integration Testing',
      description: 'Verify all systems are working correctly',
      icon: <CheckCircle className="h-5 w-5" />,
      status: 'pending',
      estimatedTime: '1 minute',
      details: 'Run automated tests for data flow, security, and performance'
    }
  ]

  const [steps, setSteps] = useState(deploymentSteps)

  const startDeployment = () => {
    setShowModal(true)
    setDeploymentStage('auth')
    if (onDeploymentStart) {
      onDeploymentStart()
    }
  }

  const simulateDeployment = async () => {
    setDeploymentStage('deploying')

    for (let i = 0; i < steps.length; i++) {
      // Update current step status
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index === i ? 'active' : index < i ? 'completed' : 'pending'
      })))

      setCurrentStep(i)
      setProgress(((i + 1) / steps.length) * 100)

      // Simulate step duration
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))

      // Mark step as completed
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index <= i ? 'completed' : 'pending'
      })))
    }

    // Simulate organization setup
    setOrgInfo({
      name: 'Demo Healthcare System',
      epicVersion: '2023.1',
      environment: 'sandbox',
      userCount: 45,
      specialties: ['Oncology', 'Cardiology', 'Primary Care']
    })

    setDeploymentStage('complete')
    setProgress(100)

    if (onDeploymentComplete) {
      onDeploymentComplete({
        organizationId: 'org_demo_123',
        epicEnvironment: 'sandbox',
        integrationId: 'agile_epic_integration_456'
      })
    }
  }

  const getButtonVariant = () => {
    switch (variant) {
      case 'primary': return 'default'
      case 'secondary': return 'secondary'
      case 'outline': return 'outline'
      default: return 'default'
    }
  }

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'sm'
      case 'md': return 'default'
      case 'lg': return 'lg'
      case 'xl': return 'lg'
      default: return 'lg'
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setDeploymentStage('initial')
    setCurrentStep(0)
    setProgress(0)
    setSteps(deploymentSteps)
  }

  if (showModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-6 w-6 text-iris-500" />
                Deploy AGILE Agent to Epic
              </CardTitle>
              <Button variant="ghost" onClick={closeModal} size="sm">
                ✕
              </Button>
            </div>
            <p className="text-gray-600">
              5-minute setup • Zero IT overhead • Enterprise ready
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {deploymentStage === 'auth' && (
              <div className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Secure Authentication:</strong> We use Epic's official OAuth2 flow. Your credentials are never stored by AGILE.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="epicUsername">Epic Username</Label>
                    <Input id="epicUsername" placeholder="your.username@health.org" />
                  </div>
                  <div>
                    <Label htmlFor="epicOrg">Organization Code</Label>
                    <Input id="epicOrg" placeholder="DEMO" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setDeploymentStage('config')} className="bg-iris-500 hover:bg-iris-700">
                    <Shield className="mr-2 h-4 w-4" />
                    Authenticate with Epic
                  </Button>
                  <Button variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {deploymentStage === 'config' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Organization Configuration</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input id="orgName" defaultValue="Demo Healthcare System" />
                  </div>
                  <div>
                    <Label htmlFor="epicEnv">Epic Environment</Label>
                    <select
                      id="epicEnv"
                      className="w-full px-3 py-2 border rounded-md"
                      title="Select Epic environment"
                    >
                      <option value="sandbox">Sandbox</option>
                      <option value="test">Test</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Clinical Specialties (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['Oncology', 'Cardiology', 'Primary Care', 'Neurology', 'Pulmonology', 'Endocrinology'].map(specialty => (
                      <label key={specialty} className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" defaultChecked={['Oncology', 'Cardiology', 'Primary Care'].includes(specialty)} />
                        <span>{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button onClick={simulateDeployment} className="w-full bg-iris-500 hover:bg-iris-700">
                  <Rocket className="mr-2 h-4 w-4" />
                  Start Deployment
                </Button>
              </div>
            )}

            {deploymentStage === 'deploying' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Deploying AGILE Agent</h3>
                  <Progress value={progress} className="w-full mb-2" />
                  <p className="text-sm text-gray-600">{Math.round(progress)}% Complete</p>
                </div>

                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div key={step.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                      step.status === 'completed' ? 'bg-green-50 border-green-200' :
                      step.status === 'active' ? 'bg-blue-50 border-blue-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className={`flex-shrink-0 ${
                        step.status === 'completed' ? 'text-green-600' :
                        step.status === 'active' ? 'text-blue-600' :
                        'text-gray-400'
                      }`}>
                        {step.status === 'completed' ? <CheckCircle className="h-5 w-5" /> :
                         step.status === 'active' ? <Activity className="h-5 w-5 animate-spin" /> :
                         step.icon}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{step.title}</h4>
                          <span className="text-xs text-gray-500">{step.estimatedTime}</span>
                        </div>
                        <p className="text-sm text-gray-600">{step.description}</p>
                        {step.status === 'active' && (
                          <p className="text-xs text-blue-600 mt-1">{step.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {deploymentStage === 'complete' && orgInfo && (
              <div className="space-y-6">
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Deployment Complete!</h3>
                  <p className="text-gray-600">AGILE Agent is now live in your Epic environment</p>
                </div>

                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Success!</strong> AGILE Agent is now integrated with {orgInfo.name} Epic {orgInfo.epicVersion} environment.
                    Your team of {orgInfo.userCount} users can now access AI-powered clinical decision support.
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Building className="h-4 w-4 text-iris-500" />
                        Organization Setup
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Name:</strong> {orgInfo.name}</p>
                        <p><strong>Epic Version:</strong> {orgInfo.epicVersion}</p>
                        <p><strong>Environment:</strong> {orgInfo.environment}</p>
                        <p><strong>Users:</strong> {orgInfo.userCount}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-green-500" />
                        Active Features
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>✅ CDS Hooks (5 active)</p>
                        <p>✅ SMART-on-FHIR Launch</p>
                        <p>✅ AI Clinical Assistant</p>
                        <p>✅ Trial Matching Widget</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Next Steps</h4>
                  <div className="grid gap-2">
                    <Button className="justify-start" variant="outline">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Launch AGILE Agent in Epic
                    </Button>
                    <Button className="justify-start" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Invite Team Members
                    </Button>
                    <Button className="justify-start" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download Integration Guide
                    </Button>
                    <Button className="justify-start" variant="outline">
                      <Mail className="mr-2 h-4 w-4" />
                      Schedule Training Session
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={closeModal} className="bg-iris-500 hover:bg-iris-700">
                    <Rocket className="mr-2 h-4 w-4" />
                    Start Using AGILE Agent
                  </Button>
                  <Button variant="outline" onClick={closeModal}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Button
        onClick={startDeployment}
        variant={getButtonVariant()}
        size={getButtonSize()}
        className={`${variant === 'primary' ? 'bg-iris-500 hover:bg-iris-700' : ''} ${
          size === 'xl' ? 'text-lg px-8 py-4 h-auto' : ''
        }`}
      >
        <Rocket className={`mr-2 ${size === 'xl' ? 'h-6 w-6' : 'h-4 w-4'}`} />
        Deploy to Epic
        {size === 'xl' && <span className="ml-2 text-sm opacity-80">- 5 min setup</span>}
      </Button>

      {showFeatures && (
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-sm">5-Minute Setup</h3>
            <p className="text-xs text-gray-600">Automated deployment with zero IT overhead</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-sm">Enterprise Security</h3>
            <p className="text-xs text-gray-600">SOC 2 Type II, HIPAA compliant</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-sm">Epic Certified</h3>
            <p className="text-xs text-gray-600">Official Epic App Orchard partner</p>
          </div>
        </div>
      )}
    </div>
  )
}