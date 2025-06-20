"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Check, X, Zap, Star, Crown, Building } from "lucide-react"
import { getAllTiers, type SubscriptionTier } from "@/lib/billing/subscription-tiers"

interface PricingTiersProps {
  currentTier?: string
  onUpgrade?: (tierId: string) => void
  showUsage?: boolean
  userUsage?: {
    usage: Record<string, number>
    limits: Record<string, number>
    utilization: Record<string, number>
  }
}

export function PricingTiers({
  currentTier = 'free',
  onUpgrade,
  showUsage = false,
  userUsage
}: PricingTiersProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const tiers = getAllTiers()

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'free':
        return <Zap className="h-6 w-6" />
      case 'clinician_pro':
        return <Star className="h-6 w-6" />
      case 'research_institution':
        return <Crown className="h-6 w-6" />
      case 'enterprise':
        return <Building className="h-6 w-6" />
      default:
        return <Zap className="h-6 w-6" />
    }
  }

  const getFeatureIcon = (available: boolean) => {
    return available ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-gray-300" />
    )
  }

  const formatLimit = (limit: number) => {
    if (limit === -1) return 'Unlimited'
    if (limit >= 1000000) return `${(limit / 1000000).toFixed(1)}M`
    if (limit >= 1000) return `${(limit / 1000).toFixed(1)}K`
    return limit.toString()
  }

  const getYearlyDiscount = (monthlyPrice: number) => {
    const yearlyPrice = monthlyPrice * 12 * 0.8 // 20% discount
    return Math.round(yearlyPrice)
  }

  const renderUsageStats = (tier: SubscriptionTier) => {
    if (!showUsage || !userUsage || tier.id !== currentTier) return null

    return (
      <div className="mt-4 space-y-3">
        <h4 className="text-sm font-medium">Current Usage</h4>
        {Object.entries(tier.limits).map(([key, limit]) => {
          const current = userUsage.usage[key] || 0
          const utilization = userUsage.utilization[key] || 0

          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span>{current} / {formatLimit(limit)}</span>
              </div>
              <Progress
                value={utilization}
                className="h-2"
                max={100}
              />
            </div>
          )
        })}
      </div>
    )
  }

  const filteredTiers = tiers.filter(tier =>
    billingPeriod === 'monthly' ? tier.billingPeriod === 'monthly' : true
  )

  return (
    <div className="w-full space-y-8">
      {/* Billing Period Toggle */}
      <div className="flex justify-center">
        <Tabs value={billingPeriod} onValueChange={(value) => setBillingPeriod(value as 'monthly' | 'yearly')}>
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">
              Yearly
              <Badge variant="secondary" className="ml-2">20% Off</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredTiers.map((tier) => (
          <Card
            key={tier.id}
            className={`relative ${
              tier.popular ? 'border-blue-500 shadow-lg' : ''
            } ${
              tier.id === currentTier ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white">Most Popular</Badge>
              </div>
            )}

            {tier.id === currentTier && (
              <div className="absolute -top-3 right-4">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Current Plan
                </Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-50 rounded-full">
                  {getTierIcon(tier.id)}
                </div>
              </div>

              <CardTitle className="text-xl">{tier.name}</CardTitle>

              <div className="py-4">
                {tier.price === 0 ? (
                  <div className="text-3xl font-bold">Free</div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-3xl font-bold">
                      ${billingPeriod === 'yearly' ? getYearlyDiscount(tier.price) : tier.price}
                      {tier.price > 0 && (
                        <span className="text-sm font-normal text-gray-500">
                          /{billingPeriod === 'yearly' ? 'year' : 'month'}
                        </span>
                      )}
                    </div>
                    {billingPeriod === 'yearly' && tier.price > 0 && (
                      <div className="text-sm text-gray-500 line-through">
                        ${tier.price * 12}/year
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600">{tier.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Usage Limits */}
              <div>
                <h4 className="font-medium mb-2">Usage Limits</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Genomic Analyses</span>
                    <span className="font-medium">{formatLimit(tier.limits.genomicAnalyses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Patients/Month</span>
                    <span className="font-medium">{formatLimit(tier.limits.patientsPerMonth)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Calls</span>
                    <span className="font-medium">{formatLimit(tier.limits.apiCalls)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage</span>
                    <span className="font-medium">{formatLimit(tier.limits.storageGB)} GB</span>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div>
                <h4 className="font-medium mb-2">Features</h4>
                <div className="space-y-2">
                  {[
                    'basic_analysis',
                    'epic_integration',
                    '3d_visualization',
                    'ai_recommendations',
                    'multi_user_collaboration',
                    'priority_support'
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      {getFeatureIcon(tier.features.includes(feature))}
                      <span className="capitalize">
                        {feature.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Stats for Current Tier */}
              {renderUsageStats(tier)}

              {/* Action Button */}
              <div className="pt-4">
                {tier.id === currentTier ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : tier.id === 'enterprise' ? (
                  <Button variant="outline" className="w-full">
                    Contact Sales
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => onUpgrade?.(tier.id)}
                    variant={tier.popular ? "default" : "outline"}
                  >
                    {tier.price === 0 ? 'Get Started' : 'Upgrade'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-center mb-8">Feature Comparison</h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 p-4 text-left">Feature</th>
                {filteredTiers.map((tier) => (
                  <th key={tier.id} className="border border-gray-200 p-4 text-center">
                    {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Genomic Analysis', key: 'genomicAnalyses' },
                { feature: 'Epic Integration', key: 'epic_integration' },
                { feature: '3D Visualization', key: '3d_visualization' },
                { feature: 'AI Recommendations', key: 'ai_recommendations' },
                { feature: 'Trial Matching', key: 'trial_matching' },
                { feature: 'Multi-user Collaboration', key: 'multi_user_collaboration' },
                { feature: 'Priority Support', key: 'priority_support' },
                { feature: 'Custom Integrations', key: 'custom_integrations' }
              ].map((row) => (
                <tr key={row.feature} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-4 font-medium">
                    {row.feature}
                  </td>
                  {filteredTiers.map((tier) => (
                    <td key={tier.id} className="border border-gray-200 p-4 text-center">
                      {tier.features.includes(row.key) ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}