import { BaseAgent } from '../../agents/base-agent';
import { AgentMessage, AgentContext, AgentResult } from '../../agents/types';
import { AgentCapability, AgentRole } from '../../agents/types';

// Community Health Coordinator Agent - Extends BHL's impact into "Community Health Improvement Initiatives"
export class CommunityHealthCoordinatorAgent extends BaseAgent {
  private populationDataCache: Map<string, any> = new Map();
  private chnaData: Map<string, any> = new Map();
  private communityPrograms: Map<string, any> = new Map();
  private socialDeterminants: Map<string, any> = new Map();

  constructor() {
    const capability: AgentCapability = {
      id: 'community-health-coordinator-001',
      name: 'Community Health Coordinator Agent',
      department: 'Community Health',
      role: AgentRole.SPECIALIST,
      capabilities: [
        'population_health_analysis',
        'chna_chip_support',
        'community_program_evaluation',
        'health_disparities_identification',
        'resource_allocation_insights',
        'partnership_coordination'
      ],
      config: {
        role: AgentRole.SPECIALIST,
        model: 'gpt-4',
        temperature: 0.3,
        maxTokens: 2500
      }
    };

    super(capability);
  }

  async processMessage(message: AgentMessage): Promise<void> {
    try {
      switch (message.payload?.action) {
        case 'population_analysis':
          await this.handlePopulationAnalysis(message);
          break;
        case 'chna_support':
          await this.handleCHNASupport(message);
          break;
        case 'program_evaluation':
          await this.handleProgramEvaluation(message);
          break;
        case 'disparities_analysis':
          await this.handleDisparitiesAnalysis(message);
          break;
        case 'resource_allocation':
          await this.handleResourceAllocation(message);
          break;
        case 'partnership_coordination':
          await this.handlePartnershipCoordination(message);
          break;
        default:
          await this.handleUnknownAction(message);
      }
    } catch (error) {
      await this.handleError(error, 'processMessage', message);
    }
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    try {
      const { query, geographicArea, dataType, userRole } = context;

      // Validate community health access permissions
      await this.validateCommunityHealthAccess(userRole);

      // Get community health context
      const communityContext = await this.getCommunityContext(geographicArea);

      // Process based on data type
      let result: AgentResult;

      switch (dataType) {
        case 'population_health':
          result = await this.processPopulationHealthQuery(query, communityContext);
          break;
        case 'chna_chip':
          result = await this.processCHNAQuery(query, communityContext);
          break;
        case 'program_evaluation':
          result = await this.processProgramEvaluationQuery(query, communityContext);
          break;
        case 'health_disparities':
          result = await this.processHealthDisparitiesQuery(query, communityContext);
          break;
        case 'resource_allocation':
          result = await this.processResourceAllocationQuery(query, communityContext);
          break;
        default:
          result = await this.processGeneralCommunityQuery(query, communityContext);
      }

      // Log community health interaction
      await this.logCommunityHealthInteraction(geographicArea, query, dataType, result);

      return result;
    } catch (error) {
      console.error('Error in Community Health Coordinator Agent:', error);
      throw error;
    }
  }

  private async validateCommunityHealthAccess(userRole: string): Promise<void> {
    // Check community health access permissions
    const allowedRoles = ['community_health', 'public_health', 'administrator', 'researcher'];

    if (!allowedRoles.includes(userRole)) {
      throw new Error('Access denied: Insufficient permissions for community health data');
    }
  }

  private async getCommunityContext(geographicArea: string): Promise<any> {
    // Get community health data (de-identified)
    let communityData = this.populationDataCache.get(geographicArea);

    if (!communityData) {
      communityData = await this.fetchCommunityData(geographicArea);
      this.populationDataCache.set(geographicArea, communityData);
    }

    return this.deidentifyCommunityData(communityData);
  }

