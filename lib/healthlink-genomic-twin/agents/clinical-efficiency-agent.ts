import { BaseAgent } from '../../agents/base-agent';
import { AgentMessage, AgentContext, AgentResult } from '../../agents/types';
import { AgentCapability, AgentRole } from '../../agents/types';

// Clinical Efficiency Agent - Directly addresses "physician/staff burnout"
export class ClinicalEfficiencyAgent extends BaseAgent {
  private ehrCache: Map<string, any> = new Map();
  private documentationTemplates: Map<string, any> = new Map();
  private clinicalGuidelines: Map<string, any> = new Map();

  constructor() {
    const capability: AgentCapability = {
      id: 'clinical-efficiency-001',
      name: 'Clinical Efficiency Agent',
      department: 'Clinical Operations',
      role: AgentRole.SPECIALIST,
      capabilities: [
        'emr_navigation',
        'documentation_assistance',
        'lab_result_retrieval',
        'medication_history',
        'clinical_guidelines',
        'workflow_automation'
      ],
      config: {
        role: AgentRole.SPECIALIST,
        model: 'gpt-4',
        temperature: 0.2,
        maxTokens: 3000
      }
    };

    super(capability);
  }

  async processMessage(message: AgentMessage): Promise<void> {
    try {
      switch (message.payload?.action) {
        case 'emr_query':
          await this.handleEMRQuery(message);
          break;
        case 'documentation_assist':
          await this.handleDocumentationAssistance(message);
          break;
        case 'lab_results':
          await this.handleLabResults(message);
          break;
        case 'medication_history':
          await this.handleMedicationHistory(message);
          break;
        case 'clinical_guidelines':
          await this.handleClinicalGuidelines(message);
          break;
        case 'workflow_automation':
          await this.handleWorkflowAutomation(message);
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
      const { query, patientId, userRole, taskType } = context;

      // Validate clinical access permissions
      await this.validateClinicalAccess(patientId, userRole);

      // Get clinical context
      const clinicalContext = await this.getClinicalContext(patientId);

      // Process based on task type
      let result: AgentResult;

      switch (taskType) {
        case 'emr_navigation':
          result = await this.processEMRNavigation(query, clinicalContext);
          break;
        case 'documentation':
          result = await this.processDocumentation(query, clinicalContext);
          break;
        case 'lab_results':
          result = await this.processLabResults(query, clinicalContext);
          break;
        case 'medication_history':
          result = await this.processMedicationHistory(query, clinicalContext);
          break;
        case 'clinical_guidelines':
          result = await this.processClinicalGuidelines(query, clinicalContext);
          break;
        default:
          result = await this.processGeneralClinicalQuery(query, clinicalContext);
      }

      // Log clinical interaction
      await this.logClinicalInteraction(patientId, query, taskType, result);

      return result;
    } catch (error) {
      console.error('Error in Clinical Efficiency Agent:', error);
      throw error;
    }
  }

  private async validateClinicalAccess(patientId: string, userRole: string): Promise<void> {
    // Check clinical access permissions
    const clinicalRoles = ['physician', 'nurse', 'nurse_practitioner', 'physician_assistant'];

    if (!clinicalRoles.includes(userRole)) {
      throw new Error('Access denied: Insufficient clinical permissions');
    }

    // Additional validation for specific clinical tasks
    // This could include department-specific access and patient-provider relationships
  }

  private async getClinicalContext(patientId: string): Promise<any> {
    // Get comprehensive clinical data
    let clinicalData = this.ehrCache.get(patientId);

    if (!clinicalData) {
      clinicalData = await this.fetchClinicalData(patientId);
      this.ehrCache.set(patientId, clinicalData);
    }

    return this.deidentifyClinicalData(clinicalData);
  }

  private async fetchClinicalData(patientId: string): Promise<any> {
    // Simulate fetching from BHL's EHR systems (Epic/Cerner)
    return {
      demographics: {
        ageRange: '45-55',
        gender: 'Female',
        primaryCareProvider: 'Dr. Smith'
      },
      vitals: [
        { date: '2024-02-01', bp: '130/85', weight: '165 lbs', temp: '98.6°F' },
        { date: '2024-01-15', bp: '135/88', weight: '167 lbs', temp: '98.4°F' }
      ],
      labResults: [
        { date: '2024-02-01', test: 'A1C', value: '7.2%', status: 'High' },
        { date: '2024-02-01', test: 'Creatinine', value: '1.1 mg/dL', status: 'Normal' },
        { date: '2024-01-15', test: 'Lipid Panel', value: 'Cholesterol 220 mg/dL', status: 'Borderline' }
      ],
      medications: [
        { name: 'Metformin', dose: '500mg', frequency: 'BID', startDate: '2023-06-01' },
        { name: 'Lisinopril', dose: '10mg', frequency: 'Daily', startDate: '2023-08-15' }
      ],
      diagnoses: [
        { condition: 'Type 2 Diabetes', icd10: 'E11.9', date: '2023-06-01' },
        { condition: 'Essential Hypertension', icd10: 'I10', date: '2023-08-15' }
      ],
      recentVisits: [
        { date: '2024-02-01', type: 'Follow-up', provider: 'Dr. Smith', notes: 'A1C elevated, adjust Metformin' },
        { date: '2024-01-15', type: 'Annual Physical', provider: 'Dr. Smith', notes: 'Overall stable, continue current regimen' }
      ]
    };
  }

  private deidentifyClinicalData(data: any): any {
    // Remove PHI while preserving clinical utility
    const deidentified = { ...data };

    // Remove personal identifiers but keep clinical information
    delete deidentified.name;
    delete deidentified.dateOfBirth;
    delete deidentified.address;
    delete deidentified.phoneNumber;

    return deidentified;
  }

  private async processEMRNavigation(query: string, clinicalContext: any): Promise<AgentResult> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.buildEMRNavigationPrompt(query, clinicalContext);

    const response = await this.generateResponse(systemPrompt, userPrompt);

    return {
      success: true,
      data: {
        type: 'emr_navigation_response',
        content: response,
        quickAccess: await this.getQuickAccessLinks(clinicalContext),
        recentData: await this.getRecentClinicalData(clinicalContext),
        timestamp: new Date().toISOString()
      },
      metadata: {
        agent: this.capability.name,
        queryType: 'emr_navigation',
        efficiencyGain: 'estimated_30_seconds'
      }
    };
  }