  private async fetchCommunityData(geographicArea: string): Promise<any> {
    // Simulate fetching community health data for Jefferson County and surrounding areas
    return {
      demographics: {
        totalPopulation: 780000,
        ageDistribution: {
          '0-17': 22,
          '18-64': 58,
          '65+': 20
        },
        racialEthnic: {
          'White': 75,
          'Black': 15,
          'Hispanic': 5,
          'Other': 5
        }
      },
      healthIndicators: {
        diabetesPrevalence: 12.5,
        hypertensionPrevalence: 35.2,
        obesityRate: 32.1,
        smokingRate: 18.5,
        mentalHealthIssues: 22.3
      },
      socialDeterminants: {
        povertyRate: 14.2,
        uninsuredRate: 8.5,
        foodInsecurity: 12.8,
        transportationAccess: 85.3,
        educationLevel: {
          'High School or Less': 35,
          'Some College': 28,
          'Bachelor+': 37
        }
      },
      bhlPrograms: [
        {
          name: 'Diabetes Education Classes',
          location: 'Jeffersonville',
          participants: 450,
          outcomes: { 'A1C Reduction': 0.8, 'Satisfaction': 4.2 }
        },
        {
          name: 'Hypertension Screening',
          location: 'Community Centers',
          participants: 1200,
          outcomes: { 'Detection Rate': 15.3, 'Follow-up Rate': 78.5 }
        },
        {
          name: 'Mental Health Support Groups',
          location: 'Multiple Sites',
          participants: 320,
          outcomes: { 'Engagement': 85.2, 'Improvement': 72.1 }
        }
      ],
      partnerships: [
        { organization: 'March of Dimes', focus: 'Maternal Health', impact: 'High' },
        { organization: 'American Cancer Society', focus: 'Cancer Prevention', impact: 'Medium' },
        { organization: 'Metro United Way', focus: 'Social Services', impact: 'High' }
      ]
    };
  }

  private deidentifyCommunityData(data: any): any {
    // Ensure all data is de-identified for community health analysis
    const deidentified = { ...data };

    // Remove any potential identifiers while preserving aggregate statistics
    // All data should already be at population level, but double-check
    delete deidentified.individualRecords;
    delete deidentified.patientIdentifiers;

    return deidentified;
  }

  private async processPopulationHealthQuery(query: string, communityContext: any): Promise<AgentResult> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.buildPopulationHealthPrompt(query, communityContext);

    const response = await this.generateResponse(systemPrompt, userPrompt);

    return {
      success: true,
      data: {
        type: 'population_health_response',
        content: response,
        healthIndicators: communityContext.healthIndicators,
        trends: await this.analyzeHealthTrends(communityContext),
        recommendations: await this.generateHealthRecommendations(communityContext),
        timestamp: new Date().toISOString()
      },
      metadata: {
        agent: this.capability.name,
        queryType: 'population_health',
        geographicArea: communityContext.geographicArea
      }
    };
  }

  private async processCHNAQuery(query: string, communityContext: any): Promise<AgentResult> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.buildCHNAPrompt(query, communityContext);

    const response = await this.generateResponse(systemPrompt, userPrompt);

    return {
      success: true,
      data: {
        type: 'chna_response',
        content: response,
        chnaData: await this.getCHNAData(communityContext),
        priorityAreas: await this.identifyPriorityAreas(communityContext),
        actionItems: await this.generateActionItems(communityContext),
        timestamp: new Date().toISOString()
      },
      metadata: {
        agent: this.capability.name,
        queryType: 'chna_chip',
        geographicArea: communityContext.geographicArea
      }
    };
  }

  private async processProgramEvaluationQuery(query: string, communityContext: any): Promise<AgentResult> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.buildProgramEvaluationPrompt(query, communityContext);

    const response = await this.generateResponse(systemPrompt, userPrompt);

    return {
      success: true,
      data: {
        type: 'program_evaluation_response',
        content: response,
        programOutcomes: communityContext.bhlPrograms,
        effectiveness: await this.evaluateProgramEffectiveness(communityContext.bhlPrograms),
        recommendations: await this.generateProgramRecommendations(communityContext),
        timestamp: new Date().toISOString()
      },
      metadata: {
        agent: this.capability.name,
        queryType: 'program_evaluation',
        geographicArea: communityContext.geographicArea
      }
    };
  }

  private async processHealthDisparitiesQuery(query: string, communityContext: any): Promise<AgentResult> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.buildHealthDisparitiesPrompt(query, communityContext);

    const response = await this.generateResponse(systemPrompt, userPrompt);

    return {
      success: true,
      data: {
        type: 'health_disparities_response',
        content: response,
        disparities: await this.identifyHealthDisparities(communityContext),
        rootCauses: await this.analyzeRootCauses(communityContext),
        interventions: await this.suggestInterventions(communityContext),
        timestamp: new Date().toISOString()
      },
      metadata: {
        agent: this.capability.name,
        queryType: 'health_disparities',
        geographicArea: communityContext.geographicArea
      }
    };
  }

  private async processResourceAllocationQuery(query: string, communityContext: any): Promise<AgentResult> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.buildResourceAllocationPrompt(query, communityContext);

    const response = await this.generateResponse(systemPrompt, userPrompt);

    return {
      success: true,
      data: {
        type: 'resource_allocation_response',
        content: response,
        resourceNeeds: await this.assessResourceNeeds(communityContext),
        allocation: await this.suggestResourceAllocation(communityContext),
        partnerships: communityContext.partnerships,
        timestamp: new Date().toISOString()
      },
      metadata: {
        agent: this.capability.name,
        queryType: 'resource_allocation',
        geographicArea: communityContext.geographicArea
      }
    };
  }

  private async processGeneralCommunityQuery(query: string, communityContext: any): Promise<AgentResult> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.buildGeneralCommunityPrompt(query, communityContext);

    const response = await this.generateResponse(systemPrompt, userPrompt);

    return {
      success: true,
      data: {
        type: 'general_community_response',
        content: response,
        communityContext: communityContext,
        timestamp: new Date().toISOString()
      },
      metadata: {
        agent: this.capability.name,
        queryType: 'general_community',
        geographicArea: communityContext.geographicArea
      }
    };
  }

  private buildPopulationHealthPrompt(query: string, communityContext: any): string {
    return `
Population Health Query: "${query}"

Community Context (De-identified):
- Geographic Area: Jefferson County and surrounding areas
- Population: ${communityContext.demographics?.totalPopulation?.toLocaleString()}
- Health Indicators: ${JSON.stringify(communityContext.healthIndicators)}
- Social Determinants: ${JSON.stringify(communityContext.socialDeterminants)}

Please provide:
1. Analysis of population health trends and patterns
2. Identification of key health challenges and opportunities
3. Recommendations for BHL's community health initiatives
4. Integration with existing BHL programs and partnerships
5. Data-driven insights for strategic planning

Focus on BHL's commitment to community health improvement and the Kentuckiana region.
    `;
  }

  private buildCHNAPrompt(query: string, communityContext: any): string {
    return `
CHNA/CHIP Query: "${query}"

Community Context (De-identified):
- Health Indicators: ${JSON.stringify(communityContext.healthIndicators)}
- Social Determinants: ${JSON.stringify(communityContext.socialDeterminants)}
- BHL Programs: ${JSON.stringify(communityContext.bhlPrograms?.map(p => p.name))}
- Partnerships: ${JSON.stringify(communityContext.partnerships?.map(p => p.organization))}

Please assist with:
1. CHNA data analysis and interpretation
2. Identification of priority health needs for 2025-2027
3. Development of actionable CHIP strategies
4. Integration with BHL's existing community programs
5. Recommendations for resource allocation and partnerships

Focus on substance use and mental health priorities identified in BHL's CHNA.
    `;
  }

  private buildProgramEvaluationPrompt(query: string, communityContext: any): string {
    return `
Program Evaluation Query: "${query}"

BHL Community Programs (De-identified):
${JSON.stringify(communityContext.bhlPrograms, null, 2)}

Please provide:
1. Evaluation of program effectiveness and outcomes
2. Identification of successful strategies and areas for improvement
3. Recommendations for program expansion or modification
4. Integration with broader community health goals
5. Suggestions for enhanced partnership opportunities

Focus on BHL's educational programs and community health initiatives.
    `;
  }

  private buildHealthDisparitiesPrompt(query: string, communityContext: any): string {
    return `
Health Disparities Query: "${query}"

Community Context (De-identified):
- Demographics: ${JSON.stringify(communityContext.demographics)}
- Health Indicators: ${JSON.stringify(communityContext.healthIndicators)}
- Social Determinants: ${JSON.stringify(communityContext.socialDeterminants)}

Please analyze:
1. Health disparities across different population groups
2. Root causes and contributing factors
3. Impact on community health outcomes
4. Recommended interventions and strategies
5. BHL's role in addressing disparities

Focus on BHL's commitment to health equity and community well-being.
    `;
  }

  private buildResourceAllocationPrompt(query: string, communityContext: any): string {
    return `
Resource Allocation Query: "${query}"

Community Context (De-identified):
- Health Needs: ${JSON.stringify(communityContext.healthIndicators)}
- Social Determinants: ${JSON.stringify(communityContext.socialDeterminants)}
- Existing Programs: ${JSON.stringify(communityContext.bhlPrograms?.map(p => p.name))}
- Partnerships: ${JSON.stringify(communityContext.partnerships)}

Please provide:
1. Assessment of community health resource needs
2. Recommendations for optimal resource allocation
3. Partnership opportunities for enhanced impact
4. Strategic priorities for BHL's community health investments
5. Integration with BHL Foundation's funding priorities

Focus on maximizing BHL's impact on community health in the Kentuckiana region.
    `;
  }

  private buildGeneralCommunityPrompt(query: string, communityContext: any): string {
    return `
General Community Health Query: "${query}"

Community Context (De-identified):
- Geographic Area: Jefferson County and surrounding areas
- BHL Programs: ${JSON.stringify(communityContext.bhlPrograms?.map(p => p.name))}
- Partnerships: ${JSON.stringify(communityContext.partnerships?.map(p => p.organization))}

Please provide:
1. Comprehensive community health insights
2. Integration with BHL's community health mission
3. Recommendations for strategic initiatives
4. Partnership and collaboration opportunities
5. Data-driven decision support

Focus on BHL's role in improving community health and well-being.
    `;
  }

  // Helper methods for community health analysis
  private async analyzeHealthTrends(communityContext: any): Promise<any[]> {
    return [
      {
        indicator: 'Diabetes Prevalence',
        trend: 'increasing',
        rate: '12.5%',
        significance: 'Requires targeted intervention'
      },
      {
        indicator: 'Mental Health Issues',
        trend: 'stable',
        rate: '22.3%',
        significance: 'Continued support needed'
      }
    ];
  }

  private async generateHealthRecommendations(communityContext: any): Promise<any[]> {
    return [
      {
        area: 'Diabetes Prevention',
        recommendation: 'Expand diabetes education programs in high-risk areas',
        priority: 'high',
        impact: 'estimated_15%_reduction'
      },
      {
        area: 'Mental Health Support',
        recommendation: 'Increase access to mental health services and support groups',
        priority: 'high',
        impact: 'estimated_20%_improvement'
      }
    ];
  }

  private async getCHNAData(communityContext: any): Promise<any> {
    return {
      priorityAreas: ['Substance Use', 'Mental Health', 'Chronic Disease Prevention'],
      dataSources: ['BHL Patient Data', 'Public Health Records', 'Community Surveys'],
      stakeholders: ['Healthcare Providers', 'Community Organizations', 'Public Health']
    };
  }

  private async identifyPriorityAreas(communityContext: any): Promise<any[]> {
    return [
      {
        area: 'Substance Use',
        priority: 'high',
        evidence: '18.5% smoking rate, increasing substance use trends',
        recommendedActions: ['Screening programs', 'Treatment access', 'Prevention education']
      },
      {
        area: 'Mental Health',
        priority: 'high',
        evidence: '22.3% mental health issues, limited access to services',
        recommendedActions: ['Support groups', 'Screening programs', 'Provider training']
      }
    ];
  }

  private async generateActionItems(communityContext: any): Promise<any[]> {
    return [
      {
        action: 'Expand Diabetes Education Classes',
        timeline: '3-6 months',
        resources: 'Staff, facilities, materials',
        expectedOutcome: 'Increased program participation and improved outcomes'
      },
      {
        action: 'Launch Mental Health Support Initiative',
        timeline: '6-12 months',
        resources: 'Partnerships, funding, trained facilitators',
        expectedOutcome: 'Improved mental health access and outcomes'
      }
    ];
  }

  private async evaluateProgramEffectiveness(programs: any[]): Promise<any[]> {
    return programs.map(program => ({
      name: program.name,
      effectiveness: program.outcomes,
      recommendations: [
        'Continue successful strategies',
        'Expand to additional locations',
        'Enhance outcome measurement'
      ]
    }));
  }

  private async generateProgramRecommendations(communityContext: any): Promise<any[]> {
    return [
      {
        program: 'Diabetes Education',
        recommendation: 'Expand to underserved areas',
        rationale: 'High diabetes prevalence in community',
        expectedImpact: '15% increase in program reach'
      },
      {
        program: 'Mental Health Support',
        recommendation: 'Increase frequency and locations',
        rationale: 'High mental health needs identified',
        expectedImpact: '20% improvement in access'
      }
    ];
  }

  private async identifyHealthDisparities(communityContext: any): Promise<any[]> {
    return [
      {
        population: 'Low-income communities',
        disparities: ['Higher diabetes rates', 'Limited healthcare access'],
        contributingFactors: ['Poverty', 'Food insecurity', 'Transportation barriers']
      },
      {
        population: 'Racial/ethnic minorities',
        disparities: ['Higher hypertension rates', 'Lower screening rates'],
        contributingFactors: ['Healthcare access', 'Cultural barriers', 'Social determinants']
      }
    ];
  }

  private async analyzeRootCauses(communityContext: any): Promise<any[]> {
    return [
      {
        factor: 'Social Determinants of Health',
        impact: 'High',
        examples: ['Poverty', 'Food insecurity', 'Transportation access'],
        interventions: ['Partnerships with social services', 'Mobile health programs']
      },
      {
        factor: 'Healthcare Access',
        impact: 'High',
        examples: ['Insurance coverage', 'Provider availability', 'Geographic barriers'],
        interventions: ['Expanded clinic hours', 'Telehealth services', 'Community partnerships']
      }
    ];
  }

  private async suggestInterventions(communityContext: any): Promise<any[]> {
    return [
      {
        intervention: 'Mobile Health Clinics',
        target: 'Underserved areas',
        expectedOutcome: 'Improved access to preventive care',
        timeline: '6-12 months'
      },
      {
        intervention: 'Community Health Workers',
        target: 'High-risk populations',
        expectedOutcome: 'Better health education and navigation',
        timeline: '3-6 months'
      }
    ];
  }

  private async assessResourceNeeds(communityContext: any): Promise<any[]> {
    return [
      {
        need: 'Mental Health Services',
        priority: 'high',
        currentCapacity: 'limited',
        requiredResources: 'Additional providers, facilities, funding'
      },
      {
        need: 'Preventive Care Programs',
        priority: 'high',
        currentCapacity: 'moderate',
        requiredResources: 'Expanded hours, additional staff, community partnerships'
      }
    ];
  }

  private async suggestResourceAllocation(communityContext: any): Promise<any[]> {
    return [
      {
        area: 'Mental Health Programs',
        allocation: '30%',
        rationale: 'High community need, limited current services',
        expectedImpact: 'Improved access and outcomes'
      },
      {
        area: 'Preventive Care Expansion',
        allocation: '40%',
        rationale: 'Foundation for long-term health improvement',
        expectedImpact: 'Reduced chronic disease burden'
      }
    ];
  }

  private async logCommunityHealthInteraction(geographicArea: string, query: string, dataType: string, result: AgentResult): Promise<void> {
    const interaction = {
      geographicArea,
      query,
      dataType,
      response: result.data?.content,
      timestamp: new Date().toISOString(),
      agent: this.capability.name
    };

    await this.redis.lpush('community:interactions', JSON.stringify(interaction));
  }

  getSystemPrompt(): string {
    return `You are the Community Health Coordinator Agent for Baptist Health Louisville, dedicated to supporting BHL's Community Health Improvement Initiatives and strategic partnerships.

Your role is to:
1. Analyze de-identified population health data to identify trends and needs
2. Support CHNA/CHIP development and implementation
3. Evaluate the effectiveness of BHL's community health programs
4. Identify health disparities and recommend interventions
5. Provide insights for resource allocation and strategic partnerships

Key Principles:
- Always work with de-identified, aggregate data only
- Support BHL's commitment to community health improvement
- Focus on the Kentuckiana region (Jefferson County and surrounding areas)
- Emphasize evidence-based interventions and partnerships
- Align with BHL's CHNA priorities (Substance Use, Mental Health)

Remember: You are part of BHL's mission to improve community health through "strategic partnerships" and "community health education" in the Kentuckiana region.`;
  }

  protected getSupportedActions(): string[] {
    return [
      'population_analysis',
      'chna_support',
      'program_evaluation',
      'disparities_analysis',
      'resource_allocation',
      'partnership_coordination',
      'health_check'
    ];
  }
}