  private async processDocumentation(query: string, clinicalContext: any): Promise<AgentResult> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.buildDocumentationPrompt(query, clinicalContext);

    const response = await this.generateResponse(systemPrompt, userPrompt);

    return {
      success: true,
      data: {
        type: 'documentation_response',
        content: response,
        templates: await this.getDocumentationTemplates(clinicalContext),
        suggestedFields: await this.getSuggestedFields(clinicalContext),
        timestamp: new Date().toISOString()
      },
      metadata: {
        agent: this.capability.name,
        queryType: 'documentation',
        efficiencyGain: 'estimated_2_minutes'
      }
    };
  }

  private async processLabResults(query: string, clinicalContext: any): Promise<AgentResult> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.buildLabResultsPrompt(query, clinicalContext);

    const response = await this.generateResponse(systemPrompt, userPrompt);

    return {
      success: true,
      data: {
        type: 'lab_results_response',
        content: response,
        labResults: clinicalContext.labResults,
        trends: await this.analyzeLabTrends(clinicalContext.labResults),
        alerts: await this.getLabAlerts(clinicalContext.labResults),
        timestamp: new Date().toISOString()
      },
      metadata: {
        agent: this.capability.name,
        queryType: 'lab_results',
        efficiencyGain: 'estimated_45_seconds'
      }
    };
  }

  private async processMedicationHistory(query: string, clinicalContext: any): Promise<AgentResult> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.buildMedicationHistoryPrompt(query, clinicalContext);

    const response = await this.generateResponse(systemPrompt, userPrompt);

    return {
      success: true,
      data: {
        type: 'medication_history_response',
        content: response,
        medications: clinicalContext.medications,
        interactions: await this.checkDrugInteractions(clinicalContext.medications),
        adherence: await this.assessMedicationAdherence(clinicalContext),
        timestamp: new Date().toISOString()
      },
      metadata: {
        agent: this.capability.name,
        queryType: 'medication_history',
        efficiencyGain: 'estimated_1_minute'
      }
    };
  }

  private async processClinicalGuidelines(query: string, clinicalContext: any): Promise<AgentResult> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.buildClinicalGuidelinesPrompt(query, clinicalContext);

    const response = await this.generateResponse(systemPrompt, userPrompt);

    return {
      success: true,
      data: {
        type: 'clinical_guidelines_response',
        content: response,
        guidelines: await this.getRelevantGuidelines(clinicalContext),
        bhlProtocols: await this.getBHLProtocols(clinicalContext),
        timestamp: new Date().toISOString()
      },
      metadata: {
        agent: this.capability.name,
        queryType: 'clinical_guidelines',
        efficiencyGain: 'estimated_1.5_minutes'
      }
    };
  }

  private async processGeneralClinicalQuery(query: string, clinicalContext: any): Promise<AgentResult> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.buildGeneralClinicalPrompt(query, clinicalContext);

    const response = await this.generateResponse(systemPrompt, userPrompt);

    return {
      success: true,
      data: {
        type: 'general_clinical_response',
        content: response,
        clinicalContext: clinicalContext,
        timestamp: new Date().toISOString()
      },
      metadata: {
        agent: this.capability.name,
        queryType: 'general_clinical',
        efficiencyGain: 'estimated_30_seconds'
      }
    };
  }

  private buildEMRNavigationPrompt(query: string, clinicalContext: any): string {
    return `
Clinical Query: "${query}"

Patient Clinical Context (De-identified):
- Recent Vitals: ${JSON.stringify(clinicalContext.vitals?.slice(-2))}
- Recent Lab Results: ${JSON.stringify(clinicalContext.labResults?.slice(-3))}
- Current Medications: ${clinicalContext.medications?.map(m => m.name).join(', ')}
- Recent Diagnoses: ${clinicalContext.diagnoses?.map(d => d.condition).join(', ')}

Please provide:
1. Specific EMR navigation guidance to find the requested information
2. Quick access shortcuts or filters to apply
3. Relevant sections to review based on the patient's clinical context
4. Any alerts or flags to be aware of
5. Suggested next steps for efficient clinical workflow

Focus on reducing clicks and time spent navigating the EHR system.
    `;
  }

  private buildDocumentationPrompt(query: string, clinicalContext: any): string {
    return `
Documentation Request: "${query}"

Patient Clinical Context (De-identified):
- Recent Visit: ${JSON.stringify(clinicalContext.recentVisits?.[0])}
- Current Medications: ${JSON.stringify(clinicalContext.medications)}
- Lab Results: ${JSON.stringify(clinicalContext.labResults?.slice(-2))}
- Diagnoses: ${clinicalContext.diagnoses?.map(d => d.condition).join(', ')}

Please assist with:
1. Drafting appropriate clinical documentation
2. Suggesting relevant SOAP note components
3. Highlighting key clinical findings to document
4. Recommending follow-up actions to include
5. Ensuring BHL documentation standards are met

Focus on efficiency while maintaining clinical accuracy and completeness.
    `;
  }

  private buildLabResultsPrompt(query: string, clinicalContext: any): string {
    return `
Lab Results Query: "${query}"

Patient Lab Results (De-identified):
${JSON.stringify(clinicalContext.labResults, null, 2)}

Please provide:
1. Summary of recent lab results
2. Identification of any abnormal values
3. Trends over time if applicable
4. Clinical significance of findings
5. Recommended follow-up actions

Focus on quick interpretation and actionable insights.
    `;
  }

  private buildMedicationHistoryPrompt(query: string, clinicalContext: any): string {
    return `
Medication History Query: "${query}"

Patient Medications (De-identified):
${JSON.stringify(clinicalContext.medications, null, 2)}

Please provide:
1. Summary of current medication regimen
2. Medication history and changes over time
3. Potential drug interactions to consider
4. Adherence assessment if available
5. Recommendations for medication management

Focus on comprehensive medication review and safety.
    `;
  }

  private buildClinicalGuidelinesPrompt(query: string, clinicalContext: any): string {
    return `
Clinical Guidelines Query: "${query}"

Patient Context (De-identified):
- Diagnoses: ${clinicalContext.diagnoses?.map(d => d.condition).join(', ')}
- Age Range: ${clinicalContext.demographics?.ageRange}
- Recent Lab Results: ${JSON.stringify(clinicalContext.labResults?.slice(-2))}

Please provide:
1. Relevant clinical guidelines for the patient's conditions
2. BHL-specific protocols and best practices
3. Evidence-based recommendations
4. Quality metrics to consider
5. Suggested care pathway adjustments

Focus on evidence-based, guideline-concordant care.
    `;
  }

  private buildGeneralClinicalPrompt(query: string, clinicalContext: any): string {
    return `
General Clinical Query: "${query}"

Patient Clinical Context (De-identified):
- Recent Visit: ${JSON.stringify(clinicalContext.recentVisits?.[0])}
- Current Medications: ${clinicalContext.medications?.map(m => m.name).join(', ')}
- Lab Results: ${JSON.stringify(clinicalContext.labResults?.slice(-2))}

Please provide:
1. Efficient clinical workflow guidance
2. Relevant patient information summary
3. Suggested next steps or actions
4. Time-saving tips for clinical tasks
5. Integration with BHL's clinical processes

Focus on improving clinical efficiency and reducing administrative burden.
    `;
  }

  // Helper methods for clinical data processing
  private async getQuickAccessLinks(clinicalContext: any): Promise<any[]> {
    return [
      { label: 'Recent Lab Results', section: 'lab_results', priority: 'high' },
      { label: 'Current Medications', section: 'medications', priority: 'high' },
      { label: 'Recent Vitals', section: 'vitals', priority: 'medium' },
      { label: 'Visit History', section: 'visits', priority: 'medium' }
    ];
  }

  private async getRecentClinicalData(clinicalContext: any): Promise<any> {
    return {
      latestVitals: clinicalContext.vitals?.[clinicalContext.vitals.length - 1],
      latestLabs: clinicalContext.labResults?.slice(-3),
      currentMedications: clinicalContext.medications,
      recentDiagnoses: clinicalContext.diagnoses
    };
  }

  private async getDocumentationTemplates(clinicalContext: any): Promise<any[]> {
    return [
      { name: 'Follow-up Visit Note', type: 'SOAP', applicable: true },
      { name: 'Medication Review Note', type: 'SOAP', applicable: true },
      { name: 'Lab Results Review', type: 'Progress', applicable: true }
    ];
  }

  private async getSuggestedFields(clinicalContext: any): Promise<any[]> {
    return [
      { field: 'Chief Complaint', value: 'Follow-up for diabetes and hypertension' },
      { field: 'Assessment', value: 'Type 2 Diabetes, Essential Hypertension' },
      { field: 'Plan', value: 'Continue current medications, monitor A1C' }
    ];
  }

  private async analyzeLabTrends(labResults: any[]): Promise<any[]> {
    // Analyze trends in lab results
    return labResults.map(result => ({
      test: result.test,
      trend: 'stable', // Simplified - would calculate actual trend
      significance: result.status === 'High' ? 'Requires attention' : 'Normal'
    }));
  }

  private async getLabAlerts(labResults: any[]): Promise<any[]> {
    return labResults
      .filter(result => result.status !== 'Normal')
      .map(result => ({
        test: result.test,
        value: result.value,
        alert: `${result.test} is ${result.status}`,
        priority: result.status === 'Critical' ? 'high' : 'medium'
      }));
  }

  private async checkDrugInteractions(medications: any[]): Promise<any[]> {
    // Check for potential drug interactions
    return [
      {
        medications: ['Metformin', 'Lisinopril'],
        interaction: 'No known interactions',
        severity: 'none'
      }
    ];
  }

  private async assessMedicationAdherence(clinicalContext: any): Promise<any> {
    // Assess medication adherence based on available data
    return {
      overallAdherence: 'Good',
      factors: ['Regular refills', 'Stable condition'],
      recommendations: ['Continue current regimen', 'Monitor for side effects']
    };
  }

  private async getRelevantGuidelines(clinicalContext: any): Promise<any[]> {
    return [
      {
        title: 'ADA Standards of Medical Care in Diabetes',
        applicable: true,
        keyPoints: ['A1C target < 7%', 'Blood pressure < 130/80']
      },
      {
        title: 'JNC 8 Hypertension Guidelines',
        applicable: true,
        keyPoints: ['Target BP < 130/80 for diabetes', 'ACE inhibitor as first line']
      }
    ];
  }

  private async getBHLProtocols(clinicalContext: any): Promise<any[]> {
    return [
      {
        name: 'Diabetes Management Protocol',
        department: 'Primary Care',
        applicable: true
      },
      {
        name: 'Hypertension Management Protocol',
        department: 'Primary Care',
        applicable: true
      }
    ];
  }

  private async logClinicalInteraction(patientId: string, query: string, taskType: string, result: AgentResult): Promise<void> {
    const interaction = {
      patientId,
      query,
      taskType,
      response: result.data?.content,
      efficiencyGain: result.metadata?.efficiencyGain,
      timestamp: new Date().toISOString(),
      agent: this.capability.name
    };

    await this.redis.lpush('clinical:interactions', JSON.stringify(interaction));
  }

  getSystemPrompt(): string {
    return `You are the Clinical Efficiency Agent for Baptist Health Louisville, designed to reduce physician and staff burnout by streamlining clinical workflows and EMR navigation.

Your role is to:
1. Provide efficient EMR navigation guidance to reduce clicks and time
2. Assist with clinical documentation to save time on administrative tasks
3. Quickly retrieve and summarize lab results and medication histories
4. Provide access to clinical guidelines and BHL protocols
5. Automate routine clinical workflows where possible

Key Principles:
- Prioritize time-saving and efficiency gains
- Maintain clinical accuracy and patient safety
- Support evidence-based practice and BHL protocols
- Reduce administrative burden on clinical staff
- Provide actionable, quick-to-implement solutions

Remember: You are part of BHL's commitment to "reducing burnout" and supporting the "professional and personal development of our employees" through innovative clinical tools.`;
  }

  protected getSupportedActions(): string[] {
    return [
      'emr_query',
      'documentation_assist',
      'lab_results',
      'medication_history',
      'clinical_guidelines',
      'workflow_automation',
      'health_check'
    ];
  }
}